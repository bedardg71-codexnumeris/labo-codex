/* =================================================================
   LE MOTEUR DES PARCOURS — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, « Le principe, pour les deux ».

   Un parcours n'est pas une visite : la personne fait le geste elle-même sur ce qui est
   désigné. Le moteur pose (lot « Les flèches des parcours », 10 nov. 2026,
   plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md ; le voile percé de trous est retiré,
   la page reste lisible et touchable partout) :
   · une flèche manuscrite, à l'encre du texte, de la bulle vers ce dont elle parle (les zones) ;
   · une pulsation dans l'orange de l'aide autour de ce qu'il faut toucher (le contour) : dans un
     parcours, l'orange veut dire « ce que tu toucheras » ;
   · une mise en évidence de la section actuelle, dans le menu ou la barre d'onglets du contour ;
   · une bulle au bord de l'écran le plus éloigné de ce dont elle parle, sans couvrir ses zones ni le
     contour (Grégoire, 11 nov. 2026, sur l'iPad : la flèche fait le lien) : titre, « n sur N », poignée
     pour la déplacer, texte, geste, boutons, lien de sortie. Elle prend le focus et s'annonce (aria-live poli).
   LES FLÈCHES VONT À CE QUE NOMME LA BULLE (11 nov. 2026) : l'élément précis (la ligne, pas la carte), et la
   section dans le menu quand la bulle présente une section. CE QU'IL FAUT TOUCHER REÇOIT SA FLÈCHE DÈS L'OUVERTURE
   DE L'ÉTAPE (Grégoire, 11 nov. 2026, 11 h 45, quatrième aperçu : « Ta compétence », « Pourquoi un codex »,
   « Ta grille » restaient sans flèche jusqu'au premier toucher) : une étape qui a un contour n'est jamais sans flèche ;
   les sujets qui ne sont pas le contour gardent la leur. Une étape qui ne nomme QUE ce qu'il faut toucher le déclare
   (`nommeLeContour`) : la flèche va alors au contour, et à lui seul ; ses zones, la bulle les évite encore.
   NI FLÈCHE NI PULSATION SUR CE QUI NE SE VOIT PAS (`seVoit`, 11 nov. 2026, capture 25) : ce qu'une palette flottante,
   une fenêtre ou la bulle couvre en entier ; pas de flèche vers un sujet tout entier hors de l'écran (`aLEcran`,
   capture 31). Ce qu'il faut toucher qui change dans l'étape (le geste suivant) est amené à l'écran (`suivreContour`).
   LES BOUTONS QUI ATTENDENT (Grégoire, 11 nov. 2026, 12 h 05, captures 32 à 34 : « je ne sais pas ce qu'il faut faire
   pour voir le bouton « Continuer » ») : un bouton de bulle qui attend une condition le déclare (`attend`, qui rend la
   phrase de ce qui manque, ou rien) ; il reste visible, inactif tant qu'elle manque, la phrase dessous ; le contour de
   l'étape va à ce qui manque.
   L'ÉCRAN CHANGE DANS UNE ÉTAPE (11 nov. 2026, capture 18 : « Actions › Évaluer » touché, l'écran d'évaluation ouvert,
   la bulle restait à sa page 1/2, qui redisait de toucher « Actions › Évaluer », et le premier critère, sous le bas de
   l'écran, portait le halo sans qu'on le voie) : une étape à plusieurs écrans dit, par un passage de son texte, de quoi
   parle l'écran visible (`pageQuiDit`). Quand ce passage change, la bulle passe à la page qui le porte, et ce que
   l'étape désigne est amené dans la vue, une fois, comme à l'entrée de l'étape.
   L'AVIS (11 nov. 2026, capture 19) : une phrase sous le texte, que l'étape pose quand la page n'est pas dans l'état
   qu'elle attend (`avis`) ; elle part quand l'état revient. Le texte de l'étape, lui, ne change pas.
   LA LIGNE DU GESTE SUIT L'ÉTAT (12 nov. 2026, la dissection sur l'iPad : « nommer, pointer, passer par les étapes une
   après l'autre ») : un `geste` qui change pendant l'étape (un getter : « Ta grille » suit le premier manque de la
   dissection) est relu à chaque passage de la sonde ; changé, il remplace la ligne du geste et s'annonce. La bulle n'est
   pas refaite : ni focus déplacé, ni page tournée.
   LES FORMULAIRES (Grégoire, 11 nov. 2026, 8 h 26) : dans une étape qui montre un formulaire (`formulaire`), les
   flèches vont aux champs obligatoires (astérisque rouge `.champ-requis`, `required`, `aria-required`) ENCORE VIDES,
   une par champ, sans fusion ni plafond ; chacune disparaît quand son champ est rempli ; quand il n'en reste aucun,
   les flèches vont à ce que l'étape déclare dans `fleches` (« Ta production » : l'échelle d'une grille par niveaux
   restée à « Aucune », 11 nov. 2026, 9 h 35) ; le bouton à toucher a la sienne dès l'ouverture (la règle du contour). La bulle évite TOUS les champs obligatoires, remplis ou non : elle ne saute pas
   d'un coin à l'autre pendant qu'on remplit, et elle ne couvre pas un champ qu'on voudrait corriger.
   LE ZOOM AU PINCEMENT (11 nov. 2026, second essai sur l'iPad : « la bulle se déplace un peu partout ») : sous
   Safari iPad, innerWidth × innerHeight suivent la partie VISIBLE de la page pendant le zoom, alors que la bulle, le
   halo et les flèches sont fixés dans la page entière. La sonde replaçait donc la bulle à chaque image du pincement
   (et la croyait sur un téléphone sous 500 px de large). Pendant un pincement (deux doigts posés) et tant que la page
   reste zoomée (`visualViewport.scale` ≠ 1), le moteur NE REPLACE RIEN : la bulle garde sa place, la hauteur gardée est
   celle d'avant le zoom ; le halo et les flèches suivent leurs cibles. Revenue à l'échelle 1, la sonde la replace
   comme avant. Playwright ne pince pas : jugé sur l'iPad.
   LA LARGEUR (12 nov. 2026, 12 h 54, l'iPad en paysage : « la carte […] semble bloquer au centre ») : elle se lit sur la
   mise en page (`document.documentElement.clientWidth`, `largeurPage`), jamais sur innerWidth ni sur un écran gardé —
   la place de la bulle, son glisser, la forme de téléphone et la couche des flèches. Banc : bulle-largeur-ipad-2026-11-12.
   LES COORDONNÉES : la couche des flèches est fixée en (0, 0) et dimensionnée en px sur
   la largeur de la mise en page × innerHeight à chaque passage, SANS viewBox : le même repère que le contour (des px
   lus par getBoundingClientRect). Une sentinelle Vitest l'exige (le voile, lui, était en 100vh).
   Une étape avance quand l'état attendu est ATTEINT (`atteint()`), quel que soit le chemin :
   le moteur le sonde, il n'écoute pas le toucher d'un bouton précis.

   LES LIGNES D'UNE BULLE (essai novice de Grégoire, 14 nov. 2026 ; plans de travail/CONSIGNE-2026-11-14-essai-novice.md,
   règles 2 et 3) : une étape peut porter, à la place d'un paragraphe, une LISTE de lignes (`lignes`), une par geste.
   Une ligne liée à ce qui la rend faite (`champs` : ses champs remplis ; `fait` : une condition) se grise, avec un
   crochet, quand son geste est fait ; elle ne disparaît pas, la bulle ne bouge pas. Des sous-lignes (`sous`) se grisent
   une à une, la ligne mère quand toutes le sont. Une ligne sans rien qui la rende faite est une explication : elle ne
   se grise pas. Une `note` est une phrase hors de la liste (le document à avoir sous la main, ce qui peut attendre).
   La consigne (`geste: true`) est la DERNIÈRE ligne de la liste, dans la couleur du geste. La flèche vers un champ part
   quand sa ligne est faite. Une bulle à lignes tient en une page : ni découpe, ni « ← 1/2 → ».
   LA FLÈCHE DES GESTES (« Nous faisons » de « Mettre ta classe en place », 19 nov. 2026 ; règle de Grégoire du 18 nov. :
   « seuls les gestes sont marqués : une flèche pour un geste à faire, un crochet quand il est fait ») : une ligne de
   premier niveau qui se fait (`champs`, `fait`, ou des sous-lignes qui se font) porte la flèche, sans le gras de la
   consigne (`parcours-bulle-ligne--a-faire`) ; faite, le crochet. Ses sous-lignes n'en portent pas. Avant ce lot, seule
   la consigne avait sa flèche : la règle du 18 nov. avait été posée sur « Je regarde », où la consigne est le seul geste.
   La parenthèse qui termine une consigne (« Touche « Créer le groupe-cours » (il apparaîtra dans l'en-tête de
   l'application) ») sort du gras (`parcours-bulle-ligne-precision`) : les bulles validées le 19 nov. l'écrivent ainsi.
   OÙ SUIS-JE (règle 4) : une étape où la page change le déclare (`lieu`). Sa première ligne dit « Tu es dans « X », à
   l'onglet « Y ». » (les noms sont LUS dans le menu, jamais recopiés), les deux entrées du menu reçoivent le halo de la
   section actuelle, et la page s'ouvre EN HAUT, navigation visible : rien n'y est amené dans la vue à l'ouverture.
   LE COMPTEUR (règle du lot 2b) : « n sur N » est un bouton. Il ouvre la liste des étapes par leur titre ; on y choisit
   une étape FAITE (ou celle où l'on est rendu) pour la revoir, jamais une étape au-delà. Une étape revue dont l'état
   est déjà atteint se joue EN VISITE : rien n'avance tout seul, rien ne s'écrit, et la bulle offre « Continuer » à la
   place d'une attente. La visite cesse à la première étape qui reste à faire.
   EN VISITE, RIEN N'EST DÉSIGNÉ QUI ÉCRIT (15 nov. 2026 ; vécu par Grégoire sur l'iPad : la bulle 7 de « Mettre ta
   classe en place », rejouée, entourait « Déverrouiller la saisie » en disant « Touche « Verrouiller la saisie » », et
   un toucher a déverrouillé une vraie séance). Une étape en visite ne pose ni contour ni flèche sur un contrôle qui
   écrit dans les données, et sa consigne devient « Tu revois ce parcours : rien n'est à refaire. Lis, puis touche
   « Continuer ». » ; ses autres lignes restent. « Un contrôle qui écrit » : tout élément qu'un toucher actionne (un
   bouton, un champ, une liste, une case, un `data-action`), qu'il le soit, qu'il soit dedans ou qu'il en contienne
   un — sauf dans le menu de navigation (la section, l'onglet), qui ne fait que changer de page. Le moteur ne sait pas
   ce qu'un bouton écrit : dans le doute, il ne le désigne pas (`ecritDansLesDonnees`).
   CE QUE LA BULLE ÉVITE EST RÉDUIT D'ABORD (15 nov. 2026 ; même essai : la page gelait à l'étape 7). La recherche d'une
   place essayait (6 Z + 3)² places contre Z rectangles : le cube de Z, et l'étape 7 en déclare un par cellule de la
   saisie (184 à 36 personnes : une trentaine de secondes par passage). `reduireEvites` retire les doublons, fond ce
   qui forme un même bloc (les cellules d'une colonne), puis, au-delà de EVITES_MAX, fond de proche en proche ; les
   abscisses et les ordonnées essayées sont dédoublonnées. Les cibles des flèches d'une étape en lignes qui se
   touchent n'en font qu'une : une flèche vers la colonne, pas une par rangée.
   CE QU'UNE LIGNE MONTRE (15 nov. 2026, la règle de la Modélisation) : une ligne d'explication peut désigner ce dont
   elle parle (`montre`) : une flèche y va, la bulle l'évite, et la ligne ne se grise pas pour autant.
   LES LIGNES QUI SUIVENT L'ÉCRAN (`lignesVivantes`, même date) : une étape dont la liste change pendant qu'elle est à
   l'écran (la Modélisation, en trois temps : « Remplir », ce qui vient d'apparaître, puis le bouton
   de la page) le déclare. Ses lignes et ses boutons sont relus à chaque passage de la sonde ; changés, la bulle est
   récrite sur place, sans changer d'étape ni rejouer `avant`, et sa consigne s'annonce.
   LA SECONDE FORME (Grégoire, 18 nov. 2026, essai sur l'iPad : « ça nous incite à ne pas lire le contenu qui suit » ;
   tranché par Cowork) : une étape dont la bulle change de forme en cours de route (`secondeForme()` vrai : après
   « Remplir ») ne garde que son titre et son compteur. L'objectif, la confirmation et la phrase du lieu, qui
   ouvraient la première forme, disparaissent ; la bulle s'ouvre sur ses lignes nouvelles, puis le geste à faire.
   L'OBJECTIF, LA CONFIRMATION, LA SECTION, LE TRIANGLE (16 nov. 2026 ; demandes de Grégoire du 15 nov., relais de Cowork ;
   plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md, règles a à e) :
   a. La première bulle d'un parcours porte son OBJECTIF (`objectif`, sur la définition) : sous le titre, avant tout.
   b. Une étape qui parle d'une SECTION de la page la déclare (`section`). À l'ouverture, la page y défile par une
      transition visible (douce ; d'un coup sous « mouvement réduit »), son nom juste sous l'en-tête. La bulle reste
      cachée tant que la page bouge (`est-en-attente`) et ne paraît qu'ensuite, à côté de la section : entre deux
      places qui couvrent aussi peu ce que la bulle désigne (ses champs, son bouton), elle prend celle qui couvre le
      moins la section (`placerLoin`, ses « secondaires ») ; et jamais le nom de la section, pesé comme le contour.
      Une section plus haute que l'écran : la bulle en couvre une partie, hors de ses champs désignés.
      Ouvrir la section (un accordéon) reste l'affaire de `avant`, qui connaît la page.
   c. Le NOM de cette section reçoit le halo des entrées du menu (`parcours-section-actuelle`), tant que l'étape dure.
      Avec `nommeLaSection`, la phrase du lieu la dit : « Tu es dans « X », à la section « S » » quand la page vient de
      changer (`lieu`), « Tu es dans la section « S » » sinon. Le nom est LU dans la page, jamais recopié.
      `lieuSuite` : ce qui suit la phrase du lieu, dans la même phrase (« : c'est là que… ») ou dans la suivante.
   d. Le compteur « n sur N » porte un TRIANGLE : couché quand la liste des étapes est fermée, pointe en bas quand elle
      est ouverte (css/parcours.css, sur `aria-expanded` ; le texte du bouton reste « n sur N »).
   e. Une bulle peut s'ouvrir sur une ligne qui CONFIRME le geste précédent en le nommant (`confirme` : « C'est fait :
      le cours est créé. »). Avant la phrase du lieu. Ce n'est pas un éloge : le moteur n'y ajoute rien.
   LA FIN (lot 2e) : la dernière bulle d'un parcours dit « Pour revoir une étape, touche « N sur N ». » ; quand elle
   n'offre que « Terminer », elle offre aussi « Voir le parcours N », de même poids (aucun bouton mis en avant).
   Sa consigne suit ses boutons : « Touche « Terminer » » y devient « Touche « Voir le parcours N », ou « Terminer » ».
   RIEN N'EST LANCÉ D'OFFICE (Grégoire, 20 nov. 2026 ; plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3) :
   « Voir le parcours N » ferme la bulle et ouvre le panneau « Assistance » devant ce parcours, ses boutons
   « Je regarde » et « Nous faisons » ; la bulle le nomme d'abord : « Suite suggérée : le parcours N, « Nom ». »,
   après la phrase de la suite. Dernier parcours : ni ligne ni bouton.
   L'ENTRÉE (même consigne, A1 et A2) : la première bulle porte, en petit, au-dessus du titre, « Parcours N · Nom ·
   Je regarde » (ou « Nous faisons »), puis la phrase de la poignée.

   APRÈS L'ESSAI SUR L'IPAD (Grégoire, 16 nov. 2026 ; plans de travail/CONSIGNE-2026-11-16-essai-ipad.md) :
   · LA FIN D'UN PARCOURS QUI A SON OBJECTIF (`objectifAtteint`, sur la définition) : « Pour revoir une étape… », en
     petit ; « Objectif atteint : … » dans la forme de l'objectif (en gras, entre deux filets) ; puis « Chaque parcours
     a son objectif. C'est toi qui choisis la suite. », en ligne simple, la dernière avant les boutons.
   · LA PREMIÈRE BULLE d'un parcours dit, en petit, qu'elle se déplace par sa poignée (pas sur téléphone : la bulle
     n'y a pas de poignée) ; au-dessus du titre depuis le 20 nov. 2026 (voir « L'ENTRÉE »).
   · LE NOM DE LA SECTION reçoit UNE flèche tant que la bulle qui le dit ne désigne rien d'autre (`nomDeSectionAMontrer`).
   · LA BULLE NE COUVRE PAS CE DONT ELLE PARLE : une étape déclare dans `aussiEviter` ce qu'elle ne couvre que faute
     de mieux (le nom d'une bande, chacun de ses points), pesé comme le contour.
   · AVANT LE FILET : une bulle plus haute que l'écran utile s'élargit (`parcours-bulle--elargie`, 520 px).
   · AVANT DE COUVRIR CE QU'ELLE ÉVITE : elle s'élargit aussi, si cette forme n'en couvre plus rien (`placerBulle`).
   · L'espace insécable devant « ; : ? ! » (`typographier`), pour toutes les bulles.
   · UNE CIBLE ANIMÉE (les points de la bande) compte, pour la place de la bulle, par tout son trajet (`trajetDe`, 19 nov.
     2026) : la bulle ne bouge plus au rythme de l'oscillation ; seules ses flèches suivent la cible.
   · Le triangle du compteur est celui des sections de l'application, à leur taille (css/parcours.css).

   Une étape :
     { titre, texte?, geste?, centre?: bool,
       lignes?: () => [{ texte, champs?: () => Element[], fait?: () => bool, montre?: () => Element[], sous?: [ligne],
                         note?: bool, geste?: bool }],
       lignesVivantes?: bool,      // la liste et les boutons changent dans l'étape : relus à chaque passage
       lieu?: bool | () => bool,   // la page change à cette étape : « Tu es dans… », le halo au menu, la page en haut
       amener?: bool,              // avec `lieu` : ce que l'étape montre est amené sous l'en-tête si la bulle n'y tient pas
       section?: () => Element,    // la section de la page dont parle la bulle : la page y défile, son nom a le halo
       nommeLaSection?: bool,      // la phrase du lieu dit la section ; lieuSuite?: string, ce qui suit cette phrase
       confirme?: string | () => string, // la première ligne : le geste précédent, nommé (« C'est fait : … »)
       secondeForme?: () => bool,  // la bulle a changé de forme dans l'étape (après « Remplir ») : voir « LA SECONDE FORME »
       avant?: async () => void,   // place la page (idempotent : sert aussi à la reprise)
       zones?: () => Element[],    // ce dont parle la bulle (la flèche y va)
       fleches?: () => Element[],  // parmi les zones, celles où vont les flèches (groupées) ; les autres, la bulle les
                                   // évite seulement (les noms de la saisie des présences, qu'il faut voir pour noter)
       formulaire?: () => Element, // l'étape montre un formulaire : ses zones sont ses champs obligatoires, une flèche
                                   // par champ ENCORE VIDE ; tous remplis, une par élément de `fleches`
       contour?: () => Element,    // où toucher (la pulsation, et une flèche dès l'ouverture)
       nommeLeContour?: bool | () => bool, // la bulle ne nomme que ce qu'il faut toucher : la flèche va au contour, seule
       pageQuiDit?: () => string,  // un passage du texte, celui dont parle l'écran visible (null : rien ne change)
       avis?: () => string,        // une phrase sous le texte, tant que la page n'est pas dans l'état attendu
       aussiEviter?: () => Element[], // ce que la bulle ne couvre pas non plus, pesé comme le contour, sans flèche
                                   // (les boutons du geste suivant dans une fenêtre que la bulle doit couvrir)
       atteint?: () => bool,       // l'état qui fait avancer
       boutons?: [{ libelle, primaire?, action, attend?: () => string }], // attend : ce qui manque (rien : actif)
       complement?: () => [{ titre?, texte }], // des consignes à la suite du texte, en pages (voir « LE COMPLÉMENT »)
       sansSortie?: bool }
   Une définition : { id, etapes, objectif?: string (dit par la première bulle), lienSortie?, sansRang?: bool (pas de « n sur N » : une carte qui n'est pas un parcours),
       sansEchap?: bool (Échap reste à la page : la carte ne se ferme que par son lien de sortie) }.
   LE COMPLÉMENT (lot « La carte d'aide dans Apporter mon matériel », 13 nov. 2026) : les consignes d'une page entrent
   dans la bulle, à la suite du texte de l'étape, comme des pages de plus (« ← 2/3 → ») : une liste numérotée, un item
   seul sans numéro. Elles suivent l'écran : relues à chaque passage de la sonde ; changées, la découpe est refaite, la
   bulle passe à leur première page et les annonce. Une page de consignes ne dépasse pas LIGNES_PAR_PAGE lignes quand
   ses items le permettent : la bulle n'est jamais plus haute qu'avec son texte seul.
   LE SIGNAL : au lancement et à la fermeture, `document` reçoit « parcoursMoteur » ({ actif }) ; la carte d'une page
   s'y règle (elle se retire devant un parcours, revient après lui).
   API : window.ParcoursMoteur.lancer(def, { depuis, surEtape, surQuitter, surEchap, verifier,
           visite?: bool (jouer en visite ce qui est déjà réglé), acquis?: n (l'étape la plus loin déjà faite) }),
         .fermer(), .actif(), .etapeCourante(), .joue(def), .surTelephone().

   LA BULLE SUR TÉLÉPHONE (lot du 9 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-bulle-sur-telephone.md) :
   · jusqu'à 500 px de large (SEUIL_TELEPHONE, la largeur de la fenêtre et non l'appareil : un iPad
     en écran partagé étroit est traité comme un téléphone), la bulle se range au bord de l'écran,
     pleine largeur. Une étape qui désigne quoi toucher sur la page (un contour) l'ouvre REPLIÉE
     (titre et « n sur N ») ; une étape dont le geste est dans la bulle (« Continuer ») ou sans
     rien d'éclairé l'ouvre dépliée. La tête de la bulle est un bouton :
     un toucher déplie, un toucher replie ; repliée, toute la bulle est ce bouton.
   · Repliée ou dépliée, elle ne couvre pas la zone éclairée : en bas par défaut (au début d'une
     étape et à chaque dépliement, le moteur fait défiler la page s'il le faut, pendant REGLAGE_MS
     et jusqu'au premier geste de la personne) ; en haut si la zone occupe le bas ; si la zone prend
     tout l'écran, elle en couvre une partie, au mieux sans toucher au contour, et son texte défile.
   · Le témoin « Enregistré » (en bas à gauche) passe au-dessus d'une bulle rangée en bas
     (--parcours-reserve-bas, lue par css/parcours.css).
   LE FILET DE TOUTES LES BULLES (ajout du 9 nov., 9 h 51) : à toutes les largeurs, une bulle plus
   haute que l'espace disponible (fenêtre courte, clavier ouvert) s'y limite ; seul son texte
   défile, le titre, « n sur N », le geste et les boutons restent visibles. Une bulle qui tient
   reste telle quelle.
   LES BULLES EN PAGES (lot du 9 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-bulles-en-pages.md) :
   · un texte de plus de LIGNES_PAR_PAGE lignes, à la largeur de la bulle, se coupe en deux pages (trois
     au plus si une page dépasse encore), à la fin d'une phrase hors d'une citation entre guillemets, au
     plus près du milieu. Aucun mot ne change ; sans fin de phrase où couper, le texte reste entier.
   · Sous le texte, « ← 1/3 → » (décision de Grégoire, 9 nov., 17 h 55 : la tête ne garde que « n sur N ») ;
     au clavier, les flèches gauche et droite quand la bulle a le focus. Au changement de page, le lecteur
     d'écran entend « page 2 de 3 », sans le texte de l'étape.
   · Toutes les pages restent dans le texte de la bulle, dans l'ordre : celles qu'on ne voit pas sont
     cachées à l'œil (u-lecteur-ecran), pas au lecteur d'écran ; l'annonce dit le texte entier.
   · La ligne du geste, les boutons et le lien de sortie ne bougent pas ; l'étape avance sur l'état
     atteint, quelle que soit la page. Le filet (le texte qui défile) reste le dernier recours.
   · La découpe suit la largeur de la bulle : un parcours qui la change (une sonde d'étape) la refait
     dans le même passage de la sonde, la page affichée gardée si elle existe encore.
   ================================================================= */
(function () {
    'use strict';

    var SONDE_MS = 120;
    var MARGE = 8;
    var ECART = 12;
    var FLECHE_MIN = 24;       // en deçà, une flèche ne se lit pas : elle n'est pas tracée
    var FLECHE_RETRAIT = 6;    // la pointe s'arrête à quelques px du bord de la cible
    var FLECHES_MAX = 3;       // au-delà de trois cibles, une seule flèche vers leur union
    var POIDS_CONTOUR = 10000; // couvrir ce qu'il faut toucher coûte dix mille fois plus : seulement faute de mieux
    var FUSION = 20;           // des cibles à moins de 20 px (les champs d'une même rangée) n'en font qu'une
    var PAS_CLAVIER = 16;      // un pas de la poignée, au clavier
    var SEUIL_TELEPHONE = 500; // px de large de la fenêtre : en deçà, la bulle prend sa forme de téléphone
    var REGLAGE_MS = 1200;     // sur téléphone, le temps où le moteur peut faire défiler pour ranger la bulle en bas
    var LIGNES_PAR_PAGE = 10;  // au-delà, à la largeur de la bulle, le texte se coupe en pages
    // LA FIN : la consigne de la dernière bulle quand elle offre ses deux suites. Sa seule écriture (voir consigneDeLaFin).
    // (20 nov. 2026 : le bouton s'appelle « Voir le parcours N » ; son libellé vient du panneau, `Assistance.suiteDe`.)
    function consigneDesDeuxSuites(suite) { return 'Touche « ' + suite.libelle + ' », ou « Terminer »'; }
    // EN VISITE (15 nov. 2026 ; texte de Grégoire, relais de Cowork) : la consigne d'une étape revue dont le geste écrit.
    // LA FIN D'UN PARCOURS QUI A SON OBJECTIF (Grégoire, 16 nov. 2026, essai sur l'iPad) : sous « Objectif atteint : … »,
    // en ligne simple, juste au-dessus des boutons. Écrite ici seulement.
    var PHRASE_DE_LA_SUITE = 'Chaque parcours a son objectif. C\'est toi qui choisis la suite.';
    // LA PREMIÈRE BULLE de chaque parcours, en petit (Grégoire, 16 nov. 2026) ; AU-DESSUS DU TITRE depuis le 20 nov. 2026,
    // sous la ligne qui nomme le parcours (`ligneDuParcours`). Pas sur téléphone : la bulle n'y a pas de poignée.
    var PHRASE_DE_LA_POIGNEE = 'Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.';
    var PHRASE_VISITE = 'Tu revois ce parcours : rien n\'est à refaire. Lis, puis touche « Continuer ».';
    // Un contrôle : ce qu'un toucher actionne (voir « EN VISITE, RIEN N'EST DÉSIGNÉ QUI ÉCRIT »).
    var CONTROLES_QUI_ECRIVENT = 'button, input, select, textarea, [contenteditable=""], [contenteditable="true"], [data-action], [data-on-change], [role="button"]';
    var MENU_DE_NAVIGATION = '.navigation-principale, .sous-navigation';
    var JOINT = 2;             // deux rectangles à moins de 2 px l'un de l'autre se touchent (les cellules d'un tableau)
    var EVITES_MAX = 24;       // au-delà, ce que la bulle évite est fondu de proche en proche (voir `reduireEvites`)
    var PAGES_MAX = 3;

    // PROPOSÉ (10 nov. 2026, à valider par Grégoire) : le nom de la poignée pour le lecteur d'écran.
    var LIBELLE_POIGNEE = 'Déplacer la bulle';

    var etat = null; // { def, i, opts, timer, elements, enTransition }

    function visible(el) {
        if (!el || !el.isConnected) return false;
        var r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        var s = getComputedStyle(el);
        return s.visibility !== 'hidden' && s.display !== 'none';
    }

    function premierVisible(liste) {
        for (var k = 0; k < liste.length; k++) {
            var el = typeof liste[k] === 'string' ? document.querySelector(liste[k]) : liste[k];
            if (visible(el)) return el;
        }
        return null;
    }

    function mouvementReduit() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function rectsDe(els) {
        return (els || []).filter(visible).map(function (el) { return el.getBoundingClientRect(); });
    }

    var ECHANTILLONS_DU_TRAJET = 8;   // un multiple de 4 : les quarts d'un cycle, où `float-vertical` a ses extrêmes

    /**
     * LA PLACE D'UNE CIBLE ANIMÉE EST TOUT SON TRAJET (19 nov. 2026, la bulle 1 de « Découvrir » sur l'iPad couché).
     * Les points de la bande oscillent sans arrêt (`float-vertical`). Placée à chaque passage de la sonde d'après leur
     * rectangle du moment, la bulle sautait d'une place libre à l'autre au rythme des points : deux places qui ne
     * couvrent rien se départagent par la distance (`vautMieux`), et cette distance oscillait avec eux (mesuré à
     * 1180 × 656 : x = 217 puis 322, toutes les trois secondes). Pour la PLACE de la bulle, une cible animée vaut
     * l'union de ses rectangles sur un cycle : l'animation est avancée à chaque huitième de son cycle, lue, puis
     * rendue à son temps, dans la même tâche (rien ne se peint entre deux). Les FLÈCHES, elles, suivent la cible où
     * elle est (`rectsDe`). Hors téléphone seulement (voir `placerSelonEtape`). Banc : tests/integration/bulle-fixe-2026-11-19.spec.js.
     */
    function trajetDe(el) {
        var vive = el.getBoundingClientRect();
        var anims = el.getAnimations ? el.getAnimations().filter(function (a) {
            if (a.playState !== 'running' || !a.effect || (window.CSSTransition && a instanceof window.CSSTransition)) return false;
            var d = a.effect.getComputedTiming().duration;
            return typeof d === 'number' && isFinite(d) && d > 0;
        }) : [];
        if (!anims.length) return vive;
        var t = { left: vive.left, top: vive.top, right: vive.right, bottom: vive.bottom };
        anims.forEach(function (a) {
            var temps = a.currentTime, delai = a.effect.getTiming().delay || 0, duree = a.effect.getComputedTiming().duration;
            for (var k = 0; k < ECHANTILLONS_DU_TRAJET; k++) {
                a.currentTime = delai + k * duree / ECHANTILLONS_DU_TRAJET;
                var r = el.getBoundingClientRect();
                t.left = Math.min(t.left, r.left); t.top = Math.min(t.top, r.top);
                t.right = Math.max(t.right, r.right); t.bottom = Math.max(t.bottom, r.bottom);
            }
            a.currentTime = temps;
        });
        return t;
    }

    /** Ce que la bulle évite, pour choisir sa place : chaque cible animée y vaut tout son trajet (`trajetDe`). */
    function rectsDePlace(els) {
        return (els || []).filter(visible).map(trajetDe);
    }

    var CONTROLES = 'input, select, textarea';

    /**
     * Les champs obligatoires visibles d'un formulaire, dans l'ordre du document : `required`, `aria-required`, ou
     * une astérisque rouge (`.champ-requis`) visible dans leur étiquette (le contrôle nommé par `for`, sinon le
     * premier de l'étiquette ou de son conteneur).
     */
    function champsObligatoires(form) {
        if (!visible(form)) return [];
        var liste = [];
        var ajouter = function (c) { if (c && !c.disabled && visible(c) && liste.indexOf(c) === -1) liste.push(c); };
        [].forEach.call(form.querySelectorAll('[required], [aria-required="true"]'), ajouter);
        [].forEach.call(form.querySelectorAll('.champ-requis'), function (a) {
            var lab = visible(a) ? a.closest('label') : null;
            if (!lab) return;
            var c = lab.htmlFor ? document.getElementById(lab.htmlFor) : lab.querySelector(CONTROLES);
            ajouter(c || (lab.parentElement ? lab.parentElement.querySelector(CONTROLES) : null));
        });
        return liste.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
    }

    function champVide(c) {
        if (c.type === 'file') return !(c.files && c.files.length);
        if (c.type === 'checkbox' || c.type === 'radio') return !c.checked;
        return String(c.value == null ? '' : c.value).trim() === '';
    }

    /**
     * LE NOM DE LA SECTION (Grégoire, 16 nov. 2026, essai sur l'iPad) : tant que la bulle qui nomme sa section ne
     * désigne rien d'autre (avant « Remplir » : ni champ, ni bouton de la page), UNE flèche va de la bulle au nom
     * encadré. Dès qu'un champ ou le contour est désigné, elle leur laisse la place ; le cadre, lui, reste.
     * @param {number} dejaDesignes - ce que les lignes et l'étape désignent déjà
     * @returns {Element[]} le nom de la section, ou rien
     */
    function nomDeSectionAMontrer(etape, dejaDesignes) {
        if (dejaDesignes || !etape.nommeLaSection || contourDe(etape)) return [];
        var s = sectionDe(etape);
        return s && s.tete && visible(s.tete) ? [s.tete] : [];
    }

    /**
     * Ce que l'étape désigne : `zones` (ce que la bulle évite) et `fleches` (où vont les flèches ; `null` : les zones).
     * `une` : une flèche par élément, sans fusion ni plafond (une étape à formulaire : ses champs obligatoires, et les
     * flèches à ceux qui sont encore vides) ; sinon les cibles sont groupées.
     */
    function designe(etape) {
        var zones = etape.zones ? (etape.zones() || []).filter(Boolean) : [];
        var n = etape.nommeLeContour;
        var auContour = typeof n === 'function' ? !!n() : !!n;
        // (Une étape à plusieurs façons peut ne rendre aucune ligne dans l'une d'elles : elle garde alors ses flèches d'avant.)
        var sesLignes = etape.lignes ? lignesDeLEtape(etape) : [];
        if (sesLignes.length) {
            // Les champs de ses lignes : la bulle les évite tous ; une flèche par champ encore vide d'une ligne à faire,
            // et une vers chaque élément que l'étape déclare dans `fleches`.
            var tous = [], aFaire = [];
            (function lire(liste) {
                liste.forEach(function (l) {
                    var cs = champsDe(l);
                    var faite = ligneFaite(l);
                    cs.forEach(function (c) {
                        if (tous.indexOf(c) === -1) tous.push(c);
                        if (!faite && champVide(c) && aFaire.indexOf(c) === -1) aFaire.push(c);
                    });
                    // Ce qu'une ligne montre : évité par la bulle, et sa flèche, que la ligne se fasse ou non.
                    montresDe(l).forEach(function (c) {
                        if (tous.indexOf(c) === -1) tous.push(c);
                        if (aFaire.indexOf(c) === -1) aFaire.push(c);
                    });
                    if (l.sous) lire(l.sous);
                });
            })(sesLignes);
            var suite = etape.fleches ? (etape.fleches() || []).filter(Boolean) : [];
            suite = suite.concat(nomDeSectionAMontrer(etape, aFaire.length + suite.length));
            return { zones: tous.concat(zones, suite), fleches: aFaire.concat(suite), une: true, auContour: auContour };
        }
        if (etape.formulaire) {
            var champs = champsObligatoires(etape.formulaire());
            var vides = champs.filter(champVide);
            // Les champs obligatoires remplis : les flèches vont à ce que l'étape déclare ensuite.
            var ensuite = !vides.length && etape.fleches ? (etape.fleches() || []).filter(Boolean) : [];
            return { zones: champs.concat(zones, ensuite), fleches: vides.concat(ensuite), une: true, auContour: auContour };
        }
        return { zones: zones, fleches: etape.fleches ? (etape.fleches() || []).filter(Boolean) : null, une: false, auContour: auContour };
    }

    // ---------- Les lignes d'une bulle (voir « LES LIGNES D'UNE BULLE ») ----------

    /** Les lignes de l'étape, lues (une fonction ou un tableau) ; rien si l'étape n'en porte pas. */
    function lignesDeLEtape(etape) {
        var l = [];
        try { l = typeof etape.lignes === 'function' ? etape.lignes() : etape.lignes; } catch (e) { l = []; }
        return (l || []).filter(function (x) { return x && x.texte; });
    }

    /** Les champs d'une ligne, visibles (ceux que la bulle évite et que ses flèches visent). */
    function champsDe(ligne) {
        var cs = [];
        try { cs = ligne.champs ? ligne.champs() || [] : []; } catch (e) { cs = []; }
        return cs.filter(function (c) { return c && visible(c); });
    }

    /** Ce que la ligne montre (voir « CE QU'UNE LIGNE MONTRE »), visible. */
    function montresDe(ligne) {
        var ms = [];
        try { ms = ligne.montre ? ligne.montre() || [] : []; } catch (e) { ms = []; }
        return ms.filter(function (c) { return c && visible(c); });
    }

    /** Ce que la bulle dit et offre, à plat : ses lignes et ses boutons (voir « LES LIGNES QUI SUIVENT L'ÉCRAN »). */
    function signatureDesLignes(etape) {
        var dire = function (liste) {
            return liste.map(function (l) { return (l.geste ? '!' : l.note ? '#' : '-') + l.texte + (l.sous ? '[' + dire(l.sous.filter(Boolean)) + ']' : ''); }).join('|');
        };
        var boutons = [];
        try { boutons = (etape.boutons || []).map(function (b) { return b.libelle; }); } catch (e) { boutons = []; }
        return dire(lignesDeLEtape(etape)) + '§' + boutons.join('|');
    }

    /** La signature de la bulle qu'on vient d'écrire : gardée pour une étape aux lignes vivantes, sinon rien. */
    function retenirSignatureDesLignes(etape) {
        etat.signatureLignes = etape.lignesVivantes ? signatureDesLignes(etape) : null;
    }

    /** La ligne dit un geste qui peut être fait (elle se grisera) ; sinon c'est une explication. */
    function ligneSeFait(ligne) {
        if (ligne.note) return false;
        if (ligne.fait || ligne.champs) return true;
        return !!ligne.sous && ligne.sous.some(ligneSeFait);
    }

    /**
     * Le geste de la ligne est fait : sa condition (`fait`), sinon ses champs tous remplis ; une ligne mère, quand
     * toutes ses sous-lignes qui se font le sont. En visite, tout ce qui se fait est fait (l'étape est déjà réglée).
     */
    function ligneFaite(ligne) {
        if (!ligneSeFait(ligne)) return false;
        if (etat && etat.enVisite) return true;
        try {
            if (ligne.fait) return !!ligne.fait();
            if (ligne.champs) {
                var cs = champsDe(ligne);
                return cs.length > 0 && cs.every(function (c) { return !champVide(c); });
            }
        } catch (e) { return false; }
        return ligne.sous.filter(ligneSeFait).every(ligneFaite);
    }

    /**
     * OÙ SUIS-JE : les deux entrées actives du menu (la section, puis son onglet), lues dans la page. Leurs noms sont
     * ceux que l'écran montre ; js/navigation.js et js/config.js ne sont ni lus par ce code, ni modifiés.
     * @returns {{section:string, onglet:string, entrees:Element[]}|null}
     */
    function lireLieu() {
        var nom = function (b) {
            var l = b ? b.querySelector('.nav-label') : null;
            return String((l || b || {}).textContent || '').replace(/\s+/g, ' ').trim();
        };
        var actifs = [].slice.call(document.querySelectorAll('.navigation-principale button.actif'));
        var section = actifs.filter(visible)[0] || actifs[0] || null;
        var onglets = [].slice.call(document.querySelectorAll('.sous-navigation button.actif'));
        var onglet = onglets.filter(visible)[0] || onglets[0] || null;
        if (!section || !nom(section)) return null;
        return { section: nom(section), onglet: onglet ? nom(onglet) : '', entrees: [section, onglet].filter(Boolean) };
    }

    /**
     * « Tu es dans « X », à l'onglet « Y ». » — la première ligne d'une étape où la page change. Avec une section
     * nommée (`nommeLaSection`) : « …, à la section « S » », ou « Tu es dans la section « S » » quand la page n'a pas
     * changé. `suite` : ce qui suit, dans la même phrase si elle commence par un deux-points, sinon dans la suivante.
     */
    function phraseDuLieu(lieu, section, suite) {
        var nom = section && section.nom ? section.nom : '';
        var ou = '';
        if (lieu && nom) ou = 'Tu es dans « ' + lieu.section + ' », à la section « ' + nom + ' »';
        else if (nom) ou = 'Tu es dans la section « ' + nom + ' »';
        else if (lieu) ou = 'Tu es dans « ' + lieu.section + ' »' + (lieu.onglet ? ", à l'onglet « " + lieu.onglet + ' »' : '');
        if (!ou) return '';
        if (!suite) return ou + '.';
        return ou + (String(suite).charAt(0) === ':' ? ' ' : '. ') + suite;
    }

    // Le nom d'une section : son premier titre (celui d'un accordéon d'abord). Ce qui n'en est pas : le chevron, un
    // bouton d'aide, un compteur.
    var NOMS_DE_SECTION = ['.accordeon-header h2, .accordeon-header h3, .accordeon-header h4', '.accordeon-header', 'h2, h3, h4'];
    var HORS_DU_NOM = '.accordeon-chevron, button, .badge-compteur';

    /**
     * LA SECTION dont parle la bulle (voir « L'OBJECTIF, LA CONFIRMATION, LA SECTION, LE TRIANGLE ») : son bloc, l'élément
     * qui porte son nom, et ce nom tel que la page l'écrit.
     * @returns {{bloc:Element, tete:Element|null, nom:string}|null}
     */
    function sectionDe(etape) {
        if (!etape || !etape.section) return null;
        var bloc = null;
        try { bloc = etape.section(); } catch (e) { bloc = null; }
        if (!bloc || !bloc.isConnected) return null;
        var tete = null;
        for (var k = 0; k < NOMS_DE_SECTION.length && !tete; k++) tete = bloc.querySelector(NOMS_DE_SECTION[k]);
        var nom = '';
        if (tete) {
            var copie = tete.cloneNode(true);
            [].forEach.call(copie.querySelectorAll(HORS_DU_NOM), function (x) { x.remove(); });
            nom = String(copie.textContent || '').replace(/\s+/g, ' ').trim();
        }
        return { bloc: bloc, tete: tete, nom: nom };
    }

    /** Un texte qu'une étape donne tel quel ou par une fonction. */
    function texteDe(v) {
        try { return String((typeof v === 'function' ? v() : v) || ''); } catch (e) { return ''; }
    }

    /** La bulle est dans sa seconde forme (voir « LA SECONDE FORME ») : ce qui ouvrait la première a disparu. */
    function enSecondeForme(etape) {
        try { return typeof etape.secondeForme === 'function' && !!etape.secondeForme(); } catch (e) { return false; }
    }

    function aUnLieu(etape) {
        var l = etape && etape.lieu;
        try { return typeof l === 'function' ? !!l() : !!l; } catch (e) { return false; }
    }

    /**
     * Un contrôle qui écrit dans les données (voir « EN VISITE, RIEN N'EST DÉSIGNÉ QUI ÉCRIT ») : l'élément est un
     * contrôle, est dans un contrôle, ou en contient un ; le menu de navigation n'en est pas.
     */
    function ecritDansLesDonnees(el) {
        if (!el || typeof el.closest !== 'function') return false;
        if (el.closest(MENU_DE_NAVIGATION)) return false;
        return !!el.closest(CONTROLES_QUI_ECRIVENT) || !!el.querySelector(CONTROLES_QUI_ECRIVENT);
    }

    /**
     * En visite, le geste de l'étape est retenu : ce qu'elle fait toucher écrit dans les données (ou n'est plus là :
     * la consigne inviterait à toucher un bouton que rien ne désigne). Ni contour, ni consigne à toucher.
     */
    function gesteRetenu(etape) {
        if (!etat || !etat.enVisite || !etape || !etape.contour) return false;
        var c = null;
        try { c = etape.contour(); } catch (e) { c = null; }
        return !c || ecritDansLesDonnees(c);
    }

    /** Ce qu'il faut toucher, tel que le moteur le désigne : rien quand le geste est retenu. */
    function contourDe(etape) {
        if (!etape || !etape.contour || gesteRetenu(etape)) return null;
        return etape.contour();
    }

    function union(rects) {
        if (!rects.length) return null;
        var u = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        rects.forEach(function (r) {
            u.left = Math.min(u.left, r.left); u.top = Math.min(u.top, r.top);
            u.right = Math.max(u.right, r.right); u.bottom = Math.max(u.bottom, r.bottom);
        });
        u.width = u.right - u.left; u.height = u.bottom - u.top;
        return u;
    }

    /** La hauteur de l'en-tête collant : ce qui est dessous est caché par lui. */
    function hautEntete() {
        var e = document.querySelector('header.entete');
        if (!e) return 0;
        var r = e.getBoundingClientRect();
        return r.bottom > 0 ? r.bottom : 0;
    }

    /** Un pincement en cours (deux doigts posés), ou la page zoomée : le moteur ne replace rien. */
    function sousLeZoom() {
        var vv = window.visualViewport;
        return !!(etat && etat.doigts >= 2) || !!(vv && Math.abs(vv.scale - 1) > 0.01);
    }

    /**
     * La largeur de la mise en page, où se posent la bulle, le halo et les flèches (`position: fixed`) : celle de la
     * racine, qui ne suit ni le zoom au pincement ni un état gardé. Pas `innerWidth` : sous Safari iPad, il suit la
     * partie visible, et la bulle restait dans les deux tiers gauches de l'écran en paysage (Grégoire, 12 nov. 2026,
     * 12 h 54 : « elle semble bloquer au centre » ; posée à left ≈ 433 = 820 − 8 − 380, sur un écran de 1180).
     */
    function largeurPage() {
        var r = document.documentElement;
        return (r && r.clientWidth) || window.innerWidth;
    }

    /**
     * L'écran de la page : la largeur de la mise en page ; la hauteur d'avant le zoom tant qu'il dure (innerHeight
     * suit la partie visible).
     */
    function ecranGarde() {
        var hauteur = etat && etat.hauteurGardee && sousLeZoom() ? etat.hauteurGardee : window.innerHeight;
        return { largeur: largeurPage(), hauteur: hauteur };
    }

    /**
     * Les doigts posés. Un `touchend` va à la cible du `touchstart` même quand elle a quitté le DOM ; il ne remonte
     * alors plus jusqu'à `window`, et le compte restait à 2 : le moteur se croyait sous le zoom et ne replaçait plus
     * rien. La cible écoute donc aussi la fin de son toucher (banc : bulle-largeur-ipad-2026-11-12).
     */
    function compterDoigts(ev) {
        if (!etat) return;
        etat.doigts = ev.touches ? ev.touches.length : 0;
        var t = ev.target;
        if (ev.type !== 'touchstart' || !t || typeof t.addEventListener !== 'function') return;
        var fin = function (e) {
            t.removeEventListener('touchend', fin, true);
            t.removeEventListener('touchcancel', fin, true);
            if (etat) etat.doigts = e.touches ? e.touches.length : 0;
        };
        t.addEventListener('touchend', fin, { capture: true, passive: true });
        t.addEventListener('touchcancel', fin, { capture: true, passive: true });
    }

    /** La largeur du téléphone : la fenêtre, pas l'appareil (l'iPad en écran partagé étroit en est). */
    function surTelephone() {
        return ecranGarde().largeur <= SEUIL_TELEPHONE;   // sous le zoom, l'écran d'avant (pas la partie visible)
    }

    /**
     * Le bas visible : au-dessus du clavier à l'écran quand il est ouvert (même mesure que le témoin
     * « Enregistré », js/temoin-enregistrement.js ; ignorée sous un zoom au pincement).
     */
    function basVisible() {
        var vv = window.visualViewport;
        if (sousLeZoom()) return ecranGarde().hauteur;
        if (!vv) return window.innerHeight;
        return Math.min(window.innerHeight, Math.round(vv.offsetTop + vv.height));
    }

    /** Le bas utile de l'écran : au-dessus du bandeau de la démo, fixé en bas, quand il est là. */
    function basEcran() {
        var bas = basVisible();
        var b = document.getElementById('bandeau-demo');
        if (b && visible(b)) return Math.min(bas, b.getBoundingClientRect().top);
        return bas;
    }

    /**
     * Amène les éléments dans la vue, sous l'en-tête, en laissant la place de la bulle
     * dessous quand c'est possible : leur union est alors posée juste sous l'en-tête.
     * Si elle ne tient pas avec la bulle, elle est posée seule ; si elle ne tient pas
     * du tout, c'est le premier élément qui est amené.
     */
    function amenerDansLaVue(els, hauteurBulle) {
        var rs = rectsDe(els);
        if (!rs.length) return;
        var u = union(rs);
        var haut = hautEntete() + 16;
        var bas = basEcran() - 16;
        var dispo = bas - haut;
        var avecBulle = u.height + ECART + (hauteurBulle || 0) <= dispo;
        var dejaBien = u.top >= haut && (avecBulle ? u.bottom + ECART + hauteurBulle <= bas : u.bottom <= bas);
        if (dejaBien) return;
        var cible = u.height <= dispo ? u.top : rs[0].top;
        window.scrollTo({ top: Math.max(0, window.scrollY + cible - haut), behavior: 'auto' });
    }

    // ---------- Les éléments du moteur ----------

    function creerElements() {
        var ns = 'http://www.w3.org/2000/svg';
        // La couche des flèches : jamais de viewBox (voir « LES COORDONNÉES », en tête).
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'parcours-fleches');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('id', 'parcours-fleches');

        var contour = document.createElement('div');
        contour.className = 'parcours-contour';
        contour.id = 'parcours-contour';
        contour.hidden = true;

        var bulle = document.createElement('div');
        bulle.className = 'parcours-bulle';
        bulle.id = 'parcours-bulle';
        bulle.setAttribute('role', 'dialog');
        bulle.setAttribute('aria-modal', 'false');
        bulle.setAttribute('aria-labelledby', 'parcours-bulle-titre');
        bulle.tabIndex = -1;
        bulle.addEventListener('keydown', surToucheBulle);

        var annonce = document.createElement('div');
        annonce.className = 'u-lecteur-ecran';
        annonce.id = 'parcours-annonce';
        annonce.setAttribute('aria-live', 'polite');

        document.body.appendChild(svg);
        document.body.appendChild(contour);
        document.body.appendChild(bulle);
        document.body.appendChild(annonce);
        return { svg: svg, contour: contour, bulle: bulle, annonce: annonce };
    }

    function retirerElements() {
        ['parcours-fleches', 'parcours-contour', 'parcours-bulle', 'parcours-annonce'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }

    // ---------- Les pages d'une bulle ----------

    /**
     * Les positions où le texte peut se couper : juste après une fin de phrase (. ! ? …) suivie d'une
     * espace et d'une majuscule (ou d'un guillemet, d'un chiffre), hors d'une citation « … ». Pure.
     * @returns {number[]} les index de coupe (la page suivante commence après l'espace)
     */
    function coupuresPossibles(texte) {
        var res = [];
        var profondeur = 0;
        for (var i = 0; i < texte.length; i++) {
            var c = texte.charAt(i);
            if (c === '«') profondeur++;
            else if (c === '»') profondeur = Math.max(0, profondeur - 1);
            else if (profondeur === 0 && '.!?…'.indexOf(c) !== -1 && texte.charAt(i + 1) === ' '
                && /[A-ZÀ-ÖØ-ÞŒ«0-9]/.test(texte.charAt(i + 2))) res.push(i + 1);
        }
        return res;
        // Limite connue (relecture du 9 nov.) : une abréviation suivie d'une majuscule ou d'un chiffre
        // (« M. Untel », « p. 12 », « chap. 3 ») passe pour une fin de phrase, et une phrase entre
        // parenthèses n'est pas protégée. Aucun texte de parcours n'en a ; à reprendre si l'un en a.
    }

    /**
     * Le texte en `n` pages, chaque coupe à la fin de phrase la plus proche de j × longueur / n (au plus
     * près du milieu pour deux pages). Rend null si les fins de phrase ne suffisent pas. Pure.
     */
    function partager(texte, coupes, n) {
        var choisies = [];
        var avant = 0;
        for (var j = 1; j < n; j++) {
            var cible = j * texte.length / n;
            var restantes = n - 1 - j; // les coupes qu'il faudra encore après celle-ci
            var candidates = coupes.filter(function (c) { return c > avant; });
            if (candidates.length <= restantes) return null;
            candidates = candidates.slice(0, candidates.length - restantes);
            var meilleure = candidates.reduce(function (m, c) { return Math.abs(c - cible) < Math.abs(m - cible) ? c : m; });
            choisies.push(meilleure);
            avant = meilleure;
        }
        var pages = [];
        var debut = 0;
        choisies.concat([texte.length]).forEach(function (fin) {
            pages.push(texte.slice(debut, fin).trim());
            debut = fin;
        });
        return pages;
    }

    /** Le nombre de lignes que `texte` prend dans `p`, à sa largeur. */
    function lignesDe(p, texte) {
        p.textContent = texte;
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        return Math.round(p.scrollHeight / ligne);
    }

    /**
     * Les pages du texte, à la largeur de `p` : une seule s'il tient en LIGNES_PAR_PAGE lignes. Sinon la
     * première découpe (deux pages, puis trois) dont chaque page tient ; à défaut, celle dont la plus haute
     * page est la plus basse, si elle épargne au moins un tiers des lignes (une découpe qui laisse une page
     * presque aussi longue que le tout coûterait une navigation sans épargner le défilement : le filet suffit).
     */
    function decouperEnPages(p, texte) {
        p.style.minHeight = '';
        p.style.flexBasis = '';
        var total = lignesDe(p, texte);
        if (total <= LIGNES_PAR_PAGE) return [texte];
        var coupes = coupuresPossibles(texte);
        var meilleure = null;
        for (var n = 2; n <= PAGES_MAX; n++) {
            var pages = partager(texte, coupes, n);
            if (!pages) break;
            var plusHaute = Math.max.apply(null, pages.map(function (pg) { return lignesDe(p, pg); }));
            if (!meilleure || plusHaute < meilleure.plusHaute) meilleure = { pages: pages, plusHaute: plusHaute };
            if (plusHaute <= LIGNES_PAR_PAGE) break;
        }
        if (!meilleure || (meilleure.plusHaute > LIGNES_PAR_PAGE && meilleure.plusHaute > total * 2 / 3)) return [texte];
        return meilleure.pages;
    }

    /**
     * Le contenu d'une page, posé dans `cible` : un texte, ou les items d'un complément (une liste : des blocs dans le
     * paragraphe, chacun son rang quand ils sont plusieurs, son titre en gras s'il en a un).
     */
    function remplirPage(cible, contenu) {
        cible.textContent = '';
        if (typeof contenu === 'string') { cible.textContent = contenu; return; }
        contenu.forEach(function (item, k) {
            if (k > 0) cible.appendChild(document.createTextNode(' '));   // lu d'un trait (l'annonce, une copie), les items restent séparés
            var bloc = document.createElement('span');
            bloc.className = 'parcours-bulle-item' + (item.n ? '' : ' parcours-bulle-item--seul');
            bloc.setAttribute('role', 'listitem');
            if (item.n) {
                var rang = document.createElement('span');
                rang.className = 'parcours-bulle-item-rang';
                rang.textContent = item.n + '.';
                bloc.appendChild(rang);
                bloc.appendChild(document.createTextNode(' '));
            }
            if (item.titre) {
                var t = document.createElement('strong');
                t.textContent = item.titre;
                bloc.appendChild(t);
                bloc.appendChild(document.createTextNode(' '));
            }
            bloc.appendChild(document.createTextNode(item.texte));
            cible.appendChild(bloc);
        });
    }

    /** Le texte d'une page de complément, à plat (l'annonce, `pageQuiDit`). */
    function texteDesItems(items) {
        return items.map(function (x) { return (x.titre ? x.titre + ' ' : '') + x.texte; }).join(' ');
    }

    /** Le complément de l'étape, lu : ses items typographiés, numérotés quand ils sont plusieurs. */
    function itemsDuComplement(etape) {
        var liste = [];
        try { liste = etape.complement ? (etape.complement() || []) : []; } catch (e) { liste = []; }
        liste = liste.filter(function (x) { return x && x.texte; });
        return liste.map(function (x, k) {
            return { n: liste.length > 1 ? k + 1 : 0, titre: x.titre ? typographier(x.titre) : '', texte: typographier(x.texte) };
        });
    }

    /**
     * Les pages du complément, à la largeur de `p` : ses items dans l'ordre, une page tant qu'ils tiennent sous le
     * `plafond` ; un item plus haut que lui a sa page à lui. Le plafond : la hauteur de la plus haute page du texte de
     * l'étape (le complément ne grandit pas la bulle : mesuré sous WebKit le 13 nov. 2026, à 820 × 1180, neuf lignes au
     * lieu de huit, et « Ta grille » couvrait la zone de collage) ; sans texte, LIGNES_PAR_PAGE lignes.
     */
    function pagesDuComplement(p, items, textes) {
        if (!items.length) return [];
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        var plafond = LIGNES_PAR_PAGE * ligne + 1;
        if (textes.length) plafond = Math.max.apply(null, textes.map(function (t) { p.textContent = t; return p.scrollHeight; })) + 1;
        var pages = [], page = [];
        items.forEach(function (item) {
            remplirPage(p, page.concat([item]));
            if (page.length && p.scrollHeight > plafond) { pages.push(page); page = []; }
            page.push(item);
        });
        pages.push(page);
        return pages;
    }

    /**
     * Toutes les pages prennent la hauteur de la plus haute (sa base flex) : « ← » et « → » ne bougent pas
     * sous le doigt d'une page à l'autre. Sous la contrainte du filet, le texte se resserre encore.
     */
    function egaliserPages(p, contenus) {
        p.style.flexBasis = '';
        if (contenus.length < 2) return;
        var haute = 0;
        contenus.forEach(function (c) { remplirPage(p, c); haute = Math.max(haute, p.scrollHeight); });
        p.style.flexBasis = haute + 'px';
    }

    /** Pose les pages dans le texte de la bulle : toutes, dans l'ordre ; celle qu'on lit est visible. */
    function ecrirePages(p, contenus) {
        p.textContent = '';
        contenus.forEach(function (c, k) {
            if (k > 0) p.appendChild(document.createTextNode(' '));
            var span = document.createElement('span');
            var liste = typeof c !== 'string';
            span.className = 'parcours-bulle-page' + (liste ? ' parcours-bulle-page--liste' : '');
            if (liste) span.setAttribute('role', 'list');
            span.dataset.page = String(k);
            remplirPage(span, c);
            p.appendChild(span);
        });
    }

    /** Le plancher du filet : le texte se resserre, jamais sous trois lignes (ou sa hauteur). */
    function poserPlancher(p) {
        p.style.minHeight = '';
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        p.style.minHeight = Math.min(p.scrollHeight, Math.ceil(3 * ligne)) + 'px';
    }

    /** Montre la page `k` (bornée) : sa partie du texte, « k/n », les flèches. */
    function montrerPage(k) {
        var b = etat.elements.bulle;
        var n = etat.pages.length;
        etat.page = Math.max(0, Math.min(k, n - 1));
        var p = b.querySelector('.parcours-bulle-texte');
        if (p) {
            [].forEach.call(p.querySelectorAll('.parcours-bulle-page'), function (span) {
                span.classList.toggle('u-lecteur-ecran', Number(span.dataset.page) !== etat.page);
            });
            p.scrollTop = 0;
            poserPlancher(p);
        }
        var indice = b.querySelector('.parcours-bulle-pages');
        if (indice) indice.textContent = (etat.page + 1) + '/' + n;
        var prec = b.querySelector('.parcours-bulle-page-prec');
        var suiv = b.querySelector('.parcours-bulle-page-suiv');
        var avaitFocus = document.activeElement;
        if (prec) prec.disabled = etat.page === 0;
        if (suiv) suiv.disabled = etat.page === n - 1;
        // Un bouton devenu inactif perd le focus : il passe à l'autre flèche.
        if (avaitFocus && avaitFocus.disabled) {
            var autre = avaitFocus === prec ? suiv : prec;
            try { (autre && !autre.disabled ? autre : b).focus({ preventScroll: true }); } catch (e) { b.focus(); }
        }
    }

    /**
     * Change de page ; la bulle se replace à sa nouvelle hauteur. Le lecteur d'écran entend « page 2 de 3 »,
     * sans le texte de l'étape (déjà annoncé au rendu, et lisible en entier dans la bulle).
     */
    function changerPage(delta) {
        if (!etat || !etat.pages || etat.pages.length < 2) return false;
        var k = Math.max(0, Math.min(etat.page + delta, etat.pages.length - 1));
        if (k === etat.page) return false;
        montrerPage(k);
        etat.elements.annonce.textContent = 'page ' + (k + 1) + ' de ' + etat.pages.length;
        sonder();
        return true;
    }

    /**
     * Les flèches gauche et droite, quand la bulle (ou l'un de ses boutons) a le focus. Pas avec un
     * modificateur (Alt ou Cmd + ← : la page précédente du navigateur), ni la bulle repliée (rien ne
     * se verrait changer).
     */
    function surToucheBulle(ev) {
        if (!etat || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
        if (ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        if (etat.elements.bulle.classList.contains('est-repliee')) return;
        if (!etat.elements.bulle.contains(document.activeElement)) return;
        if (changerPage(ev.key === 'ArrowRight' ? 1 : -1)) ev.preventDefault();
    }

    /**
     * Découpe le texte de la bulle (lu une fois, au rendu de l'étape : `etat.texte`) à la largeur actuelle
     * et pose ses pages ; la page `garder` reste affichée si elle existe encore ; la largeur mesurée est
     * gardée (`largeurPages`).
     */
    function paginer(garder) {
        var b = etat.elements.bulle;
        var p = b.querySelector('.parcours-bulle-texte');
        if (!p) return;
        etat.largeurPages = p.offsetWidth;
        // Le texte de l'étape (aucun : la carte d'une page n'a que ses consignes), puis les pages de son complément.
        p.hidden = false;
        p.style.minHeight = '';   // une hauteur gardée fausserait la mesure (scrollHeight ne descend pas sous elle)
        p.style.flexBasis = '';
        var textes = etat.texte ? decouperEnPages(p, etat.texte) : [];
        var listes = pagesDuComplement(p, etat.complement || [], textes);
        var contenus = textes.concat(listes);
        etat.pages = textes.concat(listes.map(texteDesItems));
        etat.pageComplement = listes.length ? textes.length : -1;
        p.hidden = !contenus.length;
        egaliserPages(p, contenus);
        ecrirePages(p, contenus);
        var plusieurs = etat.pages.length > 1;
        var nav = b.querySelector('.parcours-bulle-nav');
        if (nav) nav.hidden = !plusieurs;
        montrerPage(plusieurs ? (garder || 0) : 0);
    }

    /**
     * À chaque passage de la sonde : si la largeur du texte a changé (une sonde d'étape qui change la
     * forme de la bulle, une fenêtre redimensionnée), la découpe est refaite. Un texte caché (forme
     * réduite d'un parcours, bulle repliée) n'est pas mesuré.
     */
    function suivreLargeurDesPages() {
        var p = etat.elements.bulle.querySelector('.parcours-bulle-texte');
        if (!p || !p.offsetWidth || p.offsetWidth === etat.largeurPages) return false;
        paginer(etat.page);
        return true;
    }

    // ---------- Le rendu d'une étape ----------

    function etapeCourante() {
        return etat ? etat.def.etapes[etat.i] : null;
    }

    /** Sur téléphone : la classe de la bulle et l'état du bouton de la tête suivent `etat.replie`. */
    function appliquerRepli() {
        var b = etat.elements.bulle;
        b.classList.toggle('est-repliee', etat.telephone && etat.replie);
        var bascule = b.querySelector('.parcours-bulle-bascule');
        if (bascule) bascule.setAttribute('aria-expanded', etat.replie ? 'false' : 'true');
    }

    function basculerRepli() {
        if (!etat || !etat.telephone) return;
        if (etapesOuvertes()) basculerEtapes(false);   // repliée, la liste ne se voit plus : son état le dit aussi
        etat.replie = !etat.replie;
        etat.reglerJusqua = Date.now() + REGLAGE_MS;
        appliquerRepli();
        if (!etat.replie) amenerDansLaVue(elementsVises(etapeCourante()), hauteurNaturelle());
        sonder();
    }

    /**
     * À l'intérieur des guillemets, une espace insécable : un guillemet ne passe jamais seul à la ligne (décision de
     * Cowork, 9 nov. 2026, 17 h 58 ; mesuré à 820 px : « Importer » se coupait avant son guillemet fermant). Pour toutes
     * les bulles, au rendu : les textes validés, et les sentinelles qui les lisent, gardent leurs espaces ordinaires.
     */
    /**
     * Les espaces insécables de la typographie française : dans les guillemets, et devant « ; : ? ! » (Grégoire sur
     * l'iPad, 16 nov. 2026 : un « ; » rejeté seul en début de ligne). Pour toutes les bulles.
     */
    function typographier(t) {
        return String(t == null ? '' : t).replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»').replace(/ ([;:?!])/g, '\u00a0$1');
    }

    // PROPOSÉ (14 nov. 2026, à valider par Grégoire) : le titre de la liste des étapes, et le nom du compteur pour le
    // lecteur d'écran. Lus par l'enseignant·e.
    var TITRE_ETAPES = 'Les étapes';
    var LIBELLE_RANG = 'voir les étapes';

    /**
     * « n sur N », dans la tête : un bouton qui ouvre la liste des étapes (voir « LE COMPTEUR ») ; rien pour une carte
     * qui n'est pas un parcours (`sansRang`). Le texte reste « n sur N », tel quel : les bancs et l'œil le lisent ainsi.
     */
    function rangDeLEtape(total) {
        if (etat.def.sansRang) return [];
        var rang = document.createElement('button');
        rang.type = 'button';
        rang.className = 'parcours-bulle-rang';
        rang.id = 'parcours-bulle-rang';
        rang.textContent = (etat.i + 1) + ' sur ' + total;
        rang.setAttribute('aria-label', 'Étape ' + (etat.i + 1) + ' sur ' + total + ' : ' + LIBELLE_RANG);
        rang.setAttribute('aria-expanded', 'false');
        rang.setAttribute('aria-controls', 'parcours-bulle-etapes');
        rang.addEventListener('click', function (ev) { ev.stopPropagation(); basculerEtapes(); });
        return [rang];
    }

    /** L'étape la plus loin où l'on peut aller : la dernière faite, ou celle où l'on est rendu. */
    function plusLoin() {
        return Math.max(etat.plusLoin || 0, etat.i);
    }

    /**
     * La liste des étapes, par leur titre (cachée tant qu'on ne touche pas le compteur). Une étape faite porte son
     * crochet et se choisit ; celle où l'on est rendu aussi ; au-delà, le titre se lit mais ne se touche pas : on ne
     * saute pas par-dessus une étape non faite.
     */
    function listeDesEtapes() {
        var boite = document.createElement('div');
        boite.className = 'parcours-bulle-etapes';
        boite.id = 'parcours-bulle-etapes';
        boite.hidden = true;
        var t = document.createElement('p');
        t.className = 'parcours-bulle-etapes-titre';
        t.id = 'parcours-bulle-etapes-titre';
        t.textContent = TITRE_ETAPES;
        boite.appendChild(t);
        var ol = document.createElement('ol');
        ol.setAttribute('aria-labelledby', 'parcours-bulle-etapes-titre');
        var loin = plusLoin();
        etat.def.etapes.forEach(function (e, k) {
            var li = document.createElement('li');
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'parcours-bulle-etape';
            b.dataset.etape = String(k);
            var faite = k < loin || !!etat.toutFait;
            if (faite) b.classList.add('est-faite');
            if (k === etat.i) b.setAttribute('aria-current', 'step');
            b.disabled = k > loin;
            var rang = document.createElement('span');
            rang.className = 'parcours-bulle-etape-rang';
            rang.textContent = (k + 1) + '.';
            b.appendChild(rang);
            b.appendChild(document.createTextNode(' ' + typographier(e.titre)));
            if (faite) {
                var dit = document.createElement('span');
                dit.className = 'u-lecteur-ecran';
                dit.textContent = ' (faite)';
                b.appendChild(dit);
            }
            b.addEventListener('click', function () { revoir(k); });
            li.appendChild(b);
            ol.appendChild(li);
        });
        boite.appendChild(ol);
        return boite;
    }

    function etapesOuvertes() {
        return !!etat && etat.elements.bulle.classList.contains('montre-etapes');
    }

    /** Ouvre ou referme la liste des étapes ; la bulle se replace à sa nouvelle hauteur. */
    function basculerEtapes(ouvrir) {
        if (!etat) return;
        var b = etat.elements.bulle;
        var boite = b.querySelector('.parcours-bulle-etapes');
        var rang = b.querySelector('.parcours-bulle-rang');
        if (!boite || !rang) return;
        var ouvre = ouvrir === undefined ? boite.hidden : !!ouvrir;
        // Sur téléphone, la bulle repliée se déplie d'abord : la liste ne se verrait pas.
        if (ouvre && etat.telephone && etat.replie) { etat.replie = false; appliquerRepli(); }
        boite.hidden = !ouvre;
        b.classList.toggle('montre-etapes', ouvre);
        rang.setAttribute('aria-expanded', ouvre ? 'true' : 'false');
        var cible = ouvre ? (boite.querySelector('[aria-current="step"]') || boite.querySelector('button:not(:disabled)')) : rang;
        try { if (cible) cible.focus({ preventScroll: true }); } catch (e) { if (cible) cible.focus(); }
        sonder();
    }

    /** Revoir l'étape `k`, choisie dans la liste : celle où l'on est referme la liste ; une autre s'ouvre en visite. */
    function revoir(k) {
        if (!etat || k > plusLoin()) return;
        if (k === etat.i) { basculerEtapes(false); return; }
        etat.visite = true;
        allerA(k);
    }

    // ---------- Le rendu des lignes ----------

    /**
     * Pose les lignes de l'étape dans la bulle : la phrase du lieu d'abord, puis, dans l'ordre, les notes (des phrases)
     * et la liste (une ligne par geste, ses sous-lignes dessous). Garde chaque ligne avec son élément (`etat.lignes`),
     * pour que la sonde la grise sans refaire la bulle.
     */
    function ecrireLignes(boite, etape) {
        boite.textContent = '';
        etat.lignes = [];
        var lieu = aUnLieu(etape) ? lireLieu() : null;
        var lignes = avecLaFin(etape, etape.lignes ? lignesDeLEtape(etape) : []);
        if (lignes.length && gesteRetenu(etape)) lignes = lignesEnVisite(lignes);
        // Dans l'ordre : l'objectif du parcours (sa première bulle), le geste précédent confirmé, puis où l'on est.
        var phrase = function (classe, texte) {
            if (!texte) return;
            var ph = document.createElement('p');
            ph.className = classe;
            ph.textContent = typographier(texte);
            boite.appendChild(ph);
        };
        var seconde = enSecondeForme(etape);
        if (etat.i === 0 && !seconde) phrase('parcours-bulle-objectif', texteDe(etat.def.objectif));
        poserEntree(seconde);
        poserConfirmation(seconde ? {} : etape);
        if (!seconde) phrase('parcours-bulle-lieu', phraseDuLieu(lieu, etape.nommeLaSection ? sectionDe(etape) : null, texteDe(etape.lieuSuite)));
        var ul = null;
        var poser = function (ligne, dans, sousLigne) {
            var li = document.createElement('li');
            // LES GESTES À FAIRE (voir « LES LIGNES D'UNE BULLE ») : la flèche, sans le gras de la consigne. Pas sur une
            // sous-ligne : c'est une part du geste de sa ligne mère, qui porte la flèche ; elle reçoit son crochet, faite.
            var aFaire = !ligne.geste && !sousLigne && ligneSeFait(ligne);
            li.className = 'parcours-bulle-ligne' + (ligne.geste ? ' parcours-bulle-ligne--geste' : '')
                + (aFaire ? ' parcours-bulle-ligne--a-faire' : '');
            var t = document.createElement('span');
            t.className = 'parcours-bulle-ligne-texte';
            var texte = typographier(ligne.texte);
            // LA PRÉCISION D'UNE CONSIGNE (les bulles de « Nous faisons », 19 nov. 2026 : « **Touche « Créer le groupe-cours »**
            // (il apparaîtra dans l'en-tête de l'application) ») : la parenthèse qui la termine sort du gras.
            var precision = ligne.geste ? /^(.*\S)( \([^()]*\))$/.exec(texte) : null;
            if (precision) {
                t.textContent = precision[1];
                var p = document.createElement('span');
                p.className = 'parcours-bulle-ligne-precision';
                p.textContent = precision[2];
                t.appendChild(p);
            } else {
                t.textContent = texte;
            }
            li.appendChild(t);
            var dit = document.createElement('span');
            dit.className = 'u-lecteur-ecran';
            li.appendChild(dit);
            dans.appendChild(li);
            etat.lignes.push({ def: ligne, el: li, dit: dit, faite: null });
            if (ligne.sous && ligne.sous.length) {
                var sous = document.createElement('ul');
                ligne.sous.forEach(function (x) { if (x && x.texte) poser(x, sous, true); });
                li.appendChild(sous);
            }
        };
        lignes.forEach(function (ligne) {
            if (ligne.note || ligne.classe) {
                ul = null;
                var p = document.createElement('p');
                p.className = ligne.classe || 'parcours-bulle-note';
                p.textContent = typographier(ligne.texte);
                boite.appendChild(p);
                return;
            }
            if (!ul) { ul = document.createElement('ul'); boite.appendChild(ul); }
            poser(ligne, ul);
        });
        boite.hidden = !boite.firstChild;
        majLignes(true);
    }

    /**
     * LA FIN : la dernière bulle d'un parcours dit où revoir une étape, juste avant sa consigne. Les autres bulles :
     * leurs lignes telles quelles.
     */
    function avecLaFin(etape, lignes) {
        if (etat.def.sansRang || etat.i !== etat.def.etapes.length - 1) return lignes;
        var n = etat.def.etapes.length;
        var revue = { texte: 'Pour revoir une étape, touche « ' + n + ' sur ' + n + ' ».', note: true, classe: 'parcours-bulle-note parcours-bulle-revue' };
        // L'objectif atteint (`objectifAtteint`, sur la définition) : en gras, entre deux filets, comme l'objectif de la
        // première bulle ; puis la phrase de la suite, en ligne simple, la dernière avant les boutons.
        var atteint = texteDe(etat.def.objectifAtteint);
        var cloture = atteint ? [{ texte: atteint, classe: 'parcours-bulle-objectif parcours-bulle-atteint' },
                                 { texte: PHRASE_DE_LA_SUITE, classe: 'parcours-bulle-suite' }] : [];
        // LA SUITE SUGGÉRÉE (20 nov. 2026) : nommée après la phrase de la suite, quand la bulle offre son bouton.
        var suite = suiteNommee(etape);
        if (suite) cloture.push({ texte: suite.phrase, classe: 'parcours-bulle-suite parcours-bulle-suite-suggeree' });
        var k = lignes.length;
        while (k > 0 && lignes[k - 1].geste) k--;
        return lignes.slice(0, k).concat([revue], cloture, lignes.slice(k).map(function (l) {
            return Object.assign({}, l, { texte: consigneDeLaFin(etape, l.texte) });
        }));
    }

    /**
     * L'ENTRÉE DE LA PREMIÈRE BULLE (Grégoire, 20 nov. 2026, essai sur l'iPad) : au-dessus du titre, en petit, la ligne
     * qui nomme le parcours (« Parcours 3 · Évaluer une première production · Nous faisons » : le rang et le nom sont
     * LUS dans le panneau « Assistance »), puis la phrase de la poignée. Ni l'une ni l'autre en vert : le vert reste à
     * ce qui est fait. Une carte qui n'est pas un parcours (`sansRang`) n'en a pas ; la seconde forme non plus (elle
     * ne garde que son titre et son compteur, et une forme qui ne redit pas l'objectif ne redit pas l'entrée) ; sur
     * téléphone, pas de phrase de la poignée.
     */
    function ligneDuParcours() {
        var a = window.Assistance, id = String(etat.def.id || '');
        if (etat.def.sansRang || !a || typeof a.identiteDe !== 'function') return '';
        var modele = /-modele$/.test(id);
        var f = a.identiteDe(modele ? id.slice(0, -'-modele'.length) : id, modele);
        if (!f || !f.rang) return '';
        return ['Parcours ' + f.rang, f.titre].concat(f.temps ? [f.temps] : []).join(' · ');
    }

    function poserEntree(seconde) {
        var e = etat.elements.entree;
        if (!e) return;
        // Dans la PREMIÈRE FORME seulement. Une première bulle qui change de forme sans `secondeForme` le dit par son
        // objectif, qu'elle ne redit pas (le modèle d'« Évaluer », l'assistant ouvert) : l'entrée part avec lui.
        // Mesuré le 20 nov. 2026 à 1180 × 820 : restée dans cette forme, elle grandissait la bulle, qui couvrait le
        // choix « Partir d'un modèle » de l'assistant.
        var objectif = etat.def.objectif;
        var premiere = etat.i === 0 && !etat.def.sansRang && !seconde && (objectif === undefined || !!texteDe(objectif));
        e.rang.textContent = premiere ? typographier(ligneDuParcours()) : '';
        e.rang.hidden = !e.rang.textContent;
        e.aide.textContent = premiere && !etat.telephone ? typographier(PHRASE_DE_LA_POIGNEE) : '';
        e.aide.hidden = !e.aide.textContent;
    }

    /**
     * LA CONFIRMATION AU-DESSUS DU TITRE (Grégoire, 18 nov. 2026, 14 h 11) : « C'est fait : … », le geste de l'étape
     * d'avant, en petit et en vert, comme un fait accompli, au-dessus du titre et du compteur. Posée dans son élément
     * (`etat.elements.confirme`, créé avec la tête de la bulle) ; récrite avec les lignes (une bulle à deux formes).
     */
    function poserConfirmation(etape) {
        var c = etat.elements.confirme;
        if (!c) return;
        var texte = texteDe(etape.confirme);
        c.textContent = texte ? typographier(texte) : '';
        c.hidden = !texte;
    }

    /** À chaque passage de la sonde : une ligne dont le geste est fait se grise (et le dit) ; défait, elle revient. */
    function majLignes(silence) {
        if (!etat || !etat.lignes) return;
        var vientDEtreFaite = false;
        etat.lignes.forEach(function (l) {
            var faite = ligneFaite(l.def);
            if (faite === l.faite) return;
            l.faite = faite;
            l.el.classList.toggle('est-faite', faite);
            l.dit.textContent = faite ? ' (fait)' : '';
            if (faite && !silence) { etat.elements.annonce.textContent = 'Fait : ' + l.def.texte; vientDEtreFaite = true; }
        });
        if (vientDEtreFaite) etat.gesteAAmener = true;
        // Le geste suivant vient à l'écran quand la personne a fini de taper, pas à sa première lettre (relecture
        // croisée du 14 nov. 2026 : une ligne est faite dès que son champ n'est plus vide, et la page défilait sous
        // les doigts, clavier ouvert).
        if (etat.gesteAAmener && !sousLeZoom() && !saisieEnCours()) { etat.gesteAAmener = false; amenerLeGesteSuivant(); }
    }

    /** La personne tape dans un champ de la page (le curseur y est encore). */
    function saisieEnCours() {
        var a = document.activeElement;
        if (!a || !a.matches || etat.elements.bulle.contains(a)) return false;
        if (a.tagName === 'TEXTAREA') return true;
        // Les champs où l'on TAPE : pas une date, une heure, une liste, une case (un geste les règle d'un coup).
        return a.tagName === 'INPUT' && ['text', 'number', 'email', 'search', 'tel', 'url', 'password', ''].indexOf(a.getAttribute('type') || '') !== -1;
    }

    /**
     * Un geste vient d'être fait : le suivant est amené à l'écran s'il n'y est pas — le premier champ encore vide
     * d'une ligne à faire, sinon ce qu'il faut toucher (« nommer, pointer, passer par les étapes une après l'autre »).
     * Une étape ouverte en haut de sa page (`lieu`) laisse son formulaire plus bas : c'est ici qu'il vient, au fil
     * des gestes, jamais à l'ouverture. Une fois par geste fait : la personne garde la main sur le défilement.
     */
    function amenerLeGesteSuivant() {
        var etape = etapeCourante();
        var suivant = null;
        etat.lignes.some(function (l) {
            if (l.faite) return false;
            suivant = champsDe(l.def).filter(champVide)[0] || null;
            return !!suivant;
        });
        if (!suivant) suivant = contourDe(etape);
        if (!visible(suivant) || aLAise(suivant)) return;
        try { suivant.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); } catch (e) { suivant.scrollIntoView(); }
    }

    /** Le texte des lignes, à plat (l'annonce de l'étape). */
    function texteDesLignes() {
        var boite = etat.elements.bulle.querySelector('.parcours-bulle-lignes');
        return boite && !boite.hidden ? ' ' + String(boite.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    /**
     * Le halo des deux entrées du menu (voir « OÙ SUIS-JE ») : posé tant que l'étape a un lieu, relu à chaque passage
     * (le menu se redessine), retiré à l'étape suivante. Jamais retiré d'un élément que la section actuelle du contour
     * porte aussi.
     */
    function marquerLieu(etape) {
        var entrees = aUnLieu(etape) ? ((lireLieu() || {}).entrees || []) : [];
        // Le nom de la section dont parle la bulle : le même halo (règle c).
        var s = sectionDe(etape);
        if (s && s.tete && visible(s.tete)) entrees = entrees.concat([s.tete]);
        (etat.entreesDuLieu || []).forEach(function (e) {
            if (entrees.indexOf(e) === -1 && e !== etat.sectionActuelle) e.classList.remove('parcours-section-actuelle');
        });
        entrees.forEach(function (e) { e.classList.add('parcours-section-actuelle'); });
        etat.entreesDuLieu = entrees;
    }

    /**
     * LA FIN : la suite suggérée (`Assistance.suiteDe` : le parcours qui suit celui-ci dans le panneau, ses mots, son
     * bouton), ou rien : c'était le dernier. Une Modélisation (« x-modele ») suit le rang de son parcours.
     */
    function suiteSuggeree() {
        var a = window.Assistance, id = String(etat.def.id || '');
        if (!a || typeof a.suiteDe !== 'function' || !id || etat.def.sansRang) return null;
        return a.suiteDe(id.replace(/-modele$/, ''));
    }

    /**
     * LA FIN (20 nov. 2026, Grégoire : « Parcours suivant » lançait un parcours d'office) : la suite que la dernière
     * bulle offre d'ALLER VOIR (« Voir le parcours N »), ou rien. Le moteur l'offre quand le seul bouton de l'étape est
     * « Terminer », dans un parcours qui a un rang, et qu'un parcours le suit dans le panneau.
     */
    function suiteOfferte(etape) {
        var boutons = etape.boutons || [];
        if (etat.i !== etat.def.etapes.length - 1 || etat.def.sansRang) return null;
        if (boutons.length !== 1 || boutons[0].libelle !== 'Terminer') return null;
        return suiteSuggeree();
    }

    /**
     * LA FIN : la suite que la bulle NOMME (« Suite suggérée : le parcours N, « Nom ». ») : celle dont elle porte le
     * bouton, que le moteur l'ait ajouté (`suiteOfferte`) ou que l'étape l'offre elle-même (les Modélisations,
     * « Découvrir »). Pas de bouton, pas de ligne.
     */
    function suiteNommee(etape) {
        if (etat.i !== etat.def.etapes.length - 1) return null;
        var suite = suiteSuggeree();
        if (!suite) return null;
        return boutonsDeLEtape(etape).some(function (b) { return b.libelle === suite.libelle; }) ? suite : null;
    }

    /**
     * LA FIN : la consigne suit les boutons (14 nov. 2026, décision de Cowork). Un parcours écrit « Touche
     * « Terminer » » ; quand la bulle offre aussi « Voir le parcours N », cette consigne devient celle des deux suites.
     * La phrase n'est écrite qu'ICI : aucun parcours ne la recopie. Le point final suit celui de la consigne
     * d'origine (une ligne de liste n'en porte pas, la ligne du geste en porte un).
     */
    function consigneDeLaFin(etape, texte) {
        if (typeof texte !== 'string') return texte;
        var m = /^Touche « Terminer »(\.?)$/.exec(texte.trim());
        var suite = m ? suiteOfferte(etape) : null;
        return suite ? consigneDesDeuxSuites(suite) + m[1] : texte;
    }

    /** La ligne du geste de l'étape, telle que la bulle la dit. */
    function gesteDeLEtape(etape) {
        if (etape.geste && gesteRetenu(etape)) return PHRASE_VISITE;
        return consigneDeLaFin(etape, etape.geste);
    }

    /**
     * En visite, geste retenu : la phrase de la visite prend la place de la consigne (la première ; une autre part) ;
     * les autres lignes restent. Une bulle sans consigne la reçoit en dernière ligne.
     */
    function lignesEnVisite(lignes) {
        var k = lignes.findIndex(function (l) { return l.geste; });
        var reste = lignes.filter(function (l) { return !l.geste; });
        var ou = k === -1 ? reste.length : lignes.slice(0, k).filter(function (l) { return !l.geste; }).length;
        return reste.slice(0, ou).concat([{ texte: PHRASE_VISITE, geste: true }], reste.slice(ou));
    }

    /**
     * Les boutons de la bulle, tels qu'elle les montre.
     * · En visite, une étape déjà réglée offre « Continuer » à la place de son attente.
     * · LA FIN : la dernière bulle qui n'offre que « Terminer » offre aussi « Voir le parcours N » ; les deux de même
     *   poids (règle 7 : aucun bouton mis en avant quand la personne choisit son rythme). « Voir le parcours N »
     *   termine ce parcours, ferme la bulle et ouvre le panneau « Assistance » devant le parcours suggéré : il ne
     *   lance rien (20 nov. 2026).
     */
    function boutonsDeLEtape(etape) {
        var boutons = (etape.boutons || []).slice();
        var derniere = etat.i === etat.def.etapes.length - 1;
        if (etat.enVisite && !derniere) {
            boutons.push({ libelle: 'Continuer', primaire: true, action: function () { allerA(etat.i + 1); } });
        }
        var suivant = suiteOfferte(etape);
        if (suivant) {
            var terminer = boutons[0];
            boutons = [
                { libelle: suivant.libelle, action: function (m) {
                    terminer.action(m);
                    suivant.voir();
                } },
                { libelle: 'Terminer', action: terminer.action, attend: terminer.attend }
            ];
        }
        return boutons;
    }

    function rendreBulle(opts) {
        var etape = etapeCourante();
        var b = etat.elements.bulle;
        var total = etat.def.etapes.length;
        b.textContent = '';
        etat.telephone = surTelephone();
        b.className = 'parcours-bulle' + (etat.telephone ? ' parcours-bulle--telephone' : '');
        b.classList.toggle('est-en-attente', etat.enAttente);   // la bulle attend encore la page (règle b)
        b.style.maxHeight = '';
        // Sur téléphone, la largeur est posée AVANT de mesurer le texte (son plancher de trois lignes).
        b.style.left = etat.telephone ? MARGE + 'px' : b.style.left;
        b.style.right = etat.telephone ? MARGE + 'px' : '';

        var tete = document.createElement('div');
        tete.className = 'parcours-bulle-tete';
        var h = document.createElement('h2');
        h.className = 'parcours-bulle-titre';
        h.id = 'parcours-bulle-titre';
        h.textContent = typographier(etape.titre);
        tete.appendChild(h);
        rangDeLEtape(total).forEach(function (rang) { tete.appendChild(rang); });
        if (etat.telephone) {
            // Un bouton posé sur la tête (une tête de section ne va pas DANS un bouton) : son nom
            // est le titre, son état dit si la bulle est dépliée.
            var bascule = document.createElement('button');
            bascule.type = 'button';
            bascule.className = 'parcours-bulle-bascule';
            bascule.setAttribute('aria-labelledby', 'parcours-bulle-titre');
            bascule.addEventListener('click', basculerRepli);
            tete.appendChild(bascule);
        } else {
            // La poignée (hors téléphone) : glisser la bulle à la souris, au doigt, au stylet ; au clavier, les flèches.
            var poignee = document.createElement('button');
            poignee.type = 'button';
            poignee.className = 'parcours-bulle-poignee';
            poignee.textContent = '\u283f';
            poignee.setAttribute('aria-label', LIBELLE_POIGNEE);
            poignee.addEventListener('pointerdown', debutGlisser);
            poignee.addEventListener('pointermove', surGlisser);
            poignee.addEventListener('pointerup', finGlisser);
            poignee.addEventListener('pointercancel', finGlisser);
            poignee.addEventListener('keydown', surTouchePoignee);
            tete.appendChild(poignee);
        }
        etat.glisse = null;
        if (etat.telephone) etat.deplacee = null;
        // L'entrée de la première bulle, au-dessus du titre (20 nov. 2026) ; ses textes : `poserEntree`.
        var rang = document.createElement('p');
        rang.className = 'parcours-bulle-identite';
        rang.hidden = true;
        b.appendChild(rang);
        var aide = document.createElement('p');
        aide.className = 'parcours-bulle-aide';
        aide.hidden = true;
        b.appendChild(aide);
        etat.elements.entree = { rang: rang, aide: aide };
        // La confirmation de l'étape d'avant, au-dessus du titre (18 nov. 2026) ; son texte : `poserConfirmation`.
        var confirme = document.createElement('p');
        confirme.className = 'parcours-bulle-confirme';
        confirme.hidden = true;
        b.appendChild(confirme);
        etat.elements.confirme = confirme;
        b.appendChild(tete);
        if (!etat.def.sansRang) b.appendChild(listeDesEtapes());

        var p = document.createElement('p');
        p.className = 'parcours-bulle-texte';
        b.appendChild(p);

        // Sous le texte, « ← 1/3 → » ; caché tant que le texte tient en une page. Le compteur est pour
        // l'œil : au changement de page, le lecteur d'écran entend « page 2 de 3 » (changerPage).
        var nav = document.createElement('div');
        nav.className = 'parcours-bulle-nav';
        nav.hidden = true;
        var fleche = function (classe, signe, nom, delta) {
            var f = document.createElement('button');
            f.type = 'button';
            f.className = 'parcours-bulle-fleche ' + classe;
            f.textContent = signe;
            f.setAttribute('aria-label', nom);
            f.addEventListener('click', function () { changerPage(delta); });
            return f;
        };
        var compteur = document.createElement('span');
        compteur.className = 'parcours-bulle-pages';
        compteur.setAttribute('aria-hidden', 'true');
        nav.appendChild(fleche('parcours-bulle-page-prec', '←', 'Page précédente', -1));
        nav.appendChild(compteur);
        nav.appendChild(fleche('parcours-bulle-page-suiv', '→', 'Page suivante', 1));
        b.appendChild(nav);

        // Les pages, à la largeur de la bulle (le filet : jamais sous trois lignes, posé par montrerPage).
        // Seule la forme change (le seuil du téléphone franchi) : la page affichée reste.
        // Les espaces insécables des guillemets (typographier) avant la découpe : les pages les gardent.
        etat.texte = typographier(etape.texte);
        etat.complement = itemsDuComplement(etape);
        etat.signatureComplement = JSON.stringify(etat.complement);
        paginer(opts && opts.sansAnnonce ? etat.page : 0);

        // Les lignes (voir « LES LIGNES D'UNE BULLE »), sous le texte s'il y en a un ; la phrase du lieu et celle de
        // la fin y logent aussi, pour toutes les bulles.
        var lignes = document.createElement('div');
        lignes.className = 'parcours-bulle-lignes';
        b.appendChild(lignes);
        ecrireLignes(lignes, etape);
        retenirSignatureDesLignes(etape);

        var geste = gesteDeLEtape(etape);
        if (geste) {
            var g = document.createElement('p');
            g.className = 'parcours-bulle-geste';
            g.textContent = typographier(geste);
            b.appendChild(g);
        }

        etat.boutons = boutonsDeLEtape(etape);
        if (etat.boutons.length) {
            var zone = document.createElement('div');
            zone.className = 'parcours-bulle-boutons';
            etat.boutons.forEach(function (def) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn ' + (def.primaire ? 'btn-principal' : 'btn-secondaire');
                btn.textContent = def.libelle;
                btn.addEventListener('click', function () { if (!btn.disabled) def.action(api); });
                zone.appendChild(btn);
            });
            b.appendChild(zone);
            // Ce qu'attend un bouton conditionnel (`attend`), dit sous les boutons (voir « LES BOUTONS QUI ATTENDENT »).
            var attente = document.createElement('p');
            attente.className = 'parcours-bulle-attente';
            attente.setAttribute('role', 'status');
            attente.hidden = true;
            b.appendChild(attente);
        }

        if (!etape.sansSortie && etat.def.lienSortie) {
            var sortie = document.createElement('button');
            sortie.type = 'button';
            sortie.className = 'parcours-bulle-sortie';
            sortie.textContent = etat.def.lienSortie;
            sortie.addEventListener('click', quitter);
            b.appendChild(sortie);
        }

        // L'annonce : le titre et le texte, puis le geste. Vidée d'abord, pour qu'un même
        // texte soit relu s'il revient. Pas d'annonce quand seule la forme change (le seuil franchi).
        if (opts && opts.sansAnnonce) { appliquerRepli(); return; }
        annoncerEtape(etape);
        appliquerRepli();
    }

    /** L'annonce d'une étape : son titre, son texte, son complément, puis son geste. */
    function annoncerEtape(etape) {
        var a = etat.elements.annonce;
        a.textContent = '';
        setTimeout(function () {
            if (!etat) return;
            var suite = (etat.complement || []).length ? ' ' + texteDesItems(etat.complement) : '';
            a.textContent = etape.titre + '. ' + (etape.texte || '') + suite + texteDesLignes() + (gesteDeLEtape(etape) ? ' ' + gesteDeLEtape(etape) : '');
        }, 50);
    }

    /** La hauteur de la bulle si son texte ne défilait pas (le texte est la seule zone qui défile). */
    function hauteurNaturelle() {
        var b = etat.elements.bulle;
        var t = b.querySelector('.parcours-bulle-texte');
        var h = b.offsetHeight;
        if (t && !b.classList.contains('est-repliee')) h += Math.max(0, t.scrollHeight - t.clientHeight);
        return h;
    }

    // ---------- La géométrie des flèches et du déplacement : des fonctions pures (tests/unit) ----------

    /** Des cibles qui se touchent (à `pad` px près) n'en font qu'une : une seule flèche. Pure. */
    function fondreCibles(rects, pad) {
        var liste = rects.map(function (r) { return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
        var change = true;
        while (change) {
            change = false;
            for (var a = 0; a < liste.length && !change; a++) {
                for (var b = a + 1; b < liste.length && !change; b++) {
                    var A = liste[a], B = liste[b];
                    // À MOINS de `pad` px : deux champs côte à côte à 20 px tout juste (les deux façons d'importer de
                    // « Ta classe », 4) gardent chacun sa flèche (11 nov. 2026).
                    var touche = !(A.right + pad <= B.left || B.right + pad <= A.left ||
                                   A.bottom + pad <= B.top || B.bottom + pad <= A.top);
                    if (touche) {
                        liste[a] = { left: Math.min(A.left, B.left), top: Math.min(A.top, B.top),
                                     right: Math.max(A.right, B.right), bottom: Math.max(A.bottom, B.bottom) };
                        liste.splice(b, 1);
                        change = true;
                    }
                }
            }
        }
        return liste;
    }

    /** Les cibles des flèches : fondues quand elles se touchent (à FUSION px près) ; au-delà de `max`, leur union seule. Pure. */
    function grouperCibles(rects, max) {
        var liste = fondreCibles(rects, FUSION);
        if (liste.length <= max) return liste;
        return [liste.reduce(function (u, r) {
            return { left: Math.min(u.left, r.left), top: Math.min(u.top, r.top),
                     right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) };
        })];
    }

    function borne(v, min, max) { return Math.min(Math.max(min, v), Math.max(min, max)); }
    function arrondi(v) { return Math.round(v * 10) / 10; }

    function dansRect(p, r) { return p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom; }

    /**
     * Une courbe de Bézier légèrement bombée de (sx, sy) à (ex, ey), raccourcie de `retrait` à l'arrivée, bombée du
     * côté `sens` (1 : à gauche du sens de la marche ; -1 : à droite), et sa pointe en deux traits ouverts. Null si
     * elle est trop courte pour se lire. `points` : neuf points de la courbe, pour savoir ce qu'elle croise. Pure.
     */
    function courbe(sx, sy, ex, ey, retrait, sens, ecran) {
        var vx = ex - sx, vy = ey - sy;
        var len = Math.sqrt(vx * vx + vy * vy);
        if (len - retrait < FLECHE_MIN) return null;
        var ux = vx / len, uy = vy / len;
        ex -= ux * retrait; ey -= uy * retrait; len -= retrait;
        var bombe = sens * Math.min(28, len * 0.18);
        // Le point de contrôle reste dans l'écran.
        var kx = borne((sx + ex) / 2 + uy * bombe, 4, ecran.largeur - 4);
        var ky = borne((sy + ey) / 2 - ux * bombe, 4, ecran.hauteur - 4);
        // La pointe : deux traits ouverts, de part et d'autre de la tangente à l'arrivée.
        var tx = ex - kx, ty = ey - ky;
        var tl = Math.sqrt(tx * tx + ty * ty) || 1;
        tx /= tl; ty /= tl;
        var aile = Math.min(12, len * 0.35), cos = Math.cos(0.5), sin = Math.sin(0.5);
        var ax = ex - aile * (tx * cos - ty * sin), ay = ey - aile * (ty * cos + tx * sin);
        var bx = ex - aile * (tx * cos + ty * sin), by = ey - aile * (ty * cos - tx * sin);
        var points = [];
        for (var n = 1; n <= 9; n++) {
            var t = n / 10, q = 1 - t;
            points.push({ x: q * q * sx + 2 * q * t * kx + t * t * ex, y: q * q * sy + 2 * q * t * ky + t * t * ey });
        }
        var d = 'M' + arrondi(sx) + ',' + arrondi(sy) + ' Q' + arrondi(kx) + ',' + arrondi(ky) + ' ' + arrondi(ex) + ',' + arrondi(ey) +
            ' M' + arrondi(ax) + ',' + arrondi(ay) + ' L' + arrondi(ex) + ',' + arrondi(ey) + ' L' + arrondi(bx) + ',' + arrondi(by);
        return { d: d, depart: { x: arrondi(sx), y: arrondi(sy) }, pointe: { x: arrondi(ex), y: arrondi(ey) },
                 controle: { x: arrondi(kx), y: arrondi(ky) }, points: points, longueur: len };
    }

    /**
     * La flèche, du bord de la bulle vers la cible. Pure et déterministe : les mêmes rectangles rendent le même tracé
     * (la sonde tourne toutes les 120 ms, la flèche ne frémit pas).
     *  · d'abord le plus court : du point de la bulle le plus proche de la cible au point de la cible le plus proche ;
     *  · la cible sortie de l'écran : la flèche va au bord de l'écran, du côté de la cible ;
     *  · la cible sous la bulle : null ; le plus court trop court pour se lire (FLECHE_MIN) : un autre bord de la
     *    cible, comme pour un obstacle ; aucun bord assez loin : null ;
     *  · la pointe s'arrête à FLECHE_RETRAIT px du bord de la cible ; deux traits ouverts, pas de triangle ;
     *  · si ce tracé passe sur un obstacle (une autre cible, ce qu'il faut toucher), le bombement change de côté ;
     *    sinon la flèche arrive par un autre bord de la cible, par le chemin le plus court qui ne croise rien ; si
     *    tout croise, le plus court est gardé.
     * @param {{left,top,right,bottom}} bulle
     * @param {{left,top,right,bottom}} cible
     * @param {{largeur:number, hauteur:number}} ecran  la largeur de la mise en page × innerHeight (ecranGarde)
     * @param {Array<{left,top,right,bottom}>} [obstacles]  ce que la flèche évite de croiser
     * @returns {null|{d:string, depart:{x,y}, pointe:{x,y}, controle:{x,y}, horsEcran:boolean}}
     */
    function tracerFleche(bulle, cible, ecran, obstacles) {
        var W = ecran.largeur, H = ecran.hauteur;
        obstacles = obstacles || [];
        var hors = cible.right <= 0 || cible.bottom <= 0 || cible.left >= W || cible.top >= H;
        var c = hors ? cible : { left: Math.max(0, cible.left), top: Math.max(0, cible.top),
                                 right: Math.min(W, cible.right), bottom: Math.min(H, cible.bottom) };
        var cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2;
        // Le départ : le point du bord de la bulle le plus proche du centre de la cible.
        var sx = borne(cx, bulle.left, bulle.right), sy = borne(cy, bulle.top, bulle.bottom);
        var f = hors ? versLeBordDeLEcran(bulle, sx, sy, cx, cy, ecran)
            // Le centre de la cible sous la bulle : elle est cachée, pas de flèche.
            : (sx === cx && sy === cy) ? null : versLaCible(bulle, c, sx, sy, ecran, obstacles);
        if (!f && !hors) f = faute(bulle, c, sx, sy, cx, cy, ecran, obstacles);
        if (!f) return null;
        f.horsEcran = hors;
        delete f.points;
        delete f.longueur;
        return f;
    }

    /**
     * Faute de tracé : d'abord sans les obstacles (passer sur une autre cible vaut mieux qu'aucune flèche) ; puis, la
     * bulle posée sur la cible (aucune place libre : les bandes de « Ta classe d'un coup d'œil », la fiche plus haute que
     * l'écran de « Ton intervention », captures 28 et 29), la partie que la bulle laisse voir. Pure.
     */
    function faute(bulle, c, sx, sy, cx, cy, ecran, obstacles) {
        var f = obstacles.length && !(sx === cx && sy === cy) ? versLaCible(bulle, c, sx, sy, ecran, []) : null;
        return f || (seCroisent(bulle, c, 0) ? versLaPartieVisible(bulle, c, ecran) : null);
    }

    /**
     * La cible que la bulle chevauche : la plus grande des quatre bandes de la cible hors de la bulle (à gauche, à droite,
     * au-dessus, au-dessous) ; la flèche part du bord de la bulle le plus proche du milieu de cette bande et y entre. Null
     * si aucune bande n'a FLECHE_MIN px dans ses deux sens. Pure.
     */
    function versLaPartieVisible(bulle, c, ecran) {
        var bandes = [
            { left: c.left, top: c.top, right: Math.min(c.right, bulle.left), bottom: c.bottom },
            { left: Math.max(c.left, bulle.right), top: c.top, right: c.right, bottom: c.bottom },
            { left: c.left, top: c.top, right: c.right, bottom: Math.min(c.bottom, bulle.top) },
            { left: c.left, top: Math.max(c.top, bulle.bottom), right: c.right, bottom: c.bottom }
        ].filter(function (b) { return b.right - b.left >= FLECHE_MIN && b.bottom - b.top >= FLECHE_MIN; });
        if (!bandes.length) return null;
        var b = bandes.reduce(function (m, x) {
            return (x.right - x.left) * (x.bottom - x.top) > (m.right - m.left) * (m.bottom - m.top) ? x : m;
        });
        var mx = (b.left + b.right) / 2, my = (b.top + b.bottom) / 2;
        return courbe(borne(mx, bulle.left, bulle.right), borne(my, bulle.top, bulle.bottom), mx, my, 0, 1, ecran);
    }

    /** La cible sortie de l'écran : la flèche va au bord de l'écran, du côté de la cible. Pure. */
    function versLeBordDeLEcran(bulle, sx, sy, cx, cy, ecran) {
        var bx = borne(cx, 10, ecran.largeur - 10), by = borne(cy, 10, ecran.hauteur - 10);
        if (dansRect({ x: bx, y: by }, bulle)) return null;
        return courbe(sx, sy, bx, by, 0, 1, ecran);
    }

    function croise(f, rects) {
        return f.points.some(function (p) { return rects.some(function (r) { return dansRect(p, r); }); });
    }

    /**
     * Le plus court, du départ au point de la cible le plus proche ; s'il croise un obstacle, bombé de l'autre côté ;
     * s'il croise encore, ou s'il est trop court pour se lire (FLECHE_MIN), par un autre bord de la cible. Pure.
     */
    function versLaCible(bulle, c, sx, sy, ecran, obstacles) {
        var ex = borne(sx, c.left, c.right), ey = borne(sy, c.top, c.bottom);
        var direct = courbe(sx, sy, ex, ey, FLECHE_RETRAIT, 1, ecran);
        if (direct && !croise(direct, obstacles)) return direct;
        var envers = direct && courbe(sx, sy, ex, ey, FLECHE_RETRAIT, -1, ecran);
        if (envers && !croise(envers, obstacles)) return envers;
        return parUnAutreBord(bulle, c, ecran, obstacles) || direct;
    }

    /**
     * Par un autre bord de la cible : le point de ce bord le plus proche de la bulle, à 16 px des coins (au milieu d'un
     * bord plus court), la pointe à FLECHE_RETRAIT du bord ; le plus court qui ne croise rien, sinon null. Pure.
     */
    function parUnAutreBord(bulle, c, ecran, obstacles) {
        var bcx = (bulle.left + bulle.right) / 2, bcy = (bulle.top + bulle.bottom) / 2;
        var mx = Math.min(16, (c.right - c.left) / 2), my = Math.min(16, (c.bottom - c.top) / 2);
        var px = borne(bcx, c.left + mx, c.right - mx), py = borne(bcy, c.top + my, c.bottom - my);
        var R = FLECHE_RETRAIT;
        var arrivees = [{ x: px, y: c.top - R }, { x: px, y: c.bottom + R }, { x: c.left - R, y: py }, { x: c.right + R, y: py }];
        var interdits = obstacles.concat([c, bulle]);
        var meilleure = null;
        arrivees.forEach(function (a) {
            var dx = borne(a.x, bulle.left, bulle.right), dy = borne(a.y, bulle.top, bulle.bottom);
            [1, -1].forEach(function (sens) {
                var f = courbe(dx, dy, a.x, a.y, 0, sens, ecran);
                if (f && !croise(f, interdits) && (!meilleure || f.longueur < meilleure.longueur - 0.5)) meilleure = f;
            });
        });
        return meilleure;
    }

    /**
     * La place d'une bulle déplacée, gardée dans l'écran utile (`cadre` : sous l'en-tête, au-dessus du bandeau de la
     * démo et du clavier). Une bulle plus grande que le cadre se cale en haut à gauche. Pure.
     */
    function bornerDeplacement(x, y, largeur, hauteur, cadre) {
        return { x: Math.round(borne(x, cadre.gauche, cadre.droite - largeur)),
                 y: Math.round(borne(y, cadre.haut, cadre.bas - hauteur)) };
    }

    function seCroisent(a, b, marge) {
        return !(a.right + marge <= b.left || b.right + marge <= a.left || a.bottom + marge <= b.top || b.bottom + marge <= a.top);
    }

    /** Le haut d'où une bulle peut commencer : sous l'en-tête. */
    function hautUtile() {
        return Math.max(MARGE, hautEntete() + MARGE);
    }

    /**
     * La réserve du témoin « Enregistré » : la hauteur occupée par une bulle rangée en bas. Bornée
     * pour que le témoin (~40 px) reste dans l'écran quand la bulle prend presque toute la hauteur :
     * il passe alors sur le haut de la bulle plutôt que hors de l'écran.
     */
    function poserReserveBas(px) {
        var plafond = Math.max(0, window.innerHeight - 64);
        document.documentElement.style.setProperty('--parcours-reserve-bas', Math.round(Math.min(plafond, Math.max(0, px))) + 'px');
    }

    /** Un geste de la personne (molette, doigt, clavier) arrête le réglage : le moteur ne lutte pas. */
    function arreterReglage() {
        if (etat) etat.reglerJusqua = 0;
    }

    /**
     * Sur téléphone : la bulle pleine largeur, rangée en bas ; en haut si la zone éclairée occupe
     * le bas ; si aucun côté ne contient sa hauteur, le côté du contour, sinon le plus grand, et le
     * texte défile. Jamais plus haute que l'écran utile (la cible peut être hors de l'écran).
     */
    /** Le côté où la bulle tient (en bas d'abord), sinon le plus grand des deux. */
    function choisirCote(naturelle, sous, dessus) {
        if (naturelle <= sous) return { cote: 'bas', max: sous };
        if (naturelle <= dessus) return { cote: 'haut', max: dessus };
        return sous >= dessus ? { cote: 'bas', max: sous } : { cote: 'haut', max: dessus };
    }

    /**
     * En bas d'abord : pendant le réglage (début d'étape, dépliement, jusqu'au premier geste), si
     * faire défiler la page laisse la place sous la zone, le moteur la fait défiler. Rend la zone
     * telle qu'elle est après ce défilement.
     */
    function reglerDefilement(cibleRect, naturelle, haut, bas) {
        var manque = Math.ceil(naturelle - (bas - (cibleRect.bottom + ECART)));
        if (manque <= 0 || Date.now() >= etat.reglerJusqua) return cibleRect;
        if ((cibleRect.top - ECART) - haut < manque) return cibleRect;
        var avant = window.scrollY;
        window.scrollBy(0, manque);
        var fait = window.scrollY - avant;
        return { top: cibleRect.top - fait, bottom: cibleRect.bottom - fait };
    }

    /**
     * Le côté de la bulle sur téléphone. La zone éclairée d'abord ; si elle prend tout l'écran, la
     * bulle en couvre une partie, au mieux sans toucher au contour (ce qu'il faut toucher) : le côté
     * du contour où elle tient, sinon le plus grand ; si les deux ont moins que sa tête (56 px), elle
     * couvre le bord du contour. Sans contour (le geste est dans la bulle) : en bas, à sa hauteur.
     */
    function coteTelephone(cibleRect, contourEl, naturelle, haut, bas) {
        var ecran = Math.max(0, bas - haut);
        if (!cibleRect) return { cote: 'bas', max: ecran };
        var z = reglerDefilement(cibleRect, naturelle, haut, bas);
        var place = choisirCote(naturelle, bas - (z.bottom + ECART), (z.top - ECART) - haut);
        if (naturelle <= place.max) return place;
        if (!contourEl) return { cote: 'bas', max: ecran };
        var rc = contourEl.getBoundingClientRect(); // lu maintenant : après le défilement éventuel
        return choisirCote(naturelle, bas - (rc.bottom + ECART), (rc.top - ECART) - haut);
    }

    /**
     * Sur téléphone : la bulle pleine largeur, au bord de l'écran (coteTelephone). Jamais plus haute
     * que l'écran utile (la cible peut être hors de l'écran) ; repliée, elle garde sa tête (56 px).
     */
    function placerBulleTelephone(cibleRect, contourEl) {
        var b = etat.elements.bulle;
        var haut = hautUtile();
        var bas = basEcran() - MARGE;
        var place = coteTelephone(cibleRect, contourEl, hauteurNaturelle(), haut, bas);
        b.style.maxHeight = Math.max(Math.round(Math.min(place.max, Math.max(0, bas - haut))), 56) + 'px';
        var bh = b.offsetHeight;
        var y = place.cote === 'bas' ? Math.max(MARGE, bas - bh) : haut;
        b.style.left = MARGE + 'px';
        b.style.right = MARGE + 'px';
        b.style.top = Math.round(y) + 'px';
        poserReserveBas(place.cote === 'bas' ? window.innerHeight - y : 0);
    }

    /** L'écran utile d'une bulle : sous l'en-tête, au-dessus du bandeau de la démo et du clavier. */
    function cadreUtile() {
        return { gauche: MARGE, haut: hautUtile(), droite: ecranGarde().largeur - MARGE, bas: basEcran() - MARGE };
    }

    /** La bulle déplacée par la personne : sa place gardée pour l'étape, ramenée dans l'écran utile s'il a changé. */
    function poserDeplacee() {
        var b = etat.elements.bulle;
        var p = bornerDeplacement(etat.deplacee.x, etat.deplacee.y, b.offsetWidth, b.offsetHeight, cadreUtile());
        b.style.left = p.x + 'px';
        b.style.top = p.y + 'px';
        return p;
    }

    function pese(r, poids) {
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, poids: poids };
    }

    /** L'aire de `p` couverte par les rectangles `rects`, chacun pesé de son `poids` (1 par défaut). Pure. */
    function aireCouverte(p, rects) {
        return rects.reduce(function (somme, r) {
            var l = Math.min(p.right, r.right) - Math.max(p.left, r.left);
            var h = Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top);
            return somme + (l > 0 && h > 0 ? l * h * (r.poids || 1) : 0);
        }, 0);
    }

    /** La distance de `p` au plus proche des rectangles (0 s'il en touche un ; l'infini sans rectangle). Pure. */
    function ecartA(p, rects) {
        return rects.reduce(function (min, r) {
            var dx = Math.max(r.left - p.right, p.left - r.right, 0), dy = Math.max(r.top - p.bottom, p.top - r.bottom, 0);
            return Math.min(min, Math.sqrt(dx * dx + dy * dy));
        }, Infinity);
    }

    /**
     * Les places essayées. Le recouvrement, en fonction de la place, est linéaire par morceaux dans chaque direction :
     * son minimum est atteint à un coin de la grille que tracent les bords de l'écran utile et, pour chaque zone, ses
     * bords et les places qui la touchent (à 0 ou à ECART px). Toutes ces places, plus les milieux des bords de l'écran
     * (pas son centre) ; toutes ramenées dans l'écran utile. Pure.
     */
    /** Fond les rectangles que `ensemble(A, B)` réunit, jusqu'à ce que plus rien ne bouge ; l'ordre est gardé. Pure. */
    function fondre(rects, ensemble) {
        var liste = rects.slice();
        var change = true;
        while (change) {
            change = false;
            for (var a = 0; a < liste.length; a++) {
                for (var b = liste.length - 1; b > a; b--) {
                    var A = liste[a], B = liste[b];
                    if (!ensemble(A, B)) continue;
                    liste[a] = { left: Math.min(A.left, B.left), top: Math.min(A.top, B.top),
                                 right: Math.max(A.right, B.right), bottom: Math.max(A.bottom, B.bottom), poids: A.poids };
                    liste.splice(b, 1);
                    change = true;
                }
            }
        }
        return liste;
    }

    /**
     * Deux rectangles de même poids forment un même bloc : l'un contient l'autre, ou ils partagent tout un bord (deux
     * cellules d'une colonne, d'une rangée) et se touchent, à JOINT px. Leur union est alors leur rectangle. Pure.
     */
    function memeBloc(A, B) {
        if ((A.poids || 1) !== (B.poids || 1)) return false;
        var pres = function (x, y) { return Math.abs(x - y) <= JOINT; };
        var dans = function (I, E) { return I.left >= E.left - JOINT && I.right <= E.right + JOINT && I.top >= E.top - JOINT && I.bottom <= E.bottom + JOINT; };
        if (dans(A, B) || dans(B, A)) return true;
        var empiles = pres(A.left, B.left) && pres(A.right, B.right) && A.top <= B.bottom + JOINT && B.top <= A.bottom + JOINT;
        var cote = pres(A.top, B.top) && pres(A.bottom, B.bottom) && A.left <= B.right + JOINT && B.left <= A.right + JOINT;
        return empiles || cote;
    }

    /**
     * Ce que la bulle évite, réduit avant de chercher sa place (voir « CE QUE LA BULLE ÉVITE EST RÉDUIT D'ABORD ») :
     * les doublons et les blocs fondus (sans rien couvrir de plus, à JOINT px) ; puis, s'il en reste plus de
     * EVITES_MAX, les rectangles de même poids fondus de proche en proche (à 4 px, 8, 16…) jusqu'à tenir dessous. Pure.
     */
    function reduireEvites(evites) {
        var liste = fondre(evites.map(function (r) { return pese(r, r.poids || 1); }), memeBloc);
        var poids = liste.map(function (r) { return r.poids; }).filter(function (p, k, tous) { return tous.indexOf(p) === k; }).length;
        var proches = function (pad) {
            return function (A, B) {
                return A.poids === B.poids && !(A.right + pad <= B.left || B.right + pad <= A.left ||
                                                A.bottom + pad <= B.top || B.bottom + pad <= A.top);
            };
        };
        for (var pad = 4; liste.length > Math.max(EVITES_MAX, poids); pad *= 2) liste = fondre(liste, proches(pad));
        return liste;
    }

    function placesEssayees(evites, bw, bh, cadre) {
        var g = cadre.gauche, h = cadre.haut, d = cadre.droite - bw, b = cadre.bas - bh;
        var mx = (g + d) / 2, my = (h + b) / 2;
        // À égale distance, la droite d'abord (la place de la bulle étroite à droite de l'aperçu, « Mettre tes données à
        // l'abri », 3) ; puis le haut.
        var xs = [d, mx, g], ys = [h, my, b];
        // Une place qui longe une zone s'arrondit du côté LIBRE (13 nov. 2026) : arrondie au plus proche, la place
        // collée sous un bord à 152,45 tombait à 152, mordait d'un demi-pixel sur le contour (pesé dix mille fois) et
        // perdait contre la place à ECART px, quatre pixels de recouvrement plus bas (parcours-8, 820 px, étape 2).
        var avant = Math.floor, apres = Math.ceil;
        evites.forEach(function (r) {
            xs.push(avant(r.left - bw), avant(r.left - ECART - bw), r.left, r.right - bw, apres(r.right), apres(r.right + ECART));
            ys.push(avant(r.top - bh), avant(r.top - ECART - bh), r.top, r.bottom - bh, apres(r.bottom), apres(r.bottom + ECART));
        });
        // Ramenées dans l'écran utile, puis dédoublonnées, dans l'ordre (15 nov. 2026) : la plupart y tombent sur un
        // bord, et chaque paire essayée deux fois coûtait le carré.
        var uniques = function (vs, min, max, milieu) {
            var vus = {}, res = [];
            vs.forEach(function (v) {
                var w = Math.round(borne(v, min, max)), cle = (v === milieu ? 'm' : '') + w;
                if (!vus[cle]) { vus[cle] = true; res.push({ v: w, milieu: v === milieu }); }
            });
            return res;
        };
        var places = [];
        var X = uniques(xs, g, d, mx), Y = uniques(ys, h, b, my);
        X.forEach(function (x) {
            Y.forEach(function (y) { if (!x.milieu || !y.milieu) places.push({ x: x.v, y: y.v }); });
        });
        return places;
    }

    /**
     * La place de la bulle (bw × bh) dans l'écran utile `cadre` : sans couvrir ce qu'elle évite (ses zones, le
     * contour), au bord le plus éloigné d'eux ; quand aucune place n'est libre (l'iPad en portrait), le moindre
     * recouvrement, chaque rectangle pesé de son `poids` (le contour : POIDS_CONTOUR), et la poignée sert. Pure et déterministe (la sonde la rappelle toutes les 120 ms).
     * @returns {{x:number, y:number, aire:number}}
     */
    function placerLoin(evites, bw, bh, cadre, secondaires) {
        var meilleure = null;
        evites = reduireEvites(evites);
        // LES SECONDAIRES (16 nov. 2026 : la section dont parle la bulle) ne départagent que des places qui couvrent
        // aussi peu ce que la bulle évite : jamais un champ désigné n'est couvert pour dégager la section.
        var seconds = secondaires || [];
        placesEssayees(evites.concat(seconds), bw, bh, cadre).forEach(function (p) {
            var r = { left: p.x, top: p.y, right: p.x + bw, bottom: p.y + bh };
            var cand = { x: p.x, y: p.y, aire: aireCouverte(r, evites), second: aireCouverte(r, seconds), ecart: ecartA(r, evites) };
            if (!meilleure || vautMieux(cand, meilleure)) meilleure = cand;
        });
        return { x: meilleure.x, y: meilleure.y, aire: meilleure.aire };
    }

    /** Une place vaut mieux : moins de recouvrement ; à égalité, moins de la section ; à égalité encore, plus loin. Pure. */
    function vautMieux(cand, meilleure) {
        if (cand.aire < meilleure.aire - 1) return true;
        if (cand.aire > meilleure.aire + 1) return false;
        if (cand.second < meilleure.second - 1) return true;
        return cand.second <= meilleure.second + 1 && cand.ecart > meilleure.ecart + 0.5;
    }

    /**
     * La bulle, hors téléphone : au bord le plus éloigné de ce qu'elle évite (`evites` : ses zones et le contour,
     * visibles) ; sans rien de désigné, au centre. Déplacée par la personne, elle garde sa place pour l'étape.
     */
    function placerBulle(evites, secondaires) {
        var b = etat.elements.bulle;
        poserReserveBas(0);
        var vw = largeurPage(), vh = basEcran();
        // Le filet : jamais plus haute que l'écran utile ; au-delà, son texte défile.
        b.style.maxHeight = Math.max(0, vh - 2 * MARGE) + 'px';
        // AVANT LE FILET : une bulle plus haute que l'écran utile S'ÉLARGIT (16 nov. 2026, l'iPad couché : « Poser ton
        // cadre », 761 px pour 695, passait sous le bandeau de la démo avec ses boutons). Plus large, elle a moins de
        // lignes, et ses boutons tiennent côte à côte. Jusqu'à la bulle suivante (la classe part avec `rendreBulle`).
        var utile = cadreUtile();
        if (!b.classList.contains('parcours-bulle--elargie') && hauteurNaturelle() > utile.bas - utile.haut) b.classList.add('parcours-bulle--elargie');
        if (etat.deplacee) { poserDeplacee(); return; }
        var bw = b.offsetWidth, bh = b.offsetHeight;
        var place;
        if (secondaires && secondaires.length) {
            // Une étape à section : loin de ce qu'elle désigne, puis hors de la section autant que possible.
            place = placerLoin(evites, bw, bh, cadreUtile(), secondaires);
        } else if (!evites.length && aUnLieu(etapeCourante())) {
            // La bulle guide, la page agit (règle 5) : une bulle qui présente une page, sans rien y désigner, se range
            // dans son coin, en bas à droite ; au centre, elle couvrait le texte de la page et son formulaire.
            var cadre = cadreUtile();
            place = { x: Math.max(cadre.gauche, cadre.droite - bw), y: Math.max(cadre.haut, cadre.bas - bh) };
        } else if (!evites.length) {
            place = { x: (vw - bw) / 2, y: Math.max(hautEntete() + 16, (vh - bh) / 2) };
            if (place.y + bh > vh - MARGE) place.y = Math.max(MARGE, vh - bh - MARGE);
        } else {
            place = placerLoin(evites, bw, bh, cadreUtile());
            // AVANT DE COUVRIR CE QU'ELLE ÉVITE, la bulle s'élargit aussi (16 nov. 2026 ; « Ton trimestre » à 1180 × 900 :
            // au-dessus de la rangée « session, année, nom », il reste 477 px ; haute de 476 px, la bulle y tenait à
            // 1 px près, et la ligne de la poignée, dite par la première bulle de chaque parcours, la faisait couvrir le
            // nom du trimestre). Plus large, elle est moins haute : si cette forme ne couvre PLUS RIEN de ce qu'elle
            // évite, elle la garde jusqu'à la bulle suivante ; sinon elle reprend sa largeur, et l'essai n'est pas refait
            // à chaque passage de la sonde (`parcours-bulle--etroite` ; les deux classes partent avec `rendreBulle`).
            // ⚠ « Couvre moins » ne suffit pas (mesuré le 16 nov. 2026, « Pourquoi étiqueter » à 1180 × 820) : large,
            // la bulle mordait un peu moins sur la zone de collage, mais couvrait 23 % du texte de la page au lieu de 5 %.
            if (place.aire > 0 && !b.classList.contains('parcours-bulle--elargie') && !b.classList.contains('parcours-bulle--etroite')) {
                b.classList.add('parcours-bulle--elargie');
                var large = placerLoin(evites, b.offsetWidth, b.offsetHeight, cadreUtile());
                if (large.aire <= 1) place = large;
                else { b.classList.remove('parcours-bulle--elargie'); b.classList.add('parcours-bulle--etroite'); }
            }
        }
        b.style.left = Math.round(place.x) + 'px';
        b.style.top = Math.round(place.y) + 'px';
    }

    // ---------- La poignée : déplacer la bulle ----------

    /** Pose la bulle où la personne la veut (bornée à l'écran utile) ; les flèches suivent dans le même geste. */
    function deplacerBulle(x, y) {
        etat.deplacee = { x: x, y: y };
        // La place gardée est celle où la bulle s'est arrêtée (bornée), pas celle que le pointeur visait hors de l'écran.
        etat.deplacee = poserDeplacee();
        if (etat.vus) dessinerFleches(etat.vus.zones, etat.vus.contourEl, etat.vus.vise);
    }

    function debutGlisser(ev) {
        // Un seul pointeur déplace la bulle : un second doigt posé pendant le glissement ne prend pas la main.
        if (!etat || etat.telephone || etat.glisse || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        var r = etat.elements.bulle.getBoundingClientRect();
        etat.glisse = { id: ev.pointerId, dx: ev.clientX - r.left, dy: ev.clientY - r.top };
        try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* le pointeur a déjà été relâché */ }
        etat.elements.bulle.classList.add('est-glissee');
        ev.preventDefault();
    }

    function surGlisser(ev) {
        if (!etat || !etat.glisse || ev.pointerId !== etat.glisse.id) return;
        deplacerBulle(ev.clientX - etat.glisse.dx, ev.clientY - etat.glisse.dy);
        ev.preventDefault();
    }

    function finGlisser(ev) {
        if (!etat || !etat.glisse || ev.pointerId !== etat.glisse.id) return;
        etat.glisse = null;
        etat.elements.bulle.classList.remove('est-glissee');
        try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) { /* déjà relâché */ }
    }

    /**
     * Au clavier, la poignée déplace la bulle par pas de PAS_CLAVIER. L'événement ne remonte pas à la bulle :
     * les flèches gauche et droite n'y changent pas de page.
     */
    function surTouchePoignee(ev) {
        var pas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
        if (!etat || !pas || ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        var r = etat.elements.bulle.getBoundingClientRect();
        deplacerBulle(r.left + pas[0] * PAS_CLAVIER, r.top + pas[1] * PAS_CLAVIER);
        ev.preventDefault();
        ev.stopPropagation();
    }

    // ---------- Les flèches, la section actuelle ----------

    /**
     * L'élément se voit-il ? Sa partie à l'écran n'est pas couverte en entier par autre chose : une palette flottante
     * (le « Planificateur » de la carte, 11 nov. 2026, capture 25), la bulle, une fenêtre. Le test de l'œil : en cinq
     * points de sa partie à l'écran, ce que le toucher y trouverait est lui ou l'un de ses descendants, au moins une
     * fois. Les couches du moteur ne comptent pas (elles ne prennent pas le toucher), la bulle, si. Un élément tout
     * entier hors de l'écran n'est pas jugé ici : sa flèche va au bord de l'écran, de son côté (`tracerFleche`).
     */
    function seVoit(el) {
        if (!visible(el)) return false;
        var r = el.getBoundingClientRect();
        var e = ecranGarde();
        var g = Math.max(0, r.left), h = Math.max(0, r.top), d = Math.min(e.largeur, r.right), b = Math.min(e.hauteur, r.bottom);
        if (d <= g || b <= h) return true;
        var points = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
        for (var k = 0; k < points.length; k++) {
            var t = document.elementFromPoint(g + (d - g) * points[k][0], h + (b - h) * points[k][1]);
            if (t && (t === el || el.contains(t))) return true;
        }
        return false;
    }

    /**
     * Ce dont parle la bulle : les zones qui ne sont pas ce qu'il faut toucher (ni dedans), à l'écran, et qui se voient.
     * Une zone qui contient le contour garde sa flèche (relais du 11 nov. 2026, 11 h 45 : « les zones de sujet qui ne sont
     * pas le contour gardent leur flèche »).
     */
    function sujets(zones, contourEl) {
        return (zones || []).filter(function (z) {
            return visible(z) && z !== contourEl && !(contourEl && contourEl.contains(z)) && aLEcran(z) && seVoit(z)
                // En visite, aucune flèche vers un contrôle qui écrit.
                && !(etat.enVisite && ecritDansLesDonnees(z));
        });
    }

    /**
     * Une partie de l'élément est à l'écran. Un sujet tout entier hors de l'écran n'a pas de flèche (Grégoire, 11 nov.
     * 2026, capture 31 : « il faut défiler pour voir où pointe réellement la flèche du haut ») ; ce qu'il faut toucher,
     * lui, garde la sienne vers le bord de l'écran, de son côté, quand la personne l'a fait défiler hors de la vue.
     */
    function aLEcran(el) {
        var r = el.getBoundingClientRect();
        var e = ecranGarde();
        return r.right > 0 && r.bottom > 0 && r.left < e.largeur && r.top < e.hauteur;   // l'en-tête compris (ses sections)
    }

    /** Les cibles des sujets : groupées (fondues quand elles se touchent, leur union au-delà de FLECHES_MAX). */
    function ciblesDesFleches(zones, contourEl) {
        return grouperCibles(rectsDe(sujets(zones, contourEl)), FLECHES_MAX);
    }

    /**
     * Trace les flèches de la bulle vers ses cibles ; un tracé inchangé n'est pas réécrit. `vise.fleches` : où vont
     * les flèches parmi les zones ; `vise.une` (une étape à formulaire ou en lignes) : une par champ, sans plafond ; seules
     * celles qui se touchent (à JOINT px) sont fondues.
     * LA RÈGLE DU CONTOUR (Grégoire, 11 nov. 2026, 11 h 45, quatrième aperçu) : ce qu'il faut toucher reçoit sa flèche
     * dès l'ouverture de l'étape, en plus de celles des sujets ; une étape qui a un contour n'est jamais sans flèche.
     * `nommeLeContour` : la sienne seule. Rien vers ce qui ne se voit pas (`seVoit`).
     */
    function dessinerFleches(zones, contourEl, vise) {
        var svg = etat.elements.svg;
        var b = etat.elements.bulle;
        var traces = [];
        if (visible(b)) {
            var rb = b.getBoundingClientRect();
            var ecran = ecranGarde();
            var fl = vise && vise.fleches;
            // (Un contour qui est aussi un champ du formulaire n'a qu'une flèche : `sujets` l'écarte des champs.)
            var auContour = visible(contourEl) && seVoit(contourEl) ? rectsDe([contourEl]) : [];
            var cibles = vise && vise.auContour ? auContour
                : (!fl ? ciblesDesFleches(zones, contourEl)
                    // Une par champ ; celles qui se touchent (les cellules d'une colonne) n'en font qu'une.
                    : vise.une ? fondreCibles(rectsDe(sujets(fl, contourEl)), JOINT) : ciblesDesFleches(fl, contourEl)).concat(auContour);
            // Une flèche évite de passer sur une autre cible, et sur ce qu'il faut toucher.
            var rc = visible(contourEl) ? contourEl.getBoundingClientRect() : null;
            cibles.forEach(function (r) {
                var obstacles = cibles.filter(function (o) { return o !== r; });
                if (rc && !seCroisent(rc, r, 0)) obstacles.push(rc);
                var t = tracerFleche(rb, r, ecran, obstacles);
                // La cible visée, pour les bancs (le relevé des ouvertures, tests/integration/harness/releve-bulle.js).
                if (t) traces.push({ d: t.d, cible: [r.left, r.top, r.right, r.bottom].map(Math.round).join(','), hors: t.horsEcran });
            });
        }
        var ns = 'http://www.w3.org/2000/svg';
        while (svg.childNodes.length > traces.length) svg.removeChild(svg.lastChild);
        while (svg.childNodes.length < traces.length) {
            var g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'parcours-fleche');
            ['parcours-fleche-fond', 'parcours-fleche-trait'].forEach(function (classe) {
                var chemin = document.createElementNS(ns, 'path');
                chemin.setAttribute('class', classe);
                g.appendChild(chemin);
            });
            svg.appendChild(g);
        }
        traces.forEach(function (t, k) {
            var g = svg.childNodes[k];
            g.setAttribute('data-cible', t.cible);
            if (t.hors) g.setAttribute('data-hors-ecran', ''); else g.removeAttribute('data-hors-ecran');
            if (g.getAttribute('data-trace') === t.d) return;
            g.setAttribute('data-trace', t.d);
            g.firstChild.setAttribute('d', t.d);
            g.lastChild.setAttribute('d', t.d);
        });
    }

    function effacerFleches() {
        var svg = etat.elements.svg;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
    }

    /**
     * La section actuelle : dans le menu ou la barre d'onglets qui contient le contour (son parent, ou le parent de
     * celui-ci), l'élément actif. Ni le contour lui-même, ni rien qui ne soit un bouton, un lien ou un onglet
     * (`.active` marque aussi les sections de la page).
     */
    function sectionActuelleDe(contourEl) {
        if (!visible(contourEl)) return null;
        var SEL = '.actif, .active, [aria-current]:not([aria-current="false"]), [aria-selected="true"]';
        var p = contourEl.parentElement;
        for (var n = 0; n < 2 && p && p !== document.body; n++, p = p.parentElement) {
            var liste = p.querySelectorAll(SEL);
            for (var k = 0; k < liste.length; k++) {
                var a = liste[k];
                if (a === contourEl || a.contains(contourEl) || contourEl.contains(a)) continue;
                if (a.matches('button, a, [role="tab"], [role="menuitem"], [role="option"]') && visible(a)) return a;
            }
        }
        return null;
    }

    /** Pose la mise en évidence sur la section actuelle, la retire de la précédente. Le moteur seul y touche. */
    function marquerSectionActuelle(el) {
        // Le même élément, qui porte encore sa marque (un rendu a pu réécrire ses classes) : rien à faire.
        if (etat.sectionActuelle === el && (!el || el.classList.contains('parcours-section-actuelle'))) return;
        if (etat.sectionActuelle) etat.sectionActuelle.classList.remove('parcours-section-actuelle');
        etat.sectionActuelle = el;
        if (el) el.classList.add('parcours-section-actuelle');
    }

    /**
     * La fenêtre a franchi le seuil du téléphone (rotation, écran partagé) : la bulle change de forme,
     * sans nouvelle annonce, et garde le focus si elle l'avait.
     */
    function suivreSeuil() {
        if (surTelephone() === etat.telephone) return;
        var avaitFocus = etat.elements.bulle.contains(document.activeElement);
        rendreBulle({ sansAnnonce: true });
        if (!avaitFocus) return;
        try { etat.elements.bulle.focus({ preventScroll: true }); } catch (e) { etat.elements.bulle.focus(); }
    }

    /** La page de la bulle qui porte ce passage du texte (−1 : aucune). */
    function pageQuiPorte(passage) {
        var t = typographier(passage);
        for (var k = 0; k < (etat.pages || []).length; k++) if (etat.pages[k].indexOf(t) !== -1) return k;
        return -1;
    }

    /**
     * L'écran a changé dans l'étape (`pageQuiDit`, voir « L'ÉCRAN CHANGE DANS UNE ÉTAPE ») : la bulle passe à la page
     * qui en parle, et ce que l'étape désigne est amené dans la vue, une fois. Un passage inchangé ne fait rien : la
     * personne peut tourner les pages, défiler à son gré.
     */
    function suivreEcran(etape) {
        if (!etape.pageQuiDit) return;
        var passage = null;
        try { passage = etape.pageQuiDit() || null; } catch (e) { passage = null; }
        if (!passage || passage === etat.pageDite) return;
        etat.pageDite = passage;
        var k = pageQuiPorte(passage);
        if (k !== -1 && k !== etat.page) {
            montrerPage(k);
            etat.elements.annonce.textContent = 'page ' + (k + 1) + ' de ' + etat.pages.length;
        }
        amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
    }

    /** La ligne du geste, relue (voir « LA LIGNE DU GESTE SUIT L'ÉTAT ») : changée, elle s'annonce, seule. */
    function poserGeste(etape) {
        var g = etat.elements.bulle.querySelector('.parcours-bulle-geste');
        var texte = '';
        try { texte = etape.geste ? typographier(gesteDeLEtape(etape)) : ''; } catch (e) { texte = ''; }
        if (!g || !texte || g.textContent === texte) return;
        g.textContent = texte;
        etat.elements.annonce.textContent = texte;
    }

    /**
     * Le complément, relu (voir « LE COMPLÉMENT ») : changé avec l'écran, la découpe est refaite, la bulle passe à sa
     * première page et l'annonce. Inchangé : rien, la personne tourne les pages à son gré.
     */
    function suivreComplement(etape) {
        if (!etape.complement) return;
        var items = itemsDuComplement(etape), s = JSON.stringify(items);
        if (s === etat.signatureComplement) return;
        etat.complement = items;
        etat.signatureComplement = s;
        paginer(etat.page);
        if (etat.pageComplement === -1) return;
        montrerPage(etat.pageComplement);
        etat.elements.annonce.textContent = texteDesItems(items);
    }

    /**
     * Les lignes qui suivent l'écran (`lignesVivantes`) : la liste ou les boutons ont changé, la bulle est récrite sur
     * place. Sa page reste, l'étape ne change pas, `avant` n'est pas rejoué ; le focus, s'il était dans la bulle (le
     * bouton qu'on vient de toucher n'existe plus), y revient ; la consigne neuve s'annonce.
     */
    function suivreLignes(etape) {
        if (!etape.lignesVivantes || etat.signatureLignes === null) return;
        if (signatureDesLignes(etape) === etat.signatureLignes) return;
        // Sous le zoom au pincement, rien ne se refait (voir « LE ZOOM AU PINCEMENT ») : la bulle suivra au retour.
        if (sousLeZoom()) return;
        var b = etat.elements.bulle;
        var dedans = b.contains(document.activeElement);
        var replie = etat.replie;
        rendreBulle({ sansAnnonce: true });
        etat.replie = replie;
        appliquerRepli();
        if (dedans) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
        // Un geste vient d'être fait (la bulle a changé) : le suivant est amené à l'écran s'il n'y est pas, comme
        // pour une ligne qui se grise (`majLignes`).
        etat.gesteAAmener = true;
        var consigne = b.querySelector('.parcours-bulle-ligne--geste .parcours-bulle-ligne-texte');
        etat.elements.annonce.textContent = consigne ? consigne.textContent : texteDesLignes().trim();
    }

    /** L'avis de l'étape (voir « L'AVIS ») : posé sous le texte, changé, ou retiré ; annoncé par son rôle. */
    function poserAvis(etape) {
        var b = etat.elements.bulle;
        var texte = '';
        try { texte = etape.avis ? typographier(etape.avis() || '') : ''; } catch (e) { texte = ''; }
        var p = b.querySelector('.parcours-bulle-avis');
        if (!texte) { if (p) p.remove(); return; }
        if (!p) {
            p = document.createElement('p');
            p.className = 'parcours-bulle-avis';
            p.setAttribute('role', 'status');
            var nav = b.querySelector('.parcours-bulle-nav');
            b.insertBefore(p, nav ? nav.nextSibling : null);
        }
        if (p.textContent !== texte) p.textContent = texte;
    }

    /**
     * Les boutons qui attendent (`attend`, voir « LES BOUTONS QUI ATTENDENT ») : visibles toujours, inactifs tant que la
     * condition manque, et la raison dite dessous. Un bouton sans `attend` reste actif.
     */
    function poserAttentes(etape) {
        var b = etat.elements.bulle;
        var zone = b.querySelector('.parcours-bulle-boutons');
        var ligne = b.querySelector('.parcours-bulle-attente');
        if (!zone || !ligne || !etat.boutons) return;
        var raisons = etat.boutons.map(function (def, k) {
            var btn = zone.children[k], r = '';
            try { r = btn && def.attend ? def.attend() || '' : ''; } catch (e) { r = ''; }
            if (btn && def.attend && btn.disabled !== !!r) btn.disabled = !!r;
            return r ? typographier(r) : '';
        });
        var texte = raisons.filter(Boolean).join(' ');
        if (ligne.textContent !== texte) ligne.textContent = texte;
        ligne.hidden = !texte;
    }

    /**
     * Ce qu'il faut toucher a changé dans l'étape (le geste suivant : un champ, puis un bouton) : il est amené à l'écran,
     * une fois, s'il n'y est pas (Grégoire, 11 nov. 2026, 12 h 05 : « nommer, pointer, passer par les étapes une après
     * l'autre » ; capture 32, la pondération défilée hors de l'écran). Reconnu par ce qu'il est, pas par son nœud : un
     * élément redessiné à l'identique ne fait rien défiler, et la personne garde la main sur le défilement.
     */
    function signatureDe(el) {
        if (!el) return '';
        // Pas son texte : il change sous les gestes (la dissection compte ses morceaux), et chaque changement relançait le
        // défilement (mesuré sous WebKit le 11 nov. 2026 : la palette de la dissection ne tenait plus en place).
        // `data-param` et `data-id` (12 nov. 2026, la dissection sur l'iPad) : les étiquettes de la palette partagent leur
        // action, les morceaux n'en ont pas ; sans eux, passer d'une étiquette (ou d'un morceau) à une autre ne se voyait pas.
        return [el.tagName, el.id, el.getAttribute('data-action') || '', el.getAttribute('name') || '',
            el.getAttribute('data-param') || '', el.getAttribute('data-id') || ''].join('|');
    }
    /**
     * Le contour de l'ouverture vient d'être amené avec le reste : il n'est pas « neuf » pour `suivreContour`. S'il ne se
     * voit pas encore (dans un tableau qui défile de côté : « Actions »), `suivreContour` l'amènera.
     */
    function retenirContourDOuverture(etape) {
        var c0 = contourDe(etape);
        etat.contourSuivi = visible(c0) && aLAise(c0) ? signatureDe(c0) : '';
    }
    /** Tout entier à l'écran, sous l'en-tête, et vu (rien ne le couvre). */
    function aLAise(el) {
        var r = el.getBoundingClientRect();
        var haut = hautEntete(), bas = basEcran();
        // Plus haut que l'écran (une zone de collage, une fiche) : amené dès qu'il y entre.
        if (r.height > bas - haut) return r.bottom > haut && r.top < bas && !rogne(el);
        return r.top >= haut && r.bottom <= bas && r.left >= 0 && r.right <= ecranGarde().largeur && !rogne(el);
    }
    /**
     * Rogné par son propre conteneur (un tableau qui défile de côté : « Actions ») : en son milieu, le toucher trouve un
     * de ses ancêtres. Couvert par autre chose (une palette flottante), il n'est pas « rogné » : défiler n'y changerait
     * rien, et la page bougerait sans fin.
     */
    function rogne(el) {
        var r = el.getBoundingClientRect();
        var t = document.elementFromPoint(Math.min(Math.max((r.left + r.right) / 2, 0), ecranGarde().largeur - 1),
            Math.min(Math.max((r.top + r.bottom) / 2, 0), ecranGarde().hauteur - 1));
        return !!t && t !== el && t.contains(el);
    }
    function suivreContour(contourEl) {
        var s = visible(contourEl) ? signatureDe(contourEl) : '';
        if (s === etat.contourSuivi) return;
        etat.contourSuivi = s;
        if (!s || aLAise(contourEl)) return;
        try { contourEl.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); } catch (e) { contourEl.scrollIntoView(); }
    }

    /** La pulsation autour de ce qu'il faut toucher ; pas sur ce que couvre une palette flottante (11 nov. 2026, capture 25). */
    function poserPulsation(contourEl) {
        var c = etat.elements.contour;
        if (!visible(contourEl) || !seVoit(contourEl)) { c.hidden = true; return; }
        var r = contourEl.getBoundingClientRect();
        c.hidden = false;
        c.style.left = (r.left - 5) + 'px';
        c.style.top = (r.top - 5) + 'px';
        c.style.width = (r.width + 10) + 'px';
        c.style.height = (r.height + 10) + 'px';
    }

    /** Un passage de la sonde : contour, section actuelle, bulle, flèches, puis l'état atteint. */
    function sonder() {
        if (!etat || etat.enTransition) return;
        var etape = etapeCourante();
        if (etat.opts.verifier && !etat.opts.verifier()) { fermer(); return; }
        var zoom = sousLeZoom();
        if (!zoom) {
            suivreSeuil();
            etat.hauteurGardee = window.innerHeight;
        }

        suivreLignes(etape);
        poserGeste(etape);
        suivreComplement(etape);
        poserAvis(etape);
        poserAttentes(etape);
        majLignes();
        if (!zoom) suivreEcran(etape);

        var vise = designe(etape);
        var zones = vise.zones;
        var contourEl = contourDe(etape);
        if (!zoom) suivreContour(contourEl);
        etat.vus = { zones: zones, contourEl: contourEl, vise: vise };
        etat.passages = (etat.passages || 0) + 1;

        // La couche des flèches : en px, sur la largeur de la mise en page × innerHeight, à chaque passage (le repère du
        // contour et de la bulle). Sous le zoom, elle garde l'écran d'avant : innerHeight n'en est plus que la partie visible.
        var svg = etat.elements.svg;
        if (!zoom) {
            svg.setAttribute('width', String(largeurPage()));
            svg.setAttribute('height', String(window.innerHeight));
            svg.style.width = largeurPage() + 'px';
            svg.style.height = window.innerHeight + 'px';
        }

        poserPulsation(contourEl);
        marquerSectionActuelle(sectionActuelleDe(contourEl));
        marquerLieu(etape);

        if (zoom) {
            // Sous le zoom : rien ne se replace ; les flèches suivent leurs cibles depuis la bulle où elle est.
            dessinerFleches(zones, contourEl, vise);
            if (etape.atteint) suivreAtteint(etape, zones, contourEl, vise);
            return;
        }
        // La découpe suit la largeur de la bulle (une sonde d'étape a pu la changer), avant sa place.
        suivreLargeurDesPages();
        placerSelonEtape(zones, contourEl, vise);
        if (etape.atteint) suivreAtteint(etape, zones, contourEl, vise);
    }

    /**
     * La bulle loin de ce qu'elle évite (ses zones et le contour), puis ses flèches. Sur téléphone, rien ne change : la
     * bulle rangée au bord évite les zones ET le contour.
     */
    function placerSelonEtape(zones, contourEl, vise) {
        var c = visible(contourEl) ? contourEl : null;
        // ⚠ Sur téléphone, les rectangles DU MOMENT, pas le trajet (19 nov. 2026) : leur union y règle aussi le
        // défilement de la page (`reglerDefilement`), et le trajet y rendait instable le banc du témoin « Enregistré »
        // (bulle-sur-telephone, 390 px : 2 rouges sur 5, 6 verts sur 6 sans). Le saut vécu était sur l'iPad.
        var evites = rectsDe(zones.concat(c ? [c] : []));
        if (etat.telephone) placerBulleTelephone(union(evites), c);
        else placerBulleLoin(zones, prioritaires(c));
        dessinerFleches(zones, contourEl, vise);
    }

    /** Ce que la bulle évite : ses zones, pesées 1, et ce qu'elle ne couvre que faute de mieux, pesé POIDS_CONTOUR. */
    function placerBulleLoin(zones, prio) {
        var autres = zones.filter(function (z) { return prio.indexOf(z) === -1; });
        var s = sectionDe(etapeCourante());
        placerBulle(rectsDePlace(autres).concat(rectsDePlace(prio).map(function (r) { return pese(r, POIDS_CONTOUR); })), s ? rectsDe([s.bloc]) : null);
    }

    /** Ce que la bulle ne couvre que faute de mieux : le contour, ce que l'étape déclare dans `aussiEviter`, le nom de sa section. */
    function prioritaires(c) {
        var etape = etapeCourante();
        var autres = etape && etape.aussiEviter ? (etape.aussiEviter() || []) : [];
        // Le nom de la section dont parle la bulle (règle b : à côté de la section, jamais sur son nom).
        var s = sectionDe(etape);
        if (s && s.tete) autres = autres.concat([s.tete]);
        return (c ? [c] : []).concat(autres.filter(Boolean));
    }

    /**
     * L'état atteint : l'étape suivante. Sinon, la sonde d'étape a pu changer la forme de la bulle (le
     * neuvième parcours la pose dans `atteint`) : la découpe et la place suivent dans le même passage,
     * sans image périmée.
     */
    function suivreAtteint(etape, zones, contourEl, vise) {
        var hauteur = etat.elements.bulle.offsetHeight;
        var ok = false;
        try { ok = !!etape.atteint(); } catch (e) { ok = false; }
        // En visite, l'état déjà atteint ne fait rien avancer : « Continuer » est dans la bulle.
        if (ok && !etat.enVisite) { allerA(etat.i + 1); return; }
        if (sousLeZoom()) return;
        // La hauteur aussi (10 nov. 2026) : une étape qui fait paraître un bouton à la vérification (« Continuer » du
        // huitième parcours) fait grandir la bulle ; replacée seulement au passage suivant, le bouton sautait sous le
        // doigt (le toucher sur le bouton, le relâcher sur la bulle). Banc : bouton-de-bulle-ne-saute-pas-2026-11-10.
        var largeur = suivreLargeurDesPages();
        if (largeur || etat.elements.bulle.offsetHeight !== hauteur) placerSelonEtape(zones, contourEl, vise);
    }

    /** Prépare la page pour l'étape i (`avant`), puis attend deux images qu'elle soit dessinée. */
    async function preparer(etape, i) {
        try {
            if (etape.avant) await etape.avant();
        } catch (e) {
            console.warn('[parcours] préparation de l’étape ' + (i + 1) + ' :', e);
        }
        await new Promise(function (fin) { requestAnimationFrame(function () { requestAnimationFrame(fin); }); });
    }

    /**
     * Ce que l'étape désigne puis éclaire, pour l'amener dans la vue. Le contour d'abord :
     * si l'ensemble ne tient pas à l'écran, c'est ce qu'il faut toucher qui y est amené.
     */
    function elementsVises(etape) {
        var vise = [contourDe(etape)];
        return vise.concat(designe(etape).zones).filter(Boolean);
    }

    /**
     * EN VISITE : l'état de l'étape est déjà atteint, elle se montre sans rien attendre. Une étape qui reste à faire
     * met fin à la visite : le parcours reprend son cours.
     */
    function suivreLaVisite(etape) {
        if (!etat.visite || !etape.atteint) return;
        var deja = false;
        try { deja = !!etape.atteint(); } catch (e) { deja = false; }
        etat.enVisite = deja;
        if (!deja) etat.visite = false;
    }

    /**
     * La page, à l'ouverture de l'étape. OÙ SUIS-JE : une étape où la page change s'ouvre en haut, navigation visible ;
     * rien n'y est amené dans la vue, et ce qu'il faut toucher n'est pas « neuf » pour `suivreContour` (il ferait
     * défiler la page au premier passage). Sinon, ce que l'étape désigne est amené dans la vue, comme avant.
     */
    async function ouvrirLaPage(etape) {
        var s = sectionDe(etape);
        if (s && visible(s.bloc)) {
            // LA SECTION : la page y défile, son nom sous l'en-tête ; la bulle attend la fin du mouvement.
            await defilerVers(s.tete && visible(s.tete) ? s.tete : s.bloc);
            if (!etat) return;
            var c1 = contourDe(etape);
            etat.contourSuivi = visible(c1) ? signatureDe(c1) : '';
            return;
        }
        if (aUnLieu(etape)) {
            window.scrollTo(0, 0);
            // `amener` (16 nov. 2026) : une étape qui ne fait que MONTRER (la bande d'assiduité, à la fin d'un modèle)
            // amène quand même ce qu'elle montre sous l'en-tête quand la bulle n'y tient pas à côté (mesuré à
            // 820 × 1180 : haute de 585 px, elle couvrait sept des dix points dont elle parle). Sans cela, rien ne bouge.
            if (etape.amener) amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
            var c0 = contourDe(etape);
            etat.contourSuivi = visible(c0) ? signatureDe(c0) : '';
            return;
        }
        if (!etape.centre || etat.telephone) amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
        retenirContourDOuverture(etape);
    }

    /**
     * La page défile jusqu'à `el`, posé juste sous l'en-tête, par une transition visible (règle b), et rend la main
     * quand elle ne bouge plus. Compte ses tours plutôt que l'heure : sous une horloge figée (les bancs), elle ne bouge pas.
     */
    function defilerVers(el) {
        var cible = function () { return Math.max(0, Math.round(window.scrollY + el.getBoundingClientRect().top - hautEntete() - ECART)); };
        if (Math.abs(cible() - window.scrollY) < 2) return Promise.resolve();
        try { window.scrollTo({ top: cible(), behavior: mouvementReduit() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, cible()); }
        return new Promise(function (fin) {
            var avant = null, immobile = 0, restants = 40;   // 2 s au plus
            (function tour() {
                var y = Math.round(window.scrollY);
                immobile = y === avant ? immobile + 1 : 0;
                avant = y;
                if (immobile < 3 && restants-- > 0) { setTimeout(tour, 50); return; }
                // La page a pu bouger sous le défilement (un bloc qui se referme au-dessus, un défilement de
                // l'application elle-même) : la place est reprise, d'un coup, avant que la bulle paraisse.
                if (Math.abs(cible() - window.scrollY) >= 2) window.scrollTo(0, cible());
                fin();
            })();
        });
    }

    /** La bulle cachée tant que la page d'une étape à section se met en place ; montrée ensuite. */
    function attendreLaPage(oui) {
        etat.enAttente = !!oui;
        etat.elements.bulle.classList.toggle('est-en-attente', !!oui);
    }

    async function allerA(i) {
        if (!etat) return;
        if (i >= etat.def.etapes.length) { fermer(); return; }
        etat.enTransition = true;
        etat.plusLoin = Math.max(plusLoin(), i);
        etat.i = i;
        // `surEtape` est appelé à CHAQUE étape, revue ou non (relecture croisée du 14 nov. 2026) : les définitions y
        // rangent ce que l'étape quittée a posé (extras, classes de la page, chemin), pas seulement le rang. Le rang
        // noté suit donc l'étape montrée, comme avant ce lot ; une définition rejouée en visite garde le sien elle-même
        // (« Mettre ta classe en place »).
        if (etat.opts.surEtape) etat.opts.surEtape(i);
        oublierLeRempli();
        var etape = etapeCourante();
        etat.elements.contour.hidden = true;
        // L'étape suivante reprend le placement automatique ; ses flèches et sa section actuelle seront les siennes.
        etat.deplacee = null;
        etat.glisse = null;
        etat.vus = null;
        effacerFleches();
        marquerSectionActuelle(null);
        marquerLieu(null);
        etat.enVisite = false;
        attendreLaPage(!!etape.section);
        await preparer(etape, i);
        // Le parcours a pu être fermé, ou avancé ailleurs, pendant la préparation.
        if (!etat || etat.i !== i) return;
        suivreLaVisite(etape);
        // Sur téléphone, une étape qui désigne quoi toucher sur la page (un contour) ouvre la bulle
        // repliée ; quand le geste est dans la bulle (« Continuer », et toute étape en visite), elle s'ouvre dépliée.
        etat.replie = !!etape.contour && !etat.enVisite;
        rendreBulle();
        // L'écran où l'étape s'ouvre (une reprise peut tomber sur le second) : sa page, sans défilement de plus.
        etat.pageDite = etape.pageQuiDit ? (etape.pageQuiDit() || null) : null;
        if (etat.pageDite && pageQuiPorte(etat.pageDite) > 0) montrerPage(pageQuiPorte(etat.pageDite));
        await ouvrirLaPage(etape);
        if (!etat || etat.i !== i) return;
        attendreLaPage(false);
        etat.enTransition = false;
        etat.reglerJusqua = Date.now() + REGLAGE_MS;
        sonder();
        try { etat.elements.bulle.focus({ preventScroll: true }); } catch (e) { etat.elements.bulle.focus(); }
    }

    function surTouche(ev) {
        if (!etat || ev.key !== 'Escape' || etat.def.sansEchap) return;
        var etape = etapeCourante();
        ev.stopPropagation();
        ev.preventDefault();
        if (etapesOuvertes()) { basculerEtapes(false); return; }   // Échap referme d'abord la liste des étapes
        if (!etape.sansSortie) quitter();
        else if (etat.opts.surEchap) etat.opts.surEchap(api);
    }

    function surRedimension() { sonder(); }

    function lancer(def, opts) {
        if (etat) fermer();
        retirerElements();
        etat = { def: def, i: 0, opts: opts || {}, elements: creerElements(), enTransition: false,
                 telephone: surTelephone(), replie: false, reglerJusqua: 0, texte: '', pages: [], page: 0, largeurPages: 0,
                 deplacee: null, glisse: null, vus: null, sectionActuelle: null, doigts: 0, hauteurGardee: 0, pageDite: null,
                 contourSuivi: '', complement: [], signatureComplement: '[]', pageComplement: -1,
                 lignes: [], signatureLignes: null, gesteAAmener: false, enAttente: false, entreesDuLieu: [], boutons: [], visite: !!(opts && opts.visite), enVisite: false,
                 plusLoin: 0, toutFait: false };
        document.body.classList.add('parcours-actif');
        signaler();
        if (window.transitions && typeof window.transitions.fermerBandeau === 'function') window.transitions.fermerBandeau();
        // 9 nov. 2026 : une flèche didactique déjà ouverte se retire, sans être marquée vue (la bulle parle seule).
        if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') window.accompagnement.masquerFleche();
        document.addEventListener('keydown', surTouche, true);
        window.addEventListener('resize', surRedimension);
        // En capture : le défilement d'un conteneur (une fiche, une fenêtre, le canevas) redessine aussi, sans attendre la sonde.
        window.addEventListener('scroll', surRedimension, { passive: true, capture: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', surRedimension);
            window.visualViewport.addEventListener('scroll', surRedimension);
        }
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, arreterReglage, { passive: true, capture: true }); });
        ['touchstart', 'touchend', 'touchcancel'].forEach(function (t) { window.addEventListener(t, compterDoigts, { passive: true, capture: true }); });
        etat.timer = setInterval(sonder, SONDE_MS);
        var depuis = Math.max(0, Math.min((opts && opts.depuis) || 0, def.etapes.length - 1));
        // Jusqu'où le parcours est déjà fait : ce que dit la définition (`acquis`), sinon l'étape de départ.
        var acquis = opts && typeof opts.acquis === 'number' ? opts.acquis : depuis;
        etat.plusLoin = Math.max(0, Math.min(acquis, def.etapes.length - 1));
        etat.toutFait = !!(opts && opts.toutFait);
        return allerA(depuis);
    }

    function fermer() {
        if (!etat) return;
        clearInterval(etat.timer);
        document.removeEventListener('keydown', surTouche, true);
        window.removeEventListener('resize', surRedimension);
        window.removeEventListener('scroll', surRedimension, { passive: true, capture: true });
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', surRedimension);
            window.visualViewport.removeEventListener('scroll', surRedimension);
        }
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.removeEventListener(t, arreterReglage, { passive: true, capture: true }); });
        ['touchstart', 'touchend', 'touchcancel'].forEach(function (t) { window.removeEventListener(t, compterDoigts, { passive: true, capture: true }); });
        marquerSectionActuelle(null);
        marquerLieu(null);
        oublierLeRempli();
        etat = null;
        retirerElements();
        document.documentElement.style.removeProperty('--parcours-reserve-bas');
        document.body.classList.remove('parcours-actif');
        signaler();
    }

    /**
     * CE QUE « REMPLIR » A POSÉ (Grégoire, 20 nov. 2026) : en bleu dans son champ jusqu'à la création, pour se
     * distinguer du texte par défaut des autres champs. La marque (`parcours-rempli`, posée par « Remplir »,
     * js/parcours-classe.js) part quand l'étape change (la création fait avancer) et quand le parcours se ferme.
     */
    function oublierLeRempli() {
        [].forEach.call(document.querySelectorAll('.parcours-rempli'), function (c) { c.classList.remove('parcours-rempli'); });
    }

    /** Le signal du moteur (voir « LE SIGNAL ») : lancé ou fermé. */
    function signaler() {
        try { document.dispatchEvent(new CustomEvent('parcoursMoteur', { detail: { actif: !!etat } })); } catch (e) { /* rien à dire */ }
    }

    function quitter() {
        if (!etat) return;
        var rappel = etat.opts.surQuitter;
        var i = etat.i;
        fermer();
        if (rappel) rappel(i);
    }

    var api = {
        lancer: lancer,
        fermer: fermer,
        quitter: quitter,
        actif: function () { return !!etat; },
        etapeCourante: function () { return etat ? etat.i : null; },
        // Le parcours joué est-il celui-là ? Pour les gardes d'une définition (un écouteur à elle, hors de l'étape).
        joue: function (def) { return !!etat && etat.def === def; },
        // Les bulles en pages : la page affichée et leur nombre (0 et 1 quand le texte tient).
        pageCourante: function () { return etat ? { page: etat.page, pages: etat.pages.length, largeur: etat.largeurPages } : null; },
        allerA: function (i) { return allerA(i); },
        // Le compteur (14 nov. 2026) : la liste des étapes, l'étape la plus loin atteinte, la visite.
        basculerEtapes: basculerEtapes,
        revoir: revoir,
        enVisite: function () { return !!(etat && etat.enVisite); },
        plusLoin: function () { return etat ? plusLoin() : null; },
        // Utilitaires pour les définitions de parcours.
        visible: visible,
        seVoit: seVoit,
        premierVisible: premierVisible,
        surTelephone: surTelephone,
        mouvementReduit: mouvementReduit,
        // La géométrie des flèches et du déplacement, en fonctions pures (tests/unit).
        geometrie: { tracerFleche: tracerFleche, grouperCibles: grouperCibles, bornerDeplacement: bornerDeplacement, placerLoin: placerLoin,
                     reduireEvites: reduireEvites, placesEssayees: placesEssayees },
        // Pour le relevé des bancs (tests/integration/harness/releve-bulle.js) : ce que l'étape désigne, la bulle
        // déplacée ou non, l'écran utile. Lecture seule.
        placement: function () {
            if (!etat || !etat.vus) return null;
            return { zones: etat.vus.zones.slice(), contour: etat.vus.contourEl, prioritaires: prioritaires(etat.vus.contourEl),
                     deplacee: !!etat.deplacee, passages: etat.passages || 0, zoom: sousLeZoom(),
                     telephone: etat.telephone, cadre: cadreUtile() };
        }
    };

    window.ParcoursMoteur = api;
})();
