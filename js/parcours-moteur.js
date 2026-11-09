/* =================================================================
   LE MOTEUR DES PARCOURS — lot « Les deux parcours » (8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, « Le principe, pour les deux ».

   Un parcours n'est pas une visite : la personne fait le geste elle-même sur ce qui est
   éclairé. Le moteur pose :
   · un voile percé de trous sur les zones éclairées (un chemin SVG evenodd : le plein capte
     le toucher, les trous le laissent passer, la zone reste atteignable au clavier) ;
   · un contour dans l'orange de l'aide sur ce qu'il faut toucher ;
   · une bulle près de la zone, sans la couvrir : titre, « n sur N », texte, geste, boutons,
     lien de sortie. Elle prend le focus et s'annonce (aria-live poli).
   Une étape avance quand l'état attendu est ATTEINT (`atteint()`), quel que soit le chemin :
   le moteur le sonde, il n'écoute pas le toucher d'un bouton précis.

   Une étape :
     { titre, texte, geste?, voile?: 'normal'|'leger'|'dense', centre?: bool,
       avant?: async () => void,   // place la page (idempotent : sert aussi à la reprise)
       zones?: () => Element[],    // ce qui est éclairé
       contour?: () => Element,    // où toucher
       atteint?: () => bool,       // l'état qui fait avancer
       boutons?: [{ libelle, primaire?, action }],
       sansSortie?: bool }
   API : window.ParcoursMoteur.lancer(def, { depuis, surEtape, surQuitter, surEchap, verifier }),
         .fermer(), .actif(), .etapeCourante().
   ================================================================= */
(function () {
    'use strict';

    var SONDE_MS = 120;
    var MARGE = 8;
    var ECART = 12;

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

    /** Le bas utile de l'écran : au-dessus du bandeau de la démo, fixé en bas, quand il est là. */
    function basEcran() {
        var b = document.getElementById('bandeau-demo');
        if (b && visible(b)) return Math.min(window.innerHeight, b.getBoundingClientRect().top);
        return window.innerHeight;
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
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('class', 'parcours-voile parcours-voile--normal');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('id', 'parcours-voile');
        var path = document.createElementNS(ns, 'path');
        svg.appendChild(path);

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

        var annonce = document.createElement('div');
        annonce.className = 'u-lecteur-ecran';
        annonce.id = 'parcours-annonce';
        annonce.setAttribute('aria-live', 'polite');

        document.body.appendChild(svg);
        document.body.appendChild(contour);
        document.body.appendChild(bulle);
        document.body.appendChild(annonce);
        return { svg: svg, path: path, contour: contour, bulle: bulle, annonce: annonce };
    }

    function retirerElements() {
        ['parcours-voile', 'parcours-contour', 'parcours-bulle', 'parcours-annonce'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
    }

    // ---------- Le rendu d'une étape ----------

    function etapeCourante() {
        return etat ? etat.def.etapes[etat.i] : null;
    }

    function rendreBulle() {
        var etape = etapeCourante();
        var b = etat.elements.bulle;
        var total = etat.def.etapes.length;
        b.textContent = '';

        var tete = document.createElement('div');
        tete.className = 'parcours-bulle-tete';
        var h = document.createElement('h2');
        h.className = 'parcours-bulle-titre';
        h.id = 'parcours-bulle-titre';
        h.textContent = etape.titre;
        var rang = document.createElement('span');
        rang.className = 'parcours-bulle-rang';
        rang.textContent = (etat.i + 1) + ' sur ' + total;
        tete.appendChild(h);
        tete.appendChild(rang);
        b.appendChild(tete);

        var p = document.createElement('p');
        p.className = 'parcours-bulle-texte';
        p.textContent = etape.texte;
        b.appendChild(p);

        if (etape.geste) {
            var g = document.createElement('p');
            g.className = 'parcours-bulle-geste';
            g.textContent = etape.geste;
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
        // texte soit relu s'il revient.
        var a = etat.elements.annonce;
        a.textContent = '';
        setTimeout(function () {
            if (!etat) return;
            a.textContent = etape.titre + '. ' + etape.texte + (etape.geste ? ' ' + etape.geste : '');
        }, 50);
    }

    function trouRect(r, pad) {
        var x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad);
        var w = Math.min(window.innerWidth, r.right + pad) - x;
        var hh = Math.min(window.innerHeight, r.bottom + pad) - y;
        if (w <= 0 || hh <= 0) return '';
        var rr = 6;
        return 'M' + (x + rr) + ',' + y + ' h' + (w - 2 * rr) + ' a' + rr + ',' + rr + ' 0 0 1 ' + rr + ',' + rr +
            ' v' + (hh - 2 * rr) + ' a' + rr + ',' + rr + ' 0 0 1 -' + rr + ',' + rr +
            ' h-' + (w - 2 * rr) + ' a' + rr + ',' + rr + ' 0 0 1 -' + rr + ',-' + rr +
            ' v-' + (hh - 2 * rr) + ' a' + rr + ',' + rr + ' 0 0 1 ' + rr + ',-' + rr + ' z';
    }

    /**
     * En règle pair-impair, deux trous qui se chevauchent se rebouchent là où ils se
     * recouvrent : le « A » d'une pastille éclairée redevenait voilé, et son toucher était
     * capté par le voile. Les trous qui se touchent (à la marge près) sont donc fondus
     * dans leur rectangle englobant.
     */
    function fusionnerTrous(rects) {
        var pad = 6;
        var liste = rects.map(function (r) { return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; });
        var change = true;
        while (change) {
            change = false;
            for (var a = 0; a < liste.length && !change; a++) {
                for (var b = a + 1; b < liste.length && !change; b++) {
                    var A = liste[a], B = liste[b];
                    var touche = !(A.right + pad < B.left - pad || B.right + pad < A.left - pad ||
                                   A.bottom + pad < B.top - pad || B.bottom + pad < A.top - pad);
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

    function placerBulle(etape, cibleRect) {
        var b = etat.elements.bulle;
        var vw = window.innerWidth, vh = basEcran();
        var bw = b.offsetWidth, bh = b.offsetHeight;
        var x, y;
        if (etape.centre || !cibleRect) {
            x = (vw - bw) / 2;
            y = Math.max(hautEntete() + 16, (vh - bh) / 2);
            if (y + bh > vh - MARGE) y = Math.max(MARGE, vh - bh - MARGE);
        } else {
            var haut = hautEntete();
            var places = [
                { cote: 'bas',    libre: vh - cibleRect.bottom - ECART - MARGE },
                { cote: 'haut',   libre: cibleRect.top - ECART - Math.max(MARGE, hautEntete() + MARGE) },
                { cote: 'droite', libre: vw - cibleRect.right - ECART - MARGE },
                { cote: 'gauche', libre: cibleRect.left - ECART - MARGE }
            ];
            var choix = null;
            for (var k = 0; k < places.length; k++) {
                var pl = places[k];
                var tient = (pl.cote === 'bas' || pl.cote === 'haut') ? pl.libre >= bh : pl.libre >= bw;
                if (tient) { choix = pl.cote; break; }
            }
            if (!choix) {
                // Rien ne tient sans couvrir : le côté le plus libre, bord de l'écran.
                choix = (vh - cibleRect.bottom) >= cibleRect.top ? 'bas' : 'haut';
            }
            if (choix === 'bas' || choix === 'haut') {
                x = cibleRect.left + cibleRect.width / 2 - bw / 2;
                y = choix === 'bas' ? cibleRect.bottom + ECART : cibleRect.top - ECART - bh;
            } else {
                y = cibleRect.top + cibleRect.height / 2 - bh / 2;
                x = choix === 'droite' ? cibleRect.right + ECART : cibleRect.left - ECART - bw;
            }
            x = Math.min(Math.max(MARGE, x), vw - bw - MARGE);
            y = Math.min(Math.max(Math.min(haut, vh - bh - MARGE), y), vh - bh - MARGE);
            y = Math.max(MARGE, y);
        }
        b.style.left = Math.round(x) + 'px';
        b.style.top = Math.round(y) + 'px';
    }

    /** Un passage de la sonde : trous, contour, bulle, puis l'état atteint. */
    function sonder() {
        if (!etat || etat.enTransition) return;
        var etape = etapeCourante();
        if (etat.opts.verifier && !etat.opts.verifier()) { fermer(); return; }

        var zones = etape.zones ? (etape.zones() || []) : [];
        var contourEl = etape.contour ? etape.contour() : null;
        var vw = window.innerWidth, vh = window.innerHeight;

        var d = 'M0,0 H' + vw + ' V' + vh + ' H0 Z';
        fusionnerTrous(rectsDe(zones.concat(contourEl ? [contourEl] : []))).forEach(function (r) { d += ' ' + trouRect(r, 6); });
        etat.elements.path.setAttribute('d', d);
        etat.elements.svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);

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

        // La bulle évite la zone éclairée ET le contour.
        placerBulle(etape, union(rectsDe(zones.concat(contourEl ? [contourEl] : []))));

        if (etape.atteint) {
            var ok = false;
            try { ok = !!etape.atteint(); } catch (e) { ok = false; }
            if (ok) allerA(etat.i + 1);
        }
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
        etat.elements.svg.setAttribute('class', 'parcours-voile parcours-voile--' + (etape.voile || 'normal'));
        etat.elements.contour.hidden = true;
        await preparer(etape, i);
        // Le parcours a pu être fermé, ou avancé ailleurs, pendant la préparation.
        if (!etat || etat.i !== i) return;
        rendreBulle();
        if (!etape.centre) amenerDansLaVue(elementsVises(etape), etat.elements.bulle.offsetHeight);
        etat.enTransition = false;
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
        etat = { def: def, i: 0, opts: opts || {}, elements: creerElements(), enTransition: false };
        document.body.classList.add('parcours-actif');
        if (window.transitions && typeof window.transitions.fermerBandeau === 'function') window.transitions.fermerBandeau();
        // 9 nov. 2026 : une flèche didactique déjà ouverte se retire, sans être marquée vue (la bulle parle seule).
        if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') window.accompagnement.masquerFleche();
        document.addEventListener('keydown', surTouche, true);
        window.addEventListener('resize', surRedimension);
        window.addEventListener('scroll', surRedimension, { passive: true });
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
        etat = null;
        retirerElements();
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
        allerA: function (i) { return allerA(i); },
        // Utilitaires pour les définitions de parcours.
        visible: visible,
        premierVisible: premierVisible,
        mouvementReduit: mouvementReduit
    };

    window.ParcoursMoteur = api;
})();
