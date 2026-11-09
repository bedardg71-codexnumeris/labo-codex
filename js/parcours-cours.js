/* =================================================================
   LE PARCOURS « MONTER TON COURS » (cinquième parcours, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md.

   La carte d'alignement (Conception › Alignement), par le plus court chemin qui montre sa puissance :
   la compétence, une idée maîtresse, une leçon, son objectif, une activité qui le sert, une évaluation qui
   le vérifie avec la production du troisième parcours, sa pastille à ✓ ; puis les pistes pour raffiner.
   Il ne démarre jamais de lui-même ; il ne crée ni ne renomme aucune carte, et n'écrit rien dans la
   carte que la personne ne fasse elle-même.

   ⚠ Les textes sont ceux que Grégoire a validés le 8 nov. (10 h 25 à 10 h 49), avec les corrections du
   9 nov. (10 h 01 à 10 h 04 : étapes 2, 3, 5 et 6), posés mot pour mot :
   tests/unit/sentinelle-parcours-cours-2026-11-09.test.js les confronte à la consigne.

   · Une étape avance sur l'état de la CARTE (`planificationCarte.etat`), jamais au toucher d'un bouton :
     un énoncé de compétence, une idée maîtresse reliée (« se décline en »), une leçon datée et reliée
     (« se concrétise dans »), un objectif, un bloc qui le sert, une évaluation avec sa production et sa
     pastille à ✓. Une évaluation qui vérifie l'objectif mais dont la pastille dit ⚠ (posée avant
     l'activité) reçoit la variante de l'étape 6.
   · La carte est un canevas qui se déplace et se zoome : contours et bulle suivent les blocs ; le bloc visé
     par une étape est amené au milieu du canevas libre s'il n'y est pas entier (`amenerLeBloc`).
   · Pas de voile : tout le canevas se touche (créer, écrire, tirer un lien, glisser un bloc).
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

    function duType(type) { return noeuds().filter(function (n) { return n && n.type === type; }); }

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
        return (id && c && c.etat.noeuds.get(id)) || duType('lecon')[0] || null;
    }

    function objectifs(lecon) {
        return (C().objectifsDeLecon(lecon) || []).filter(function (o) { return String(o.texte || '').trim(); });
    }

    function enfantsDe(lecon) {
        var c = C();
        return lecon ? (lecon.enfants || []).map(function (id) { return c.etat.noeuds.get(id); }).filter(Boolean) : [];
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
        var cibles = M().actif() ? (ciblesExtras() || []).filter(vis) : [];
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

    var veilleTimer = null;
    function nettoyer() {
        retirerExtras();
        inspecteurDevant(false);
        if (veilleTimer) clearInterval(veilleTimer);
        veilleTimer = null;
    }
    function veiller() {
        if (veilleTimer) clearInterval(veilleTimer);
        veilleTimer = setInterval(function () { if (!estLeNotre()) nettoyer(); }, 400);
    }

    async function allerALaCarte() {
        if (!vis(el('conception-carte')) && typeof naviguerVers === 'function') naviguerVers('conception', 'carte');
        await attendre(function () { return vis(el('conception-carte')) && vis(el('planif-palette')); }, 3000);
    }

    // ---------- Les étapes ----------

    var TEXTE_6 = "L'évaluation ferme la boucle : elle vérifie ce que tu as enseigné, au niveau que tu as visé, ni plus, ni moins. Touche « Évaluation » dans la palette, donne-lui un titre, puis glisse le bloc par sa poignée ⠿ dans ta leçon, sous ton activité : dans une leçon, l'ordre des blocs dit ce qui vient avant. Touche deux fois cette poignée. Dans l'Inspecteur, coche l'objectif qu'il vérifie, puis choisis dans « Production » celle que tu as décrite : ta carte sait maintenant quelle production vérifie cet objectif, et ce qu'elle pèse dans ta note. Regarde les pastilles : celle de ton évaluation passe à « ✓ », parce que l'objectif qu'elle vérifie a été enseigné avant ; celle de ton objectif aussi, puisqu'il est servi et vérifié. Le « ⚠ » de ta compétence disparaît. Ta carte est alignée quand chaque objectif est servi et vérifié, et que chaque évaluation ne vérifie que des objectifs déjà enseignés. Pour aller plus loin, touche « Évaluations » dans la frise : le guide s'ouvre à la page qui en parle.";
    var TEXTE_6_APRES = "Ta pastille affiche « ⚠ » : dans ta leçon, l'évaluation vient avant l'activité qui enseigne son objectif. Glisse-la sous l'activité.";

    // La variante de l'étape 6 a son propre texte : le moteur rend la bulle une fois par étape ; quand l'état de la
    // pastille change, la même étape est rendue de nouveau (`allerA`, comme la bulle du choix du troisième parcours).
    var varianteRendue = false;

    var ETAPES = [
        {
            titre: 'Ta compétence',
            texte: "La carte d'alignement n'est pas une tâche de plus : c'est un outil pour monter ton cours, et tu peux utiliser l'application sans elle. Elle montre comment tes leçons et tes productions mènent à la compétence de ton cours, et donc sur quoi repose la note que tu construis. Elle garde ces liens pour toi et signale ceux qui manquent : tu n'as plus à tout tenir en tête. Son principe : tu évalues ce que tu enseignes, et tu enseignes ce que tu évalues, au même niveau d'exigence. Commence par la compétence que ton cours doit développer : touche « Compétence » dans la palette « Nœuds », puis écris son énoncé, tel que le devis ministériel décrit la compétence et ses éléments. Tout le reste de ta carte s'y rattachera.",
            voile: 'aucun',
            avant: allerALaCarte,
            zones: function () { return [boutonPalette('competence')]; },
            contour: function () { var c = duType('competence')[0]; return c ? bloc(c) : boutonPalette('competence'); },
            atteint: function () { return !!competence(); }
        },
        {
            titre: 'Ton idée maîtresse',
            texte: "Une idée maîtresse, c'est l'essentiel : ce qui restera quand l'étudiant·e aura oublié les détails, et autour de quoi tu organises ton contenu. Chaque compétence se décline en une ou plusieurs idées maîtresses. Touche « Idée maîtresse » dans la palette, puis écris-la. Relie-la ensuite à ta compétence : depuis l'un des petits cercles au bord de la compétence, tire un trait jusqu'à l'idée maîtresse. Le lien « se décline en » s'affiche. C'est par tes idées maîtresses que tes leçons se rattacheront à ta compétence. Une seule suffit pour l'instant. Pour aller plus loin, touche « Idées maîtresses » dans la frise, au-dessus de la carte : le guide s'ouvre à la page qui en parle.",
            voile: 'aucun',
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
            texte: "Tes leçons structurent ton cours dans le temps : chacune porte sa semaine et sa séance. Touche « Leçon » dans la palette et donne-lui un titre. Dans son en-tête, choisis sa semaine (S1, S2…), puis sa séance dans la semaine (A pour la première rencontre, B pour la deuxième). Relie-la ensuite à ton idée maîtresse : tire un trait de l'idée maîtresse jusqu'à la leçon. Le lien « se concrétise dans » apparaît : c'est ce lien qui fait remonter tes objectifs et tes évaluations jusqu'à la compétence. Touche deux fois la leçon : l'Inspecteur affiche sa date. Si tu n'as pas encore ajouté tes journées sans cours et tes semaines spéciales dans Cadre › Trimestre, fais-le : sans elles, la date peut tomber à côté. Avec sa date, ta leçon apparaîtra aussi dans le profil d'un·e étudiant·e absent·e ce jour-là : tu sauras quelle matière il ou elle a manquée. Pour aller plus loin, touche « Leçons » dans la frise : le guide s'ouvre à la page qui en parle.",
            voile: 'aucun',
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
            texte: "L'objectif de leçon est la boussole : c'est lui qui dit ce que l'étudiant·e saura faire à la fin, et c'est par rapport à lui que se choisissent les connaissances, les activités et l'évaluation. Touche le badge 🎯 dans l'en-tête de ta leçon : la zone des objectifs se déplie. Écris ton objectif en commençant par un verbe ; l'invite « Sera en mesure de… » t'y aide. Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, reprends-le ici. Le verbe que tu choisis, tes activités devront le faire exercer et tes évaluations devront l'exiger. Une pastille « ! » apparaît à côté : aucun bloc ne sert encore cet objectif. Elle changera à mesure que tu le relieras. Pour aller plus loin, touche « Objectifs » dans la frise : le guide s'ouvre à la page qui en parle.",
            voile: 'aucun',
            avant: async function () { retirerExtras(); await allerALaCarte(); await amenerLeBloc(laLecon); },
            zones: function () { return partiesDe(laLecon(), ['entete', 'objectifs', 'titre']); },
            contour: function () { var b = bloc(laLecon()); return b ? b.querySelector('.planif-badge-objectif') : null; },
            atteint: function () { return objectifs(laLecon()).length > 0; }
        },
        {
            titre: 'Ton activité',
            texte: "Le type d'activité dépend de ce que tu vises : un exercice de mémorisation ne développe pas la même chose qu'une analyse de cas. Touche « Activité » dans la palette, donne-lui un titre, puis glisse le bloc dans ta leçon par sa poignée ⠿. Touche deux fois cette poignée : dans l'Inspecteur, coche l'objectif qu'il sert. C'est ainsi que tu vérifies qu'aucun objectif ne reste sans moyen. La pastille de ton objectif passe à « ⚠ » : il est servi, mais aucune évaluation ne le vérifie encore. Pour aller plus loin, touche « Activités » dans la frise : le guide s'ouvre à la page qui en parle.",
            voile: 'aucun',
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
            get texte() { return varianteRendue ? TEXTE_6_APRES : TEXTE_6; },
            voile: 'aucun',
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
                if (variante !== varianteRendue) M().allerA(5);   // la variante, ou le retour au texte de l'étape
                return false;
            }
        },
        {
            titre: 'Raffiner, si tu veux',
            texte: "Te voilà avec une première chaîne alignée, de la compétence à ta production. Tu peux t'arrêter là : ta carte dit déjà ce que ta production vérifie, et quand tu l'enseignes. Tu peux aussi la raffiner autant que tu le veux. Quelques pistes, à ton rythme : tes autres leçons, chacune avec ses objectifs ; les connaissances que tes activités font acquérir ; le niveau cognitif de chaque bloc, dans l'Inspecteur, pour que tes activités et tes évaluations visent le même niveau d'exigence ; ta démarche, comme l'enseignement explicite, si c'est la tienne ; le « Planificateur », qui place tes leçons sur les semaines du trimestre. Dans « Actions », « Exporter le plan… » en tire ton plan de cours, et « Télécharger un modèle… » te permet de faire relire ta carte par l'IA de ton choix, sans qu'elle soit modifiée. Dans « Consulter la bibliothèque », « Garder dans ma bibliothèque » la reprend d'un trimestre à l'autre, et « Exporter » en fait un fichier que tes collègues peuvent importer. Le guide t'accompagne à chaque pas.",
            voile: 'aucun',
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

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard' };

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
        if (!reprise) { depuis = 0; majCtx({ leconId: null }); }
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
        condition: condition,
        lancer: lancer
    });

    // Pour les bancs : la condition, le repère, les étapes et la variante, lus sans lancer le parcours.
    window.ParcoursCours = {
        condition: condition,
        contexte: lireCtx,
        etapes: function () { return ETAPES; },
        texteVariante: TEXTE_6_APRES
    };
})();
