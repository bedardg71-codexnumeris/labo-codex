/* =================================================================
   LE NEUVIÈME PARCOURS, « SUIVRE TON GROUPE PAR CIBLES » (23 nov. 2026)
   plans de travail/CONSIGNE-2026-11-22-parcours-9-je-regarde.md (mandat de Grégoire, 22 nov. 2026).

   Il remplace « Mettre en place ta notation alternative » (js/parcours-notation-alternative.js, retiré avec ses essais).
   Pour la pratique « Par standards » : des cibles et leurs critères, une observation en classe, deux niveaux inscrits sur
   deux textes, le meilleur retenu, puis la note qui en découle.

   UN SEUL TEMPS, « JE REGARDE » (décision de Grégoire, 22 nov. 2026, 20 h 32 : le « Nous faisons » viendra après l'essai
   des testeurs). La définition n'a pas de `lancer` : sa carte, au panneau, ne porte que « Je regarde » (js/assistance.js,
   `seulementModele`), et sa dernière bulle n'offre pas « Le refaire avec ma classe ».

   ⚠ LES TEXTES (`TEXTES`, plus bas, et rien ailleurs) sont ceux que Grégoire a validés le 22 nov. 2026, mot pour mot :
   tests/unit/sentinelle-parcours-cibles-2026-11-23.test.js les confronte, dans les deux sens, à la consigne. Le moule
   est celui des autres parcours (le septième fait foi) : l'entrée « Parcours 9 · … · Je regarde », l'objectif,
   l'objectif atteint, « Pour revoir une étape… », la phrase de la suite et la suite suggérée sont posés par le moteur.

   DOUZE BULLES, dans la démo, sur le TROISIÈME groupe (601-998-DM, gr. 00003, pratique « Par standards (démo) »,
   Marmotte Pétillante). Une démo déjà ouverte à qui ce groupe manque le reçoit avant la première bulle
   (`verserGroupeParStandardsSiAbsent`, js/demo-namespace.js). Chaque étape remet la démo sur ce groupe (`avant`).

   CE QUE « REMPLIR » POSE : l'histoire de Marmotte Pétillante, du pack (`PACK_DEMARRAGE.groupeParStandards.histoire`),
   dans les champs de l'écran ; c'est la personne qui inscrit, par les boutons de l'application.
   · (a), l'observation : la cible et le groupe choisis (bulle 4), puis les critères et le texte (bulle 5). L'écran
     d'observation prend d'ordinaire la date du jour : « Remplir » lui donne la date de l'histoire
     (`ObservationCibles.dater`), une séance du groupe de la démo.
   · (b) puis (c) : dans la fenêtre « Inscrire un niveau », les critères, le niveau, la rétroaction, la production et la
     date (bulles 7 et 8).
   Rien ne s'écrit hors de la démo : « Remplir » ne fait rien hors d'elle (`ParcoursClasse.remplir`), et le moteur met
   le parcours en attente si elle se referme (`verifier`).

   « REFAIRE » (au panneau) ne défait que ce que ce modèle a posé : les inscriptions de Marmotte Pétillante sur « La
   lecture stratégique » (le pack n'en a aucune), et leurs annulations s'il y en a. Les clés écrites doivent être celles
   de la démo. Un passage interrompu REPREND : chaque bulle se règle sur ce qui est déjà inscrit.

   LES GARDES : ce dont le toucher écrirait hors du chemin de l'exemple ne répond pas le temps de l'étape (inscrire pour
   la personne suivante à la fin de la bulle 5 ; inscrire ou annuler dans l'historique de la bulle 9).
   ================================================================= */
(function () {
    'use strict';

    var ID = 'cibles';
    var RANG = 9;
    var TITRE = 'Suivre ton groupe par cibles';
    // Validée par Grégoire le 22 nov. 2026 (la consigne) : sous le titre, au panneau.
    var LIGNE = 'Pour la pratique « Par standards ».';
    var SUITE = 'donnees';   // « Suite suggérée : le parcours 6, « Mettre tes données à l'abri ». »

    var M = function () { return window.ParcoursMoteur; };
    var K = function () { return window.ParcoursClasse; };

    // Le matériel : des identités du pack (js/pack-demo-10.js, bloc `groupeParStandards`). Les mots viennent du pack.
    var MATERIEL = Object.freeze({
        groupeCours: 'GC_DEMO_STD',
        pratique: 'demo-cib-litt',
        ensemble: 'ENSC_DEMO_STD',
        cible: 'demo-cible-ls',
        da: '9700001',
        nom: 'Marmotte Pétillante'
    });

    // =================================================================
    // LES TEXTES — VALIDÉS PAR GRÉGOIRE LE 22 NOV. 2026, MOT POUR MOT (la consigne)
    // Une bulle : `titre` ; `confirme` (la ligne en petit au-dessus du titre, « C'est fait : … ») ; `lieu` (la phrase
    // du lieu, écrite ici : `lieuDit` du moteur) ; `lignes` : ['n', explication], ['c', le geste (→)], ['gris', en
    // petit, gris] ; `puis` : les formes que la bulle prend ensuite, quand le geste est fait (les crochets de la consigne).
    // Devant « % », l'espace insécable (\u00a0) : la règle des nombres à la française du projet (#1137). Aucun mot ne change ;
    // la sentinelle des textes compare après l'avoir ramenée à une espace.
    // =================================================================

    var OBJECTIF = "À la fin de ce parcours, tu seras en mesure de décrire comment suivre ton groupe par cibles : nommer tes cibles, inscrire ce que tu observes et le niveau atteint, puis lire la note qui en découle.";
    // La consigne écrit « ─── Objectif atteint ─── » : la phrase suit la règle des autres parcours (l'objectif, repris).
    var OBJECTIF_ATTEINT = "Objectif atteint : tu es en mesure de décrire comment suivre ton groupe par cibles : nommer tes cibles, inscrire ce que tu observes et le niveau atteint, puis lire la note qui en découle.";
    var POIGNEE = 'Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.';

    var TEXTES = [
        {
            titre: 'Les cibles du cours',
            lieu: "Tu es dans « Conception », à « Pratiques de notation », sur la fiche de « Par standards (démo) » : c'est là que vivent les cibles d'un cours.",
            lignes: [
                ['n', "Dans la démo, tu regardes un troisième groupe, celui du cours « Lire et écrire par cibles ». Rien ne touche à tes données."],
                ['n', "Ce cours a cinq cibles, chacune avec son poids : « La lecture stratégique » (25), « La lecture analytique » (30), « Le plan » (10), « La rédaction » (25) et « La révision » (10)."],
                ['c', "Touche « Suivant »"]
            ]
        },
        {
            titre: "Les critères et l'échelle",
            confirme: "C'est fait : tu as vu les cinq cibles du cours et leurs poids.",
            lignes: [
                ['n', "La première cible, « La lecture stratégique », porte quatre critères. Structure, Rigueur et Plausibilité sont marqués « critère essentiel » : sans eux, la cible n'est pas acquise. Nuance ne l'est pas."],
                ['n', "Les niveaux se posent sur l'« Échelle de départ – Par standards », de 0 à 4. Les critères les guident : « 3 – Acquis » quand tous les critères essentiels sont respectés, « 4 – Avancé » quand tous les critères le sont. Le 0, « Données insuffisantes », dit qu'aucun niveau n'est encore inscrit."],
                ['c', "Touche « Suivant »"]
            ]
        },
        {
            titre: 'Observer en classe',
            confirme: "C'est fait : tu as vu les critères de la première cible et l'échelle.",
            lieu: "Tu es dans « Évaluation », au « Tableau de notation » du groupe : une rangée par étudiant·e, une colonne par cible.",
            lignes: [
                ['n', "En classe, pendant un atelier d'annotation sur « Deux-Rives », tu passes voir les étudiant·es. Observer, c'est cocher les critères d'une cible pour une personne, sans poser de niveau."],
                ['c', "Touche « Observer »"]
            ]
        },
        {
            titre: 'Une cible, puis une personne à la fois',
            confirme: "C'est fait : tu as ouvert l'écran d'observation.",
            lignes: [
                ['n', "Tu choisis une seule fois la cible et qui tu observes. Ensuite, tu passes d'un·e étudiant·e à l'autre."],
                ['c', "Regarde l'exemple se remplir : touche « Remplir »"],
                ['gris', POIGNEE]
            ],
            puis: [[
                ['n', "L'exemple a choisi « La lecture stratégique » et tout le groupe."],
                ['c', "Touche « Commencer »"]
            ]]
        },
        {
            titre: 'Ce que tu vois',
            confirme: "C'est fait : la cible et le groupe sont choisis.",
            lignes: [
                ['n', "Le carrousel, en haut, te dit qui tu as déjà vu aujourd'hui. L'exemple s'arrête sur Marmotte Pétillante."],
                ['c', "Touche « Remplir »"]
            ],
            puis: [[
                ['n', "L'exemple a marqué Structure et Rigueur « Respecté », Plausibilité « Non respecté ». Il a laissé Nuance vide : ce critère ne se voyait pas ce jour-là. Il a écrit : « Relève bien les procédés ; son hypothèse ne s'appuie pas encore sur le texte. »"],
                ['c', "Touche « Inscrire et passer au suivant »"]
            ], [
                ['n', "L'écran passe à la personne suivante. En classe, tu continuerais ; ici, on s'arrête là."],
                ['c', "Touche ✕ pour fermer l'écran"]
            ]]
        },
        {
            titre: 'Une case par cible',
            confirme: "C'est fait : ton observation de Marmotte Pétillante est inscrite.",
            lignes: [
                ['n', "Sa case de « La lecture stratégique » porte maintenant ✎ : une remarque, aucun niveau encore. L'observation ne pose pas de niveau."],
                ['n', "Marmotte Pétillante a remis ses stratégies de lecture sur « Deux-Rives ». C'est à partir de cette production qu'un niveau s'inscrit."],
                ['c', "Touche sa case de « La lecture stratégique »"]
            ]
        },
        {
            titre: 'Inscrire un niveau',
            confirme: "C'est fait : tu as ouvert la case de Marmotte Pétillante.",
            lignes: [
                ['n', "La fenêtre « Inscrire un niveau » réunit les critères, le niveau, une rétroaction et la production d'où vient le niveau."],
                ['c', "Regarde l'exemple se remplir : touche « Remplir »"],
                ['gris', POIGNEE]
            ],
            puis: [[
                ['n', "L'exemple a marqué Structure et Rigueur « Respecté », Plausibilité et Nuance « Non respecté ». Un critère essentiel manque : le niveau est « 2 – Ça y est presque »."],
                ['n', "Sa rétroaction : « Tu relèves bien les procédés. Pour la plausibilité, appuie ton hypothèse sur une citation précise du texte. » Le niveau vient de « Stratégies de lecture sur « Deux-Rives » », le 17 septembre 2025."],
                ['c', "Touche « Inscrire le niveau »"]
            ]]
        },
        {
            titre: 'Deux semaines plus tard',
            confirme: "C'est fait : le niveau 2 est inscrit, et la case le montre.",
            lignes: [
                ['n', "Deux semaines plus tard, Marmotte Pétillante reprend la cible sur un second texte, « Marine ». Le nouveau niveau s'inscrit dans la même case, et le premier reste."],
                ['c', "Touche de nouveau sa case"]
            ],
            puis: [[
                ['c', "Touche « Remplir »"]
            ], [
                ['n', "Cette fois, les trois critères essentiels sont respectés ; Nuance ne l'est pas encore. Le niveau est « 3 – Acquis »."],
                ['n', "Sa rétroaction : « Ton hypothèse s'appuie maintenant sur le texte. Pour aller vers « Avancé », nuance-la : tiens compte d'un passage qui la contredit. » Le niveau vient de « Stratégies de lecture sur « Marine » », le 1er octobre 2025."],
                ['c', "Touche « Inscrire le niveau »"]
            ]]
        },
        {
            titre: 'Le niveau retenu',
            confirme: "C'est fait : le niveau 3 est inscrit sur « Marine ».",
            lignes: [
                ['n', "La case de Marmotte Pétillante montre maintenant « 3 – Acquis » : c'est le niveau retenu, le meilleur inscrit. Le petit nombre compte ses inscriptions."],
                ['c', "Touche sa case pour voir son historique"]
            ],
            puis: [[
                ['n', "En haut : « Niveau retenu : 3 · Acquis, inscrit le 1er octobre 2025. » Plus bas, le 2 sur « Deux-Rives » reste dans l'historique. Le niveau retenu ne redescend pas : un niveau plus bas inscrit plus tard ne le remplacerait pas."],
                ['c', "Touche « Fermer »"]
            ]]
        },
        {
            titre: 'La note du cours',
            confirme: "C'est fait : tu as vu le niveau retenu et son historique.",
            lignes: [
                ['n', "Dans la colonne « Note », Marmotte Pétillante avait « En attente » : il manquait un niveau à « La lecture stratégique ». Ses quatre autres cibles en avaient déjà un."],
                ['n', "Maintenant que chaque cible a un niveau retenu, sa note s'affiche : 69\u00a0%. Tant qu'une cible reste sans donnée, l'application ne chiffre pas la note : elle nomme ce qui manque."],
                ['c', "Touche « Suivant »"]
            ]
        },
        {
            titre: "D'où vient la note",
            confirme: "C'est fait : tu as vu la note s'afficher au tableau.",
            lieu: "Tu es au profil de Marmotte Pétillante, à la section « Cibles ».",
            lignes: [
                ['n', "La carte « Note du cours » donne 68,8\u00a0% : le profil garde la décimale que le tableau arrondit."],
                ['n', "Son tableau détaille le calcul : pour chaque cible, le niveau retenu, ce qu'il vaut, son poids et sa part du total. « La rédaction », à « 2 – Ça y est presque », vaut 50\u00a0% ; les quatre autres, à « 3 – Acquis », valent 75\u00a0%."],
                ['c', "Touche « Suivant »"]
            ]
        },
        {
            titre: 'Ton groupe, cible par cible',
            confirme: "C'est fait : tu as vu d'où vient la note de Marmotte Pétillante.",
            lignes: [
                ['n', "Tu as fait tout le chemin : des cibles et leurs critères, une observation en classe, deux niveaux inscrits sur deux textes, le meilleur retenu, puis la note qui en découle."]
            ]
        }
    ];

    // Les boutons des bulles (la consigne) : « Suivant » avance ; « Remplir » est celui des autres modèles.
    var MOT_SUIVANT = 'Suivant';

    // ---------- La démo, le troisième groupe, l'histoire ----------

    function enDemo() { return typeof estEnModeDemo === 'function' && estEnModeDemo(); }
    function deLaDemo(nom) { var v = typeof db !== 'undefined' ? db.getSync('demo_' + nom, []) : []; return Array.isArray(v) ? v : []; }
    function groupeActifId() { var g = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null; return g && g.id ? g.id : null; }
    /** Le groupe actif ET le cours que les pages lisent (`infoCours`) sont ceux du troisième groupe : les deux se suivent. */
    function surLeTroisiemeGroupe() {
        var info = typeof db !== 'undefined' ? db.getSync('infoCours', null) : null;
        return groupeActifId() === MATERIEL.groupeCours && !!info && info._groupeCoursId === MATERIEL.groupeCours;
    }
    function troisiemeGroupeLa() { return deLaDemo('groupesCours').some(function (g) { return g && g.id === MATERIEL.groupeCours; }); }

    /** Les trois saisies de l'histoire, (a), (b), (c), lues dans le pack (chargé avec la démo). */
    function histoire() {
        var pack = window.PACK_DEMARRAGE, bloc = pack && pack.groupeParStandards;
        return bloc && bloc.histoire && Array.isArray(bloc.histoire.inscriptions) ? bloc.histoire.inscriptions : [];
    }

    /** L'inscription de la démo (non annulée) qui porte une saisie de l'histoire : même personne, même cible, même date, même niveau. */
    function inscrite(k) {
        var s = histoire()[k];
        if (!s) return null;
        var liste = deLaDemo('inscriptionsCibles');
        var annulees = {};
        liste.forEach(function (x) { if (x && x.type === 'annulation') annulees[x.inscriptionId] = true; });
        return liste.find(function (x) {
            return x && x.type === 'inscription' && !annulees[x.id] && String(x.da) === String(s.da) && x.cibleId === s.cibleId
                && x.date === s.date && (x.niveau === null ? null : String(x.niveau)) === (s.niveau === null ? null : String(s.niveau))
                && (x.productionId || null) === (s.productionId || null);
        }) || null;
    }

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

    /** La démo ouverte, sur le troisième groupe (idempotent : chaque étape y revient). */
    async function assurerLeGroupe() {
        if (!enDemo()) return false;
        // Le geste du menu de l'en-tête (`changerGroupeCoursActifV2`, trimestre-v2-orchestre.js) : le groupe, son cours, les vues.
        if (!surLeTroisiemeGroupe() && typeof window.changerGroupeCoursActifV2 === 'function') {
            await window.changerGroupeCoursActifV2(MATERIEL.groupeCours);
            await attendre(surLeTroisiemeGroupe, 3000);
        }
        return surLeTroisiemeGroupe();
    }

    // ---------- Les écrans ----------

    function $(sel, dans) { return (dans || document).querySelector(sel); }
    function vis(el) { return el && M().visible(el) ? el : null; }
    function sectionCourante() { return typeof sectionActive !== 'undefined' ? sectionActive : null; }
    function aller(section, sous) { if (typeof naviguerVers === 'function') naviguerVers(section, sous); }

    // La fiche de la pratique (Conception › Pratiques de notation).
    function fiche() { return vis($('#mat-cibles-fiche')); }
    function ciblesDeLaFiche() { var f = fiche(); return f ? [].slice.call(f.querySelectorAll('.cibles-fiche-cible')) : []; }
    function criteresDeLaPremiere() { var c = ciblesDeLaFiche()[0]; return c ? c.querySelector('.cibles-fiche-criteres') : null; }

    async function ouvrirLaFiche() {
        await assurerLeGroupe();
        if (ciblesDeLaFiche().length) return;
        aller('conception', 'pratiques-notation');
        if (typeof chargerPratiquePourModif === 'function') chargerPratiquePourModif(MATERIEL.pratique);
        await attendre(function () { return ciblesDeLaFiche().length > 0; }, 3000);
    }

    // Le tableau des cibles (Évaluation › Tableau de notation).
    function tableau() { return vis($('.tc-tableau')); }
    function boutonObserver() { return vis($('[data-tc="observer"]')); }
    function caseDeMarmotte() { return vis($('.tc-tableau [data-tc="case"][data-da="' + MATERIEL.da + '"][data-cible="' + MATERIEL.cible + '"]')); }
    function noteDeMarmotte() { var c = caseDeMarmotte(), r = c ? c.closest('tr') : null; return r ? r.querySelector('.tc-cellule-note') : null; }

    async function ouvrirLeTableau() {
        await assurerLeGroupe();
        if (tableau() && sectionCourante() === 'evaluations') return;
        aller('evaluations', 'tableau');
        await attendre(tableau, 3000);
    }

    // L'écran d'observation (js/observation-cibles.js).
    function ecran() { return $('.oc-overlay .oc-fenetre'); }
    function ecranAuChoix() { var e = ecran(); return !!e && !!e.querySelector('.oc-tuile'); }
    function blocObservation() { var e = ecran(); return e ? e.querySelector('[data-oc-bloc]') : null; }
    function dansLEcran(sel) { var e = ecran(); return e ? e.querySelector(sel) : null; }
    function tuileDeLaCible() { return dansLEcran('.oc-tuile[data-cible="' + MATERIEL.cible + '"]'); }
    function cibleChoisie() { var t = tuileDeLaCible(); return !!t && t.getAttribute('aria-pressed') === 'true'; }
    function groupeEntierChoisi() { var b = dansLEcran('[data-oc="groupe-entier"]'); return !!b && b.getAttribute('aria-pressed') === 'true'; }
    function nomObserve() { var n = dansLEcran('#oc-nom'); return n ? String(n.textContent || '').trim() : ''; }
    function surMarmotte() { return nomObserve() === MATERIEL.nom; }

    // La date que l'exemple a donnée à l'écran d'observation ouvert (il repart à la date du jour à chaque ouverture).
    var ecranDate = null;
    function ecranALaDateDeLHistoire() { return !!ecran() && ecranDate === ecran(); }
    function daterLEcran() {
        var a = histoire()[0];
        if (!ecran() || !a || !window.ObservationCibles || typeof window.ObservationCibles.dater !== 'function') return false;
        if (window.ObservationCibles.dater(a.date)) ecranDate = ecran();
        return ecranALaDateDeLHistoire();
    }

    /** L'étiquette de la cible de l'exemple, lue dans la démo (« La lecture stratégique »). */
    function etiquetteDeLaCible() {
        var ens = deLaDemo('ensemblesCibles').find(function (e) { return e && e.id === MATERIEL.ensemble; });
        var c = ens && Array.isArray(ens.cibles) ? ens.cibles.find(function (x) { return x && x.id === MATERIEL.cible; }) : null;
        return c ? String(c.etiquette || '') : '';
    }

    // La fenêtre « Inscrire un niveau » (js/tableau-cibles.js) : celle de la case de Marmotte Pétillante.
    function fenetre() {
        var f = $('.tc-overlay:not(.oc-overlay) .tc-fenetre');
        if (!f) return null;
        var qui = f.querySelector('.tc-qui'), cible = f.querySelector('.tc-cible-etiquette'), etiquette = etiquetteDeLaCible();
        var memeCible = !!cible && !!etiquette && String(cible.textContent || '').trim().indexOf(etiquette) === 0;
        return qui && String(qui.textContent || '').trim() === MATERIEL.nom && memeCible ? f : null;
    }
    function blocFenetre() { var f = fenetre(); return f ? f.querySelector('[data-tc-bloc]') : null; }
    function boutonInscrire() { var b = blocFenetre(); return b ? b.querySelector('[data-tc="inscrire"]') : null; }
    function boutonFermerFenetre() { var b = blocFenetre(); return b ? b.querySelector('.modal-actions [data-tc="fermer"]') : null; }
    function historiqueDeLaFenetre() { var f = fenetre(); return f ? f.querySelector('.tc-historique') : null; }

    // ---------- Les critères d'un bloc (l'écran d'observation, la fenêtre) ----------

    /** { [idCritere]: true | false } lu dans un bloc ; un critère sans réponse n'y est pas. */
    function cochesDe(bloc) {
        var r = {};
        if (!bloc) return r;
        [].forEach.call(bloc.querySelectorAll('.tc-critere'), function (li) {
            var presse = li.querySelector('.tc-coche[aria-pressed="true"]');
            if (presse) r[li.dataset.critere] = presse.dataset.valeur === 'oui';
        });
        return r;
    }

    /** Les coches du bloc sont-elles celles de la saisie (`respecte` : true, false, ou null pour « vide ») ? */
    function cochesSont(bloc, saisie) {
        var lues = cochesDe(bloc);
        return !!saisie && (saisie.criteres || []).every(function (c) {
            return c.respecte === null ? !(c.id in lues) : lues[c.id] === c.respecte;
        });
    }

    /** Pose les coches de la saisie, comme au toucher : un toucher sur le bouton voulu ; sur le bouton pressé pour vider. */
    function poserLesCoches(bloc, saisie) {
        (saisie.criteres || []).forEach(function (c) {
            var li = bloc.querySelector('.tc-critere[data-critere="' + c.id + '"]');
            if (!li) return;
            var presse = li.querySelector('.tc-coche[aria-pressed="true"]');
            var voulu = c.respecte === null ? null : li.querySelector('.tc-coche[data-valeur="' + (c.respecte ? 'oui' : 'non') + '"]');
            if (voulu === presse) return;
            (voulu || presse).click();
        });
    }

    function poser(champ, valeur) { return K() && typeof K().poser === 'function' ? K().poser(champ, valeur) : false; }
    function remplir(geste) { return K() && typeof K().remplir === 'function' ? K().remplir(geste) : false; }

    // ---------- « Remplir » ----------

    var GESTES = {
        // Bulle 4 : la cible, tout le groupe, et la date de l'histoire à la place de celle du jour.
        choix: function () {
            daterLEcran();
            var t = tuileDeLaCible();
            if (t && !cibleChoisie()) t.click();
            var g = dansLEcran('[data-oc="groupe-entier"]');
            if (g && !groupeEntierChoisi()) g.click();
        },
        // Bulle 5 : (a), les critères et le texte, pour Marmotte Pétillante.
        observation: function () {
            var a = histoire()[0];
            if (!a) return;
            amenerMarmotte();
            var bloc = blocObservation();
            if (!bloc || !surMarmotte()) return;
            poserLesCoches(bloc, a);
            poser(bloc.querySelector('.oc-note'), a.noteBreve);
        },
        // Bulles 7 et 8 : (b), puis (c), dans la fenêtre, sans inscrire.
        niveau: function (k) {
            var s = histoire()[k], bloc = blocFenetre();
            if (!s || !bloc) return;
            poserLesCoches(bloc, s);
            var radio = bloc.querySelector('.tc-niveaux input[type="radio"][value="' + s.niveau + '"]');
            if (radio && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
            poser(bloc.querySelector('.tc-retroaction'), s.noteBreve);
            poser(bloc.querySelector('.tc-origine'), s.productionId);
            poser(bloc.querySelector('.tc-date'), s.date);
        }
    };

    /** Le carrousel amené sur Marmotte Pétillante (la consigne : « ou le parcours l'y amène »). */
    function amenerMarmotte() {
        if (!blocObservation() && !dansLEcran('.oc-carrousel')) return;
        if (surMarmotte()) return;
        var p = [].find.call(ecran().querySelectorAll('.oc-pastille'), function (b) {
            var n = b.querySelector('.oc-pastille-nom');
            return n && String(n.textContent || '').trim() === MATERIEL.nom;
        });
        if (p) p.click();
    }

    function observationPosee() {
        var a = histoire()[0], bloc = blocObservation();
        if (!a || !bloc || !surMarmotte()) return false;
        var note = bloc.querySelector('.oc-note');
        return cochesSont(bloc, a) && !!note && note.value === a.noteBreve;
    }

    function niveauPose(k) {
        var s = histoire()[k], bloc = blocFenetre();
        if (!s || !bloc) return false;
        var radio = bloc.querySelector('.tc-niveaux input[type="radio"]:checked');
        var r = bloc.querySelector('.tc-retroaction'), o = bloc.querySelector('.tc-origine'), d = bloc.querySelector('.tc-date');
        return cochesSont(bloc, s) && !!radio && radio.value === String(s.niveau) && !!r && r.value === s.noteBreve
            && !!o && o.value === s.productionId && !!d && d.value === s.date;
    }

    // ---------- La bulle au-dessus des fenêtres ----------

    // Une étape qui se joue dans une fenêtre : la bulle, le contour et les flèches passent au-dessus d'elle
    // (css/parcours.css, `parcours-sur-modale`). Retiré quand la bulle revient à la page, et à la fermeture.
    function surModale(oui) { document.body.classList.toggle('parcours-sur-modale', !!oui); }

    // ---------- Les gardes : ce qui ne répond pas le temps d'une étape ----------

    function etapeJouee() {
        var m = M();
        if (!m || !m.joue(DEF_MODELE)) return null;
        return DEF_MODELE.etapes[m.etapeCourante()] || null;
    }

    function garder(ev) {
        var e = etapeJouee();
        if (!e || !e.gardes) return;
        var liste = [];
        try { liste = e.gardes() || []; } catch (x) { liste = []; }
        if (!liste.some(function (el) { return el && (el === ev.target || el.contains(ev.target)); })) return;
        ev.preventDefault();
        ev.stopPropagation();
    }
    // En capture sur window : avant les écouteurs de la fenêtre et de l'écran d'observation.
    window.addEventListener('click', garder, true);

    // ---------- Les lignes d'une bulle ----------

    function lignesDe(defs) {
        return defs.map(function (d) {
            if (d[0] === 'c') return { texte: d[1], geste: true };
            if (d[0] === 'gris') return { texte: d[1], classe: 'parcours-bulle-aide' };
            return { texte: d[1], note: true };
        });
    }

    var debutDuModele = 0;
    function confirmation(k) { return function () { return k > debutDuModele ? TEXTES[k].confirme : ''; }; }
    function suivante() { var i = M().etapeCourante(); if (i !== null) M().allerA(i + 1); }
    function SUIVANT() { return [{ libelle: MOT_SUIVANT, primaire: true, action: suivante }]; }
    function REMPLIR(geste) { return [{ libelle: K().mots.remplir, primaire: true, action: function () { remplir(geste); } }]; }
    /** Revenir à une étape d'avant quand l'écran qu'une bulle suppose s'est refermé sans que son geste soit fait. */
    function revenirA(k) { if (M().etapeCourante() !== k) M().allerA(k); return false; }

    /** Une étape : ses textes (`TEXTES[k]`), puis ce qui la fait avancer. Chaque étape remet la démo sur le troisième groupe. */
    function etape(k, o) {
        var t = TEXTES[k];
        var e = { titre: t.titre, lignesVivantes: true };
        if (t.confirme) e.confirme = confirmation(k);
        if (t.lieu) { e.lieu = true; e.lieuDit = t.lieu; }
        Object.keys(o).forEach(function (c) { Object.defineProperty(e, c, Object.getOwnPropertyDescriptor(o, c)); });
        if (!e.lignes) e.lignes = function () { return lignesDe(t.lignes); };
        if (!e.fleches && e.zones) e.fleches = function () { return ((e.zones && e.zones()) || []).filter(Boolean); };
        return e;
    }

    // La bulle 9 : la fenêtre a été ouverte pendant l'étape (le geste de la bulle est de la refermer).
    var historiqueVu = false;

    function suites() {
        var liste = [];
        var suite = window.Assistance.suiteDe(ID);
        if (suite) liste.push({ libelle: suite.libelle, action: function () { terminerModele(); suite.voir(); } });
        liste.push({ libelle: K().mots.terminer, action: function () { terminerModele(); } });
        return liste;
    }

    var ETAPES_MODELE = [
        // 1 · Les cibles du cours : la fiche de la pratique.
        etape(0, {
            avant: async function () { surModale(false); await ouvrirLaFiche(); },
            zones: function () { return ciblesDeLaFiche(); },
            contour: function () { return null; },
            get boutons() { return SUIVANT(); }
        }),
        // 2 · Les critères et l'échelle : la même fiche, sa première cible.
        etape(1, {
            avant: async function () { surModale(false); await ouvrirLaFiche(); },
            zones: function () { return [criteresDeLaPremiere()]; },
            contour: function () { return null; },
            get boutons() { return SUIVANT(); }
        }),
        // 3 · Observer en classe : le tableau des cibles, son bouton « Observer ».
        etape(2, {
            avant: async function () { surModale(false); if (!ecran()) await ouvrirLeTableau(); },
            zones: function () { return [tableau()]; },
            fleches: function () { return [boutonObserver()]; },
            contour: boutonObserver,
            nommeLeContour: true,
            atteint: function () { return !!ecran(); }
        }),
        // 4 · Une cible, puis une personne à la fois : l'écran d'observation, son choix.
        etape(3, {
            secondeForme: function () { return choixFait(); },
            avant: async function () {
                if (!ecran() && !inscrite(0)) { await ouvrirLeTableau(); var b = boutonObserver(); if (b) b.click(); await attendre(ecran, 2000); }
                surModale(!!ecran());
            },
            lignes: function () { return lignesDe(choixFait() ? TEXTES[3].puis[0] : TEXTES[3].lignes); },
            zones: function () { return [dansLEcran('.oc-tuiles'), dansLEcran('.oc-bascule')]; },
            fleches: function () { return []; },
            contour: function () { return choixFait() ? dansLEcran('[data-oc="commencer"]') : null; },
            get boutons() { return choixFait() || !ecranAuChoix() ? null : REMPLIR(GESTES.choix); },
            atteint: function () {
                if (!ecran()) return inscrite(0) ? true : revenirA(2);
                return !!blocObservation() && cibleObservee();
            }
        }),
        // 5 · Ce que tu vois : le carrousel sur Marmotte Pétillante, (a) posée, inscrite, puis l'écran refermé.
        etape(4, {
            secondeForme: function () { return observationPosee() || !!inscrite(0); },
            avant: async function () {
                if (inscrite(0)) { surModale(!!ecran()); return; }
                if (!ecran()) { await ouvrirLeTableau(); var b = boutonObserver(); if (b) b.click(); await attendre(ecran, 2000); }
                surModale(!!ecran());
                if (ecranAuChoix()) { remplir(GESTES.choix); var c = dansLEcran('[data-oc="commencer"]'); if (c) c.click(); await attendre(blocObservation, 2000); }
                if (!ecranALaDateDeLHistoire()) remplir(daterLEcran);
                amenerMarmotte();
                await attendre(surMarmotte, 2000);
            },
            lignes: function () {
                if (inscrite(0)) return lignesDe(TEXTES[4].puis[1]);
                return lignesDe(observationPosee() ? TEXTES[4].puis[0] : TEXTES[4].lignes);
            },
            zones: function () { return inscrite(0) ? [] : [dansLEcran('.oc-carrousel')]; },
            fleches: function () { return []; },
            contour: function () {
                if (inscrite(0)) return dansLEcran('.modal-fermer');
                return observationPosee() ? dansLEcran('[data-oc="inscrire"]') : null;
            },
            // (a) inscrite, l'écran montre la personne suivante : on s'arrête là, rien ne s'inscrit pour elle.
            gardes: function () { return inscrite(0) ? [dansLEcran('[data-oc="inscrire"]')].filter(Boolean) : []; },
            get boutons() { return inscrite(0) || observationPosee() || !blocObservation() ? null : REMPLIR(GESTES.observation); },
            atteint: function () {
                if (inscrite(0)) return !ecran();
                return ecran() ? false : revenirA(2);
            }
        }),
        // 6 · Une case par cible : le tableau, la case de Marmotte Pétillante (✎).
        etape(5, {
            avant: async function () { if (!fenetre()) { surModale(false); await ouvrirLeTableau(); } },
            zones: function () { return [caseDeMarmotte()]; },
            contour: caseDeMarmotte,
            nommeLeContour: true,
            atteint: function () { return !!fenetre(); }
        }),
        // 7 · Inscrire un niveau : la fenêtre, (b) posée, puis inscrite.
        etape(6, {
            secondeForme: function () { return niveauPose(1); },
            avant: async function () { await ouvrirLaFenetre(1); },
            lignes: function () { return lignesDe(niveauPose(1) ? TEXTES[6].puis[0] : TEXTES[6].lignes); },
            zones: function () { return [blocFenetre()]; },
            fleches: function () { return []; },
            contour: function () { return niveauPose(1) ? boutonInscrire() : null; },
            get boutons() { return niveauPose(1) || !blocFenetre() ? null : REMPLIR(function () { GESTES.niveau(1); }); },
            atteint: function () {
                if (inscrite(1)) return !fenetre();
                return fenetre() ? false : revenirA(5);
            }
        }),
        // 8 · Deux semaines plus tard : la même case, (c) posée, puis inscrite.
        etape(7, {
            secondeForme: function () { return !!fenetre(); },
            avant: async function () { if (!fenetre()) { surModale(false); await ouvrirLeTableau(); } else surModale(true); },
            lignes: function () {
                if (!fenetre()) return lignesDe(TEXTES[7].lignes);
                return lignesDe(niveauPose(2) ? TEXTES[7].puis[1] : TEXTES[7].puis[0]);
            },
            zones: function () { return fenetre() ? [blocFenetre()] : [caseDeMarmotte()]; },
            fleches: function () { return fenetre() ? [] : [caseDeMarmotte()]; },
            contour: function () {
                if (!fenetre()) return caseDeMarmotte();
                return niveauPose(2) ? boutonInscrire() : null;
            },
            get boutons() { return fenetre() && !niveauPose(2) ? REMPLIR(function () { GESTES.niveau(2); }) : null; },
            atteint: function () {
                surModale(!!fenetre());
                return !!inscrite(2) && !fenetre();
            }
        }),
        // 9 · Le niveau retenu : la case, puis son historique dans la fenêtre, puis « Fermer ».
        etape(8, {
            secondeForme: function () { return !!fenetre(); },
            avant: async function () { historiqueVu = false; if (!fenetre()) { surModale(false); await ouvrirLeTableau(); } },
            lignes: function () { return lignesDe(fenetre() ? TEXTES[8].puis[0] : TEXTES[8].lignes); },
            zones: function () { return fenetre() ? [$('.tc-retenu', historiqueDeLaFenetre() || document)] : [caseDeMarmotte()]; },
            contour: function () { return fenetre() ? boutonFermerFenetre() : caseDeMarmotte(); },
            // On lit l'historique : rien ne s'y inscrit, rien ne s'y annule.
            gardes: function () {
                var f = fenetre();
                return f ? [].slice.call(f.querySelectorAll('[data-tc="inscrire"], [data-tc="annuler"]')) : [];
            },
            atteint: function () {
                var f = fenetre();
                surModale(!!f);
                if (f && !historiqueVu) {
                    historiqueVu = true;
                    var h = historiqueDeLaFenetre();
                    if (h && typeof h.scrollIntoView === 'function') h.scrollIntoView({ block: 'start' });
                }
                return historiqueVu && !f;
            }
        }),
        // 10 · La note du cours : la colonne « Note », au bout de sa rangée.
        etape(9, {
            avant: async function () { surModale(false); await ouvrirLeTableau(); },
            zones: function () { return [noteDeMarmotte()]; },
            contour: function () { return null; },
            get boutons() { return SUIVANT(); }
        }),
        // 11 · D'où vient la note : son profil, section « Cibles ».
        etape(10, {
            avant: async function () { surModale(false); await ouvrirLeProfil(); },
            zones: function () { return [vis($('.pc-note'))]; },
            contour: function () { return null; },
            get boutons() { return SUIVANT(); }
        }),
        // 12 · La fin : la suite suggérée, « Terminer ».
        {
            titre: TEXTES[11].titre,
            confirme: confirmation(11),
            lignesVivantes: true,
            lignes: function () { return lignesDe(TEXTES[11].lignes).concat([{ texte: K().consigneDesSuites(suites()), geste: true }]); },
            centre: true,
            sansSortie: true,
            avant: async function () { surModale(false); },
            get boutons() { return suites(); }
        }
    ];

    function choixFait() { return ecranAuChoix() && cibleChoisie() && groupeEntierChoisi() && ecranALaDateDeLHistoire(); }
    // L'écran défile : la cible affichée est celle de l'exemple.
    function cibleObservee() {
        var c = dansLEcran('.oc-cible'), etiquette = etiquetteDeLaCible();
        return !!c && !!etiquette && String(c.textContent || '').trim() === etiquette;
    }

    /** La fenêtre de la case de Marmotte Pétillante, ouverte (à la reprise d'une étape qui s'y joue). */
    async function ouvrirLaFenetre(k) {
        if (!fenetre() && !inscrite(k)) {
            surModale(false);
            await ouvrirLeTableau();
            var c = caseDeMarmotte();
            if (c) c.click();
            await attendre(fenetre, 2000);
        }
        surModale(!!fenetre());
    }

    /** Le profil de Marmotte Pétillante (Suivi), à la section « Cibles » : la carte « Note du cours » y est visible. */
    function ongletCibles() { return $('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="cibles"]'); }
    function profilAuxCibles() {
        var o = ongletCibles();
        return String(window.profilActuelDA || '') === MATERIEL.da && !!o && o.getAttribute('aria-current') === 'true' && !!vis($('.pc-panneau .pc-note'));
    }
    async function ouvrirLeProfil() {
        await assurerLeGroupe();
        if (profilAuxCibles()) return;
        if (sectionCourante() !== 'suivi') aller('suivi', 'groupe');
        if (typeof afficherProfilComplet === 'function') afficherProfilComplet(MATERIEL.da);
        await attendre(function () { return String(window.profilActuelDA || '') === MATERIEL.da && !!ongletCibles(); }, 3000);
        if (!profilAuxCibles() && typeof changerSectionProfil === 'function') changerSectionProfil('cibles');
        await attendre(profilAuxCibles, 3000);
    }

    var DEF_MODELE = { id: ID + '-modele', etapes: ETAPES_MODELE, lienSortie: 'Plus tard', objectif: OBJECTIF, objectifAtteint: OBJECTIF_ATTEINT };

    // ---------- « Refaire », le lancement, la fin ----------

    /**
     * « Refaire » (au panneau) : ce que CE modèle a écrit dans la démo — les inscriptions de Marmotte Pétillante sur « La
     * lecture stratégique » (le pack n'en a aucune pour elle sur cette cible), et les annulations qui les désignent. Les
     * clés écrites doivent être celles de la démo. Le reste (les neuf autres, ses quatre autres cibles) reste.
     */
    async function defaireModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo() || typeof cle !== 'function') return false;
        var cleI = cle('inscriptionsCibles');
        if (cleI.indexOf('demo_') !== 0) return false;
        fermerLesEcrans();
        var liste = db.getSync(cleI, []) || [];
        var siennes = {};
        liste.forEach(function (x) {
            if (x && x.type === 'inscription' && String(x.da) === MATERIEL.da && x.cibleId === MATERIEL.cible) siennes[x.id] = true;
        });
        if (!Object.keys(siennes).length) return true;
        db.setSync(cleI, liste.filter(function (x) { return !x || !(siennes[x.id] || (x.type === 'annulation' && siennes[x.inscriptionId])); }));
        if (window.TableauNotation && typeof window.TableauNotation.rafraichirSiAffiche === 'function') window.TableauNotation.rafraichirSiAffiche();
        return true;
    }

    function fermerLesEcrans() {
        if (window.ObservationCibles && typeof window.ObservationCibles.fermer === 'function') window.ObservationCibles.fermer();
        if (window.TableauCibles && typeof window.TableauCibles.fermer === 'function') window.TableauCibles.fermer();
        surModale(false);
    }

    /** L'étape où reprendre : ce qui est déjà inscrit dit où le modèle en était. */
    function etapeDeReprise(depuis) {
        if (inscrite(2)) return Math.max(8, Math.min(depuis, ETAPES_MODELE.length - 1));
        if (inscrite(1)) return 7;
        if (inscrite(0)) return 5;
        return Math.min(depuis, 2);
    }

    async function lancerModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return;
        // Une démo déjà ouverte à qui le troisième groupe manque le reçoit ici, avant la première bulle.
        if (typeof window.verserGroupeParStandardsSiAbsent === 'function') await window.verserGroupeParStandardsSiAbsent();
        if (!troisiemeGroupeLa() || !(await assurerLeGroupe())) return;
        var e = window.Assistance.etatModeleDe(ID);
        var depuis = e.etat === 'en-cours' ? etapeDeReprise(e.etape) : (inscrite(2) ? ETAPES_MODELE.length - 1 : etapeDeReprise(0));
        debutDuModele = depuis;
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(DEF_MODELE, {
            depuis: depuis,
            surEtape: function (n) { window.Assistance.definirEtatModele(ID, 'en-cours', n); },
            surQuitter: function () { surModale(false); },
            surEchap: function () { surModale(false); },
            verifier: enDemo
        });
    }

    function terminerModele() {
        surModale(false);
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        rang: RANG,
        titre: TITRE,
        ligne: LIGNE,
        suite: SUITE,
        // Pas sur téléphone : le tableau des cibles, l'écran d'observation et la fenêtre demandent la largeur.
        grandEcranSeulement: true,
        // Un seul temps, « Je regarde » (pas de `lancer` : aucune Pratique guidée pour l'instant).
        totalModele: ETAPES_MODELE.length,
        lancerModele: lancerModele,
        defaireModele: defaireModele
    });

    // Pour la sentinelle des textes et les bancs.
    window.ParcoursCibles = { textes: TEXTES, objectif: OBJECTIF, objectifAtteint: OBJECTIF_ATTEINT, poignee: POIGNEE, ligne: LIGNE,
        titre: TITRE, rang: RANG, suite: SUITE, materiel: MATERIEL, etapesModele: ETAPES_MODELE, definitionModele: DEF_MODELE,
        motSuivant: MOT_SUIVANT, inscrite: inscrite, histoire: histoire };
})();
