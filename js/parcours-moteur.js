/* =================================================================
   LE MOTEUR DES PARCOURS — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, « Le principe, pour les deux ».

   Un parcours n'est pas une visite : la personne fait le geste elle-même sur ce qui est
   désigné. Le moteur pose (lot « Les flèches des parcours », 10 nov. 2026,
   plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md ; le voile percé de trous est retiré,
   la page reste lisible et touchable partout) :
   · une flèche manuscrite, à l'encre du texte, de la bulle vers ce dont elle parle (les zones) ;
   · une pulsation dans l'orange de l'aide autour de ce qu'il faut toucher (le contour) : dans un
     parcours, l'orange veut dire « ce que tu toucheras » ;
   · une mise en évidence de la section actuelle, dans le menu ou la barre d'onglets du contour ;
   · une bulle près de ce dont elle parle, sans couvrir le contour : titre, « n sur N », poignée
     pour la déplacer, texte, geste, boutons, lien de sortie. Elle prend le focus et s'annonce
     (aria-live poli).
   LES COORDONNÉES : la couche des flèches est fixée en (0, 0) et dimensionnée en px sur
   innerWidth × innerHeight à chaque passage, SANS viewBox : le même repère que le contour (des px
   lus par getBoundingClientRect). Une sentinelle Vitest l'exige (le voile, lui, était en 100vh).
   Une étape avance quand l'état attendu est ATTEINT (`atteint()`), quel que soit le chemin :
   le moteur le sonde, il n'écoute pas le toucher d'un bouton précis.

   Une étape :
     { titre, texte, geste?, centre?: bool,
       avant?: async () => void,   // place la page (idempotent : sert aussi à la reprise)
       zones?: () => Element[],    // ce dont parle la bulle (la flèche y va)
       contour?: () => Element,    // où toucher (la pulsation)
       atteint?: () => bool,       // l'état qui fait avancer
       boutons?: [{ libelle, primaire?, action }],
       sansSortie?: bool }
   API : window.ParcoursMoteur.lancer(def, { depuis, surEtape, surQuitter, surEchap, verifier }),
         .fermer(), .actif(), .etapeCourante(), .joue(def), .surTelephone().

   LA BULLE SUR TÉLÉPHONE (lot du 9 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-bulle-sur-telephone.md) :
   · jusqu'à 500 px de large (SEUIL_TELEPHONE, la largeur de la fenêtre et non l'appareil : un iPad
     en écran partagé étroit est traité comme un téléphone), la bulle se range au bord de l'écran,
     pleine largeur. Une étape qui désigne quoi toucher sur la page (un contour) l'ouvre REPLIÉE
     (titre et « n sur N ») ; une étape dont le geste est dans la bulle (« Continuer ») ou sans
     rien d'éclairé l'ouvre dépliée. La tête de la bulle est un bouton :
     un toucher déplie, un toucher replie ; repliée, toute la bulle est ce bouton.
   · Repliée ou dépliée, elle ne couvre pas la zone éclairée : en bas par défaut (au début d'une
     étape et à chaque dépliement, le moteur fait défiler la page s'il le faut, pendant REGLAGE_MS
     et jusqu'au premier geste de la personne) ; en haut si la zone occupe le bas ; si la zone prend
     tout l'écran, elle en couvre une partie, au mieux sans toucher au contour, et son texte défile.
   · Le témoin « Enregistré » (en bas à gauche) passe au-dessus d'une bulle rangée en bas
     (--parcours-reserve-bas, lue par css/parcours.css).
   LE FILET DE TOUTES LES BULLES (ajout du 9 nov., 9 h 51) : à toutes les largeurs, une bulle plus
   haute que l'espace disponible (fenêtre courte, clavier ouvert) s'y limite ; seul son texte
   défile, le titre, « n sur N », le geste et les boutons restent visibles. Une bulle qui tient
   reste telle quelle.
   LES BULLES EN PAGES (lot du 9 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-bulles-en-pages.md) :
   · un texte de plus de LIGNES_PAR_PAGE lignes, à la largeur de la bulle, se coupe en deux pages (trois
     au plus si une page dépasse encore), à la fin d'une phrase hors d'une citation entre guillemets, au
     plus près du milieu. Aucun mot ne change ; sans fin de phrase où couper, le texte reste entier.
   · Sous le texte, « ← 1/3 → » (décision de Grégoire, 9 nov., 17 h 55 : la tête ne garde que « n sur N ») ;
     au clavier, les flèches gauche et droite quand la bulle a le focus. Au changement de page, le lecteur
     d'écran entend « page 2 de 3 », sans le texte de l'étape.
   · Toutes les pages restent dans le texte de la bulle, dans l'ordre : celles qu'on ne voit pas sont
     cachées à l'œil (u-lecteur-ecran), pas au lecteur d'écran ; l'annonce dit le texte entier.
   · La ligne du geste, les boutons et le lien de sortie ne bougent pas ; l'étape avance sur l'état
     atteint, quelle que soit la page. Le filet (le texte qui défile) reste le dernier recours.
   · La découpe suit la largeur de la bulle : un parcours qui la change (une sonde d'étape) la refait
     dans le même passage de la sonde, la page affichée gardée si elle existe encore.
   ================================================================= */
(function () {
    'use strict';

    var SONDE_MS = 120;
    var MARGE = 8;
    var ECART = 12;
    var ECART_FLECHE = 32;     // entre la bulle et ce dont elle parle, quand la place y est : la longueur d'une flèche
    var FLECHE_MIN = 24;       // en deçà, une flèche ne se lit pas : elle n'est pas tracée
    var FLECHE_RETRAIT = 6;    // la pointe s'arrête à quelques px du bord de la cible
    var FLECHES_MAX = 3;       // au-delà de trois cibles, une seule flèche vers leur union
    var PAS_CLAVIER = 16;      // un pas de la poignée, au clavier
    var SEUIL_TELEPHONE = 500; // px de large de la fenêtre : en deçà, la bulle prend sa forme de téléphone
    var REGLAGE_MS = 1200;     // sur téléphone, le temps où le moteur peut faire défiler pour ranger la bulle en bas
    var LIGNES_PAR_PAGE = 10;  // au-delà, à la largeur de la bulle, le texte se coupe en pages
    var PAGES_MAX = 3;

    // PROPOSÉ (10 nov. 2026, à valider par Grégoire) : le nom de la poignée pour le lecteur d'écran.
    var LIBELLE_POIGNEE = 'Déplacer la bulle';

    var etat = null; // { def, i, opts, timer, elements, enTransition }

    function visible(el) {
        if (!el || !el.isConnected) return false;
        var r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        var s = getComputedStyle(el);
        return s.visibility !== 'hidden' && s.display !== 'none';
    }

    function premierVisible(liste) {
        for (var k = 0; k < liste.length; k++) {
            var el = typeof liste[k] === 'string' ? document.querySelector(liste[k]) : liste[k];
            if (visible(el)) return el;
        }
        return null;
    }

    function mouvementReduit() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function rectsDe(els) {
        return (els || []).filter(visible).map(function (el) { return el.getBoundingClientRect(); });
    }

    function union(rects) {
        if (!rects.length) return null;
        var u = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        rects.forEach(function (r) {
            u.left = Math.min(u.left, r.left); u.top = Math.min(u.top, r.top);
            u.right = Math.max(u.right, r.right); u.bottom = Math.max(u.bottom, r.bottom);
        });
        u.width = u.right - u.left; u.height = u.bottom - u.top;
        return u;
    }

    /** La hauteur de l'en-tête collant : ce qui est dessous est caché par lui. */
    function hautEntete() {
        var e = document.querySelector('header.entete');
        if (!e) return 0;
        var r = e.getBoundingClientRect();
        return r.bottom > 0 ? r.bottom : 0;
    }

    /** La largeur du téléphone : la fenêtre, pas l'appareil (l'iPad en écran partagé étroit en est). */
    function surTelephone() {
        return window.innerWidth <= SEUIL_TELEPHONE;
    }

    /**
     * Le bas visible : au-dessus du clavier à l'écran quand il est ouvert (même mesure que le témoin
     * « Enregistré », js/temoin-enregistrement.js ; ignorée sous un zoom au pincement).
     */
    function basVisible() {
        var vv = window.visualViewport;
        if (!vv || Math.abs(vv.scale - 1) > 0.01) return window.innerHeight;
        return Math.min(window.innerHeight, Math.round(vv.offsetTop + vv.height));
    }

    /** Le bas utile de l'écran : au-dessus du bandeau de la démo, fixé en bas, quand il est là. */
    function basEcran() {
        var bas = basVisible();
        var b = document.getElementById('bandeau-demo');
        if (b && visible(b)) return Math.min(bas, b.getBoundingClientRect().top);
        return bas;
    }

    /**
     * Amène les éléments dans la vue, sous l'en-tête, en laissant la place de la bulle
     * dessous quand c'est possible : leur union est alors posée juste sous l'en-tête.
     * Si elle ne tient pas avec la bulle, elle est posée seule ; si elle ne tient pas
     * du tout, c'est le premier élément qui est amené.
     */
    function amenerDansLaVue(els, hauteurBulle) {
        var rs = rectsDe(els);
        if (!rs.length) return;
        var u = union(rs);
        var haut = hautEntete() + 16;
        var bas = basEcran() - 16;
        var dispo = bas - haut;
        var avecBulle = u.height + ECART + (hauteurBulle || 0) <= dispo;
        var dejaBien = u.top >= haut && (avecBulle ? u.bottom + ECART + hauteurBulle <= bas : u.bottom <= bas);
        if (dejaBien) return;
        var cible = u.height <= dispo ? u.top : rs[0].top;
        window.scrollTo({ top: Math.max(0, window.scrollY + cible - haut), behavior: 'auto' });
    }

    // ---------- Les éléments du moteur ----------

    function creerElements() {
        var ns = 'http://www.w3.org/2000/svg';
        // La couche des flèches : jamais de viewBox (voir « LES COORDONNÉES », en tête).
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'parcours-fleches');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('id', 'parcours-fleches');

        var contour = document.createElement('div');
        contour.className = 'parcours-contour';
        contour.id = 'parcours-contour';
        contour.hidden = true;

        var bulle = document.createElement('div');
        bulle.className = 'parcours-bulle';
        bulle.id = 'parcours-bulle';
        bulle.setAttribute('role', 'dialog');
        bulle.setAttribute('aria-modal', 'false');
        bulle.setAttribute('aria-labelledby', 'parcours-bulle-titre');
        bulle.tabIndex = -1;
        bulle.addEventListener('keydown', surToucheBulle);

        var annonce = document.createElement('div');
        annonce.className = 'u-lecteur-ecran';
        annonce.id = 'parcours-annonce';
        annonce.setAttribute('aria-live', 'polite');

        document.body.appendChild(svg);
        document.body.appendChild(contour);
        document.body.appendChild(bulle);
        document.body.appendChild(annonce);
        return { svg: svg, contour: contour, bulle: bulle, annonce: annonce };
    }

    function retirerElements() {
        ['parcours-fleches', 'parcours-contour', 'parcours-bulle', 'parcours-annonce'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }

    // ---------- Les pages d'une bulle ----------

    /**
     * Les positions où le texte peut se couper : juste après une fin de phrase (. ! ? …) suivie d'une
     * espace et d'une majuscule (ou d'un guillemet, d'un chiffre), hors d'une citation « … ». Pure.
     * @returns {number[]} les index de coupe (la page suivante commence après l'espace)
     */
    function coupuresPossibles(texte) {
        var res = [];
        var profondeur = 0;
        for (var i = 0; i < texte.length; i++) {
            var c = texte.charAt(i);
            if (c === '«') profondeur++;
            else if (c === '»') profondeur = Math.max(0, profondeur - 1);
            else if (profondeur === 0 && '.!?…'.indexOf(c) !== -1 && texte.charAt(i + 1) === ' '
                && /[A-ZÀ-ÖØ-ÞŒ«0-9]/.test(texte.charAt(i + 2))) res.push(i + 1);
        }
        return res;
        // Limite connue (relecture du 9 nov.) : une abréviation suivie d'une majuscule ou d'un chiffre
        // (« M. Untel », « p. 12 », « chap. 3 ») passe pour une fin de phrase, et une phrase entre
        // parenthèses n'est pas protégée. Aucun texte de parcours n'en a ; à reprendre si l'un en a.
    }

    /**
     * Le texte en `n` pages, chaque coupe à la fin de phrase la plus proche de j × longueur / n (au plus
     * près du milieu pour deux pages). Rend null si les fins de phrase ne suffisent pas. Pure.
     */
    function partager(texte, coupes, n) {
        var choisies = [];
        var avant = 0;
        for (var j = 1; j < n; j++) {
            var cible = j * texte.length / n;
            var restantes = n - 1 - j; // les coupes qu'il faudra encore après celle-ci
            var candidates = coupes.filter(function (c) { return c > avant; });
            if (candidates.length <= restantes) return null;
            candidates = candidates.slice(0, candidates.length - restantes);
            var meilleure = candidates.reduce(function (m, c) { return Math.abs(c - cible) < Math.abs(m - cible) ? c : m; });
            choisies.push(meilleure);
            avant = meilleure;
        }
        var pages = [];
        var debut = 0;
        choisies.concat([texte.length]).forEach(function (fin) {
            pages.push(texte.slice(debut, fin).trim());
            debut = fin;
        });
        return pages;
    }

    /** Le nombre de lignes que `texte` prend dans `p`, à sa largeur. */
    function lignesDe(p, texte) {
        p.textContent = texte;
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        return Math.round(p.scrollHeight / ligne);
    }

    /**
     * Les pages du texte, à la largeur de `p` : une seule s'il tient en LIGNES_PAR_PAGE lignes. Sinon la
     * première découpe (deux pages, puis trois) dont chaque page tient ; à défaut, celle dont la plus haute
     * page est la plus basse, si elle épargne au moins un tiers des lignes (une découpe qui laisse une page
     * presque aussi longue que le tout coûterait une navigation sans épargner le défilement : le filet suffit).
     */
    function decouperEnPages(p, texte) {
        p.style.minHeight = '';
        p.style.flexBasis = '';
        var total = lignesDe(p, texte);
        if (total <= LIGNES_PAR_PAGE) return [texte];
        var coupes = coupuresPossibles(texte);
        var meilleure = null;
        for (var n = 2; n <= PAGES_MAX; n++) {
            var pages = partager(texte, coupes, n);
            if (!pages) break;
            var plusHaute = Math.max.apply(null, pages.map(function (pg) { return lignesDe(p, pg); }));
            if (!meilleure || plusHaute < meilleure.plusHaute) meilleure = { pages: pages, plusHaute: plusHaute };
            if (plusHaute <= LIGNES_PAR_PAGE) break;
        }
        if (!meilleure || (meilleure.plusHaute > LIGNES_PAR_PAGE && meilleure.plusHaute > total * 2 / 3)) return [texte];
        return meilleure.pages;
    }

    /**
     * Toutes les pages prennent la hauteur de la plus haute (sa base flex) : « ← » et « → » ne bougent pas
     * sous le doigt d'une page à l'autre. Sous la contrainte du filet, le texte se resserre encore.
     */
    function egaliserPages(p, pages) {
        p.style.flexBasis = '';
        if (pages.length < 2) return;
        var haute = 0;
        pages.forEach(function (pg) { p.textContent = pg; haute = Math.max(haute, p.scrollHeight); });
        p.style.flexBasis = haute + 'px';
    }

    /** Pose les pages dans le texte de la bulle : toutes, dans l'ordre ; celle qu'on lit est visible. */
    function ecrirePages(p, pages) {
        p.textContent = '';
        pages.forEach(function (pg, k) {
            if (k > 0) p.appendChild(document.createTextNode(' '));
            var span = document.createElement('span');
            span.className = 'parcours-bulle-page';
            span.dataset.page = String(k);
            span.textContent = pg;
            p.appendChild(span);
        });
    }

    /** Le plancher du filet : le texte se resserre, jamais sous trois lignes (ou sa hauteur). */
    function poserPlancher(p) {
        p.style.minHeight = '';
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        p.style.minHeight = Math.min(p.scrollHeight, Math.ceil(3 * ligne)) + 'px';
    }

    /** Montre la page `k` (bornée) : sa partie du texte, « k/n », les flèches. */
    function montrerPage(k) {
        var b = etat.elements.bulle;
        var n = etat.pages.length;
        etat.page = Math.max(0, Math.min(k, n - 1));
        var p = b.querySelector('.parcours-bulle-texte');
        if (p) {
            [].forEach.call(p.querySelectorAll('.parcours-bulle-page'), function (span) {
                span.classList.toggle('u-lecteur-ecran', Number(span.dataset.page) !== etat.page);
            });
            p.scrollTop = 0;
            poserPlancher(p);
        }
        var indice = b.querySelector('.parcours-bulle-pages');
        if (indice) indice.textContent = (etat.page + 1) + '/' + n;
        var prec = b.querySelector('.parcours-bulle-page-prec');
        var suiv = b.querySelector('.parcours-bulle-page-suiv');
        var avaitFocus = document.activeElement;
        if (prec) prec.disabled = etat.page === 0;
        if (suiv) suiv.disabled = etat.page === n - 1;
        // Un bouton devenu inactif perd le focus : il passe à l'autre flèche.
        if (avaitFocus && avaitFocus.disabled) {
            var autre = avaitFocus === prec ? suiv : prec;
            try { (autre && !autre.disabled ? autre : b).focus({ preventScroll: true }); } catch (e) { b.focus(); }
        }
    }

    /**
     * Change de page ; la bulle se replace à sa nouvelle hauteur. Le lecteur d'écran entend « page 2 de 3 »,
     * sans le texte de l'étape (déjà annoncé au rendu, et lisible en entier dans la bulle).
     */
    function changerPage(delta) {
        if (!etat || !etat.pages || etat.pages.length < 2) return false;
        var k = Math.max(0, Math.min(etat.page + delta, etat.pages.length - 1));
        if (k === etat.page) return false;
        montrerPage(k);
        etat.elements.annonce.textContent = 'page ' + (k + 1) + ' de ' + etat.pages.length;
        sonder();
        return true;
    }

    /**
     * Les flèches gauche et droite, quand la bulle (ou l'un de ses boutons) a le focus. Pas avec un
     * modificateur (Alt ou Cmd + ← : la page précédente du navigateur), ni la bulle repliée (rien ne
     * se verrait changer).
     */
    function surToucheBulle(ev) {
        if (!etat || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
        if (ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        if (etat.elements.bulle.classList.contains('est-repliee')) return;
        if (!etat.elements.bulle.contains(document.activeElement)) return;
        if (changerPage(ev.key === 'ArrowRight' ? 1 : -1)) ev.preventDefault();
    }

    /**
     * Découpe le texte de la bulle (lu une fois, au rendu de l'étape : `etat.texte`) à la largeur actuelle
     * et pose ses pages ; la page `garder` reste affichée si elle existe encore ; la largeur mesurée est
     * gardée (`largeurPages`).
     */
    function paginer(garder) {
        var b = etat.elements.bulle;
        var p = b.querySelector('.parcours-bulle-texte');
        if (!p) return;
        etat.largeurPages = p.offsetWidth;
        etat.pages = decouperEnPages(p, etat.texte);
        egaliserPages(p, etat.pages);
        ecrirePages(p, etat.pages);
        var plusieurs = etat.pages.length > 1;
        var nav = b.querySelector('.parcours-bulle-nav');
        if (nav) nav.hidden = !plusieurs;
        montrerPage(plusieurs ? (garder || 0) : 0);
    }

    /**
     * À chaque passage de la sonde : si la largeur du texte a changé (une sonde d'étape qui change la
     * forme de la bulle, une fenêtre redimensionnée), la découpe est refaite. Un texte caché (forme
     * réduite d'un parcours, bulle repliée) n'est pas mesuré.
     */
    function suivreLargeurDesPages() {
        var p = etat.elements.bulle.querySelector('.parcours-bulle-texte');
        if (!p || !p.offsetWidth || p.offsetWidth === etat.largeurPages) return false;
        paginer(etat.page);
        return true;
    }

    // ---------- Le rendu d'une étape ----------

    function etapeCourante() {
        return etat ? etat.def.etapes[etat.i] : null;
    }

    /** Sur téléphone : la classe de la bulle et l'état du bouton de la tête suivent `etat.replie`. */
    function appliquerRepli() {
        var b = etat.elements.bulle;
        b.classList.toggle('est-repliee', etat.telephone && etat.replie);
        var bascule = b.querySelector('.parcours-bulle-bascule');
        if (bascule) bascule.setAttribute('aria-expanded', etat.replie ? 'false' : 'true');
    }

    function basculerRepli() {
        if (!etat || !etat.telephone) return;
        etat.replie = !etat.replie;
        etat.reglerJusqua = Date.now() + REGLAGE_MS;
        appliquerRepli();
        if (!etat.replie) amenerDansLaVue(elementsVises(etapeCourante()), hauteurNaturelle());
        sonder();
    }

    /**
     * À l'intérieur des guillemets, une espace insécable : un guillemet ne passe jamais seul à la ligne (décision de
     * Cowork, 9 nov. 2026, 17 h 58 ; mesuré à 820 px : « Importer » se coupait avant son guillemet fermant). Pour toutes
     * les bulles, au rendu : les textes validés, et les sentinelles qui les lisent, gardent leurs espaces ordinaires.
     */
    function typographier(t) {
        return String(t == null ? '' : t).replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»');
    }

    function rendreBulle(opts) {
        var etape = etapeCourante();
        var b = etat.elements.bulle;
        var total = etat.def.etapes.length;
        b.textContent = '';
        etat.telephone = surTelephone();
        b.className = 'parcours-bulle' + (etat.telephone ? ' parcours-bulle--telephone' : '');
        b.style.maxHeight = '';
        // Sur téléphone, la largeur est posée AVANT de mesurer le texte (son plancher de trois lignes).
        b.style.left = etat.telephone ? MARGE + 'px' : b.style.left;
        b.style.right = etat.telephone ? MARGE + 'px' : '';

        var tete = document.createElement('div');
        tete.className = 'parcours-bulle-tete';
        var h = document.createElement('h2');
        h.className = 'parcours-bulle-titre';
        h.id = 'parcours-bulle-titre';
        h.textContent = typographier(etape.titre);
        var rang = document.createElement('span');
        rang.className = 'parcours-bulle-rang';
        rang.textContent = (etat.i + 1) + ' sur ' + total;
        tete.appendChild(h);
        tete.appendChild(rang);
        if (etat.telephone) {
            // Un bouton posé sur la tête (une tête de section ne va pas DANS un bouton) : son nom
            // est le titre, son état dit si la bulle est dépliée.
            var bascule = document.createElement('button');
            bascule.type = 'button';
            bascule.className = 'parcours-bulle-bascule';
            bascule.setAttribute('aria-labelledby', 'parcours-bulle-titre');
            bascule.addEventListener('click', basculerRepli);
            tete.appendChild(bascule);
        } else {
            // La poignée (hors téléphone) : glisser la bulle à la souris, au doigt, au stylet ; au clavier, les flèches.
            var poignee = document.createElement('button');
            poignee.type = 'button';
            poignee.className = 'parcours-bulle-poignee';
            poignee.textContent = '\u283f';
            poignee.setAttribute('aria-label', LIBELLE_POIGNEE);
            poignee.addEventListener('pointerdown', debutGlisser);
            poignee.addEventListener('pointermove', surGlisser);
            poignee.addEventListener('pointerup', finGlisser);
            poignee.addEventListener('pointercancel', finGlisser);
            poignee.addEventListener('keydown', surTouchePoignee);
            tete.appendChild(poignee);
        }
        etat.glisse = null;
        if (etat.telephone) etat.deplacee = null;
        b.appendChild(tete);

        var p = document.createElement('p');
        p.className = 'parcours-bulle-texte';
        b.appendChild(p);

        // Sous le texte, « ← 1/3 → » ; caché tant que le texte tient en une page. Le compteur est pour
        // l'œil : au changement de page, le lecteur d'écran entend « page 2 de 3 » (changerPage).
        var nav = document.createElement('div');
        nav.className = 'parcours-bulle-nav';
        nav.hidden = true;
        var fleche = function (classe, signe, nom, delta) {
            var f = document.createElement('button');
            f.type = 'button';
            f.className = 'parcours-bulle-fleche ' + classe;
            f.textContent = signe;
            f.setAttribute('aria-label', nom);
            f.addEventListener('click', function () { changerPage(delta); });
            return f;
        };
        var compteur = document.createElement('span');
        compteur.className = 'parcours-bulle-pages';
        compteur.setAttribute('aria-hidden', 'true');
        nav.appendChild(fleche('parcours-bulle-page-prec', '←', 'Page précédente', -1));
        nav.appendChild(compteur);
        nav.appendChild(fleche('parcours-bulle-page-suiv', '→', 'Page suivante', 1));
        b.appendChild(nav);

        // Les pages, à la largeur de la bulle (le filet : jamais sous trois lignes, posé par montrerPage).
        // Seule la forme change (le seuil du téléphone franchi) : la page affichée reste.
        // Les espaces insécables des guillemets (typographier) avant la découpe : les pages les gardent.
        etat.texte = typographier(etape.texte);
        paginer(opts && opts.sansAnnonce ? etat.page : 0);

        if (etape.geste) {
            var g = document.createElement('p');
            g.className = 'parcours-bulle-geste';
            g.textContent = typographier(etape.geste);
            b.appendChild(g);
        }

        if (etape.boutons && etape.boutons.length) {
            var zone = document.createElement('div');
            zone.className = 'parcours-bulle-boutons';
            etape.boutons.forEach(function (def) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn ' + (def.primaire ? 'btn-principal' : 'btn-secondaire');
                btn.textContent = def.libelle;
                btn.addEventListener('click', function () { def.action(api); });
                zone.appendChild(btn);
            });
            b.appendChild(zone);
        }

        if (!etape.sansSortie && etat.def.lienSortie) {
            var sortie = document.createElement('button');
            sortie.type = 'button';
            sortie.className = 'parcours-bulle-sortie';
            sortie.textContent = etat.def.lienSortie;
            sortie.addEventListener('click', quitter);
            b.appendChild(sortie);
        }

        // L'annonce : le titre et le texte, puis le geste. Vidée d'abord, pour qu'un même
        // texte soit relu s'il revient. Pas d'annonce quand seule la forme change (le seuil franchi).
        if (opts && opts.sansAnnonce) { appliquerRepli(); return; }
        var a = etat.elements.annonce;
        a.textContent = '';
        setTimeout(function () {
            if (!etat) return;
            a.textContent = etape.titre + '. ' + etape.texte + (etape.geste ? ' ' + etape.geste : '');
        }, 50);
        appliquerRepli();
    }

    /** La hauteur de la bulle si son texte ne défilait pas (le texte est la seule zone qui défile). */
    function hauteurNaturelle() {
        var b = etat.elements.bulle;
        var t = b.querySelector('.parcours-bulle-texte');
        var h = b.offsetHeight;
        if (t && !b.classList.contains('est-repliee')) h += Math.max(0, t.scrollHeight - t.clientHeight);
        return h;
    }

    // ---------- La géométrie des flèches et du déplacement : des fonctions pures (tests/unit) ----------

    /** Des cibles qui se touchent (à `pad` px près) n'en font qu'une : une seule flèche. Pure. */
    function fondreCibles(rects, pad) {
        var liste = rects.map(function (r) { return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
        var change = true;
        while (change) {
            change = false;
            for (var a = 0; a < liste.length && !change; a++) {
                for (var b = a + 1; b < liste.length && !change; b++) {
                    var A = liste[a], B = liste[b];
                    var touche = !(A.right + pad < B.left || B.right + pad < A.left ||
                                   A.bottom + pad < B.top || B.bottom + pad < A.top);
                    if (touche) {
                        liste[a] = { left: Math.min(A.left, B.left), top: Math.min(A.top, B.top),
                                     right: Math.max(A.right, B.right), bottom: Math.max(A.bottom, B.bottom) };
                        liste.splice(b, 1);
                        change = true;
                    }
                }
            }
        }
        return liste;
    }

    /** Les cibles des flèches : fondues quand elles se touchent ; au-delà de `max`, leur union seule. Pure. */
    function grouperCibles(rects, max) {
        var liste = fondreCibles(rects, FLECHE_RETRAIT);
        if (liste.length <= max) return liste;
        return [liste.reduce(function (u, r) {
            return { left: Math.min(u.left, r.left), top: Math.min(u.top, r.top),
                     right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) };
        })];
    }

    function borne(v, min, max) { return Math.min(Math.max(min, v), Math.max(min, max)); }
    function arrondi(v) { return Math.round(v * 10) / 10; }

    function dansRect(p, r) { return p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom; }

    /**
     * Une courbe de Bézier légèrement bombée de (sx, sy) à (ex, ey), raccourcie de `retrait` à l'arrivée, bombée du
     * côté `sens` (1 : à gauche du sens de la marche ; -1 : à droite), et sa pointe en deux traits ouverts. Null si
     * elle est trop courte pour se lire. `points` : neuf points de la courbe, pour savoir ce qu'elle croise. Pure.
     */
    function courbe(sx, sy, ex, ey, retrait, sens, ecran) {
        var vx = ex - sx, vy = ey - sy;
        var len = Math.sqrt(vx * vx + vy * vy);
        if (len - retrait < FLECHE_MIN) return null;
        var ux = vx / len, uy = vy / len;
        ex -= ux * retrait; ey -= uy * retrait; len -= retrait;
        var bombe = sens * Math.min(28, len * 0.18);
        // Le point de contrôle reste dans l'écran.
        var kx = borne((sx + ex) / 2 + uy * bombe, 4, ecran.largeur - 4);
        var ky = borne((sy + ey) / 2 - ux * bombe, 4, ecran.hauteur - 4);
        // La pointe : deux traits ouverts, de part et d'autre de la tangente à l'arrivée.
        var tx = ex - kx, ty = ey - ky;
        var tl = Math.sqrt(tx * tx + ty * ty) || 1;
        tx /= tl; ty /= tl;
        var aile = Math.min(12, len * 0.35), cos = Math.cos(0.5), sin = Math.sin(0.5);
        var ax = ex - aile * (tx * cos - ty * sin), ay = ey - aile * (ty * cos + tx * sin);
        var bx = ex - aile * (tx * cos + ty * sin), by = ey - aile * (ty * cos - tx * sin);
        var points = [];
        for (var n = 1; n <= 9; n++) {
            var t = n / 10, q = 1 - t;
            points.push({ x: q * q * sx + 2 * q * t * kx + t * t * ex, y: q * q * sy + 2 * q * t * ky + t * t * ey });
        }
        var d = 'M' + arrondi(sx) + ',' + arrondi(sy) + ' Q' + arrondi(kx) + ',' + arrondi(ky) + ' ' + arrondi(ex) + ',' + arrondi(ey) +
            ' M' + arrondi(ax) + ',' + arrondi(ay) + ' L' + arrondi(ex) + ',' + arrondi(ey) + ' L' + arrondi(bx) + ',' + arrondi(by);
        return { d: d, depart: { x: arrondi(sx), y: arrondi(sy) }, pointe: { x: arrondi(ex), y: arrondi(ey) },
                 controle: { x: arrondi(kx), y: arrondi(ky) }, points: points, longueur: len };
    }

    /**
     * La flèche, du bord de la bulle vers la cible. Pure et déterministe : les mêmes rectangles rendent le même tracé
     * (la sonde tourne toutes les 120 ms, la flèche ne frémit pas).
     *  · d'abord le plus court : du point de la bulle le plus proche de la cible au point de la cible le plus proche ;
     *  · la cible sortie de l'écran : la flèche va au bord de l'écran, du côté de la cible ;
     *  · la cible sous la bulle, ou trop près pour qu'une flèche se lise (FLECHE_MIN) : null ;
     *  · la pointe s'arrête à FLECHE_RETRAIT px du bord de la cible ; deux traits ouverts, pas de triangle ;
     *  · si ce tracé passe sur un obstacle (une autre cible, ce qu'il faut toucher), le bombement change de côté ;
     *    sinon la flèche arrive par un autre bord de la cible, par le chemin le plus court qui ne croise rien ; si
     *    tout croise, le plus court est gardé.
     * @param {{left,top,right,bottom}} bulle
     * @param {{left,top,right,bottom}} cible
     * @param {{largeur:number, hauteur:number}} ecran  innerWidth × innerHeight
     * @param {Array<{left,top,right,bottom}>} [obstacles]  ce que la flèche évite de croiser
     * @returns {null|{d:string, depart:{x,y}, pointe:{x,y}, controle:{x,y}, horsEcran:boolean}}
     */
    function tracerFleche(bulle, cible, ecran, obstacles) {
        var W = ecran.largeur, H = ecran.hauteur;
        obstacles = obstacles || [];
        var hors = cible.right <= 0 || cible.bottom <= 0 || cible.left >= W || cible.top >= H;
        var c = hors ? cible : { left: Math.max(0, cible.left), top: Math.max(0, cible.top),
                                 right: Math.min(W, cible.right), bottom: Math.min(H, cible.bottom) };
        var cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2;
        // Le départ : le point du bord de la bulle le plus proche du centre de la cible. Le centre de la cible sous la
        // bulle (elle est cachée) : le départ est ce centre, la flèche n'a pas de longueur, `courbe` rend null.
        var sx = borne(cx, bulle.left, bulle.right), sy = borne(cy, bulle.top, bulle.bottom);
        var finir = function (f) { f.horsEcran = hors; delete f.points; delete f.longueur; return f; };
        if (hors) {
            // Le bord de l'écran, du côté de la cible.
            var bx = borne(cx, 10, W - 10), by = borne(cy, 10, H - 10);
            if (dansRect({ x: bx, y: by }, bulle)) return null;
            var fh = courbe(sx, sy, bx, by, 0, 1, ecran);
            return fh ? finir(fh) : null;
        }
        var croise = function (f, rects) {
            return f.points.some(function (p) { return rects.some(function (r) { return dansRect(p, r); }); });
        };
        // Le plus court : le point de la cible le plus proche du départ.
        var direct = courbe(sx, sy, borne(sx, c.left, c.right), borne(sy, c.top, c.bottom), FLECHE_RETRAIT, 1, ecran);
        if (!direct) return null;
        if (!obstacles.length || !croise(direct, obstacles)) return finir(direct);
        var envers = courbe(sx, sy, borne(sx, c.left, c.right), borne(sy, c.top, c.bottom), FLECHE_RETRAIT, -1, ecran);
        if (envers && !croise(envers, obstacles)) return finir(envers);
        // Par un autre bord de la cible : le point de ce bord le plus proche de la bulle, à 16 px des coins,
        // la pointe à FLECHE_RETRAIT du bord.
        var bcx = (bulle.left + bulle.right) / 2, bcy = (bulle.top + bulle.bottom) / 2;
        var px = borne(bcx, c.left + 16, c.right - 16), py = borne(bcy, c.top + 16, c.bottom - 16);
        var R = FLECHE_RETRAIT;
        var arrivees = [{ x: px, y: c.top - R }, { x: px, y: c.bottom + R }, { x: c.left - R, y: py }, { x: c.right + R, y: py }];
        var interdits = obstacles.concat([c, bulle]);
        var meilleure = null;
        arrivees.forEach(function (a) {
            var dx = borne(a.x, bulle.left, bulle.right), dy = borne(a.y, bulle.top, bulle.bottom);
            [1, -1].forEach(function (sens) {
                var f = courbe(dx, dy, a.x, a.y, 0, sens, ecran);
                if (f && !croise(f, interdits) && (!meilleure || f.longueur < meilleure.longueur - 0.5)) meilleure = f;
            });
        });
        return finir(meilleure || direct);
    }

    /**
     * La place d'une bulle déplacée, gardée dans l'écran utile (`cadre` : sous l'en-tête, au-dessus du bandeau de la
     * démo et du clavier). Une bulle plus grande que le cadre se cale en haut à gauche. Pure.
     */
    function bornerDeplacement(x, y, largeur, hauteur, cadre) {
        return { x: Math.round(borne(x, cadre.gauche, cadre.droite - largeur)),
                 y: Math.round(borne(y, cadre.haut, cadre.bas - hauteur)) };
    }

    function seCroisent(a, b, marge) {
        return !(a.right + marge <= b.left || b.right + marge <= a.left || a.bottom + marge <= b.top || b.bottom + marge <= a.top);
    }

    /** Le haut d'où une bulle peut commencer : sous l'en-tête. */
    function hautUtile() {
        return Math.max(MARGE, hautEntete() + MARGE);
    }

    /**
     * La réserve du témoin « Enregistré » : la hauteur occupée par une bulle rangée en bas. Bornée
     * pour que le témoin (~40 px) reste dans l'écran quand la bulle prend presque toute la hauteur :
     * il passe alors sur le haut de la bulle plutôt que hors de l'écran.
     */
    function poserReserveBas(px) {
        var plafond = Math.max(0, window.innerHeight - 64);
        document.documentElement.style.setProperty('--parcours-reserve-bas', Math.round(Math.min(plafond, Math.max(0, px))) + 'px');
    }

    /** Un geste de la personne (molette, doigt, clavier) arrête le réglage : le moteur ne lutte pas. */
    function arreterReglage() {
        if (etat) etat.reglerJusqua = 0;
    }

    /**
     * Sur téléphone : la bulle pleine largeur, rangée en bas ; en haut si la zone éclairée occupe
     * le bas ; si aucun côté ne contient sa hauteur, le côté du contour, sinon le plus grand, et le
     * texte défile. Jamais plus haute que l'écran utile (la cible peut être hors de l'écran).
     */
    /** Le côté où la bulle tient (en bas d'abord), sinon le plus grand des deux. */
    function choisirCote(naturelle, sous, dessus) {
        if (naturelle <= sous) return { cote: 'bas', max: sous };
        if (naturelle <= dessus) return { cote: 'haut', max: dessus };
        return sous >= dessus ? { cote: 'bas', max: sous } : { cote: 'haut', max: dessus };
    }

    /**
     * En bas d'abord : pendant le réglage (début d'étape, dépliement, jusqu'au premier geste), si
     * faire défiler la page laisse la place sous la zone, le moteur la fait défiler. Rend la zone
     * telle qu'elle est après ce défilement.
     */
    function reglerDefilement(cibleRect, naturelle, haut, bas) {
        var manque = Math.ceil(naturelle - (bas - (cibleRect.bottom + ECART)));
        if (manque <= 0 || Date.now() >= etat.reglerJusqua) return cibleRect;
        if ((cibleRect.top - ECART) - haut < manque) return cibleRect;
        var avant = window.scrollY;
        window.scrollBy(0, manque);
        var fait = window.scrollY - avant;
        return { top: cibleRect.top - fait, bottom: cibleRect.bottom - fait };
    }

    /**
     * Le côté de la bulle sur téléphone. La zone éclairée d'abord ; si elle prend tout l'écran, la
     * bulle en couvre une partie, au mieux sans toucher au contour (ce qu'il faut toucher) : le côté
     * du contour où elle tient, sinon le plus grand ; si les deux ont moins que sa tête (56 px), elle
     * couvre le bord du contour. Sans contour (le geste est dans la bulle) : en bas, à sa hauteur.
     */
    function coteTelephone(cibleRect, contourEl, naturelle, haut, bas) {
        var ecran = Math.max(0, bas - haut);
        if (!cibleRect) return { cote: 'bas', max: ecran };
        var z = reglerDefilement(cibleRect, naturelle, haut, bas);
        var place = choisirCote(naturelle, bas - (z.bottom + ECART), (z.top - ECART) - haut);
        if (naturelle <= place.max) return place;
        if (!contourEl) return { cote: 'bas', max: ecran };
        var rc = contourEl.getBoundingClientRect(); // lu maintenant : après le défilement éventuel
        return choisirCote(naturelle, bas - (rc.bottom + ECART), (rc.top - ECART) - haut);
    }

    /**
     * Sur téléphone : la bulle pleine largeur, au bord de l'écran (coteTelephone). Jamais plus haute
     * que l'écran utile (la cible peut être hors de l'écran) ; repliée, elle garde sa tête (56 px).
     */
    function placerBulleTelephone(cibleRect, contourEl) {
        var b = etat.elements.bulle;
        var haut = hautUtile();
        var bas = basEcran() - MARGE;
        var place = coteTelephone(cibleRect, contourEl, hauteurNaturelle(), haut, bas);
        b.style.maxHeight = Math.max(Math.round(Math.min(place.max, Math.max(0, bas - haut))), 56) + 'px';
        var bh = b.offsetHeight;
        var y = place.cote === 'bas' ? Math.max(MARGE, bas - bh) : haut;
        b.style.left = MARGE + 'px';
        b.style.right = MARGE + 'px';
        b.style.top = Math.round(y) + 'px';
        poserReserveBas(place.cote === 'bas' ? window.innerHeight - y : 0);
    }

    /** L'écran utile d'une bulle : sous l'en-tête, au-dessus du bandeau de la démo et du clavier. */
    function cadreUtile() {
        return { gauche: MARGE, haut: hautUtile(), droite: window.innerWidth - MARGE, bas: basEcran() - MARGE };
    }

    /** La bulle déplacée par la personne : sa place gardée pour l'étape, ramenée dans l'écran utile s'il a changé. */
    function poserDeplacee() {
        var b = etat.elements.bulle;
        var p = bornerDeplacement(etat.deplacee.x, etat.deplacee.y, b.offsetWidth, b.offsetHeight, cadreUtile());
        b.style.left = p.x + 'px';
        b.style.top = p.y + 'px';
    }

    /**
     * La place de la bulle (bw × bh) près de `cible`, dans un écran vw × vh. Un côté après l'autre (bas, haut, droite,
     * gauche), à ECART_FLECHE de la cible quand la place y est (la longueur d'une flèche), sinon à ECART, comme avant.
     * D'abord une place qui tient sans couvrir `obstacle` (ce qu'il faut toucher) ; à défaut une place qui tient ; à
     * défaut le côté le plus libre, au bord de l'écran.
     */
    function placePresDe(cible, obstacle, bw, bh, vw, vh) {
        var haut = hautEntete();
        var hautMin = Math.max(MARGE, haut + MARGE);
        var ox = obstacle ? (obstacle.left + obstacle.right) / 2 : null;
        var oy = obstacle ? (obstacle.top + obstacle.bottom) / 2 : null;
        // La bulle posée d'un côté de la cible ; le long de ce côté, elle s'écarte du contour quand il est à côté.
        var poser = function (cote, ecart) {
            var px, py;
            if (cote === 'bas' || cote === 'haut') {
                px = cible.left + cible.width / 2 - bw / 2;
                if (obstacle && ox < cible.left) px = cible.left;
                else if (obstacle && ox > cible.right) px = cible.right - bw;
                py = cote === 'bas' ? cible.bottom + ecart : cible.top - ecart - bh;
            } else {
                py = cible.top + cible.height / 2 - bh / 2;
                if (obstacle && oy < cible.top) py = cible.top;
                else if (obstacle && oy > cible.bottom) py = cible.bottom - bh;
                px = cote === 'droite' ? cible.right + ecart : cible.left - ecart - bw;
            }
            px = Math.min(Math.max(MARGE, px), vw - bw - MARGE);
            py = Math.min(Math.max(Math.min(haut, vh - bh - MARGE), py), vh - bh - MARGE);
            return { x: px, y: Math.max(MARGE, py) };
        };
        var tient = function (cote, ecart) {
            if (cote === 'bas') return vh - cible.bottom - ecart - MARGE >= bh;
            if (cote === 'haut') return cible.top - ecart - hautMin >= bh;
            if (cote === 'droite') return vw - cible.right - ecart - MARGE >= bw;
            return cible.left - ecart - MARGE >= bw;
        };
        var places = [];
        ['bas', 'haut', 'droite', 'gauche'].forEach(function (cote) {
            [ECART_FLECHE, ECART].forEach(function (ecart) {
                if (tient(cote, ecart)) places.push(poser(cote, ecart));
            });
        });
        var libres = places.filter(function (p) {
            return !obstacle || !seCroisent({ left: p.x, top: p.y, right: p.x + bw, bottom: p.y + bh }, obstacle, MARGE);
        });
        return libres[0] || places[0] || poser((vh - cible.bottom) >= cible.top ? 'bas' : 'haut', ECART);
    }

    /**
     * La bulle, hors téléphone : près de ce dont elle parle (`cibleRect` : l'union des zones ; sans zone, le
     * contour), sans couvrir ce qu'il faut toucher (`obstacle` : le contour, quand il n'est pas la cible). Déplacée
     * par la personne, elle garde sa place pour l'étape.
     */
    function placerBulle(etape, cibleRect, obstacle) {
        var b = etat.elements.bulle;
        poserReserveBas(0);
        var vw = window.innerWidth, vh = basEcran();
        // Le filet : jamais plus haute que l'écran utile ; au-delà, son texte défile.
        b.style.maxHeight = Math.max(0, vh - 2 * MARGE) + 'px';
        if (etat.deplacee) { poserDeplacee(); return; }
        var bw = b.offsetWidth, bh = b.offsetHeight;
        var place;
        if (etape.centre || !cibleRect) {
            place = { x: (vw - bw) / 2, y: Math.max(hautEntete() + 16, (vh - bh) / 2) };
            if (place.y + bh > vh - MARGE) place.y = Math.max(MARGE, vh - bh - MARGE);
        } else {
            place = placePresDe(cibleRect, obstacle, bw, bh, vw, vh);
        }
        b.style.left = Math.round(place.x) + 'px';
        b.style.top = Math.round(place.y) + 'px';
    }

    // ---------- La poignée : déplacer la bulle ----------

    /** Pose la bulle où la personne la veut (bornée à l'écran utile) ; les flèches suivent dans le même geste. */
    function deplacerBulle(x, y) {
        etat.deplacee = { x: x, y: y };
        poserDeplacee();
        if (etat.vus) dessinerFleches(etat.vus.zones, etat.vus.contourEl);
    }

    function debutGlisser(ev) {
        if (!etat || etat.telephone || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        var r = etat.elements.bulle.getBoundingClientRect();
        etat.glisse = { id: ev.pointerId, dx: ev.clientX - r.left, dy: ev.clientY - r.top };
        try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* le pointeur a déjà été relâché */ }
        etat.elements.bulle.classList.add('est-glissee');
        ev.preventDefault();
    }

    function surGlisser(ev) {
        if (!etat || !etat.glisse || ev.pointerId !== etat.glisse.id) return;
        deplacerBulle(ev.clientX - etat.glisse.dx, ev.clientY - etat.glisse.dy);
        ev.preventDefault();
    }

    function finGlisser(ev) {
        if (!etat || !etat.glisse || ev.pointerId !== etat.glisse.id) return;
        etat.glisse = null;
        etat.elements.bulle.classList.remove('est-glissee');
        try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) { /* déjà relâché */ }
    }

    /**
     * Au clavier, la poignée déplace la bulle par pas de PAS_CLAVIER. L'événement ne remonte pas à la bulle :
     * les flèches gauche et droite n'y changent pas de page.
     */
    function surTouchePoignee(ev) {
        var pas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
        if (!etat || !pas || ev.altKey || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        var r = etat.elements.bulle.getBoundingClientRect();
        deplacerBulle(r.left + pas[0] * PAS_CLAVIER, r.top + pas[1] * PAS_CLAVIER);
        ev.preventDefault();
        ev.stopPropagation();
    }

    // ---------- Les flèches, la section actuelle ----------

    /** Ce dont parle la bulle : les zones qui ne sont pas ce qu'il faut toucher (le contour a sa pulsation). */
    function sujets(zones, contourEl) {
        return (zones || []).filter(function (z) {
            return visible(z) && z !== contourEl && !(contourEl && contourEl.contains(z));
        });
    }

    /** Les cibles des flèches : les sujets, groupés ; sans sujet, le contour ; sans rien de désigné, aucune. */
    function ciblesDesFleches(zones, contourEl) {
        var rects = grouperCibles(rectsDe(sujets(zones, contourEl)), FLECHES_MAX);
        if (!rects.length && visible(contourEl)) rects = [contourEl.getBoundingClientRect()];
        return rects;
    }

    /** Trace les flèches de la bulle vers ses cibles ; un tracé inchangé n'est pas réécrit. */
    function dessinerFleches(zones, contourEl) {
        var svg = etat.elements.svg;
        var b = etat.elements.bulle;
        var traces = [];
        if (visible(b)) {
            var rb = b.getBoundingClientRect();
            var ecran = { largeur: window.innerWidth, hauteur: window.innerHeight };
            var cibles = ciblesDesFleches(zones, contourEl);
            // Une flèche évite de passer sur une autre cible, et sur ce qu'il faut toucher.
            var rc = visible(contourEl) ? contourEl.getBoundingClientRect() : null;
            cibles.forEach(function (r) {
                var obstacles = cibles.filter(function (o) { return o !== r; });
                if (rc && !seCroisent(rc, r, 0)) obstacles.push(rc);
                var t = tracerFleche(rb, r, ecran, obstacles);
                if (t) traces.push(t.d);
            });
        }
        var ns = 'http://www.w3.org/2000/svg';
        while (svg.childNodes.length > traces.length) svg.removeChild(svg.lastChild);
        while (svg.childNodes.length < traces.length) {
            var g = document.createElementNS(ns, 'g');
            g.setAttribute('class', 'parcours-fleche');
            ['parcours-fleche-fond', 'parcours-fleche-trait'].forEach(function (classe) {
                var chemin = document.createElementNS(ns, 'path');
                chemin.setAttribute('class', classe);
                g.appendChild(chemin);
            });
            svg.appendChild(g);
        }
        traces.forEach(function (d, k) {
            var g = svg.childNodes[k];
            if (g.getAttribute('data-trace') === d) return;
            g.setAttribute('data-trace', d);
            g.firstChild.setAttribute('d', d);
            g.lastChild.setAttribute('d', d);
        });
    }

    function effacerFleches() {
        var svg = etat.elements.svg;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
    }

    /**
     * La section actuelle : dans le menu ou la barre d'onglets qui contient le contour (son parent, ou le parent de
     * celui-ci), l'élément actif. Ni le contour lui-même, ni rien qui ne soit un bouton, un lien ou un onglet
     * (`.active` marque aussi les sections de la page).
     */
    function sectionActuelleDe(contourEl) {
        if (!visible(contourEl)) return null;
        var SEL = '.actif, .active, [aria-current]:not([aria-current="false"]), [aria-selected="true"]';
        var p = contourEl.parentElement;
        for (var n = 0; n < 2 && p && p !== document.body; n++, p = p.parentElement) {
            var liste = p.querySelectorAll(SEL);
            for (var k = 0; k < liste.length; k++) {
                var a = liste[k];
                if (a === contourEl || a.contains(contourEl) || contourEl.contains(a)) continue;
                if (a.matches('button, a, [role="tab"], [role="menuitem"], [role="option"]') && visible(a)) return a;
            }
        }
        return null;
    }

    /** Pose la mise en évidence sur la section actuelle, la retire de la précédente. Le moteur seul y touche. */
    function marquerSectionActuelle(el) {
        if (etat.sectionActuelle === el) return;
        if (etat.sectionActuelle) etat.sectionActuelle.classList.remove('parcours-section-actuelle');
        etat.sectionActuelle = el;
        if (el) el.classList.add('parcours-section-actuelle');
    }

    /**
     * La fenêtre a franchi le seuil du téléphone (rotation, écran partagé) : la bulle change de forme,
     * sans nouvelle annonce, et garde le focus si elle l'avait.
     */
    function suivreSeuil() {
        if (surTelephone() === etat.telephone) return;
        var avaitFocus = etat.elements.bulle.contains(document.activeElement);
        rendreBulle({ sansAnnonce: true });
        if (!avaitFocus) return;
        try { etat.elements.bulle.focus({ preventScroll: true }); } catch (e) { etat.elements.bulle.focus(); }
    }

    /** Un passage de la sonde : contour, section actuelle, bulle, flèches, puis l'état atteint. */
    function sonder() {
        if (!etat || etat.enTransition) return;
        var etape = etapeCourante();
        if (etat.opts.verifier && !etat.opts.verifier()) { fermer(); return; }
        suivreSeuil();

        var zones = etape.zones ? (etape.zones() || []) : [];
        var contourEl = etape.contour ? etape.contour() : null;
        etat.vus = { zones: zones, contourEl: contourEl };

        // La couche des flèches : en px, sur innerWidth × innerHeight, à chaque passage (le repère du contour).
        var svg = etat.elements.svg;
        svg.setAttribute('width', String(window.innerWidth));
        svg.setAttribute('height', String(window.innerHeight));
        svg.style.width = window.innerWidth + 'px';
        svg.style.height = window.innerHeight + 'px';

        var c = etat.elements.contour;
        if (visible(contourEl)) {
            var r = contourEl.getBoundingClientRect();
            c.hidden = false;
            c.style.left = (r.left - 5) + 'px';
            c.style.top = (r.top - 5) + 'px';
            c.style.width = (r.width + 10) + 'px';
            c.style.height = (r.height + 10) + 'px';
        } else {
            c.hidden = true;
        }
        marquerSectionActuelle(sectionActuelleDe(contourEl));

        // La découpe suit la largeur de la bulle (une sonde d'étape a pu la changer), avant sa place.
        suivreLargeurDesPages();
        placerSelonEtape(etape, zones, contourEl);
        if (etape.atteint) suivreAtteint(etape, zones, contourEl);
    }

    /**
     * La bulle près de ce dont elle parle (l'union des zones ; sans zone, le contour), le contour traité comme un
     * obstacle ; puis ses flèches. Sur téléphone, rien ne change : la bulle rangée évite les zones ET le contour.
     */
    function placerSelonEtape(etape, zones, contourEl) {
        var c = visible(contourEl) ? contourEl : null;
        if (etat.telephone) {
            placerBulleTelephone(union(rectsDe(zones.concat(c ? [c] : []))), c);
        } else {
            var sujet = union(rectsDe(sujets(zones, c)));
            var rc = c ? c.getBoundingClientRect() : null;
            placerBulle(etape, sujet || rc, sujet ? rc : null);
        }
        dessinerFleches(zones, contourEl);
    }

    /**
     * L'état atteint : l'étape suivante. Sinon, la sonde d'étape a pu changer la forme de la bulle (le
     * neuvième parcours la pose dans `atteint`) : la découpe et la place suivent dans le même passage,
     * sans image périmée.
     */
    function suivreAtteint(etape, zones, contourEl) {
        var ok = false;
        try { ok = !!etape.atteint(); } catch (e) { ok = false; }
        if (ok) { allerA(etat.i + 1); return; }
        if (suivreLargeurDesPages()) placerSelonEtape(etape, zones, contourEl);
    }

    /** Prépare la page pour l'étape i (`avant`), puis attend deux images qu'elle soit dessinée. */
    async function preparer(etape, i) {
        try {
            if (etape.avant) await etape.avant();
        } catch (e) {
            console.warn('[parcours] préparation de l’étape ' + (i + 1) + ' :', e);
        }
        await new Promise(function (fin) { requestAnimationFrame(function () { requestAnimationFrame(fin); }); });
    }

    /**
     * Ce que l'étape désigne puis éclaire, pour l'amener dans la vue. Le contour d'abord :
     * si l'ensemble ne tient pas à l'écran, c'est ce qu'il faut toucher qui y est amené.
     */
    function elementsVises(etape) {
        var vise = etape.contour ? [etape.contour()] : [];
        if (etape.zones) vise = vise.concat(etape.zones() || []);
        return vise.filter(Boolean);
    }

    async function allerA(i) {
        if (!etat) return;
        if (i >= etat.def.etapes.length) { fermer(); return; }
        etat.enTransition = true;
        etat.i = i;
        if (etat.opts.surEtape) etat.opts.surEtape(i);
        var etape = etapeCourante();
        etat.elements.contour.hidden = true;
        // L'étape suivante reprend le placement automatique ; ses flèches et sa section actuelle seront les siennes.
        etat.deplacee = null;
        etat.glisse = null;
        etat.vus = null;
        effacerFleches();
        marquerSectionActuelle(null);
        await preparer(etape, i);
        // Le parcours a pu être fermé, ou avancé ailleurs, pendant la préparation.
        if (!etat || etat.i !== i) return;
        // Sur téléphone, une étape qui désigne quoi toucher sur la page (un contour) ouvre la bulle
        // repliée ; quand le geste est dans la bulle (« Continuer »), elle s'ouvre dépliée.
        etat.replie = !!etape.contour;
        rendreBulle();
        if (!etape.centre || etat.telephone) amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
        etat.enTransition = false;
        etat.reglerJusqua = Date.now() + REGLAGE_MS;
        sonder();
        try { etat.elements.bulle.focus({ preventScroll: true }); } catch (e) { etat.elements.bulle.focus(); }
    }

    function surTouche(ev) {
        if (!etat || ev.key !== 'Escape') return;
        var etape = etapeCourante();
        ev.stopPropagation();
        ev.preventDefault();
        if (!etape.sansSortie) quitter();
        else if (etat.opts.surEchap) etat.opts.surEchap(api);
    }

    function surRedimension() { sonder(); }

    function lancer(def, opts) {
        if (etat) fermer();
        retirerElements();
        etat = { def: def, i: 0, opts: opts || {}, elements: creerElements(), enTransition: false,
                 telephone: surTelephone(), replie: false, reglerJusqua: 0, texte: '', pages: [], page: 0, largeurPages: 0,
                 deplacee: null, glisse: null, vus: null, sectionActuelle: null };
        document.body.classList.add('parcours-actif');
        if (window.transitions && typeof window.transitions.fermerBandeau === 'function') window.transitions.fermerBandeau();
        // 9 nov. 2026 : une flèche didactique déjà ouverte se retire, sans être marquée vue (la bulle parle seule).
        if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') window.accompagnement.masquerFleche();
        document.addEventListener('keydown', surTouche, true);
        window.addEventListener('resize', surRedimension);
        window.addEventListener('scroll', surRedimension, { passive: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', surRedimension);
            window.visualViewport.addEventListener('scroll', surRedimension);
        }
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.addEventListener(t, arreterReglage, { passive: true, capture: true }); });
        etat.timer = setInterval(sonder, SONDE_MS);
        var depuis = Math.max(0, Math.min((opts && opts.depuis) || 0, def.etapes.length - 1));
        return allerA(depuis);
    }

    function fermer() {
        if (!etat) return;
        clearInterval(etat.timer);
        document.removeEventListener('keydown', surTouche, true);
        window.removeEventListener('resize', surRedimension);
        window.removeEventListener('scroll', surRedimension);
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', surRedimension);
            window.visualViewport.removeEventListener('scroll', surRedimension);
        }
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.removeEventListener(t, arreterReglage, { passive: true, capture: true }); });
        marquerSectionActuelle(null);
        etat = null;
        retirerElements();
        document.documentElement.style.removeProperty('--parcours-reserve-bas');
        document.body.classList.remove('parcours-actif');
    }

    function quitter() {
        if (!etat) return;
        var rappel = etat.opts.surQuitter;
        var i = etat.i;
        fermer();
        if (rappel) rappel(i);
    }

    var api = {
        lancer: lancer,
        fermer: fermer,
        quitter: quitter,
        actif: function () { return !!etat; },
        etapeCourante: function () { return etat ? etat.i : null; },
        // Le parcours joué est-il celui-là ? Pour les gardes d'une définition (un écouteur à elle, hors de l'étape).
        joue: function (def) { return !!etat && etat.def === def; },
        // Les bulles en pages : la page affichée et leur nombre (0 et 1 quand le texte tient).
        pageCourante: function () { return etat ? { page: etat.page, pages: etat.pages.length, largeur: etat.largeurPages } : null; },
        allerA: function (i) { return allerA(i); },
        // Utilitaires pour les définitions de parcours.
        visible: visible,
        premierVisible: premierVisible,
        surTelephone: surTelephone,
        mouvementReduit: mouvementReduit,
        // La géométrie des flèches et du déplacement, en fonctions pures (tests/unit).
        geometrie: { tracerFleche: tracerFleche, grouperCibles: grouperCibles, bornerDeplacement: bornerDeplacement }
    };

    window.ParcoursMoteur = api;
})();
