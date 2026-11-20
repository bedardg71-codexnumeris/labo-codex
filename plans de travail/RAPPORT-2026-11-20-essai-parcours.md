# RAPPORT — essai des parcours du 20 nov. 2026 : les corrections de Grégoire (session du cloud, 20 nov. 2026)

> **Dernier relais.** Branche `claude/essai-parcours-20-nov-k85n8g` (la consigne demandait `lot/essai-20-nov` : cette
> session du cloud ne peut pousser que sur sa propre branche ; même base, même contenu). Partie de
> `origin/apercu/essai-parcours` (`90cb3c2a`), puis `git merge --no-ff origin/main` (`e31a8556`, la 1.251.0).
> **LIVRÉ** : A1 à A6, D en entier (dix bulles neuves, l'ancienne Pratique guidée retirée), B, C, E, F, et de G : G2,
> G3, G4, G5. **NON FAIT, EXPRÈS : G1** (« 0 – Aucun ») : mesuré et rapporté, pas touché (§ G1 : deux calculs lisent le
> code « PS » ; ce que « 0 » doit y valoir est une décision de Grégoire). Vitest complet vert. Playwright Chromium :
> § H. Ni fusion, ni release, ni bump, ni changelog. **À annuler avant toute fusion** : les commits « BRANCHE
> SEULEMENT » hérités de l'aperçu (les parcours ouverts, `js/assistance.js`, `PARCOURS_OUVERTS`).
> Consigne : `plans de travail/CONSIGNE-2026-11-20-essai-parcours.md` (premier commit, `58ef5805`, mot pour mot).
> Porte terrain : `plans de travail/PORTES-TERRAIN-2026-11-20-essai-parcours.md` (une porte due, G5 ; huit décisions).
> Aperçu : § « L'aperçu ».

## 0. La base et la fusion

- `origin/apercu/essai-parcours` = `90cb3c2a` ; `origin/main` = `e31a8556`. Fusion `--no-ff` : `afbd28b6`.
- **Deux fichiers en conflit, tranchés en gardant les deux côtés** :
  - `index.html` : quatre blocs, tous des lignes de jetons `?v=` (`styles.css`, `js/materiel.js`, `js/export-pdf.js`,
    `js/travaux-ui.js`, et le bloc des parcours). Une ligne par fichier ne peut pas être doublée (le fichier serait
    chargé deux fois) : chaque ligne garde le commentaire de l'aperçu, précédé de la première note de `main`, et reçoit
    un jeton neuf du jour du build, d'une lettre jamais servie pour ce fichier (lue dans l'historique de git).
  - `BACKLOG.md` : l'en-tête « Dernier ID utilisé » (la ligne de `main`, #1301, puis celles de l'aperçu) et le bloc
    des fiches (#1298 et #1301 de `main`, puis #1300, #1299, #1297… de l'aperçu). Rien de retiré.

## A. Pour tous les parcours, dans les deux temps (moteur)

**Fait** (`js/parcours-moteur.js`, `js/assistance.js`, `js/parcours-classe.js`, `js/parcours-decouvrir.js`,
`css/parcours.css`, `js/cartouches.js`, `js/utils-notifications.js`).

- **A1.** La première bulle porte, en petit, au-dessus du titre : « Parcours N · Nom · Je regarde » (ou « Nous
  faisons »). N et le nom sont LUS dans le panneau (`Assistance.identiteDe`). **Supposé** : un parcours qui n'a qu'un
  temps (« Découvrir », « Mettre tes données à l'abri »…) n'écrit pas de troisième partie : « Parcours 1 · Découvrir
  l'application ».
- **A2.** La phrase de la poignée est sous cette ligne, au-dessus du titre, en petit, en gris. Pas sur téléphone
  (la bulle n'y a pas de poignée : inchangé).
  **Mesuré et corrigé en route** : dans une première bulle qui change de forme (le modèle d'« Évaluer », l'assistant
  ouvert), ces deux lignes restaient ; à 1180 × 820 la bulle grandissait et couvrait le choix « Partir d'un modèle »
  (la bulle de 276 à 771 px, le bouton à 278 px). Elles partent maintenant avec l'objectif : seulement dans la
  première forme. Le banc du modèle le juge.
- **A3.** « Parcours suivant » et « Voir le parcours suivant » n'existent plus. La dernière bulle dit, après « Chaque
  parcours a son objectif. C'est toi qui choisis la suite. » : « Suite suggérée : le parcours N, « Nom ». », puis
  offre « Voir le parcours N » et « Terminer » (et « Le refaire avec ma classe » d'abord, en « Je regarde »), de même
  poids. « Voir le parcours N » termine le parcours, ferme la bulle et ouvre le panneau devant ce parcours ; rien
  n'est lancé. La consigne suit : « Touche « Voir le parcours N », ou « Terminer » ». Dernier parcours : ni ligne ni
  bouton. Les mots sont écrits une seule fois (`Assistance.suiteDe`).
  - **MESURE DEMANDÉE : le panneau peut-il s'ouvrir positionné sur un parcours ? OUI.** Sa carte est amenée au
    milieu du panneau, marquée d'un filet à gauche, et son premier bouton (« Je regarde ») prend le focus. Mesuré au
    banc aux deux tailles : la carte est entière dans la vue du panneau.
  - **Supposé** : l'ordre de la fin reste celui du 16 nov. (« Pour revoir une étape… », l'objectif atteint, « Chaque
    parcours… », puis la suite suggérée, puis les boutons). La consigne, en D, les énumère dans un autre ordre
    (« Pour revoir… » en dernier) : si c'est un ordre voulu, c'est une ligne à déplacer.
  - **« Découvrir »** : son bouton du milieu devient « Voir le parcours 2 » (même règle). **Supposé** : « Commencer
    avec ma classe » reste et lance toujours le « Nous faisons » du parcours 2 : il nomme sa destination, comme « Le
    refaire avec ma classe ».
  - Avant, en « Je regarde », le bouton de suite ne paraissait que si le parcours suivant avait son modèle. Il
    paraît maintenant dès qu'un parcours suit dans le panneau : le panneau montre ce que ce parcours offre.
- **A4. « juger » devient « évaluer » : neuf occurrences changées.**
  1. « Évaluer », « Je regarde », bulle 5 : « Celle de l'exemple **s'évalue** par niveaux » (« se juge »).
  2. Même bulle : « un aspect de la production que tu regardes pour **l'évaluer** » (« pour la juger »), à « Structure ».
  3. Même bulle, la même phrase à « Rigueur ».
  4. Même bulle, la lecture : « chaque critère **s'évaluera** avec ceux de ton échelle » (« se jugera »).
  5. Bulle 6 : « elle t'aide à **évaluer** » (dans le texte de C2).
  6. Bulle 9 : « c'est la cartouche qui t'aide à **évaluer** ».
  7. Parcours 9 (« notation alternative », fermé) : « on **évalue** d'abord sa compétence » (« on juge »).
  8. Parcours 9 : « Tu **l'évalues** selon ce que tu exiges d'un travail réussi » (« Tu la juges »).
  9. Parcours 9 : « quand tu **évalues** si l'étudiant·e a atteint… » (« quand tu juges »).
  - **NON CHANGÉ, signalé** : « Découvrir », bulle 7 : « elle dit déjà ce que tu **juges** important ». Ici « juger »
    veut dire « tenir pour » : « ce que tu évalues important » ne tient pas en français. À toi de dire.
  - « ton jugement s'exerce » (parcours 9) est un nom, pas le verbe : laissé.
- **A5.** Ce que « Remplir » pose dans un champ est en bleu (`--accent-primaire`, la couleur des liens de
  l'application) jusqu'à l'étape suivante, c'est-à-dire jusqu'à la création. Jugé au banc du modèle d'« Évaluer »
  (le nom et les vingt cases de la cartouche en bleu ; plus rien de bleu une fois la cartouche créée).
- **A6.** L'avis jaune : **un seul message de ce genre existe**, celui de la cartouche (« Cette cartouche n'est pas
  encore créée ») ; je n'ai trouvé aucun « pareil » pour les autres fiches. Pendant un parcours, il ne paraît pas.
  Hors parcours, il part à la création de la cartouche et au changement de page. Il dit maintenant « Ce que tu
  **écris** n'est gardé qu'à l'écran. **Touche** « Créer la cartouche »… ». Trois essais Vitest neufs.

## D. Parcours 3, « Nous faisons » : dix bulles neuves

**Fait** (`js/parcours-evaluer.js`). Les dix bulles sont celles de la consigne, mot pour mot : la sentinelle
`tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js` relit la section D (chaque confirmation, phrase du lieu,
explication, geste et consigne, dans son genre, dans les deux sens) ; 87 essais. Le banc
`tests/integration/nous-faisons-evaluer-2026-11-20.spec.js` joue le parcours de bout en bout.

- **Ce qui fait avancer chaque bulle** : ce qui naît pendant le parcours. 1 : l'assistant quitte son premier écran ;
  2 : une pratique neuve ; 3 : cette pratique appliquée au cours actif ; 4 : « Je garde celle-ci », ou une échelle
  neuve ; 5 : une grille neuve ; 6 : une cartouche neuve ; 7 : une production neuve ; 8 : la date et la case
  « Consignes transmises » ; 9 : une évaluation verrouillée de cette production.
- **Bulle 2.** La voie est retenue quand l'assistant quitte son premier écran. Revenue à ce premier écran
  (« ← Précédent »), la bulle 1 revient. À la question de l'échelle, le halo va à l'« Échelle de départ (IDME) »,
  puis à « Adopter ».
- **Bulle 4.** « Je garde celle-ci » garde l'échelle ouverte, sinon l'échelle de départ. **Supposé** : le bouton est
  toujours actif ; il n'attend pas que l'échelle de départ soit ouverte (la bulle le demande par son premier geste).
- **Bulle 5, voie « Mon matériel ».** Devant la grille collée, la bulle a ses lignes à elle ; elle reprend de l'aide
  de la page le halo et les flèches du geste en cours. **Supposé** : « Pour chaque critère… » se grise quand les trois
  étiquettes « Critère », « Description » et « Pondération » sont posées au moins une fois (la page ne sait pas dire
  « tous les critères »). Une grille sans description ne grisera pas cette ligne ; la consigne reste.
- **Bulle 5, voie « Je la compose ici ».** Le bouton mène à l'onglet « Grilles ». **Supposé** : on revient à la voie
  « Mon matériel » en retournant soi-même à cet onglet (la bulle suit la page) ; la consigne ne dit pas de retour.
- **Bulle 6.** Elle avance sur une cartouche neuve **sous n'importe quelle grille** : la bulle dit « Choisis ta
  grille », elle ne retient pas la personne qui en choisit une autre. (L'ancienne version exigeait la grille du
  parcours et avait un avis pour l'autre cas : retiré.)
- **Bulle 7.** Les trois menus : le nom donné et le type choisi, leur rangée est amenée au milieu de l'écran, une
  fois ; la bulle les évite. Jugé au banc (les trois menus à l'écran, aucun sous la bulle).
- **Bulle 9. MESURE DEMANDÉE : la Liste affiche-t-elle d'elle-même la production qui vient d'être créée ? OUI.**
  Mesuré au banc, dans les deux voies et aux deux tailles : « Évaluation › Liste » porte une ligne par étudiant·e
  pour cette production, avec « Actions › Évaluer ». Aucun geste ajouté.
- **Bulle 10.** Le point de l'étudiant·e évalué·e est sur la bande « Performance (P) » (jugé au banc ; la bande se
  dessine un instant après l'arrivée).

**Ce qui part avec l'ancienne Pratique guidée** (neuf étapes, la grille d'abord) : les deux bulles d'ouverture
« Pourquoi étiqueter » et « Tu apprends aussi » ; les deux bulles devant l'exemple étiqueté ; la bulle du choix des
points ou des niveaux ; « Prendre cette grille » (une grille déjà là) ; le complément en pages de l'étiquetage ; la
règle des formulaires sur la fiche de la production ; « Continuer » au point qui s'allume ; l'avis de la cartouche
rangée sous une autre grille et son détour par la fiche de la production ; **la neuvième étape, « Ta rétroaction,
avec tes mots »** (rouvrir l'évaluation pour y choisir la cartouche) : la cartouche est préparée avant la production.
Avec elles : les onze lignes de geste proposées les 11 et 12 nov., `TEXTE_1`, `TEXTE_1_COMPOSER`, `TEXTE_1_CHOIX`,
`ParcoursEvaluer.texteDuChoix`, l'ancien harnais et les deux anciens bancs du parcours 3 (§ H).

**Un repère d'avant ce lot** (un « Nous faisons » d'« Évaluer » laissé en cours) est refait au prochain lancement : le
parcours repart de sa première bulle. Le parcours n'a jamais été ouvert hors des aperçus : personne n'a ce repère.

## B. Parcours 2, « Mettre ta classe en place »

**Fait** (`js/parcours-classe.js`).
- **B1.** Bulle 8, les deux temps : la phrase neuve. En « Je regarde », précédée de « Une seule séance et la classe
  se dessine déjà. »
- **B2.** « Je regarde », bulle 5 : les six lignes de la consigne. **Les flèches : j'en garde UNE**, de la première
  ligne vers le bloc des quatre menus. Les quatre menus sont en quinconce sur deux colonnes : quatre flèches se
  croisent quelle que soit la place de la bulle. **Non vu** : la capture 4 n'est pas dans le dépôt.
- **B3.** « Fais défiler l'aperçu pour voir la liste complète » : à la bulle 3 (« Le cours de la liste »), sous la
  ligne de l'aperçu, avant « Remplir ».

## C. Parcours 3, « Je regarde »

**Fait** (`js/parcours-evaluer.js`, `css/parcours.css`). Jugé par le banc du modèle (3 sur 3 sous Chromium).
- **C1.** Le mot changé. **Pendant l'étiquetage du modèle seulement**, les flèches que la page trace de la légende
  vers les parties étiquetées sont masquées ; il ne reste que la flèche du geste en cours. **J'ai gardé la légende
  elle-même** : c'est dans la légende qu'on prend « Titre », « Critère »… ; la masquer rendrait le geste impossible.
  **C'est ma lecture de la consigne, à confirmer** (porte terrain, 3.7). Avant « Créer ma grille » : une flèche vers
  la grille refaite, une vers son résumé, une vers ce que la page dit des niveaux (jugé au banc).
- **C2.** Les quatre explications. **C3.** La définition, la confirmation du menu « Type ». Pendant un parcours, la
  liste « À vérifier » de la page « Productions » ne montre que son titre.
- **C4.** La phrase du lieu. Le halo de « Consignes transmises » a la largeur de la case (la rangée de la case est
  maintenant à sa largeur ; voir G4). **Le bloc « Grille d'autoévaluation » : inférence vérifiée.** La zone naît à
  trois rangées et « Remplir » y posait le texte sans que rien la fasse grandir : le reste était sous le bord. Elle
  s'ouvre maintenant à la hauteur de son contenu (jugé au banc : rien sous le bord).
- **C5.** Une flèche vers le point de Yack Amical (jugé au banc).

## E. Parcours 4, « Je regarde »

**Fait** (`js/parcours-recevoir-modele.js`, `js/parcours-recevoir.js`).
- **E1.** La bulle 10 : une seule rétroaction part. Trois gestes (la production, « Loutre Enjouée », « Exporter pour
  Léa »), le halo passe de l'un à l'autre ; puis les trois lignes du PDF ouvert et la fin selon A3.
- **E2, E3, E4.** Les trois explications. E3 est dans les deux temps.

## F. Parcours 5, « Je regarde »

**Fait** (`js/parcours-cours.js`, `css/parcours.css`).
- **F1.** Le « Planificateur » est fermé des bulles 1 à 6 et s'ouvre à la septième, qui en parle. Par une marque sur
  la page pendant le modèle : la préférence de la personne n'est pas touchée (si elle a masqué la palette elle-même,
  elle le reste à la septième bulle).
- **F2.** La bulle 6 : une explication, quatre gestes, une explication. Les autres lignes sont parties.
  - **MESURE DEMANDÉE : dans quelle leçon le bloc se trouve-t-il au départ ? DANS AUCUNE.** Lu dans le code : un bloc
    touché dans la palette « Nœuds » naît libre sur la carte, à côté du dernier bloc posé (`placePourBlocNeuf`,
    `creerNoeud` sans parent) ; « Remplir » le pose ensuite juste au-dessus de la dernière leçon, toujours hors
    d'elle. **Mesuré au navigateur** (banc `je-regarde-cours`, aux deux tailles) : le nœud de l'évaluation a
    `parent: null` ; il est posé au-dessus de la troisième et dernière leçon, « Retour sur « Fendant Rioux » », au
    même `x`, 40 px au-dessus d'elle à l'écran.

## G. L'application, hors parcours

### G1. « 0 – Aucun » : MESURÉ, PAS TOUCHÉ

Ce qui dépend du code « PS » ou du nom « Préstructurel » de l'Échelle de départ (IDME) :

| Où | Ce qui en dépend | Conséquence d'un code « 0 » pour un trimestre NEUF |
|---|---|---|
| `js/echelles.js`, la constante des niveaux par défaut (l. 96) | le semis de l'échelle ; « une douzaine de lecteurs » lisent cette constante | c'est la source à changer |
| `js/echelles.js`, la description de l'échelle (l. 403) | « Cinq niveaux — Préstructurel, Incomplet, … » | des mots à toi |
| `js/cartouches.js`, la « Cartouche de départ » (l. 173 à 200) | sa colonne « PS » et ses quatre commentaires, rangés sous `CR_…_PS` | la colonne ne correspondrait plus au niveau : à renommer en `…_0` au même geste |
| **`js/tableau-bord-apercu.js` (l. 977)** | **le tableau de bord range « PS » avec « I »** (les étudiant·es en difficulté) | **un niveau « 0 » n'y serait plus compté** |
| **`js/trimestres.js` (l. 2622)** | **l'archive d'un trimestre compte les copies « PS » à part (`nb_PS`)**, pour ne pas les mettre au dénominateur | **une copie « 0 » compterait dans `nb_evaluations`** |
| `index.html`, la carte d'aide (l. 10516 à 10576) | « **PS** – Préstructurel » relié au palier SOLO « Préstructurel » | des mots à toi |
| `js/guides-pedagogiques.js` (l. 96) | « **PS** ↔ Préstructurel, I ↔ Unistructurel… » | des mots à toi |
| `js/accompagnement-contenu-terme.js` (l. 118) | la définition du terme : « « PS – Préstructurel » en tête » | des mots à toi |
| `js/graphiques-progression.js` (l. 290) | la couleur du niveau (un commentaire) | rien |
| les bancs | 25 fichiers de `tests/` citent « PS » ou « Préstructurel » | à faire suivre |

**Pourquoi je m'arrête là.** La consigne nommait la cartouche, la carte d'aide et les bancs. Les deux lignes en gras
sont des CALCULS : avec « 0 », un trimestre neuf compterait autrement les étudiant·es en difficulté et les copies au
dénominateur. Ce que « 0 – Aucun » doit y valoir (comme « PS », ou hors des comptes) tient à ce que le niveau veut
dire (« l'évaluation n'est pas possible ») : c'est ta décision (porte terrain, 3.1). Note : l'échelle « IDME et niv
0 » de la démo a déjà un niveau « 0 – Aucun », et ces deux calculs ne le comptent pas avec « I ».

**Tarir n'est pas réparer** : quand ce sera fait, ce sera à la SOURCE seulement. Les trimestres déjà installés gardent
« PS – Préstructurel ». Et **la bulle 4 du « Nous faisons » dit dès maintenant « à cinq niveaux : Aucun, Incomplet,
… »** : tant que G1 n'est pas fait, et ensuite dans tout trimestre installé avant, la page dira « Préstructurel » là
où la bulle dit « Aucun ».

**Les mots proposés** (rien d'écrit) :
- description de l'échelle : « Cinq niveaux — Aucun, Incomplet, Développement, Maîtrise, Étendu. » (le reste inchangé) ;
- carte d'aide, première rangée : « **0** – Aucun » et, en face, « L'évaluation n'est pas possible (aucune donnée,
  plagiat, usage interdit de l'IA). » à la place du palier SOLO ; les quatre autres rangées inchangées ;
- guide : « chaque code correspond à un niveau cognitif, de **I** ↔ Unistructurel à **E** ↔ Abstrait étendu ; le
  niveau **0**, « Aucun », sert quand l'évaluation n'est pas possible. » ;
- définition du terme : « …a cinq niveaux : « 0 – Aucun » en tête, puis Incomplet, Développement, Maîtrise, Étendu. » ;
- « Cartouche de départ », colonne « 0 » : « L'évaluation n'est pas possible. » aux quatre critères (comme ta
  cartouche du 18 nov.), ou tes mots.

### G2. « Télécharger le prompt » : FAIT

`#btnModeleCartouche` : « Télécharger le prompt ». `#planif-btn-modele-ia` : « Télécharger le prompt… » (**supposé** :
les points de suspension restent, le bouton ouvre une fenêtre). La bulle 7 du « Nous faisons » de « Monter ton
cours » cite le bouton : elle suit son nom (« Télécharger le prompt… »).

**Relevés, non changés ; mots proposés :**
- l'infobulle du bouton de la cartouche (`title`) : « Télécharger un modèle texte à faire remplir, puis à
  réimporter » → **« Télécharger un prompt à remettre à un assistant d'IA, puis réimporter ses réponses »** ;
- l'aide de la page « Cartouches » (`index.html`) : « « Exporter en PDF », « Exporter en texte », « Télécharger un
  modèle » et « Importer depuis un fichier texte (.txt / .md) » font circuler ses commentaires. » → **le seul nom du
  bouton à changer : « Télécharger le prompt »** ;
- deux commentaires du code (`index.html`, #531) et les titres de deux bancs disent encore « Télécharger un modèle » :
  sans effet à l'écran.

### G3. La fiche d'une production : FAIT

« Préparer le PDF » est au pied des consignes, après « + Nouveau champ », juste avant la date d'échéance. La case
« Travail diagnostique » reste en haut. **La ligne proposée, posée dans l'aperçu** : « Un travail de repérage : il
reste au dossier de l'étudiant·e, sans peser sur la note ni sur les indices. » **Le texte d'avant** (pour le
rétablir d'un geste si tu préfères) : « Un travail de repérage, en début de trimestre. Il reste entier dans le
dossier de l'étudiant·e — copie, annotation, rétroaction, résultat — mais il ne pèse ni sur la note, ni sur la
performance, ni sur la complétion, ni sur le palier RàI. Sa pondération est alors sans effet. »

### G4. La date d'échéance : FAIT

Le champ est à côté de son étiquette, plus étroit (11,5 rem), suivi de « à planifier » tant qu'il est vide (le mot de
la pastille « Échéance » de la fiche). La case « Consignes transmises » et sa note sont dessous. Mesuré sous Chromium
à 820 × 1180 : l'étiquette, le champ et « à planifier » sur une ligne ; la case 53 px plus bas.

### G5. Le PDF d'un·e étudiant·e dans un nouvel onglet : FAIT, sans demi-solution ; Safari non vérifié

L'onglet est ouvert **vide, dans le geste**, avant toute attente, puis il reçoit le PDF quand il est prêt : c'est la
façon propre de passer le blocage de WebKit. S'il n'y a finalement pas exactement un PDF (rien de verrouillé, un
échec), l'onglet se referme. Si le navigateur refuse l'onglet, le PDF est téléchargé comme avant. « — Tous — » donne
toujours un ZIP. **Ce que je ne sais pas** : Safari sur l'iPad (c'est la seule porte due) ; et le nom que Safari
donnera au PDF enregistré depuis l'onglet (le fichier porte son nom, mais c'est le navigateur qui décide).

## H. Tests

**Vitest complet : vert** (936 fichiers, 11 999 essais). Sentinelles réécrites ou étendues : celle d'« Évaluer »
(les deux temps contre la consigne du 20 nov.), celles des parcours 2, 4, 5, 6 et 9, des deux temps, de « Je
regarde », des notifications (A6), de la carte d'aide ; une aide commune pour la fin (`tests/unit/_helpers/
fin-des-parcours-2026-11-20.js`).

**Break-tests** (dans un arbre à part, le code remis ensuite) :
- banc du « Nous faisons » d'« Évaluer » : (1) « Voir le parcours 4 » relance un parcours → ROUGE (la bulle reste) ;
  (2) la bulle 3 avance au choix du menu, sans application → ROUGE (le halo n'atteint pas « Appliquer au cours actif »).
- banc de A3 : le moteur et les modèles relancent le parcours suivant → 3 ROUGES sur 4 (le quatrième juge le dernier
  parcours, que la mutation ne touche pas).
- sentinelle d'« Évaluer » : (1) un mot changé dans la bulle 4 (« te sert » en « te servira ») → ROUGE (« bulle 4 : les
  explications ») ; (2) le geste « Vérifie que ce sont les bonnes… » rendu grisable → ROUGE (« bulle 9 : les gestes ;
  ceux qui ne se grisent pas »).
- A1, A2 : l'état d'avant la correction (l'entrée restée dans la seconde forme) faisait rougir le banc du modèle
  d'« Évaluer » à 1180 × 820 ; corrigé → vert.

**Playwright Chromium, 1180 × 820 et 820 × 1180** : voir le relevé ci-dessous.

Lancés fichier par fichier, par famille (quatre passes en parallèle, d'où quelques expirations sous la charge). « (b) » :
rouge AVANT le lot, vérifié en lançant le même fichier sur l'arbre de la base (`afbd28b6`), mêmes messages.

| Banc | Chromium |
|---|---|
| `nous-faisons-evaluer-2026-11-20` (NEUF : deux voies × deux tailles, la fin, la reprise) | vert, 5 |
| `fin-des-parcours-2026-11-20` (NEUF : A3) | vert, 4 |
| `je-regarde-evaluer-2026-11-18` (A1, A2, A3, A5, C1, C3, C4, C5) | vert, 3 |
| `bulle-largeur-ipad`, `carte-aide-materiel`, `dissection-ipad`, `dissection-legende`, `dissection-defilement-aide`, `essai-novice-lot4-etiquetage` | verts (5, 9, 7, 7, 3, 2) |
| `lot-e1-conception-creer-ou-modifier`, `lot-e3-creer-ou-modifier`, `type-grille-lot1`, `bareme-grille-neuve-1120`, `tableau-de-notation-1`, `accueil-epure` | verts (11, 15, 1, 4, 22, 10), non modifiés |
| `en-tete-epure` | 5 verts ; 3 rouges **(b)** (`:31`, `:102`, `:128`) |
| `nous-faisons-recevoir`, `je-regarde-recevoir`, `nous-faisons-donnees` | verts (4, 4, 5) |
| `export-lea-verrouillees`, `emojis-et-syntheses-papier`, `un-mot-pour-ton-etudiant`, `perspective-coins`, `import-productions-d-un-tenant`, `etats-vides-preparer-copies` | verts (5, 3, 9, 2, 2, 1), non modifiés |
| `parcours-4-recevoir-et-rendre` | 2 verts ; 2 rouges **(b)** (la bulle 2 couvre « Importer » : la décision 3.0 du lot du 19 nov., encore ouverte) |
| `parcours-6-donnees-a-l-abri` | 9 verts ; 5 rouges **(b)** (`:343` sombre et clair, `:422`, `:510`, `:519`) |
| `parcours-5-monter-ton-cours`, `parcours-5-nous-faisons` | verts (4, 2) |
| `je-regarde-cours` | vert à 820 × 1180 ; à 1180 × 820, **une régression de F1 trouvée et corrigée** (ci-dessous), puis 5 passages verts sur 5 arrivés à la bulle 6 ; un sixième a rougi plus tôt, sur la cartouche non posée par « Remplir » (trouvaille, déjà là sur la base) |
| `planif-barre-lot3`, `planif-modele-ia-963` (G2) | verts (13, 3) |
| `parcours-7-lire-ta-classe`, `parcours-8-commentaires` | verts (7 ; 9 et 5 sautés d'avance), non modifiés |
| `codex-de-depart-2026-11-20` | 3 rouges **(b)** : le bandeau de mise à jour couvre le bouton du menu |
| `parcours-9-notation-alternative` | **non suivi** : parcours mis en pause par Grégoire en cours de session ; banc jamais modifié, pas de verdict |
| la famille « fin des parcours et moteur » (seize bancs : parcours 1 et 2, « Je regarde », deux temps, téléphone, flèches…) | **relevé à venir** (voir plus bas) |

**La régression de F1, corrigée.** Le « Planificateur » fermé, le canevas « libre » allait jusqu'au bord droit, sous
l'Inspecteur resté ouvert : à 1180 × 820, l'évaluation et sa leçon n'étaient plus amenées et restaient dessous (6
rouges sur 9 passages du banc ; la base passait). L'Inspecteur ouvert borne maintenant le canevas libre
(`js/parcours-cours.js`).

**Retirés avec l'ancienne Pratique guidée du parcours 3** : le harnais `parcours-3-de-banc.js`, les bancs
`parcours-3-evaluer-2026-11-09` et `parcours-3-quatrieme-essai-2026-11-11` ; dans `essai-novice-lot4`, l'essai des deux
bulles d'ouverture et les deux bulles devant l'exemple ; dans `dissection-ipad`, P7 (« Prendre cette grille »). Ce qui
jugeait la PAGE (la carte d'aide, la légende, l'étiquetage) est gardé : ces bancs entrent maintenant par la carte de la
page, ou par la bulle 5 du parcours neuf. « Un espace où le troisième parcours est fait » :
`leTroisiemeParcoursFait` (harnais `nous-faisons-evaluer-de-banc.js`).

**G5 au banc** (`je-regarde-recevoir`, Chromium, `file://`) : un onglet s'ouvre, il reçoit un seul PDF (1,4 Mo, son nom
porte le DA 9900002), rien n'est téléchargé, l'application reste dans son onglet et la bulle passe à sa seconde forme.

**Les codex de départ** (`departs/`) n'ont pas été refabriqués : la fabrique passe (lancée vers un dossier
temporaire), mais les trois fichiers versionnés portent encore un parcours 3 fait à l'ancienne. À décider.

**WebKit** : par GitHub, au push ; pas de verdict lu dans cette session.

## Les mots qui ne tiennent pas tout à fait à l'écran (signalés, non remplacés)

1. **F2**, « de la leçon où il se trouve » : le bloc de l'évaluation n'est dans aucune leçon au départ (§ F).
2. **E1**, « choisis « Loutre Enjouée » » : le menu « Étudiant·e » écrit « Enjouée, Loutre » (nom, prénom).
3. **D, bulle 4**, « à cinq niveaux : Aucun, … » : l'échelle dit « Préstructurel » tant que G1 n'est pas fait.
4. **D, bulle 10**, « Les autres apparaîtront à mesure que tu évalueras leur production » : mesuré au banc, la bande
   « Performance (P) » porte trois points (un par étudiant·e du groupe du banc) après une seule évaluation. Où sont
   les deux autres dans la bande, je ne l'ai pas mesuré. La phrase était déjà celle du modèle ; non changée.
5. **A4**, « ce que tu juges important » (« Découvrir ») : laissé (§ A4).
6. **Le panneau**, la ligne d'« Évaluer » : « De ta grille à ta première rétroaction, réécrite avec tes mots. » ; le
   parcours part maintenant de la pratique de notation, et la rétroaction n'est plus « réécrite ». Tes mots.

## Les trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| A1, A2 : l'entrée restait dans la seconde forme et la bulle couvrait un choix de l'assistant | **1, corrigé** (mon lot, pas du code étranger) |
| La bande « Performance (P) » montre trois points après une évaluation (mot n° 4) | **2, à inscrire si tu le confirmes** ; non inscrit : non vécu |
| « Remplir » de la production du modèle attend au plus 3 s que la cartouche soit offerte ; sous charge (mesuré trois fois dans cette session, et une fois sur trois sur la base par un agent), la cartouche n'est pas posée et la bulle redemande « Remplir » | **2, non inscrit** : non vécu, et un second « Remplir » le règle |
| Le banc retiré `parcours-3-evaluer-2026-11-09` était le seul bout en bout du commentaire d'un palier en points dans la rétroaction (cité par `sentinelle-cartouche-pose-son-echelle`) | **2, à inscrire** : une couverture perdue ; la sentinelle Vitest reste |
| Deux commentaires du code et deux titres de bancs disent encore « Télécharger un modèle » | **3**, sans effet |
| Les captures 4 et 15 de l'essai ne sont pas dans le dépôt | dit ; B2 et C4 sont faits d'après la consigne |
| F1 : le canevas libre passait sous l'Inspecteur (§ H) | **1, corrigé** (mon lot) |
| À 1180 × 820, à l'accueil de « Mon matériel », la carte d'aide de la page couvre l'entrée « Assistance » du menu (un clic y est intercepté) ; non comparé à la base | **2, non inscrit** : non vécu ; la carte se déplace |
| Dans `faireLaModelisation` (harnais), un point de la bande manque parfois à la lecture (`lireGeo`), sur la base aussi | **3**, un banc intermittent |
| `parcours-6` : cinq rouges sur la base (la bulle 3 hors de la fenêtre sur l'aperçu) qui n'étaient pas dans la liste connue | **2, à inscrire si tu le confirmes** ; pas de ce lot |
| Un fichier d'essai d'un agent (`zz-verif-g2-classe.spec.js`) est entré dans un commit intermédiaire, puis en est sorti | dit ; il n'est plus dans l'arbre |

## Ce qui n'est pas vérifié

Safari, WebKit, l'iPad, le doigt et le stylet : rien dans le conteneur. GitHub juge WebKit Linux au push, qui n'est
pas Safari sur l'iPad. G5 est la porte due. Le reste est listé dans la porte terrain, § 4.

## L'aperçu

PR n° 43, en brouillon, « APERÇU, ne pas fusionner » : https://github.com/bedardg71-codexnumeris/labo-codex/pull/43
L'adresse de l'aperçu est celle que Netlify pose dans cette PR (« Deploy Preview ») : je ne l'ai pas lue dans cette
session, je ne l'écris donc pas ici.
