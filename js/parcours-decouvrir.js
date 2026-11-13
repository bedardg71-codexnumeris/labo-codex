/* =================================================================
   LE PARCOURS « DÉCOUVRIR » — la visite à rebours (lot « Les deux parcours », 8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 1 ; esquisses 69 et 70.

   Il part du résultat, sur la démo (la bande, Loyal Suricate, son profil, sa carte RàI),
   puis remonte vers Évaluation, Conception et Cadre. Il ne démarre jamais de lui-même :
   « Commencer » ou « Refaire », dans le panneau « Assistance ».

   ⚠ Les huit textes sont ceux que Grégoire a validés un à un le 8 nov. au matin, posés
   mot pour mot : tests/unit/sentinelle-parcours-decouvrir-2026-11-08.test.js les confronte
   à la consigne. Les chiffres des étapes 2 à 4 viennent du pack démo actuel : le banc
   tests/integration/parcours-1-et-2-2026-11-08.spec.js échoue s'il ne les donne plus.

   La démo : si elle n'est pas ouverte, le parcours l'ouvre (à part des vraies données,
   par activerModeDemo) et retient qu'il l'a ouverte. « Quitter le parcours » la referme
   alors et ramène la personne où elle était.
   ================================================================= */
(function () {
    'use strict';

    var ID = 'decouvrir';
    var M = function () { return window.ParcoursMoteur; };

    // La personne à l'écart : retrouvée par son nom dans le groupe de la démo, pas par son DA.
    function daDeLoyal() {
        if (typeof db === 'undefined' || typeof cle !== 'function') return null;
        var groupe = db.getSync(cle('groupeEtudiants'), []) || [];
        var e = groupe.find(function (x) { return x && x.nom === 'Loyal' && x.prenom === 'Suricate'; });
        return e ? e.da : null;
    }

    function sectionCourante() {
        return typeof sectionActive !== 'undefined' ? sectionActive : null;
    }

    function sousSectionVisible(id) {
        var el = document.getElementById(id);
        return !!(el && M().visible(el));
    }

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

    function aller(section, sous) {
        if (sousSectionVisible(section + '-' + sous)) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    // Le bouton de section, selon la largeur : l'onglet de la navigation principale, sinon
    // (iPhone) le bouton de section et, liste ouverte, la ligne de la section.
    function boutonNav(onglet) {
        return M().premierVisible([
            '.navigation-boutons button[data-onglet="' + onglet + '"]',
            '#entete-sections-liste:not([hidden]) [data-param="' + onglet + '"]',
            '#entete-section-bouton'
        ]);
    }

    function zonesNav(onglet) {
        var z = [boutonNav(onglet)];
        var liste = document.getElementById('entete-sections-liste');
        if (liste && !liste.hidden) z.push(liste);
        return z.filter(Boolean);
    }

    function blocAssiduite() {
        var h = document.querySelector('#section-suivi h4[data-tooltip="tdb-assiduite"]');
        return h ? h.parentElement : null;
    }

    function panneauPastilles() {
        return document.getElementById('panneau-suivi-etudiants');
    }

    function pastillesOuvertes() {
        var p = panneauPastilles();
        return !!(p && p.classList.contains('ouvert') && M().visible(p));
    }

    function pastilleDeLoyal() {
        var da = daDeLoyal();
        return da ? document.querySelector('#panneau-suivi-etudiants .etudiant-suivi-item[data-da="' + da + '"]') : null;
    }

    function profilDeLoyalOuvert() {
        var da = daDeLoyal();
        return !!(da && window.profilActuelDA === da && sousSectionVisible('suivi-profil'));
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

    // Ce que nomme la bulle, à la ligne près (Grégoire, 11 nov. 2026, sur l'iPad : visant une carte entière, la flèche
    // tombait dans son coin, à côté de l'information).
    function dans(parent, sel) {
        return parent ? parent.querySelector(sel) : null;
    }

    function titreDeCarte(mot, motif) {
        var c = carteQuiCommencePar(mot);
        return c ? [].slice.call(c.querySelectorAll('h4')).find(function (h) { return motif.test(h.textContent); }) || null : null;
    }

    function carteContexte() {
        return cartesProfil().find(function (c) {
            var h = c.querySelector('h2, h3');
            return h && /Contexte d.apprentissage/.test(h.textContent);
        }) || null;
    }

    function ligneDuDefi(carte) {
        return carte ? [].slice.call(carte.querySelectorAll('p')).find(function (p) { return /D\u00e9fi principal/.test(p.textContent); }) || null : null;
    }

    function nomDeLoyal() {
        var p = pastilleDeLoyal();
        return p ? [].slice.call(p.querySelectorAll('span')).find(function (s) { return /Suricate/.test(s.textContent); }) || p : null;
    }

    function barreDuCadre() {
        var e = document.querySelector('#section-calendrier .bc-etape');
        return e ? e.parentElement : null;
    }

    function carteRai() {
        return cartesProfil().find(function (c) {
            var h = c.querySelector('h2, h3');
            return h && /Réponse à l.intervention/.test(h.textContent);
        }) || null;
    }

    async function ouvrirProfilDeLoyal(section) {
        aller('suivi', 'groupe');
        var da = daDeLoyal();
        if (!da) return;
        if (!profilDeLoyalOuvert() && typeof afficherProfilComplet === 'function') afficherProfilComplet(da);
        await attendre(profilDeLoyalOuvert, 2000);
        await attendre(function () { return !!ongletProfil(section); }, 2000);
        if (!ongletActif(section) && typeof changerSectionProfil === 'function') changerSectionProfil(section);
        await attendre(function () { return ongletActif(section); }, 2000);
    }

    // ---------- Les huit étapes ----------

    var ETAPES = [
        {
            titre: "Ta classe d'un coup d'œil",
            texte: "Voici une classe de démonstration : dix étudiant·es, un trimestre complet. Chaque point blanc est une personne ; sa place dit son assiduité. L'assiduité est le premier signal dont tu disposes : elle existe dès le premier cours, bien avant la première note. Un point s'écarte des autres : voyons qui c'est.",
            geste: "Touche « Détails » pour mettre un nom sur chaque point.",
            avant: async function () {
                aller('suivi', 'groupe');
                await attendre(blocAssiduite, 2000);
                // Le geste à faire est d'ouvrir les pastilles : elles partent fermées.
                var p = panneauPastilles();
                if (p && p.classList.contains('ouvert')) p.classList.remove('ouvert');
            },
            // La bande des points (pas le bloc et son titre) : « chaque point blanc est une personne ».
            zones: function () { return [dans(blocAssiduite(), '.barre-indicateur') || blocAssiduite()]; },
            contour: function () { return document.getElementById('btn-toggle-panneau-prioritaire'); },
            atteint: pastillesOuvertes
        },
        {
            titre: "Qui s'écarte ?",
            texte: "Loyal Suricate a l'assiduité la plus basse du groupe : 84\u00a0%, quand tous les autres sont à 93\u00a0% ou plus. C'est lui, le point à l'écart. Un pourcentage ne dit pas pourquoi : son profil rassemble ce que l'application sait de lui.",
            geste: "Touche son « A 84\u00a0% » pour ouvrir son profil.",
            avant: async function () {
                aller('suivi', 'groupe');
                if (!pastillesOuvertes()) {
                    var b = document.getElementById('btn-toggle-panneau-prioritaire');
                    if (b) b.click();
                }
                await attendre(pastilleDeLoyal, 2000);
            },
            // Son nom : la ligne porte aussi « A 84 % », ce qu'il faut toucher (la pulsation le désigne).
            zones: function () { return [nomDeLoyal()]; },
            contour: function () {
                var p = pastilleDeLoyal();
                return p ? p.querySelector('.prioritaire-indice') : null;
            },
            atteint: profilDeLoyalOuvert
        },
        {
            titre: "Ce qui le met à l'écart",
            texte: "Cinq absences ou retards, deux productions non remises. Les deux se lisent ensemble : une production qui n'est pas remise ne peut pas être évaluée, mais elle donne un signal. C'est ce que tu verrais d'un coup d'œil avant d'entrer en classe.",
            geste: "Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire.",
            avant: async function () {
                await ouvrirProfilDeLoyal('mobilisation');
                await attendre(function () { return carteQuiCommencePar('Complétion'); }, 2000);
            },
            // Les deux lignes que nomme la bulle (exemple validé par Grégoire, 11 nov. 2026).
            zones: function () { return [titreDeCarte('Assiduité', /absences ou retards/), titreDeCarte('Complétion', /non remise/)]; },
            contour: function () { return ongletProfil('accompagnement'); },
            atteint: function () { return ongletActif('accompagnement'); }
        },
        {
            titre: 'De quoi il a besoin',
            geste: "Touche « Continuer ».",
            texte: "De quoi a-t-il besoin ? L'application le situe au niveau 2 (préventif) et nomme son défi principal : la nuance, l'un des critères de la grille. Ses absences et ses travaux non remis y sont peut-être pour quelque chose : moins de pratique, des modélisations manquées en classe. L'application ne peut pas l'affirmer, mais elle met les deux sous tes yeux. Avec tes présences, ton calendrier et ta carte d'alignement, elle te dira même quelle matière il a manquée. Le niveau dit l'intensité de l'aide, le défi dit où la porter ; l'intervention, c'est toi qui la décides.",
            avant: async function () {
                await ouvrirProfilDeLoyal('accompagnement');
                await attendre(carteRai, 2000);
            },
            // Le niveau et le défi, que nomme la bulle.
            zones: function () { var c = carteRai(); return [dans(c, '.badge-sys'), ligneDuDefi(c)]; },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(4); } }]
        },
        {
            titre: "D'où viennent ces signaux",
            texte: "Voilà le geste : savoir, avant d'entrer en classe, qui a besoin de toi et de quoi. Ces signaux ne viennent pas de nulle part, et ils ne valent que ce qui les nourrit. Remontons d'où ils viennent : tu sauras ce qu'il faudra faire pour les obtenir avec ta classe.",
            geste: "Touche « Évaluation », en haut.",
            // Ces signaux : le badge de « Contexte d'apprentissage » (11 nov. 2026). « Évaluation » a la pulsation.
            avant: async function () { await ouvrirProfilDeLoyal('accompagnement'); await attendre(carteContexte, 2000); },
            zones: function () { return [dans(carteContexte(), '.badge-sys')]; },
            contour: function () { return boutonNav('evaluations'); },
            atteint: function () { return sectionCourante() === 'evaluations'; }
        },
        {
            titre: 'Évaluer',
            texte: "Ici, tu reçois les productions de tes étudiant·es et tu les évalues, comme tu en as l'habitude. La différence : chaque geste laisse une trace. Chaque évaluation nourrit leur performance, chaque remise leur complétion. L'assiduité, elle, vient des présences que tu prends dans Suivi. Mais pour évaluer, il te faut tes outils.",
            geste: "Touche « Conception » pour voir d'où viennent tes outils.",
            avant: async function () { aller('evaluations', 'importer'); window.scrollTo(0, 0); },
            // 11 nov. 2026 : « tu reçois les productions » — la zone de dépôt de Préparer ; et la section présentée,
            // « Évaluation », dans le menu. Pas « Conception » : la pulsation la désigne.
            zones: function () { return [document.getElementById('travaux-drop-zone')].concat(zonesNav('evaluations')); },
            contour: function () { return boutonNav('conception'); },
            atteint: function () { return sectionCourante() === 'conception'; }
        },
        {
            titre: 'Concevoir',
            texte: "Tes outils : les productions que tu demandes, tes grilles, tes échelles. Ce sont tes critères qui permettent à l'application de nommer un défi, comme la nuance tout à l'heure. Tu n'as pas à partir de zéro : commence par apporter ce que tu utilises déjà, puisque tes grilles disent déjà ce que tu juges important. Et tout cela s'inscrit dans un cadre.",
            geste: 'Touche « Cadre ».',
            avant: async function () { aller('conception', 'materiel'); window.scrollTo(0, 0); },
            // Même règle qu'à l'étape 6 : « apporter ce que tu utilises déjà » — « Ton matériel existe déjà ? » ; et la
            // section présentée, « Conception ».
            zones: function () {
                var intro = document.querySelector('#section-conception .materiel-intro p');
                return [intro].concat(zonesNav('conception'));
            },
            contour: function () { return boutonNav('calendrier'); },
            atteint: function () { return sectionCourante() === 'calendrier'; }
        },
        {
            titre: 'Poser ton cadre',
            geste: "Touche « Commencer avec ma classe », ou « Continuer d'explorer la démo ».",
            texte: "Tout repose ici : ton trimestre, tes cours, tes groupes. Les dates de ton trimestre et ton horaire donnent tes séances, et les présences s'y accrochent, comme la matière manquée. Tu viens de faire le chemin à rebours ; avec ta classe, tu le feras à l'endroit : Cadre, Conception, Évaluation. Pas besoin de tout configurer pour voir un premier résultat : dès ta première prise de présences, ta classe apparaît, un point par étudiant·e.",
            sansSortie: true,
            avant: async function () { aller('calendrier', 'trimestre'); window.scrollTo(0, 0); },
            // La barre d'étapes du cadre (« ton trimestre, tes cours, tes groupes ») et la section présentée, « Cadre ».
            zones: function () { return [barreDuCadre()].concat(zonesNav('calendrier')); },
            boutons: [
                { libelle: 'Commencer avec ma classe', primaire: true, action: function () { commencerAvecMaClasse(); } },
                { libelle: "Continuer d'explorer la démo", action: function () { continuerLaDemo(); } }
            ]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Quitter le parcours' };

    // ---------- Le lancement, la sortie, la fin ----------

    // Ce que le parcours a trouvé en partant : la démo était-elle ouverte, où était la personne.
    var depart = null;

    function lieuCourant() {
        var s = sectionCourante();
        var sec = s ? document.getElementById('section-' + s) : null;
        var sous = sec ? [].slice.call(sec.querySelectorAll('.sous-section')).find(function (e) { return M().visible(e); }) : null;
        return { section: s, sousSection: sous ? sous.id : null };
    }

    function revenir(lieu) {
        if (!lieu || !lieu.section) return;
        var prefixe = lieu.section + '-';
        if (lieu.sousSection && lieu.sousSection.indexOf(prefixe) === 0 && typeof naviguerVers === 'function') {
            naviguerVers(lieu.section, lieu.sousSection.slice(prefixe.length));
        } else if (typeof afficherSection === 'function') {
            afficherSection(lieu.section);
        }
    }

    function enDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    async function lancer(depuis) {
        depart = { demoDejaOuverte: enDemo(), lieu: lieuCourant() };
        if (!depart.demoDejaOuverte) {
            if (typeof activerModeDemo === 'function') await activerModeDemo();
            // Un import en cours empêche l'entrée (activerModeDemo le dit lui-même) : rien ne part.
            if (!enDemo()) { depart = null; return; }
        }
        window.Assistance.definirEtat(ID, 'en-cours', depuis || 0);
        return M().lancer(DEF, {
            depuis: depuis || 0,
            surEtape: function (i) { window.Assistance.definirEtat(ID, 'en-cours', i); },
            surQuitter: quitter,
            // À la dernière bulle, sans lien de sortie, Échap vaut « Continuer d'explorer la démo ».
            surEchap: function () { continuerLaDemo(); },
            // Sortie de la démo en cours de route (le bandeau vert) : le parcours se ferme et attend.
            verifier: enDemo
        });
    }

    async function quitter() {
        var d = depart;
        depart = null;
        if (d && !d.demoDejaOuverte && enDemo() && typeof desactiverModeDemo === 'function') {
            await desactiverModeDemo();
            revenir(d.lieu);
        }
        if (window.notifications && typeof window.notifications.info === 'function') {
            window.notifications.info('Tu pourras reprendre ce parcours depuis « Assistance », dans le menu.');
        }
    }

    function continuerLaDemo() {
        depart = null;
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }

    async function commencerAvecMaClasse() {
        depart = null;
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        var classe = window.Assistance.parcours().find(function (p) { return p.id === 'classe'; });
        if (classe) {
            var e = window.Assistance.etatDe('classe');
            classe.lancer(e.etat === 'en-cours' ? e.etape : 0);
        }
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Découvrir',
        ligne: "Ce que Labo Codex te montre avant d'entrer en classe, sur une classe de démonstration.",
        total: ETAPES.length,
        lancer: lancer,
        // Les deux temps (12 nov. 2026) : ce parcours ne se joue que dans la démo ; il part de la même façon
        // sous « Modélisation » et sous « Pratique guidée » (js/assistance.js).
        dansLaDemo: true
    });

    // Pour la sentinelle des textes (tests/unit) : les étapes telles qu'elles sont posées.
    window.ParcoursDecouvrir = { etapes: ETAPES };
})();
