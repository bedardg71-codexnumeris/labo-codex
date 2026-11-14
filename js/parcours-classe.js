/* =================================================================
   LE PARCOURS « METTRE TA CLASSE EN PLACE » (lot « Les deux parcours », partie 2, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 2 ; esquisses 71 et 72.

   De « Commencer » à sa propre classe : le Cadre bloc par bloc (trimestre, cours, profil,
   étudiant·es, horaire, groupe-cours), puis la première saisie de présences, jusqu'à la bande
   d'assiduité de son propre groupe. Deux portes : « Commencer avec ma classe », à la fin de
   « Découvrir », et « Commencer » sur la carte enseignant de l'accueil (commencerParLeTrimestre).
   Il ne démarre jamais de lui-même.

   ⚠ LES HUIT BULLES SONT EN LIGNES (essai novice de Grégoire, 14 nov. 2026 ;
   plans de travail/CONSIGNE-2026-11-14-essai-novice.md, lot 3) : une ligne par geste, la raison d'une
   question entre parenthèses, le document à avoir sous la main nommé d'abord, la consigne en dernière
   ligne. Les textes des étapes 1 et 7 sont validés par Grégoire mot pour mot ; les autres sont proposés
   par Cowork (« institution », et les deux raisons de l'étape 2, sont de Grégoire). Ils sont posés tels
   quels : tests/unit/sentinelle-parcours-classe-2026-11-09.test.js les confronte à la consigne.

   · Une étape du Cadre ouvre son bloc (et, s'il n'existe encore aucun élément, son formulaire
     « + Nouveau… »), l'éclaire, pose le contour sur le bouton de création, et avance quand la
     donnée est RÉELLEMENT enregistrée : la validation peut refuser.
   · Le parcours commence à la première étape non faite, lue dans ce que montre la frise du
     Cadre (`etapesDuCadre`, js/trimestre-v2.js) : une personne qui a déjà son trimestre
     commence au cours.
   · « Plus tard » ferme la bulle ; le parcours attend dans le panneau (« Étape n sur 8 »,
     « Reprendre »). Rien ne le rouvre de lui-même.
   · Il se joue sur les vraies données : si la démo est ouverte, il la referme d'abord ; si
     elle s'ouvre en route, il se ferme et attend.
   ================================================================= */
(function () {
    'use strict';

    var ID = 'classe';
    var M = function () { return window.ParcoursMoteur; };

    // ---------- Utilitaires (ceux de « Découvrir » ; le moteur ne les offre pas) ----------

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

    function sousSectionVisible(id) {
        var el = document.getElementById(id);
        return !!(el && M().visible(el));
    }

    function aller(section, sous) {
        if (sousSectionVisible(section + '-' + sous)) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    function enDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    function el(id) { return document.getElementById(id); }

    // ---------- Ce que montre la frise du Cadre, et la suite ----------

    function etapeDuCadre(idEtape) {
        var etapes = typeof window.etapesDuCadre === 'function' ? window.etapesDuCadre() : [];
        return etapes.find(function (x) { return x.id === idEtape; }) || null;
    }

    function reglee(idEtape) {
        var e = etapeDuCadre(idEtape);
        return !!(e && e.reglee);
    }

    /** L'accordéon du bloc, tel que la barre du Cadre le nomme. */
    function accordeon(idEtape) {
        var e = etapeDuCadre(idEtape);
        return e && e.accordeon ? el(e.accordeon) : null;
    }

    function groupeCoursActif() {
        var gc = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null;
        return gc && gc.id ? gc : null;
    }

    /** Les séances du groupe-cours actif, lues dans leur cache, sans rien générer ni écrire. */
    function seancesDuGroupe() {
        var gc = groupeCoursActif();
        if (!gc || typeof window.obtenirSeancesCompletesDuGroupe !== 'function') return {};
        return window.obtenirSeancesCompletesDuGroupe(gc.id);
    }

    /**
     * Une SÉANCE du groupe-cours actif est verrouillée (« Verrouiller la saisie »). Lue sans semis, et
     * croisée avec les séances du groupe : une date d'un autre trimestre, venue du stock d'avant le
     * 11 sept., ne compte pas (relecture du 9 nov.).
     */
    function seanceVerrouillee() { return seancesVerrouillees().length > 0; }

    /**
     * Le premier cours a eu lieu : une séance du groupe-cours actif tombe aujourd'hui ou avant.
     * Les séances naissent des dates du trimestre et de l'horaire ; elles sont lues dans leur
     * cache, sans rien générer (`obtenirSeancesCompletesDuGroupe`, lecture stricte) : la saisie
     * des présences le régénère à l'arrivée (js/saisie-presences.js).
     */
    function premierCoursPasse() {
        var seances = seancesDuGroupe();
        var aujourdhui = window.dateLocaleYMD();
        return Object.keys(seances).some(function (d) {
            return Array.isArray(seances[d]) && seances[d].length > 0 && d <= aujourdhui;
        });
    }

    var ETAPES_DU_CADRE = ['trimestre', 'cours', 'enseignant', 'etudiants', 'horaire', 'groupe-cours'];

    /** L'index (de 0) de la première étape non faite ; la dernière quand tout l'est. */
    function premiereNonFaite() {
        for (var k = 0; k < ETAPES_DU_CADRE.length; k++) {
            if (!reglee(ETAPES_DU_CADRE[k])) return k;
        }
        return seanceVerrouillee() ? 7 : 6;
    }

    // ---------- Les blocs du Cadre ----------

    var BOUTON_CREER = {
        'trimestre': 'v2-btnCreerTrimestre',
        'cours': 'v2-btnCreerCours',
        'enseignant': 'v2-btnCreerEnseignant',
        'horaire': 'v2-btnCreerHoraire',
        'groupe-cours': 'v2-btnCreerGroupeCours'
    };
    // Le formulaire « + Nouveau… » de chaque bloc (le trimestre s'ouvre en création de lui-même
    // quand aucun n'est actif ; l'import des étudiant·es est toujours à l'écran).
    var NOUVEAU = {
        'cours': 'nouveauCoursV2',
        'enseignant': 'nouveauProfilEnseignantV2',
        'horaire': 'nouveauHoraireV2',
        'groupe-cours': 'nouveauGroupeCoursV2'
    };

    /**
     * Vrai quand la mesure n'a pas bougé pendant trois tours de suite (150 ms). Le bloc s'ouvre en
     * transition (max-height), et l'application lance elle-même des défilements doux : le formulaire
     * « + Nouveau… » se fait défiler à l'écran, l'import des étudiant·es fait défiler jusqu'à l'Horaire.
     * Le moteur amène la zone dans la vue une seule fois : il doit le faire quand la page est immobile,
     * sinon un défilement doux encore en cours l'emporte (mesuré le 9 nov. : 2 passes sur 4 rouges).
     */
    function immobile(mesure) {
        var avant = null, tours = 0;
        return function () {
            var m = mesure();
            tours = m === avant ? tours + 1 : 0;
            avant = m;
            return tours >= 3;
        };
    }

    function pageImmobile(e) {
        return immobile(function () { return Math.round(window.scrollY) + ':' + (e ? Math.round(e.getBoundingClientRect().height) : 0); });
    }

    /**
     * Ouvre le bloc de l'étape (idempotent : sert aussi à la reprise) et, s'il n'existe encore
     * aucun élément, son formulaire « + Nouveau… » — sauf s'il est déjà ouvert : une saisie en
     * cours n'est pas effacée.
     */
    async function ouvrirBloc(idEtape) {
        aller('calendrier', 'trimestre');
        await attendre(function () { return sousSectionVisible('calendrier-trimestre'); }, 2000);
        var acc = accordeon(idEtape);
        if (!acc) return;
        if (acc.classList.contains('ferme')) {
            var tete = acc.querySelector('.accordeon-header');
            if (tete && typeof toggleAccordeonV2 === 'function') toggleAccordeonV2(tete);
        }
        var bouton = BOUTON_CREER[idEtape] ? el(BOUTON_CREER[idEtape]) : null;
        var nouveau = NOUVEAU[idEtape] ? window[NOUVEAU[idEtape]] : null;
        if (bouton && !M().visible(bouton) && !reglee(idEtape) && typeof nouveau === 'function') {
            await nouveau();
        }
        await attendre(pageImmobile(acc), 2000);
    }

    // ---------- La saisie des présences (étape 7) et la bande (étape 8) ----------

    function champDate() { return el('date-cours'); }

    function boutonVerrou() { return el('btnVerrouillerSaisiePresences'); }

    /** « Choisis un cours » : la rangée Précédent · date · Suivant. */
    function choixDuCours() {
        var c = champDate();
        return c ? (c.closest('.d-flex-gap8-center') || c) : null;
    }

    /**
     * « Tout le monde est présent par défaut […] tu ne notes que les absences et les retards » : la colonne Présence (son
     * en-tête et ses cases), pas le tableau entier. Ses cellules se touchent : une seule flèche, et la bulle peut se poser
     * sur les autres colonnes (11 nov. 2026, second essai : le tableau entier et le compteur, déclarés, ne laissaient
     * aucune place libre, et la bulle se posait sur le choix du cours et les premières rangées).
     */
    function colonnePresence() {
        var corps = el('tbody-saisie-presences');
        var table = corps ? corps.closest('table') : null;
        if (!table) return [];
        var tete = table.querySelector('[data-tooltip="presences-presence-col"]');
        var cases = [].map.call(corps.querySelectorAll('.input-periodes'), function (i) { return i.closest('td'); });
        return [tete ? tete.closest('th') : null].concat(cases).filter(Boolean);
    }

    /**
     * Les DA, prénoms et noms de la saisie : la bulle ne les nomme pas, mais il faut les voir pour noter une absence. Elle
     * les évite comme ses zones, sans flèche (11 nov. 2026 : à 1180 × 746, posée en bas à gauche, elle les couvrait).
     */
    function nomsDeLaSaisie() {
        var corps = el('tbody-saisie-presences');
        if (!corps) return [];
        return [].concat.apply([], [].map.call(corps.querySelectorAll('tr'), function (tr) {
            return [].slice.call(tr.children, 0, 3);
        }));
    }

    function blocAssiduite() {
        var h = document.querySelector('#section-suivi h4[data-tooltip="tdb-assiduite"]');
        return h ? h.parentElement : null;
    }

    // L'étape 7 a deux contours (la date et « Verrouiller la saisie ») ; le moteur n'en pose qu'un.
    // Le second, sur la date, est posé ici, dans le même dessin (classe `parcours-contour`), et suit
    // la page tant que l'étape 7 est à l'écran. Le moteur n'est pas modifié (rapport de la nuit).
    var second = null;

    function majSecondContour() {
        if (!second) return;
        if (!M().actif() || M().etapeCourante() !== 6 || avantPremierCours) { retirerSecondContour(); return; }
        var c = champDate();
        if (!M().visible(c)) { second.hidden = true; return; }
        var r = c.getBoundingClientRect();
        second.hidden = false;
        second.style.left = (r.left - 5) + 'px';
        second.style.top = (r.top - 5) + 'px';
        second.style.width = (r.width + 10) + 'px';
        second.style.height = (r.height + 10) + 'px';
    }

    function poserSecondContour() {
        retirerSecondContour();
        second = document.createElement('div');
        second.className = 'parcours-contour';
        second.id = 'parcours-contour-date';
        second.hidden = true;
        document.body.appendChild(second);
        second._timer = setInterval(majSecondContour, 120);
        window.addEventListener('scroll', majSecondContour, { passive: true });
        window.addEventListener('resize', majSecondContour);
        majSecondContour();
    }

    function retirerSecondContour() {
        if (!second) return;
        clearInterval(second._timer);
        window.removeEventListener('scroll', majSecondContour);
        window.removeEventListener('resize', majSecondContour);
        if (second.parentNode) second.parentNode.removeChild(second);
        second = null;
    }

    // Décidé à la préparation de l'étape 7, avant que sa bulle soit rendue.
    var avantPremierCours = false;

    // ---------- Les lignes des bulles ----------

    /** Les champs d'une ligne, par leur identifiant (ceux qui la rendent faite, et où vont ses flèches). */
    function champs() {
        var ids = [].slice.call(arguments);
        return function () { return ids.map(el); };
    }

    function note(texte) { return { texte: texte, note: true }; }

    function consigne(texte) { return { texte: texte, geste: true }; }

    function rempli(id) {
        var c = el(id);
        if (!c) return false;
        if (c.type === 'file') return !!(c.files && c.files.length);
        return String(c.value || '').trim() !== '';
    }

    /** L'aperçu de l'import est à l'écran (« Prévisualiser », ou un fichier choisi). */
    function apercuDeLImport() { return M().visible(el('v2-previewZone')); }

    /**
     * Étape 4 : une des deux voies est prise (la liste collée, ou le fichier choisi). Vécu le 14 nov. : après avoir
     * choisi un fichier, les flèches vers la zone de collage et vers le fichier restaient.
     */
    function listeApportee() {
        return rempli('v2-donneesCollees') || rempli('v2-fichierCsvEntree') || apercuDeLImport();
    }

    // Les séances du groupe déjà verrouillées à l'arrivée de l'étape 7 : celle qui s'y ajoute est la saisie du parcours.
    var verrousAvant = null;

    /** Les dates verrouillées qui sont des séances du groupe-cours actif (lues sans semis, sans rien écrire). */
    function seancesVerrouillees() {
        if (!groupeCoursActif() || typeof window.lireDatesVerrouilleesSansSemis !== 'function') return [];
        var seances = seancesDuGroupe();
        return window.lireDatesVerrouilleesSansSemis().filter(function (d) {
            return Array.isArray(seances[d]) && seances[d].length > 0;
        });
    }

    /**
     * La séance que la personne vient de verrouiller : celle qui n'était pas verrouillée à l'arrivée de l'étape 7.
     * Sans ce repère (parcours repris à l'étape 8, ou rejoué en visite), la séance verrouillée la plus récente.
     */
    function seanceQuiVientDEtreVerrouillee() {
        var dates = seancesVerrouillees();
        var neuves = verrousAvant ? dates.filter(function (d) { return verrousAvant.indexOf(d) === -1; }) : [];
        return (neuves.length ? neuves : dates).slice().sort().pop() || null;
    }

    /**
     * Étape 8 : la personne a-t-elle noté une absence ou un retard, dans SON groupe, à la séance qu'elle vient de
     * verrouiller ? Lu dans les présences, sans rien écrire. On ne fait jamais inventer une absence sur une vraie
     * liste : la bulle dit seulement ce que la bande montre.
     * 14 nov. 2026 (relecture de Cowork) : une présence ne porte pas son groupe, seulement son cours. L'absence d'un·e
     * étudiant·e d'un autre groupe du même cours, le même jour, n'est pas un point de cette bande : on ne retient que
     * les étudiant·es du groupe-cours actif (les mêmes que la bande, `obtenirEtudiantsCoursActif`).
     */
    function absenceNotee() {
        var gc = groupeCoursActif();
        var date = seanceQuiVientDEtreVerrouillee();
        if (!gc || !date || typeof window.obtenirEtudiantsCoursActif !== 'function') return false;
        var duGroupe = {};
        (window.obtenirEtudiantsCoursActif() || []).forEach(function (e) { if (e && e.da) duGroupe[String(e.da)] = true; });
        var prevues = typeof window.obtenirNombrePeriodesSeance === 'function' ? window.obtenirNombrePeriodesSeance(date) : 0;
        var presences = db.getSync(cle('presences'), []) || [];
        return presences.some(function (p) {
            if (!p || p.date !== date || !duGroupe[String(p.da)]) return false;
            if (p.coursId && gc.coursId && p.coursId !== gc.coursId) return false;
            var presentes = Number(p.periodesPresentes);
            return prevues > 0 ? presentes < prevues : presentes === 0;
        });
    }

    // ---------- Les huit étapes ----------

    // Étape 7 (validé par Grégoire le 14 nov. 2026 ; le titre remplace « Ton premier cours »).
    var LIGNES_7 = [
        note("Ta classe est en place. Ce qui suit, tu le referas à chaque séance."),
        { texte: "Choisis une séance déjà donnée, ou celle d'aujourd'hui (l'application propose la plus récente)" },
        { texte: "Note seulement les absences et les retards (tout le monde est présent par défaut)" },
        consigne("Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)")
    ];
    // La variante d'avant la première séance, gardée, dans la même forme. RETOUCHÉE le 14 nov. 2026 (à valider par
    // Grégoire) : le texte du 8 nov. disait « Ton premier cours n'a pas encore eu lieu. Reviens après l'avoir donné » ;
    // la règle 6 réserve « cours » au cours qu'on donne et dit « séance » pour une rencontre avec le groupe.
    var LIGNES_7_AVANT = [
        note("Ta première séance n'a pas encore eu lieu."),
        { texte: "Reviens après l'avoir donnée : le parcours reprendra ici, avec ta première saisie de présences" },
        { texte: "En attendant, tu peux préparer tes outils dans « Conception »" },
        consigne("Touche « D'accord »")
    ];
    var BOUTONS_7_AVANT = [{ libelle: "D'accord", primaire: true, action: function () { attendreLePremierCours(); } }];

    var ETAPES = [
        {
            // Validé par Grégoire, 14 nov. 2026.
            titre: 'Ton trimestre',
            lieu: true,
            lignes: function () {
                return [
                    note("Aie sous la main le calendrier scolaire de ton collège."),
                    { texte: "Choisis la session et l'année (elles serviront à identifier ton trimestre)", champs: champs('v2-sessionTrimestre', 'v2-anneeTrimestre') },
                    { texte: "Donne trois dates (elles serviront à bâtir ton calendrier de séances) :", sous: [
                        { texte: "le début du trimestre", champs: champs('v2-debutTrimestre') },
                        { texte: "la fin des cours réguliers", champs: champs('v2-finCours') },
                        { texte: "la fin du trimestre", champs: champs('v2-finTrimestre') }
                    ] },
                    consigne("Touche « Créer le trimestre »"),
                    note("Le reste du formulaire peut attendre.")
                ];
            },
            avant: function () { return ouvrirBloc('trimestre'); },
            contour: function () { return el(BOUTON_CREER.trimestre); },
            atteint: function () { return reglee('trimestre'); }
        },
        {
            // Proposé par Cowork ; les deux raisons sont de Grégoire.
            titre: 'Ton cours',
            lignes: function () {
                return [
                    note("Aie sous la main ton plan de cours."),
                    { texte: "Le code du cours (ex. : 601-101-MQ)", champs: champs('v2-codeCours') },
                    { texte: "Sa pondération (elle servira à calculer tes heures de cours)", champs: champs('v2-ponderation') },
                    { texte: "Sa discipline (elle servira à identifier le matériel que tu partageras)", champs: champs('v2-disciplineCours') },
                    consigne("Touche « Créer le cours »"),
                    note("Tu donnes plusieurs cours ? Un seul suffit pour l'instant.")
                ];
            },
            avant: function () { return ouvrirBloc('cours'); },
            contour: function () { return el(BOUTON_CREER.cours); },
            atteint: function () { return reglee('cours'); }
        },
        {
            // Proposé par Cowork ; « institution » validé.
            titre: 'Ton profil',
            lignes: function () {
                return [
                    { texte: "Ton prénom et ton nom (ton groupe-cours doit savoir qui le donne)", champs: champs('v2-ens-prenom', 'v2-ens-nom') },
                    { texte: "Ton courriel et ton institution (ils accompagnent les ressources que tu partageras)", champs: champs('v2-ens-courriel', 'v2-ens-institution') },
                    consigne("Touche « Créer le profil »"),
                    note("Le reste du formulaire peut attendre.")
                ];
            },
            avant: function () { return ouvrirBloc('enseignant'); },
            contour: function () { return el(BOUTON_CREER.enseignant); },
            atteint: function () { return reglee('enseignant'); }
        },
        {
            // Proposé par Cowork, en UNE page. Les trois sous-lignes décrivent le format : elles ne se grisent pas.
            titre: 'Ta classe',
            lignes: function () {
                return [
                    note("Aie sous la main la liste de ton groupe (dans Léa, sur Omnivox : format Excel)."),
                    // « Colle ta liste ou choisis ton fichier » : les deux champs eux-mêmes, chacun sa flèche ; elles
                    // partent toutes deux dès qu'une des deux voies est prise (`listeApportee`).
                    { texte: "Colle ta liste ou choisis ton fichier. Une ligne par personne :",
                        champs: champs('v2-donneesCollees', 'v2-fichierCsvEntree'), fait: listeApportee, sous: [
                            { texte: "son DA (il l'identifie partout dans l'application)" },
                            { texte: "son numéro de groupe (il servira à ton horaire et à ton groupe-cours)" },
                            { texte: "son nom et son prénom" }
                        ] },
                    { texte: "Vérifie l'aperçu", fait: apercuDeLImport },
                    consigne("Touche « Importer »")
                ];
            },
            avant: function () { return ouvrirBloc('etudiants'); },
            // « Prévisualiser », puis, l'aperçu affiché, « Importer N étudiant·es » : c'est lui qui importe.
            contour: function () {
                var acc = accordeon('etudiants');
                var confirmer = el('v2-btnConfirmerImport');
                if (M().visible(confirmer)) return confirmer;
                return acc ? acc.querySelector('[data-action="previsualiserDonneesV2"]') : null;
            },
            atteint: function () { return reglee('etudiants'); }
        },
        {
            // Proposé par Cowork, non vu par Grégoire.
            titre: 'Ton horaire',
            lignes: function () {
                return [
                    note("Aie sous la main ton horaire."),
                    { texte: "Choisis le groupe (l'horaire lui sera lié)", champs: champs('v2-hor-groupeAssocie') },
                    { texte: "Nomme l'horaire (ex. : Lun-Mar)", champs: champs('v2-hor-nom') },
                    // Le jour et les heures naissent avec un défaut : rien ne dit que la personne les a regardés.
                    // Cette ligne ne se grise donc pas.
                    { texte: "Pour chaque séance : le jour, le début et la fin (le nombre de périodes s'écrit d'après ces heures ; corrige-le au besoin)" },
                    consigne("Touche « Créer l'horaire »")
                ];
            },
            avant: function () { return ouvrirBloc('horaire'); },
            contour: function () { return el(BOUTON_CREER.horaire); },
            atteint: function () { return reglee('horaire'); }
        },
        {
            // Proposé par Cowork. Le novice choisit lui-même dans les quatre listes (décision de Grégoire, 14 nov. 2026 :
            // « il faut faire le geste pour apprendre ») : le formulaire neuf n'y présélectionne rien, et le parcours
            // non plus (mesuré sous WebKit le 14 nov. ; verrouillé par parcours-2-ma-classe, étape 6).
            titre: 'Ton groupe-cours',
            lignes: function () {
                return [
                    note("Réunis ce que tu viens de créer :"),
                    { texte: "ton cours", champs: champs('v2-gc-cours') },
                    { texte: "ton numéro de groupe", champs: champs('v2-gc-groupe') },
                    { texte: "ton horaire", champs: champs('v2-gc-horaire') },
                    { texte: "toi, comme enseignant·e", champs: champs('v2-gc-enseignant') },
                    consigne("Touche « Créer le groupe-cours » (ton groupe apparaîtra dans l'en-tête de l'application)"),
                    note("La pratique de notation peut attendre.")
                ];
            },
            avant: function () { return ouvrirBloc('groupe-cours'); },
            contour: function () { return el(BOUTON_CREER['groupe-cours']); },
            atteint: function () { return reglee('groupe-cours'); }
        },
        {
            // Deux bulles sous un même rang : la saisie, ou, si aucune séance du groupe n'a encore eu lieu, la
            // variante d'avant la première séance. `avantPremierCours` est fixé par `avant`, que le moteur appelle
            // avant de lire la bulle.
            titre: 'Prendre les présences',
            lieu: true,
            lignes: function () { return avantPremierCours ? LIGNES_7_AVANT : LIGNES_7; },
            get sansSortie() { return avantPremierCours; },
            get boutons() { return avantPremierCours ? BOUTONS_7_AVANT : null; },
            avant: async function () {
                aller('suivi', 'saisie');
                await attendre(function () { return sousSectionVisible('suivi-saisie'); }, 2000);
                // Sans date à l'arrivée, la saisie propose la séance la plus récente (js/saisie-presences.js).
                await attendre(function () { var c = champDate(); return !!(c && c.value); }, 1500);
                avantPremierCours = !premierCoursPasse();
                verrousAvant = seancesVerrouillees();
                if (avantPremierCours) {
                    retirerSecondContour();
                } else {
                    await attendre(function () { return M().visible(boutonVerrou()); }, 1500);
                    poserSecondContour();
                }
            },
            zones: function () {
                if (avantPremierCours) return [];
                return [choixDuCours()].concat(colonnePresence(), nomsDeLaSaisie());
            },
            fleches: function () { return avantPremierCours ? [] : [choixDuCours()].concat(colonnePresence()); },
            contour: function () { return avantPremierCours ? null : boutonVerrou(); },
            atteint: function () { return !avantPremierCours && seanceVerrouillee(); }
        },
        {
            // Proposé par Cowork, en UNE page. Des explications : rien ne se grise.
            titre: "Ta classe d'un coup d'œil",
            lieu: true,
            lignes: function () {
                return [
                    note("Reviens-y avant chaque séance."),
                    { texte: "Chaque point blanc est un·e étudiant·e" },
                    { texte: "La bande « Assiduité » le place selon ses présences : à droite, il vient à ses cours ; s'il glisse vers la gauche, ses absences s'accumulent" },
                    { texte: "Les bandes « Complétion » et « Performance » sont vides : elles s'allumeront à tes premières évaluations" },
                    // Selon ce que la personne vient de saisir : jamais d'absence à inventer sur une vraie liste.
                    note(absenceNotee() ? "Ce point à l'écart, c'est l'absence que tu viens de noter."
                        : "Tout le monde était là : un point s'écartera à la première absence."),
                    // Quand la bulle offre aussi « Parcours suivant », le moteur dit les deux suites (sa consigne de la fin).
                    consigne("Touche « Terminer »")
                ];
            },
            sansSortie: true,
            avant: async function () {
                retirerSecondContour();
                aller('suivi', 'groupe');
                await attendre(blocAssiduite, 2000);
            },
            // La bande des points (« chaque point blanc est un·e étudiant·e »), pas le bloc et son titre.
            zones: function () { var b = blocAssiduite(); return [(b && b.querySelector('.barre-indicateur')) || b]; },
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard' };

    // ---------- Le lancement, « Plus tard », la fin ----------

    /**
     * 14 nov. 2026 (essai novice) — vécu par Grégoire : sur le parcours déjà fait, « Refaire » (et « Commencer avec ma
     * classe », à la fin de « Découvrir ») menait droit à la bulle 8 sur 8, puisqu'on partait de la première étape non
     * faite. On ne pouvait ni revoir le parcours, ni le montrer à quelqu'un.
     * · Le parcours FAIT se rejoue depuis sa première bulle, EN VISITE (js/parcours-moteur.js) : chaque étape déjà
     *   réglée se montre, rien n'avance tout seul, rien ne s'écrit (l'état « fait » du parcours reste tel quel), et
     *   la bulle offre « Continuer ».
     * · Le parcours à faire ou en cours part toujours de la première étape non faite ; le compteur « n sur N » ouvre
     *   la liste des étapes, où l'on revoit celles d'avant.
     */
    async function lancer() {
        // « Ta classe » : les vraies données. La démo ouverte se referme d'abord.
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        // Un import en cours empêche la sortie de la démo : rien ne part.
        if (enDemo()) return;
        var refaire = window.Assistance.etatDe(ID).etat === 'fait';
        var acquis = premiereNonFaite();
        var depuis = refaire ? 0 : acquis;
        if (!refaire) window.Assistance.definirEtat(ID, 'en-cours', depuis);
        return M().lancer(DEF, {
            depuis: depuis,
            acquis: acquis,
            visite: refaire,
            toutFait: refaire && acquis === ETAPES.length - 1,
            // Rejoué en visite, le parcours reste « fait » : aucune étape revue ne le rouvre.
            surEtape: function (i) { if (!refaire) window.Assistance.definirEtat(ID, 'en-cours', i); },
            // « Plus tard » (et Échap) : la bulle se ferme, le parcours attend à cette étape.
            surQuitter: function () { retirerSecondContour(); },
            // Les bulles sans « Plus tard » : la variante d'avant le premier cours, et la dernière.
            surEchap: function () {
                if (M().etapeCourante() === 7) terminer();
                else attendreLePremierCours();
            },
            // Entrée dans la démo en cours de route : le parcours se ferme et attend.
            verifier: function () { return !enDemo(); }
        });
    }

    /** « D'accord » : la bulle se ferme ; le parcours attend à l'étape 7, dans le panneau. */
    function attendreLePremierCours() {
        retirerSecondContour();
        M().fermer();
    }

    function terminer() {
        retirerSecondContour();
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Mettre ta classe en place',
        ligne: "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil.",
        total: ETAPES.length,
        lancer: lancer
    });

})();
