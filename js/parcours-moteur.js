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
         .fermer(), .actif(), .etapeCourante(), .surTelephone().

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
   ================================================================= */
(function () {
    'use strict';

    var SONDE_MS = 120;
    var MARGE = 8;
    var ECART = 12;
    var SEUIL_TELEPHONE = 500; // px de large de la fenêtre : en deçà, la bulle prend sa forme de téléphone
    var REGLAGE_MS = 1200;     // sur téléphone, le temps où le moteur peut faire défiler pour ranger la bulle en bas

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
        h.textContent = etape.titre;
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
        }
        b.appendChild(tete);

        var p = document.createElement('p');
        p.className = 'parcours-bulle-texte';
        p.textContent = etape.texte;
        b.appendChild(p);
        // Le filet : le texte peut se resserrer et défiler, jamais sous trois lignes (ou sa hauteur).
        var ligne = parseFloat(getComputedStyle(p).lineHeight) || 22;
        p.style.minHeight = Math.min(p.scrollHeight, Math.ceil(3 * ligne)) + 'px';

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

    function trouRect(r, pad) {
        var x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad);
        var w = Math.min(window.innerWidth, r.right + pad) - x;
        var hh = Math.min(window.innerHeight, r.bottom + pad) - y;
        if (w <= 0 || hh <= 0) return '';
        // Le rayon ne dépasse pas la moitié d'un côté : une cible presque sortie de l'écran (moins de
        // 12 px visibles) rendait « v-2.4 » puis « v--2.4 », que WebKit refuse (verdict du 9 nov.).
        var rr = Math.min(6, w / 2, hh / 2);
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

    function placerBulle(etape, cibleRect, contourEl) {
        var b = etat.elements.bulle;
        if (etat.telephone) { placerBulleTelephone(cibleRect, contourEl); return; }
        poserReserveBas(0);
        var vw = window.innerWidth, vh = basEcran();
        // Le filet : jamais plus haute que l'écran utile ; au-delà, son texte défile.
        b.style.maxHeight = Math.max(0, vh - 2 * MARGE) + 'px';
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

    /** Un passage de la sonde : trous, contour, bulle, puis l'état atteint. */
    function sonder() {
        if (!etat || etat.enTransition) return;
        var etape = etapeCourante();
        if (etat.opts.verifier && !etat.opts.verifier()) { fermer(); return; }
        suivreSeuil();

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
        placerBulle(etape, union(rectsDe(zones.concat(contourEl ? [contourEl] : []))), visible(contourEl) ? contourEl : null);

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
                 telephone: surTelephone(), replie: false, reglerJusqua: 0 };
        document.body.classList.add('parcours-actif');
        if (window.transitions && typeof window.transitions.fermerBandeau === 'function') window.transitions.fermerBandeau();
        // 9 nov. 2026 : une flèche didactique déjà ouverte se retire, sans être marquée vue (la bulle parle seule).
        if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') window.accompagnement.masquerFleche();
        document.addEventListener('keydown', surTouche, true);
        window.addEventListener('resize', surRedimension);
        window.addEventListener('scroll', surRedimension, { passive: true });
        if (window.visualViewport) window.visualViewport.addEventListener('resize', surRedimension);
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
        if (window.visualViewport) window.visualViewport.removeEventListener('resize', surRedimension);
        ['wheel', 'touchstart', 'keydown'].forEach(function (t) { window.removeEventListener(t, arreterReglage, { passive: true, capture: true }); });
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
        allerA: function (i) { return allerA(i); },
        // Utilitaires pour les définitions de parcours.
        visible: visible,
        premierVisible: premierVisible,
        surTelephone: surTelephone,
        mouvementReduit: mouvementReduit
    };

    window.ParcoursMoteur = api;
})();
