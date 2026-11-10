/* =================================================================
   LE SEPTIÈME PARCOURS, « LIRE TA CLASSE ET INTERVENIR » (9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md.

   Le pendant, sur sa propre classe, de ce que « Découvrir » montre sur la démo : les bandes,
   qui s'écarte, son profil, ce qui l'écarte, ce que l'application en tire, puis, si la personne
   le décide, une intervention notée. Il se joue sur les vraies données et n'écrit rien de
   lui-même : seuls ses gestes écrivent (le choix d'une grille de dépistage, l'intervention créée).

   ⚠ Les neuf bulles et les deux refus du panneau sont ceux que Grégoire a validés le 8 nov.
   (15 h 51 à 16 h 27), posés mot pour mot : tests/unit/sentinelle-parcours-lire-ta-classe-2026-11-09.test.js
   les confronte à la consigne. Les cinq autres refus et la phrase de l'étape 2 (`REFUS_9_NOV`) sont
   ceux que Grégoire a validés le 9 nov. (9 h 37 à 9 h 39), posés mot pour mot : la même sentinelle les exige.

   LES GARDES (lot « Les flèches des parcours », 10 nov. 2026 : le voile du moteur est retiré, toute la
   page se touche). Ce qui restait sous le voile, parce que son toucher casse l'étape, ne répond pas le
   temps de l'étape : les pastilles d'absence et de production de l'étape 3 et les liens des cartes de
   l'étape 4 (ils quittent le profil), le statut de l'étape 8 (il écrirait sur une vraie intervention).
   Une étape les nomme dans sa propriété `gardes` ; un écouteur en capture les neutralise (`garder`,
   le modèle de `garderOuvrir`, js/parcours-donnees.js). À l'étape 6, une intervention déjà enregistrée,
   rouverte depuis l'historique, n'est pas prise pour la fiche neuve attendue.
   ================================================================= */
(function () {
    'use strict';

    var ID = 'lire-ta-classe';
    var M = function () { return window.ParcoursMoteur; };

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
        // L'étape 2, quand la personne choisie n'a aucune donnée (son Accompagnement n'a pas de
        // « + Nouvelle intervention ») : dit pourquoi le parcours ramène aux noms. Une assiduité de 0 %
        // n'en fait plus partie (aucuneDonneeDeSuivi, 9 nov.) : c'est l'assiduité inconnue.
        sansDonnee: "Son profil n'a encore aucune donnée que l'Accompagnement puisse lire : choisis une autre personne."
    };

    // Ce que le parcours retient en chemin : la personne choisie à l'étape 2, la fiche ouverte à
    // l'étape 6. En mémoire seulement : après un rechargement, « Reprendre » repart du choix de la
    // personne (étape 2), sauf aux deux dernières bulles, qui n'en ont pas besoin pour se lire.
    var memoire = { da: null, ficheId: null };

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

    /** La condition d'entrée : null si le parcours peut se lancer, sinon ce que le panneau dit. */
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

    /** Pendant le parcours : ce qui le rend impossible le ferme (il attend dans le panneau). */
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

    function boutonNouvelleIntervention() {
        return [].slice.call(document.querySelectorAll('#profil-contenu-dynamique [data-action="naviguerVersNouvelleIntervention"]'))
            .find(function (b) { return b.textContent.trim().indexOf('+') === 0; }) || null;
    }

    function fiche() {
        var f = memoire.ficheId
            ? document.querySelector('[data-fiche-intervention="' + memoire.ficheId + '"]')
            : document.querySelector('[data-fiche-intervention]');
        return f && M().visible(f) ? f : null;
    }

    function radioStatut(valeur) {
        var f = fiche();
        return f ? f.querySelector('input[name="interventionStatut"][value="' + valeur + '"]') : null;
    }

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
        return m && m.joue(DEF) ? ETAPES[m.etapeCourante()] || null : null;
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

    // ---------- Les neuf étapes ----------

    var ETAPES = [
        {
            titre: "Ta classe d'un coup d'œil",
            texte: "Voici ta classe : c'est ici que tu peux voir, avant chaque cours, qui a besoin de toi. Chaque point est un·e de tes étudiant·es ; sa place sur chaque bande dit où il ou elle en est. L'assiduité vient de tes présences, la complétion des productions remises, la performance de tes évaluations. Les zones de couleur viennent de tes propres seuils. En début de trimestre, l'assiduité parle d'abord : les deux autres bandes se remplissent à mesure que tu reçois et évalues les productions.",
            geste: "Touche « Détails » pour mettre un nom sur chaque point.",
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
            titre: "Qui s'écarte ?",
            texte: "Chaque nom porte maintenant trois pastilles : A, C et P. Une pastille colorée signale une valeur sous tes seuils. Pour ne garder que les personnes qui s'écartent, touche un filtre : « A ou C » pour l'assiduité ou la complétion, « P » pour la performance, « RàI 2-3 » pour celles que le modèle de la Réponse à l'intervention situe au niveau 2 ou 3. Les personnes retenues remontent en tête, les plus éloignées de tes seuils d'abord. Deux filtres touchés ensemble ne gardent que celles qui répondent aux deux. Une pastille signale sans expliquer : le profil rassemble ce que l'application sait de la personne.",
            geste: "Touche le A, le C ou le P de la personne que tu veux regarder : son profil s'ouvre.",
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
            titre: "Ce qui l'écarte",
            texte: "Son profil s'ouvre sur son engagement. Sous Assiduité, chaque absence ou retard porte sa date. Si ta carte d'alignement place une leçon ce jour-là, son titre s'affiche aussi : tu sais quelle matière il ou elle a manquée, et ce qu'il y aurait à reprendre. Sous Complétion, tu vois les productions remises et celles qui manquent. Ces deux signaux arrivent avant la performance : ils te permettent d'agir sans attendre une première note.",
            geste: "Touche « Accompagnement » pour voir ce que l'application en tire.",
            avant: async function () {
                await ouvrirProfil(memoire.da, 'mobilisation');
                await attendre(function () { return carteQuiCommencePar('Complétion'); }, 2000);
            },
            zones: function () { return [carteQuiCommencePar('Assiduité'), carteQuiCommencePar('Complétion')].filter(Boolean); },
            // Les pastilles d'absence et de production ne répondent pas : touchées, elles quittent le profil.
            gardes: function () { return actionsDans([carteQuiCommencePar('Assiduité'), carteQuiCommencePar('Complétion')]); },
            contour: function () { return ongletProfil('accompagnement'); },
            atteint: function () { return ongletActif('accompagnement'); }
        },
        {
            titre: 'De quoi il ou elle a besoin',
            texte: "Ici, l'application passe de ce qu'elle observe à ce qu'elle en tire. La carte « Contexte d'apprentissage » résume son assiduité et sa complétion en une phrase, avec une piste : quand l'une ou l'autre est basse, une rencontre peut aider à comprendre ce qui se passe. La carte de la Réponse à l'intervention le ou la situe à un niveau, d'après ses évaluations et ton seuil minimal de réussite ; la phrase qui suit dit pourquoi. Elle nomme aussi son défi principal : le critère de ta grille où il ou elle bute. Si ses productions ne montrent pas encore de difficulté, le niveau reste au 1 ou « En attente » : c'est alors le contexte qui parle. Ces pistes sont des propositions : c'est toi qui décides.",
            avant: async function () {
                await ouvrirProfil(memoire.da, 'accompagnement');
                await attendre(carteRai, 2000);
            },
            zones: function () { return [carteContexte(), carteRai()].filter(Boolean); },
            // Rien à toucher dans la page : les liens des deux cartes ne répondent pas.
            gardes: function () { return actionsDans([carteContexte(), carteRai()]); },
            boutons: [{
                libelle: 'Continuer',
                primaire: true,
                action: function (m) { m.allerA(grilleDeDepistageManque() ? 4 : 5); }
            }]
        },
        {
            titre: 'Ta grille de dépistage',
            texte: "Son profil ne nomme aucun défi : l'application ne sait pas encore à quels critères comparer ses résultats. Il lui faut ta grille de dépistage. Choisis celle dont les critères reviennent le plus souvent dans tes évaluations. L'application reconnaît un critère à son nom : dans tes autres grilles, elle ne retient que les critères qui portent le même nom qu'un critère de celle-ci. Touche « Régler les outils d'observation », puis choisis ta grille dans « Grille de critères pour le dépistage ». Tu reviendras ensuite à son profil.",
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
            atteint: function () { return !grilleDeDepistageManque(); }
        },
        {
            titre: "Ouvrir l'intervention",
            texte: "Tu as lu ce qui l'écarte et ce dont il ou elle a peut-être besoin. Reste à décider quoi faire, et si tu veux le noter : noter tes interventions n'est pas une tâche de plus, c'est facultatif, et tu peux utiliser l'application sans le faire. Une intervention notée ici t'aide de deux façons : elle garde la trace de ce que tu as fait, et elle fige un « avant » de ses résultats par critère, pour que tu puisses voir ensuite s'ils ont bougé. L'historique, sous les cartes, rassemblera ses interventions.",
            geste: "Touche « + Nouvelle intervention » : une fiche s'ouvre, son nom coché d'avance.",
            avant: async function () {
                memoire.ficheId = null;
                await ouvrirProfil(memoire.da, 'accompagnement');
                await attendre(boutonNouvelleIntervention, 2000);
            },
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
            titre: 'Ton intervention',
            texte: "Ta fiche est ouverte, son nom coché. Donne-lui un titre et une date. Choisis le niveau : le 2, en petit groupe ciblé, ou le 3, en individuel ; l'application propose le 3 quand son profil l'y situe, sinon le 2. Au niveau 2, tu peux cocher d'autres étudiant·es qui partagent ce besoin. Les critères ciblés sont cochés d'après leurs défis : garde ceux sur lesquels tu veux agir, ce sont eux que le bilan comparera, avant et après. « Suggérer » propose un objectif à partir du plus faible ; réécris-le à ta façon. Si l'intervention porte plutôt sur ses absences ou ses remises, les critères ne sont pas nécessaires : écris ton objectif toi-même.",
            geste: "Touche « Créer l'intervention ». Ensuite, la fiche s'enregistre d'elle-même à chaque changement.",
            avant: async function () {
                await attendre(fiche, 2000);
            },
            zones: function () { return [fiche()]; },
            contour: function () {
                var f = fiche();
                return f ? f.querySelector('[data-action="sauvegarderPresencesIntervention"]') : null;
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
            titre: "Après l'intervention",
            texte: "Ton intervention est créée, en préparation. Une fois que tu l'auras donnée, rouvre-la, depuis Suivi › Interventions ou depuis son profil : coche les personnes présentes, note tes observations, puis choisis « Complétée ». Une case te propose alors de reporter ces présences dans ta saisie : la présence à l'intervention compensera une absence au cours ; ce report ne se fait qu'une fois. Le bilan apparaît ensuite : pour chaque critère ciblé, la moyenne avant et après des personnes cochées, puis « Objectif atteint ? » et « Suite envisagée ». Il ne compare ni l'assiduité, ni la complétion, ni l'écart avec le reste du groupe. Et une remontée n'est qu'un indice : qui part du plus bas remonte souvent un peu, même sans intervention.",
            avant: async function () {
                if (!fiche() && interventionEnregistree(memoire.ficheId) && typeof window.naviguerVersIntervention === 'function') {
                    window.naviguerVersIntervention(memoire.ficheId);
                }
                await attendre(fiche, 2500);
            },
            // « La fiche, contour sur le statut » : la bulle se pose à côté de lui. Aucun geste n'est attendu
            // ici : le choix du statut ne répond pas (il écrirait sur l'intervention qui vient d'être créée).
            gardes: function () {
                var f = fiche();
                return f ? [].slice.call(f.querySelectorAll('input[name="interventionStatut"]')).map(function (r) { return r.closest('label') || r; }) : [];
            },
            contour: function () {
                var r = radioStatut('completee');
                return r ? r.closest('label') : null;
            },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(8); } }]
        },
        {
            titre: 'Pour aller plus loin',
            texte: "Te voilà avec une première intervention notée. Tu n'as rien de plus à retenir : l'application garde pour toi les signaux, l'historique et l'« avant » de chaque intervention. Si tu veux aller plus loin, à ton rythme : dans son profil, « Confidentiel » range ce qui ne doit pas circuler, comme un diagnostic ou son parcours antérieur ; l'onglet « Rapport » prépare à la demande une synthèse à copier, par exemple pour l'aide pédagogique individuelle, avec les sections que tu choisis ; dans Labo › Observation, tu règles tes seuils d'assiduité et de complétion, ta grille de dépistage et le seuil de défi d'un critère. Avant chaque cours, un coup d'œil à Suivi › Groupe te dira qui a besoin de toi.",
            centre: true,
            sansSortie: true,
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
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

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard' };

    // ---------- Le lancement, la reprise, la fin ----------

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
        var i = etapeDeReprise(depuis);
        menuAmene = false;
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
        lancer: lancer
    });

    // Pour la sentinelle des textes (tests/unit) et le banc : les étapes, les refus, la mémoire.
    window.ParcoursLireTaClasse = { etapes: ETAPES, refus: REFUS, refus9nov: REFUS_9_NOV, lireLeGroupe: lireLeGroupe, memoire: memoire };
})();
