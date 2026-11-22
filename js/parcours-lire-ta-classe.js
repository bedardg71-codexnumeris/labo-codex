/* =================================================================
   LE SEPTIÈME PARCOURS, « LIRE TA CLASSE ET INTERVENIR » (9 nov. 2026 ; deux temps depuis le 22 nov. 2026)
   plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 3.

   Le parcours suit des productions évaluées : les bandes, qui s'écarte, son profil, ce qui l'écarte, ce que
   l'application en tire, puis, si la personne le décide, une intervention notée.

   ⚠ LES TEXTES (`TEXTES`, plus bas, et rien ailleurs) sont ceux que Grégoire a validés le 22 nov. 2026, mot pour mot :
   tests/unit/sentinelle-parcours-lire-ta-classe-2026-11-22.test.js les confronte, dans les deux sens, à la section 3
   de la consigne. Ils remplacent les neuf textes du 8 nov. Les refus du panneau (`REFUS`, `REFUS_9_NOV`) restent ceux
   du code (validés les 8 et 9 nov.) ; seul le refus du modèle (`REFUS_MODELE`) est neuf, PROPOSÉ par la session.

   DEUX TEMPS (moule du 20 nov. 2026 : l'entrée, la phrase de la poignée, l'objectif, la phrase du lieu, les
   explications sans marque, les gestes marqués, l'objectif atteint et la suite suggérée, posés par le moteur) :
   · « JE REGARDE » (la Modélisation), huit bulles, dans la démo, sur le deuxième groupe, après les modèles des
     parcours 2, 3 et 4. Le personnage : Tapir Doux (DA 9900005), dont le modèle de « Recevoir » a importé la copie sans
     l'évaluer. « Remplir » de la bulle 1 pose son évaluation (D, I, I, I), par la fonction qui pose les sept
     évaluations de l'exemple (`ParcoursRecevoirModele.evaluationDeLExemple`) : elle porte la production de sa copie,
     et l'application la relie à sa copie par cette paire (DA, production). « Remplir » de la bulle 6 pose le plan de
     Grégoire dans la fiche. Rien ne s'écrit hors de la démo. « Refaire », au panneau, retire l'évaluation de Tapir et
     ses interventions de la démo (`defaireModele`), puis le modèle repart.
   · « NOUS FAISONS » (la Pratique guidée), neuf bulles, sur le groupe-cours de la personne ; huit quand une grille de
     dépistage est déjà désignée (la bulle 5 est sautée, le compteur reste « sur 9 »). Ce qui fait avancer chaque bulle
     est ce que le code faisait déjà pour l'étape correspondante (9 nov.).

   LES GARDES (lot « Les flèches des parcours », 10 nov. 2026 : toute la page se touche). Ce dont le toucher casse
   l'étape ne répond pas le temps de l'étape : les pastilles d'absence et de production de la bulle 3 et les liens des
   cartes de la bulle 4 (ils quittent le profil), le statut de la bulle 8 (il écrirait sur l'intervention créée) ; en
   « Je regarde », à la bulle 2, les pastilles des autres et celles de A et de C de Tapir (le modèle regarde le P de
   Tapir). Une étape les nomme dans `gardes` ; un écouteur en capture les neutralise (`garder`).
   ================================================================= */
(function () {
    'use strict';

    var ID = 'lire-ta-classe';
    var M = function () { return window.ParcoursMoteur; };
    var K = function () { return window.ParcoursClasse; };

    // Les deux refus du panneau, validés par Grégoire (8 nov.).
    var REFUS = {
        sansPresences: "Commence par « Mettre ta classe en place » : tes présences donnent le premier signal.",
        personneSignalee: "Personne ne s'écarte dans ton groupe pour l'instant. Reviens quand le Suivi signale quelqu'un."
    };

    // Validés par Grégoire le 9 nov. (9 h 37 à 9 h 39), mot pour mot. Dans la démo, « Commencer » ne la
    // quitte pas lui-même : le panneau dit seulement pourquoi.
    var REFUS_9_NOV = {
        demo: 'Ce parcours se joue sur ta propre classe : quitte la démonstration pour le commencer.',
        service: 'Ce parcours se joue sur un groupe-cours : choisis-en un dans l\'en-tête pour le commencer.',
        rai: "Ce parcours passe par l'onglet « Accompagnement » du profil : coche « Appliquer une adaptation du modèle de la Réponse à l'intervention » dans Labo › Observation pour le commencer.",
        acp: "Ce parcours passe par l'onglet « Engagement ACP » du profil : coche « Activer la collecte des données sur le contexte d'apprentissage et la performance » dans Labo › Observation pour le commencer.",
        anonymisation: 'En mode anonymisation, une intervention ne garde ni son titre ni tes observations : reviens au mode normal pour faire ce parcours.',
        // La bulle 2, quand la personne choisie n'a aucune donnée (son Accompagnement n'a pas de « + Nouvelle
        // intervention ») : dit pourquoi le parcours ramène aux noms (validé le 9 nov., inchangé le 22 nov.).
        sansDonnee: "Son profil n'a encore aucune donnée que l'Accompagnement puisse lire : choisis une autre personne."
    };

    // PROPOSÉ par la session (22 nov. 2026), sur le modèle du refus d'« Évaluer » : le panneau, sans le modèle de
    // « Recevoir » (la copie de Tapir Doux n'est pas importée dans la démo). Posé dans l'aperçu, à valider par Grégoire.
    var REFUS_MODELE = "Commence par la Modélisation de « Recevoir les productions, rendre tes rétroactions » : ce modèle évalue la production de Tapir Doux, qu'on y importe.";

    // =================================================================
    // LES TEXTES — VALIDÉS PAR GRÉGOIRE LE 22 NOV. 2026, MOT POUR MOT (consigne du 22 nov., § 3.1 et § 3.2)
    // Une bulle : `titre` ; `confirme` (la ligne en petit au-dessus du titre, « C'est fait : … ») ; `lieuSuite` (la suite
    // de la phrase du lieu, que le moteur ouvre par « Tu es dans « X », à l'onglet « Y » », noms lus dans le menu) ;
    // `lignes` : ['n', explication] sans marque, ['g', geste] (→), ['c', geste principal] (→→, en gras) ; `puis` : la
    // bulle après le geste (« Puis : » de la consigne). L'entrée, l'objectif, l'objectif atteint et la suite suggérée sont
    // posés par le moteur (`OBJECTIFS`, la définition).
    // Les deux lignes à crochets de la bulle 4 de « Je regarde » sont remplies d'après l'écran (mesure M4, 22 nov.,
    // dans la démo : la carte RàI de Tapir Doux après son évaluation D, I, I, I), mot pour mot, entre guillemets.
    // =================================================================

    var OBJECTIFS = {
        modele: "À la fin de ce parcours, tu seras en mesure d'expliquer comment tu passes, dans l'application, d'un signal dans ta classe à une intervention que tu décides et que tu prépares.",
        modeleAtteint: "Objectif atteint : tu es en mesure d'expliquer comment tu passes, dans l'application, d'un signal dans ta classe à une intervention que tu décides et que tu prépares.",
        pratique: "À la fin de ce parcours, tu seras en mesure d'utiliser le suivi de ta classe pour planifier une intervention auprès d'un·e étudiant·e qui a besoin de toi.",
        pratiqueAtteint: "Objectif atteint : tu es en mesure d'utiliser le suivi de ta classe pour planifier une intervention auprès d'un·e étudiant·e qui a besoin de toi."
    };

    // Ce que la carte RàI de Tapir Doux affiche (mesure M4) : les crochets de la bulle 4, et ce que le banc relit à l'écran.
    var ECRAN_M4 = Object.freeze({
        niveau: 'Niveau 2 - Préventif',
        phrase: "Ses derniers résultats sont sous le seuil minimal de réussite. La note du cours ne s'affiche pas encore.",
        defi: 'Nuance'
    });

    var TEXTES = {
        modele: [
            {
                titre: "Ta classe d'un coup d'œil",
                lieuSuite: ": c'est là que tu vois où en est chaque étudiant·e de ton groupe.",
                lignes: [
                    ['n', "Dans la démo, tu regardes ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données."],
                    ['n', "Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », le suivi de tes cibles viendra dans une prochaine version."],
                    ['n', "Tu sais déjà, en rendant des productions évaluées, qui a eu de la difficulté. Ici, l'application garde ces résultats en mémoire et les met sous tes yeux avant le prochain cours."],
                    ['n', "Chaque point blanc est un·e étudiant·e. Dans ce parcours, on regarde surtout la bande « Performance (P) » : elle vient des évaluations."],
                    ['n', "Tapir Doux t'a remis sa production, mais elle n'est pas encore évaluée : il n'a pas de point sur cette bande."],
                    ['c', "Regarde l'exemple se remplir : touche « Remplir »"]
                ],
                puis: {
                    lignes: [
                        ['n', "L'exemple vient d'évaluer la production de Tapir Doux : D pour la structure, I pour les trois autres critères."],
                        ['n', "Sur la bande « Performance (P) », son point vient d'apparaître, à l'écart des autres."],
                        ['c', "Touche « Détails » pour mettre un nom sur chaque point"]
                    ]
                }
            },
            {
                titre: "Qui s'écarte ?",
                confirme: "C'est fait : chaque point a maintenant un nom.",
                lignes: [
                    ['n', "À côté de chaque nom, trois pastilles : A pour l'assiduité, C pour la complétion (les productions remises), P pour la performance."],
                    ['n', "Ce sont des indices : des pourcentages que l'application calcule à partir de ce que tu saisis."],
                    ['n', "Une pastille colorée signale un indice sous un seuil. Les seuils de la démo sont déjà posés ; avec ta classe, c'est toi qui les règles."],
                    ['n', "Regarde la ligne « Doux, Tapir » : son A et son C sont au plus haut, son P est le plus bas du groupe."],
                    ['n', "Repérer ainsi qui pourrait avoir besoin d'une première aide sans l'avoir demandée, c'est ce qu'on appelle le dépistage."],
                    ['c', "Touche le P de Tapir Doux : son profil rassemble ce que l'application a gardé de lui"]
                ]
            },
            {
                titre: "Ce qui l'écarte",
                confirme: "C'est fait : le profil de Tapir Doux est ouvert.",
                lieuSuite: ": c'est là que tu retrouves ce que l'application garde sur chaque étudiant·e.",
                lignes: [
                    ['n', "Le profil s'ouvre sur « Engagement ACP » : A, C et P, les mêmes lettres que les pastilles."],
                    ['n', "Assiduité : aucune absence, aucun retard."],
                    ['n', "Complétion : toutes les productions sont remises."],
                    ['n', "Tapir Doux vient au cours et remet ce que tu demandes. Ce n'est pas son engagement qui l'écarte : c'est ce que sa production montre."],
                    ['n', "Sans son évaluation gardée en mémoire, rien ne l'aurait signalé : il est présent, il remet son travail, il ne demande rien."],
                    ['c', "Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire"]
                ]
            },
            {
                titre: "De quoi il a besoin",
                confirme: "C'est fait : tu as ouvert « Accompagnement ».",
                lignes: [
                    ['n', "La carte « Contexte d'apprentissage » résume son assiduité et sa complétion : rien ne l'arrête de ce côté."],
                    ['n', "La carte « Modèle de la Réponse à l'intervention (RàI) » dose l'aide en trois niveaux : au niveau 1, ton enseignement en classe suffit ; au niveau 2, une aide préventive s'ajoute, souvent en petit groupe ; au niveau 3, l'aide devient intensive et souvent individuelle."],
                    ['n', "Elle situe Tapir Doux au « " + ECRAN_M4.niveau + " » : « " + ECRAN_M4.phrase + " »."],
                    ['n', "« Défi principal : " + ECRAN_M4.defi + " ». Le défi, c'est le critère de la grille où ses résultats sont les plus bas."],
                    ['n', "Le niveau indique l'intensité de l'aide requise par ton étudiant·e ; le défi dit où porter cette aide, concrètement."],
                    ['n', "Mais l'intervention, c'est toi qui la décides et c'est toi qui la prépares."],
                    ['c', "Touche « Continuer »"]
                ]
            },
            {
                titre: "Ouvrir l'intervention",
                confirme: "C'est fait : tu as lu son niveau et son défi.",
                lignes: [
                    ['n', "Une intervention, c'est ce que tu fais de plus pour un·e étudiant·e : une rencontre à ton bureau, une reprise en petit groupe. Tu en fais déjà ; ici, tu peux en garder la trace."],
                    ['n', "La noter est facultatif : tu peux utiliser l'application sans le faire."],
                    ['n', "Notée, elle te rend deux services : elle garde ce que tu as fait et elle fige un « avant » de ses résultats, pour que tu voies ensuite s'ils ont bougé."],
                    ['n', "Sous les cartes, « HISTORIQUE » rassemblera ses interventions. Pour l'instant, il n'y en a aucune."],
                    ['c', "Touche « + Nouvelle intervention »"]
                ]
            },
            {
                titre: "Ton plan",
                confirme: "C'est fait : une fiche est ouverte, « Planifier une intervention ».",
                lieuSuite: ": c'est là que tu prépares tes interventions et que tu les retrouves.",
                lignes: [
                    ['n', "Sous « Marquer les présences et notes individuelles », Tapir Doux est déjà coché."],
                    ['n', "La date d'aujourd'hui est déjà inscrite ; avec ta classe, tu y mets le jour de la rencontre."],
                    ['c', "Regarde l'exemple se remplir : touche « Remplir »"]
                ],
                puis: {
                    lignes: [
                        ['n', "« Titre : » : « Rencontre individuelle : de la lecture à l'interprétation »."],
                        ['n', "« Niveau RàI : » : « Niveau 3 – Intensif, individuel », pour une période. Le niveau d'une intervention, c'est toi qui le choisis."],
                        ['n', "« Description (optionnel) : » : le plan de la rencontre, un constat puis cinq étapes."],
                        ['n', "« Critères ciblés » : seule la rigueur reste cochée. On n'agit pas sur tout à la fois : l'exemple choisit un seul critère."],
                        ['n', "« Objectif visé » : ce que tu espères voir changer."],
                        ['g', "Lis le plan"],
                        ['c', "Touche « Créer l'intervention »"]
                    ]
                }
            },
            {
                titre: "Après l'intervention",
                confirme: "C'est fait : l'intervention est créée. Son statut est « En préparation ».",
                lignes: [
                    ['n', "Ce qui suit, tu le feras après la rencontre. Dans la démo, on le lit sans le faire."],
                    ['n', "Tu rouvres la fiche (à l'onglet « Interventions », par le bouton « Ouvrir »), tu coches sa présence et tu notes ce que tu as observé sous « Observations générales »."],
                    ['n', "Tu choisis ensuite « Complétée » : le « Bilan post-intervention » apparaît. Pour chaque critère ciblé, il compare ses résultats avant et après."],
                    ['n', "Une remontée n'est qu'un signe : qui part du plus bas remonte souvent un peu, même sans intervention."],
                    ['c', "Touche « Continuer »"]
                ]
            },
            {
                titre: "La suite",
                confirme: "C'est fait : tu as vu ce qui suit une intervention.",
                lignes: [
                    ['n', "L'application n'a rien décidé à ta place : elle a gardé des gestes que tu fais déjà et les a mis sous tes yeux, du point à l'écart jusqu'au plan pour une personne."],
                    ['n', "Elle rend visible et explicite ce qui est parfois sous-entendu et silencieux."]
                ]
            }
        ],
        pratique: [
            {
                titre: "Ta classe d'un coup d'œil",
                lieuSuite: ": c'est là que tu vois où en est chaque étudiant·e de ton groupe.",
                lignes: [
                    ['n', "Cette fois, c'est ta propre classe : ce que tu vois vient de tes présences et de tes évaluations, et l'intervention que tu créeras restera dans ton application."],
                    ['n', "Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », le suivi de tes cibles viendra dans une prochaine version."],
                    ['n', "Chaque point blanc est un·e de tes étudiant·es. Sa place sur une bande dit où il ou elle en est."],
                    ['n', "La bande « Assiduité (A) » vient de tes présences. Les deux autres, « Complétion (C) » et « Performance (P) », se remplissent à mesure que tu reçois des productions et que tu les évalues."],
                    ['n', "Les zones de couleur viennent de tes propres seuils."],
                    ['c', "Touche « Détails » pour mettre un nom sur chaque point"]
                ]
            },
            {
                titre: "Qui s'écarte ?",
                confirme: "C'est fait : chaque point a maintenant un nom.",
                lignes: [
                    ['n', "À côté de chaque nom, trois pastilles : A pour l'assiduité, C pour la complétion, P pour la performance. Ce sont des indices : des pourcentages que l'application calcule à partir de ce que tu saisis."],
                    ['n', "Une pastille colorée signale un indice sous l'un de tes seuils."],
                    ['n', "Pour ne garder que les personnes qui s'écartent, touche un filtre : « A ou C < … » pour l'assiduité ou la complétion, « P < … » pour la performance (le pourcentage affiché est ton seuil). Elles remontent en tête de la liste."],
                    ['n', "Repérer ainsi qui pourrait avoir besoin d'une première aide sans l'avoir demandée, c'est ce qu'on appelle le dépistage."],
                    ['g', "Choisis une personne que tu veux regarder de plus près"],
                    ['c', "Touche son A, son C ou son P : son profil s'ouvre"]
                ]
            },
            {
                titre: "Ce qui l'écarte",
                confirme: "C'est fait : son profil est ouvert.",
                lieuSuite: ": c'est là que tu retrouves ce que l'application garde sur chaque étudiant·e.",
                lignes: [
                    ['n', "Le profil s'ouvre sur « Engagement ACP » : A, C et P, les mêmes lettres que les pastilles."],
                    ['n', "Sous Assiduité, chaque absence ou retard porte sa date. Si tu as donné un contenu à tes séances, son titre s'affiche aussi : tu sais ce qu'il ou elle a manqué."],
                    ['n', "Sous Complétion, tu vois les productions qui manquent."],
                    ['n', "Ces deux signaux arrivent avant la première évaluation : ils te permettent d'agir tôt."],
                    ['n', "Si rien n'y paraît, ce sont ses évaluations qui l'écartent."],
                    ['c', "Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire"]
                ]
            },
            {
                titre: "De quoi il ou elle a besoin",
                confirme: "C'est fait : tu as ouvert « Accompagnement ».",
                lignes: [
                    ['n', "La carte « Contexte d'apprentissage » résume son assiduité et sa complétion en une phrase, avec une piste. Quand l'une ou l'autre est basse, une rencontre peut aider à comprendre ce qui se passe."],
                    ['n', "La carte « Modèle de la Réponse à l'intervention (RàI) » dose l'aide en trois niveaux : au niveau 1, ton enseignement en classe suffit ; au niveau 2, une aide préventive s'ajoute, souvent en petit groupe ; au niveau 3, l'aide devient intensive et souvent individuelle."],
                    ['n', "Elle situe ton étudiant·e à l'un de ces niveaux, d'après ses évaluations et ton seuil minimal de réussite. La phrase sous le niveau dit pourquoi."],
                    ['n', "« Défi principal : » nomme le critère de ta grille où ses résultats sont les plus bas."],
                    ['n', "Si ses productions ne montrent pas encore de difficulté, le niveau reste au 1 ou « En attente » : c'est alors le contexte qui parle."],
                    ['n', "Le niveau indique l'intensité de l'aide requise par ton étudiant·e ; le défi dit où porter cette aide, concrètement."],
                    ['n', "Mais l'intervention, c'est toi qui la décides et c'est toi qui la prépares."],
                    ['c', "Touche « Continuer »"]
                ]
            },
            {
                titre: "Ta grille de dépistage",
                confirme: "C'est fait : tu as lu son niveau.",
                lignes: [
                    ['n', "Son profil ne nomme aucun défi : l'application ne sait pas encore à quels critères comparer ses résultats."],
                    ['n', "Il lui faut ta grille de dépistage : celle dont les critères reviennent le plus souvent dans tes évaluations."],
                    ['n', "L'application reconnaît un critère à son nom : dans tes autres grilles, elle ne retient que les critères qui portent le même nom qu'un critère de celle-ci."],
                    ['c', "Touche « Régler les outils d'observation »"]
                ],
                puis: {
                    lieuSuite: ": c'est là que tu règles ce que l'application observe pour toi.",
                    lignes: [
                        ['n', "Chaque réglage s'enregistre dès que tu le changes."],
                        ['c', "Choisis ta grille dans « Grille de critères pour le dépistage » (tu reviendras ensuite à son profil)"]
                    ]
                }
            },
            {
                titre: "Ouvrir l'intervention",
                confirme: "C'est fait : tu as lu son niveau et son défi.",
                // Après la bulle 5 : la confirmation et la phrase du lieu, à la place (« Tu es revenu·e dans « Suivi », à
                // l'onglet « Profils ». », le moteur la pose, les noms lus dans le menu).
                apresLaGrille: { confirme: "C'est fait : ta grille de dépistage est choisie.", lieuVerbe: 'Tu es revenu·e dans' },
                lignes: [
                    ['n', "Une intervention, c'est ce que tu fais de plus pour un·e étudiant·e ou pour quelques-un·es : une rencontre à ton bureau, une reprise en petit groupe. Tu en fais déjà ; ici, tu peux en garder la trace."],
                    ['n', "La noter est facultatif : tu peux utiliser l'application sans le faire."],
                    ['n', "Notée, elle te rend deux services : elle garde ce que tu as fait et elle fige un « avant » de ses résultats, pour que tu voies ensuite s'ils ont bougé."],
                    ['n', "Sous les cartes, « HISTORIQUE » rassemblera ses interventions."],
                    ['c', "Touche « + Nouvelle intervention »"]
                ]
            },
            {
                titre: "Ton plan",
                confirme: "C'est fait : une fiche est ouverte, « Planifier une intervention ».",
                lieuSuite: ": c'est là que tu prépares tes interventions et que tu les retrouves.",
                lignes: [
                    ['n', "Sous « Marquer les présences et notes individuelles », son nom est déjà coché."],
                    ['g', "Donne un titre à ton intervention, sous « Titre : »"],
                    ['g', "Mets le jour prévu sous « Date : » (la date d'aujourd'hui y est déjà)"],
                    ['g', "Choisis son niveau, sous « Niveau RàI : » : « Niveau 2 – Préventif, en groupe ciblé » ou « Niveau 3 – Intensif, individuel » (l'application en propose un d'après son profil ; c'est toi qui choisis)"],
                    ['g', "Écris ton plan sous « Description (optionnel) : » : ce que tu comptes faire, en quelques lignes"],
                    ['g', "Sous « Critères ciblés », garde cochés ceux sur lesquels tu veux agir (ce sont eux que le bilan comparera, avant et après)"],
                    ['g', "Écris sous « Objectif visé » ce que tu espères voir changer"],
                    ['c', "Touche « Créer l'intervention » (ensuite, la fiche s'enregistre d'elle-même à chaque changement)"],
                    ['n', "Au niveau 2, tu peux cocher d'autres étudiant·es qui partagent ce besoin, et « Contexte de l'intervention : » te demande si elle se tient pendant le cours ou dans une séance de rattrapage."],
                    ['n', "Ton intervention porte plutôt sur ses absences ou sur ses remises ? Les critères ne sont pas nécessaires : décoche-les et écris ton objectif."]
                ]
            },
            {
                titre: "Après l'intervention",
                confirme: "C'est fait : ton intervention est créée. Son statut est « En préparation ».",
                lignes: [
                    ['n', "Ce qui suit, tu le feras une fois l'intervention donnée."],
                    ['n', "Tu rouvres la fiche (à l'onglet « Interventions », par le bouton « Ouvrir », ou depuis son profil), tu coches les personnes présentes et tu notes ce que tu as observé sous « Observations générales »."],
                    ['n', "Tu choisis ensuite « Complétée ». Une case t'offre alors de reporter ces présences dans ta saisie : c'est toi qui décides si la présence à l'intervention compense une absence au cours."],
                    ['n', "Le « Bilan post-intervention » apparaît : pour chaque critère ciblé, les résultats avant et après, puis « Objectif atteint ? » et « Suite envisagée »."],
                    ['n', "Une remontée n'est qu'un signe : qui part du plus bas remonte souvent un peu, même sans intervention."],
                    ['c', "Touche « Continuer »"]
                ]
            },
            {
                titre: "La suite",
                confirme: "C'est fait : tu sais ce qui t'attend après l'intervention.",
                lignes: [
                    ['n', "Ta première intervention est notée. L'application garde pour toi les signaux, l'historique et l'« avant » de chaque intervention."],
                    ['n', "Avant chaque cours, un coup d'œil à l'onglet « Groupe » te dit qui a besoin de toi."]
                ]
            }
        ]
    };

    // CE QUE « REMPLIR » ÉCRIT DANS LA FICHE (bulle 6 de « Je regarde ») : le plan de Grégoire, validé le 15 nov. 2026, mot
    // pour mot (consigne du 22 nov., § 3.1). La description : le constat, puis chaque étape sur sa propre ligne.
    var PLAN = Object.freeze({
        titre: "Rencontre individuelle : de la lecture à l'interprétation",
        niveau: '3',
        duree: '1',
        critere: 'Rigueur',
        objectif: "Appliquer trois stratégies de lecture à « Deux-Rives » et en tirer une HOC formulée en une phrase.",
        description: [
            "Constat : il surligne de longs passages sans rien écrire, n'applique que deux stratégies et réagit au texte plutôt que de l'interpréter.",
            "1. Reprendre un passage qu'il a surligné en entier (le portrait d'Aurore-Délia) : quels traits du personnage y lit-on ? Écrire chacun dans la marge.",
            "2. Changer une réaction en observation : devant « Personne en pose », il a écrit « triste :( ». Qu'est-ce qui, dans la phrase, produit cet effet ?",
            "3. Appliquer la stratégie qui manque, la temporalité : que disent le calendrier de novembre 2011 et « depuis douze ans » sur la vie d'Aurore-Délia ?",
            "4. Rapprocher deux observations : il a vu « beaucoup de novembre » ; que révèle ce motif quand on le relie aux bottes jamais déplacées ?",
            "5. Formuler son HOC en une phrase complète, à partir de ce qu'il a relevé : « L'auteur cherche à… »"
        ].join('\n')
    });

    // Le personnage du modèle : sa copie est importée par le modèle de « Recevoir », sans évaluation ; la sienne est posée
    // ici (Structure, Rigueur, Plausibilité, Nuance), décision du 15 nov. 2026.
    var TAPIR = Object.freeze({ da: '9900005', nom: 'Tapir Doux', niveaux: Object.freeze(['D', 'I', 'I', 'I']) });

    // Ce que le parcours retient en chemin : la personne choisie à la bulle 2, la fiche ouverte à la bulle 6, le passage
    // par la grille de dépistage (bulle 5). En mémoire seulement : après un rechargement, « Reprendre » repart du choix
    // de la personne (bulle 2), sauf aux deux dernières bulles, qui n'en ont pas besoin pour se lire.
    var memoire = { da: null, ficheId: null, parLaGrille: false };

    // Le temps joué : la Modélisation (dans la démo) ou la Pratique guidée.
    var enModele = false;

    // ---------- Lectures ----------

    function enDemo() { return typeof estEnModeDemo === 'function' && estEnModeDemo(); }
    function surService() { return typeof contexteActifEstService === 'function' && contexteActifEstService(); }
    function enAnonymisation() { return typeof estModeAnonymisation === 'function' && estModeAnonymisation(); }
    function preferenceActive(nom) { return typeof obtenirPreference !== 'function' || obtenirPreference(nom) !== false; }

    function etudiantsActifs() {
        var liste = typeof obtenirEtudiantsCoursActif === 'function' ? (obtenirEtudiantsCoursActif() || []) : [];
        return liste.filter(function (e) {
            return e && e.da && !(typeof estEtudiantExclu === 'function' && estEtudiantExclu(e));
        });
    }

    /**
     * Le groupe-cours actif a-t-il des présences saisies, et qui s'écarte ? « Présences saisies » :
     * au moins une personne dont l'assiduité est connue (la bande A a un point). « Signalée » : A ou C
     * sous le seuil le plus bas (le filtre « A ou C < … » du Suivi), ou un niveau RàI 2 ou 3.
     * @returns {{ avecPresences: boolean, signales: string[] }}
     */
    function lireLeGroupe() {
        var lecture = { avecPresences: false, signales: [] };
        if (typeof calculerTousLesIndices !== 'function') return lecture;
        var borne = typeof window.borneBasseAssiduiteCompletion === 'function' ? window.borneBasseAssiduiteCompletion() : 0;
        var sous = function (v) { return typeof v === 'number' && Number.isFinite(v) && v < borne; };
        if (typeof demarrerCacheLecture === 'function') demarrerCacheLecture();
        try {
            etudiantsActifs().forEach(function (e) {
                var ind = calculerTousLesIndices(e.da) || {};
                if (ind.A !== null && ind.A !== undefined) lecture.avecPresences = true;
                var rai = typeof determinerNiveauRaiPedagogique === 'function' ? determinerNiveauRaiPedagogique(e.da) : null;
                if (sous(ind.A) || sous(ind.C) || (rai && rai.niveau >= 2)) lecture.signales.push(e.da);
            });
        } finally {
            if (typeof terminerCacheLecture === 'function') terminerCacheLecture();
        }
        return lecture;
    }

    /** La condition d'entrée de la Pratique guidée : null si elle peut se lancer, sinon ce que le panneau dit. */
    function refus() {
        if (enDemo()) return REFUS_9_NOV.demo;
        if (surService()) return REFUS_9_NOV.service;
        var groupe = lireLeGroupe();
        if (!groupe.avecPresences) return REFUS.sansPresences;
        if (!groupe.signales.length) return REFUS.personneSignalee;
        if (!preferenceActive('activerRai')) return REFUS_9_NOV.rai;
        if (!preferenceActive('depistageAcp')) return REFUS_9_NOV.acp;
        if (enAnonymisation()) return REFUS_9_NOV.anonymisation;
        return null;
    }

    /** Pendant la Pratique guidée : ce qui la rend impossible la ferme (elle attend dans le panneau). */
    function contexteTient() {
        return !enDemo() && !surService() && !enAnonymisation()
            && preferenceActive('activerRai') && preferenceActive('depistageAcp');
    }

    /** Une personne sans aucune donnée n'a, dans son Accompagnement, ni historique ni « + Nouvelle intervention ». */
    function sansDonnee(da) {
        if (typeof window.aucuneDonneeDeSuivi !== 'function' || typeof calculerTousLesIndices !== 'function') return false;
        try { return !!window.aucuneDonneeDeSuivi(da, calculerTousLesIndices(da)); } catch (e) { return false; }
    }

    function dansLeGroupe(da) {
        return !!da && etudiantsActifs().some(function (e) { return e.da === da; });
    }

    function grilleDeDepistageManque() {
        var d = typeof window.diagnostiquerGrilleReferenceDepistage === 'function' ? window.diagnostiquerGrilleReferenceDepistage() : null;
        return !!(d && d.raison === 'aucune-grille-designee');
    }

    function interventionEnregistree(id) {
        if (!id || typeof window.obtenirInterventions !== 'function') return false;
        return (window.obtenirInterventions() || []).some(function (i) { return i && i.id === id; });
    }

    // ---------- Le modèle : la démo, le deuxième groupe, Tapir Doux ----------

    function deLaDemo(nom) {
        var v = typeof db !== 'undefined' ? db.getSync('demo_' + nom, []) : [];
        return Array.isArray(v) ? v : [];
    }
    function deuxiemeGroupe() { return K() && typeof K().deuxiemeGroupe === 'function' ? K().deuxiemeGroupe() : null; }
    function groupeCoursActifId() {
        var gc = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null;
        return gc && gc.id ? gc.id : null;
    }
    function surLeDeuxiemeGroupe() { var g = deuxiemeGroupe(); return !!g && groupeCoursActifId() === g.id; }

    /** La copie de Tapir Doux importée dans la démo (le modèle de « Recevoir ») : elle dit la production du modèle. */
    function copieDeTapir() {
        return deLaDemo('fichiersTravaux').find(function (f) { return f && String(f.etudiantDA) === TAPIR.da && f.productionId; }) || null;
    }

    function evaluationDeTapir() {
        var c = copieDeTapir();
        if (!c) return null;
        return deLaDemo('evaluationsSauvegardees').find(function (e) {
            return e && String(e.etudiantDA) === TAPIR.da && e.productionId === c.productionId && !e.remplaceeParId;
        }) || null;
    }

    function interventionsDeTapir() {
        return deLaDemo('interventions').filter(function (i) { return i && Array.isArray(i.etudiants) && i.etudiants.indexOf(TAPIR.da) !== -1; });
    }

    function refusModele() { return deuxiemeGroupe() && copieDeTapir() ? null : REFUS_MODELE; }

    function rafraichirLeSuivi() {
        window._moyennesQualifies = null;
        window._moyennesToutes = null;
        if (sousSectionVisible('suivi-groupe') && typeof window.chargerTableauBordApercu === 'function') window.chargerTableauBordApercu();
    }

    /**
     * « Remplir », bulle 1 : l'évaluation D, I, I, I de Tapir Doux, posée dans la démo SEULEMENT (la clé écrite doit être
     * celle de la démo), en ajout, comme les sept évaluations de l'exemple (`evaluationDeLExemple` : les champs du
     * formulaire, verrouillée, sa note et sa rétroaction calculées par l'application). Elle porte la production de sa
     * copie : l'application les relie par la paire (DA, production) (`trouverEvaluationPourFichier`).
     * @returns {boolean} posée (ou déjà là)
     */
    function poserLEvaluationDeTapir() {
        if (!enDemo() || evaluationDeTapir()) return !!evaluationDeTapir();
        var cleEvals = typeof cle === 'function' ? cle('evaluationsSauvegardees') : '';
        var R = window.ParcoursRecevoirModele;
        var e = R && typeof R.evaluationDeLExemple === 'function' ? R.evaluationDeLExemple(TAPIR.da, TAPIR.niveaux.slice()) : null;
        var c = copieDeTapir();
        if (!e || !c || e.productionId !== c.productionId || cleEvals.indexOf('demo_') !== 0) return false;
        db.setSync(cleEvals, (db.getSync(cleEvals, []) || []).concat([e]));
        rafraichirLeSuivi();
        return true;
    }

    /**
     * « Refaire » (au panneau) : ce que CE modèle a écrit dans la démo, et rien d'autre — l'évaluation de Tapir Doux et
     * ses interventions. Les clés écrites doivent être celles de la démo. Les autres traces (les modèles d'avant, le
     * cinquième critère du parcours 8, l'évaluation d'Antilope Vaillante) restent.
     * La démo s'ouvre d'abord si elle ne l'est pas (« Refaire » se touche aussi hors d'elle).
     * @returns {Promise<boolean>} false si la démo ne s'ouvre pas (rien n'est touché)
     */
    async function defaireModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return false;
        var cleEvals = cle('evaluationsSauvegardees'), cleInterv = cle('interventions');
        if (cleEvals.indexOf('demo_') !== 0 || cleInterv.indexOf('demo_') !== 0) return false;
        var e = evaluationDeTapir();
        if (e) db.setSync(cleEvals, (db.getSync(cleEvals, []) || []).filter(function (x) { return !x || x.id !== e.id; }));
        var ids = interventionsDeTapir().map(function (i) { return i.id; });
        if (ids.length) db.setSync(cleInterv, (db.getSync(cleInterv, []) || []).filter(function (i) { return !i || ids.indexOf(i.id) === -1; }));
        window._moyennesQualifies = null;
        window._moyennesToutes = null;
        memoire.da = null;
        memoire.ficheId = null;
        return true;
    }

    // ---------- La page ----------

    // Compte ses tours plutôt que l'heure : sous une horloge figée (les bancs), Date.now() ne bouge pas.
    function attendre(condition, delai) {
        var restants = Math.ceil((delai || 2000) / 50);
        return new Promise(function (ok) {
            (function tour() {
                var v = false;
                try { v = !!condition(); } catch (e) { v = false; }
                if (v || restants-- <= 0) { ok(v); return; }
                setTimeout(tour, 50);
            })();
        });
    }

    function sectionCourante() { return typeof sectionActive !== 'undefined' ? sectionActive : null; }

    function sousSectionVisible(id) {
        var el = document.getElementById(id);
        return !!(el && M().visible(el));
    }

    function aller(section, sous) {
        if (sousSectionVisible(section + '-' + sous)) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    function boutonDetails() { return document.getElementById('btn-toggle-panneau-prioritaire'); }
    function panneauNoms() { return document.getElementById('panneau-suivi-etudiants'); }

    function pastillesOuvertes() {
        var b = boutonDetails(), p = panneauNoms();
        return !!(b && b.classList.contains('actif') && p && p.classList.contains('ouvert') && M().visible(p));
    }

    function bandes() {
        return document.querySelector('#carte-indicateurs-acpe .tb-p-20');
    }

    /** Le point de Tapir Doux sur la bande « Performance (P) » (la dernière des trois bandes). */
    function pointDeTapirSurP() {
        var points = [].slice.call(document.querySelectorAll('#carte-indicateurs-acpe .barre-etudiant[data-da="' + TAPIR.da + '"]'));
        return points.length ? points[points.length - 1] : null;
    }

    function ligneDeTapir() {
        return document.querySelector('#liste-etudiants-suivi .etudiant-suivi-item[data-da="' + TAPIR.da + '"]');
    }

    function pastilleDe(ligne, lettre) {
        if (!ligne) return null;
        return [].slice.call(ligne.querySelectorAll('.prioritaire-indice')).find(function (b) {
            return b.textContent.trim().indexOf(lettre + ' ') === 0;
        }) || null;
    }

    function profilOuvert(da) {
        return !!(da && window.profilActuelDA === da && sousSectionVisible('suivi-profil'));
    }

    function profilQuelconqueOuvert() {
        return !!(window.profilActuelDA && sousSectionVisible('suivi-profil'));
    }

    function ongletProfil(id) {
        return document.querySelector('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="' + id + '"]');
    }

    function ongletActif(id) {
        var b = ongletProfil(id);
        return !!(b && b.getAttribute('aria-current') === 'true');
    }

    function cartesProfil() {
        return [].slice.call(document.querySelectorAll('#profil-contenu-dynamique .profil-carte'));
    }

    function carteQuiCommencePar(mot) {
        return cartesProfil().find(function (c) { return c.textContent.trim().indexOf(mot) === 0; }) || null;
    }

    function carteTitree(motif) {
        return cartesProfil().find(function (c) {
            var h = c.querySelector('h2, h3');
            return h && motif.test(h.textContent);
        }) || null;
    }

    function carteContexte() { return carteTitree(/Contexte d.apprentissage/); }
    function carteRai() { return carteTitree(/Réponse à l.intervention/); }

    function defiDeLaCarte() {
        var r = carteRai();
        return r ? [].slice.call(r.querySelectorAll('p')).find(function (p) { return /Défi principal/.test(p.textContent); }) || null : null;
    }

    function boutonNouvelleIntervention() {
        return [].slice.call(document.querySelectorAll('#profil-contenu-dynamique [data-action="naviguerVersNouvelleIntervention"]'))
            .find(function (b) { return b.textContent.trim().indexOf('+') === 0; }) || null;
    }

    /** « HISTORIQUE », sous les cartes de l'Accompagnement : son titre, puis ce qu'il dit. */
    function historique() {
        var b = boutonNouvelleIntervention();
        return b ? (b.closest('.profil-carte, section, div') || b.parentElement) : null;
    }

    function fiche() {
        var f = memoire.ficheId
            ? document.querySelector('[data-fiche-intervention="' + memoire.ficheId + '"]')
            : document.querySelector('[data-fiche-intervention]');
        return f && M().visible(f) ? f : null;
    }

    function champ(id) { var c = document.getElementById(id); return c && M().visible(c) ? c : null; }

    function radioStatut(valeur) {
        var f = fiche();
        return f ? f.querySelector('input[name="interventionStatut"][value="' + valeur + '"]') : null;
    }

    function boutonCreer() { var f = fiche(); return f ? f.querySelector('[data-action="sauvegarderPresencesIntervention"]') : null; }

    async function ouvrirProfil(da, section) {
        if (!da) return;
        if (sectionCourante() !== 'suivi') aller('suivi', 'groupe');
        if (!profilOuvert(da) && typeof afficherProfilComplet === 'function') afficherProfilComplet(da);
        await attendre(function () { return profilOuvert(da); }, 2000);
        await attendre(function () { return !!ongletProfil(section); }, 2000);
        if (!ongletActif(section) && typeof changerSectionProfil === 'function') changerSectionProfil(section);
        await attendre(function () { return ongletActif(section); }, 2000);
    }

    // ---------- Les gardes : ce qui ne répond pas le temps d'une étape ----------

    /** L'étape que ce parcours joue en ce moment, sinon null (le moteur fermé, ou un autre parcours). */
    function etapeJouee() {
        var m = M();
        if (!m) return null;
        if (m.joue(DEF)) return DEF.etapes[m.etapeCourante()] || null;
        if (DEF_MODELE && m.joue(DEF_MODELE)) return DEF_MODELE.etapes[m.etapeCourante()] || null;
        return null;
    }

    /** Un toucher sur ce que l'étape garde ne va pas plus loin : ni son action, ni le répartiteur des data-action. */
    function garder(ev) {
        var etape = etapeJouee();
        if (!etape || !etape.gardes) return;
        var liste = [];
        try { liste = etape.gardes() || []; } catch (e) { liste = []; }
        var garde = liste.some(function (el) { return el && (el === ev.target || el.contains(ev.target)); });
        if (!garde) return;
        ev.preventDefault();
        ev.stopPropagation();
    }
    // En capture sur window : avant le répartiteur des data-action (main.js, sur document).
    window.addEventListener('click', garder, true);

    /** Tout ce qui, touché, ferait quitter la page de l'étape. */
    function actionsDans(cartes) {
        var liste = [];
        cartes.filter(Boolean).forEach(function (c) {
            [].slice.call(c.querySelectorAll('[data-action], button, a[href]')).forEach(function (el) { liste.push(el); });
        });
        return liste;
    }

    // Les champs de la fiche touchés pendant la bulle « Ton plan » (« Nous faisons ») : un geste est fait quand la
    // personne l'a fait, pas parce que l'application a déjà rempli le champ (la date, le niveau proposé).
    var touches = {};
    document.addEventListener('change', function (ev) {
        var t = ev.target;
        if (!t || !t.closest || !t.closest('[data-fiche-intervention]')) return;
        if (t.id) touches[t.id] = true;
        if (t.classList && t.classList.contains('critere-cible-cb')) touches.criteres = true;
    }, true);

    // ---------- Les lignes d'une bulle ----------

    /**
     * Une ligne de la bulle. `plus` : ce qui la fait (une fonction `fait`), ou { fait, champs, montre } — `champs`, les
     * champs qu'un geste remplit (une flèche va à ceux qui sont vides) ; `montre`, ce dont une explication parle (une
     * flèche y va, la ligne ne se grise pas).
     */
    function ligne(def, plus) {
        var t = def[0], texte = def[1];
        var o = typeof plus === 'function' ? { fait: plus } : (plus || {});
        var l = t === 'c' ? { texte: texte, geste: true } : t === 'g' ? { texte: texte } : { texte: texte, note: true };
        if (o.fait) l.fait = o.fait;
        else if (t === 'g' && !o.champs) l.fait = function () { return false; };
        if (o.champs) l.champs = o.champs;
        if (o.montre) { l.montre = o.montre; delete l.note; }
        return l;
    }

    function lignesDe(defs, plus) {
        return defs.map(function (d, k) { return ligne(d, plus && plus[k]); });
    }

    // L'étape où ce passage a commencé : 0 pour « Commencer » ou « Refaire », celle de la reprise pour « Reprendre ». Une
    // bulle ne confirme l'étape d'avant que si elle a été faite pendant ce passage (la règle des autres parcours).
    var debutDuPassage = 0;
    function confirmation(rang, texte) {
        return function () { return rang > debutDuPassage ? texte : ''; };
    }

    // ---------- La mécanique des neuf étapes (la Pratique guidée ; la Modélisation la reprend) ----------

    /** Ce qui désigne et fait avancer chaque étape : le code du 9 nov., inchangé. Les lignes viennent de `TEXTES`. */
    var MECANIQUE = [
        {
            avant: async function () {
                aller('suivi', 'groupe');
                await attendre(bandes, 2000);
                // Le geste à faire est d'ouvrir les pastilles : elles partent fermées.
                var b = boutonDetails();
                if (b && b.classList.contains('actif')) b.click();
                await attendre(function () { return !pastillesOuvertes(); }, 1000);
            },
            zones: function () { return [bandes()]; },
            contour: boutonDetails,
            atteint: pastillesOuvertes
        },
        {
            avant: async function () {
                aller('suivi', 'groupe');
                await attendre(bandes, 2000);
                if (!pastillesOuvertes()) {
                    var b = boutonDetails();
                    if (b) b.click();
                }
                await attendre(function () { return pastillesOuvertes() && !!document.querySelector('#liste-etudiants-suivi .etudiant-prioritaire-indices'); }, 2000);
            },
            zones: function () { return [panneauNoms()]; },
            contour: function () { return document.getElementById('suivi-tri-boutons'); },
            atteint: function () {
                if (!profilQuelconqueOuvert()) return false;
                var da = window.profilActuelDA;
                // Une personne sans aucune donnée (assiduité inconnue, aucune production : aucuneDonneeDeSuivi)
                // n'a pas de « + Nouvelle intervention » : le parcours le dit, ramène aux noms, et la bulle
                // redit d'en choisir une. Une assiduité de 0 % est une donnée (9 nov.) : la personne passe.
                if (sansDonnee(da)) {
                    if (window.notifications && typeof window.notifications.info === 'function') window.notifications.info(REFUS_9_NOV.sansDonnee);
                    M().allerA(1);
                    return false;
                }
                memoire.da = da;
                memoire.ficheId = null;
                return true;
            }
        },
        {
            avant: async function () {
                await ouvrirProfil(memoire.da, 'mobilisation');
                await attendre(function () { return carteQuiCommencePar('Complétion'); }, 2000);
            },
            // Ce que nomme la bulle, pas les cartes entières : les absences datées, sous Assiduité ; les productions
            // remises et manquantes, sous Complétion.
            zones: function () {
                return [carteQuiCommencePar('Assiduité'), carteQuiCommencePar('Complétion')].filter(Boolean).reduce(function (z, c) {
                    return z.concat([].slice.call(c.querySelectorAll('.badges-centres')));
                }, []);
            },
            // Les pastilles d'absence et de production ne répondent pas : touchées, elles quittent le profil.
            gardes: function () { return actionsDans([carteQuiCommencePar('Assiduité'), carteQuiCommencePar('Complétion')]); },
            contour: function () { return ongletProfil('accompagnement'); },
            atteint: function () { return ongletActif('accompagnement'); }
        },
        {
            avant: async function () {
                await ouvrirProfil(memoire.da, 'accompagnement');
                await attendre(carteRai, 2000);
            },
            // La phrase du contexte, le niveau, le défi principal, que nomme la bulle.
            zones: function () {
                var c = carteContexte(), r = carteRai();
                return [c && c.querySelector('.badge-sys'), r && r.querySelector('.badge-sys'), defiDeLaCarte()].filter(Boolean);
            },
            // Rien à toucher dans la page : les liens des deux cartes ne répondent pas.
            gardes: function () { return actionsDans([carteContexte(), carteRai()]); },
            boutons: [{
                libelle: 'Continuer',
                primaire: true,
                action: function (m) { m.allerA(grilleDeDepistageManque() ? 4 : 5); }
            }]
        },
        {
            avant: async function () {
                if (!sousSectionVisible('labo-accompagnement')) {
                    await ouvrirProfil(memoire.da, 'accompagnement');
                    await attendre(carteRai, 2000);
                }
            },
            // Deux temps dans la même bulle : le lien de la carte RàI, puis, dans Labo › Observation, le menu.
            zones: function () {
                var menu = menuGrille();
                if (menu) return [menu.closest('.groupe-form') || menu];
                return [carteRai()];
            },
            contour: function () {
                var menu = menuGrille();
                if (menu) { amenerLeMenu(menu); return menu; }
                var c = carteRai();
                return c ? c.querySelector('[data-action="ouvrirOutilsObservation"]') : null;
            },
            // La grille est enregistrée : son profil se rouvre à l'étape 6.
            atteint: function () {
                if (grilleDeDepistageManque()) return false;
                memoire.parLaGrille = true;
                return true;
            }
        },
        {
            avant: async function () {
                memoire.ficheId = null;
                await ouvrirProfil(memoire.da, 'accompagnement');
                await attendre(boutonNouvelleIntervention, 2000);
            },
            zones: function () { return [historique()].filter(Boolean); },
            contour: boutonNouvelleIntervention,
            // Repéré sur la fiche elle-même, pas sur le délai de naviguerVersNouvelleIntervention.
            atteint: function () {
                var f = document.querySelector('[data-fiche-intervention]');
                if (!f || !M().visible(f)) return false;
                var id = f.getAttribute('data-fiche-intervention');
                // Une intervention déjà enregistrée, rouverte depuis l'historique : pas la fiche neuve attendue.
                if (interventionEnregistree(id)) return false;
                memoire.ficheId = id;
                return true;
            }
        },
        {
            avant: async function () {
                touches = {};
                await attendre(fiche, 2000);
            },
            zones: function () { return [fiche()]; },
            // La règle des formulaires (11 nov. 2026, capture 29) : une flèche par champ obligatoire encore vide.
            formulaire: fiche,
            // Un geste à la fois (11 nov. 2026, 12 h 05) : le titre, puis la date, tant qu'ils sont vides ; puis « Créer
            // l'intervention ».
            contour: function () {
                var f = fiche();
                if (!f) return null;
                var vide = ['interventionTitre', 'interventionDate'].map(function (id) { return document.getElementById(id); })
                    .find(function (c) { return c && M().visible(c) && !String(c.value || '').trim(); });
                return vide || boutonCreer();
            },
            atteint: function () {
                // La création est faite quand la fiche est en base (« Intervention créée. » s'affiche alors).
                if (interventionEnregistree(memoire.ficheId)) return true;
                // La fiche refermée sans être créée : le brouillon est jeté, on revient au profil.
                if (!fiche()) { M().allerA(5); }
                return false;
            }
        },
        {
            avant: async function () {
                if (!fiche() && interventionEnregistree(memoire.ficheId) && typeof window.naviguerVersIntervention === 'function') {
                    window.naviguerVersIntervention(memoire.ficheId);
                }
                await attendre(fiche, 2500);
            },
            // Le statut est ce dont parle la bulle : une zone (la flèche y va), PAS un contour. Aucun geste n'est attendu
            // ici. Le choix du statut ne répond pas : il écrirait sur l'intervention qui vient d'être créée.
            gardes: function () {
                var f = fiche();
                return f ? [].slice.call(f.querySelectorAll('input[name="interventionStatut"]')).map(function (r) { return r.closest('label') || r; }) : [];
            },
            zones: function () {
                var r = radioStatut('completee');
                return r ? [r.closest('label')].filter(Boolean) : [];
            },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(8); } }]
        },
        {
            centre: true,
            sansSortie: true,
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    /**
     * Une étape : sa mécanique (ses descripteurs copiés, getters compris), puis ses lignes. Une bulle en lignes ne fléche
     * ses zones que si elle les déclare (`fleches`, js/parcours-moteur.js, `designe`) : ce dont elle parle reçoit sa
     * flèche, comme les bulles en texte du 9 nov. (la règle du 11 nov. : « nommer, pointer »).
     */
    function etape(mecanique, o) {
        var e = {};
        Object.keys(mecanique).forEach(function (k) { Object.defineProperty(e, k, Object.getOwnPropertyDescriptor(mecanique, k)); });
        Object.keys(o).forEach(function (k) { Object.defineProperty(e, k, Object.getOwnPropertyDescriptor(o, k)); });
        if (!e.fleches && e.zones) e.fleches = function () { return ((e.zones && e.zones()) || []).filter(Boolean); };
        return e;
    }

    // ---------- « Nous faisons » : les neuf bulles ----------

    var T_P = TEXTES.pratique;

    // Les gestes de la bulle 7 (« Ton plan ») : le titre, la date, le niveau, la description, les critères, l'objectif.
    var unChamp = function (id) { return function () { return [champ(id)].filter(Boolean); }; };
    var GESTES_DU_PLAN = [
        { montre: function () { var c = document.getElementById('etud-' + memoire.da); return c ? [c.closest('label') || c] : []; } },
        { champs: unChamp('interventionTitre') },
        { champs: unChamp('interventionDate'), fait: function () { return !!touches.interventionDate; } },
        { champs: unChamp('interventionNiveau'), fait: function () { return !!touches.interventionNiveau; } },
        { champs: unChamp('interventionDescription') },
        { fait: function () { return !!touches.criteres; } },
        { champs: unChamp('objectifVise') },
        function () { return interventionEnregistree(memoire.ficheId); }
    ];

    var ETAPES = [
        etape(MECANIQUE[0], { titre: T_P[0].titre, lieu: true, lieuSuite: T_P[0].lieuSuite, lignes: function () { return lignesDe(T_P[0].lignes, [null, null, null, null, null, pastillesOuvertes]); } }),
        etape(MECANIQUE[1], { titre: T_P[1].titre, confirme: confirmation(1, T_P[1].confirme),
            lignes: function () { return lignesDe(T_P[1].lignes, [null, null, null, null, profilQuelconqueOuvert, profilQuelconqueOuvert]); } }),
        etape(MECANIQUE[2], { titre: T_P[2].titre, confirme: confirmation(2, T_P[2].confirme), lieu: true, amener: true, lieuSuite: T_P[2].lieuSuite,
            lignes: function () { return lignesDe(T_P[2].lignes); } }),
        etape(MECANIQUE[3], { titre: T_P[3].titre, confirme: confirmation(3, T_P[3].confirme), lignes: function () { return lignesDe(T_P[3].lignes); } }),
        etape(MECANIQUE[4], {
            titre: T_P[4].titre,
            lignesVivantes: true,
            // Deux formes : la carte RàI (« Régler les outils d'observation ») ; puis, dans Labo › Observation, le menu.
            confirme: function () { return menuGrille() ? '' : confirmation(4, T_P[4].confirme)(); },
            lieu: function () { return !!menuGrille(); },
            lieuSuite: function () { return menuGrille() ? T_P[4].puis.lieuSuite : ''; },
            lignes: function () { return lignesDe(menuGrille() ? T_P[4].puis.lignes : T_P[4].lignes); }
        }),
        etape(MECANIQUE[5], {
            titre: T_P[5].titre,
            confirme: function () { return memoire.parLaGrille ? T_P[5].apresLaGrille.confirme : confirmation(5, T_P[5].confirme)(); },
            lieu: function () { return memoire.parLaGrille; },
            lieuVerbe: function () { return memoire.parLaGrille ? T_P[5].apresLaGrille.lieuVerbe : ''; },
            lignes: function () { return lignesDe(T_P[5].lignes); }
        }),
        etape(MECANIQUE[6], { titre: T_P[6].titre, confirme: confirmation(6, T_P[6].confirme), lieu: true, amener: true, lieuSuite: T_P[6].lieuSuite,
            // Les flèches vont aux champs des gestes encore à faire, pas à la fiche entière.
            fleches: function () { return []; },
            lignesVivantes: true, lignes: function () { return lignesDe(T_P[6].lignes, GESTES_DU_PLAN); } }),
        etape(MECANIQUE[7], { titre: T_P[7].titre, confirme: confirmation(7, T_P[7].confirme), lignes: function () { return lignesDe(T_P[7].lignes); } }),
        // La consigne des boutons : « Touche « Terminer » », que le moteur dit « Touche « Voir le parcours 8 », ou
        // « Terminer » » quand il offre la suite (`consigneDeLaFin`) ; elle suit les boutons, elle n'est pas un texte écrit.
        etape(MECANIQUE[8], { titre: T_P[8].titre, confirme: confirmation(8, T_P[8].confirme),
            lignes: function () { return lignesDe(T_P[8].lignes).concat([{ texte: 'Touche « Terminer »', geste: true }]); } })
    ];

    // L'étape 5, dans Labo › Observation : le menu des grilles, amené une fois dans la vue.
    var menuAmene = false;
    function menuGrille() {
        if (!sousSectionVisible('labo-accompagnement')) { menuAmene = false; return null; }
        var s = document.getElementById('v2-pref-grille-reference');
        return s && M().visible(s) ? s : null;
    }
    /**
     * ouvrirOutilsObservation défile, en douceur, vers le haut de la sous-section : le menu est amené
     * dans la vue une fois ce défilement fini (la page immobile deux tours de suite), sans quoi les
     * deux défilements se disputent la page. Une fois par arrivée : si la personne défile ensuite,
     * le parcours ne la ramène pas.
     */
    function amenerLeMenu(menu) {
        if (menuAmene) return;
        menuAmene = true;
        var dernier = null, immobile = 0, tours = 0;
        (function tour() {
            if (!menu.isConnected || tours++ > 30) return;
            immobile = window.scrollY === dernier ? immobile + 1 : 0;
            dernier = window.scrollY;
            if (immobile < 2) { setTimeout(tour, 100); return; }
            var r = menu.getBoundingClientRect();
            var entete = document.querySelector('header.entete');
            var haut = entete ? Math.max(0, entete.getBoundingClientRect().bottom) : 0;
            if (r.top < haut + 16 || r.bottom > window.innerHeight - 16) menu.scrollIntoView({ behavior: 'auto', block: 'center' });
        })();
    }

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard', objectif: OBJECTIFS.pratique, objectifAtteint: OBJECTIFS.pratiqueAtteint };

    // ---------- « Je regarde » : les huit bulles ----------

    var T_M = TEXTES.modele;
    var CHOISIR_LE_GROUPE = function () {
        return window.ParcoursEvaluer && window.ParcoursEvaluer.textes ? window.ParcoursEvaluer.textes.choisirLeGroupe : '';
    };

    /** Une bulle du modèle : hors du deuxième groupe, elle n'avance pas et montre le menu de l'en-tête. */
    function etapeDuModele(mecanique, o) {
        var e = etape(mecanique, o);
        var lignes = e.lignes, contour = e.contour, zones = e.zones, atteint = e.atteint, lieu = e.lieu;
        e.lignesVivantes = true;
        e.lignes = function () {
            if (surLeDeuxiemeGroupe()) return lignes ? lignes.call(e) : [];
            var choix = CHOISIR_LE_GROUPE();
            return choix ? [{ texte: choix, geste: true }] : [];
        };
        e.contour = function () {
            if (!surLeDeuxiemeGroupe()) return document.getElementById('selectGroupeCoursHeader');
            return contour ? contour.call(e) : null;
        };
        e.zones = function () { return surLeDeuxiemeGroupe() && zones ? (zones.call(e) || []).filter(Boolean) : []; };
        if (atteint) e.atteint = function () { return surLeDeuxiemeGroupe() && !!atteint.call(e); };
        if (lieu) e.lieu = function () { return surLeDeuxiemeGroupe() && (typeof lieu === 'function' ? !!lieu() : true); };
        var boutons = Object.getOwnPropertyDescriptor(e, 'boutons');
        Object.defineProperty(e, 'boutons', { get: function () {
            if (!surLeDeuxiemeGroupe()) return null;
            return boutons ? (boutons.get ? boutons.get.call(e) : boutons.value) : null;
        }, configurable: true });
        return e;
    }

    function remplir(geste) { return K() && typeof K().remplir === 'function' ? K().remplir(geste) : false; }
    function poser(champ, valeur) { return K() && typeof K().poser === 'function' ? K().poser(champ, valeur) : false; }

    /** Une case de la fiche, cochée ou décochée comme au toucher : ses écouteurs suivent. */
    function cocher(cb, oui) {
        if (!cb || cb.checked === oui) return;
        cb.checked = oui;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function planRempli() {
        var t = champ('interventionTitre'), o = champ('objectifVise');
        return !!(t && t.value === PLAN.titre && o && o.value === PLAN.objectif);
    }

    /**
     * « Remplir », bulle 6 : le plan de Grégoire, champ par champ, comme au clavier. Le niveau d'abord : ses écouteurs
     * repassent sur les critères pré-cochés ; les critères ensuite (la rigueur seule) ; le reste.
     */
    async function remplirLePlan() {
        var f = fiche();
        if (!f || !enDemo()) return;
        poser(champ('interventionNiveau'), PLAN.niveau);
        await new Promise(function (ok) { setTimeout(ok, 0); });
        poser(champ('interventionTitre'), PLAN.titre);
        poser(champ('interventionDuree'), PLAN.duree);
        poser(champ('interventionDescription'), PLAN.description);
        [].slice.call(f.querySelectorAll('#criteresCiblesContainer .critere-cible-cb')).forEach(function (cb) { cocher(cb, cb.value === PLAN.critere); });
        poser(champ('objectifVise'), PLAN.objectif);
    }

    function suitesDuModele() { return K().suitesDuModele(ID, terminerModele); }

    var ETAPES_MODELE = [
        etapeDuModele(MECANIQUE[0], {
            titre: T_M[0].titre,
            lieu: true,
            lieuSuite: T_M[0].lieuSuite,
            secondeForme: function () { return !!evaluationDeTapir(); },
            lignes: function () { return evaluationDeTapir() ? lignesDe(T_M[0].puis.lignes, [null, null, pastillesOuvertes]) : lignesDe(T_M[0].lignes); },
            get boutons() {
                if (evaluationDeTapir()) return null;
                return [{ libelle: K().mots.remplir, primaire: true, action: function () { remplir(poserLEvaluationDeTapir); } }];
            },
            zones: function () { return evaluationDeTapir() ? [pointDeTapirSurP()] : [bandes()]; },
            contour: function () { return evaluationDeTapir() ? boutonDetails() : null; },
            atteint: function () { return !!evaluationDeTapir() && pastillesOuvertes(); }
        }),
        etapeDuModele(MECANIQUE[1], {
            titre: T_M[1].titre,
            confirme: confirmation(1, T_M[1].confirme),
            lignes: function () { return lignesDe(T_M[1].lignes, [null, null, null, null, null, function () { return profilOuvert(TAPIR.da); }]); },
            zones: function () { return [ligneDeTapir()]; },
            contour: function () { return pastilleDe(ligneDeTapir(), 'P'); },
            // Le modèle regarde le P de Tapir Doux : les autres pastilles ne répondent pas, ni son A et son C.
            gardes: function () {
                var p = pastilleDe(ligneDeTapir(), 'P');
                return [].slice.call(document.querySelectorAll('#liste-etudiants-suivi .prioritaire-indice')).filter(function (b) { return b !== p; });
            },
            atteint: function () {
                if (!profilOuvert(TAPIR.da)) return false;
                memoire.da = TAPIR.da;
                memoire.ficheId = null;
                return true;
            }
        }),
        etapeDuModele(MECANIQUE[2], { titre: T_M[2].titre, confirme: confirmation(2, T_M[2].confirme), lieu: true, amener: true, lieuSuite: T_M[2].lieuSuite,
            avant: async function () {
                memoire.da = TAPIR.da;
                await ouvrirProfil(TAPIR.da, 'mobilisation');
                await attendre(function () { return carteQuiCommencePar('Complétion'); }, 2000);
            },
            lignes: function () { return lignesDe(T_M[2].lignes); } }),
        etapeDuModele(MECANIQUE[3], {
            titre: T_M[3].titre,
            confirme: confirmation(3, T_M[3].confirme),
            avant: async function () {
                memoire.da = TAPIR.da;
                await ouvrirProfil(TAPIR.da, 'accompagnement');
                await attendre(carteRai, 2000);
            },
            lignes: function () { return lignesDe(T_M[3].lignes); },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(4); } }]
        }),
        etapeDuModele(MECANIQUE[5], {
            titre: T_M[4].titre,
            confirme: confirmation(4, T_M[4].confirme),
            avant: async function () {
                memoire.da = TAPIR.da;
                memoire.ficheId = null;
                await ouvrirProfil(TAPIR.da, 'accompagnement');
                await attendre(boutonNouvelleIntervention, 2000);
            },
            lignes: function () { return lignesDe(T_M[4].lignes); }
        }),
        etapeDuModele(MECANIQUE[6], {
            titre: T_M[5].titre,
            confirme: confirmation(5, T_M[5].confirme),
            lieu: true,
            amener: true,
            lieuSuite: T_M[5].lieuSuite,
            secondeForme: planRempli,
            fleches: function () { return planRempli() ? [champ('interventionDescription')].filter(Boolean) : []; },
            lignes: function () {
                return planRempli() ? lignesDe(T_M[5].puis.lignes, [null, null, null, null, null, null, function () { return interventionEnregistree(memoire.ficheId); }])
                    : lignesDe(T_M[5].lignes, [
                        { montre: function () { var c = document.getElementById('etud-' + TAPIR.da); return c ? [c.closest('label') || c] : []; } },
                        { montre: function () { return [champ('interventionDate')].filter(Boolean); } }
                    ]);
            },
            get boutons() {
                if (planRempli() || !fiche()) return null;
                return [{ libelle: K().mots.remplir, primaire: true, action: function () { remplir(remplirLePlan); } }];
            },
            contour: function () { return planRempli() ? boutonCreer() : null; },
            atteint: function () {
                if (interventionEnregistree(memoire.ficheId)) return true;
                if (!fiche()) { M().allerA(4); }
                return false;
            }
        }),
        etapeDuModele(MECANIQUE[7], {
            titre: T_M[6].titre,
            confirme: confirmation(6, T_M[6].confirme),
            lignes: function () { return lignesDe(T_M[6].lignes); },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(7); } }]
        }),
        {
            titre: T_M[7].titre,
            confirme: confirmation(7, T_M[7].confirme),
            lignesVivantes: true,
            // « Objectif atteint : … », « Pour revoir une étape… », la phrase de la suite et la suite suggérée : le moteur.
            lignes: function () { return lignesDe(T_M[7].lignes).concat([{ texte: K().consigneDesSuites(suitesDuModele()), geste: true }]); },
            centre: true,
            sansSortie: true,
            get boutons() { return suitesDuModele(); }
        }
    ];

    var DEF_MODELE = { id: ID + '-modele', etapes: ETAPES_MODELE, lienSortie: 'Plus tard', objectif: OBJECTIFS.modele, objectifAtteint: OBJECTIFS.modeleAtteint };

    /** D'où repart le modèle : son intervention créée, à la bulle 7 ; sinon, de la première (les gestes d'avant y sont faits). */
    function premiereNonFaiteModele() {
        var i = interventionsDeTapir()[0];
        if (i && evaluationDeTapir()) { memoire.da = TAPIR.da; memoire.ficheId = i.id; return 6; }
        return 0;
    }

    /**
     * Le modèle part de sa première étape non faite : JAMAIS en visite (règle des modèles, 14 nov. 2026). Fait, il ne
     * repart que par « Refaire », au panneau, qui défait d'abord ce qu'il a posé (`defaireModele`, js/assistance.js).
     */
    async function lancerModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return;
        if (refusModele()) {
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-modele-bouton');
                if (b) b.click();
            }
            return;
        }
        enModele = true;
        memoire.da = null;
        memoire.ficheId = null;
        memoire.parLaGrille = false;
        menuAmene = false;
        var depuis = premiereNonFaiteModele();
        debutDuPassage = depuis;
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(DEF_MODELE, {
            depuis: depuis,
            surEtape: function (n) { window.Assistance.definirEtatModele(ID, 'en-cours', n); },
            surQuitter: function () {},
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Terminer ».
            surEchap: function () { terminerModele(); },
            // Sortie de la démo en cours de route : le modèle se ferme et attend.
            verifier: enDemo
        });
    }

    function terminerModele() {
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    // ---------- La Pratique guidée : le lancement, la reprise, la fin ----------

    /** D'où repartir : les étapes 3 à 7 ont besoin de la personne choisie ; sans elle, l'étape 2. */
    function etapeDeReprise(depuis) {
        var i = Math.max(0, Math.min(depuis || 0, ETAPES.length - 1));
        if (i >= 2 && i <= 6 && !dansLeGroupe(memoire.da)) return 1;
        if (i === 6) {
            if (interventionEnregistree(memoire.ficheId)) return 7;
            if (!fiche()) return 5;
        }
        return i;
    }

    function lancer(depuis) {
        if (refus()) return;
        enModele = false;
        var i = etapeDeReprise(depuis);
        menuAmene = false;
        memoire.parLaGrille = false;
        debutDuPassage = i;
        window.Assistance.definirEtat(ID, 'en-cours', i);
        return M().lancer(DEF, {
            depuis: i,
            surEtape: function (n) { window.Assistance.definirEtat(ID, 'en-cours', n); },
            // « Plus tard » : la bulle se ferme ; le parcours attend dans le panneau, à la même étape.
            surQuitter: function () {},
            // À la dernière bulle, sans lien de sortie, Échap vaut « Terminer ».
            surEchap: function () { terminer(); },
            verifier: contexteTient
        });
    }

    function terminer() {
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Lire ta classe et intervenir',
        ligne: "Avant chaque cours, voir qui a besoin de toi et de quoi ; puis, si tu le décides, noter une intervention.",
        total: ETAPES.length,
        refus: refus,
        // Seul le refus « sans présences » renvoie à un parcours ; les autres disent un réglage ou un mode.
        prealable: function (raison) { return raison === REFUS.sansPresences ? 'classe' : raison === REFUS_MODELE ? 'recevoir' : null; },
        lancer: lancer,
        // Les deux temps (22 nov. 2026) : le modèle, dans la démo, sur le deuxième groupe.
        totalModele: ETAPES_MODELE.length,
        lancerModele: lancerModele,
        refusModele: refusModele,
        defaireModele: defaireModele
    });

    // Pour la sentinelle des textes (tests/unit) et le banc : les textes, les étapes, les refus, la mémoire.
    window.ParcoursLireTaClasse = {
        textes: TEXTES,
        objectifs: OBJECTIFS,
        ecranM4: ECRAN_M4,
        plan: PLAN,
        tapir: TAPIR,
        etapes: ETAPES,
        etapesModele: ETAPES_MODELE,
        definition: DEF,
        definitionModele: DEF_MODELE,
        refus: REFUS,
        refus9nov: REFUS_9_NOV,
        refusModele: refusModele,
        texteRefusModele: REFUS_MODELE,
        lireLeGroupe: lireLeGroupe,
        memoire: memoire,
        enModele: function () { return enModele; }
    };
})();
