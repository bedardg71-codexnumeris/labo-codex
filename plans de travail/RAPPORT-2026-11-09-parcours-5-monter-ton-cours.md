# Rapport : le cinquième parcours, « Monter ton cours » (9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md` (présente sur la branche). Décisions
de Grégoire du 9 nov., 10 h 01 à 10 h 04, en Cowork (corrections des étapes 2, 3, 5 et 6 ; questions 10, 13 et 16),
relayées à une session dans le nuage : ni WebKit ni tes données ici. Branche `lot/parcours-5-monter-ton-cours`, partie
de `lot/parcours-4-recevoir-et-rendre` (qui porte les parcours 1 à 4) ; les retouches du troisième parcours décidées à
13 h 37 et 15 h 55 y sont fusionnées. Décisions du 9 nov., 16 h 03, en Cowork, sur les cinq questions de ce rapport
(captures approuvées par Grégoire) : section « Ce qui attend Grégoire ». Non fusionnée, non publiée, rien au changelog.

## En tête

### Ce qui est fait (en gestes d'utilisateur)

- Le panneau « Assistance » compte cinq parcours. « Monter ton cours » y est cinquième, après « Recevoir les
  productions, rendre tes rétroactions », avec sa ligne validée (« De la compétence à ta production : un outil
  facultatif qui garde pour toi les liens entre ce que tu enseignes et ce que tu évalues. »), son état et son bouton.
- **La condition d'entrée** : une production dans le cours actif. Sans elle, « Commencer » ne lance rien et le panneau
  dit la phrase validée (« Commence par « Évaluer une première production » : il te faut une production pour la placer
  dans ta carte. »). La démo ouverte se referme d'abord.
- **Les sept étapes sur la carte d'alignement**, chacune qui avance sur l'état de la carte, jamais au toucher d'un
  bouton, et jamais pendant que tu écris : l'étape avance quand tu quittes le champ (Entrée dans un titre, ou un
  toucher ailleurs). Les étapes : la compétence avec son énoncé ; une idée maîtresse reliée (« se décline en ») ; une leçon avec sa semaine,
  sa séance et son lien « se concrétise dans » ; un objectif écrit ; une activité glissée dans la leçon par sa poignée
  ⠿ et qui sert l'objectif ; une évaluation dans la leçon, sous l'activité, avec la production et sa pastille à ✓ ; la
  bulle finale, au centre, « Terminer ».
- **La variante ⚠ de l'étape 6** : l'évaluation posée au-dessus de l'activité a sa pastille à ⚠ ; la bulle le dit
  (« Ta pastille affiche « ⚠ » : dans ta leçon, l'évaluation vient avant l'activité qui enseigne son objectif. Glisse-la
  sous l'activité. »), et revient au texte de l'étape si l'état change encore.
- Tes corrections du 9 nov. sont posées mot pour mot (étapes 2 et 3 : « Le lien « se décline en » s'affiche. », « Le
  lien « se concrétise dans » apparaît » ; étapes 5 et 6 : la poignée ⠿, « Touche deux fois cette poignée »). Une
  sentinelle Vitest les exige, avec les deux phrases du guide passées à l'écriture inclusive (« l'étudiant·e »).
- **Ta question 10** : au doigt (`pointer: coarse`), chaque petit cercle d'attache a une zone sensible de 44 px tournée
  vers l'extérieur du bloc ; son dessin ne change pas ; à la souris, rien ne change. La poignée ⠿ avait déjà une zone
  de 44 px, tournée vers l'intérieur du bloc ; au doigt, elle gagne 12 px vers l'extérieur, au-dessus du bord.
- **Ta question 13** : la pastille « ! » paraît dès que tu quittes le champ de ton premier objectif, sans Entrée.
- « Plus tard » sur chaque bulle sauf la dernière ; « Reprendre » ramène la leçon de l'étape 3 au milieu du canevas,
  même après un rechargement.
- **Quatre choses corrigées en chemin, parce qu'elles cassaient le parcours** (section 4) : l'Inspecteur passait sous
  la palette « Planificateur » (les cases des étapes 5 et 6 étaient dessous) ; la bulle couvrait le bloc qu'on venait de
  créer, puis la leçon ; à la reprise, la leçon tombait au bas de l'écran, son 🎯 sous le « Planificateur » ; et
  l'étape avançait dès la première lettre tapée (trouvé par la relecture neuve).

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

**Les cinq sont tranchées** (9 nov., 16 h 03, en Cowork) ; chaque question garde son texte, suivi de la décision et de ce
qui en est fait.

1. **Les blocs neufs naissent l'un sur l'autre.** Un toucher sur la palette pose le bloc au centre du canevas, à ±50 px
   près, au hasard (`planification-carte.js:8917-8921`). La compétence, l'idée maîtresse et la leçon se recouvrent
   donc ; pour tirer un trait de l'une à l'autre, il faut d'abord les écarter, et aucune bulle ne le dit (le banc les
   écarte par leur poignée). *Recommandation :* que la carte pose un bloc neuf à côté du dernier, plutôt que sur lui (un
   lot de la carte, pas du parcours). *À défaut,* une phrase à l'étape 2, après « puis écris-la. » : « Écarte-la de ta
   compétence en la glissant par sa poignée ⠿. » → **Corrigé à la source** (décidé par Cowork : cela cassait le
   parcours livré ; aucune phrase ajoutée). Un bloc neuf posé d'un toucher sur la palette se place à côté du dernier
   bloc posé (à droite, sinon dessous, à gauche, au-dessus), sans recouvrir aucun bloc, dans la partie visible du
   canevas (entre les palettes « Nœuds » et « Planificateur ») ; sans place à côté, au plus près ; sans dernier bloc,
   au centre de cette partie (`placePourBlocNeuf`, `js/planification-carte.js`). Le glisser depuis la palette pose
   toujours le bloc où on le lâche. Essai : la compétence, l'idée maîtresse et la leçon posées à la suite ne se
   recouvrent pas, tiennent dans la partie visible, et les deux traits se tirent sans rien déplacer. Break-test : le
   placement d'avant remis → rouge. *À savoir :* à l'étape 3, tant que la leçon n'est pas datée, la bulle couvre la
   compétence et l'idée maîtresse posées au-dessus (capture `p5-3-entete`) ; datée, elle laisse libre le cercle de
   l'idée maîtresse pour le trait (essayé).
2. **Sans voile.** La consigne dit « la palette « Nœuds » éclairée » aux étapes 1 et 2. Le moteur se sert des mêmes
   zones pour percer le voile et pour placer la bulle : un voile percé sur la seule palette rendrait intouchable le
   canevas, là où le bloc naît et où l'on écrit. Toutes les étapes sont donc sans voile ; la palette est désignée par
   son contour. *Recommandation :* garder ainsi. → **Gardé.**
3. **L'Inspecteur sous le « Planificateur », hors du parcours.** Corrigé pour le parcours seulement (section 4) ;
   ailleurs, à 1180 px, la palette « Planificateur », ouverte par défaut, couvre toujours les cases de l'Inspecteur.
   *Recommandation :* inscrire (l'Inspecteur devant les palettes, toujours), constat de la session H. → **Dit ici,
   sans entrée au BACKLOG** (décision de 16 h 03).
4. **Les zones de 44 px suivent le zoom de la carte**, comme le dessin des cercles : à 50 %, la portée vers l'extérieur
   tombe de 39 à 19 px (mesuré par la relecture neuve). *Recommandation :* garder ainsi pour la cohorte (la carte
   s'ouvre à 100 %) ; une zone qui ne suivrait pas le zoom demande une variable de zoom que la carte n'expose pas (un
   lot de la carte). → **Gardé.**
5. **« Refaire » sur une carte déjà remplie** : les étapes 1 à 6, déjà atteintes, passent d'elles-mêmes en moins d'une
   seconde, jusqu'à la 7 (mesuré). C'est le principe (« l'étape avance quand l'état est atteint »), mais on ne peut pas
   rejouer le parcours sur la même carte. *Recommandation :* garder ainsi (le parcours montre ce qui manque à ta carte ;
   pour le rejouer, une carte neuve) ; *à défaut,* ne compter que ce qui naît après « Refaire », comme le troisième
   parcours. → **Tranché : comme le troisième parcours.** À « Commencer » et à « Refaire », le parcours retient les
   blocs déjà posés sur la carte active (lus dans le stockage : la carte n'a pas à être ouverte) ; seuls les blocs créés
   ensuite font avancer une étape (`neuf`, `js/parcours-cours.js` ; le repère `noeudsAvant`, préférence
   `parcoursMonter`). « Reprendre » garde le repère. Essais : en Vitest, une compétence, une idée maîtresse ou une
   évaluation déjà posées n'avancent pas leur étape, une neuve si ; dans le banc, « Refaire » sur la carte remplie
   reste à l'étape 1. Break-test : le filtre retiré → rouge (les deux).

### Ce que je n'ai pas pu vérifier

- **WebKit, l'iPad au doigt** : absents du nuage. Les essais et les captures sont sous **Chromium**, à la souris (la
  zone de 44 px est essayée en Chromium tactile). Sur le Mac : la zone de 44 px des cercles au vrai doigt (ta question
  10), le double toucher sur la poignée, le clavier de l'iPad au titre d'un bloc neuf (la session H soupçonne qu'il ne
  s'ouvre pas sur un `focus()` différé).
- **Les captures à 820 px** (étapes 2, 3 et 6) que demande la consigne : non faites ; le relais demandait 1180 px.
- **À 390 px** : seule la capture du panneau, avec ses cinq parcours ; la carte elle-même, la session H l'a décrite
  (barre qui se chevauche, frise rognée, palettes qui couvrent le canevas), et tu as décidé de ne pas offrir ce parcours
  au téléphone (section 7).

## 1. Le parcours (`js/parcours-cours.js`, neuf)

| Étape | Avance quand… | Contours |
|---|---|---|
| 1 Ta compétence | un bloc Compétence a un énoncé | « Compétence » dans la palette, puis le bloc |
| 2 Ton idée maîtresse | une idée maîtresse a un titre et un lien « se décline en » depuis la compétence | « Idée maîtresse », puis les quatre cercles de la compétence |
| 3 Ta leçon | la leçon a un titre, une semaine, une séance et un lien « se concrétise dans » depuis l'idée maîtresse | « Leçon », puis les deux sélecteurs de l'en-tête, puis les cercles de l'idée maîtresse |
| 4 Ton objectif | la leçon a un objectif écrit | le badge 🎯 |
| 5 Ton activité | un bloc de la leçon (activité, exposé…) sert l'objectif | « Activité », puis la zone de la leçon, puis la poignée, puis la case de l'objectif dans l'Inspecteur |
| 6 Ton évaluation | une évaluation a une production et sa pastille à ✓ | « Évaluation », puis la zone de la leçon, puis la poignée, puis les cases des objectifs vérifiés et « Production » |
| 7 Raffiner, si tu veux | « Terminer » | aucun (au centre) |

- Le parcours ne crée ni ne renomme aucune carte, et n'écrit rien dans la carte : tout se fait par tes gestes. Il ne
  retient que l'identifiant de la leçon née à l'étape 3 (préférence `parcoursMonter`), pour « Reprendre ».
- Les contours de plus (cercles, sélecteurs, cases de l'Inspecteur) sont dessinés comme ceux du moteur, posés et
  retirés par le parcours ; le moteur n'est pas modifié.
- La bulle laisse libres les parties à toucher : à l'étape 3, l'en-tête et le titre de la leçon, pas la leçon entière
  (trop grande pour que la bulle trouve sa place à côté) ; à l'étape 5, l'activité et la zone de la leçon ; l'Inspecteur
  ouvert sur le bloc visé, la bulle se range à sa gauche ; en variante ⚠, elle laisse libres l'évaluation et l'activité.
  L'Inspecteur ouvert, la bulle peut couvrir la leçon (capture `p5-6-inspecteur`) : le geste est alors dans
  l'Inspecteur, et dès la pastille à ✓, la bulle 7 paraît au centre.

## 2. Les vérifications de la consigne (« À vérifier avant de poser les textes »)

La session H les a mesurées sous Chromium (`RAPPORT-2026-11-09-verifications-parcours-3-a-5.md`, branche
`mesure/verifications-parcours-3-a-5`, section 3) ; tes décisions du 9 nov. y répondent. Ce que ce lot y ajoute, mesuré
par le banc :

- **Étape 1** (un toucher crée le bloc et ouvre son titre) : **tient**. Mais les blocs se posent l'un sur l'autre
  (question 1).
- **Étapes 2 et 3** (les cercles de 12 px) : **corrigé** comme tu l'as décidé (question 10) : une zone de 44 px au
  doigt, tournée vers l'extérieur, essayée en Chromium tactile (un toucher à 14 px hors du cercle le vise encore). Le
  vrai doigt sur l'iPad reste à juger au Mac.
- **Étapes 2 à 6** (la frise ouvre la page du guide) : **tient** ; le banc ouvre deux pages sur cinq par la frise
  (« Idées maîtresses » et « Objectifs », celles qui changent) et lit la phrase inclusive dans chacune ; les trois
  autres, la session H les a ouvertes.
- **Étape 3** (l'Inspecteur, la date) : **la date tient** ; « Mardi 1 septembre · séance A » paraît dans l'Inspecteur
  (capture `p5-6-inspecteur`, celui de l'évaluation, qui donne la date de sa leçon). Le double toucher sur la leçon
  elle-même n'est pas joué par le banc (la session H l'a mesuré en Chromium tactile). Le lien avec l'absence (#942) :
  mesuré par la session H, pas repris ici.
- **Étape 5** (glisser au doigt) : **tient par la poignée** (tes corrections le disent) ; le banc glisse à la souris.
- **Étape 6** (✓ sous l'activité, ⚠ au-dessus, le ⚠ de la compétence qui disparaît) : **tient**, les deux ordres
  essayés. « Le bloc affiche la pondération » : ne tient pas (session H), mais la bulle ne le dit pas ; seul le menu
  « Production » montre le poids, « Journal de lecture 1 (20 %) ».
- **Étape 7** (les libellés) : **tient** (session H) ; « Recentrer la carte » et « Tout voir » sont dans « Vue ▾ ».
- **Le lot « Deux liens vers la carte d'alignement »** : pas fait (sa branche ne porte que la mesure). Les phrases des
  étapes 1 et 4 tiennent aujourd'hui ; voir « À reporter ».

## 3. Tes décisions du 9 nov., et ce qui en est fait

- **Étapes 2, 3, 5 et 6** : posées mot pour mot ; la sentinelle confronte chaque bulle à la consigne avec ces
  corrections.
- **Question 10** : `styles.css`, sous `@media (pointer: coarse)`, un `::before` transparent de 44 × 44 px sur chaque
  `.planif-noeud-port`, décalé vers l'extérieur selon le côté du cercle. Essai Playwright (Chromium, `hasTouch`) :
  `pointer: coarse` vrai, chaque cercle dessiné à 12 px, sa zone à 44 × 44, un point à 14 px vers l'extérieur vise le
  cercle ; à la souris, aucun `::before` (essai du parcours). La poignée ⠿ : sa zone (`::after`, 16 août) mesure 44,5 ×
  45 px, tournée vers la droite, vers l'intérieur du bloc ; au doigt, elle gagne 12 px **au-dessus** du bord du bloc
  (un toucher à 4 px au-dessus du bord la vise, essai rouge sans la règle). Pas à gauche : à mi-hauteur d'un bloc
  compact, la zone du cercle « gauche » y est déjà et l'emporte (mesuré : à 14 px à gauche de la poignée, c'est le
  cercle qui répond).
- **Question 13** : la ligne du premier objectif porte `data-premiere` ; au départ du champ, si elle est devenue un
  objectif, la carte se reconstruit et pose la pastille. La phrase de l'étape 4 reste. Le banc lit la pastille
  **aussitôt** après le départ du champ (avant : aucune ; juste après : « ! »). Seulement pour le **premier** objectif,
  comme décidé : un objectif ajouté par Entrée ou « + », puis quitté sans Entrée, n'a toujours pas sa pastille (mesuré
  par la relecture neuve : trois objectifs, deux pastilles). Inscrit (section 8).
- **Question 16** (pas offert au téléphone) : à reporter à la fusion (section 7).

## 4. Corrigé en chemin (cela cassait le parcours), et ce qui reste

1. **L'Inspecteur sous la palette « Planificateur »** (constat de la session H, mesuré ici) : à 1180 px, la palette,
   ouverte par défaut (z-index 80), couvre l'Inspecteur (60) ; `elementFromPoint` sur la case de l'objectif rendait la
   palette. **Corrigé le temps du parcours** : la classe `parcours-inspecteur-devant` (`css/parcours.css`) fait passer
   l'Inspecteur devant, posée au lancement, retirée à « Plus tard » et à « Terminer » ; quand le moteur ferme le
   parcours sans le dire (un autre parcours lancé, la démo ouverte), une veille la retire (au titre de la bulle, que le
   moteur n'expose pas autrement), et la règle ne vaut que moteur actif. Hors parcours, rien ne change (question 3).
2. **La bulle couvrait le bloc neuf, puis la leçon** : un bloc neuf naît au centre, là où la bulle se mettait (mesuré :
   elle couvrait la poignée de l'idée maîtresse) ; et la leçon entière était trop grande pour que la bulle trouve sa
   place à côté (le moteur se rabattait sur un bord et la couvrait). Corrigé dans le parcours : la bulle laisse libres
   les parties à toucher (section 1).
3. **La reprise après un rechargement** : la carte se recentre sur la moyenne de ses blocs (comme « Recentrer la
   carte ») ; la leçon de l'étape 4 tombait au bas de l'écran, son 🎯 sous le « Planificateur ». Corrigé dans le
   parcours : chaque étape amène son bloc au milieu du canevas libre (entre les deux palettes), en déplaçant la vue
   comme au glisser du fond ; rien ne s'écrit dans la carte. Et elle attend que la carte soit chargée.
4. **Le « défilement parasite » de la session H** (sa trouvaille 4) : mesuré ici, c'est le `dblclick` de Playwright
   qui fait défiler le conteneur de la carte (`overflow: hidden`) de 4 886 × 3 000 px pour atteindre sa cible ; avec de
   vrais événements de souris, rien ne défile. *Inférence :* la trouvaille de la session H venait de ses gestes scriptés
   (elle ne l'avait pas reproduite en espace neuf). Le banc fait donc tous ses gestes sur la carte à la souris, aux
   coordonnées. À confirmer au doigt sur l'iPad.
5. **L'étape avançait à la première lettre** (relecture neuve, section 10) : la carte écrit le titre et l'objectif à
   chaque touche ; l'étape avançait, la bulle prenait le focus, et la suite de la frappe tombait sur les raccourcis de
   la carte (L, R ; un Retour arrière supprimait la leçon sélectionnée). **Corrigé** : aucune étape n'avance pendant une
   saisie dans la carte ; elle avance quand on quitte le champ. Rien ne change pour la carte elle-même.

## 5. Les essais

- **Vitest** : `tests/unit/sentinelle-parcours-cours-2026-11-09.test.js`, 22 essais (16, puis 5 après la relecture :
  ce qui fait avancer les étapes 2, 3 et 6 sur une carte simulée, la saisie qui retient toute étape, la production
  retirée de la bibliothèque ; puis 1 après 16 h 03 : seuls les blocs neufs comptent) : chaque bulle lue à l'exécution
  et comparée à la consigne avec tes corrections ; chaque correction trouve sa phrase dans la consigne ; la variante ⚠ ;
  « Plus tard », « Terminer », la bulle au centre ; le titre, la ligne, la phrase du refus, et une production qui la
  lève ; les deux phrases du guide, la nouvelle présente, l'ancienne absente, et les bulles 2 et 4 qui les reprennent.
  Break-tests : « par sa poignée ⠿ » retiré de l'étape 5 → rouge ; « l'étudiant·e saura faire » remis à « l'étudiant »
  dans le guide → rouge ; la date de la leçon, la production de l'évaluation et la garde de saisie, chacune retirée →
  rouge ; rétablis.
- **La sentinelle #966 du guide** (`sentinelle-guide-carte-966`) gardait les pages 3 et 5 par empreinte : elle remet
  maintenant les deux phrases inclusives à l'ancienne avant de calculer l'empreinte, comme elle le faisait déjà pour
  deux retouches de la page 5 : l'empreinte d'avant tient, rien d'autre n'a bougé.
- **Playwright, Chromium** : `tests/integration/parcours-5-monter-ton-cours-2026-11-09.spec.js`, trois essais.
  - Les sept étapes, depuis un espace où le troisième parcours est fait (le banc du troisième, rejoué) : le panneau
    (cinquième entrée, à faire, en cours, fait), chaque contour, la bulle qui laisse libres le bloc neuf, l'en-tête de
    la leçon, le cercle de l'idée maîtresse et la case de l'Inspecteur, l'étape qui n'avance pas avant la donnée (pas
    de lien, pas de date), « Plus tard », un rechargement et « Reprendre » à l'étape 4, la pastille « ! » au départ du
    champ, l'évaluation posée au-dessus (la variante ⚠) puis dessous (✓) : sans production, l'étape attend et la bulle
    revient à son texte ; la production choisie, elle avance. Après la relecture : la compétence et l'objectif tapés
    lentement (120 ms par lettre) sans que l'étape avance ni que le focus parte ; « Refaire » sur la carte remplie, puis
    un autre parcours lancé, et la classe de l'Inspecteur retirée. « L'étape n'avance pas » se lit après deux passages
    réels de la sonde (une marque sur le voile que chaque passage remplace), pas après un délai.
  - Sans production : le refus ; les deux pages du guide ouvertes par la frise ; le panneau à 390 px.
  - Au doigt : la zone de 44 px des quatre cercles, et le gain de la poignée vers l'extérieur (question 10).
  - **3 sur 3 verts**, et l'essai des sept étapes **5 fois de suite** sans raté (les blocs neufs naissaient au hasard),
    puis **3 fois de suite** après les correctifs de la relecture, et **3 fois de suite** après ceux de 16 h 03 (les
    blocs à côté du dernier, sans rien déplacer ; « Refaire » qui reste à l'étape 1).
  - Break-tests, chacun **rouge** puis rétabli : la question 13 (la reconstruction au départ du champ retirée) ; la
    variante (son passage retiré) ; le cadrage à la reprise ; l'Inspecteur devant ; la bulle sur la leçon entière ; la
    règle des 44 px ; après la relecture, la garde de saisie, la veille de la classe et le gain de la poignée.
- **Vitest entier** (depuis `tests/`) : 900 fichiers, **11 011 essais verts** ; le hook pré-push l'a relancé à chaque
  poussée. La sentinelle `phase-ee-et-prise` lit la première règle `.planif-noeud-prise::after` du fichier : la règle
  du doigt est posée après celle de base, pour ne pas la masquer.
- Les bancs voisins, rejoués sur cette branche après la fusion des retouches du troisième (`parcours-3-evaluer`,
  `parcours-4-recevoir-et-rendre`, `parcours-1-et-2`, `parcours-2-ma-classe`) : **13 sur 14**. Le rouge (« panneau :
  titre, phrase… », largeur 429,99994 px au lieu de 430) l'est aussi sans ces lots : l'arrondi de Chromium déjà dit au
  rapport du troisième parcours.
- **Les bancs de la carte** (`planif-*`, `chaine-carte-1172`, `bibliotheque-deux-colonnes-1157`), Chromium, après le
  correctif du placement : **93 sur 96**. Les trois rouges le sont aussi **sans** ce correctif (mesuré en le retirant) :
  deux attendent « ⌘ » comme sur un Mac (`planif-menu-vue`, « ⌘A », « Annuler (⌘Z) » ; ici « Ctrl ») et un, la
  corbeille qui rougit sous le bloc glissé (`planif-corbeille-fixe-1070`). Sans rapport avec ce lot ; à juger au Mac.

## 6. Hypothèses que j'ai prises seul (à corriger en dix secondes si elles sont fausses)

- « Une production dans le cours actif » : une production du cours actif (`obtenirDonneesSelonMode('productions')`)
  que le menu « Production » de l'Inspecteur propose (`dansBibliotheque !== false`), pas forcément celle du troisième
  parcours.
- L'étape 3 désigne la dernière leçon titrée de la carte, celle qu'on vient de créer.
- L'étape 2 compte une idée maîtresse reliée par « se décline en » **depuis** la compétence ; l'étape 3, une leçon reliée
  par « se concrétise dans » **depuis** l'idée maîtresse (le sens des verbes de la carte).
- L'étape 5 accepte tout bloc de la leçon qui peut servir un objectif (activité, exposé, ouverture…), comme le dit la
  consigne ; l'étape 6, une évaluation dont la pastille est à ✓ et qui nomme une production, dans n'importe quelle
  leçon.
- La variante se rend quand une évaluation vérifie l'objectif avec la pastille à ⚠ et qu'aucune n'est à ✓.
- Pas de voile (question 2) ; l'Inspecteur devant, le temps du parcours (question 3).

## 7. À reporter (relais du 9 nov.)

- **Question 16** : à la fusion avec le lot « La bulle sur téléphone », déclarer dans le registre de l'assistance que
  « Monter ton cours » n'est pas offert sur téléphone, avec la déclaration que ce lot-là définit. Rien n'est posé ici
  (la propriété n'existe pas encore sur cette branche).
- **La mesure « Deux liens vers la carte d'alignement »** touche l'étape 4 (« Reprendre l'objectif d'une production »)
  et l'étape 1 (la compétence reprise de la fiche du cours). S'il est fait avant la fusion, reprendre les deux phrases
  avec Grégoire ; ne pas les retoucher sans lui.

## 8. À inscrire au BACKLOG

Les deux que la consigne demande d'inscrire, sans les faire :
- Le sélecteur « Production » de l'Inspecteur d'une évaluation ne filtre pas par cours : qui donne deux cours voit les
  productions des deux (`chargerProductions`).
- Le guide, page « Commence par le pourquoi », dit « Glisse un élément Compétence » et « Double-clique dessus pour écrire
  l'énoncé », alors qu'un toucher sur la palette crée le bloc et ouvre son titre ; et « Chaque cours vise des
  compétences », alors qu'un cours en vise en général une seule. Texte à soumettre à Grégoire.

Vus en chemin (issue proposée : inscrire et continuer ; aucun n'a de symptôme que tu as vécu, à toi de juger) :
- La frise rogne son début : « Compétence » n'est pas entier à 1180 px (session H ; visible sur chaque capture).
- La garde du double toucher vise `.planif-port` et `.planif-poignee`, des classes qui n'existent pas (session H).
- La pastille « ! » ne paraît au départ du champ que pour le premier objectif d'une leçon (question 13, décision
  tenue) ; un objectif suivant, quitté sans Entrée, l'attend jusqu'à la reconstruction suivante.

## 9. Captures (Chromium, 1180 px, sombre)

`plans de travail/captures-2026-11-09-parcours-5-monter-ton-cours/`, prises par le banc (`CAPTURES_PARCOURS=<dossier>`) :
- le panneau : `panneau-1180-sombre-sans-production` (le refus), `-a-faire`, `-en-cours` (« Étape 4 sur 7 »), `-fait` ;
  `panneau-390-sombre` (les cinq parcours) ;
- chaque étape : `p5-1`, `p5-2` et `p5-2-cercles` (les quatre cercles de la compétence), `p5-3` et `p5-3-entete` (la
  semaine et la séance), `p5-4`, `p5-5` et `p5-5-inspecteur` (la case, l'Inspecteur devant le « Planificateur »),
  `p5-6`, `p5-6-inspecteur` (les cases et « Production ») et `p5-6-variante` (la pastille ⚠), `p5-7` (au centre) ;
- les deux pages du guide modifiées : `guide-idees-maitresses-1180-sombre`, `guide-objectifs-1180-sombre`.

## 10. Relecture par un agent neuf (9 nov.), et ce que j'en ai fait

Verdict de l'agent : **« À reprendre »**, pour un défaut qui casse le parcours tel qu'on le fait à la main. Il a rejoué
les sentinelles (28/28), le banc (3/3) et Vitest entier, puis fait ses break-tests : deux trous dans le banc (la date
de la leçon, la production de l'évaluation). Chaque réserve, et ce qu'elle est devenue :

1. **Haute : la bulle prenait le focus en pleine frappe** (étapes 1 et 4 ; mesuré à 150 ms par lettre : la compétence
   titrée « Aéraires », l'objectif réduit à « S » ; un Retour arrière supprimait la leçon). Le banc tapait tout en moins
   d'une sonde. → **Corrigé** (section 4, point 5) ; le banc tape maintenant lentement aux étapes 1 et 4. Break-test :
   la garde retirée → rouge.
2. **Moyenne : le rapport affirmait « pas de date » et la production, que le banc ne départageait pas.** → **Corrigé** :
   une carte simulée en Vitest départage la semaine, la séance, le lien et la production ; le banc glisse l'évaluation
   sous l'activité avant de choisir la production (l'étape attend), et lit « n'avance pas » après deux passages réels
   de la sonde.
3. **Basse : la classe de l'Inspecteur pouvait rester sur `body`** (un autre parcours lancé, la démo ouverte). →
   **Corrigé** : la veille, la règle liée au moteur actif ; essai : « Refaire », puis « Découvrir » lancé, la classe
   retirée.
4. **Basse : la question 13 ne couvre que le premier objectif.** → **Inscrit** (section 8) ; conforme à la décision,
   maintenant dit (section 3).
5. **Basse : la poignée ⠿ n'avait pas de zone tournée vers l'extérieur ; les zones suivent le zoom.** → La poignée :
   **corrigé** (12 px au-dessus du bord, au doigt ; pas à gauche, mesuré). Le zoom : **question 4** pour toi.
6. **Basse : la condition comptait une production retirée de la bibliothèque** (le menu de l'Inspecteur ne la propose
   pas : le parcours aurait bloqué à l'étape 6). → **Corrigé** : la condition lit le même filtre ; essai Vitest.
7. **Basse : l'étape 3 visait la première leçon titrée, pas la nouvelle.** → **Corrigé** : la dernière leçon titrée.
8. **Basse : deux « tient » plus larges que la preuve** (l'Inspecteur de la leçon, la frise). → **Réécrits** (section
   2).
9. **« Refaire » sur une carte remplie** : → **question 5** pour toi.
10. **Les deux items de la consigne seulement listés « À inscrire »** : → **refusé, motif** : la règle de la nuit dans
    le nuage interdit de toucher `BACKLOG.md` (fichiers de coordination intouchés) ; ils attendent dans la section 8.

Non retenu par l'agent lui-même : un toucher sur la palette juste après la bulle 1 qui n'aurait pas donné le focus au
titre (deux fois dans sa sonde, non reproduit avec une pause). Je ne l'ai pas reproduit non plus : le banc touche la
palette dès la bulle 1 et vérifie le focus au titre, cinq fois de suite.
