# Rapport — le septième parcours, « Lire ta classe et intervenir » (session F, nuit du 8 au 9 nov. 2026)

**Branche** : `lot/parcours-7-lire-ta-classe`, partie de `origin/lot/parcours-1-et-2` (`a328bb9f`). Consigne :
`plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md` (recopiée de `main`, commitée avec le lot).
Rien au changelog, pas de release, pas de fusion. **Chromium seulement** (WebKit n'existe pas dans ce cloud) : le
verdict WebKit et les captures WebKit se prennent sur le Mac.

## En tête, en gestes d'utilisateur

### Ce qui est fait

- Dans le panneau « Assistance », un parcours de plus : « Lire ta classe et intervenir », avec sa ligne
  « Avant chaque cours, voir qui a besoin de toi et de quoi ; puis, si tu le décides, noter une intervention. »
- « Commencer » ne part que si ton groupe-cours réel a des présences saisies et qu'au moins une personne s'écarte
  (A ou C sous ton seuil le plus bas, ou RàI 2-3). Sinon, le panneau reste ouvert et dit pourquoi, sous le bouton,
  avec tes deux phrases validées.
- Les neuf bulles, mot pour mot : les bandes, « Détails », un filtre et une pastille, le profil sur l'engagement
  (les pastilles d'absence et de production restent sous le voile), « Accompagnement », la grille de dépistage
  (étape 5, seulement si aucune n'est désignée), « + Nouvelle intervention », la fiche, « Créer l'intervention »,
  l'après (le statut « Complétée » montré, sous le voile), puis la dernière bulle, au centre, sans voile, et
  « Terminer ».
- « Plus tard » sur chaque bulle sauf la dernière ; le parcours attend dans le panneau (« Étape n sur 9 »,
  « Reprendre ») ; Échap vaut « Plus tard » (« Terminer » à la dernière bulle).
- Le parcours n'écrit rien de lui-même : seuls tes gestes écrivent (le choix de la grille, l'intervention créée).
  Il ne garde que son état dans le panneau (la préférence `parcoursAssistance`, comme les autres parcours).

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

Les cinq refus ci-dessous, et la phrase de la question 6, sont **posés dans le code pour que l'écran fonctionne, marqués comme proposés** (bloc
`PROPOSES` de `js/parcours-lire-ta-classe.js`) ; aucun n'est validé.

1. **Mode anonymisation** (demandé par la consigne). En anonymisation, le titre, la description, les observations et
   les notes d'une intervention sont masqués et ne s'écrivent pas (#751) : « Donne-lui un titre » y est impossible.
   Je recommande que le parcours **ne parte pas** dans ce mode, et que le panneau dise : « En mode anonymisation, une intervention ne garde ni son titre ni tes observations : reviens au mode normal pour faire ce parcours. »
   Si le mode s'active en cours de route, la bulle se ferme et le parcours attend à son étape.
2. **L'option RàI décochée** (demandé par la consigne). Sans elle, l'onglet « Accompagnement » et son bouton
   disparaissent : les étapes 3 à 8 sont impossibles. Je recommande de refuser, avec : « Ce parcours passe par l'onglet « Accompagnement » du profil : coche « Appliquer une adaptation du modèle de la Réponse à l'intervention » dans Labo › Observation pour le commencer. »
3. **La collecte ACP décochée** (trouvée en chemin, même famille que la précédente). « Activer la collecte des
   données sur le contexte d'apprentissage et la performance » décochée cache l'onglet « Engagement ACP » : l'étape 3
   tombe sur « Productions ». Je recommande le même traitement : « Ce parcours passe par l'onglet « Engagement ACP » du profil : coche « Activer la collecte des données sur le contexte d'apprentissage et la performance » dans Labo › Observation pour le commencer. »
4. **Dans la démo.** La consigne exclut la démo sans dire ce que le panneau dit. Je recommande : « Ce parcours se joue sur ta propre classe : quitte la démonstration pour le commencer. »
   (Autre voie possible : que « Commencer » quitte la démo lui-même, comme « Commencer avec ma classe » à la fin de
   « Découvrir ». Je ne l'ai pas fait : c'est un geste plus lourd que ce que la consigne décrit.)
5. **Sur un service d'orthopédagogie.** Même manque. Je recommande : « Ce parcours se joue sur un groupe-cours : choisis-en un dans l'en-tête pour le commencer. »
6. **Une personne sans aucune donnée choisie à l'étape 2** (demandé par la consigne). Son Accompagnement n'a ni
   historique ni « + Nouvelle intervention ». Ce que fait le code : son profil s'ouvre, le parcours dit pourquoi
   dans un message bref, ramène aux noms et redit la bulle de l'étape 2 ; rien n'est retenu. La personne en choisit
   une autre (l'étape 2 accepte n'importe qui). Phrase proposée, posée : « Son profil n'a encore aucune donnée que l'Accompagnement puisse lire : choisis une autre personne. »
   La condition d'entrée, elle, la compte comme signalée : le Suivi la signale, le panneau ne le contredit pas.
7. **Une assiduité de 0 % compte comme « aucune donnée »** (trouvé en chemin, `aucuneDonneeDeSuivi`,
   `js/profil-etudiant-calculs.js:1938`). La personne absente à toutes les séances, sans production, est signalée
   (A sous le seuil) mais n'a pas de « + Nouvelle intervention » : c'est la plus éloignée, et la seule qu'on ne peut
   pas noter. Cela contredit #743 (« l'absent total, 0 %, CONNU »). Je recommande de corriger la règle (inscrit
   ci-dessous, n° 5) ; d'ici là, le parcours la traite comme au point 6.
8. **Les captures** : la bulle de l'étape 3 couvre, à 1180 px, la rangée du nom en haut du profil ; celle de
   l'étape 7 couvre le milieu de la fiche (la fiche ne tient pas à l'écran ; le moteur amène « Créer
   l'intervention » dans la vue, et le haut de la fiche, avec le titre, est au-dessus). C'est le placement du
   moteur de la première partie, que je n'ai pas modifié. À juger sur les captures WebKit.

### Ce que je n'ai pas pu vérifier

- **WebKit et Safari** : tout s'est joué sous Chromium (banc et captures). À refaire sur le Mac, branche par branche.
- **Tes données réelles** (à mesurer sur le Mac) : sur ton groupe, le panneau laisse-t-il entrer ? Qui est
  signalé ? La leçon manquée s'affiche-t-elle sous une absence avec ta carte d'alignement ? Ta grille de dépistage
  est-elle déjà désignée (l'étape 5 se sauterait) ?
- **L'iPad** : le toucher à travers les trous du voile, le menu natif des grilles à l'étape 5, la fiche qui défile
  sous le voile à l'étape 7.

## Le détail

### Ce qui est livré

| Fichier | Quoi |
|---|---|
| `js/parcours-lire-ta-classe.js` (neuf) | Le parcours : ses neuf étapes, sa condition d'entrée (`refus`), sa reprise, les masques |
| `js/assistance.js` | Trois lignes de plus au toucher de « Commencer » : si le parcours déclare `refus` et qu'il rend une phrase, elle s'affiche sous le bouton (`<p class="assistance-parcours-refus" role="status">`, `textContent`), le panneau reste ouvert, rien ne part |
| `css/parcours.css` | La variante de voile `aucun` (étape 9, « sans voile ») et le style du refus |
| `index.html` | La balise du parcours après `parcours-classe.js` ; jetons `?v=20261108b` (jour du build : la sentinelle anti-cache refuse un jeton d'un autre jour sans release) |
| `tests/integration/parcours-7-lire-ta-classe-2026-11-09.spec.js` (neuf) | Le banc de bout en bout |
| `tests/unit/sentinelle-parcours-lire-ta-classe-2026-11-09.test.js` (neuf) | Les mots, confrontés à la consigne |
| `tests/integration/parcours-1-et-2-2026-11-08.spec.js` | Le panneau compte trois parcours sur cette branche (« 1 sur 3 », trois titres, trois lignes, trois états) |
| `plans de travail/captures-2026-11-09-parcours-7-chromium/` | Les captures (liste plus bas) |

### Ce que j'ai décidé seul (hypothèses nommées)

- **« Présences saisies »** = au moins une personne du groupe-cours actif dont l'assiduité est connue (la bande A a
  un point). Des présences saisies sous un horaire sans périodes (#830) ne comptent donc pas : le panneau dit alors
  « Commence par « Mettre ta classe en place » ».
- **« Signalée »** = exactement le filtre « A ou C < … » du Suivi (`borneBasseAssiduiteCompletion`, seule source)
  ou un niveau RàI 2 ou 3 (`determinerNiveauRaiPedagogique`), parmi les personnes actives (`estEtudiantExclu`).
- **L'ordre des refus** : démo, service, présences, personne signalée, puis RàI, ACP, anonymisation. Les deux
  manques de données passent avant les réglages : « commence par tes présences » est plus utile que « change ton mode ».
- **L'ordre dans le panneau** : celui des balises `<script>` d'`index.html`, comme la première partie. Sur cette
  branche seule, le parcours est le troisième de la liste (pastille « 3 », compteur « sur 3 ») ; après les fusions,
  septième (et le compteur compte tous les parcours inscrits, neuf avec ceux de la nuit). La consigne dit « le
  compteur compte sept parcours » : elle a été écrite avant les parcours 8 et 9.
- **« Plus tard »** ferme la bulle sans message (la consigne « Les deux parcours » n'en prévoit pas pour « Plus
  tard » ; celui de « Découvrir » est propre à « Quitter le parcours »).
- **La personne retenue et la fiche ouverte vivent en mémoire seulement** (pas dans le stockage : un DA dans une
  préférence voyagerait avec elle). Après un rechargement, « Reprendre » à une étape entre 3 et 7 repart de
  l'étape 2 ; à l'étape 8, la bulle se lit sans la fiche si elle n'est plus connue.
- **Étape 8** : la consigne dit « La fiche, contour sur le statut » (et non « la fiche éclairée », comme à
  l'étape 7) : seul le contour est ouvert dans le voile, et masqué. La bulle se pose à côté sans couvrir le statut.
- **Étape 9** : « sans voile » veut dire rien d'assombri **ni de retenu** : la page reste à portée de main
  derrière la bulle (relecture neuve, constat 3).
- **Étape 5** : la bulle a deux temps (le lien « Régler les outils d'observation » de la carte RàI, puis, dans
  Labo › Observation, le menu), sans changer de numéro. Le menu est amené dans la vue une fois la page immobile :
  `ouvrirOutilsObservation` défile en douceur vers le haut de la sous-section, et le menu passait à l'écran puis
  repartait (mesuré au banc).

### Ce qu'il faudrait au moteur (la première partie), et comment j'ai contourné

1. **Garder sous le voile une partie d'une zone éclairée** (les pastilles de l'étape 3, le statut de l'étape 8).
   Un trou du voile ne peut pas contenir de plein : deux trous qui se recouvrent sont fondus (`fusionnerTrous`).
   Contournement, sans toucher au moteur : un second chemin `#parcours-masques`, posé dans le SVG du voile, recouvre
   ces éléments (recalculé à chaque passage de la sonde, retiré avec le voile). **Ce qu'il faudrait** : une option
   d'étape `masques: () => Element[]` dans `parcours-moteur.js`.
2. **Un voile qui ne voile rien** (étape 9) : la variante `.parcours-voile--aucun` (une règle CSS).
3. **Une condition d'entrée** : `refus` dans la définition d'un parcours, lu par `assistance.js`. Les parcours 4, 5,
   6, 8 et 9 en ont besoin aussi : à la fusion, garder **une** façon de le faire (celle-ci est en trois lignes).
4. **Le placement de la bulle quand la zone ne tient pas à l'écran** (étapes 3 et 7) : voir la question 8.

### Les vérifications « À VÉRIFIER AVANT DE POSER LES TEXTES »

Lecture du code (et banc Chromium quand il est dit).

| Étape | Verdict | Où |
|---|---|---|
| 1 : les bandes « Assiduité (A) », « Complétion (C) », « Performance (P) » | **tient** | `js/tableau-bord-apercu.js:2036` |
| 1 : « N évaluations en attente » / « N séances en attente » | **tient** | `js/tableau-bord-apercu.js:1879-1884` ; vu au banc (« 1 évaluation en attente », « 3 évaluations en attente ») |
| 1 : zones de A et C depuis Labo › Observation, de P depuis l'échelle | **tient** | `_badgeIndiceSuivi`, `js/tableau-bord-apercu.js:684-688` ; `zonesDeLaBarre` (contexte-qualification.js) |
| 2 : filtres en intersection, personnes retenues en tête | **tient** | `appliquerFiltres`, `js/tableau-bord-apercu.js:434-499` ; vu au banc (la personne à l'écart remonte en tête) |
| 2 : « les plus éloignées de tes seuils d'abord » | **tient, avec une nuance** | pour « A ou C » et « P », le tri suit l'écart au seuil ; pour « RàI 2-3 » seul, il suit le niveau (3 avant 2), puis l'ordre alphabétique (`:487`). Je ne propose pas de retouche : le niveau est lui-même une distance |
| 2 : le toucher d'une pastille ouvre le profil, puis Engagement ACP après 100 ms | **tient** | `js/tableau-bord-apercu.js:1224-1234` ; vu au banc |
| 3 : la leçon manquée dans la pastille (`badge-absence-lecon`) | **tient** (lecture) ; **non vérifiable ici** sur une vraie carte | `js/profil-etudiant-sections-affichage.js:599`, `:1851` |
| 4 : la recommandation du palier le plus bas | **tient** | « …rencontrer l'étudiant·e pour comprendre les absences ou les travaux manquants… », `js/contexte-qualification.js:408` |
| 4 : le niveau ne vient ni de A ni de C, sauf en non-participation | **tient** | `classerNiveauAuCritere`, `js/profil-etudiant-calculs.js:1796` ; non-participation `:1971` |
| 4 : niveau 1 ou « En attente » sans difficulté dans les productions | **tient** | `:1797-1805` ; vu au banc (« En attente ») |
| 5 : le choix s'enregistre au changement, gardé par #806 | **tient** | `_sauvegarderGrilleReferenceSiFiable`, `js/preferences-v2.js:267` ; vu au banc (préférence écrite, étape 6 atteinte) |
| 5 : au retour, l'Accompagnement affiche le défi | **tient** (lecture) ; au banc, sans évaluation, il n'y a pas encore de défi à afficher | |
| 6 : `naviguerVersNouvelleIntervention`, intervalle de 50 ms abandonné après 2 s | **tient** ; le parcours se repère sur `[data-fiche-intervention]` | `js/profil-etudiant-sections-affichage.js:4148-4164` |
| 7 : la fiche se crée-t-elle sans titre ? | **oui** : rien ne l'exige (l'attribut `required` n'est pas lu, il n'y a pas de `<form>`). **Ce qui s'écrit** : `titre: ''` (`js/interventions.js:1533`) ; la fiche rouverte et la liste montrent alors un titre vide. La bulle avance quand même | inscrit (n° 6) |
| 7 : le cochage des critères part 100 ms après l'ouverture | **tient** | `js/interventions.js:1262-1275` |
| 7 : « Suggérer » ne propose rien sans critère coché | **tient, et plus** : sans critère coché, il **efface** l'objectif déjà écrit (`js/interventions.js:1430`, `:1437`). Or la bulle dit « écris ton objectif toi-même » quand l'intervention porte sur les absences | inscrit (n° 7) |
| 7 : « l'application propose le 3 quand son profil l'y situe, sinon le 2 » | **tient** | `js/interventions.js:825-829` |
| 7, anonymisation | **ne tient pas** (« Donne-lui un titre » impossible) | voir la question 1 |
| 8 : « Marquer cette intervention complétée ? », case décochée | **tient** | `_demanderReport`, `js/interventions.js:1716` ; textes `:119-121` |
| 8 : le bilan seulement à « Complétée » ; ne compare que les critères ciblés | **tient** | `js/interventions.js:1147` et suivantes |
| Option RàI décochée : onglet et bouton disparaissent | **tient** | `pref: 'activerRai'`, `js/profil-etudiant-sections-affichage.js:2319` ; voir la question 2 |
| Une personne sans aucune donnée | **tient** (ni historique ni bouton) | `js/profil-etudiant-sections-affichage.js:857` ; voir la question 6 |
| Étape 9 : « Labo › Observation » | **tient** | `{ id: 'accompagnement', label: 'Observation' }`, `js/config.js:90` |

### Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Une assiduité de 0 % compte comme « aucune donnée » (`aucuneDonneeDeSuivi`) | **Inscrire** (n° 5) ; question 7 |
| Une intervention créée sans titre a un titre vide | **Inscrire** (n° 6) |
| « Suggérer » efface l'objectif écrit quand aucun critère n'est coché | **Inscrire** (n° 7) |
| À 390 px, la rangée des filtres du Suivi déborde à droite (« A ou C < 8… » coupé) ; vu sur la capture de l'étape 2 | **Inscrire** (n° 8) |
| « Découvrir », étape 1 : si « Détails » était déjà actif, `avant` retire `ouvert` du panneau sans désactiver le bouton ; il faut alors deux touchers pour avancer (lecture du code, `js/parcours-decouvrir.js:146-147`, non exécuté) | **Inscrire** (n° 9), code de la première partie |
| Le parcours, au refus « sans présences », ne distingue pas « aucune séance » de « séances sans périodes » (#830) | **Commenter et oublier** : le message reste juste (« Mettre ta classe en place » mène à l'horaire) |

### À inscrire au BACKLOG

Les quatre de la consigne (questions et décisions de Grégoire du 8 nov. ; chacune se mesure et se propose à
Grégoire avant tout code) :

1. **Dépister quand les critères varient d'une production à l'autre** (question de Grégoire, 15 h 58). Le dépistage
   ne lit qu'une grille et reconnaît les critères des autres grilles par leur nom (`trouverCritereDepistage` : nom
   normalisé, égalité ou préfixe) ; un·e enseignant·e dont les critères changent n'a ni défi, ni force, ni critères
   ciblés, ni bilan. Piste jugée « très bonne » par Grégoire : rattacher chaque critère aux objectifs de la carte
   d'alignement, qui traversent les productions. Remarque de Grégoire : « le devis ministériel propose déjà des
   critères de performance pour chaque élément de compétence. Ils ne sont pas obligatoires, mais ce sont des pistes
   très pertinentes pour l'enseignant. » (La fiche du cours porte déjà « Éléments de compétence ».)
2. **Des recommandations transparentes, sur lesquelles l'utilisateur·rice a prise** (Grégoire, 16 h 10) :
   « L'application doit être transparente sur les recommandations qui sont faites, comment sont-elles créées, sur
   quelle base, et l'utilisateur devrait pouvoir intervenir dans la création de ces recommandations. » Mesuré par
   Cowork : aucune IA, des règles fixes ; le « Seuil de défi spécifique » (70 % par défaut, « seuil conventionnel ;
   non validé empiriquement », `interpretation-config.js`) ne vient pas de l'échelle de l'enseignant·e ; un critère
   peut être « en défi » à 68 % au-dessus du seuil de réussite ; « De 60 % (plus exigeant) à 80 % (moins exigeant) »
   se lit dans les deux sens ; à mesurer aussi au regard de « une seule source par famille de seuils » (30 oct.).
3. **Le bilan d'une intervention compare aussi l'assiduité, la complétion et l'écart avec le groupe** (décision de
   Grégoire, 16 h 12). Aujourd'hui, il ne compare que les critères ciblés ; l'« avant » ne garde ni A ni C (mesuré
   ici : `snapshotAvant[da] = { P, criteres }`, `js/interventions.js:1571-1590`). Le bilan dira aussi qu'une
   remontée n'est qu'un indice. Le stock : les « avant » déjà figés sans A ni C, à assumer et écrire. Quand ce lot
   sera fait, l'étape 8 du parcours sera à revoir.
4. **La fiche d'intervention, sans grille de dépistage, dit « Configure une grille de référence dans Conception ›
   Grilles de critères »** (`js/interventions.js:985`) ; le réglage est dans Labo › Observation.

Les miennes (trouvées en chemin) :

5. **Une assiduité de 0 % compte comme « aucune donnée »** dans `aucuneDonneeDeSuivi`
   (`js/profil-etudiant-calculs.js:1938`) : la personne absente à toutes les séances, sans production, n'a ni
   historique ni « + Nouvelle intervention », alors que le Suivi la signale. Contredit #743. Symptôme visible : le
   bouton manque sur le profil de la personne la plus absente.
6. **Une intervention créée sans titre a un titre vide** (fiche rouverte, liste) : rien n'exige le titre.
7. **« Suggérer » efface l'objectif déjà écrit** quand aucun critère n'est coché (`js/interventions.js:1430`, `:1437`).
8. **À 390 px, la rangée des filtres du Suivi déborde** à droite du panneau des noms (capture de l'étape 2).
9. **« Découvrir », étape 1 : deux touchers sur « Détails » quand il était déjà actif** (lecture du code, à mesurer).

### Les essais

- **Le test de la consigne** (`le bouton refuse sans présences, refuse quand personne ne s'écarte, lance avec une
  seule personne sous le seuil d'assiduité et aucune évaluation`) : sur un groupe-cours réel monté par les
  formulaires du Cadre, présences prises par l'écran de saisie. Il échoue avant ce lot (le parcours n'existe pas).
  **Break-tests** (9 nov.) : `refus()` qui rend toujours `null` → **rouge** (aucun refus affiché) ; la condition
  qui ignore A → **rouge** (personne n'est signalé). Rétablis → vert.
- **Le banc complet du parcours**, sous Chromium : 9/9 (le test de la consigne ; les neuf étapes sans grille
  désignée ; avec grille désignée, l'étape 4 mène à l'étape 6 ; une personne absente à toutes les séances, à 0 % :
  signalée, puis l'étape 2 dit pourquoi elle ramène aux noms, et une autre personne mène à l'étape 3 ; « Plus
  tard », « Reprendre » et Échap ; les refus proposés ; trois passes de captures). Break-test de la personne à
  0 % : sans le message, **rouge** ; rétabli, vert. Il vérifie aussi que les pastilles d'absence (étape 3) et le statut
  (étape 8) **reçoivent le toucher du masque**, pas d'eux-mêmes, et que l'intervention créée porte la personne,
  son « avant » et le statut « en préparation ».
- **La sentinelle des mots** (Vitest) : neuf titres, neuf textes, cinq gestes, trois boutons, le titre et la ligne
  du panneau, les deux refus validés, confrontés à la consigne ; les cinq refus proposés absents de la consigne et
  présents dans ce rapport. **Break-test** : « avant chaque cours » changé en « avant chaque séance » dans la bulle
  de l'étape 1 → **rouge**, rétabli → vert.
- **Les bancs de la première partie, sous Chromium** : parcours-1-et-2, accueil-epure, guidage-demo verts, sauf
  deux familles qui **échouent aussi sur la base** `a328bb9f` sous Chromium (mesuré dans un arbre de travail à
  part) : trois tests d'en-tete-epure (des mesures en pixels de l'en-tête) et la géométrie du panneau dans
  parcours-1-et-2 (429,99 px au lieu de 430, position lue pendant le glissement d'entrée). Rien à voir avec ce lot ;
  le verdict se prend sous WebKit sur le Mac.
- **Vitest complet** (depuis `tests/`) : 10 900/10 900, 893 fichiers.
- **Relecture par un agent neuf** : voir la dernière section.

### Conflits attendus à la fusion (la session du Mac s'en charge)

- `index.html` : la balise du parcours après `parcours-classe.js`, et les jetons de `assistance.js` et
  `parcours.css` ; les parcours 3 à 6 se placent **avant** celui-ci, 8 et 9 après.
- `js/assistance.js` : la condition d'entrée (`refus`) ; d'autres branches de la nuit en ajouteront une.
- `tests/integration/parcours-1-et-2-2026-11-08.spec.js` : le nombre de parcours (« 1 sur 3 », les titres, les
  lignes, les états).

### Les captures (Chromium)

`plans de travail/captures-2026-11-09-parcours-7-chromium/` : les neuf étapes à 1180 px en sombre et en clair
(l'étape 5 en deux temps, `5a` et `5b`) ; l'étape 4 avec une grille désignée (`p7-etape-4-1180-sombre-grille-designee`,
qui mène à l'étape 6) ; les étapes 1, 2 et 7 à 390 px en sombre et en clair ; le panneau dans quatre refus (sans
présences, personne à l'écart, et deux des textes proposés : RàI, anonymisation).

### La relecture par un agent neuf

Verdict de l'agent neuf (il n'a eu que la consigne et le diff) : **« tient avec réserves »** — la condition
d'entrée laissait partir le parcours pour une personne que l'étape 2 renvoyait sans un mot (A = 0 %) ; un banc de
la première partie était rouge au deuxième commit. Ses deux break-tests (la condition sans A ; les masques de
l'étape 3 neutralisés) rougissent ; aucun écart de texte (comparaison indépendante des neuf bulles, du titre, de la
ligne et des deux refus) ; règles de CLAUDE.md respectées.

Ce que j'en ai fait : l'étape 2 dit maintenant pourquoi elle ramène aux noms (question 6), avec un essai et son
break-test ; le banc de la première partie était déjà corrigé au commit suivant ; l'étape 9 ne retient plus le
toucher ; le masque de l'étape 8 ne couvre plus que le contour (il assombrissait deux fois le reste du statut).
Le compteur « sur 3 » de cette branche est une supposition nommée plus haut ; le couplage des masques au SVG du
moteur est le contournement décrit dans « Ce qu'il faudrait au moteur ».
