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
   ligne. « NOUS FAISONS », RÉÉCRIT LE 19 NOV. 2026 avec Grégoire, dans la forme et le ton de « Je regarde »
   (plans de travail/CONSIGNE-2026-11-19-nous-faisons-classe.md) : l'objectif à la première bulle et l'objectif
   atteint à la dernière (sur `DEF`), la phrase du lieu avec sa section, « C'est fait : … » au-dessus du titre
   SEULEMENT pour une étape faite pendant ce passage, les explications sans marque, les gestes fléchés. Les huit
   bulles et la variante de la septième sont validées mot pour mot :
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

   LA MODÉLISATION (lot « deux temps », 12 nov. 2026 ; règle du 14 nov. 2026) : sous « Je regarde », le même
   parcours se joue DANS LA DÉMO, avec le matériel de la démo : un deuxième groupe, à côté de celui du pack. Huit
   étapes (ETAPES_MODELE) : un cours, une liste, son rattachement au cours, un horaire, un groupe-cours, le passage
   d'un groupe à l'autre dans l'en-tête, une saisie de présences, la bande d'assiduité.
   · LA RÈGLE (Grégoire, 14 nov. 2026, 12 h 08 ; elle remplace « rien ne se remplit tout seul », du 12 nov.) : la
     Modélisation va plus vite parce que le matériel est déjà là. Une bulle qui porte un formulaire va en trois
     temps : « Regarde l'exemple se remplir : touche « Remplir » » (le bouton est DANS la bulle : la seule exception à « la bulle
     guide, la page agit », et seulement ici) ; puis les lignes qui expliquent ce qui vient d'apparaître, chacune avec
     sa flèche ; puis, en dernière ligne, le bouton de la PAGE, que la personne touche elle-même.
   · « Remplir » n'écrit que dans la démo (`remplir`) : hors de la démo, il ne fait rien.
   · Le trimestre et le profil n'y sont pas : la démo a son trimestre (en créer un en sortirait), et le profil est
     une donnée globale et personnelle (`enseignants`, `profilEnseignant`) : le créer dans la démo l'écrirait dans
     les vraies données. Le groupe-cours prend l'enseignant de la démo.
   · Ce qui est créé reste dans la démo (clés `demo_*` ; le cours, marqué, y est rangé à la sortie :
     js/demo-activation.js). L'état de la Modélisation reste sur l'appareil (Assistance.definirEtatModele).
   · Elle commence à la première étape non faite, lue dans ce que la démo contient. Faite, elle se REFAIT gestes
     compris : le panneau remet d'abord la démo à neuf (js/assistance.js, « REFAIRE »).
   · La dernière bulle offre trois suites de même poids : « Le refaire avec ma classe », « Voir le parcours suivant »
     (quand il a son modèle), « Terminer » (Grégoire, 14 nov., 10 h 58).
   ⚠ Les textes de la Modélisation sont ceux du 16 nov. 2026, réécrits avec Grégoire (voir ETAPES_MODELE).
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
        // Sa place aussi (16 nov. 2026) : un bloc qui se referme au-dessus de lui le fait monter sans changer sa hauteur.
        return immobile(function () {
            var r = e ? e.getBoundingClientRect() : null;
            return Math.round(window.scrollY) + ':' + (r ? Math.round(r.height) + ':' + Math.round(r.top) : 0);
        });
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
     * en-tête et ses cases), pas le tableau entier. Ses cellules se touchent : une seule flèche (le moteur fond les cibles qui se touchent), et la bulle peut se poser
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
        // En visite, rien n'est désigné qui écrit (js/parcours-moteur.js) : la date de la séance non plus.
        if (!M().actif() || M().etapeCourante() !== 6 || avantPremierCours || M().enVisite()) { retirerSecondContour(); return; }
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
    // Le parcours fait, rejoué (« Refaire ») : fixé au lancement.
    var rejoue = false;

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
    // TEXTES DU 19 NOV. 2026, réécrits avec Grégoire (8 h 13 à 10 h 46) dans la forme et le ton de « Je regarde » ;
    // consigne : plans de travail/CONSIGNE-2026-11-19-nous-faisons-classe.md. Mot pour mot : la sentinelle
    // tests/unit/sentinelle-parcours-classe-2026-11-09.test.js les confronte à la consigne. Le classement de chaque ligne
    // est celui de la consigne : un geste (une flèche ; `champs`, `fait`, la consigne en gras) ou une explication (`note`,
    // sans marque). Les noms du menu et des sections sont LUS à l'écran par le moteur (`lieu`, `nommeLaSection`).

    /**
     * Un geste que la page ne peut pas confirmer : ce qu'il règle naît avec une valeur (le nombre de séances, le jour et les
     * heures, la séance proposée), et rien ne dit que la personne l'a regardée. La ligne porte la flèche d'un geste, et ne se
     * grise pas (supposé par Cowork pour le nombre de séances, 19 nov. 2026 ; tranché ici pour les quatre).
     */
    function sansTemoin(texte) { return { texte: texte, fait: function () { return false; } }; }

    /** L'étape k est faite, lue comme `premiereNonFaite` la lit (les six blocs du Cadre, puis la séance verrouillée). */
    function etapeFaite(k) {
        return k < ETAPES_DU_CADRE.length ? reglee(ETAPES_DU_CADRE[k]) : seanceVerrouillee();
    }

    // Les étapes déjà faites au lancement de ce passage (`lancer`) : null hors d'un passage.
    var faitesAuLancement = null;

    /**
     * « C'est fait : … », au-dessus du titre, SEULEMENT si l'étape d'avant (k) a été faite PENDANT CE PASSAGE (décision de
     * Cowork, relais du 19 nov. 2026) : une étape sautée parce que déjà réglée, ou rejouée en visite, n'en a pas.
     */
    function confirmation(k, texte) {
        var dire = function () { return faitesAuLancement && !faitesAuLancement[k] && etapeFaite(k) ? texte : ''; };
        dire.texte = texte;   // pour la sentinelle des textes : ce qu'elle dit, quand elle le dit
        return dire;
    }

    // Étape 7 (validée par Grégoire le 19 nov. 2026, 10 h 41).
    var LIGNES_7 = [
        note("Tu prends déjà les présences ; ici, chaque séance s'ajoute à la mémoire de ta classe."),
        sansTemoin("Choisis une séance déjà donnée, ou celle d'aujourd'hui (l'application propose la plus récente)"),
        sansTemoin("Note seulement les absences et les retards (tout le monde est présent par défaut)"),
        consigne("Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)")
    ];
    // La variante d'avant la première séance (validée par Grégoire le 19 nov. 2026, 10 h 44) : deux explications, un geste.
    var LIGNES_7_AVANT = [
        note("Ta première séance n'a pas encore eu lieu. Reviens après l'avoir donnée : le parcours reprendra ici, avec ta première saisie de présences."),
        note("En attendant, tu peux préparer tes grilles d'évaluation dans « Conception »."),
        consigne("Touche « D'accord »")
    ];
    var BOUTONS_7_AVANT = [{ libelle: "D'accord", primaire: true, action: function () { attendreLePremierCours(); } }];

    var ETAPES = [
        {
            // Validée par Grégoire le 19 nov. 2026, 8 h 13. L'objectif et la phrase de la poignée : posés par le moteur.
            titre: 'Ton trimestre',
            lieu: true,
            section: sectionDuCadre('trimestre'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu donnes les dates de ton trimestre.",
            lignes: function () {
                return [
                    note("Cette fois, c'est ta propre classe : ce que tu crées ici reste dans ton application."),
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
            // LA BULLE NE COUVRE PAS CE DONT ELLE PARLE (règle 8 du relais du 16 nov. 2026, 13 h 20) : le nom du
            // trimestre, que la session et l'année composent sous les yeux de la personne, n'est pas un champ à remplir ;
            // la bulle ne l'évitait donc pas, et le couvrait à 1180 × 900 (banc parcours-2-ma-classe).
            aussiEviter: function () { return [el('v2-nomTrimestre')]; },
            contour: function () { return el(BOUTON_CREER.trimestre); },
            atteint: function () { return reglee('trimestre'); }
        },
        {
            // Validée par Grégoire le 19 nov. 2026, 9 h 20 (sa retouche de la dernière ligne).
            titre: 'Ton cours',
            confirme: confirmation(0, "C'est fait : ton trimestre est créé."),
            section: sectionDuCadre('cours'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu dis quel cours tu donnes.",
            lignes: function () {
                return [
                    note("Aie sous la main ton plan de cours."),
                    { texte: "Le code du cours (ex. : 601-101-MQ)", champs: champs('v2-codeCours') },
                    { texte: "Sa pondération (elle servira à calculer tes heures de cours)", champs: champs('v2-ponderation') },
                    { texte: "Sa discipline (elle servira à identifier le matériel que tu partageras)", champs: champs('v2-disciplineCours') },
                    consigne("Touche « Créer le cours »"),
                    note("Tu donnes plusieurs cours ? Crée-en un seul pour l'instant : tu ajouteras les autres après ce parcours.")
                ];
            },
            avant: function () { return ouvrirBloc('cours'); },
            contour: function () { return el(BOUTON_CREER.cours); },
            atteint: function () { return reglee('cours'); }
        },
        {
            // Validée par Grégoire le 19 nov. 2026, 9 h 22. Le nom paraît au pied des PDF (js/export-pdf.js).
            titre: 'Ton profil',
            confirme: confirmation(1, "C'est fait : ton cours est créé."),
            section: sectionDuCadre('enseignant'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu dis qui donne le cours.",
            lignes: function () {
                return [
                    { texte: "Ton prénom et ton nom (ils paraîtront au bas des PDF que tu remettras à tes étudiant·es)", champs: champs('v2-ens-prenom', 'v2-ens-nom') },
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
            // Validée par Grégoire le 19 nov. 2026, 9 h 35. Les trois sous-lignes décrivent le format : ce sont des
            // explications, elles ne se grisent pas et ne portent pas de flèche.
            titre: 'Ta classe',
            confirme: confirmation(2, "C'est fait : ton profil est créé."),
            section: sectionDuCadre('etudiants'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu apportes la liste de ton groupe.",
            lignes: function () {
                return [
                    note("Aie sous la main la liste de ton groupe, tirée du système de gestion scolaire de ton collège."),
                    // Les deux champs eux-mêmes, chacun sa flèche ; elles partent toutes deux dès qu'une des deux voies est
                    // prise (`listeApportee`). Le choix de fichier n'accepte que .csv, .tsv et .txt (index.html).
                    { texte: "Colle ta liste, copiée de ton tableur, ou choisis un fichier .csv. Une ligne par personne :",
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
            // Validée par Grégoire le 19 nov. 2026, 10 h 34. Le menu « Séances par semaine » naît à 2, le jour et les
            // heures avec un défaut : ces deux lignes ne se grisent pas (`sansTemoin`).
            titre: 'Ton horaire',
            confirme: confirmation(3, "C'est fait : tes étudiant·es sont importé·es."),
            section: sectionDuCadre('horaire'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu dis quand ton groupe se rencontre.",
            lignes: function () {
                return [
                    note("Aie sous la main ton horaire."),
                    { texte: "Choisis le groupe (l'horaire lui sera lié)", champs: champs('v2-hor-groupeAssocie') },
                    { texte: "Nomme l'horaire (ex. : Lun-Mar)", champs: champs('v2-hor-nom') },
                    sansTemoin("Choisis le nombre de séances par semaine (des heures consécutives avec un même groupe comptent pour une seule séance)"),
                    sansTemoin("Pour chaque séance : le jour, le début et la fin (le nombre de périodes s'écrit d'après ces heures ; corrige-le au besoin)"),
                    consigne("Touche « Créer l'horaire »")
                ];
            },
            avant: function () { return ouvrirBloc('horaire'); },
            contour: function () { return el(BOUTON_CREER.horaire); },
            atteint: function () { return reglee('horaire'); }
        },
        {
            // Validée par Grégoire le 19 nov. 2026, 10 h 36 (« tu assembles », le verbe de la page). Le novice choisit
            // lui-même dans les quatre listes (décision de Grégoire, 14 nov. 2026 : « il faut faire le geste pour
            // apprendre ») : le formulaire neuf n'y présélectionne rien, et le parcours non plus (verrouillé par
            // parcours-2-ma-classe, étape 6). Le groupe-cours créé ici est le premier du trimestre : il devient le
            // groupe actif de l'en-tête (sauvegarderGroupeCoursV2 ; mesuré le 19 nov., rapport du lot, mesure b).
            titre: 'Ton groupe-cours',
            confirme: confirmation(4, "C'est fait : ton horaire est créé."),
            section: sectionDuCadre('groupe-cours'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu assembles ce que tu viens de créer.",
            lignes: function () {
                return [
                    note("Un groupe-cours, c'est une classe : un cours, un groupe, un horaire, un·e enseignant·e. C'est à lui que se rattachera tout ce que l'application gardera : présences, productions, évaluations."),
                    { texte: "Ton cours", champs: champs('v2-gc-cours') },
                    { texte: "Ton numéro de groupe", champs: champs('v2-gc-groupe') },
                    { texte: "Ton horaire", champs: champs('v2-gc-horaire') },
                    { texte: "Toi, comme enseignant·e", champs: champs('v2-gc-enseignant') },
                    consigne("Touche « Créer le groupe-cours » (il apparaîtra dans l'en-tête de l'application)"),
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
            // avant de lire la bulle. La confirmation est la même aux deux.
            titre: 'Prendre les présences',
            confirme: confirmation(5, "C'est fait : ton groupe-cours est créé. La mise en place est terminée."),
            lieu: true,
            lieuSuite: function () { return avantPremierCours ? '' : "Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi."; },
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
                // Rejoué, la séance déjà verrouillée : l'étape s'ouvrira en visite, sans contour (le moteur ne le sait
                // qu'après cette préparation ; `majSecondContour` le relit ensuite).
                if (avantPremierCours || (rejoue && seanceVerrouillee())) {
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
            // Validée par Grégoire le 19 nov. 2026, 10 h 46. Tout est explication, sauf la consigne de la fin.
            // « Pour revoir une étape… », « Objectif atteint : … » et la phrase de la suite : posés par le moteur.
            titre: "Ta classe d'un coup d'œil",
            confirme: confirmation(6, "C'est fait : la séance est verrouillée."),
            lieu: true,
            lieuSuite: "Reviens-y avant chaque séance.",
            lignes: function () {
                return [
                    note("Chaque point blanc est un·e de tes étudiant·es. La bande « Assiduité » le place selon ses présences : plus il glisse vers la gauche, plus les absences s'accumulent."),
                    // Selon ce que la personne vient de saisir : jamais d'absence à inventer sur une vraie liste.
                    note(absenceNotee() ? "Ce point à l'écart, c'est l'absence que tu viens de noter."
                        : "Tout le monde était là : un point s'écartera à la première absence."),
                    note("Les bandes « Complétion » et « Performance » sont vides : elles s'allumeront à tes premières évaluations."),
                    // Grégoire, 20 nov. 2026 (essai sur l'iPad) : la fin de la phrase, réécrite, dans les deux temps.
                    note("Séance après séance, tu verras qui s'éloigne. C'est un premier signe : cette personne a peut-être besoin que tu ailles vers elle, même si elle n'a rien demandé."),
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
            // La bande des points (« chaque point blanc est un·e de tes étudiant·es »), pas le bloc et son titre.
            zones: function () { var b = blocAssiduite(); return [(b && b.querySelector('.barre-indicateur')) || b]; },
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    // L'objectif du parcours (validé par Grégoire, bulles 1 et 8, 19 nov. 2026) : dit par la première bulle, rappelé par
    // la dernière, posés par le moteur. Une seule écriture.
    var EN_MESURE_CLASSE = "de mettre ta propre classe en place, du trimestre jusqu'aux présences d'une séance";

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard',
                objectif: "À la fin de ce parcours, tu seras en mesure " + EN_MESURE_CLASSE + ".",
                objectifAtteint: "Objectif atteint : tu es en mesure " + EN_MESURE_CLASSE + "." };

    // =================================================================
    // LA MODÉLISATION : le même parcours, dans la démo, avec le matériel de la démo
    // =================================================================

    /*
     * LE MATÉRIEL DE L'EXEMPLE. La liste : dix noms manifestement fictifs, selon la règle de la démo arrêtée par
     * Grégoire le 29 oct. 2026 (des totems scouts : le prénom est un animal, le nom une qualité de caractère
     * bienveillante qui ne touche pas au travail scolaire ; la parité ; une faune des cinq continents ; aucun nom
     * déjà dans le pack). Une ligne par personne : DA, groupe, nom, prénom.
     * L'HORAIRE (Grégoire, 15 nov. 2026, 10 h 06 : un cours de littérature a 4 périodes par semaine, en un bloc de 4
     * ou en deux blocs de 2 ; décision de Cowork : deux blocs, comme dans sa carte d'alignement) : le mardi et le
     * vendredi, de 8 h à 10 h, 2 périodes chacune.
     * LES PRÉSENCES de la première séance : deux absences et un retard (une période sur deux), trois totems de la liste.
     * Ce sont les trois premiers de la saisie, qui range par nom (Amical, Attentionné, Bienveillante) : leurs cases se
     * suivent, en haut du tableau, et se voient ensemble sur l'iPad (mesuré le 15 nov. 2026 : à 900 px de haut, les
     * rangées 5 et 8 étaient sous le bas de l'écran, et leurs flèches manquaient).
     */
    var MATERIEL = Object.freeze({
        cours: Object.freeze({ code: '601-999-DM', nom: 'Littérature et imaginaire', discipline: '601 Français (langue et littérature)', ponderation: '3-1-3' }),
        groupe: '00002',
        horaire: Object.freeze({
            nom: 'Mar-Ven',
            seances: Object.freeze([
                Object.freeze({ jour: 'Mardi', debut: '08:00', fin: '10:00', periodes: 2 }),
                Object.freeze({ jour: 'Vendredi', debut: '08:00', fin: '10:00', periodes: 2 })
            ])
        }),
        etudiants: Object.freeze([
            ['9900001', 'Câlin', 'Koala'],
            ['9900002', 'Enjouée', 'Loutre'],
            ['9900003', 'Rieur', 'Lémur'],
            ['9900004', 'Généreuse', 'Hermine'],
            ['9900005', 'Doux', 'Tapir'],
            ['9900006', 'Vaillante', 'Antilope'],
            ['9900007', 'Amical', 'Yack'],
            ['9900008', 'Bienveillante', 'Cigogne'],
            // 13 nov. 2026 (Grégoire) : le deuxième groupe de la démo, celui qui traversera tous les modèles, passe à dix.
            ['9900009', 'Attentionné', 'Caribou'],
            ['9900010', 'Souriante', 'Toucan']
        ]),
        presences: Object.freeze({ absents: Object.freeze(['9900007', '9900009']), retard: '9900008', periodesDuRetard: 1 })
    });

    function listeFournie() {
        return MATERIEL.etudiants.map(function (e) { return [e[0], MATERIEL.groupe, e[1], e[2]].join('\t'); }).join('\n');
    }

    // ---------- « Remplir » : ce qui écrit dans les champs de la page ----------

    /** Écrit une valeur dans un champ de la page, comme si on l'y avait tapée : ses écouteurs suivent. */
    function poser(champ, valeur) {
        if (!champ) return false;
        champ.value = valeur;
        // Ce que « Remplir » pose s'affiche en bleu jusqu'à l'étape suivante (Grégoire, 20 nov. 2026) : le moteur
        // retire la marque (`parcours-rempli`, css/parcours.css) quand l'étape change ou que le parcours se ferme.
        if (champ.classList) champ.classList.add('parcours-rempli');
        champ.dispatchEvent(new Event('input', { bubbles: true }));
        champ.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    /** La valeur de la première option offerte dont le libellé contient `texte` (rien : null). */
    function optionDont(select, texte) {
        if (!select) return null;
        var o = [].find.call(select.options || [], function (x) { return !x.disabled && x.value && x.textContent.indexOf(texte) !== -1; });
        return o ? o.value : null;
    }

    function choisir(select, texte) {
        var v = optionDont(select, texte);
        return v !== null && poser(select, v);
    }

    /**
     * « Remplir » : les gestes d'une étape, faits pour la personne. N'ÉCRIT QUE DANS LA DÉMO : hors de
     * la démo (elle a pu se refermer sous la bulle), rien n'est touché. Commun aux modèles.
     * @returns {boolean} true si les gestes ont été faits
     */
    function remplir(gestes) {
        if (!enDemo()) return false;
        gestes();
        return true;
    }

    /** La dernière ligne d'une fin à plusieurs suites : « Touche « A », « B », ou « C » » (elle suit les boutons présents). */
    function consigneDesSuites(boutons) {
        var noms = boutons.map(function (b) { return '« ' + b.libelle + ' »'; });
        if (noms.length < 2) return 'Touche ' + noms.join('');
        return 'Touche ' + noms.slice(0, -1).join(', ') + ', ou ' + noms[noms.length - 1];
    }

    /**
     * Une bulle en trois temps (la règle du 14 nov. 2026 ; les mots du 16). Avant : la seule consigne « Regarde
     * l'exemple se remplir : touche « Remplir » », et son bouton, dans la bulle. Après, la SECONDE FORME (18 nov. 2026,
     * essai de Grégoire sur l'iPad) : ce qui précédait disparaît (`secondeForme`, lu par le moteur) ; les lignes de
     * `apres()`, qui expliquent ce qui vient d'apparaître, puis la consigne de la page (`creer`).
     * `avantTout` : des notes, ou des lignes d'explication, gardées en tête dans les deux temps. `dAbord()` : les lignes d'un geste de la PAGE qui vient avant tout (ouvrir le
     * formulaire : « Touche « + Nouvelle production » ») ; tant qu'elle en rend, la bulle ne dit que cela, sans bouton.
     * `ensuite()` : de même, pour ce qui suit le bouton de la page (la cartouche créée, à choisir dans la production).
     * @param {Object} o - { rempli: () => bool, gestes: () => void, apres: () => ligne[], creer: string,
     *                       avantTout?: ligne[], dAbord?: () => ligne[]|null, ensuite?: () => ligne[]|null }
     */
    function troisTemps(o) {
        var tete = o.avantTout || [];
        var horsDesTroisTemps = function () {
            return (o.ensuite && o.ensuite()) || (o.dAbord && o.dAbord()) || null;
        };
        // Les deux états de la bulle, « avant » puis « après » : ce que disent ses lignes, sans rien lire de la page.
        var etats = function () {
            return {
                avant: tete.concat([consigne(MOTS_MODELE.toucheRemplir)]),
                apres: o.apres().concat([consigne(o.creer)])
            };
        };
        return {
            lignesVivantes: true,
            etats: etats,
            secondeForme: function () { return !horsDesTroisTemps() && o.rempli(); },
            lignes: function () {
                var autres = horsDesTroisTemps();
                if (autres) return autres;
                return o.rempli() ? etats().apres : etats().avant;
            },
            get boutons() {
                if (horsDesTroisTemps() || o.rempli()) return null;
                return [{ libelle: MOTS_MODELE.remplir, primaire: true, action: function () { remplir(o.gestes); } }];
            }
        };
    }

    /** Une étape : ses trois temps, puis ce qu'elle désigne. */
    function etapeEnTroisTemps(base, o) {
        var e = troisTemps(o);
        Object.keys(base).forEach(function (k) { Object.defineProperty(e, k, Object.getOwnPropertyDescriptor(base, k)); });
        return e;
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
    /**
     * Ouvre ou referme un bloc du Cadre SANS LE RETENIR. `toggleAccordeonV2` écrit l'état de tous les blocs dans
     * `etatsAccordeonsV2`, une préférence de la personne, hors de la démo : le modèle n'y touche pas (mesuré le
     * 16 nov. 2026 au banc du confinement : refermer les autres blocs par la bascule de la page récrivait cette clé).
     * Seul l'écran change ; au prochain chargement, les blocs reviennent comme la personne les avait laissés.
     */
    function plier(acc, fermer) {
        acc.classList.toggle('ferme', fermer);
        var contenu = acc.querySelector('.accordeon-contenu');
        if (contenu && !fermer) { contenu.style.display = ''; contenu.style.maxHeight = ''; contenu.style.opacity = ''; }
        var chevron = acc.querySelector('.accordeon-chevron');
        if (chevron) chevron.textContent = fermer ? '\u25B6' : '\u25BC';
    }

    async function ouvrirBlocModele(idEtape, faite) {
        aller('calendrier', 'trimestre');
        await attendre(function () { return sousSectionVisible('calendrier-trimestre'); }, 2000);
        var acc = accordeon(idEtape);
        if (!acc) return;
        // LA BONNE SECTION, ET ELLE SEULE (Grégoire, 15 nov. 2026 : la bulle « Une liste d'étudiant·es » s'est posée
        // sur le formulaire du cours, resté ouvert en « Mode modification ») : les autres blocs du Cadre se referment.
        // Rien ne s'y perd : un bloc refermé garde ce qu'on y a saisi. Le moteur fait ensuite défiler jusqu'au bloc.
        ETAPES_DU_CADRE.forEach(function (autre) {
            var a = accordeon(autre);
            if (a && a !== acc && !a.classList.contains('ferme')) plier(a, true);
        });
        if (acc.classList.contains('ferme')) plier(acc, false);
        var bouton = BOUTON_CREER[idEtape] ? el(BOUTON_CREER[idEtape]) : null;
        var nouveau = NOUVEAU[idEtape] ? window[NOUVEAU[idEtape]] : null;
        if (bouton && !M().visible(bouton) && !faite() && typeof nouveau === 'function') await nouveau();
        await attendre(pageImmobile(acc), 2000);
    }

    function vaut(id, valeur) {
        var c = el(id);
        return !!c && String(c.value) === String(valeur);
    }

    function coursRempli() {
        return vaut('v2-codeCours', MATERIEL.cours.code) && vaut('v2-ponderation', MATERIEL.cours.ponderation);
    }

    // ---------- La liste ----------

    function champListe() { return el('v2-donneesCollees'); }

    function menuRattachement() { return el('v2-importCoursCible'); }

    function boutonPrevisualiser() {
        var acc = accordeon('etudiants');
        return acc ? acc.querySelector('[data-action="previsualiserDonneesV2"]') : null;
    }

    /** L'aperçu de l'import est à l'écran (« Prévisualiser » touché, la liste dans le champ). */
    function apercuOuvert() {
        return M().visible(el('v2-btnConfirmerImport'));
    }

    function listeRemplie() {
        var c = champListe();
        return !!c && c.value.indexOf(MATERIEL.etudiants[0][0]) !== -1;
    }

    function rattachementFait() {
        var menu = menuRattachement(), cours = coursCree();
        return !!(menu && cours && menu.value === cours.id);
    }

    // ---------- L'horaire, le groupe-cours ----------

    function champSeance(k, quoi) { return el('v2-hor-seance-' + k + '-' + quoi); }

    function horaireRempli() {
        return vaut('v2-hor-nom', MATERIEL.horaire.nom) && MATERIEL.horaire.seances.every(function (se, k) {
            return vaut('v2-hor-seance-' + k + '-jour', se.jour) && vaut('v2-hor-seance-' + k + '-debut', se.debut)
                && vaut('v2-hor-seance-' + k + '-fin', se.fin) && vaut('v2-hor-seance-' + k + '-periodes', se.periodes);
        });
    }

    function remplirLHoraire() {
        choisir(el('v2-hor-groupeAssocie'), MATERIEL.groupe);
        poser(el('v2-hor-nom'), MATERIEL.horaire.nom);
        // Le nombre de séances d'abord : la page redessine alors ses rangées.
        poser(el('v2-hor-nbSeances'), String(MATERIEL.horaire.seances.length));
        MATERIEL.horaire.seances.forEach(function (se, k) {
            poser(champSeance(k, 'jour'), se.jour);
            poser(champSeance(k, 'debut'), se.debut);
            poser(champSeance(k, 'fin'), se.fin);
            // Le nombre de périodes s'écrit d'après les heures (essai novice, lot 1c) : il n'est posé que s'il manque.
            if (!vaut('v2-hor-seance-' + k + '-periodes', se.periodes)) poser(champSeance(k, 'periodes'), String(se.periodes));
        });
    }

    var CHAMPS_GC = ['v2-gc-cours', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-enseignant'];
    var ENSEIGNANT_DEMO = 'Primo Primavera';

    function groupeCoursRempli() {
        var cours = el('v2-gc-cours');
        var choisi = cours && cours.selectedOptions && cours.selectedOptions[0] ? cours.selectedOptions[0].textContent : '';
        return choisi.indexOf(MATERIEL.cours.code) !== -1 && CHAMPS_GC.every(rempli);
    }

    function remplirLeGroupeCours() {
        // Le trimestre de la démo, s'il n'est pas déjà choisi : le premier offert (la démo n'en a qu'un).
        var trimestre = el('v2-gc-trimestre');
        if (trimestre && !trimestre.value) {
            var premier = [].find.call(trimestre.options, function (o) { return o.value && !o.disabled; });
            if (premier) poser(trimestre, premier.value);
        }
        choisir(el('v2-gc-cours'), MATERIEL.cours.code);
        choisir(el('v2-gc-groupe'), MATERIEL.groupe);
        choisir(el('v2-gc-horaire'), MATERIEL.horaire.nom);
        choisir(el('v2-gc-enseignant'), 'Primavera');
    }

    // ---------- La saisie des présences du deuxième groupe ----------

    /** La première séance du groupe-cours actif, au calendrier de la démo (lue dans le cache des séances). */
    function premiereSeance() {
        var seances = seancesDuGroupe();
        return Object.keys(seances).filter(function (d) { return Array.isArray(seances[d]) && seances[d].length > 0; }).sort()[0] || null;
    }

    function casePresence(da) { return el('periodes_' + da); }

    /** Les trois présences de l'exemple : [DA, périodes présentes]. */
    function presencesDeLExemple() {
        var p = MATERIEL.presences;
        return p.absents.map(function (da) { return [da, 0]; }).concat([[p.retard, p.periodesDuRetard]]);
    }

    function presencesRemplies() {
        var date = premiereSeance();
        return !!date && vaut('date-cours', date) && presencesDeLExemple().every(function (x) {
            var c = casePresence(x[0]);
            return !!c && Number(c.value) === x[1];
        });
    }

    /**
     * La première séance du groupe, posée à l'ouverture de l'étape (Grégoire, essai du 18 nov. 2026 sur l'iPad) : avant
     * « Remplir », la saisie montrait une date hors de l'horaire du groupe, « 0 pér. », et chaque ligne « 0 /0 » en rouge,
     * qui se lit « tout le monde absent », alors que la bulle dit « tout le monde est présent par défaut ».
     * @returns {Promise<string|null>} la date posée
     */
    async function choisirLaPremiereSeance() {
        var date = premiereSeance();
        if (!date || !enDemo()) return null;
        if (!vaut('date-cours', date)) poser(champDate(), date);
        await attendre(function () {
            var c = casePresence(MATERIEL.presences.retard);
            return !!c && c.getAttribute('data-date-str') === date && !c.disabled;
        }, 2000);
        return date;
    }

    /** La séance est déjà choisie (l'ouverture de l'étape) ; « Remplir » ne note que les deux absences et le retard. */
    async function remplirLesPresences() {
        var date = await choisirLaPremiereSeance();
        if (!date || !enDemo()) return;
        presencesDeLExemple().forEach(function (x) { poser(casePresence(x[0]), String(x[1])); });
        amenerLesCasesDeLExemple();
    }

    /**
     * La page s'est ouverte en haut (où suis-je) : la saisie est plus bas. Ce qui vient d'apparaître est amené à
     * l'écran, une fois : les trois cases, autour de celle du milieu, si l'une d'elles n'y est pas en entier.
     */
    function amenerLesCasesDeLExemple() {
        var cases = casesDeLExemple();
        if (cases.length < 2) return;
        var entete = document.querySelector('header.entete');
        var haut = entete ? Math.max(0, entete.getBoundingClientRect().bottom) : 0;
        var dehors = cases.some(function (c) { var r = c.getBoundingClientRect(); return r.top < haut || r.bottom > window.innerHeight; });
        if (dehors) cases[1].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    }

    function casesDeLExemple() {
        return presencesDeLExemple().map(function (x) { var c = casePresence(x[0]); return c ? c.closest('td') : null; }).filter(Boolean);
    }

    /** Les trois points à l'écart, sur la bande d'assiduité (Grégoire, 14 nov. 2026, 10 h 53). */
    function pointsALEcart() {
        var b = blocAssiduite();
        if (!b) return [];
        return presencesDeLExemple().map(function (x) { return b.querySelector('.barre-etudiant[data-da="' + x[0] + '"]'); }).filter(Boolean);
    }

    /**
     * Le deuxième groupe de la démo, celui que monte cette modélisation et que traversent les autres modèles : son
     * groupe-cours, s'il a ses étudiant·es. Lu dans les clés de la démo, qu'elle soit ouverte ou non (le panneau le
     * demande avant d'y entrer).
     */
    function deuxiemeGroupe() {
        if (typeof db === 'undefined') return null;
        var liste = function (nom) { var v = db.getSync('demo_' + nom, []); return Array.isArray(v) ? v : []; };
        var g = liste('groupesCours').find(function (x) { return x && x.id && x.id !== 'GC_DEMO'; });
        var n = liste('groupeEtudiants').filter(function (e) { return e && e.da && String(e.da).indexOf('DEMO') !== 0; }).length;
        return g && n ? g : null;
    }

    // ---------- Les huit étapes de « Je regarde » ----------
    // TEXTES DU 16 NOV. 2026, réécrits avec Grégoire (8 h 47 à 9 h 46 ; relais de Cowork :
    // plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md), mot pour mot : la sentinelle
    // tests/unit/sentinelle-parcours-je-regarde-2026-11-16.test.js les confronte à la consigne. Ils remplacent les
    // textes proposés le 15 nov. Les valeurs de l'exemple que les lignes ne nomment plus (le code du cours, le numéro
    // de groupe, la date de la séance) : la flèche les montre. Les noms du menu et des sections sont LUS à l'écran
    // par le moteur (`lieu`, `nommeLaSection`), jamais recopiés ici.

    var MOTS_MODELE = {
        // Grégoire, 16 nov. 2026 : « Remplir » remplace « Remplir avec l'exemple ».
        remplir: 'Remplir',
        toucheRemplir: "Regarde l'exemple se remplir : touche « Remplir »",
        apercuFerme: "L'aperçu est refermé : touche « Prévisualiser » pour le rouvrir.",
        // La fin à trois boutons (Grégoire, 14 nov. 2026, 10 h 58, validé). Depuis le 20 nov. 2026, celui du milieu
        // s'appelle « Voir le parcours N » : son libellé vient du panneau (`Assistance.suiteDe`).
        refaire: 'Le refaire avec ma classe',
        terminer: 'Terminer'
    };

    // L'objectif du parcours : dit par la première bulle (le moteur), rappelé par la dernière. Une seule écriture.
    var EN_MESURE = "d'expliquer ce que l'application te demande pour mettre une classe en place et ce qu'elle en tire";

    /**
     * Le nom du groupe créé, tel que la liste de l'en-tête l'affiche (« 601-999-DM · gr. 00002 ») : lu dans son option ;
     * avant qu'elle soit peuplée, écrit de la même façon avec le matériel de l'exemple.
     */
    function nomDuGroupeCree() {
        var cree = groupeCoursCree(), liste = cree ? el('selectGroupeCoursHeader') : null;
        var option = cree && liste ? [].find.call(liste.options, function (o) { return o.value === cree.id; }) : null;
        var lu = option ? String(option.getAttribute('data-principal') || '').trim() : '';
        return lu || (MATERIEL.cours.code + ' · gr. ' + MATERIEL.groupe);
    }

    /**
     * Les trois suites d'une Modélisation, de même poids (aucune mise en avant) : le même parcours sur les vraies
     * données (« Le refaire avec ma classe » nomme sa destination : il la lance), la suite suggérée quand un parcours
     * suit celui-ci dans le panneau, « Terminer ». Commun aux modèles.
     * LA SUITE NE LANCE RIEN (Grégoire, 20 nov. 2026) : « Voir le parcours N » ferme la bulle et ouvre le panneau
     * « Assistance » devant ce parcours ; avant, « Voir le parcours suivant » lançait son modèle d'office.
     * @param {string} id - le parcours ; @param {Function} terminerLeModele - ferme le modèle et le note fait
     */
    function suitesDuModele(id, terminerLeModele) {
        var suites = [{ libelle: MOTS_MODELE.refaire, action: function () { terminerLeModele(); window.Assistance.lancerParcours(id); } }];
        var suite = window.Assistance.suiteDe(id);
        if (suite) suites.push({ libelle: suite.libelle, action: function () { terminerLeModele(); suite.voir(); } });
        suites.push({ libelle: MOTS_MODELE.terminer, action: function () { terminerLeModele(); } });
        return suites;
    }

    /**
     * Le bloc des quatre menus qu'assemble le groupe-cours de l'exemple (le cours, le groupe, l'horaire,
     * l'enseignant·e) : le plus petit élément de la page qui les contient tous. Une seule cible, une seule flèche.
     */
    function menusDuGroupeCours() {
        var menus = ['v2-gc-cours', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-enseignant'].map(el).filter(Boolean);
        if (menus.length < 2) return menus;
        var bloc = menus[0].parentElement;
        while (bloc && !menus.every(function (m) { return bloc.contains(m); })) bloc = bloc.parentElement;
        return bloc ? [bloc] : menus;
    }

    /** La section du Cadre dont parle l'étape : le moteur y fait défiler la page et encadre son nom. */
    function sectionDuCadre(idEtape) {
        return function () { return accordeon(idEtape); };
    }

    var ETAPES_MODELE = [
        etapeEnTroisTemps({
            titre: 'Un cours',
            lieu: true,
            section: sectionDuCadre('cours'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu dis quel cours tu donnes.",
            avant: function () { return ouvrirBlocModele('cours', FAIT_MODELE[0]); },
            contour: function () { return coursRempli() ? el(BOUTON_CREER.cours) : null; },
            atteint: FAIT_MODELE[0]
        }, {
            avantTout: [note("Dans la démo, tu montes un deuxième groupe avec le matériel de l'exemple. Rien ne touche à tes données.")],
            rempli: coursRempli,
            gestes: function () {
                poser(el('v2-codeCours'), MATERIEL.cours.code);
                poser(el('v2-nomCours'), MATERIEL.cours.nom);
                poser(el('v2-disciplineCours'), MATERIEL.cours.discipline);
                poser(el('v2-ponderation'), MATERIEL.cours.ponderation);
            },
            apres: function () {
                return [
                    { texte: "Le code du cours, tel qu'il paraît à ton plan de cours", montre: champs('v2-codeCours') },
                    { texte: "Sa pondération (elle sert à calculer les heures de cours)", montre: champs('v2-ponderation') },
                    { texte: "Sa discipline (elle sert à identifier le matériel que tu partageras)", montre: champs('v2-disciplineCours') }
                ];
            },
            creer: "Touche « Créer le cours »"
        }),
        etapeEnTroisTemps({
            titre: "Une liste d'étudiant·es",
            confirme: "C'est fait : le cours est créé.",
            section: sectionDuCadre('etudiants'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu apportes la liste de ton groupe.",
            avant: function () { return ouvrirBlocModele('etudiants', FAIT_MODELE[1]); },
            contour: function () { return listeRemplie() ? boutonPrevisualiser() : null; },
            atteint: FAIT_MODELE[1]
        }, {
            rempli: listeRemplie,
            gestes: function () { poser(champListe(), listeFournie()); },
            apres: function () {
                return [
                    { texte: "Dix étudiant·es fictif·ves, une ligne par personne", montre: function () { return [champListe()]; } },
                    { texte: "Son DA, le numéro de dossier (il l'identifie partout dans l'application)" },
                    { texte: "Son numéro de groupe (il servira à l'horaire et au groupe-cours)" },
                    { texte: "Son nom et son prénom" },
                    { texte: "Avec ta classe, cette liste viendra du système de gestion scolaire de ton collège" }
                ];
            },
            creer: "Touche « Prévisualiser »"
        }),
        etapeEnTroisTemps({
            titre: 'Le cours de la liste',
            confirme: "C'est fait : l'aperçu est ouvert. Rien n'est encore importé.",
            // La même section que l'étape d'avant : son nom garde le halo, la phrase du lieu n'est pas redite.
            section: sectionDuCadre('etudiants'),
            avant: function () { return ouvrirBlocModele('etudiants', FAIT_MODELE[2]); },
            // L'aperçu refermé (« Annuler ») : la bulle le dit, et montre « Prévisualiser ».
            avis: function () { return apercuOuvert() ? '' : MOTS_MODELE.apercuFerme; },
            contour: function () {
                if (!apercuOuvert()) return boutonPrevisualiser();
                return rattachementFait() ? el('v2-btnConfirmerImport') : null;
            },
            atteint: FAIT_MODELE[2]
        }, {
            avantTout: [
                { texte: "L'aperçu montre les dix personnes telles qu'elles seront importées (c'est le moment de vérifier)", montre: champs('v2-previewTable') },
                // Grégoire, 20 nov. 2026 (essai sur l'iPad) : l'aperçu est plus court que la liste.
                { texte: "Fais défiler l'aperçu pour voir la liste complète" },
                { texte: "Il reste à dire dans quel cours elles sont inscrites" }
            ],
            rempli: rattachementFait,
            gestes: function () { var cours = coursCree(); if (cours) poser(menuRattachement(), cours.id); },
            apres: function () {
                return [
                    { texte: "Leur cours : celui que tu viens de créer", montre: function () { return [menuRattachement()]; } }
                ];
            },
            creer: "Touche « Importer 10 étudiant·es »"
        }),
        etapeEnTroisTemps({
            titre: 'Un horaire',
            confirme: "C'est fait : les dix étudiant·es sont importé·es.",
            section: sectionDuCadre('horaire'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu dis quand ton groupe se rencontre.",
            avant: function () { return ouvrirBlocModele('horaire', FAIT_MODELE[3]); },
            contour: function () { return horaireRempli() ? el(BOUTON_CREER.horaire) : null; },
            atteint: FAIT_MODELE[3]
        }, {
            rempli: horaireRempli,
            gestes: remplirLHoraire,
            apres: function () {
                return [
                    { texte: "Le groupe (l'horaire lui est lié)", montre: champs('v2-hor-groupeAssocie') },
                    { texte: "Le nom de l'horaire : « " + MATERIEL.horaire.nom + " »", montre: champs('v2-hor-nom') },
                    { texte: "Deux séances par semaine : le mardi et le vendredi, de 8 h à 10 h", montre: champs('v2-hor-seance-0-jour', 'v2-hor-seance-1-jour') },
                    { texte: "2 périodes par séance (le nombre s'écrit d'après les heures)", montre: champs('v2-hor-seance-0-periodes', 'v2-hor-seance-1-periodes') },
                    { texte: "Avec les dates du trimestre, cet horaire donne le calendrier de tes séances : c'est là que s'inscriront tes présences" }
                ];
            },
            creer: "Touche « Créer l'horaire »"
        }),
        etapeEnTroisTemps({
            titre: 'Un groupe-cours',
            confirme: "C'est fait : l'horaire est créé.",
            section: sectionDuCadre('groupe-cours'),
            nommeLaSection: true,
            lieuSuite: ": c'est là que tu assembles ce que tu viens de créer.",
            avant: function () { return ouvrirBlocModele('groupe-cours', FAIT_MODELE[4]); },
            contour: function () { return groupeCoursRempli() ? el(BOUTON_CREER['groupe-cours']) : null; },
            atteint: FAIT_MODELE[4]
        }, {
            rempli: groupeCoursRempli,
            gestes: remplirLeGroupeCours,
            apres: function () {
                return [
                    // Grégoire, 20 nov. 2026 (essai sur l'iPad, capture 4) : les explications réécrites ; les quatre
                    // flèches, une par menu, se croisaient au-dessus du formulaire (les menus sont en quinconce sur deux
                    // colonnes). UNE flèche, vers le bloc des quatre menus, que la première ligne annonce ; chaque
                    // ligne nomme ensuite son menu, dans l'ordre où la page les numérote.
                    { texte: "Un groupe-cours, c'est une classe. Celui de l'exemple assemble ce que tu viens de voir se créer :", montre: menusDuGroupeCours },
                    { texte: "Le cours" },
                    { texte: "Le groupe de la liste" },
                    { texte: "L'horaire « " + MATERIEL.horaire.nom + " »" },
                    { texte: "L'enseignant de la démo, " + ENSEIGNANT_DEMO },
                    { texte: "C'est à ce groupe-cours que se rattachera tout ce que l'application gardera : présences, productions, évaluations" }
                ];
            },
            creer: "Touche « Créer le groupe-cours » (il apparaîtra dans l'en-tête de l'application)"
        }),
        {
            // Pas de formulaire : le geste est celui de la personne.
            titre: "D'un groupe à l'autre",
            confirme: "C'est fait : le groupe-cours est créé. La mise en place est terminée.",
            lignes: function () {
                return [
                    { texte: "Ton deuxième groupe est dans l'en-tête de l'application, à côté de celui de la démo" },
                    { texte: "Tout ce que tu verras ensuite, dans « Suivi » ou dans « Évaluation », concerne le groupe choisi ici" },
                    { texte: "Tu donnes plusieurs groupes ? C'est ici que tu passeras de l'un à l'autre" },
                    // Le groupe, nommé tel que la liste de l'en-tête l'affiche (Grégoire, 16 nov. 2026, essai sur l'iPad).
                    consigne("Choisis dans l'en-tête le groupe que tu viens de créer : « " + nomDuGroupeCree() + " »")
                ];
            },
            nommeLeContour: true,
            contour: function () { return el('selectGroupeCoursHeader'); },
            atteint: FAIT_MODELE[5]
        },
        etapeEnTroisTemps({
            titre: 'Prendre les présences',
            confirme: "C'est fait : tu es dans ton deuxième groupe.",
            lieu: true,
            lieuSuite: "Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi.",
            avant: async function () {
                avantPremierCours = false;
                retirerSecondContour();
                aller('suivi', 'saisie');
                await attendre(function () { return sousSectionVisible('suivi-saisie'); }, 2000);
                await attendre(function () { var c = champDate(); return !!(c && c.value); }, 1500);
                // La première séance du groupe, tout le monde présent (18 nov. 2026) : « Remplir » ne note que les exceptions.
                await choisirLaPremiereSeance();
                await attendre(function () { return M().visible(boutonVerrou()); }, 1500);
            },
            // Les noms de la saisie : la bulle les évite, sans flèche (il faut les voir pour lire les présences).
            zones: function () { return colonnePresence().concat(nomsDeLaSaisie()); },
            fleches: function () { return []; },
            contour: function () { return presencesRemplies() ? boutonVerrou() : null; },
            atteint: FAIT_MODELE[6]
        }, {
            rempli: presencesRemplies,
            gestes: function () { remplirLesPresences(); },
            apres: function () {
                return [
                    { texte: "La séance : la première du groupe", montre: function () { return [choixDuCours()]; } },
                    { texte: "Deux absences et un retard sont notés (tout le monde est présent par défaut, tu ne notes que les exceptions)", montre: casesDeLExemple },
                    { texte: "Tu prends déjà les présences ; ici, chaque séance s'ajoute à la mémoire de ta classe" }
                ];
            },
            creer: "Touche « Verrouiller la saisie » (c'est ce qui dit à l'application que cette séance a eu lieu)"
        }),
        {
            // Des explications : rien ne se grise. La fin à trois boutons de même poids.
            titre: "Le groupe d'un coup d'œil",
            confirme: "C'est fait : la séance est verrouillée.",
            lieu: true,
            // La bulle, haute, tient sous la bande plutôt que dessus (voir `amener`, js/parcours-moteur.js).
            amener: true,
            lieuSuite: "Reviens-y avant chaque séance.",
            lignes: function () {
                return [
                    { texte: "Chaque point blanc est un·e des dix étudiant·es ; la bande « Assiduité » le place selon ses présences" },
                    { texte: "Trois points sont à l'écart : les deux absences et le retard de la séance", montre: pointsALEcart },
                    // Grégoire, 20 nov. 2026 (essai sur l'iPad) : la fin de la phrase, réécrite, dans les deux temps.
                    { texte: "Une seule séance et la classe se dessine déjà. Séance après séance, tu verras qui s'éloigne. C'est un premier signe : cette personne a peut-être besoin que tu ailles vers elle, même si elle n'a rien demandé" }
                    // « Objectif atteint : … » et la phrase de la suite : posées par le moteur (`objectifAtteint`, sur la définition).
                ];
            },
            sansSortie: true,
            avant: async function () {
                retirerSecondContour();
                aller('suivi', 'groupe');
                await attendre(blocAssiduite, 2000);
            },
            zones: function () { var b = blocAssiduite(); return [(b && b.querySelector('.barre-indicateur')) || b]; },
            // LA BULLE NE COUVRE PAS CE DONT ELLE PARLE (règle 8, 16 nov. 2026 : sur l'iPad couché, elle couvrait le bout
            // droit de la bande, là où sont les sept personnes présentes) : ni le nom de la bande, ni aucun des dix points.
            aussiEviter: function () {
                var b = blocAssiduite();
                return b ? [b.querySelector('h4')].concat([].slice.call(b.querySelectorAll('.barre-indicateur .barre-etudiant[data-da]'))) : [];
            },
            fleches: function () { return []; },
            get boutons() { return suitesDuModele(ID, terminerModele); }
        }
    ];

    var DEF_MODELE = { id: ID + '-modele', etapes: ETAPES_MODELE, lienSortie: 'Plus tard',
                       objectif: "À la fin de ce parcours, tu seras en mesure " + EN_MESURE + ".",
                       objectifAtteint: "Objectif atteint : tu es en mesure " + EN_MESURE + "." };

    /**
     * La Modélisation part de sa première étape non faite, gestes compris : JAMAIS en visite (Grégoire, 14 nov. 2026,
     * 10 h 56). Faite, elle ne repart que par « Refaire », au panneau, qui remet d'abord la démo à neuf : elle
     * retrouve alors sa première étape à faire.
     */
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
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Terminer ».
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

    // ---------- Le lancement, « Plus tard », la fin ----------

    /**
     * 14 nov. 2026 (essai novice) — vécu par Grégoire : sur le parcours déjà fait, « Refaire » (et « Commencer avec ma
     * classe », à la fin de « Découvrir ») menait droit à la bulle 8 sur 8, puisqu'on partait de la première étape non
     * faite. On ne pouvait ni revoir le parcours, ni le montrer à quelqu'un.
     * · Le parcours FAIT se rejoue depuis sa première bulle, EN VISITE (js/parcours-moteur.js) : chaque étape déjà
     *   réglée se montre, rien n'avance tout seul, rien ne s'écrit (l'état « fait » du parcours reste tel quel), et
     *   la bulle offre « Continuer ».
     *   ⚠ « Rien ne s'écrit » vaut pour l'état du parcours. La page sous la bulle est la vraie page : y arriver écrit
     *   ce qu'elle écrit d'elle-même (la séance, le groupe et le tri de la saisie ; un bloc du Cadre qu'on ouvre), et
     *   un bouton touché fait son geste. D'où la règle du moteur : en visite, rien n'est désigné qui écrit (15 nov. 2026).
     * · Le parcours à faire ou en cours part toujours de la première étape non faite ; le compteur « n sur N » ouvre
     *   la liste des étapes, où l'on revoit celles d'avant.
     */
    async function lancer() {
        // « Ta classe » : les vraies données. La démo ouverte se referme d'abord.
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        // Un import en cours empêche la sortie de la démo : rien ne part.
        if (enDemo()) return;
        var refaire = window.Assistance.etatDe(ID).etat === 'fait';
        rejoue = refaire;
        var acquis = premiereNonFaite();
        var depuis = refaire ? 0 : acquis;
        if (!refaire) window.Assistance.definirEtat(ID, 'en-cours', depuis);
        // Ce qui est déjà fait au départ de ce passage : la confirmation ne dira que ce qui s'y fait (`confirmation`).
        faitesAuLancement = ETAPES.slice(0, -1).map(function (e, k) { return etapeFaite(k); });
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
        lancer: lancer,
        // Les deux temps (12 nov. 2026) : la modélisation, dans la démo.
        totalModele: ETAPES_MODELE.length,
        lancerModele: lancerModele
    });

    // Pour la sentinelle des textes, les bancs et les autres modèles : le matériel de l'exemple, les étapes, les outils.
    window.ParcoursClasse = Object.freeze({
        // « Nous faisons » (19 nov. 2026) : les huit étapes, la définition (l'objectif), la variante de la septième.
        etapes: ETAPES,
        definition: DEF,
        lignes7Avant: LIGNES_7_AVANT,
        materiel: MATERIEL,
        etapesModele: ETAPES_MODELE,
        definitionModele: DEF_MODELE,
        deuxiemeGroupe: deuxiemeGroupe,
        mots: MOTS_MODELE,
        // Communs aux modèles : « Remplir » (il n'écrit que dans la démo), les trois temps, la fin.
        remplir: remplir,
        poser: poser,
        choisir: choisir,
        troisTemps: troisTemps,
        suitesDuModele: suitesDuModele,
        consigneDesSuites: consigneDesSuites
    });

})();
