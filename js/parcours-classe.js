/* =================================================================
   LE PARCOURS « METTRE TA CLASSE EN PLACE » (lot « Les deux parcours », partie 2, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 2 ; esquisses 71 et 72.

   De « Commencer » à sa propre classe : le Cadre bloc par bloc (trimestre, cours, profil,
   étudiant·es, horaire, groupe-cours), puis la première saisie de présences, jusqu'à la bande
   d'assiduité de son propre groupe. Deux portes : « Commencer avec ma classe », à la fin de
   « Découvrir », et « Commencer » sur la carte enseignant de l'accueil (commencerParLeTrimestre).
   Il ne démarre jamais de lui-même.

   ⚠ Les huit textes, la variante d'avant le premier cours et leurs boutons sont ceux que
   Grégoire a validés un à un le 8 nov. au matin, posés mot pour mot :
   tests/unit/sentinelle-parcours-classe-2026-11-09.test.js les confronte à la consigne.

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

   LA MODÉLISATION (lot « deux temps », 12 nov. 2026 ; décisions de Grégoire des 11 et 12 nov.) : sous
   « Matériel de la démo », le même parcours se joue DANS LA DÉMO, avec le matériel fourni. La personne
   fait elle-même chaque geste (rien ne se remplit ni ne se clique tout seul) : elle crée un second
   groupe à côté de celui de la démo. Huit étapes (ETAPES_MODELE) : un cours, une liste à coller, son
   rattachement au cours, un horaire, un groupe-cours, le passage d'un groupe à l'autre dans l'en-tête, une saisie de
   présences, la bande d'assiduité.
   · Le trimestre et le profil n'y sont pas : la démo a son trimestre (en créer un en sortirait), et
     le profil est une donnée globale et personnelle (`enseignants`, `profilEnseignant`) : le créer
     dans la démo l'écrirait dans les vraies données. Le groupe-cours prend l'enseignant de la démo.
   · Ce qui est créé reste dans la démo (clés `demo_*` ; le cours, marqué, y est rangé à la sortie :
     js/demo-activation.js). L'état de la modélisation reste sur l'appareil (Assistance.definirEtatModele).
   · Elle commence à la première étape non faite, lue dans ce que la démo contient.
   · La dernière bulle offre la suite dans la démo et « Refaire avec mon matériel » : la démo se
     referme et le parcours repart sur les vraies données.
   ⚠ Les textes de la modélisation sont PROPOSÉS : Grégoire les juge sur l'aperçu.
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
    function seanceVerrouillee() {
        if (!groupeCoursActif() || typeof window.lireDatesVerrouilleesSansSemis !== 'function') return false;
        var seances = seancesDuGroupe();
        return window.lireDatesVerrouilleesSansSemis().some(function (d) {
            return Array.isArray(seances[d]) && seances[d].length > 0;
        });
    }

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

    // Le formulaire du bloc, sans la rangée de sélection au-dessus (bibliothèque, menu, « + Nouveau… »).
    // Les étapes 1, 2, 3, 5 et 6 le déclarent (`formulaire`) : le moteur en tire les champs obligatoires, et pose une
    // flèche sur chacun de ceux qui sont encore vides (Grégoire, 11 nov. 2026, 8 h 26).
    function blocDuFormulaire(idEtape) {
        var acc = accordeon(idEtape);
        return acc ? acc.querySelector('.panneau-formulaire') : null;
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

    // ---------- Les huit étapes ----------

    var TEXTE_7 = "Choisis un cours déjà donné, ou celui d'aujourd'hui : l'application te propose le plus récent. Tout le monde est présent par défaut, pour que la saisie ne te prenne que quelques secondes : tu ne notes que les absences et les retards, et tout s'enregistre au fur et à mesure. Quand c'est fini, verrouille la saisie : c'est ce qui dit à l'application que ce cours a eu lieu, même si personne n'était absent.";
    var TEXTE_7_AVANT = "Ton premier cours n'a pas encore eu lieu. Reviens après l'avoir donné : le parcours reprendra ici, avec ta première saisie de présences. En attendant, tu peux préparer tes outils dans Conception.";
    var BOUTONS_7_AVANT = [{ libelle: "D'accord", primaire: true, action: function () { attendreLePremierCours(); } }];

    var ETAPES = [
        {
            titre: 'Ton trimestre',
            geste: "Remplis les champs obligatoires, puis touche « Créer le trimestre ».",
            texte: "Commençons par ton trimestre : tout ce que tu feras s'y range, tes groupes, tes présences, tes évaluations. Donne-lui un nom, sa session et son année, puis trois dates : le début, la fin des cours et la fin du trimestre. Ces dates bornent le calendrier de tes séances. Le reste, comme les journées sans cours, peut attendre.",
            avant: function () { return ouvrirBloc('trimestre'); },
            formulaire: function () { return blocDuFormulaire('trimestre'); },
            contour: function () { return el(BOUTON_CREER.trimestre); },
            atteint: function () { return reglee('trimestre'); }
        },
        {
            titre: 'Ton cours',
            geste: "Remplis les champs obligatoires, puis touche « Créer le cours ».",
            texte: "Ajoute le cours que tu donnes à ce groupe. Tes productions se rangeront sous lui : si tu donnes le même cours à deux groupes, tu les prépares une seule fois. Si tu donnes plusieurs cours, un seul suffit pour l'instant.",
            avant: function () { return ouvrirBloc('cours'); },
            formulaire: function () { return blocDuFormulaire('cours'); },
            contour: function () { return el(BOUTON_CREER.cours); },
            atteint: function () { return reglee('cours'); }
        },
        {
            titre: 'Ton profil',
            geste: "Remplis les champs obligatoires, puis touche « Créer le profil ».",
            texte: "Ton prénom, ton nom, ton courriel et ton établissement. Ils servent à deux choses : ton groupe-cours a besoin de savoir qui le donne, et ils accompagnent les ressources que tu partageras.",
            avant: function () { return ouvrirBloc('enseignant'); },
            formulaire: function () { return blocDuFormulaire('enseignant'); },
            contour: function () { return el(BOUTON_CREER.enseignant); },
            atteint: function () { return reglee('enseignant'); }
        },
        {
            titre: 'Ta classe',
            geste: "Colle ta liste ou choisis ton fichier, touche « Prévisualiser », puis « Confirmer ».",
            texte: "Ajoute tes étudiant·es. Le plus simple : copie la liste de ton groupe depuis le système de ton établissement et colle-la ici, ou importe-la en fichier texte. La liste de Léa, dans Omnivox (format Excel, dans ses paramètres d'affichage), arrive déjà dans le bon ordre ; sinon, une ligne par personne : DA, groupe, nom, prénom. Le DA reconnaît chaque personne partout dans l'application, jusque dans le nom des fichiers que tu importeras. Le numéro de groupe servira à ton horaire et à ton groupe-cours. Le reste peut attendre.",
            avant: function () { return ouvrirBloc('etudiants'); },
            // « Colle-la ici, ou importe-la en fichier texte » : les deux champs eux-mêmes, chacun sa flèche (11 nov. 2026,
            // second essai : la bulle couvrait « Fichier » ; les deux cadres `.import-option`, à 20 px l'un de l'autre, se
            // fondaient en une seule cible tracée entre les deux).
            zones: function () { return [el('v2-donneesCollees'), el('v2-fichierCsvEntree')]; },
            // « Prévisualiser », puis, l'aperçu affiché, « Confirmer » : c'est lui qui importe.
            contour: function () {
                var acc = accordeon('etudiants');
                var confirmer = el('v2-btnConfirmerImport');
                if (M().visible(confirmer)) return confirmer;
                return acc ? acc.querySelector('[data-action="previsualiserDonneesV2"]') : null;
            },
            atteint: function () { return reglee('etudiants'); }
        },
        {
            titre: 'Ton horaire',
            geste: "Remplis les champs obligatoires, puis touche « Créer l'horaire ».",
            texte: "Indique les jours et les périodes où tu vois ce groupe. L'application en tire le calendrier de tes séances : c'est à chacune que s'attacheront tes présences, et plus tard ce que tu y enseignes.",
            avant: function () { return ouvrirBloc('horaire'); },
            formulaire: function () { return blocDuFormulaire('horaire'); },
            contour: function () { return el(BOUTON_CREER.horaire); },
            atteint: function () { return reglee('horaire'); }
        },
        {
            titre: 'Ton groupe-cours',
            geste: "Remplis les champs obligatoires, puis touche « Créer le groupe-cours ».",
            texte: "Réunis les cinq morceaux : le trimestre, le cours, le numéro de groupe, l'horaire et toi. Ton groupe apparaît alors dans l'en-tête : c'est sur lui que travaillent le Suivi et l'Évaluation, et c'est là que tu passeras d'un groupe à l'autre. Chacun de tes groupes aura le sien ; un seul suffit pour l'instant. La pratique de notation viendra plus tard : c'est là que tu décides comment tu construis la note du cours. La note de chaque évaluation, elle, n'en dépend pas.",
            avant: function () { return ouvrirBloc('groupe-cours'); },
            formulaire: function () { return blocDuFormulaire('groupe-cours'); },
            contour: function () { return el(BOUTON_CREER['groupe-cours']); },
            atteint: function () { return reglee('groupe-cours'); }
        },
        {
            // Deux bulles sous un même rang : la saisie, ou, si aucun cours du groupe n'a encore eu
            // lieu, la variante d'avant le premier cours. `avantPremierCours` est fixé par `avant`,
            // que le moteur appelle avant de lire la bulle.
            titre: 'Ton premier cours',
            get texte() { return avantPremierCours ? TEXTE_7_AVANT : TEXTE_7; },
            get centre() { return avantPremierCours; },
            get sansSortie() { return avantPremierCours; },
            get boutons() { return avantPremierCours ? BOUTONS_7_AVANT : null; },
            get geste() {
                return avantPremierCours ? "Touche « D'accord »."
                    : "Choisis ton cours, note les absences et les retards, puis touche « Verrouiller la saisie ».";
            },
            avant: async function () {
                aller('suivi', 'saisie');
                await attendre(function () { return sousSectionVisible('suivi-saisie'); }, 2000);
                // Sans date à l'arrivée, la saisie propose le cours le plus récent (js/saisie-presences.js).
                await attendre(function () { var c = champDate(); return !!(c && c.value); }, 1500);
                avantPremierCours = !premierCoursPasse();
                if (avantPremierCours) {
                    retirerSecondContour();
                    window.scrollTo(0, 0);
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
            titre: "Ta classe d'un coup d'œil",
            geste: "Touche « Terminer ».",
            texte: "Voici ta classe. Chaque point blanc est un·e de tes étudiant·es, et tous y sont dès ce premier cours. Au fil du trimestre, chaque point se déplace selon l'assiduité de la personne ; le graphique, dessous, garde la trace de ces déplacements. Une absence isolée ne dit pas grand-chose, des absences qui s'accumulent, oui : c'est le coup d'œil à donner avant d'entrer en classe. La complétion et la performance s'allumeront quand tu évalueras tes premiers travaux, et leurs points bougeront de la même façon.",
            sansSortie: true,
            avant: async function () {
                retirerSecondContour();
                aller('suivi', 'groupe');
                await attendre(blocAssiduite, 2000);
            },
            // La bande des points (« chaque point blanc est un·e de tes étudiant·es »), pas le bloc et son titre.
            zones: function () { var b = blocAssiduite(); return [(b && b.querySelector('.barre-indicateur')) || b]; },
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard' };

    // =================================================================
    // LA MODÉLISATION : le même parcours, dans la démo, avec le matériel fourni
    // =================================================================

    /*
     * LE MATÉRIEL FOURNI. La liste : huit noms manifestement fictifs, selon la règle de la démo arrêtée
     * par Grégoire le 29 oct. 2026 (des totems scouts : le prénom est un animal, le nom une qualité de
     * caractère bienveillante qui ne touche pas au travail scolaire ; la parité ; une faune des cinq
     * continents ; aucun nom déjà dans le pack). Une ligne par personne : DA, groupe, nom, prénom.
     */
    var MATERIEL = Object.freeze({
        cours: Object.freeze({ code: '601-999-DM', nom: 'Littérature et imaginaire', discipline: '601 Français (langue et littérature)', ponderation: '3-1-3' }),
        groupe: '00002',
        horaire: Object.freeze({ nom: 'Mardi matin', jour: 'Mardi', debut: '08:00', fin: '12:00', periodes: 4 }),
        etudiants: Object.freeze([
            ['9900001', 'Câlin', 'Koala'],
            ['9900002', 'Enjouée', 'Loutre'],
            ['9900003', 'Rieur', 'Lémur'],
            ['9900004', 'Généreuse', 'Hermine'],
            ['9900005', 'Doux', 'Tapir'],
            ['9900006', 'Vaillante', 'Antilope'],
            ['9900007', 'Amical', 'Yack'],
            ['9900008', 'Bienveillante', 'Cigogne']
        ])
    });

    function listeFournie() {
        return MATERIEL.etudiants.map(function (e) { return [e[0], MATERIEL.groupe, e[1], e[2]].join('\t'); }).join('\n');
    }

    // ---------- Ce que la démo contient déjà de la modélisation ----------

    function lire(nom) {
        var v = typeof db !== 'undefined' && typeof window.cle === 'function' ? db.getSync(window.cle(nom), []) : [];
        return Array.isArray(v) ? v : [];
    }

    /** Le cours créé dans la démo (la marque que pose sauvegarderCoursV2), pas un service. */
    function coursCree() {
        var cours = typeof db !== 'undefined' ? (db.getSync('cours', []) || []) : [];
        return cours.find(function (c) { return c && c.creeEnDemonstration === true && c.nature !== 'service'; }) || null;
    }

    /** Les étudiant·es ajouté·es dans la démo : celles et ceux qui ne viennent pas du pack (DA « DEMO… »). */
    function etudiantsAjoutes() {
        return lire('groupeEtudiants').filter(function (e) { return e && e.da && String(e.da).indexOf('DEMO') !== 0; });
    }

    function horaireCree() {
        return lire('horaires').find(function (h) { return h && h.id && h.id !== 'HOR_DEMO'; }) || null;
    }

    function groupeCoursCree() {
        return lire('groupesCours').find(function (g) { return g && g.id && g.id !== 'GC_DEMO'; }) || null;
    }

    /** Le groupe-cours actif est celui qu'on vient de créer. */
    function surLeGroupeCree() {
        var actif = groupeCoursActif();
        return !!actif && actif.id !== 'GC_DEMO' && lire('groupesCours').some(function (g) { return g && g.id === actif.id; });
    }

    var FAIT_MODELE = [
        function () { return !!coursCree(); },
        function () { return apercuOuvert() || etudiantsAjoutes().length > 0; },
        function () { return etudiantsAjoutes().length > 0; },
        function () { return !!horaireCree(); },
        function () { return !!groupeCoursCree(); },
        surLeGroupeCree,
        function () { return surLeGroupeCree() && seanceVerrouillee(); }
    ];

    function premiereNonFaiteModele() {
        for (var k = 0; k < FAIT_MODELE.length; k++) {
            if (!FAIT_MODELE[k]()) return k;
        }
        return FAIT_MODELE.length;
    }

    // ---------- Les blocs du Cadre, dans la démo ----------

    /**
     * Ouvre le bloc et son formulaire « + Nouveau… ». Dans la démo, le bloc a déjà ses éléments (le
     * cours, l'horaire et le groupe-cours du pack) : le formulaire de création s'ouvre tant que l'étape
     * n'est pas faite, sauf s'il l'est déjà (une saisie en cours n'est pas effacée).
     */
    async function ouvrirBlocModele(idEtape, faite) {
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
        if (bouton && !M().visible(bouton) && !faite() && typeof nouveau === 'function') await nouveau();
        await attendre(pageImmobile(acc), 2000);
    }

    // ---------- La saisie des présences du groupe créé ----------

    /** La date affichée est un cours du groupe-cours actif (ses séances, lues dans leur cache). */
    function dateEstUnCoursDuGroupe() {
        var c = champDate(), seances = seancesDuGroupe();
        return !!(c && c.value && Array.isArray(seances[c.value]) && seances[c.value].length > 0);
    }

    /** « Précédent », dans la rangée du choix du cours. */
    function boutonPrecedent() {
        var rangee = choixDuCours();
        return rangee ? rangee.querySelector('button') : null;
    }

    // ---------- La liste à coller ----------

    function champListe() { return el('v2-donneesCollees'); }

    function menuRattachement() { return el('v2-importCoursCible'); }

    function boutonPrevisualiser() {
        var acc = accordeon('etudiants');
        return acc ? acc.querySelector('[data-action="previsualiserDonneesV2"]') : null;
    }

    /** L'aperçu de l'import est à l'écran (« Prévisualiser » touché, la liste collée). */
    function apercuOuvert() {
        return M().visible(el('v2-btnConfirmerImport'));
    }

    /** L'aperçu de l'import est affiché et son menu de rattachement ne nomme pas le cours créé. */
    function rattachementAChoisir() {
        var menu = menuRattachement(), cours = coursCree();
        return !!(menu && M().visible(menu) && cours && menu.value !== cours.id);
    }

    /** Copie la liste fournie dans le presse-papiers : c'est la personne qui la colle. */
    async function copierLaListe() {
        var texte = listeFournie(), copie = false;
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(texte);
                copie = true;
            }
        } catch (e) { copie = false; }
        if (!copie) {
            // Sans presse-papiers asynchrone (page ouverte en fichier, navigateur ancien) : la copie d'une sélection.
            var tampon = document.createElement('textarea');
            tampon.value = texte;
            tampon.setAttribute('readonly', '');
            tampon.className = 'parcours-tampon-copie';
            document.body.appendChild(tampon);
            tampon.select();
            try { copie = document.execCommand('copy'); } catch (e2) { copie = false; }
            tampon.remove();
        }
        if (!window.notifications) return;
        if (copie && typeof window.notifications.succes === 'function') window.notifications.succes(MOTS_MODELE.listeCopiee);
        if (!copie && typeof window.notifications.warning === 'function') window.notifications.warning(MOTS_MODELE.copierLaListe, MOTS_MODELE.listeNonCopiee);
    }

    // ---------- Les huit étapes de la modélisation (textes PROPOSÉS, 12 nov. 2026) ----------

    var MOTS_MODELE = {
        copierLaListe: 'Copier la liste',
        listeCopiee: 'Liste copiée. Colle-la dans le champ.',
        listeNonCopiee: "La liste n'a pas pu être copiée. Essaie de nouveau.",
        pasUnCours: "Ce jour-là, ce groupe n'a pas cours : touche « Précédent » pour revenir à son dernier cours.",
        apercuFerme: "L'aperçu est refermé : touche « Prévisualiser » pour le rouvrir.",
        explorer: 'Explorer la démo',
        refaire: 'Refaire avec mon matériel'
    };

    /** Le parcours suivant, s'il a sa modélisation : le bouton principal de la dernière bulle porte son titre. */
    function suivantDansLaDemo() {
        var suivant = window.Assistance.parcours().find(function (p) { return p.id === 'evaluer'; });
        return suivant && typeof suivant.lancerModele === 'function' ? suivant : null;
    }

    var ETAPES_MODELE = [
        {
            titre: 'Un cours',
            geste: "Remplis les champs obligatoires avec le matériel fourni, puis touche « Créer le cours ».",
            texte: "Dans la démo, tu vas monter un second groupe, geste par geste, avec du matériel fourni. D'abord son cours. Le matériel : le code " + MATERIEL.cours.code + ", le nom « " + MATERIEL.cours.nom + " », la discipline « " + MATERIEL.cours.discipline + " » et la pondération " + MATERIEL.cours.ponderation + ". Les productions se rangent sous le cours : si tu donnes le même cours à deux groupes, tu les prépares une seule fois.",
            avant: function () { return ouvrirBlocModele('cours', FAIT_MODELE[0]); },
            formulaire: function () { return blocDuFormulaire('cours'); },
            contour: function () { return el(BOUTON_CREER.cours); },
            atteint: FAIT_MODELE[0]
        },
        {
            titre: "Une liste d'étudiant·es",
            geste: "Touche « Copier la liste », colle-la dans le champ, puis touche « Prévisualiser ».",
            texte: "Voici une liste de huit étudiant·es fictif·ves, comme celle que tu copieras du système de ton établissement : une ligne par personne, avec le DA, le groupe, le nom et le prénom. Copie-la, puis colle-la dans le champ. Le DA reconnaît chaque personne partout dans l'application ; le numéro de groupe, " + MATERIEL.groupe + ", servira à l'horaire et au groupe-cours.",
            avant: function () { return ouvrirBlocModele('etudiants', FAIT_MODELE[1]); },
            zones: function () { return [champListe()]; },
            // Un geste à la fois : le champ où coller, puis « Prévisualiser ».
            contour: function () {
                var champ = champListe();
                return champ && !champ.value.trim() ? champ : boutonPrevisualiser();
            },
            boutons: [{ libelle: MOTS_MODELE.copierLaListe, primaire: true, action: function () { copierLaListe(); } }],
            atteint: FAIT_MODELE[1]
        },
        {
            titre: 'Le cours de la liste',
            geste: "Choisis le cours " + MATERIEL.cours.code + ", puis touche « Importer 8 étudiant·es ».",
            texte: "L'aperçu montre les huit personnes, telles qu'elles seront importées. Dessous, l'application demande à quel cours les rattacher : elle propose le cours actif, celui de la démo. Choisis le cours que tu viens de créer, puis confirme l'import.",
            avant: function () { return ouvrirBlocModele('etudiants', FAIT_MODELE[2]); },
            zones: function () { return [el('v2-previewTable')]; },
            // L'aperçu refermé (« Annuler ») : la bulle le dit, et montre « Prévisualiser ».
            avis: function () { return apercuOuvert() ? '' : MOTS_MODELE.apercuFerme; },
            // Un geste à la fois : le menu du cours, puis le bouton qui importe.
            contour: function () {
                if (!apercuOuvert()) return boutonPrevisualiser();
                return rattachementAChoisir() ? menuRattachement() : el('v2-btnConfirmerImport');
            },
            atteint: FAIT_MODELE[2]
        },
        {
            titre: 'Un horaire',
            geste: "Remplis les champs obligatoires avec le matériel fourni, puis touche « Créer l'horaire ».",
            texte: "Le nouveau groupe a besoin d'un horaire. Le matériel : le groupe " + MATERIEL.groupe + ", le nom « " + MATERIEL.horaire.nom + " », une séance, le mardi de 8 h à 12 h, quatre périodes. L'application en tire le calendrier des séances : c'est à chacune que s'attachent les présences.",
            avant: function () { return ouvrirBlocModele('horaire', FAIT_MODELE[3]); },
            formulaire: function () { return blocDuFormulaire('horaire'); },
            contour: function () { return el(BOUTON_CREER.horaire); },
            atteint: FAIT_MODELE[3]
        },
        {
            titre: 'Un groupe-cours',
            geste: "Choisis les cinq morceaux, puis touche « Créer le groupe-cours ».",
            texte: "Réunis les cinq morceaux : le trimestre « Démonstration », le cours " + MATERIEL.cours.code + ", le groupe " + MATERIEL.groupe + ", l'horaire « " + MATERIEL.horaire.nom + " » et l'enseignant de la démo, Primo Primavera. Le groupe-cours relie tout : c'est sur lui que travaillent le Suivi et l'Évaluation.",
            avant: function () { return ouvrirBlocModele('groupe-cours', FAIT_MODELE[4]); },
            formulaire: function () { return blocDuFormulaire('groupe-cours'); },
            contour: function () { return el(BOUTON_CREER['groupe-cours']); },
            atteint: FAIT_MODELE[4]
        },
        {
            titre: "D'un groupe à l'autre",
            geste: "Dans l'en-tête, choisis le groupe " + MATERIEL.cours.code + ".",
            texte: "Le nouveau groupe est maintenant dans l'en-tête, à côté de celui de la démo. C'est là que tu passes d'un groupe à l'autre : tout ce que montrent le Suivi et l'Évaluation suit le groupe choisi. Choisis celui que tu viens de créer.",
            nommeLeContour: true,
            contour: function () { return el('selectGroupeCoursHeader'); },
            atteint: FAIT_MODELE[5]
        },
        {
            titre: 'Un premier cours',
            geste: "Choisis un cours du groupe, note une absence ou un retard, puis touche « Verrouiller la saisie ».",
            texte: "Voici la saisie des présences du nouveau groupe. Choisis un de ses cours : « Précédent » et « Suivant » passent de l'un à l'autre. Tout le monde est présent par défaut : tu ne notes que les absences et les retards, et tout s'enregistre au fur et à mesure. Note une absence pour l'exemple, puis verrouille la saisie : c'est ce qui dit à l'application que ce cours a eu lieu.",
            avant: async function () {
                avantPremierCours = false;
                aller('suivi', 'saisie');
                await attendre(function () { return sousSectionVisible('suivi-saisie'); }, 2000);
                await attendre(function () { var c = champDate(); return !!(c && c.value); }, 1500);
                await attendre(function () { return M().visible(boutonVerrou()); }, 1500);
                poserSecondContour();
            },
            zones: function () { return [choixDuCours()].concat(colonnePresence(), nomsDeLaSaisie()); },
            fleches: function () { return [choixDuCours()].concat(colonnePresence()); },
            // La saisie garde la date du groupe d'avant : tant qu'elle n'est pas un cours de ce groupe-ci, la
            // bulle le dit et montre « Précédent » (mesuré le 12 nov. : il revient au dernier cours du groupe).
            avis: function () { return dateEstUnCoursDuGroupe() ? '' : MOTS_MODELE.pasUnCours; },
            contour: function () { return dateEstUnCoursDuGroupe() ? boutonVerrou() : boutonPrecedent(); },
            atteint: FAIT_MODELE[6]
        },
        {
            titre: "Le groupe d'un coup d'œil",
            get geste() { return suivantDansLaDemo() ? 'Choisis la suite.' : 'Explore la démo, ou refais le parcours avec ton matériel.'; },
            texte: "Voici le groupe que tu viens de monter. Chaque point blanc est une des huit personnes de la liste, placée selon son assiduité : l'absence que tu as notée s'y voit déjà. C'est le coup d'œil à donner avant d'entrer en classe. Tu as fait tous les gestes : il reste à les refaire avec ta vraie liste, ton vrai cours et ton vrai horaire.",
            sansSortie: true,
            avant: async function () {
                retirerSecondContour();
                aller('suivi', 'groupe');
                await attendre(blocAssiduite, 2000);
            },
            zones: function () { var b = blocAssiduite(); return [(b && b.querySelector('.barre-indicateur')) || b]; },
            // En principal, la suite dans la démo : le parcours suivant quand il a sa modélisation
            // (nommé par son titre), sinon la démo à explorer. En second, le même parcours sur les vraies données.
            get boutons() {
                var suivant = suivantDansLaDemo();
                return [
                    suivant
                        ? { libelle: suivant.titre, primaire: true, action: function () { terminerModele(); suivant.lancerModele(0); } }
                        : { libelle: MOTS_MODELE.explorer, primaire: true, action: function () { terminerModele(); } },
                    { libelle: MOTS_MODELE.refaire, action: function () { refaireAvecMonMateriel(); } }
                ];
            }
        }
    ];

    var DEF_MODELE = { id: ID + '-modele', etapes: ETAPES_MODELE, lienSortie: 'Plus tard' };

    async function lancerModele() {
        // La modélisation se joue dans la démo : elle l'ouvre si elle ne l'est pas.
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        // Un import en cours empêche l'entrée dans la démo : rien ne part.
        if (!enDemo()) return;
        var depuis = premiereNonFaiteModele();
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(DEF_MODELE, {
            depuis: depuis,
            surEtape: function (i) { window.Assistance.definirEtatModele(ID, 'en-cours', i); },
            surQuitter: function () { retirerSecondContour(); },
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Explorer la démo ».
            surEchap: function () { terminerModele(); },
            // Sortie de la démo en cours de route (le bandeau vert) : la modélisation se ferme et attend.
            verifier: enDemo
        });
    }

    function terminerModele() {
        retirerSecondContour();
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    /** « Refaire avec mon matériel » : la démo se referme, le même parcours repart sur les vraies données. */
    async function refaireAvecMonMateriel() {
        terminerModele();
        window.Assistance.definirMateriel('mien');
        await lancer();
    }

    // ---------- Le lancement, « Plus tard », la fin ----------

    async function lancer() {
        // « Ta classe » : les vraies données. La démo ouverte se referme d'abord.
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        // Un import en cours empêche la sortie de la démo : rien ne part.
        if (enDemo()) return;
        var depuis = premiereNonFaite();
        window.Assistance.definirEtat(ID, 'en-cours', depuis);
        return M().lancer(DEF, {
            depuis: depuis,
            surEtape: function (i) { window.Assistance.definirEtat(ID, 'en-cours', i); },
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
        lancer: lancer,
        // Les deux temps (12 nov. 2026) : la modélisation, dans la démo.
        totalModele: ETAPES_MODELE.length,
        lancerModele: lancerModele
    });

    // Pour la sentinelle des textes et les bancs : le matériel fourni et les étapes de la modélisation.
    window.ParcoursClasse = Object.freeze({
        materiel: MATERIEL,
        etapesModele: ETAPES_MODELE
    });

})();
