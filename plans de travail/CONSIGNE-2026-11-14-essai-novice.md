# Consigne du 14 novembre 2026 : ce que Grégoire a vécu en novice, à corriger avant son retour

Écrite par Cowork le 14 nov. 2026 à 12 h 10, d'après l'essai de Grégoire du matin (8 h 45 à 11 h 56, fenêtre privée de Chrome sur le Mac, version en ligne 1.246.0, build 1113-1906). Il se repose. Il veut que la session travaille seule, sans qu'il intervienne, et il reviendra lancer lui-même le verdict complet. Aucun nom réel.

## Ce qu'on attend de toi

Une seule branche, `lot/essai-novice-14-nov`, partie de `main`, un commit par lot, dans l'ordre des lots ci-dessous. Après chaque lot : Vitest complet et un passage WebKit ciblé. À la fin : relecture croisée du diff entier, corrections, push de la branche, PR vers `main` pour l'aperçu. **Tu ne lances PAS le verdict complet, tu ne fusionnes pas, tu ne fais pas de release** : Grégoire lance le verdict à son retour (une seule suite à la fois sur le Mac). `RELAIS.md` à jour sur `main` selon ta règle.

Tu ne lui poses aucune question. Devant un doute technique : tranche, et nomme ta supposition au rapport. Devant ce qui lui revient (ses données, la didactique, un mot lu par des étudiant·es, une zone protégée) : laisse le point, dis-le au rapport, et continue. Un lot qui résiste plus qu'il ne vaut : arrête-le proprement (ce qui est fait reste, le reste est nommé) et passe au suivant.

Tous les textes de cette consigne sont lus par l'enseignant·e seulement. Ceux marqués « validé » l'ont été par Grégoire mot pour mot. Les autres sont proposés par Cowork : ils partent tels quels et restent corrigeables. Typographie : guillemets français, pas de tiret cadratin.

## Les règles posées par Grégoire ce matin (elles valent pour tous les parcours)

1. Éliminer toute charge qui n'aide pas à faire le geste. On allège les mots ; on ne retire jamais un geste qui s'apprend.
2. Forme d'une bulle : pas de phrase qui répète le titre ; pas de paragraphe d'introduction, sauf pour dire que la nature du travail change ; une liste, une ligne par geste ; la raison d'une question entre parenthèses, à côté de sa consigne ; rien qui ne concerne que ceux qui codent ; la consigne orange devient la DERNIÈRE ligne de la liste ; une ligne se grise, avec un crochet, quand son geste est fait (elle ne disparaît pas, la bulle ne bouge pas) ; une seule page par bulle.
3. Quand une étape demande un document, la première ligne de sa bulle le nomme. Cette ligne ne se grise pas.
4. À chaque changement de page : la première ligne dit « Tu es dans « X », à l'onglet « Y ». », les deux entrées du menu reçoivent un halo, et la page s'ouvre EN HAUT, navigation visible.
5. « La bulle guide, la page agit » : les boutons qui font quelque chose sont sur la page, une seule fois ; la bulle dit quoi regarder ou toucher et le montre (flèche, halo) ; elle ne porte que les boutons du parcours (« Continuer », « Terminer », « Plus tard ») ; son texte change dès que l'écran change ; elle se place à côté de ce dont elle parle, jamais dessus ; une seule consigne à la fois.
6. Mots : « institution » (pas « établissement ») ; « séance » pour une rencontre avec le groupe, « cours » pour le cours qu'on donne ; « partie » au lieu de « morceau » ; « niveau de performance » ; le mot « pastille » ne s'emploie pas.
7. Les suites s'offrent à égalité : aucun bouton mis en avant quand l'utilisateur choisit son rythme.

## Lot 1 : trois formulaires du Cadre

**a. Le nom du trimestre.** Vécu : il répond deux fois la même chose (le nom, puis la session et l'année). Décidé : ordre des champs Session, Année, puis « Nom du trimestre » à droite ; le nom se crée seul de la session et de l'année, forme « Hiver 2027 » (session en toutes lettres, année complète) ; il n'est PAS modifiable ; plus d'astérisque. Repères : `v2-nomTrimestre` (`index.html`), `sauvegarderNomTrimestreV2`, et un `formaterNomTrimestre(code)` existe déjà. Stock : ne renomme AUCUN trimestre déjà enregistré ; un trimestre existant garde son nom affiché tant qu'on ne change ni sa session ni son année. Dis au rapport ce que tu as fait du stock.

**b. Les heures d'un cours.** Fait donné par Grégoire : un cours donné en session intensive (l'été, tous les jours, peu de semaines) a le même total d'heures qu'en trimestre ordinaire. `proposerHeuresEnseignementDepuisPonderation` (`js/trimestre-v2-cours.js`, #540 lot B) multiplie par les semaines réelles du calendrier : pour sept semaines, elle propose 28 h au lieu de 60. Corrige : la proposition est (théorie + labo) × 15, toujours ; le repère affiché suit (« (2 + 2) × 15 = 60 h ») ; le champ reste modifiable et fait foi. `calculerStatistiquesCalendrier` reste juste pour compter les semaines : n'y touche pas. Lis le motif de #540 lot B et ce qui en dépend avant de changer. Break-test : trimestre de 7 semaines, 60 h proposées.

**c. Les périodes d'une séance.** Vécu : il entre le début et la fin, et doit encore taper le nombre de périodes ; changer les heures ne change rien. Faits donnés : la pondération ne dit PAS comment les heures se répartissent entre les séances (deux blocs de 2 h ou un bloc de 4 h) ; une période dure 50 ou 55 minutes selon le collège, la pause varie ; mais une période avec sa pause occupe toujours environ une heure à l'horaire. Décidé : le champ « pér. » se PROPOSE d'après le début et la fin, en arrondissant la durée à l'heure près (8 h à 10 h : 2 ; 8 h à 9 h 50 : 2) ; il se recalcule quand début ou fin change, tant que l'enseignant·e n'a pas tapé son propre chiffre ; il reste modifiable et fait foi ; le résumé « Format : … périodes/semaine » suit. Rien ne se déduit de la pondération. Repère : `js/trimestre-v2-horaires.js`, l. 1100 et suivantes.

## Lot 2 : le moteur des parcours (`js/parcours-moteur.js`)

**a. Les lignes d'une bulle.** Une bulle peut porter une liste de lignes, chacune liée à ce qui la rend faite (un champ, un groupe de champs, une condition) : faite, elle se grise avec un crochet. Une ligne peut avoir des sous-lignes (les trois dates) : elles se grisent une à une, la ligne mère quand toutes le sont. Certaines lignes sont de simples explications et ne se grisent pas. La flèche vers un champ part quand sa ligne est faite, comme aujourd'hui.

**b. Le compteur.** Vécu : sur « Mettre ta classe en place » déjà fait, « Refaire » (et « Commencer avec ma classe » à la fin de « Découvrir ») mène droit à la bulle 8 sur 8 : `lancer()` part de `premiereNonFaite()` (`js/parcours-classe.js`). On ne peut ni revoir le parcours, ni le montrer à quelqu'un. Décidé : toucher le compteur « N sur M » ouvre la liste des étapes par leur titre ; on y choisit une étape FAITE pour la revoir (on ne saute pas par-dessus une étape non faite) ; « Refaire » rejoue les bulles en visite sur ce qui est déjà réglé, sans rien écrire, avec « Continuer » à la place d'une attente ; cible tactile assez grande pour l'iPad ; ne pas confondre avec les flèches « 1/2 » des pages (qui disparaissent là où une bulle passe à une page). Pour tous les parcours.

**c. Où suis-je, et l'ouverture.** La règle 4 : la ligne « Tu es dans… », le halo sur les entrées du menu, la page ouverte en haut. Vécu aux étapes 7 et 8 de « Mettre ta classe en place » et à l'étape 1 d'« Évaluer » : l'en-tête était hors de l'écran. ⚠ `js/config.js` et `js/navigation.js` sont protégés : lis-les, ne les modifie pas ; si le halo l'exige, laisse-le et dis-le.

**d. La place de la bulle.** Vécu à l'étape 1 d'« Évaluer » : la bulle s'ouvre au centre et cache le texte de la page et le formulaire. Elle se place à côté de ce dont elle parle.

**e. La fin d'un parcours.** La dernière bulle offre « Parcours suivant » et « Terminer », de même poids, et dit : « Pour revoir une étape, touche « 8 sur 8 ». » (le compteur réel).

## Lot 3 : les textes de « Mettre ta classe en place » et la fin de « Découvrir »

Chaque bulle prend la forme des règles 2 à 5. Ajoute la ligne « Tu es dans… » là où la page change. La bulle 7 a une variante d'avant le premier cours : garde-la, dans la même forme.

**Fin de « Découvrir » (validé).** Le bouton « Continuer d'explorer la démo » faisait attendre d'autres bulles. Il devient « Explorer la démo par moi-même » ; la consigne : « Touche « Commencer avec ma classe », ou « Explorer la démo par moi-même ». »

**1. Ton trimestre (validé).**
Aie sous la main le calendrier scolaire de ton collège.
- Choisis la session et l'année (elles serviront à identifier ton trimestre)
- Donne trois dates (elles serviront à bâtir ton calendrier de séances) :
  - le début du trimestre
  - la fin des cours réguliers
  - la fin du trimestre
- Touche « Créer le trimestre »
Le reste du formulaire peut attendre.

**2. Ton cours (proposé ; les deux raisons sont de Grégoire).**
Aie sous la main ton plan de cours.
- Le code du cours (ex. : 601-101-MQ)
- Sa pondération (elle servira à calculer tes heures de cours)
- Sa discipline (elle servira à identifier le matériel que tu partageras)
- Touche « Créer le cours »
Tu donnes plusieurs cours ? Un seul suffit pour l'instant.

**3. Ton profil (proposé ; « institution » validé).**
- Ton prénom et ton nom (ton groupe-cours doit savoir qui le donne)
- Ton courriel et ton institution (ils accompagnent les ressources que tu partageras)
- Touche « Créer le profil »
Le reste du formulaire peut attendre.

**4. Ta classe (proposé), en UNE page.**
Aie sous la main la liste de ton groupe (dans Léa, sur Omnivox : format Excel).
- Colle ta liste ou choisis ton fichier. Une ligne par personne :
  - son DA (il l'identifie partout dans l'application)
  - son numéro de groupe (il servira à ton horaire et à ton groupe-cours)
  - son nom et son prénom
- Vérifie l'aperçu
- Touche « Importer »
Les trois sous-lignes décrivent le format : elles ne se grisent pas. Défauts vécus : après avoir choisi un fichier, les flèches vers la zone de collage et vers « Choisir un fichier » restent (elles partent dès qu'une des deux voies est prise) ; la consigne disait « Confirmer », le bouton s'appelle « Importer N étudiant·es ».

**5. Ton horaire (proposé, non vu par Grégoire).**
Aie sous la main ton horaire.
- Choisis le groupe (l'horaire lui sera lié)
- Nomme l'horaire (ex. : Lun-Mar)
- Pour chaque séance : le jour, le début et la fin (le nombre de périodes s'écrit d'après ces heures ; corrige-le au besoin)
- Touche « Créer l'horaire »

**6. Ton groupe-cours (proposé).** Le novice choisit lui-même dans les quatre listes : ne rien présélectionner (décision de Grégoire : « il faut faire le geste pour apprendre »).
Réunis ce que tu viens de créer :
- ton cours
- ton numéro de groupe
- ton horaire
- toi, comme enseignant·e
- Touche « Créer le groupe-cours » (ton groupe apparaîtra dans l'en-tête de l'application)
La pratique de notation peut attendre.

**7. Prendre les présences (validé ; remplace le titre « Ton premier cours »).**
Ta classe est en place. Ce qui suit, tu le referas à chaque séance.
- Choisis une séance déjà donnée, ou celle d'aujourd'hui (l'application propose la plus récente)
- Note seulement les absences et les retards (tout le monde est présent par défaut)
- Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)

**8. Ta classe d'un coup d'œil (proposé), en UNE page.** Des explications : rien ne se grise.
Tu es dans « Suivi », à l'onglet « Groupe ». Reviens-y avant chaque séance.
- Chaque point blanc est un·e étudiant·e
- La bande « Assiduité » le place selon ses présences : à droite, il vient à ses cours ; s'il glisse vers la gauche, ses absences s'accumulent
- Les bandes « Complétion » et « Performance » sont vides : elles s'allumeront à tes premières évaluations
Puis, selon ce que la personne vient de saisir : « Ce point à l'écart, c'est l'absence que tu viens de noter. » ou « Tout le monde était là : un point s'écartera à la première absence. » Ne jamais faire inventer une absence sur une vraie liste.

## Lot 4 : l'étiquetage de la grille (« Mon matériel », étape 1 d'« Évaluer une première production », carte « Ta grille, pas à pas »)

**a. « Partie » remplace « morceau »** dans TOUS les textes affichés de l'étiquetage (légende, consignes, constats, carte d'aide, bulles), d'un seul coup, avec les accords du féminin. Les noms de code peuvent rester. ⚠ Deux collisions à lever : l'aide de l'étiquette « Sous-total » dit « Le total d'une partie de la grille » : elle devient « Le total d'un groupe de critères » ; et les bulles appellent « section » ce que l'exemple intitule « PARTIE A », « PARTIE B » (« la première section », « la seconde section »). Ne touche pas aux Nouvelles déjà publiées. Liste au rapport les phrases qui changent de tournure, pas seulement de mot.

**b. Deux bulles d'ouverture, avant « Ta grille ».**
*Pourquoi étiqueter (validé, sauf le titre).*
Tu es dans « Conception », à l'onglet « Mon matériel ».
Ici, tu numérises ta grille. Une photo n'en garderait que l'apparence : l'application, elle, doit savoir ce que chaque partie veut dire. C'est toi qui le lui expliques, en posant une étiquette sur chaque partie : critère, niveau, pondération.
Touche « Continuer »
*Tu apprends aussi (proposé, d'après ses mots).*
Ces mots sont les mêmes pour toutes les disciplines, alors que chaque grille est faite à sa façon. En expliquant la tienne, tu découvriras peut-être un critère flou ou un total qui ne tombe pas juste. C'est normal : ici, l'enseignant·e apprend aussi, et l'erreur fait partie du travail.
Touche « Continuer »

**c. La bulle « Ta grille » ne porte plus ses trois boutons** (« Voir le travail complet », « Faire l'exercice soi-même », « Passer à ma grille »), et ne réexplique pas ce que la page dit déjà : elle montre la zone où coller et les deux boutons de la page. La page garde son texte permanent. Les deux boutons de la page sont renommés (validé) : « Voir un exemple de grille étiquetée » et « Étiqueter l'exemple moi-même ».

**d. Devant l'exemple étiqueté, la bulle change (proposé).**
L'exemple étiqueté
- Chaque couleur est une étiquette : la légende, à gauche, les nomme
- Regarde une rangée : le critère en jaune, ses descriptions en bleu, ses points en rose
- Descends voir la grille telle que l'application la comprend
Vérifie les noms des couleurs en clair et en sombre ; s'ils ne tiennent pas dans les deux, remplace la deuxième ligne par une flèche sans nom de couleur.

**e. Devant la grille « telle que l'application la comprendrait » (validé), avec une flèche par ligne.**
La grille, comprise par l'application
- C'est la grille de l'exemple, refaite d'après ses étiquettes
- Ce résumé dit ce que l'application y a trouvé : 4 critères, 4 niveaux de performance, un total de 30 qui tombe juste
- Le résultat d'une copie peut se compter en points, ou se dire par un niveau de performance, d'« Insuffisant » à « Remarquable »
Sur la page, le choix devient « des points » / « des niveaux de performance ». La page ne dit plus qu'UNE fois que l'exemple ne s'enregistre pas : en bas, près du nom.

**f. L'exercice sur l'exemple.** Vécu : cinq sources d'information à la fois ; et après UN critère, UN descripteur et UNE valeur de points, la bulle dit déjà « L'exemple est étiqueté ». Décidé :
- ce message ne s'affiche JAMAIS tant que des parties restent sans étiquette ;
- à tout moment une seule consigne, dans la bulle : le geste suivant, avec sa flèche ; les trois pas généraux se lisent une fois au début, puis se replient derrière un lien « Comment étiqueter ? » ; la page ne garde que l'état (l'étiquette en main et sa définition) ;
- la bulle mène dans un ordre fixe, une étiquette à la fois (titre, sections, critères, éléments observables, niveaux de performance, descripteurs, points, total), chacune grisée une fois posée, sur la première SECTION entière de l'exemple (ses deux critères complets) ;
- puis (validé) : « La première section est faite / L'application ne devine rien : sur ta propre grille, chaque partie recevra son étiquette de ta main. / – Continue avec la seconde section, si tu veux t'exercer encore / – Ou touche « Voir la suite de l'exemple » : elle est déjà préparée ». Ce bouton est sur la page ; il montre le travail préparé d'avance, il ne dit jamais que l'application étiquette.
La carte « Ta grille, pas à pas », hors parcours, suit les mêmes règles.

## Lot 5 : deux mesures, sans rien changer (seulement si les lots 1 à 4 sont finis)

**a. Le premier chargement à froid.** Vécu : environ 50 secondes en fenêtre privée entre l'en-tête seul et l'accueil de la vue simple, par paliers ; à un palier, les deux menus (vue étendue et vue simple) s'affichent ensemble ; mêmes paliers sur un aperçu sans Cloudflare. `index.html` charge 250 scripts synchrones, 13,8 Mo. Chronomètre un chargement à froid, dis où part le temps (réseau, analyse, exécution), et propose deux ou trois voies chiffrées. Aucun correctif.
**b. La durée du verdict complet.** Grégoire : la suite Playwright dure maintenant 2 heures, « interminable », il croyait le problème réglé. À partir des résultats du dernier verdict, dis où part le temps (par fichier, par projet, ce que `verdict-en-morceaux.mjs` change) et propose des voies chiffrées. Aucun changement.

## Hors périmètre (ne pas commencer ; inscrit côté Cowork)

Les deux temps (`lot/deux-temps-modeles` reste à part ; `main` y sera mis plus tard) : le modèle de « Mettre ta classe en place », le panneau à deux états, le texte en quatre temps, le préalable d'« Évaluer ». Les journées sans cours en période. La relève entre collègues. L'horaire d'un cours donné tous les jours. #1277.

## Ce qui reste vrai après ce lot, à dire au rapport

Sur la version en ligne, « Évaluer une première production » n'avance toujours qu'avec sa propre grille : seul le modèle des deux temps lève ce blocage.

## Rapport, pour Cowork (un bloc de code, trente lignes au plus)

Le commit de chaque lot ; ce qui est fait, ce qui est laissé et pourquoi ; tes suppositions ; les textes que tu as dû écrire ou retoucher, un par ligne ; les bancs et leurs break-tests ; ce que tu as fait du stock ; les deux mesures ; le numéro de la PR et son aperçu ; et les gestes à vérifier par Grégoire sur l'iPad, dix au plus.
