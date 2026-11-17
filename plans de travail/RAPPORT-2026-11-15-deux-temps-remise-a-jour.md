# Rapport du lot `lot/deux-temps-modeles` — remise à jour avec main (1.248.0) et décisions du 14 et du 15 nov. (15 nov. 2026)

**Relais.** Branche `lot/deux-temps-modeles`, PR d'aperçu n° 23, non fusionnée. Consigne :
`plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`. Arbre de travail : `../labo-codex-deux-temps`.
**Fait** : les points 1 à 7 de la consigne (main fusionné, « Refaire », la règle de la Modélisation, les deux modèles
réécrits, le panneau et la fin, bancs et porte). **Reste** : la porte
(`PORTES-TERRAIN-2026-11-15-deux-temps-remise-a-jour.md`, douze gestes ; Cowork publie l'artefact) ; cinq décisions
de Grégoire (§3 de la porte) ; le verdict complet (mercredi soir, une fois) ; la fusion, par un relais à part. Ni
release, ni Nouvelles.

## Livraison

- **Fusion** : `08e815e03` (origin/main `eeaf4005a`, 1.248.0, dans la branche ; pas de rebase). Cinq conflits, tous
  mécaniques, main pris ; jetons `?v=` refaits selon la garde.
- **Build de l'aperçu** : 1115-1845 (version 1.248.0 inchangée, `release.mjs --build-only`). Aperçu :
  `https://deploy-preview-23--codexnumeris-051225.netlify.app`.
- **Vitest** : 929 fichiers, 11 859 essais, verts. **WebKit ciblé** (deux temps, gel, parcours 1 et 2, moteur,
  panneau) : 34 essais, 33 verts du premier coup, 1 vert au second (`gel-etape-7`, un pixel d'écart sur le halo après
  un défilement ; banc de main, non touché). Pas de verdict complet (consigne).

## 1 · Les conflits de sens trouvés

| Où | Ce que la branche disait | Ce que main dit | Suite |
|---|---|---|---|
| Harnais (`peuplerUnTrimestreReel`) | tapait le nom du trimestre | le nom s'écrit seul, il ne se tape plus (lot 1a) | corrigé : cinq essais sur huit rougissaient là |
| Modèle de la classe, bulle 2 | « du système de ton établissement » | « institution » | bulle réécrite |
| Modèle de la classe, bulle 5 | « les cinq morceaux » | « partie » ; « réunis ce que tu viens de créer » | bulle réécrite |
| Modèle de la classe, bulle 7 | « Un premier cours », « un de ses cours » | « séance », « Prendre les présences » | bulle réécrite |
| Modèle d'« Évaluer », bulle 1 | « chaque morceau », un paragraphe | les lignes de main, les deux bulles d'ouverture | reprises telles quelles |
| Modèle d'« Évaluer », bulle 3 | « celle d'aujourd'hui convient » | aucune date d'aujourd'hui | le 9 septembre 2025 |
| Fin des modèles | deux boutons, un mis en avant | la fin à boutons de même poids, « Pour revoir une étape… » | trois boutons, aucun mis en avant |
| Panneau | un choix unique ; sous un banc, un défaut à part | la carte de main, « Parcours suivant » | deux états par carte ; le défaut piloté retiré |
| « Refaire » | reprenait le modèle où la démo en était | la visite | voir §2 |

`js/materiel-aide.js`, `js/trimestre-v2-cours.js`, `js/parcours-decouvrir.js` et `css/parcours.css` : fusionnés sans
conflit, relus, rien à changer.

## 2 · « Refaire » : ma décision

- **Pratique guidée** : inchangée, c'est la visite de main (rien n'est désigné qui écrit).
- **Modélisation** : elle rejoue ses gestes, jamais en visite. Pour revenir à l'état d'avant, **la démo est remise à
  neuf**, après une fenêtre qui le dit ; puis le **premier** modèle part. Le modèle d'« Évaluer » se joue sur le
  groupe que monte celui de « Mettre ta classe en place » : défaire l'un sans l'autre laisserait la démo dans un
  état qu'aucun modèle n'a produit. C'est la voie simple, et elle a un prix : ce que la personne a exploré dans la
  démo s'efface aussi. Décision 3.2 de la porte.
- Rien ne sort de la démo : même fonction que « Remettre la démo à neuf », déjà bancée.

## 3 · La règle de la Modélisation

- Moteur : une ligne peut **montrer** ce dont elle parle sans se griser (`montre`) ; une étape peut déclarer que sa
  liste **suit l'écran** (`lignesVivantes`) : la bulle est récrite sur place, sans changer d'étape.
- `troisTemps` (`js/parcours-classe.js`), commun aux deux modèles : « Touche « Remplir avec l'exemple » » ; les lignes
  d'explication ; la consigne du bouton de la page.
- « Remplir avec l'exemple » passe par `remplir`, qui ne fait rien hors de la démo. Cible tactile : 44 px, mesurée.

## 4 · Ce que devient l'ancienne décision 3.1

**Le détour reste.** Mesuré sous WebKit, aux deux orientations : le choix « des points » / « des niveaux de
performance » n'est offert qu'à une grille qui porte les deux. Celle de l'exemple n'a ni points ni niveaux nommés :
le choix ne paraît pas, elle naît avec quatre critères analytiques, et les quatre menus « Type » restent. Le banc le
vérifie à chaque passage. Décision 3.1 de la porte.

Les autres : 3.2 et 3.4 restent ; 3.3 est remplacée (« Remplir avec l'exemple » écrit les vingt commentaires dans
leurs cases, plus de fichier) ; 3.5 est remplacée par la fin à trois boutons ; 3.6 est le §6 ci-dessous.

## 5 · Suppositions, et décisions techniques nommées

1. **Le choix unique « Modélisation / Pratique guidée » est retiré**, puisque chaque parcours porte ses deux états.
   Les mots de Grégoire restent, sur chaque ligne.
2. **Un parcours sans modèle garde la carte de main** (un état, un bouton) : pas de ligne « Modélisation » vide.
3. **« Remettre la démo à neuf » est toujours visible** sous « Tes parcours ».
4. **Les présences de l'exemple** : Amical Yack et Attentionné Caribou absents, Bienveillante Cigogne en retard (une
   période sur deux). Ce sont les trois premières rangées de la saisie : dispersées, deux cases restaient sous le
   bas de l'écran, sans flèche (mesuré).
5. **Les deux bulles d'ouverture d'« Évaluer »** (« Pourquoi étiqueter », « Tu apprends aussi ») se montrent dans le
   modèle : c'est là qu'on étiquette pour la première fois.
6. **L'évaluation, la pratique, le passage d'un groupe à l'autre et le mot** restent les gestes de la personne : ce
   ne sont pas des formulaires à remplir, ce sont les gestes à apprendre.
7. **Le nom de la cartouche** : « Artefact 1 » (le matériel ne la nommait pas).
8. **L'horaire de l'exemple** s'appelle « Mar-Ven » (à la manière de l'exemple de main, « Lun-Mar »).
9. **La consigne de la fin ne porte pas de point final** : c'est une ligne de liste, comme celles de main.
10. **L'échéance** : le 2025-09-09 est bien une séance du deuxième groupe (vérifié au banc).
11. **Les jetons `?v=`** : `--build-only` a aussi bumpé des fichiers que la branche ne change pas ; sans effet hors
    de l'aperçu, à reprendre de main à la fusion.

## 6 · Les textes écrits, à relire (lus par l'enseignant·e seulement)

**Panneau** (`js/assistance.js`)
- Fenêtre de « Refaire », titre : « Refaire ce modèle » ; bouton : « Remettre à neuf et refaire ».
- Pour le premier modèle : « Pour refaire ce modèle, la démo est remise à neuf : tout ce que tu y as fait s'efface.
  Tes données, elles, ne bougent pas. »
- Pour un autre : « Pour refaire ce modèle, la démo est remise à neuf : tout ce que tu y as fait s'efface, et les
  modèles se rejouent depuis le premier, « Mettre ta classe en place ». Tes données, elles, ne bougent pas. »

**Modèle de « Mettre ta classe en place »** (`js/parcours-classe.js`, `ETAPES_MODELE`)
1. *Un cours* — « Dans la démo, tu montes un deuxième groupe, avec le matériel de l'exemple. » / « Le code du
   cours : 601-999-DM » / « Sa pondération : 3-1-3 (elle sert à calculer les heures de cours) » / « Sa discipline
   (elle sert à identifier le matériel partagé) » / « Touche « Créer le cours » »
2. *Une liste d'étudiant·es* — « Dix étudiant·es fictif·ves, une ligne par personne : » / « son DA (il l'identifie
   partout dans l'application) » / « son numéro de groupe, 00002 (il servira à l'horaire et au groupe-cours) » /
   « son nom et son prénom » / « Touche « Prévisualiser » »
3. *Le cours de la liste* — « L'aperçu montre les dix personnes, telles qu'elles seront importées » / « Leur cours :
   601-999-DM, celui que tu viens de créer (l'application proposait le cours actif) » / « Touche « Importer 10
   étudiant·es » » ; avis : « L'aperçu est refermé : touche « Prévisualiser » pour le rouvrir. »
4. *Un horaire* — « Le groupe : 00002 (l'horaire lui est lié) » / « Le nom de l'horaire : Mar-Ven » / « Deux séances
   par semaine : le mardi et le vendredi, de 8 h à 10 h » / « 2 périodes par séance (le nombre s'écrit d'après les
   heures) » / « Touche « Créer l'horaire » »
5. *Un groupe-cours* — « Le groupe-cours réunit ce que tu viens de créer : » / « le cours 601-999-DM » / « le groupe
   00002 » / « l'horaire « Mar-Ven » » / « l'enseignant de la démo, Primo Primavera » / « Touche « Créer le
   groupe-cours » (le groupe apparaîtra dans l'en-tête de l'application) »
6. *D'un groupe à l'autre* — « Ton deuxième groupe est dans l'en-tête, à côté de celui de la démo » / « Le Suivi et
   l'Évaluation montrent toujours le groupe choisi ici » / « Choisis le groupe 601-999-DM dans l'en-tête »
7. *Prendre les présences* — « Ce qui suit, tu le referas à chaque séance. » / « La séance : la première du groupe,
   le [jour et date] » / « Deux absences et un retard sont notés (tout le monde est présent par défaut) » / « Touche
   « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu) »
8. *Le groupe d'un coup d'œil* — « Reviens-y avant chaque séance. » / « Chaque point blanc est un·e des dix
   étudiant·es » / « La bande « Assiduité » le place selon ses présences : à droite, il vient à ses cours » / « Trois
   points sont à l'écart : les deux absences et le retard de la séance »

Dans toutes les bulles à formulaire : « Touche « Remplir avec l'exemple » », et le bouton « Remplir avec l'exemple ».

**Modèle d'« Évaluer une première production »** (`js/parcours-evaluer.js`)
1. *Ta grille*, à l'accueil — « Dans la démo, tu évalues une première production du deuxième groupe, avec le matériel
   de l'exemple. D'abord, sa grille. » ; le détour : « …Celle-ci se juge par niveaux de performance… » (un mot changé).
2. *Ta production* — « La grille est prête. Décris la production qu'elle servira à évaluer. » / « Touche « + Nouvelle
   production » » / « Son nom dit ce qu'elle fait faire ; il est repris dans « Activité d'apprentissage » (c'est ce
   que les étudiant·es lisent en tête de leur synthèse de rétroaction) » / « Son type : « Artefact » » / « Sa grille,
   « G4H Sans français », et son échelle, « IDME et niv 0 » » / « Touche « Créer la production » »
3. *Tes consignes* — « L'objectif, la tâche et les consignes : ce que les étudiant·es doivent savoir pour réussir » /
   « La date de remise : le mardi 9 septembre 2025, une séance du groupe » / « Coche « Consignes transmises » (la
   production entre alors au calendrier du groupe) »
4. *Une première production* — « …choisis le niveau de l'exemple : … » ; « …choisis les niveaux de l'exemple… »
   (« fourni » devient « de l'exemple »).
8. *Ta cartouche* — « La rétroaction vient de la grille. Pour qu'elle parle avec des mots d'enseignant·e, il lui faut
   une cartouche. » / « Touche « + Nouvelle cartouche » » / « Son nom, sa grille, « G4H Sans français », et son
   échelle, « IDME et niv 0 » » / « Vingt commentaires : un par critère et par niveau de performance, tels qu'on les
   écrirait dans la marge » / « Touche « Créer la cartouche » » / « La cartouche est créée » / « Dans la fiche de la
   production, choisis cette cartouche (elle s'appliquera à chaque évaluation) »
9. *Ta rétroaction, avec tes mots* — « Reviens à la première évaluation : touche « Actions › Consulter », puis
   « Déverrouiller » » / « Choisis la cartouche : la rétroaction se réécrit avec ses commentaires, un par critère,
   selon le niveau attribué » / « Dans « Un mot pour ton étudiant·e », écris « Bon départ ! », puis verrouille »
- Hors du deuxième groupe : « Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui) ».
- Refus au panneau : « Commence par la Modélisation de « Mettre ta classe en place » : ce modèle se joue sur le groupe
  que tu y montes. » (« modélisation » prend sa majuscule).

**Matériel** : la description, « Appliquer des stratégies de lecture variées (Deux-Rives) » ; la tâche, « Annoter le
texte « Deux-Rives » en y appliquant… » ; le nom de la cartouche, « Artefact 1 ».

## 7 · Bancs et break-tests

- `deux-temps-modelisation-2026-11-12.spec.js` (6 essais) : le panneau ; « Remplir » hors de la démo ; le modèle de
  la classe de bout en bout, le confinement, la fin, le « Refaire » d'une Modélisation ; le « Refaire » d'une
  Pratique guidée ; la remise à neuf ; la sortie pendant l'entrée.
- `deux-temps-modeles-2026-11-13.spec.js` (5 essais) : « Le refaire avec ma classe » ; A et B aux deux orientations.
- Sentinelles : `sentinelle-deux-temps-2026-11-12` et `sentinelle-deux-temps-modeles-2026-11-13`, 48 essais.

| Défense | Cassée ainsi | Rouge |
|---|---|---|
| « Remplir » n'écrit que dans la démo (point 3) | la garde retirée de `remplir` | WebKit : « se refuse hors de la démo », reçu vrai ; Vitest aussi |
| « Refaire » d'une Modélisation (point 2) | la remise à neuf retirée de `refaireModele` | WebKit : « 6 sur 8 » au lieu de « 1 sur 8 » |
| « Refaire » d'une Pratique guidée (point 2) | `visite: false` dans `lancer` | WebKit : « étape 1 : en visite », reçu faux |
| Un modèle jamais en visite | `visite: true` à son lancement | Vitest |
| Le texte du panneau | « 3. Mettre en pratique : » | Vitest |
| Les mots de main dans les modèles | « établissement » ajouté à une ligne | Vitest |
| « Deux-Rives » | « (Madawigouche) » remis | Vitest, deux essais |

Chaque défense rétablie : vert.

## 8 · Trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| Le harnais tapait un champ que main a rendu non modifiable | Corrigé maintenant (mon lot) |
| À la question de l'échelle, la bulle couvrait « Adopter » (1180 × 820) | Corrigé maintenant (étape du modèle) |
| Aux consignes, trois grands champs évités ne laissaient aucune place à la bulle | Corrigé maintenant : une flèche, vers le premier |
| L'avertissement jaune « Cette cartouche n'est pas encore créée » paraît après « Remplir » | Laissé : c'est la page. Décision 3.3 de la porte |
| Sur main, « Refaire » la Pratique guidée d'« Évaluer » refait les gestes au lieu de visiter | Hors du lot ; dit ici, non inscrit (aucun symptôme vécu) |
| `gel-etape-7` : un pixel d'écart sur le halo, une fois sur deux passages | Hors du lot ; dit ici, non inscrit |

## 9 · Tarir ou réparer

Rien n'est écrit dans les données de quiconque. Sur l'appareil, la clé `laboCodex.assistance` peut garder un champ
`materiel` du choix retiré : il n'est plus lu, et il n'est pas effacé.
