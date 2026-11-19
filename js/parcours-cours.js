/* =================================================================
   LE PARCOURS « MONTER TON COURS » (cinquième parcours, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md.

   La carte d'alignement (Conception › Alignement), par le plus court chemin qui montre sa puissance :
   la compétence, une idée maîtresse, une leçon, son objectif, une activité qui le sert, une évaluation qui
   le vérifie avec la production du troisième parcours, sa pastille à ✓ ; puis les pistes pour raffiner.
   Il ne démarre jamais de lui-même ; il ne crée ni ne renomme aucune carte, et n'écrit rien dans la
   carte que la personne ne fasse elle-même.

   ⚠ Les bulles sont celles que Grégoire a réécrites le 19 nov. 2026 (13 h 49 à 14 h 10, retouches de 15 h 34 et
   15 h 53) dans la forme des « Nous faisons », posées mot pour mot : plans de travail/CONSIGNE-2026-11-19-nous-faisons-
   cours.md ; tests/unit/sentinelle-parcours-cours-2026-11-09.test.js les y confronte. La ligne du panneau et le refus
   restent ceux du 8 nov.

   · Une étape avance sur l'état de la CARTE (`planificationCarte.etat`), jamais au toucher d'un bouton :
     un énoncé de compétence, une idée maîtresse reliée (« se décline en »), une leçon datée et reliée
     (« se concrétise dans »), un objectif, un bloc qui le sert, une évaluation avec sa production et sa
     pastille à ✓. Une évaluation qui vérifie l'objectif mais dont la pastille dit ⚠ (posée avant
     l'activité) reçoit la variante de l'étape 6.
   · La carte est un canevas qui se déplace et se zoome : contours et bulle suivent les blocs ; le bloc visé
     par une étape est amené au milieu du canevas libre s'il n'y est pas entier (`amenerLeBloc`).
   · Tout le canevas se touche (créer, écrire, tirer un lien, glisser un bloc).
   · La condition d'entrée : une production dans le cours actif. Sur les vraies données : la démo ouverte
     se referme d'abord.
   ================================================================= */
(function () {
    'use strict';

    var ID = 'monter';
    var CLE_CTX = 'parcoursMonter';
    var M = function () { return window.ParcoursMoteur; };
    var C = function () { return window.planificationCarte; };

    // Texte validé par Grégoire : la phrase du panneau sans production.
    var REFUS = "Commence par « Évaluer une première production » : il te faut une production pour la placer dans ta carte.";

    // ---------- Utilitaires ----------

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

    function el(id) { return document.getElementById(id); }
    function vis(e) { return !!(e && M().visible(e)); }
    function qs(sel) { return document.querySelector(sel); }
    function enDemo() { return typeof estEnModeDemo === 'function' && estEnModeDemo(); }

    /**
     * Une saisie en cours dans la carte (un titre, un objectif, un champ de l'Inspecteur). La carte écrit à chaque
     * touche : sans cette garde, l'étape avançait dès la première lettre, la bulle prenait le focus et la suite de la
     * frappe tombait sur les raccourcis de la carte (relecture neuve du 9 nov. : un titre réduit à « Aéraires » ; à
     * l'étape 4, un Retour arrière supprimait la leçon sélectionnée). L'étape avance quand on quitte le champ.
     */
    function enSaisie() {
        var a = document.activeElement;
        if (!a || !a.closest || !a.closest('#conception-carte')) return false;
        return !!(a.isContentEditable || a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && (a.type || 'text') === 'text'));
    }

    function lireCtx() {
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_CTX) : null;
        return v && typeof v === 'object' ? v : {};
    }

    function majCtx(maj) {
        var ctx = Object.assign({}, lireCtx(), maj);
        if (typeof definirPreference === 'function') definirPreference(CLE_CTX, ctx);
        return ctx;
    }

    // ---------- La carte, lue ----------

    function noeuds() {
        var c = C();
        return c && c.etat && c.etat.noeuds ? Array.from(c.etat.noeuds.values()) : [];
    }

    function liens() {
        var c = C();
        return c && c.etat && c.etat.liens ? Array.from(c.etat.liens.values()) : [];
    }

    function texte(n) { return String((n && n.titre) || '').trim(); }

    /**
     * Seul ce qui est créé après « Commencer » (ou « Refaire ») fait avancer une étape, comme au troisième parcours
     * (décision de Cowork, 9 nov., 16 h 03 ; mesuré par la relecture neuve : sur une carte remplie, « Refaire » faisait
     * défiler les six étapes en moins d'une seconde). Les blocs déjà posés sont retenus par leur identifiant.
     */
    function neuf(n) {
        var avant = lireCtx().noeudsAvant;
        return !Array.isArray(avant) || avant.indexOf(n.id) === -1;
    }

    function duType(type) { return noeuds().filter(function (n) { return n && n.type === type && neuf(n); }); }

    /** Les blocs de la carte active, lus dans le stockage : la carte n'a pas à être ouverte au lancement. */
    function idsDeLaCarteActive() {
        var D = window.planificationDonnees;
        var index = D && typeof D.getIndex === 'function' ? D.getIndex() : null;
        var carte = index && index.active ? D.chargerCarte(index.active) : null;
        return carte && Array.isArray(carte.noeuds) ? carte.noeuds.map(function (n) { return n && n.id; }).filter(Boolean) : [];
    }

    function relie(sourceId, cibleId, type) {
        return liens().some(function (l) { return l && l.type === type && l.source === sourceId && l.cible === cibleId; });
    }

    function competence() { return duType('competence').find(function (n) { return texte(n); }) || null; }

    function ideeReliee() {
        var comp = competence();
        if (!comp) return null;
        return duType('idee-maitresse').find(function (n) { return texte(n) && relie(comp.id, n.id, 'se_decline_en'); }) || null;
    }

    function leconDatee(n) {
        var c = C();
        return !!(n && texte(n) && c.semaineDeLecon(n) && n.metadata && n.metadata.rangSeance);
    }

    function leconReliee() {
        var idee = ideeReliee();
        if (!idee) return null;
        var l = duType('lecon').find(function (n) { return leconDatee(n) && relie(idee.id, n.id, 'se_concretise_dans'); }) || null;
        if (l && lireCtx().leconId !== l.id) majCtx({ leconId: l.id });
        return l;
    }

    /** À l'étape 3 : la dernière leçon titrée de la carte, celle qu'on vient de créer (pas une leçon plus ancienne). */
    function leconNeuve() { return duType('lecon').filter(texte).pop() || null; }

    /** La leçon du parcours : celle que l'étape 3 a vue naître, sinon la première leçon. */
    function laLecon() {
        var c = C();
        var id = lireCtx().leconId;
        var l = id && c ? c.etat.noeuds.get(id) : null;
        return (l && neuf(l) ? l : null) || duType('lecon')[0] || null;
    }

    function objectifs(lecon) {
        return (C().objectifsDeLecon(lecon) || []).filter(function (o) { return String(o.texte || '').trim(); });
    }

    function enfantsDe(lecon) {
        var c = C();
        return lecon ? (lecon.enfants || []).map(function (id) { return c.etat.noeuds.get(id); }).filter(function (n) { return n && neuf(n); }) : [];
    }

    function blocQuiSert() {
        var c = C();
        return enfantsDe(laLecon()).find(function (n) {
            return n.type !== 'evaluation' && c.TYPES_SERVANTS_OBJECTIF.indexOf(n.type) !== -1 && c.objectifsServisPar(n).length > 0;
        }) || null;
    }

    function evaluations() { return duType('evaluation'); }

    function pastille(ev) { return C().evaluerPastilleEvaluation(ev).etat; }

    function evaluationAlignee() {
        return evaluations().find(function (ev) { return ev.metadata && ev.metadata.productionId && pastille(ev) === 'avant'; }) || null;
    }

    function evaluationApres() {
        return evaluations().find(function (ev) { return C().objectifsVerifiesPar(ev).length > 0 && pastille(ev) === 'apres'; }) || null;
    }

    // ---------- Le DOM de la carte ----------

    function bloc(n) { return n ? el(n.id) : null; }
    function boutonPalette(type) { return qs('#planif-palette .planif-palette-btn[data-type="' + type + '"]'); }
    function ports(n) { var b = bloc(n); return b ? [].slice.call(b.querySelectorAll(':scope > .planif-noeud-port')) : []; }
    function inspecteur() { return el('planif-panneau'); }
    function inspecteurOuvertSur(n) { var c = C(); return !!(n && c && c.etat.panneauOuvert && c.etat.panneauNoeudId === n.id && vis(inspecteur())); }

    /**
     * Ce que la bulle doit laisser libre : ce que l'étape fait toucher (le moteur place la bulle hors de leur union).
     * Un bloc neuf se pose au centre du canevas, là où la bulle se mettait : mesuré, elle couvrait la poignée de l'idée
     * maîtresse à l'étape 2. D'une leçon, seulement les parties à toucher : entière, elle est trop grande pour que la
     * bulle trouve sa place à côté, et le moteur la couvrait (mesuré à l'étape 3). L'Inspecteur ouvert sur le bloc visé
     * passe seul : la bulle se range à sa gauche.
     */
    function aLaisserLibre(elements, surInspecteur) {
        if (surInspecteur && inspecteurOuvertSur(surInspecteur)) return [inspecteur()];
        return elements.filter(Boolean);
    }

    /** Des parties d'une leçon : `entete` (semaine, séance, 🎯), `titre`, `objectifs`, `zone` (où l'on dépose un bloc). */
    function partiesDe(l, noms) {
        var b = bloc(l);
        return b ? noms.map(function (nom) { return b.querySelector(':scope > .planif-noeud-' + nom); }).filter(Boolean) : [];
    }

    /** La partie du canevas qu'on voit et qu'on peut toucher : à l'écran, entre la palette « Nœuds » et le « Planificateur ». */
    function canevasLibre() {
        var z = el('planif-zone-travail');
        if (!z) return null;
        var r = z.getBoundingClientRect();
        var g = Math.max(r.left, 0), d = Math.min(r.right, window.innerWidth);
        var h = Math.max(r.top, 0), b = Math.min(r.bottom, window.innerHeight);
        var noeudsPal = el('planif-palette'), planif = el('planif-palette-nav');
        if (vis(noeudsPal)) { var p = noeudsPal.getBoundingClientRect(); if (p.right < (g + d) / 2) g = Math.max(g, p.right); }
        if (vis(planif)) { var q = planif.getBoundingClientRect(); if (q.left > (g + d) / 2) d = Math.min(d, q.left); }
        return { left: g, right: d, top: h, bottom: b };
    }

    /**
     * Le bloc visé, amené au milieu du canevas libre s'il n'y est pas entier : la vue se déplace comme au glisser du fond
     * (le défilement du canevas), rien ne s'écrit dans la carte. Mesuré au rechargement (« Reprendre ») : la carte se
     * recentre sur la moyenne de ses blocs, et la leçon de l'étape 4 tombait au bas de l'écran, son 🎯 sous le
     * « Planificateur ». « Recentrer la carte » (`centrerVueSurContenu`) fait la même moyenne : il ne suffit pas.
     */
    async function amenerLeBloc(quel) {
        // Lu à mesure : à la reprise après un rechargement, la carte n'est pas encore chargée quand l'étape commence.
        await attendre(function () { var b = bloc(quel()); return !!b && b.getBoundingClientRect().width > 0; }, 4000);
        var n = quel();
        // La carte chargée se recentre à l'image suivante (`requestAnimationFrame`) : on passe après elle.
        await new Promise(function (fin) { requestAnimationFrame(function () { requestAnimationFrame(fin); }); });
        var b = bloc(n), z = el('planif-zone-travail'), L = canevasLibre();
        if (!n || !b || !z || !L) return;
        var r = b.getBoundingClientRect();
        if (r.left >= L.left && r.right <= L.right && r.top >= L.top && r.bottom <= L.bottom) return;
        var haut = L.bottom - L.top;
        var cibleHaut = r.height > haut - 40 ? L.top + 20 : L.top + (haut - r.height) / 2;
        z.scrollLeft += (r.left + r.width / 2) - (L.left + L.right) / 2;
        z.scrollTop += r.top - cibleHaut;
    }

    // Les contours en plus (des cercles d'attache, deux sélecteurs, les cases de l'Inspecteur) : le même dessin que le
    // moteur (classe `parcours-contour`), posé ici, suivi à chaque passage, retiré avec l'étape. Le moteur n'est pas modifié.
    var extras = [];
    var extrasTimer = null;
    var ciblesExtras = function () { return []; };

    function majExtras() {
        // Rien sur ce que couvre une palette flottante (Grégoire, 11 nov. 2026, capture 25 : le halo de la semaine et de
        // la séance d'une leçon restée sous le « Planificateur » se dessinait par-dessus lui).
        var cibles = M().actif() ? (ciblesExtras() || []).filter(function (c) { return vis(c) && M().seVoit(c); }) : [];
        while (extras.length < cibles.length) {
            var d = document.createElement('div');
            d.className = 'parcours-contour';
            d.id = 'parcours-contour-extra-' + extras.length;
            document.body.appendChild(d);
            extras.push(d);
        }
        extras.forEach(function (d, k) {
            var cible = cibles[k];
            if (!cible) { d.hidden = true; return; }
            var r = cible.getBoundingClientRect();
            d.hidden = false;
            d.style.left = (r.left - 5) + 'px';
            d.style.top = (r.top - 5) + 'px';
            d.style.width = (r.width + 10) + 'px';
            d.style.height = (r.height + 10) + 'px';
        });
    }

    function poserExtras(fn) {
        ciblesExtras = fn;
        if (!extrasTimer) extrasTimer = setInterval(majExtras, 120);
        majExtras();
    }

    function retirerExtras() {
        ciblesExtras = function () { return []; };
        if (extrasTimer) clearInterval(extrasTimer);
        extrasTimer = null;
        extras.forEach(function (d) { if (d.parentNode) d.parentNode.removeChild(d); });
        extras = [];
    }

    /** L'Inspecteur devant la palette « Planificateur », le temps du parcours (css/parcours.css). */
    function inspecteurDevant(oui) { document.body.classList.toggle('parcours-inspecteur-devant', !!oui); }

    /**
     * Le parcours est-il toujours le nôtre ? Le moteur peut le fermer sans `surQuitter` : un autre parcours lancé, la démo
     * ouverte (relecture neuve du 9 nov. : la classe restait sur `body` jusqu'au rechargement). Lu au titre de la bulle,
     * que le moteur n'expose pas autrement ; pendant un passage d'étape, un de nos titres suffit.
     */
    function estLeNotre() {
        if (!M().actif()) return false;
        var t = qs('#parcours-bulle .parcours-bulle-titre');
        return !t || ETAPES.some(function (e) { return e.titre === t.textContent; });
    }

    /**
     * Un bloc posé depuis la palette (« à côté du dernier bloc posé », placePourBlocNeuf) peut tomber sous le
     * « Planificateur » (Grégoire, 11 nov. 2026, capture 25 : la leçon neuve sous la palette, sa flèche vers un en-tête
     * caché). Chaque bloc neuf hors de tout bloc est amené une fois au milieu du canevas libre, comme à l'entrée d'une
     * étape (`amenerLeBloc`) ; la carte n'est pas modifiée, seule la vue se déplace.
     */
    var blocsConnus = null;
    function amenerLesBlocsNeufs() {
        var tous = noeuds().filter(Boolean);
        var ids = tous.map(function (n) { return n.id; });
        if (!blocsConnus) { blocsConnus = ids; return; }
        var nouveaux = tous.filter(function (n) { return blocsConnus.indexOf(n.id) === -1 && !n.parent; });
        blocsConnus = ids;
        nouveaux.forEach(function (n) {
            var quel = function () { return C() && C().etat.noeuds.get(n.id); };
            amenerLeBloc(quel).then(function () { horsDesPalettes(bloc(quel())); });
        });
    }

    /**
     * Une palette glissée vers le milieu du canevas n'est ni à gauche ni à droite : la carte (`partieVisibleDuCanevas`) et
     * `canevasLibre` ne l'écartent pas, et un bloc neuf peut s'y poser dessous (lecture de la capture 25, inférée). Le bloc
     * qui chevauche une palette est amené au milieu de la plus large bande du canevas qu'aucune palette ne couvre, à sa
     * hauteur ; seule la vue se déplace.
     */
    function horsDesPalettes(b) {
        var z = el('planif-zone-travail');
        if (!b || !z) return;
        var r = b.getBoundingClientRect(), zr = z.getBoundingClientRect();
        var palettes = ['planif-palette', 'planif-palette-nav'].map(el).filter(vis).map(function (p) { return p.getBoundingClientRect(); })
            .filter(function (q) { return q.top < r.bottom && r.top < q.bottom; });
        var sous = palettes.some(function (q) { return r.left < q.right && q.left < r.right; });
        if (!sous) return;
        // Les bandes libres : la largeur visible du canevas moins les palettes à hauteur du bloc.
        var bandes = [{ g: Math.max(zr.left, 0), d: Math.min(zr.right, window.innerWidth) }];
        palettes.forEach(function (q) {
            bandes = bandes.reduce(function (acc, x) {
                if (q.right <= x.g || x.d <= q.left) return acc.concat([x]);
                return acc.concat([{ g: x.g, d: q.left }, { g: q.right, d: x.d }].filter(function (y) { return y.d > y.g; }));
            }, []);
        });
        var large = bandes.reduce(function (m, x) { return !m || x.d - x.g > m.d - m.g ? x : m; }, null);
        if (large) z.scrollLeft += (r.left + r.width / 2) - (large.g + large.d) / 2;
    }

    var veilleTimer = null;
    function nettoyer() {
        retirerExtras();
        inspecteurDevant(false);
        if (veilleTimer) clearInterval(veilleTimer);
        veilleTimer = null;
        blocsConnus = null;
    }
    function veiller() {
        if (veilleTimer) clearInterval(veilleTimer);
        blocsConnus = null;
        veilleTimer = setInterval(function () {
            if (!estLeNotre()) { nettoyer(); return; }
            amenerLesBlocsNeufs();
        }, 200);
    }

    async function allerALaCarte() {
        if (!vis(el('conception-carte')) && typeof naviguerVers === 'function') naviguerVers('conception', 'carte');
        await attendre(function () { return vis(el('conception-carte')) && vis(el('planif-palette')); }, 3000);
    }

    // ---------- Les étapes ----------
    //
    // « NOUS FAISONS » (la Pratique guidée), réécrit avec Grégoire le 19 nov. 2026 (13 h 49 à 14 h 10 ; retouches de
    // 15 h 34, bulle 4, et de 15 h 53, bulle 6) : plans de travail/CONSIGNE-2026-11-19-nous-faisons-cours.md, mot pour mot ;
    // tests/unit/sentinelle-parcours-cours-2026-11-09.test.js confronte les lignes à cette consigne. La forme des
    // « Nous faisons » (parcours 2, 4 et 6) : la confirmation au-dessus du titre (`confirme`), l'objectif et l'objectif
    // atteint posés par le moteur, la phrase du lieu à la bulle 1, les explications sans marque (`note`), les gestes en
    // lignes qui se grisent quand la carte dit qu'ils sont faits, la consigne en dernier (`geste`).
    // ⚠ Deux traits de la forme n'ont pas de mécanisme dans le moteur de cette base (dit au rapport du lot) : la flèche
    // devant un geste qui n'est pas la consigne (elle n'a que son crochet, une fois fait), et la parenthèse hors du gras
    // d'une consigne (elle reste dans le texte de la consigne, en gras).

    function note(t) { return { texte: t, note: true }; }
    function geste(t, fait) { return { texte: t, fait: fait }; }
    function consigne(t, fait) { return { texte: t, geste: true, fait: fait }; }

    // L'étape où ce passage a commencé : 0 pour « Commencer » ou « Refaire », celle de la reprise pour « Reprendre ». Une
    // bulle ne confirme l'étape d'avant que si elle a été faite pendant ce passage (décision de Cowork, la même qu'aux
    // autres parcours) : après « Reprendre », la première bulle ne dit rien de ce qui précède.
    var debutDuPassage = 0;
    function confirmation(rang, texteConfirme) {
        return function () { return rang > debutDuPassage ? texteConfirme : ''; };
    }

    /** La zone des objectifs de la leçon est à l'écran (le badge 🎯 l'a dépliée). */
    function objectifsDeplies() { return vis(partiesDe(laLecon(), ['objectifs'])[0]); }

    function activiteNeuve() { return duType('activite').pop() || null; }
    function evaluationNeuve() { return duType('evaluation').pop() || null; }
    function dansLaLecon(n) { var l = laLecon(); return !!(n && l && n.parent === l.id); }

    var OBJECTIF = "À la fin de ce parcours, tu seras en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production.";
    var OBJECTIF_ATTEINT = "Objectif atteint : tu es en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production.";

    // La seconde forme de la bulle 6 (la variante d'avant ce lot, mots inchangés, coupés en explication et geste).
    var TEXTE_6_APRES = "Ta pastille affiche « ⚠ » : dans ta leçon, l'évaluation vient avant l'activité qui enseigne son objectif.";
    var GESTE_6_APRES = "Glisse ton évaluation sous ton activité, par sa poignée ⠿";

    // La variante de l'étape 6 (sa seconde forme) : le moteur rend la bulle une fois par étape ; quand l'état de la
    // pastille change, la même étape est rendue de nouveau (`allerA`, comme la bulle du choix du troisième parcours).
    // `secondeForme` dit au moteur de retirer la confirmation de cette forme-là.
    var varianteRendue = false;

    var ETAPES = [
        {
            titre: 'Ta compétence',
            lieu: true,
            lieuSuite: ": c'est là que tu construis ta carte d'alignement.",
            lignes: function () {
                return [
                    note("La carte d'alignement n'est pas une tâche de plus : c'est un outil pour monter ton cours, et tu peux utiliser l'application sans elle."),
                    note("Elle montre comment tes leçons et tes productions mènent à la compétence de ton cours, et donc sur quoi repose la note que tu construis."),
                    note("Elle garde ces liens pour toi et signale ceux qui manquent : tu n'as plus à tout tenir en tête."),
                    note("Son principe : tu évalues ce que tu enseignes, et tu enseignes ce que tu évalues, au même niveau d'exigence."),
                    note("Tout part de la compétence que ton cours doit développer : le reste de ta carte s'y rattachera."),
                    note("Aie sous la main le devis ministériel de ton cours."),
                    geste("Touche « Compétence » dans la palette « Nœuds »", function () { return duType('competence').length > 0; }),
                    consigne("Écris son énoncé, tel que le devis décrit la compétence et ses éléments", function () { return !!competence(); })
                ];
            },
            avant: allerALaCarte,
            // Le bloc créé, la flèche va à lui (le contour), plus au bouton de la palette (11 nov. 2026, capture 23).
            zones: function () { return duType('competence').length ? [] : [boutonPalette('competence')]; },
            contour: function () { var c = duType('competence')[0]; return c ? bloc(c) : boutonPalette('competence'); },
            atteint: function () { return !!competence(); }
        },
        {
            titre: 'Ton idée maîtresse',
            confirme: confirmation(1, "C'est fait : ta compétence est écrite."),
            lignes: function () {
                return [
                    note("Une idée maîtresse, c'est l'essentiel : ce qui restera quand l'étudiant·e aura oublié les détails, et autour de quoi tu organises ton contenu."),
                    note("Chaque compétence se décline en une ou plusieurs idées maîtresses : une seule suffit pour l'instant."),
                    note("C'est par tes idées maîtresses que tes leçons se rattacheront à ta compétence."),
                    geste("Touche « Idée maîtresse » dans la palette « Nœuds »", function () { return duType('idee-maitresse').length > 0; }),
                    geste("Écris ton idée maîtresse", function () { return !!duType('idee-maitresse').find(texte); }),
                    consigne("Depuis l'un des petits cercles au bord de ta compétence, tire un trait jusqu'à ton idée maîtresse (le lien « se décline en » s'affiche)", function () { return !!ideeReliee(); }),
                    note("Pour aller plus loin, « Idées maîtresses », dans la frise au-dessus de la carte, ouvre le guide à la page qui en parle.")
                ];
            },
            avant: async function () {
                await allerALaCarte();
                await amenerLeBloc(competence);
                poserExtras(function () {
                    var idee = duType('idee-maitresse').find(texte);
                    return idee ? ports(competence()) : [];
                });
            },
            zones: function () {
                var idee = duType('idee-maitresse').find(texte);
                return idee ? aLaisserLibre([bloc(competence()), bloc(idee)]) : [boutonPalette('idee-maitresse')];
            },
            contour: function () { return duType('idee-maitresse').find(texte) ? null : boutonPalette('idee-maitresse'); },
            atteint: function () { return !!ideeReliee(); }
        },
        {
            titre: 'Ta leçon',
            confirme: confirmation(2, "C'est fait : ton idée maîtresse est reliée à ta compétence."),
            lignes: function () {
                return [
                    note("Tes leçons structurent ton cours dans le temps : chacune porte sa semaine et sa séance."),
                    note("Une leçon datée apparaît dans le profil d'un·e étudiant·e absent·e ce jour-là : tu sais quelle matière il ou elle a manquée. Pour cela, des leçons datées suffisent, même sans le reste de ta carte."),
                    note("Touchée deux fois, ta leçon montre dans l'Inspecteur sa date pour chacun de tes groupes, calculée d'après son horaire. Sans tes journées sans cours et tes semaines spéciales (Cadre › Trimestre), ces dates peuvent tomber à côté."),
                    geste("Touche « Leçon » dans la palette « Nœuds »", function () { return duType('lecon').length > 0; }),
                    geste("Donne-lui un titre", function () { return !!leconNeuve(); }),
                    geste("Dans son en-tête, choisis sa semaine (S1, S2…), puis sa séance dans la semaine (A pour la première rencontre, B pour la deuxième)", function () { return leconDatee(leconNeuve()); }),
                    consigne("Tire un trait de ton idée maîtresse jusqu'à ta leçon (le lien « se concrétise dans » s'affiche)", function () { return !!leconReliee(); }),
                    note("C'est ce lien qui fait remonter tes objectifs et tes évaluations jusqu'à la compétence."),
                    note("Pour aller plus loin, « Leçons », dans la frise, ouvre le guide à la page qui en parle.")
                ];
            },
            avant: async function () {
                await allerALaCarte();
                await amenerLeBloc(ideeReliee);
                poserExtras(function () {
                    var l = leconNeuve();
                    if (!l) return [];
                    var b = bloc(l);
                    var datee = leconDatee(l);
                    return datee ? ports(ideeReliee())
                        : [b && b.querySelector('.planif-noeud-semaine'), b && b.querySelector('.planif-noeud-seance')].filter(Boolean);
                });
            },
            zones: function () {
                var l = leconNeuve();
                if (!l) return [boutonPalette('lecon')];
                return aLaisserLibre((leconDatee(l) ? [bloc(ideeReliee())] : []).concat(partiesDe(l, ['entete', 'titre'])), l);
            },
            contour: function () { return leconNeuve() ? null : boutonPalette('lecon'); },
            atteint: function () { return !!leconReliee(); }
        },
        {
            titre: 'Ton objectif',
            confirme: confirmation(3, "C'est fait : ta leçon est datée et reliée à ton idée maîtresse."),
            lignes: function () {
                return [
                    note("L'objectif de leçon est la boussole : c'est lui qui dit ce que l'étudiant·e saura faire à la fin, et c'est par rapport à lui que se choisissent les connaissances, les activités et l'évaluation."),
                    note("Le verbe que tu choisis, tes activités devront le faire exercer et tes évaluations devront le vérifier."),
                    note("Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, tu peux le reprendre ici."),
                    geste("Touche le badge 🎯 dans l'en-tête de ta leçon (la zone des objectifs se déplie)", objectifsDeplies),
                    consigne("Écris ton objectif en commençant par un verbe (l'invite « Sera en mesure de… » t'y aide)", function () { return objectifs(laLecon()).length > 0; }),
                    note("Pour aller plus loin, « Objectifs », dans la frise, ouvre le guide à la page qui en parle.")
                ];
            },
            avant: async function () { retirerExtras(); await allerALaCarte(); await amenerLeBloc(laLecon); },
            zones: function () { return partiesDe(laLecon(), ['entete', 'objectifs', 'titre']); },
            contour: function () { var b = bloc(laLecon()); return b ? b.querySelector('.planif-badge-objectif') : null; },
            atteint: function () { return objectifs(laLecon()).length > 0; }
        },
        {
            titre: 'Ton activité',
            confirme: confirmation(4, "C'est fait : ton objectif est écrit."),
            lignes: function () {
                return [
                    note("La pastille « ! » à côté de ton objectif dit qu'aucun bloc ne le sert encore : elle changera à mesure que tu le relieras."),
                    note("Le type d'activité dépend de ce que tu vises : un exercice de mémorisation ne développe pas la même chose qu'une analyse de cas."),
                    note("Cocher l'objectif qu'une activité sert, c'est vérifier qu'aucun objectif ne reste sans moyen."),
                    geste("Touche « Activité » dans la palette « Nœuds »", function () { return duType('activite').length > 0; }),
                    geste("Donne-lui un titre", function () { return !!duType('activite').find(texte); }),
                    geste("Glisse le bloc dans ta leçon par sa poignée ⠿", function () { return dansLaLecon(activiteNeuve()); }),
                    geste("Touche deux fois cette poignée (l'Inspecteur s'ouvre)", function () { return inspecteurOuvertSur(activiteNeuve()); }),
                    consigne("Dans l'Inspecteur, coche l'objectif que ton activité sert", function () { return !!blocQuiSert(); }),
                    note("Pour aller plus loin, « Activités », dans la frise, ouvre le guide à la page qui en parle.")
                ];
            },
            avant: async function () {
                await allerALaCarte();
                await amenerLeBloc(laLecon);
                poserExtras(function () {
                    var act = enfantsDe(laLecon()).find(function (n) { return n.type === 'activite'; });
                    if (!act) return [];
                    return inspecteurOuvertSur(act) ? [].slice.call(document.querySelectorAll('#planif-panneau .planif-objectifs-servis input[type="checkbox"]'))
                        : [bloc(act) && bloc(act).querySelector('.planif-noeud-prise')];
                });
            },
            zones: function () {
                var act = duType('activite').pop();
                if (!act) return [boutonPalette('activite')];
                return aLaisserLibre([bloc(act)].concat(act.parent ? [] : partiesDe(laLecon(), ['zone'])), act);
            },
            contour: function () {
                var libres = duType('activite').filter(function (n) { return !n.parent; });
                if (!duType('activite').length) return boutonPalette('activite');
                return libres.length ? partiesDe(laLecon(), ['zone'])[0] || null : null;
            },
            atteint: function () { return !!blocQuiSert(); }
        },
        {
            titre: 'Ton évaluation',
            confirme: confirmation(5, "C'est fait : ton activité sert ton objectif."),
            secondeForme: function () { return varianteRendue; },
            lignes: function () {
                if (varianteRendue) return [note(TEXTE_6_APRES), consigne(GESTE_6_APRES, function () { var ev = evaluationNeuve(); return !!ev && pastille(ev) === 'avant'; })];
                return [
                    note("La pastille « ⚠ » de ton objectif dit qu'il est servi, mais qu'aucune évaluation ne le vérifie encore."),
                    note("Formative ou certificative, l'évaluation ferme la boucle : elle vérifie ce que tu as enseigné, au niveau que tu as visé, ni plus, ni moins."),
                    note("Elle vient après l'activité : sous elle dans la même leçon, ou dans une leçon plus tard, la carte comparant alors les semaines et les séances. Ici, elle se place sous ton activité."),
                    note("Une fois ta production choisie, ta carte sait quelle production vérifie cet objectif, et ce qu'elle pèse dans ta note."),
                    geste("Touche « Évaluation » dans la palette « Nœuds »", function () { return duType('evaluation').length > 0; }),
                    geste("Donne-lui un titre", function () { return !!duType('evaluation').find(texte); }),
                    geste("Glisse le bloc dans ta leçon par sa poignée ⠿, sous ton activité", function () { return dansLaLecon(evaluationNeuve()); }),
                    geste("Touche deux fois cette poignée (l'Inspecteur s'ouvre)", function () { return inspecteurOuvertSur(evaluationNeuve()); }),
                    geste("Dans l'Inspecteur, coche l'objectif que ton évaluation vérifie", function () { var ev = evaluationNeuve(); return !!ev && C().objectifsVerifiesPar(ev).length > 0; }),
                    consigne("Choisis dans « Production » celle que tu as décrite", function () { return !!evaluationAlignee(); }),
                    note("Dans son en-tête, « Formative » ou « Certificative » dit sa visée : ton plan de cours le précisera."),
                    note("Pour aller plus loin, « Évaluations », dans la frise, ouvre le guide à la page qui en parle.")
                ];
            },
            avant: async function () {
                varianteRendue = !!evaluationApres() && !evaluationAlignee();
                await allerALaCarte();
                await amenerLeBloc(laLecon);
                poserExtras(function () {
                    var ev = enfantsDe(laLecon()).find(function (n) { return n.type === 'evaluation'; });
                    if (!ev) return [];
                    if (!inspecteurOuvertSur(ev)) return [bloc(ev) && bloc(ev).querySelector('.planif-noeud-prise')];
                    return [].slice.call(document.querySelectorAll('#planif-panneau .planif-objectifs-servis input[type="checkbox"]')).concat([el('planif-panneau-production')]);
                });
            },
            zones: function () {
                var ev = duType('evaluation').pop();
                if (!ev) return [boutonPalette('evaluation')];
                if (!ev.parent) return [bloc(ev)].concat(partiesDe(laLecon(), ['zone']));
                // La variante ⚠ se joue sur le canevas (glisser l'évaluation sous l'activité), même l'Inspecteur ouvert.
                if (varianteRendue) return [bloc(ev)].concat(enfantsDe(laLecon()).filter(function (n) { return n.type === 'activite'; }).map(bloc)).filter(Boolean);
                return aLaisserLibre([bloc(ev)], ev);
            },
            contour: function () {
                if (!duType('evaluation').length) return boutonPalette('evaluation');
                var libres = duType('evaluation').filter(function (n) { return !n.parent; });
                return libres.length ? partiesDe(laLecon(), ['zone'])[0] || null : null;
            },
            atteint: function () {
                if (evaluationAlignee()) return true;
                var variante = !!evaluationApres();
                if (variante !== varianteRendue) M().allerA(5);   // la seconde forme, ou le retour à la première
                return false;
            }
        },
        {
            titre: 'Raffiner, si tu veux',
            confirme: confirmation(6, "C'est fait : ton évaluation vérifie ton objectif."),
            lignes: function () {
                return [
                    note("Les pastilles ont changé : celle de ton évaluation affiche « ✓ », parce que l'objectif qu'elle vérifie a été enseigné avant ; celle de ton objectif aussi, puisqu'il est servi et vérifié. Le « ⚠ » de ta compétence a disparu."),
                    note("Ta carte est alignée quand chaque objectif est servi et vérifié, et que chaque évaluation ne vérifie que des objectifs déjà enseignés."),
                    note("Tu peux t'arrêter là : ta carte dit déjà ce que ta production vérifie, et quand tu l'enseignes."),
                    note("Tu peux aussi la raffiner, à ton rythme :"),
                    note("tes autres leçons, chacune avec ses objectifs"),
                    note("les connaissances que tes activités font acquérir"),
                    note("le niveau cognitif de chaque bloc, dans l'Inspecteur, pour que tes activités et tes évaluations visent le même niveau d'exigence"),
                    note("ta démarche, comme l'enseignement explicite, si c'est la tienne"),
                    note("le « Planificateur », qui montre toutes tes leçons semaine par semaine ; y glisser une leçon change sa semaine, et donc ses dates"),
                    note("Dans « Actions », « Exporter le plan… » en tire ton plan de cours, et « Télécharger un modèle… » te permet de faire relire ta carte par l'IA de ton choix, sans qu'elle soit modifiée."),
                    note("Dans « Consulter la bibliothèque », « Garder dans ma bibliothèque » la reprend d'un trimestre à l'autre, et « Exporter » en fait un fichier que tes collègues peuvent importer."),
                    // « Objectif atteint : … », « Pour revoir une étape… » et la phrase de la suite : posés par le moteur.
                    // Quand la bulle offre aussi « Parcours suivant », le moteur dit les deux suites (sa consigne de la fin).
                    consigne("Touche « Terminer »")
                ];
            },
            centre: true,
            sansSortie: true,
            avant: async function () { retirerExtras(); },
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    // Aucune étape n'avance pendant une saisie dans la carte (`enSaisie`) : elle avance quand on quitte le champ.
    ETAPES.forEach(function (e) {
        if (!e.atteint) return;
        var atteint = e.atteint;
        e.atteint = function () { return !enSaisie() && atteint(); };
    });

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard', objectif: OBJECTIF, objectifAtteint: OBJECTIF_ATTEINT };

    // ---------- La condition, le lancement, la fin ----------

    function condition() {
        if (enDemo()) return null;   // lue sur les vraies données, au lancement, une fois la démo refermée
        var prods = typeof obtenirDonneesSelonMode === 'function' ? (obtenirDonneesSelonMode('productions') || []) : [];
        // Celles que le menu « Production » de l'Inspecteur propose (`chargerProductions` : `dansBibliotheque !== false`) :
        // une production retirée de la bibliothèque laisserait entrer dans un parcours bloqué à l'étape 6.
        return prods.some(function (p) { return p && p.id && p.dansBibliotheque !== false; }) ? null : REFUS;
    }

    async function lancer(depuis) {
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        if (enDemo()) return;
        if (condition()) {
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-parcours-bouton');
                if (b) b.click();
            }
            return;
        }
        // « Reprendre » relit la leçon retenue ; « Commencer » et « Refaire » repartent de la première étape.
        var reprise = window.Assistance.etatDe(ID).etat === 'en-cours';
        if (!reprise) { depuis = 0; majCtx({ leconId: null, noeudsAvant: idsDeLaCarteActive() }); }
        debutDuPassage = depuis || 0;   // la confirmation ne dit que ce qui a été fait pendant ce passage
        window.Assistance.definirEtat(ID, 'en-cours', depuis);
        var lance = M().lancer(DEF, {
            depuis: depuis,
            surEtape: function (i) { retirerExtras(); window.Assistance.definirEtat(ID, 'en-cours', i); },
            surQuitter: nettoyer,
            surEchap: function () { terminer(); },
            verifier: function () { return !enDemo(); }
        });
        inspecteurDevant(true);
        veiller();
        return lance;
    }

    function terminer() {
        nettoyer();
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Monter ton cours',
        ligne: 'De la compétence à ta production : un outil facultatif qui garde pour toi les liens entre ce que tu enseignes et ce que tu évalues.',
        total: ETAPES.length,
        // Pas sur téléphone (file de Cowork, 9 nov. : à la fusion du groupe 3, avec la bulle sur téléphone).
        grandEcranSeulement: true,
        refus: condition,
        prealable: 'evaluer',
        lancer: lancer
    });

    // Pour les bancs : la condition, le repère, les étapes et la variante, lus sans lancer le parcours.
    window.ParcoursCours = {
        refus: condition,
        contexte: lireCtx,
        etapes: function () { return ETAPES; },
        definition: function () { return DEF; },
        texteVariante: TEXTE_6_APRES,
        gesteVariante: GESTE_6_APRES
    };
})();
