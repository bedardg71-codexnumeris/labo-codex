/* =================================================================
   LE PARCOURS « DÉCOUVRIR » — la visite à rebours (lot « Les deux parcours », 8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 1 ; esquisses 69 et 70.

   Il part du résultat, sur la démo (la bande, Suricate Loyal, son profil, sa carte RàI),
   puis remonte vers Évaluation, Conception et Cadre. Il ne démarre jamais de lui-même :
   « Commencer » ou « Refaire », dans le panneau « Assistance ».

   ⚠ LES HUIT TEXTES SONT CEUX DU 16 NOV. 2026 (réécrits avec Grégoire, 8 h 47 à 9 h 46 ; relais de Cowork :
   plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md), posés mot pour mot, en lignes :
   tests/unit/sentinelle-parcours-je-regarde-2026-11-16.test.js les confronte à la consigne. Ils remplacent ceux du
   8 nov. La perspective : on part d'un geste que l'enseignant·e fait déjà, on dit ce que l'application en garde en
   mémoire. La première bulle porte l'objectif du parcours, la dernière dit qu'il est atteint. Les noms du menu
   (« Tu es dans « X », à l'onglet « Y » ») sont LUS à l'écran par le moteur, jamais recopiés ici.
   Les chiffres des étapes 2 à 4 viennent du pack démo actuel : le banc
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

    // L'objectif du parcours : dit par la première bulle (le moteur), rappelé par la dernière. Une seule écriture.
    var EN_MESURE = "de repérer qui a besoin de toi sans attendre une main levée et de nommer précisément son défi";

    function consigne(texte) { return { texte: texte, geste: true }; }

    function montre(f) { return function () { return [f()]; }; }

    var ETAPES = [
        {
            titre: "Ta classe d'un coup d'œil",
            lieu: true,
            lieuSuite: "La classe est fictive : dix étudiant·es, un trimestre complet.",
            lignes: function () {
                return [
                    // La bande des points (pas le bloc et son titre).
                    { texte: "Chaque point blanc est un·e étudiant·e", montre: montre(function () { return dans(blocAssiduite(), '.barre-indicateur') || blocAssiduite(); }) },
                    { texte: "Sa place dit son assiduité (tu prends déjà les présences ; ici, l'application les garde en mémoire, séance après séance)" },
                    { texte: "Un point s'écarte des autres" },
                    consigne("Touche « Détails » pour mettre un nom sur chaque point")
                ];
            },
            avant: async function () {
                aller('suivi', 'groupe');
                await attendre(blocAssiduite, 2000);
                // Le geste à faire est d'ouvrir les pastilles : elles partent fermées.
                var p = panneauPastilles();
                if (p && p.classList.contains('ouvert')) p.classList.remove('ouvert');
            },
            contour: function () { return document.getElementById('btn-toggle-panneau-prioritaire'); },
            atteint: pastillesOuvertes
        },
        {
            titre: "Qui s'écarte ?",
            confirme: "Tu viens d'ouvrir « Détails » : chaque point a maintenant un nom.",
            lignes: function () {
                return [
                    // Son nom : la ligne porte aussi « A 84 % », ce qu'il faut toucher (la pulsation le désigne).
                    { texte: "Le point à l'écart, c'est Suricate Loyal", montre: montre(nomDeLoyal) },
                    { texte: "Son assiduité est de 84 % ; celle des autres, de 93 % ou plus" },
                    { texte: "Un pourcentage ne dit pas pourquoi" },
                    consigne("Touche son « A 84 % » (A pour assiduité) : son profil rassemble ce que l'application a gardé de lui")
                ];
            },
            avant: async function () {
                aller('suivi', 'groupe');
                if (!pastillesOuvertes()) {
                    var b = document.getElementById('btn-toggle-panneau-prioritaire');
                    if (b) b.click();
                }
                await attendre(pastilleDeLoyal, 2000);
            },
            contour: function () {
                var p = pastilleDeLoyal();
                return p ? p.querySelector('.prioritaire-indice') : null;
            },
            atteint: profilDeLoyalOuvert
        },
        {
            titre: "Ce qui le met à l'écart",
            confirme: "Tu viens d'ouvrir le profil de Suricate Loyal.",
            // La page a changé (vu à l'écran le 16 nov. 2026 : l'onglet du menu passe de « Groupe » à « Profils ») : la
            // bulle le dit, comme la consigne le demande. À la bulle 4, on reste dans le même onglet : rien à redire.
            lieu: true,
            lignes: function () {
                return [
                    // Les deux lignes que nomme la bulle (exemple validé par Grégoire, 11 nov. 2026).
                    { texte: "Assiduité : cinq absences ou retards", montre: montre(function () { return titreDeCarte('Assiduité', /absences ou retards/); }) },
                    { texte: "Complétion : deux productions non remises", montre: montre(function () { return titreDeCarte('Complétion', /non remise/); }) },
                    { texte: "Une production, c'est tout ce que tu demandes de faire, que ce soit formatif ou certificatif : un plan de rédaction, un exposé oral, un laboratoire, une prise de sang, une mesure sur le terrain" },
                    { texte: "Non remise, elle ne s'évalue pas, mais elle dit quelque chose" },
                    { texte: "Ces deux signaux, tu les aurais avant d'entrer en classe, sans qu'il ait rien demandé" },
                    consigne("Touche « Accompagnement » : on passe de ce qu'on observe à ce qu'on peut faire")
                ];
            },
            avant: async function () {
                await ouvrirProfilDeLoyal('mobilisation');
                await attendre(function () { return carteQuiCommencePar('Complétion'); }, 2000);
            },
            contour: function () { return ongletProfil('accompagnement'); },
            atteint: function () { return ongletActif('accompagnement'); }
        },
        {
            titre: 'De quoi il a besoin',
            confirme: "Tu viens d'ouvrir « Accompagnement ».",
            lignes: function () {
                return [
                    // Le niveau et le défi, que nomme la bulle.
                    { texte: "Son niveau de besoin : 2 sur 3, « préventif » (une aide ciblée, avant que la difficulté s'installe)", montre: montre(function () { return dans(carteRai(), '.badge-sys'); }) },
                    { texte: "Son défi principal : la nuance, l'un des critères sur lesquels ses productions ont été évaluées (l'application peut le nommer parce qu'elle garde ses résultats d'une production à l'autre)", montre: montre(function () { return ligneDuDefi(carteRai()); }) },
                    { texte: "Ses absences y sont peut-être pour quelque chose : l'application ne l'affirme pas, elle met les deux sous tes yeux" },
                    { texte: "Le niveau indique l'intensité de l'aide requise par ton étudiant·e ; le défi dit où porter cette aide, concrètement" },
                    { texte: "Mais l'intervention, c'est toi qui la décides et c'est toi qui la prépares" },
                    consigne("Touche « Continuer »")
                ];
            },
            avant: async function () {
                await ouvrirProfilDeLoyal('accompagnement');
                await attendre(carteRai, 2000);
            },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(4); } }]
        },
        {
            titre: "D'où viennent ces signaux",
            lignes: function () {
                return [
                    { texte: "Tu viens de repérer qui a besoin de toi et de nommer son défi, sans qu'il ait levé la main" },
                    { texte: "L'application n'a rien deviné : elle a gardé en mémoire des gestes que tu fais déjà (prendre les présences, évaluer les productions)" },
                    { texte: "Remontons à ces gestes : tu verras ce qu'il te faudra faire pour obtenir la même chose avec ta classe" },
                    consigne("Touche « Évaluation », en haut")
                ];
            },
            avant: async function () { await ouvrirProfilDeLoyal('accompagnement'); await attendre(carteContexte, 2000); },
            contour: function () { return boutonNav('evaluations'); },
            atteint: function () { return sectionCourante() === 'evaluations'; }
        },
        {
            titre: 'Évaluer',
            lieu: true,
            lignes: function () {
                return [
                    // « tu reçois les productions » : la zone de dépôt de Préparer.
                    { texte: "Ici, tu reçois les productions de tes étudiant·es, puis tu les évalues, comme tu en as l'habitude", montre: montre(function () { return document.getElementById('travaux-drop-zone'); }) },
                    { texte: "La différence : l'application garde chaque geste en mémoire" },
                    { texte: "Chaque production reçue compte pour la complétion ; chaque évaluation, pour la performance (les résultats obtenus, critère par critère)" },
                    { texte: "L'assiduité, elle, vient des présences que tu prends dans « Suivi »" },
                    consigne("Pour évaluer, il te faut tes outils : touche « Conception »")
                ];
            },
            avant: async function () { aller('evaluations', 'importer'); window.scrollTo(0, 0); },
            contour: function () { return boutonNav('conception'); },
            atteint: function () { return sectionCourante() === 'conception'; }
        },
        {
            titre: 'Concevoir',
            lieu: true,
            lignes: function () {
                return [
                    { texte: "Tes outils, ce sont d'abord les productions que tu demandes : pour chacune, les consignes que tu donnes, les tâches que l'étudiant·e doit effectuer et l'objectif qu'elle cherche à atteindre" },
                    { texte: "Ce sont aussi tes grilles : la liste de tes critères (ce que tu regardes dans une production) et ce que vaut chacun" },
                    { texte: "Ce sont tes critères qui permettent à l'application de nommer un défi, comme la nuance tout à l'heure" },
                    // Sans flèche vers « Ton matériel existe déjà ? » (16 nov. 2026) : ce paragraphe prend la largeur de
                    // la page ; à 1180 × 900, la bulle, plus haute en lignes, ne pouvait que le couvrir, et sa flèche
                    // finissait dedans (banc parcours-1-et-2). La bulle se range dans son coin, la page reste lisible.
                    { texte: "Tu ne pars pas de zéro : tu apportes la grille que tu utilises déjà, elle dit déjà ce que tu juges important" },
                    consigne("Tout cela s'inscrit dans un cadre : touche « Cadre »")
                ];
            },
            avant: async function () { aller('conception', 'materiel'); window.scrollTo(0, 0); },
            contour: function () { return boutonNav('calendrier'); },
            atteint: function () { return sectionCourante() === 'calendrier'; }
        },
        {
            titre: 'Poser ton cadre',
            lieu: true,
            lignes: function () {
                return [
                    // Sans flèche vers la barre d'étapes du Cadre (16 nov. 2026) : cette bulle est la plus haute du
                    // parcours ; à 1180 × 900 elle ne pouvait que couvrir la barre, et sa flèche finissait dedans.
                    { texte: "Tout repose ici : ton trimestre, tes cours, tes groupes" },
                    { texte: "Tu viens de faire le chemin à rebours. Avec ta classe, tu le feras à l'endroit : « Cadre », « Conception », « Évaluation »" },
                    { texte: "Les champs marqués d'un astérisque rouge suffisent pour un premier résultat : dès ta première prise de présences, ta classe apparaît, un point par étudiant·e" },
                    { texte: "Le reste, tu le remplis à ton rythme : plus tu précises tes consignes, tes critères et tes rétroactions, plus ce que l'application te rend est fin et utile" },
                    { texte: "À force de t'en servir, ton acuité s'affine : cette mémoire rend visible et explicite ce qui, dans ta classe, reste parfois sous-entendu et silencieux" },
                    { texte: "Objectif atteint : tu es en mesure " + EN_MESURE },
                    { texte: "Chaque parcours a son objectif. C'est toi qui choisis la suite" }
                ];
            },
            sansSortie: true,
            avant: async function () { aller('calendrier', 'trimestre'); window.scrollTo(0, 0); },
            // Trois suites de même poids, aucune mise en avant (Grégoire, 16 nov. 2026).
            boutons: [
                { libelle: 'Explorer la démo par moi-même', action: function () { continuerLaDemo(); } },
                { libelle: 'Voir le parcours suivant', action: function () { voirLeParcoursSuivant(); } },
                { libelle: 'Commencer avec ma classe', action: function () { commencerAvecMaClasse(); } }
            ]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Quitter le parcours',
                objectif: "À la fin de ce parcours, tu seras en mesure " + EN_MESURE + "." };

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
            // À la dernière bulle, sans lien de sortie, Échap vaut « Explorer la démo par moi-même ».
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

    function parcoursDeLaClasse() {
        return window.Assistance.parcours().find(function (p) { return p.id === 'classe'; }) || null;
    }

    /** « Voir le parcours suivant » : le « Je regarde » de « Mettre ta classe en place », dans la démo, qui reste ouverte. */
    function voirLeParcoursSuivant() {
        depart = null;
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
        var classe = parcoursDeLaClasse();
        if (classe && typeof classe.lancerModele === 'function') classe.lancerModele();
    }

    /** « Commencer avec ma classe » : son « Nous faisons », sur les vraies données ; la démo se referme. */
    async function commencerAvecMaClasse() {
        depart = null;
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        var classe = parcoursDeLaClasse();
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
    window.ParcoursDecouvrir = { etapes: ETAPES, definition: DEF };
})();
