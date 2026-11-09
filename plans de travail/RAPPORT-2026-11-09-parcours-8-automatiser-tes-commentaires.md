# Rapport : le huitième parcours, « Automatiser tes commentaires »

**Session G de la nuit du 8 au 9 nov. 2026**, dans le cloud. Branche `lot/parcours-8-automatiser-tes-commentaires`, partie de `origin/lot/parcours-1-et-2` (a328bb9). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md`, recopiée dans la branche avec le plan de la nuit. Rien sur `main`, pas de release, rien au changelog, aucun fichier de coordination touché (règle 3).

> **Mis à jour le 9 nov. 2026, après les décisions de 9 h 41 à 9 h 46 (Cowork)** : les phrases validées sont posées, les
> trois décisions techniques sont faites, `origin/main` (1.238.0) est fusionné dans la branche (section suivante). Reste
> au Mac : le verdict WebKit, la déclaration « pas sur téléphone » (lot « La bulle sur téléphone »), la fusion.

## Les corrections du 9 nov. (ce que tu verras)

- **Les phrases validées sont posées, mot pour mot** : l'étape 6 (le modèle « Français écrit » et « Générique »),
  l'étape 7 (une production pas encore évaluée), l'étape 8 (l'Inspecteur), l'étape 9 (« 0 pour le code 10 », et le
  geste « Annoter ▾ » puis « Évaluer »), l'étape 10 dans ses deux variantes (« sauf avec une pénalité fixe », le PDF
  et ses « Points récurrents », « Un mot pour ton étudiant·e », le panneau « Critères », « Regarde ensuite la
  rétroaction, à côté »), l'étape 11 (créer le critère dans Grilles avant de coller une liste). La sentinelle Vitest
  part de la consigne du 8, y applique ces corrections, et exige chaque nouvelle phrase dans le code.
- **`origin/main` fusionné** dans la branche, pour le champ « Un mot pour ton étudiant·e » (1.238.0). Un seul conflit,
  dans `index.html` (trois jetons anti-cache) ; les jetons des fichiers de la branche sont passés au jour du build de
  main (1109), comme l'exigent la sentinelle et le crochet anti-cache.
- **Le premier code d'un critère porte maintenant 1** (décision 1 de Cowork), comme la liste du français écrit. Le
  clavier le choisit avec la touche 1 ; la bulle 9 est donc vraie pour lui. **Les codes déjà créés ne sont pas
  renumérotés** : un critère qui porte un 0 le garde, et son code suivant prend 1 (`codeSousCritereNeuf`,
  `js/grilles.js`). Vaut pour tout sous-critère, puisque hors algorithmique le code est inerte. Le stock est donc
  intouché, et assumé : un 0 déjà posé reste sans touche.
- **Un avis ne couvre plus la bulle** (décision 2 de Cowork). **Ce que j'ai choisi** : ni fermer l'avis au changement
  de section (ce serait revenir sur #1224, où Grégoire a voulu que l'orange et le rouge restent jusqu'à « OK »), ni
  faire éviter l'avis par la bulle (il faudrait cette règle dans chaque parcours, le moteur ne l'ayant pas). C'est la
  **pile des avis** qui cède : tant qu'un parcours joue et qu'un avis est affiché, elle prend le premier des quatre
  coins qui ne couvre pas la bulle, et autant que possible ni le contour de ce qu'il faut toucher. **Si aucun coin ne
  laisse la bulle libre** (à 1180 × 820, une bulle centrée et une pile de 444 px ne tiennent pas côte à côte), elle
  garde le coin qui la couvre le moins et **passe sous la bulle** : la bulle se lit entière, l'avis reste visible
  autour. Un avis affiché avant le lancement cède aussi. Hors parcours, la pile reste en haut à droite, à sa hauteur.
  **Ce qui reste** : la pile ne connaît que la bulle et le contour. Déplacée, elle peut tomber sur une autre commande
  (à 820 px, étape 9, sur la palette « Tampons » ; à 1180 × 820, étape 10, sur « Un mot pour ton étudiant·e », mesuré
  par la relecture). Inscrit plus bas (n° 7). Le code est dans le module qui possède la pile (`js/utils-notifications.js`),
  donc valable pour tout parcours : le neuvième en aura besoin (mêmes avis verts), **à unifier à la fusion**. Capture
  `chromium-avec-fichier-820-sombre-09.png` : l'orange et le vert passent en bas à droite, sur la palette « Tampons ».
- **L'aide dans les pages se tait pendant tout parcours** (décision 3 de Cowork) : l'infobulle du survol, les flèches
  didactiques, les bulles de découverte (« Clique ici pour activer les outils d'annotation… »). Même lecture que le
  rappel du codex au sixième parcours (`ParcoursMoteur.actif()`), sans toucher au moteur (`js/accompagnement.js`) ;
  celles déjà affichées au lancement se cachent (`css/accompagnement.css`). Restent : le « i » et sa fenêtre, que la
  personne ouvre elle-même, et la bulle d'une description de critère touchée, qui n'est pas une aide.
- Captures Chromium remplacées : les étapes 6 à 11 à 1180 px en sombre, avec et sans fichier, et l'étape 9 à 820 px.
  Les autres (approuvées) n'ont pas bougé.

## En bref (premier dépôt, nuit du 8 au 9 nov.)

### Ce qui est fait

- Dans le panneau « Assistance », un parcours de plus : « Automatiser tes commentaires », avec sa ligne. Sur cette branche, il est le troisième de la liste (les parcours 3 à 7 ne sont pas là) ; son fichier se charge après « Mettre ta classe en place », à la place du huitième.
- Sans production avec sa grille dans le groupe-cours actif, « Commencer » ne lance rien : le panneau affiche, sous le bouton, la phrase validée (« Commence par « Évaluer une première production »… »). La démo et un service d'orthopédagogie ne comptent pas.
- « Commencer » ouvre Conception › Grilles. Tu choisis une grille ou tu en crées une, tu ajoutes un critère et tu lui donnes le type « Algorithmique » : le parcours passe dans l'atelier du critère et t'y accompagne étape par étape (les quatre noms, les codes, la note, les cas, les phrases). Il te mène ensuite à la production, à l'import, aux codes dans Annoter, à l'évaluation, jusqu'au verrou. « Terminer » le marque « Fait ».
- La bulle se place pour ne pas couvrir ce qu'il faut toucher : la chaîne des étapes, le champ à remplir, « Annoter ▾ », la palette « Codes », le verrou (jusqu'à 820 px ; voir la question 2 pour l'iPhone).
- Les « Continuer » des étapes 3 à 6 ne paraissent qu'une fois l'étape réglée (un code qui pèse, une pondération, les deux nombres d'une limite) ; à l'étape 6, une grille nouvelle avance quand tu la crées.
- Les étapes sautées ne comptent pas : sur une grille déjà associée à une production, la bulle dit « 2 sur 10 » ; après « Rien à importer », « 8 sur 9 ».
- « Plus tard » ferme la bulle ; le panneau dit « Étape 3 sur 10 » et « Reprendre » revient à la même étape, sur la même grille.
- Les douze bulles (onze étapes et la variante sans fichier de l'étape 10) sont posées mot pour mot ; une sentinelle les confronte à la consigne.

### Les sept questions, tranchées (9 nov. 2026, 9 h 41 à 9 h 46)

1. **Les phrases qui ne tenaient pas** : remplacées par celles que Grégoire a validées (section précédente). La phrase
   du clavier tient maintenant aussi parce que le premier code porte 1 (décision 1).
2. **L'iPhone** : traité par le lot « La bulle sur téléphone » (Mac), qui fait de « pas sur téléphone » une propriété
   du registre ; rien ici, la déclaration s'ajoutera à la fusion.
3. **La fiche d'une grille déjà ouverte, refermée à l'étape 1** : on garde (Cowork).
4. **Le titre de la variante sans fichier** : on garde (Cowork).
5. **Le compte qui change quand le chemin se décide** : on garde (Cowork).
6. **Une production déjà évaluée sur une autre grille** : la phrase de l'étape 7 le dit maintenant (validée par Grégoire).
7. **La place de la bulle aux étapes 9 et 10** : on garde (Grégoire a approuvé les captures des onze étapes).

### Ce qui attend encore Grégoire

Rien de nouveau. Aucun texte n'a été écrit en dehors des phrases validées.

### Ce que je n'ai pas pu vérifier

- **WebKit** : aucune spec ni capture sous WebKit, absent du conteneur. Tout ce qui suit est sous Chromium ; le verdict et les captures WebKit se prennent sur le Mac.
- L'iPad réel (Safari, toucher, clavier : la touche du numéro d'un code).
- Tes données réelles : la condition d'entrée et les sauts d'étapes sur ton groupe sont à mesurer sur le Mac.
- Le PDF de synthèse : une retouche faite dans la palette « Rétroaction » y arrive-t-elle ? Lu dans le code : non (voir le tableau, étape 10).
- L'import réel par la zone de dépôt : le banc inscrit la production importée directement (l'import est le geste du quatrième parcours).
- Le mode anonymisation à l'écran (lu dans le code : aucun texte d'étape n'y devient faux).

## Le détail

### Ce que pose le lot

- `js/parcours-commentaires.js` (nouveau) : les douze bulles mot pour mot, les onze étapes, la variante sans fichier, la condition d'entrée, l'état de reprise. Le parcours lit les données et la page ; il n'écrit que sa propre préférence.
- `js/assistance.js` : une définition de parcours peut porter `refus()`. S'il rend une phrase, « Commencer » ne lance rien et la phrase paraît sous le bouton (`role="status"`). Seize lignes ; le reste du panneau est intact.
- `js/preferences.js` : la préférence `parcoursCommentaires` (le chemin de la personne, la grille du parcours, la voie choisie), pour « Reprendre ».
- `css/parcours.css` : la bulle sans voile de l'étape 11 (`parcours-voile--aucun`) et le style du refus.
- `index.html` : le script, après `parcours-classe.js` ; jetons anti-cache du jour du build (`20261108b` à `d`), comme la partie 1.
- Bancs : `tests/unit/sentinelle-parcours-commentaires-2026-11-09.test.js` (les textes) et `tests/integration/parcours-8-commentaires-2026-11-09.spec.js` (le parcours). La spec de la partie 1 compte maintenant trois parcours.

### Ce que le moteur et le panneau n'avaient pas, et comment j'ai fait sans les refondre

| Besoin du parcours | Ce que j'ai fait | Ce qu'il faudrait au moteur |
|---|---|---|
| Des étapes sautées hors du compte « n sur … » | Le chemin se reconstruit à l'entrée de chaque étape (`surEtape`, que le moteur appelle avant de lire l'étape) ; les étapes passées gardent leur place ; un saut se fige à l'entrée de la place où il joue. Le `total` du panneau est un accesseur. | Un chemin déclaré par le parcours (`def.chemin()`), et un `total` qui le suit. |
| Une condition d'entrée | `refus()` dans `js/assistance.js` (seul ajout au panneau). | Les parcours 4, 6, 7 et 9 ont le même besoin : **à unifier à la fusion** (les sessions E, F et I en ont peut-être écrit un autre). |
| Un « Continuer » qui ne paraît qu'à une condition | La sonde de l'étape (`atteint`, appelée toutes les 120 ms) montre ou cache le bouton. | Un `visible()` par bouton, évalué par la sonde. |
| Une bulle qui ne couvre pas ce qu'il faut toucher quand la zone occupe l'écran (la production qu'on annote, les trois palettes d'Évaluer) | `bulleHors` : la sonde de l'étape essaie neuf places et garde celle qui couvre le moins ; le contour et le bouton du geste suivant sont presque interdits. La place du moteur reste si aucune ne couvre moins. | Séparer les trous du voile des zones que la bulle évite, ou cette règle dans `placerBulle`. |
| Une bulle sans voile | La classe `parcours-voile--aucun`. | Rien d'autre. |
| Le rang du parcours dans la liste | Rien : l'ordre est celui des `<script>`. Sur cette branche, la pastille dit 3 et le menu « n sur 3 ». | Un champ `rang` éviterait de dépendre de l'ordre des balises à la fusion. |

### Les vérifications « À VÉRIFIER »

Les « tient » et « ne tient pas » viennent de la lecture du code par un agent de vérification (rien exécuté), sauf ceux marqués « vu à l'écran » (Chromium, banc de cette nuit). Les phrases proposées sont à valider : aucune n'est posée.

**Ne tient pas**

| Étape | La phrase validée | Ce que fait l'application | Proposé |
|---|---|---|---|
| 9 | « Sur un clavier, la touche de son numéro le choisit aussi. » | Le premier sous-critère ajouté porte le numéro **0** (vu à l'écran : « Code 0 », « Code 1 ») ; les touches 1 à 9 servent les codes 1 à 9, et 0 le code 10 (`codes-annotation.js:303-307`) : aucune touche ne choisit le code 0. | « Sur un clavier, les touches 1 à 9 choisissent les codes de ces numéros, et 0 le code 10. » (et voir « À inscrire », 4) |
| 9 | « … touche « Actions › Évaluer », en haut de la production. » | En mode Annoter, le bouton dit « Annoter ▾ » (vu à l'écran). | « … touche « Annoter ▾ », en haut de la production, et choisis « Évaluer ». » |
| 10 | « … dans « Bilan », le code qui revient le plus. » | La vue « Bilan » de la palette ne le nomme pas (`evaluation-retroaction.js:1349-1470`) ; seul le PDF le dit, sous « Points récurrents » (`synthese-retroaction-data.js:1083-1097`). | « … ; et son PDF nommera, sous « Points récurrents », le code qui revient le plus. » |
| 10 | « … sans ce nombre, la note ne se calcule pas. » | Vrai pour les deux premiers calculs ; faux pour la pénalité fixe (`evaluation-formules.js:143-155`) et quand « Quand une donnée de la copie vaut 0 » est réglé (`evaluation-calcul.js:990-993`). | « … sans ce nombre, la note ne se calcule pas, sauf avec une pénalité fixe. » |
| 10 | « … retouche au besoin… » (la question de la consigne : la retouche arrive-t-elle au PDF ?) | Non (lu, non exécuté) : seule la « Générale » se modifie (`#retroactionFinale1`) et le PDF imprime la phrase calculée (`synthese-retroaction-data.js:535-545, 669-671`). | « Relis-la comme ton étudiant·e la lira. Une retouche se fait dans « Générale », le texte que tu copies ; son PDF garde les phrases de tes règles. » |
| 10 sans fichier | « Dans « Évaluation » … Ouvre ensuite la palette « Rétroaction » » | Sans fichier, pas de palettes : trois panneaux ; celui des critères s'intitule « Critères », et le titre « Rétroaction » est caché (`index.html:8341, 8391`). | « Dans le panneau « Critères », ton critère algorithmique attend deux nombres… Regarde ensuite la rétroaction, à côté : sous ton critère… » |
| 8 | « En haut, choisis bien la production… » | Le menu « Production » est dans l'Inspecteur et ne paraît qu'une fois des fichiers déposés (`travaux-ui.js:1015-1031, 2106-2113`). | « Une fois tes fichiers déposés, choisis bien, dans l'Inspecteur, la production à laquelle tu viens d'associer ta grille : elle s'applique à tout le lot. » |
| 2 et 6 | « l'étudiant·e les lira dans la phrase qui lui donne son compte » ; « Ta production contient… » | Si le nom du critère contient « français », les phrases partent du modèle « Français écrit » (« Ta rédaction contient N erreur(s) de français… »), sans les noms écrits (`evaluation-enonces.js:436, 545-554, 742`). | Ajouter à l'étape 6 : « Si le nom de ton critère dit « français », ces phrases partent du modèle « Français écrit » : choisis « Générique » au menu « Modèle des phrases » pour que tes noms y paraissent. » |
| 7 | « Avance quand la production enregistrée porte cette grille. » | Une production déjà évaluée garde, à l'évaluation et dans « Codes », la grille de ses évaluations (`evaluation-chargement.js:667-686` ; `codes-annotation.js:396-408`). | Voir la question 6. |
| 11 | « Pour un prochain critère, Conception › Mon matériel colle d'un coup une liste de codes tirée d'un tableur. » | Seulement dans un critère algorithmique qui existe déjà et n'a aucun code (`materiel-creation.js:17-21, 159-183`). | « Pour un prochain critère, crée-le dans Grilles : tant qu'il n'a aucun code, Conception › Mon matériel y colle d'un coup une liste tirée d'un tableur. » |
| 2 | (l'atelier « étape « Ce que tu relèves et comptes » ouverte ») | L'atelier s'ouvre sur « Ce que l'étudiant·e lit » (`atelier-algo.js:679`). Aucune phrase en cause : le parcours ouvre l'étape lui-même, sans rien écrire. | Rien. |

**Tient** (preuves dans le code ; « vu » quand le banc l'a montré)

- Étape 1 : une grille neuve s'ouvre avec un critère vide (`grilles.js:3497-3503`, vu) ; « Algorithmique » ouvre l'atelier (vu) ; si la grille porte déjà un critère algorithmique, le parcours travaille sur le premier (les codes ne vont qu'à lui, `atelier-algo.js:300-306`) ; les évaluations enregistrées gardent leur note (`evaluation-calcul.js:1210-1220`).
- Étape 2 : la chaîne d'un critère neuf montre « ✓ » sur « Cas d'interprétation » et « Ce que l'étudiant·e lit », « ! » sur les trois autres (vu) ; les quatre formes s'écrivent ensemble, au changement d'un champ (`grilles.js:4879-4901`, vu).
- Étape 3 : le pli « Observation » est fermé au départ (`grilles.js:5029`) ; 1 par défaut, 0,5 pour la moitié (`grilles.js:5010, 5972`) ; « Spécifique » reprend les trois codes les plus fréquents (`evaluation-retroaction.js:743-755`, vu avec deux) ; « Partir de la liste du français écrit » crée dix codes (`grilles.js:5906-5927`, seulement quand la liste est vide).
- Étape 4 : la pondération d'un critère neuf vaut 0 (vu) ; les trois calculs, le premier choisi au départ (vu) ; la carte dit « Sur la copie fictive : … » (`grilles.js:3736`).
- Étape 5 : « Fixer une limite » pose des champs vides et six paliers, de « Aucune occurrence » à « Au-delà » (`evaluation-projection.js:357-367, 873-875`) ; « Voir ce que l'étudiant·e lirait à ce palier » règle la production fictive ; sous 760 px, la simulation est un tiroir collé en bas, réduit au départ (vu à 390 px : le tiroir est éclairé, avec « Tout voir »).
- Étape 6 : « Créer la grille » refuse une grille sans nom (`grilles.js:651-653`) ; le nom de la grille s'imprime dans le PDF (`synthese-retroaction-rendu.js:165-171`) ; une grille existante s'enregistre d'elle-même (vu : « Continuer » suffit).
- Étape 7 : une production existante s'enregistre d'elle-même au changement de grille (vu) ; sans échelle, le critère a sa note mais aucun niveau (`evaluation-calcul.js:706-711`) ; la cartouche ne lui sert pas tant qu'un paragraphe calculé existe.
- Étape 9 : la palette « Codes » s'ouvre d'elle-même dans Annoter (vu) ; un code touché puis la production y pose son numéro dans sa couleur (vu) ; leur nombre paraît dans la palette (vu : « 2 ») ; le compte passe au champ du critère au passage en Évaluer (vu : « 2 »).
- Étape 10 : l'étendue ne se remplit nulle part (vu : champ vide) ; sous le critère, la phrase du compte (vu : « Ta production contient 2 unités manquantes pour 12 calculs. ») ; le verrou est le bouton « Verrouiller », en haut de « Paramètres » (vu).
- Étape 10 sans fichier : « Évaluer » ouvre le mode simple, deux nombres (vu ; leurs libellés aux noms du critère, lus dans le code) ; un compte tapé vaut tel quel (`evaluation-calcul.js:950-957`) ; le verrou est le même (vu).
- Étape 11 : « Montrer d'où vient chaque phrase », « Ce que l'application choisit sans toi », les tables de cas, « Composer ton propre calcul », le service d'aide et le signalement, « Enregistrer ces paliers sous un nom… » existent (`atelier-algo.js:113, 141-147, 203` ; `grilles.js:4189, 4616` ; `tables-cas-algo.js:57` ; `composeur-calcul.js:32`).
- Anonymisation : aucun texte d'étape n'y devient faux (lu ; seuls les noms affichés changent).

**Réserves sur des phrases qui tiennent** : la chaîne des étapes se masque si « afficherChainesEtapes » est décoché (« En haut, ses cinq étapes » devient invisible) ; un critère algorithmique ancien (« erreur / mot », palette générale) a son étape « Codes » réglée sans aucun code (le « Continuer » de l'étape 3 attend quand même un code qui pèse, comme le dit la consigne) ; « Verrouiller » peut refuser une évaluation incomplète (vu : il faut évaluer les autres critères) ; les phrases du bilan demandent au moins un code posé.

### Ce que j'ai trouvé en chemin

- **Corrigé dans le lot (c'est le mien)** : à l'entrée des étapes de l'atelier, le parcours rouvrait la fiche de la grille quand l'atelier manquait un instant (pendant un redessin). Cette réouverture tardive pouvait effacer ce qu'on venait d'écrire. Il attend maintenant l'atelier et ne rouvre qu'une fiche fermée.
- **Commenté, sans suite** (issue 3) : dans une grille enregistrée, les quatre noms tapés en quelques millisecondes se perdent parfois. Deux enregistrements se croisent, chacun redessinant la fiche (`grilles.js:4879-4900`) ; mesuré 1 passage sur 5 au banc. Une personne ne tape pas si vite.
- **Commenté, sans suite** (issue 3) : le réglage de départ de la pénalité proportionnelle (500) est pensé pour des mots ; avec « calculs » et une étendue de 12, deux unités manquantes donnent 0/20 (vu : « −63,33 ; la note ne descend pas sous 0 »). La bulle de l'étape 4 dit d'ajuster le réglage.
- ~~**Commenté, sans suite**~~ **Traité le 9 nov. (décision 2 de Cowork), pour la bulle** : l'avertissement « ses critères totalisent 20 %, pas 100 % » reste à l'écran jusqu'à « OK » et couvre le bouton du menu ; le témoin « Enregistré » passe un instant sur le lien « Plus tard » de la bulle, en bas à gauche.
- **Commenté, sans suite** (issue 3) : le rappel de sauvegarde (« Mets ton codex à jour ») peut paraître pendant le parcours, sur un espace qui a des données sans codex. Il couvre la bulle jusqu'à ce qu'on le ferme, et lui prend le focus sans le lui rendre. La consigne du quatrième parcours le traite ; celle-ci n'en dit rien. Le banc le repousse (« Plus tard ») dès le montage.
- **Déjà connu** : sous Chromium, un essai de la spec de la partie 1 mesure 430,00006 px au lieu de 430 (le panneau) ; l'audit de début de session l'avait relevé, avec trois écarts de géométrie dans `en-tete-epure` (barre de défilement de Linux). Sans lien avec ce lot.

### Tests

- **Vitest** : 10 903 essais sur 893 fichiers, tous verts (mesuré sur 41c600eb, depuis `tests/`), et vert au crochet de pré-envoi à chaque push. La sentinelle des textes : 32 essais. Elle vérifie aussi que chaque bulle a le texte et le geste de son étape.
- **Playwright, sous Chromium seulement** (`tests/playwright.chromium.config.js`) : le banc du parcours, 5 essais, verts deux fois de suite. Ils couvrent le refus du panneau (sans production avec grille, en démo, dans un service d'orthopédagogie), le chemin avec fichier de bout en bout et le chemin sans fichier. Ce dernier part d'une grille déjà employée, avec un verrou posé avant le parcours, « Plus tard », un rechargement et « Reprendre ». Un cinquième essai vérifie l'étape 8 sautée et une grille restée ouverte au lancement. Les 5 essais de captures ne tournent que sur demande (`CAPTURES_PARCOURS=<dossier>`).
- **Ce que le banc démontre, au sens de la consigne** : le bouton du panneau refuse sans production avec sa grille. D'une grille neuve à deux codes posés sur une production importée, la rétroaction contient le décompte sous le critère (« Ta production contient 2 unités manquantes pour 12 calculs. ») et les deux codes dans « Spécifique ». Les gestes sont faits à la souris : « + Nouvelle grille », le « Type », « + Ajouter un sous-critère », « Créer la grille », les codes posés sur la production, « Annoter ▾ » puis « Évaluer », « Verrouiller ».
- **Break-tests**, chacun rouge pour la bonne raison, puis rétabli :
  - un mot changé dans une bulle ;
  - deux gestes intervertis (étapes 3 et 4) ;
  - le refus du panneau retiré ;
  - la démo laissée passer ;
  - la production retirée des zones éclairées de l'étape 9 (aucun point pour poser un code) ;
  - l'étape 7 jamais sautée (« 2 sur 11 » au lieu de « 2 sur 10 ») ;
  - l'ancienne règle de l'étape 8 (« 9 sur 11 » au lieu de « 8 sur 10 ») ;
  - les verrous d'avant ignorés (le parcours sautait à « Pour aller plus loin ») ;
  - la grille oubliée à la reprise après un rechargement (« Ta grille » au lieu de « Tes codes »).
- **La spec de la partie 1**, sous Chromium : 6 essais verts, 1 rouge, 1 sauté. Le rouge mesure le panneau pendant son glissement d'entrée (−228 px). C'est le défaut de chronométrage relevé par l'audit de début de session, présent sur la base a328bb9, sans lien avec ce lot.
- **Les captures** : `plans de travail/captures-2026-11-09-parcours-8/`, préfixées `chromium-`. Elles couvrent les onze étapes à 1180 px en sombre et en clair, les étapes 2, 5 et 9 à 820 et 390 px, le chemin sans fichier à 1180 px (et le panneau en cours), le refus du panneau. Le fichier `chromium-couverts-390.json` relève ce que la bulle ou les palettes couvrent à 390 px (voir la question 2).

- **Corrections du 9 nov.** Vitest complet (depuis `tests/`, après la fusion de main) : **10 934 / 10 934**, 896 fichiers
  (mesuré aussi par la relecture). Trois essais attendaient un premier code à 0 (`sentinelle-sous-criteres-editables` G.a et G.e,
  `bareme-grille-neuve-1120` E.b) : mis à jour, la décision de Cowork en commentaire. Deux bancs neufs :
  `sentinelle-premier-code-numero-1-2026-11-09` (la règle, le stock gardé ; break-test : le rang depuis 0 → rouge) et
  la sentinelle des textes, étendue aux corrections (break-test : « (0 pour le code 10) » retiré → rouge). Playwright
  (Chromium), le banc du parcours : **7 verts** (5 d'avant et 2 neufs), 5 captures sautées hors demande. Les deux neufs :
  - « 820 px : aucun avis ne couvre la bulle… » : un relevé tourne dans la page pendant tout essai du fichier
    (toutes les 100 ms ; un recouvrement de plus de 500 ms est consigné, et chaque essai finit en exigeant un relevé
    vide). Break-test : la pile qui ne se déplace plus → **rouge** (« Poser tes codes : Grille enregistrée : ses
    critères totali… »). Un premier essai, qui sondait seulement à l'arrivée de chaque étape, restait vert sans la
    correction : remplacé par ce relevé.
  - « pendant un parcours, l'aide dans les pages se tait… » : une flèche affichée avant le lancement se cache ; une
    bulle de découverte et une infobulle ne s'ouvrent pas ; après « Plus tard », elles s'ouvrent. Break-tests : sans
    le garde de la bulle de découverte → **rouge** ; sans celui de l'infobulle → **rouge**.
  - Les codes de l'essai de bout en bout sont maintenant « Code 1 » et « Code 2 » (break-test : le rang depuis 0 →
    rouge).
  **Après la relecture** : trois essais de plus (« 1180 × 820 », où aucun coin ne laisse la bulle libre ; « 820 × 600 »,
  un orange affiché avant le lancement ; l'aide muette éprouvée aussi sur les flèches et la bulle ancrée) ; le relevé
  ne compte plus qu'un avis réellement au-dessus de la bulle, et dès quatre passages. Break-tests : la pile qui ne passe
  plus sous la bulle → « 1180 × 820 » **rouge** ; les gardes des flèches retirés → **rouge** ; l'exception de la bulle
  ancrée retirée → **rouge**. Un seul reste vert : la sonde lancée seulement pendant un parcours, pour « 820 × 600 » :
  le lancement du parcours émet lui-même un avis, qui replace la pile ; l'essai juge le résultat, pas ce chemin-là.
  L'essai « sans fichier » était instable avant ces corrections (1 rouge sur 3, mesuré avec le code d'avant aussi) :
  il tapait les deux nombres sans quitter le champ ; il fait maintenant le geste entier (`change`), 5 verts sur 5.
  Banc complet : **10 verts**, 5 captures sautées hors demande.
  Specs voisines (Chromium) : `notifications-pile-1224`, `grille-critere-ajoute-enregistrer-957`,
  `confirmations-conception-uniformes`, `parcours-1-et-2` : 18 verts, 1 sauté, 1 rouge, le rouge Chromium connu de la
  base (« panneau : … le ferment », la géométrie du panneau pendant son glissement).

### Relecture par un agent neuf

**Seconde relecture, des corrections du 9 nov.** Verdict, en une ligne : **prêt avec réserves ; phrases, numérotation et
aide muette conformes ; la pile couvrait encore la bulle à 1180 × 820, et un avis d'avant le lancement ne bougeait pas.**
Il a rejoué Vitest (10 934 / 10 934) et le banc, comparé les onze phrases par script, et fait quatre break-tests (deux
rouges, deux trous : les gardes des flèches et l'exception de la bulle ancrée n'étaient pas éprouvés). Ce que j'en ai
fait : la pile passe sous la bulle quand aucun coin n'est libre, sonde tant qu'un avis est affiché, et ne recalcule que
si quelque chose a bougé (sa remarque sur le coût) ; les deux trous sont comblés ; un commentaire et un titre d'essai
devenus faux sont corrigés (le geste de l'étape 9 dans `js/parcours-commentaires.js`, « la forme de la dissection »).
Inscrits plus bas : la pile sur d'autres commandes (n° 7), la dissection qui compte ses codes depuis 0 (n° 6). Laissé
sans suite, commenté dans le code : la bulle de découverte marquée vue même quand elle se tait. Sa remarque pour
Grégoire : la variante sans fichier dit toujours « ni « Spécifique » ni « Bilan » ne les nomment », vrai sans codes ;
la variante avec fichier renvoie maintenant au PDF. Rien à changer à mon avis, à toi de voir.

**Première relecture (nuit du 8 au 9 nov.)** :

Verdict : **prêt avec réserves**. Ses constats, tous traités dans le lot :
- l'étape 8 n'était pas sautée quand l'étape 7 s'était affichée ;
- une grille restée ouverte au lancement devenait celle du parcours ;
- le banc n'éprouvait ni le verrou d'avant, ni la démo, ni le service d'orthopédagogie, ni l'appariement des gestes ;
- l'étape 6 posait son contour sur le nom avant les phrases ;
- la documentation du moteur ne disait pas `'aucun'`.

En corrigeant, j'ai trouvé deux défauts de plus dans mon propre code, corrigés aussi. À l'étape 9, « Annoter ▾ » restait sous le voile, alors que le geste demande de le toucher : le banc passait en Évaluer par programme et ne pouvait pas le voir. Une reprise après rechargement perdait la grille du parcours ; ce défaut, je l'avais introduit en corrigeant le précédent. Ses deux autres points remontent à Grégoire : l'iPhone (question 2) et le compte des parcours sur cette branche (« Pour la fusion »).

## À inscrire au BACKLOG

Pour la session du Mac, à la fusion, sous le prochain numéro. Les trois premières viennent de la consigne.

1. Les exemples grisés et une infobulle du critère algorithmique nomment le français : « Ex: Syntaxe, Ponctuation... » (nom d'un sous-critère), « Ex: La plupart des erreurs concernent la construction syntaxique... » (observation), « Ex: 1.0 pour erreur complète, 0.5 pour demi-point » (pondération), « Ex. : EUF » (nom d'une collection). Contraire au principe du 21 oct. (« ne rien coder en dur en fonction d'une discipline précise »). Proposer à Grégoire des exemples tirés des deux de l'écran (une rédaction, la chimie) avant tout code.
2. L'atelier du critère algorithmique et ses calculs disent « copie » pour la production (« Copie fictive », « Copies de référence », « sur la copie », « la longueur de la copie », « Une copie déjà évaluée garde sa note… »). À joindre au lot « « Production » plutôt que « copie », dans l'interface ».
3. À joindre à #1133 (le mode Catégories sans écran) : le parcours montre ce que perd le chemin sans fichier : ni décompte par code, ni « principalement », ni table selon le code le plus fréquent. Taper ses codes à la main reste la question qui revient à Grégoire.
4. ~~Le premier sous-critère ajouté par « + Ajouter un sous-critère » porte le numéro 0~~ **Corrigé le 9 nov.
   (décision 1 de Cowork) : ne pas inscrire.** Le premier sous-critère ajouté par « + Ajouter un sous-critère » portait le numéro 0 (`codeSousCritereNeuf`, `grilles.js:5161-5164` depuis les corrections), et aucune touche ne choisit le code 0 dans Annoter. Il bloque une phrase validée de l'étape 9 (le clavier). Vu à l'écran (« Code 0 ») ; la touche est lue dans le code.

5. **(Décision de Cowork du 9 nov.) Le basculement automatique sur le modèle « Français écrit »** quand le nom du
   critère contient « français » (`js/evaluation-enonces.js:436, 545-554, 742`) est une règle codée pour une
   discipline, qui agit sans que l'utilisateur·rice la choisisse ; deux principes de Grégoire l'excluent (ne rien
   coder en dur pour une discipline, 21 oct. ; rien qui agisse à la place de la personne sans qu'elle le choisisse).
   À revoir à part, en mesurant d'abord si ses grilles réelles en dépendent. La phrase de l'étape 6 le dit en attendant.

6. **(Relecture du 9 nov.) La dissection compte encore les codes depuis 0** (`js/materiel-assistant.js`, `code:
   String(k)`) : inerte tant que le critère n'est pas algorithmique ; s'il le devient (« Type »), son premier code vaut 0
   et aucune touche ne le choisit. Plusieurs bancs de la dissection attendent ces codes : à décider à part. Voisin et
   antérieur : `codeAfficheSousCritere` (`js/grilles.js`) affiche « 0 » pour un sous-critère sans code.
7. **(Relecture du 9 nov.) La pile des avis, déplacée pendant un parcours, peut tomber sur une commande** que la
   bulle demande de toucher (elle ne connaît que la bulle et le contour) : la palette « Tampons » à 820 px (étape 9),
   « Un mot pour ton étudiant·e » à 1180 × 820 (étape 10), où l'orange capte alors le toucher. À voir avec le moteur,
   qui seul sait ce que l'étape éclaire.

## Pour la fusion sur le Mac

- `index.html` : les balises des parcours se suivent après `parcours-classe.js` ; l'ordre des balises fait l'ordre du panneau. Ce parcours vient huitième, après « Lire ta classe et intervenir ».
- `js/assistance.js` : le crochet `refus()` ; les autres branches ont peut-être posé le leur. En garder un seul.
- `tests/integration/parcours-1-et-2-2026-11-08.spec.js` : les comptes (« 1 sur 3 », trois parcours) suivront le nombre de parcours fusionnés.
- `js/preferences.js` : une clé de plus, `parcoursCommentaires`.
- Les jetons anti-cache : passés au jour du build de main (`20261109`) à la fusion de main du 9 nov. ; la release les réécrira.
- `js/utils-notifications.js` (la pile qui évite la bulle) et `js/accompagnement.js` (l'aide qui se tait) : le
  neuvième parcours a besoin du même mécanisme pour ses avis verts ; **en garder un seul à la fusion**. Le sixième
  parcours touche aussi `js/accompagnement.js` (l'aide du « i » au-dessus de l'aperçu), dans d'autres fonctions.
