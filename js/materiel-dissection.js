/**
 * materiel-dissection.js — Conception › « Apporter mon matériel » : la DISSECTION, lot 1.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md` ; plan :
 * `PLAN-2026-10-18-la-dissection-pour-lundi.md`. Elle remplace, dans l'onglet, l'assistant en sept
 * étapes (débranché, pas supprimé : son retrait est inscrit pour après lundi).
 *
 * L'enseignant colle sa grille ; il la voit telle qu'il l'a écrite, chaque ligne de chaque case
 * devenue un morceau. Une étiquette de la palette, touchée, devient son surligneur ; il touche ou
 * glisse sur les morceaux qu'elle désigne, retouche un morceau surligné pour le retirer. Sous la
 * grille, la lecture de l'application se refait à chaque geste (`materielDissectionLecture`).
 *
 * RIEN N'EST ÉCRIT dans les données tant que l'enseignant ne touche pas « Créer ma grille » : la
 * dissection en cours vit dans la page, et se perd en la quittant.
 * Lot 2a (`CONSIGNE-LOT-2026-10-18-dissection-2a-creer-en-points.md`) : « Créer ma grille », sous la
 * lecture, pour une grille en points ; l'écriture est celle de `materielCreation.creer` (le seul
 * chemin, rien de neuf), puis la confirmation de `materiel.js`. Ce qui l'empêche s'écrit à côté.
 * Lot 2b (`CONSIGNE-LOT-2026-10-18-dissection-2b-creer-en-niveaux.md`) : une grille en niveaux se crée
 * aussi ; pour une grille qui a les deux logiques, un choix (des points par défaut). Le tableau « Ce que
 * vaut chaque niveau » demande la plage et la note retenue de chaque niveau, champs VIDES ; ce qui y
 * est saisi vit dans la page avec les étiquettes, et se perd avec elles.
 *
 * Lot 5 (`CONSIGNE-LOT-2026-10-18-dissection-5-couper.md`) : l'outil « Couper », dans la palette après
 * « Suite », se prend comme une étiquette ; un toucher coupe un morceau en deux à l'espace la plus proche
 * (`materielDissectionLecture.couper`), le glisser ne coupe pas. Les coupes vivent dans la page, en pile,
 * et s'annulent (« Annuler la dernière coupe ») ; rien n'est écrit avant « Créer ma grille ».
 *
 * Lot 7 (`CONSIGNE-LOT-2026-10-18-dissection-7-rattacher.md`) : l'outil « Rattacher », après « Couper » ;
 * deux touchers, la suite (B) puis le morceau qu'elle continue (A) ; retoucher un morceau rattaché défait
 * son lien. Un morceau rattaché garde sa marque ; l'outil en main, une flèche va de chaque B vers son A.
 * Rien n'est déplacé dans la feuille, rien n'est deviné, rien n'est écrit avant « Créer ma grille ».
 *
 * Sécurité (règle 1) : tout texte venu du collage s'écrit par `textContent` ; le HTML collé n'est
 * jamais inséré (le document disséqué ne porte que du texte). Boutons par `data-action` (dispatcher
 * de main.js) ; les gestes sur la feuille, par des écouteurs de pointeur posés ici, aucun handler inline.
 *
 * iPad : les gestes passent par les événements de pointeur (pas de glisser-déposer HTML5) ;
 * `touch-action: none` ne vaut sur les morceaux que lorsqu'une étiquette est en main
 * (classe `dissection-pointage`), pour que le canevas défile au doigt le reste du temps.
 *
 * Textes d'écran de Claude Code ou de l'ébauche : validé G. 18 oct. (étape 3 du plan ; L3 réécrit ce jour-là).
 */
(function () {
    'use strict';

    var SVG = 'http://www.w3.org/2000/svg';

    /**
     * L'état d'une dissection : le document, ses étiquettes, ce qui est en main, les coupes (lot 5) ;
     * lot 7, les rattachements { idB: idA } et `suite`, le B choisi au premier toucher de « Rattacher ».
     */
    function etatNeuf(doc) {
        return { doc: doc, liens: {}, actif: null, morceaux: doc ? D().morceaux(doc) : null, erreur: '', enCours: false, nomSaisi: null, compte: 'points', valeurs: {}, coupes: [], rattachements: {}, suite: null };
    }
    var etat = etatNeuf(null);
    var blocs = {};
    var dessinPrevu = false;

    /** Lot 5, « Couper » : textes de Claude Code (18 oct.), validé G. 18 oct. 13 h 48. */
    var TEXTES_COUPE = {
        bandeau: 'Outil « Couper » : touche l’endroit d’un morceau où le séparer en deux. La coupe tombe entre deux mots.',
        enMain: 'Outil « Couper » en main : touche l’endroit d’un morceau où le séparer en deux.',
        coupe: function (a, b) { return 'Morceau coupé en deux : « ' + a + ' » et « ' + b + ' ».'; },
        unMot: 'Ce morceau n’a qu’un mot : il ne se coupe pas.',
        annulee: function (t) { return 'Coupe annulée : « ' + t + ' » est recollé.'; },
        // Lot 7 : quand l'annulation défait un lien. Validé G. 18 oct. 17 h 18.
        lienDefait: ' Le lien qui touchait ses parties est défait.'
    };

    /**
     * Lot 7, « Rattacher » : textes de Claude Code (18 oct.), sur le modèle de ceux de « Couper » ; le refus
     * « déjà la suite » est celui de la consigne du lot ; le refus « boucle », proposé par Cowork et accepté par Grégoire. Validé G.
     * 18 oct. 17 h 18. Les textes collés y entrent par leurs premiers mots (`premiersMots`).
     */
    var TEXTES_LIEN = {
        bandeau: 'Outil « Rattacher » : touche d’abord le morceau qui en continue un autre, puis celui qu’il continue. Touche un morceau déjà rattaché pour défaire son lien.',
        bandeauChoix: function (b) { return 'Outil « Rattacher » : touche maintenant le morceau que « ' + b + ' » continue. Retouche « ' + b + ' » pour annuler.'; },
        enMain: 'Outil « Rattacher » en main : touche d’abord le morceau qui en continue un autre.',
        choisi: function (b) { return 'Suite choisie : « ' + b + ' ». Touche maintenant le morceau qu’il continue.'; },
        annule: 'Choix annulé : aucun lien créé.',
        lie: function (t) { return 'Morceaux rattachés : l’application lit « ' + t + ' ».'; },
        etiquetteRetiree: function (nom) { return ' L’étiquette « ' + nom + ' » de la suite est retirée : celle du premier morceau vaut pour le texte entier.'; },
        defait: function (b) { return 'Lien défait : « ' + b + ' » redevient un morceau à part.'; },
        soi: 'Un morceau ne se rattache pas à lui-même.',
        boucle: function (b) { return 'Ce morceau est déjà la suite de « ' + b + ' » : ils sont déjà rattachés, dans l’autre sens.'; },
        dejaSuite: function (a) { return 'Ce morceau est déjà la suite de « ' + a + ' » : rattache plutôt à celui-là.'; },
        sansEtiquette: function (a) { return 'Ce morceau est la suite de « ' + a + ' » : l’étiquette de « ' + a + ' » vaut pour les deux. Défais le lien avec « Rattacher » pour l’étiqueter à part.'; },
        suiteDe: function (a) { return 'Ce morceau est la suite de « ' + a + ' » : l’application les lit comme un seul texte.'; }
    };

    function D() { return window.materielDissectionLecture; }
    function el(id) { return document.getElementById(id); }

    function noeud(tag, cls, txt) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (txt != null) n.textContent = txt;
        return n;
    }

    function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }
    function fmt(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }
    function dire(m) { var s = el('dissection-statut'); if (s) s.textContent = m || ''; }
    function typeDe(id) { var t = etat.liens[id]; return D().TYPE[t] ? t : null; }
    /** La lecture de l'application : les étiquettes et, lot 7, les rattachements. */
    function lire() { return D().comprendre(etat.doc, etat.liens, etat.rattachements); }
    /** Lot 7 : les premiers mots d'un morceau, pour le nommer sur la ligne d'état. */
    function mots(id) { return D().premiersMots(etat.morceaux.texte[id] || ''); }

    // ------------------------------------------------------------------
    // La feuille : la grille telle que l'enseignant l'a écrite
    // ------------------------------------------------------------------

    function bloc(L) {
        var b = noeud('div', 'dissection-morceau', L.t);   // textContent : jamais de balise
        b.setAttribute('data-id', L.id);
        return b;
    }

    /**
     * La feuille d'un document disséqué : un tableau (cases fusionnées comprises), ou les lignes
     * d'un texte brut. Chaque morceau, un `.dissection-morceau[data-id]`. Exposée pour les bancs.
     */
    function construireFeuille(doc) {
        var f = noeud('div', 'dissection-feuille');
        if (doc.mode === 'table') {
            var table = noeud('table');
            var tbody = noeud('tbody');
            doc.rows.forEach(function (row) {
                var tr = noeud('tr');
                row.forEach(function (cell) {
                    var td = noeud('td');
                    if (cell.cs > 1) td.colSpan = cell.cs;
                    if (cell.rs > 1) td.rowSpan = cell.rs;
                    cell.lines.forEach(function (L) { td.appendChild(bloc(L)); });
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            f.appendChild(table);
        } else {
            f.classList.add('dissection-feuille-texte');
            doc.lines.forEach(function (L) { f.appendChild(bloc(L)); });
        }
        return f;
    }

    /** Lot 5 : ce que la palette met en main, une étiquette (`TYPE`) ou un outil (`OUTIL`, « Couper »). */
    function enMain(k) { return D().TYPE[k] || D().OUTIL[k] || null; }
    function estOutil(k) { return !!D().OUTIL[k]; }

    function classeType(n, type) {
        D().TYPES.concat(D().OUTILS).forEach(function (t) { n.classList.remove('dis-t-' + t.k); });
        if (type) n.classList.add('dis-t-' + type);
    }

    function marquer(id) {
        var b = blocs[id];
        if (!b) return;
        var t = typeDe(id);
        b.classList.toggle('dissection-marque', !!t);
        if (t) b.setAttribute('data-type', t); else b.removeAttribute('data-type');
        // Lot 7 : un morceau rattaché garde sa marque en tout temps (trait en pointillé et symbole, en CSS),
        // dans la couleur de l'étiquette de son A ; le B choisi au premier toucher, la sienne.
        var a = etat.rattachements[id];
        b.classList.toggle('dissection-rattache', a != null);
        b.classList.toggle('dissection-choisi', etat.suite === id);
        classeType(b, a != null ? typeDe(a) : t);
        if (a != null) { b.setAttribute('data-suite-de', a); b.title = 'Suite de « ' + mots(a) + ' »'; }
        else { b.removeAttribute('data-suite-de'); b.removeAttribute('title'); }
    }

    function rendreFeuille() {
        var contenu = el('dissection-contenu');
        if (!contenu) return;
        // Lot 5 : refaite après une coupe, la feuille garde son défilement.
        var cv = el('dissection-canevas'), haut = cv ? cv.scrollTop : 0, gauche = cv ? cv.scrollLeft : 0;
        contenu.textContent = '';
        blocs = {};
        var f = construireFeuille(etat.doc);
        Array.prototype.forEach.call(f.querySelectorAll('.dissection-morceau'), function (b) { blocs[b.getAttribute('data-id')] = b; });
        contenu.appendChild(f);
        if (cv) { cv.scrollTop = haut; cv.scrollLeft = gauche; }
        etat.morceaux.ordre.forEach(marquer);
    }

    // ------------------------------------------------------------------
    // La palette : chaque étiquette est un surligneur
    // ------------------------------------------------------------------

    function rendrePalette() {
        var pal = el('dissection-palette');
        if (!pal || pal.childNodes.length) return;
        var groupes = {};
        function bouton(t) {
            var b = noeud('button', 'dissection-etiquette dis-t-' + t.k + (estOutil(t.k) ? ' dissection-outil' : ''));
            b.type = 'button';
            b.setAttribute('data-action', 'materielDissection.choisir');
            b.setAttribute('data-param', t.k);
            b.setAttribute('data-type', t.k);
            b.setAttribute('aria-pressed', 'false');
            b.appendChild(noeud('span', 'dissection-etiquette-trait'));
            b.lastChild.setAttribute('aria-hidden', 'true');
            b.appendChild(noeud('span', 'dissection-etiquette-nom', t.nom));
            b.appendChild(noeud('span', 'dissection-etiquette-aide', t.aide));
            if (t.precision) b.appendChild(noeud('span', 'dissection-etiquette-precision', t.precision));
            b.appendChild(noeud('span', 'dissection-etiquette-compte', ''));
            groupes[t.groupe].appendChild(b);
        }
        D().TYPES.forEach(function (t) {
            if (!groupes[t.groupe]) {
                var g = noeud('div', 'dissection-groupe');
                g.appendChild(noeud('span', 'dissection-groupe-nom', t.groupe));
                groupes[t.groupe] = g;
                pal.appendChild(g);
            }
            bouton(t);
            // Lot 5 : un outil prend place juste après l'étiquette ou l'outil qu'il suit (« Couper » après
            // « Suite », lot 7 : « Rattacher » après « Couper »).
            (function placer(k) {
                D().OUTILS.forEach(function (o) { if (o.apres === k) { bouton(o); placer(o.k); } });
            })(t.k);
        });
        var defs = el('dissection-pointes');
        if (defs && !defs.childNodes.length) {
            // Lot 7 : « Rattacher » a sa pointe, pour la flèche d'une suite vers son morceau.
            D().TYPES.concat(D().OUTILS).forEach(function (t) {
                var m = document.createElementNS(SVG, 'marker');
                m.setAttribute('id', 'dissection-pointe-' + t.k);
                m.setAttribute('viewBox', '0 0 10 10'); m.setAttribute('refX', '9'); m.setAttribute('refY', '5');
                m.setAttribute('markerWidth', '7'); m.setAttribute('markerHeight', '7'); m.setAttribute('orient', 'auto-start-reverse');
                var p = document.createElementNS(SVG, 'path');
                p.setAttribute('d', 'M0,0 L10,5 L0,10 z');
                p.setAttribute('class', 'dissection-pointe dis-t-' + t.k);
                m.appendChild(p);
                defs.appendChild(m);
            });
        }
    }

    function majPalette() {
        var compte = {};
        Object.keys(etat.liens).forEach(function (id) { var t = etat.liens[id]; compte[t] = (compte[t] || 0) + 1; });
        var pal = el('dissection-palette');
        if (!pal) return;
        Array.prototype.forEach.call(pal.querySelectorAll('.dissection-etiquette'), function (b) {
            var t = b.getAttribute('data-type'), T = enMain(t);
            b.setAttribute('aria-pressed', t === etat.actif ? 'true' : 'false');
            b.querySelector('.dissection-etiquette-compte').textContent = compte[t] ? String(compte[t]) : '';
            b.setAttribute('aria-label', T.nom + ' : ' + T.aide + (compte[t] ? ', ' + pluriel(compte[t], 'morceau surligné', 'morceaux surlignés') : ''));
        });
    }

    /**
     * Le bandeau du surligneur, toujours à sa place au-dessus de l'atelier (C1, relecture du 18 oct.) :
     * sans étiquette en main, la consigne ; avec, son nom, sa PRÉCISION (que la palette étroite ne
     * montre plus) et « Terminer ».
     */
    function majBandeau() {
        var bd = el('dissection-bandeau'), cv = el('dissection-canevas');
        if (!bd || !cv) return;
        var T = etat.actif ? enMain(etat.actif) : null, coupe = etat.actif === 'couper';
        cv.classList.toggle('dissection-pointage', !!T);
        cv.classList.toggle('dissection-coupe', coupe);
        bd.classList.toggle('dissection-bandeau-actif', !!T);
        classeType(bd, etat.actif);
        classeType(cv, etat.actif);
        el('dissection-terminer').classList.toggle('u-hide', !T);
        // Lot 5 : tant que « Couper » est en main, « Annuler la dernière coupe » dès qu'une coupe est faite.
        var annuler = el('dissection-annuler-coupe');
        if (annuler) annuler.classList.toggle('u-hide', !(coupe && etat.coupes.length));
        el('dissection-bandeau-texte').textContent = coupe
            ? TEXTES_COUPE.bandeau
            : etat.actif === 'rattacher'
                ? (etat.suite ? TEXTES_LIEN.bandeauChoix(mots(etat.suite)) : TEXTES_LIEN.bandeau)
            : T
                ? 'Surligneur « ' + T.nom + ' » : touche ou surligne les morceaux de ta grille qu’il désigne. Touche un morceau déjà surligné pour le retirer.'
                : 'Touche une étiquette dans la palette : elle devient ton surligneur.';
        var pr = el('dissection-bandeau-precision');
        pr.textContent = T && T.precision ? T.nom + ' : ' + T.precision : '';
        pr.classList.toggle('u-hide', !(T && T.precision));
    }

    function choisir(type) {
        if (!enMain(type)) return;
        etat.actif = etat.actif === type ? null : type;
        desarmer();
        // Lot 7 : poser « Rattacher » (une autre étiquette, « Terminer », Échap) annule le choix d'une suite.
        if (etat.suite) { var s = etat.suite; etat.suite = null; marquer(s); }
        majPalette(); majBandeau(); planifierDessin();
        if (etat.actif === 'couper') dire(TEXTES_COUPE.enMain);
        else if (etat.actif === 'rattacher') dire(TEXTES_LIEN.enMain);
        else dire(etat.actif ? 'Surligneur « ' + D().TYPE[etat.actif].nom + ' » en main : touche ou surligne les morceaux de ta grille qu’il désigne.' : '');
    }

    function terminer() {
        if (etat.actif) choisir(etat.actif);
    }

    function eclair(type) {
        var b = document.querySelector('#dissection-palette .dissection-etiquette[data-type="' + type + '"]');
        if (!b) return;
        b.classList.remove('dissection-eclair');
        void b.offsetWidth;
        b.classList.add('dissection-eclair');
    }

    // ------------------------------------------------------------------
    // Les gestes : toucher, glisser (événements de pointeur)
    // ------------------------------------------------------------------

    /** Lot 7 : le morceau rattaché qu'un surlignage a voulu étiqueter, pour le dire au lever du doigt. */
    var suiteTouchee = null;

    function appliquer(id, mode) {
        etat.erreur = '';
        // Lot 7 : un morceau rattaché ne prend pas d'étiquette ; celle de son A vaut pour les deux.
        if (etat.rattachements[id] != null) { suiteTouchee = id; return; }
        if (mode === 'ajouter') etat.liens[id] = etat.actif;
        else if (etat.liens[id] === etat.actif) delete etat.liens[id];
        marquer(id);
        // C1 du lot 7 (verdict du 18 oct., 17 h 15) : ses suites prennent la couleur de l'étiquette posée,
        // changée ou retirée sur lui.
        Object.keys(etat.rattachements).forEach(function (b) { if (etat.rattachements[b] === id) marquer(b); });
        planifierDessin();
    }

    function surPointeur(e) {
        var b = e.target.closest ? e.target.closest('.dissection-morceau') : null;
        if (!b || !etat.doc) return;
        var id = b.getAttribute('data-id');
        if (!etat.actif) {
            var t = typeDe(id);
            if (etat.rattachements[id] != null) dire(TEXTES_LIEN.suiteDe(mots(etat.rattachements[id])));
            else if (t) { eclair(t); dire('Ce morceau porte l’étiquette « ' + D().TYPE[t].nom + ' ». Pour la changer, touche une autre étiquette, puis ce morceau.'); }
            else dire('Touche d’abord une étiquette dans la palette : elle devient ton surligneur.');
            return;
        }
        if (etat.actif === 'couper') { gesteCoupe(e, id); return; }
        if (etat.actif === 'rattacher') { gesteToucher(e, function () { toucherLien(id); }); return; }
        e.preventDefault();
        var feuille = e.currentTarget;
        var mode = etat.liens[id] === etat.actif ? 'retirer' : 'ajouter';
        var vus = {};
        vus[id] = 1;
        suiteTouchee = null;
        appliquer(id, mode);
        try { feuille.setPointerCapture(e.pointerId); } catch (er) { /* sans capture, le surlignage s'arrête au bord */ }
        function bouger(ev) {
            var cible = document.elementFromPoint(ev.clientX, ev.clientY);
            var bb = cible && cible.closest ? cible.closest('.dissection-morceau') : null;
            if (bb && feuille.contains(bb)) {
                var i2 = bb.getAttribute('data-id');
                if (!vus[i2]) { vus[i2] = 1; appliquer(i2, mode); }
            }
        }
        function fin() {
            feuille.removeEventListener('pointermove', bouger);
            feuille.removeEventListener('pointerup', fin);
            feuille.removeEventListener('pointercancel', fin);
            desarmer();
            majPalette();
            rendreLecture();
            if (suiteTouchee) { dire(TEXTES_LIEN.sansEtiquette(mots(etat.rattachements[suiteTouchee]))); suiteTouchee = null; }
        }
        feuille.addEventListener('pointermove', bouger);
        feuille.addEventListener('pointerup', fin);
        feuille.addEventListener('pointercancel', fin);
    }

    // ------------------------------------------------------------------
    // Couper (lot 5) : un toucher, une coupe ; le glisser ne coupe pas
    // ------------------------------------------------------------------

    /**
     * Le rang touché dans le texte d'un morceau : `caretRangeFromPoint` (WebKit), sinon
     * `caretPositionFromPoint` ; à défaut, ou hors de son texte, le milieu du morceau.
     */
    function rangTouche(b, x, y) {
        var r = null;
        try {
            if (document.caretRangeFromPoint) {
                var rg = document.caretRangeFromPoint(x, y);
                if (rg) r = { n: rg.startContainer, o: rg.startOffset };
            } else if (document.caretPositionFromPoint) {
                var cp = document.caretPositionFromPoint(x, y);
                if (cp) r = { n: cp.offsetNode, o: cp.offset };
            }
        } catch (er) { r = null; }
        if (r && b.firstChild && r.n === b.firstChild) return r.o;
        return Math.floor(String(b.textContent).length / 2);
    }

    /**
     * Un toucher d'outil : `agir` se fait au lever, si le doigt n'a pas glissé (« Couper », lot 5 ;
     * « Rattacher », lot 7).
     */
    function gesteToucher(e, agir) {
        e.preventDefault();
        var feuille = e.currentTarget, x = e.clientX, y = e.clientY, glisse = false;
        try { feuille.setPointerCapture(e.pointerId); } catch (er) { /* sans capture, le lever hors de la feuille n'agit pas */ }
        function bouger(ev) { if (Math.abs(ev.clientX - x) > 8 || Math.abs(ev.clientY - y) > 8) glisse = true; }
        function fin(ev) {
            feuille.removeEventListener('pointermove', bouger);
            feuille.removeEventListener('pointerup', fin);
            feuille.removeEventListener('pointercancel', fin);
            desarmer();
            if (ev.type === 'pointerup' && !glisse) agir();
        }
        feuille.addEventListener('pointermove', bouger);
        feuille.addEventListener('pointerup', fin);
        feuille.addEventListener('pointercancel', fin);
    }

    /** Le point touché est lu au toucher ; la coupe se fait au lever, si le doigt n'a pas glissé. */
    function gesteCoupe(e, id) {
        var decalage = rangTouche(blocs[id], e.clientX, e.clientY);
        gesteToucher(e, function () { couperMorceau(id, decalage); });
    }

    /** La feuille, les compteurs, le bandeau et la lecture, refaits après une coupe ou son annulation. */
    function apresCoupe() {
        etat.erreur = '';
        etat.morceaux = D().morceaux(etat.doc);
        rendreFeuille();
        majPalette(); majBandeau(); rendreLecture(); planifierDessin();
    }

    function couperMorceau(id, decalage) {
        if (!etat.doc || etat.enCours) return;
        var r = D().couper(etat.doc, id, decalage);
        if (!r) { dire(TEXTES_COUPE.unMot); return; }
        // La pile garde le document d'avant et l'étiquette d'origine : l'annulation les rend tels quels.
        etat.coupes.push({ doc: etat.doc, id: id, type: etat.liens[id] || null, parties: r.parties });
        etat.liens = D().liensApresCoupe(etat.liens, id, r.parties);
        // Lot 7 : la première partie prend aussi sa place dans ses liens.
        etat.rattachements = D().rattachementsApresCoupe(etat.rattachements, id, r.parties);
        etat.doc = r.doc;
        apresCoupe();
        var M = etat.morceaux;
        dire(TEXTES_COUPE.coupe(M.texte[r.parties[0]], M.texte[r.parties[1]]));
    }

    /** « Annuler la dernière coupe » : les deux parties recollées, l'étiquette d'origine rendue. */
    function annulerCoupe() {
        var c = etat.coupes.pop();
        if (!c || !etat.doc || etat.enCours) { if (c) etat.coupes.push(c); return; }
        // Lot 7 : d'abord défaire les liens qui touchent ses deux parties.
        var avant = Object.keys(etat.rattachements).length;
        etat.rattachements = D().rattachementsSansParties(etat.rattachements, c.parties);
        var defaits = avant > Object.keys(etat.rattachements).length;
        var r = D().recoller(etat.liens, c);
        etat.doc = r.doc;
        etat.liens = r.liens;
        apresCoupe();
        dire(TEXTES_COUPE.annulee(etat.morceaux.texte[c.id]) + (defaits ? TEXTES_COUPE.lienDefait : ''));
    }

    // ------------------------------------------------------------------
    // Rattacher (lot 7) : deux touchers, la suite puis le morceau qu'elle continue
    // ------------------------------------------------------------------

    /** La feuille marquée, la palette, le bandeau, la lecture et les flèches, refaits après un geste de lien. */
    function apresLien() {
        etat.erreur = '';
        etat.morceaux.ordre.forEach(marquer);
        majPalette(); majBandeau(); rendreLecture(); planifierDessin();
    }

    /**
     * Un toucher, « Rattacher » en main. Sans suite choisie : un morceau rattaché voit son lien défait,
     * un autre devient la suite choisie. Avec : la retoucher annule le choix ; un autre morceau est
     * celui qu'elle continue, et le lien se crée, ou le refus se dit (le choix reste, pour réessayer).
     */
    function toucherLien(id) {
        if (!etat.doc || etat.enCours) return;
        var b = etat.suite;
        if (!b) {
            if (etat.rattachements[id] != null) {
                etat.rattachements = D().detacher(etat.rattachements, id);
                apresLien();
                dire(TEXTES_LIEN.defait(mots(id)));
                return;
            }
            etat.suite = id;
            apresLien();
            dire(TEXTES_LIEN.choisi(mots(id)));
            return;
        }
        if (id === b) { etat.suite = null; apresLien(); dire(TEXTES_LIEN.annule); return; }
        var r = D().rattacher(etat.rattachements, etat.liens, b, id);
        if (r.refus) {
            dire(r.refus === 'soi' ? TEXTES_LIEN.soi : r.refus === 'boucle' ? TEXTES_LIEN.boucle(mots(b)) : TEXTES_LIEN.dejaSuite(mots(r.de)));
            return;
        }
        etat.rattachements = r.rattachements;
        etat.liens = r.liens;
        etat.suite = null;
        apresLien();
        var M = D().morceauxLus(etat.doc, etat.rattachements);
        dire(TEXTES_LIEN.lie(M.texte[id]) + (r.retiree ? TEXTES_LIEN.etiquetteRetiree(D().TYPE[r.retiree].nom) : ''));
    }

    // ------------------------------------------------------------------
    // Les flèches : de l'étiquette en main vers ses morceaux visibles
    // ------------------------------------------------------------------

    function planifierDessin() {
        if (dessinPrevu) return;
        dessinPrevu = true;
        requestAnimationFrame(function () { dessinPrevu = false; dessiner(); });
    }

    function proche(R, px, py) { return { x: Math.min(Math.max(px, R.x), R.x + R.w), y: Math.min(Math.max(py, R.y), R.y + R.h) }; }

    function dessiner() {
        var traits = el('dissection-traits'), atelier = el('dissection-atelier'), cv = el('dissection-canevas');
        if (!traits || !atelier || !cv) return;
        traits.textContent = '';
        if (!etat.actif || !etat.doc) return;
        if (etat.actif === 'rattacher') { dessinerLiens(traits, atelier.getBoundingClientRect(), cv.getBoundingClientRect()); return; }
        var it =document.querySelector('#dissection-palette .dissection-etiquette[data-type="' + etat.actif + '"]');
        if (!it) return;
        var a = atelier.getBoundingClientRect(), ir = it.getBoundingClientRect(), c = cv.getBoundingClientRect();
        // La palette défile dans son cadre : une étiquette sortie du cadre envoie ses flèches depuis son bord.
        var pr = el('dissection-palette').getBoundingClientRect();
        var haut = Math.min(Math.max(ir.top, pr.top), pr.bottom), bas = Math.max(Math.min(ir.bottom, pr.bottom), pr.top);
        var C = { x: ir.left - a.left, y: haut - a.top, w: ir.width, h: bas - haut };
        Object.keys(etat.liens).forEach(function (id) {
            if (etat.liens[id] !== etat.actif || !blocs[id]) return;
            var r = blocs[id].getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            if (cx < c.left || cx > c.right || cy < c.top || cy > c.bottom) return;
            var B = { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height };
            var s = proche(C, B.x + B.w / 2, B.y + B.h / 2), f = proche(B, C.x + C.w / 2, C.y + C.h / 2);
            var mx = s.x + (f.x - s.x) / 2;
            var p = document.createElementNS(SVG, 'path');
            p.setAttribute('d', 'M' + s.x + ',' + s.y + ' C' + mx + ',' + s.y + ' ' + mx + ',' + f.y + ' ' + f.x + ',' + f.y);
            p.setAttribute('class', 'dissection-trait dis-t-' + etat.actif);
            p.setAttribute('marker-end', 'url(#dissection-pointe-' + etat.actif + ')');
            traits.appendChild(p);
        });
    }

    /**
     * Lot 7, « Rattacher » en main : une flèche de chaque suite vers le morceau qu'elle continue, par la
     * gauche des deux morceaux (une suite est le plus souvent juste sous lui, dans la même case), si les
     * deux sont dans le canevas visible.
     */
    function dessinerLiens(traits, a, c) {
        function dedans(r) { var cy = r.top + r.height / 2; return r.right > c.left && r.left < c.right && cy >= c.top && cy <= c.bottom; }
        Object.keys(etat.rattachements).forEach(function (b) {
            var idA = etat.rattachements[b];
            if (!blocs[b] || !blocs[idA]) return;
            var rb = blocs[b].getBoundingClientRect(), ra = blocs[idA].getBoundingClientRect();
            if (!dedans(rb) || !dedans(ra)) return;
            var sx = Math.max(rb.left, c.left) - a.left, sy = rb.top + rb.height / 2 - a.top;
            var fx = Math.max(ra.left, c.left) - a.left, fy = ra.top + ra.height / 2 - a.top;
            // La courbe reste dans le canevas : elle ne passe pas sur la palette.
            var bx = Math.max(c.left - a.left + 4, Math.min(sx, fx) - 18 - Math.min(40, Math.abs(fy - sy) / 6));
            var p = document.createElementNS(SVG, 'path');
            p.setAttribute('d', 'M' + sx + ',' + sy + ' C' + bx + ',' + sy + ' ' + bx + ',' + fy + ' ' + fx + ',' + fy);
            p.setAttribute('class', 'dissection-trait dissection-trait-lien dis-t-rattacher');
            p.setAttribute('data-de', b);
            p.setAttribute('data-vers', idA);
            p.setAttribute('marker-end', 'url(#dissection-pointe-rattacher)');
            traits.appendChild(p);
        });
    }

    // ------------------------------------------------------------------
    // La lecture : « Ta grille, telle que l'application la comprendrait »
    // ------------------------------------------------------------------

    function pts(arr) {
        return arr.map(function (p) {
            return p[0] === p[1] ? fmt(p[0]) + (p[0] > 1 ? ' pts' : ' pt') : fmt(p[0]) + ' à ' + fmt(p[1]) + ' pts';
        }).join(', ');
    }

    function phraseLogique(b) {
        if (b.logique === 'deux') return 'L’application y lirait les deux logiques : des niveaux nommés, et des points qui s’additionnent' + (b.jusqua != null ? ' jusqu’à ' + fmt(b.jusqua) : '') + '. Elle ne convertirait rien : ce serait à toi de dire laquelle compte pour la note.';
        if (b.logique === 'points') return 'L’application y lirait une grille en points : les points de chaque critère s’additionnent' + (b.jusqua != null ? ' jusqu’à un total de ' + fmt(b.jusqua) : '') + '. Aucun niveau n’y est nommé (et l’application n’en inventerait pas).';
        if (b.logique === 'niveaux') return 'L’application y lirait une grille en niveaux : chaque critère se juge par niveau, sans points à additionner.';
        return '';
    }

    function tableComprise(R) {
        var nCol = R.avecNiveaux ? R.niveaux.length : 1;
        var t = noeud('table', 'dissection-table-comprise');
        var thead = noeud('thead'), th = noeud('tr');
        [ 'Critère', 'Pondération' ].forEach(function (x) { var c = noeud('th', null, x); c.scope = 'col'; th.appendChild(c); });
        if (R.avecNiveaux) R.niveaux.forEach(function (n) { var c = noeud('th', null, n); c.scope = 'col'; th.appendChild(c); });
        else { var c0 = noeud('th', null, 'Réponses possibles et leurs points'); c0.scope = 'col'; th.appendChild(c0); }
        thead.appendChild(th);
        t.appendChild(thead);
        var tbody = noeud('tbody'), sec = null;
        R.criteres.forEach(function (c) {
            if (c.section && c.section !== sec) {
                sec = c.section;
                var trs = noeud('tr', 'dissection-ligne-section'), tds = noeud('td', null, c.section.nom);
                tds.colSpan = nCol + 2;
                trs.appendChild(tds);
                tbody.appendChild(trs);
            }
            var tr = noeud('tr'), tdn = noeud('td');
            if (c.nom) tdn.appendChild(noeud('div', 'dissection-crit-nom', c.nom));
            else tdn.appendChild(noeud('div', 'dissection-a-nommer', 'Critère à nommer (' + c.numero + ')'));
            c.desc.forEach(function (d) { tdn.appendChild(noeud('div', 'dissection-crit-desc', d)); });
            if (c.sous.length) {
                var ul = noeud('ul');
                c.sous.forEach(function (s) { ul.appendChild(noeud('li', null, s)); });
                tdn.appendChild(ul);
            }
            tr.appendChild(tdn);
            var tdp = noeud('td');
            if (c.pond != null) tdp.textContent = fmt(c.pond);
            else if (c.pondDeduite != null) {
                tdp.appendChild(document.createTextNode(fmt(c.pondDeduite) + ' '));
                tdp.appendChild(noeud('span', 'dissection-deduit', '(tirée des points)'));
            } else tdp.appendChild(noeud('span', 'dissection-vide', '—'));
            tr.appendChild(tdp);
            if (R.avecNiveaux) {
                for (var i = 0; i < nCol; i++) {
                    var cell = c.niv[i], td = noeud('td');
                    if (cell && (cell.desc.length || cell.pts.length)) {
                        if (cell.desc.length) td.appendChild(noeud('div', null, cell.desc.join(' ')));
                        if (cell.pts.length) td.appendChild(noeud('span', 'dissection-pts', pts(cell.pts)));
                    } else td.appendChild(noeud('span', 'dissection-vide', '—'));
                    tr.appendChild(td);
                }
            } else {
                var tdr = noeud('td');
                if (c.reponses.length) {
                    var ulr = noeud('ul', 'dissection-reponses');
                    c.reponses.forEach(function (r) {
                        var li = noeud('li');
                        li.appendChild(noeud('span', 'dissection-pts' + (r.pts.length ? '' : ' dissection-pts-sans'), r.pts.length ? pts(r.pts) : 'sans points'));
                        li.appendChild(noeud('span', null, r.desc));
                        ulr.appendChild(li);
                    });
                    tdr.appendChild(ulr);
                } else tdr.appendChild(noeud('span', 'dissection-vide', '—'));
                tr.appendChild(tdr);
            }
            tbody.appendChild(tr);
        });
        t.appendChild(tbody);
        return t;
    }

    function rendreLecture() {
        var cs = el('dissection-constats'), cp = el('dissection-comprise'), sp = el('dissection-sans-place'), lg = el('dissection-logique');
        if (!cs || !cp || !sp || !lg || !etat.doc) return;
        var R = lire(), b = D().bilan(R);
        cs.textContent = ''; cp.textContent = ''; sp.textContent = ''; lg.textContent = '';
        lg.classList.add('u-hide');
        rendreCreer(R);
        if (!Object.keys(etat.liens).length) {
            cp.appendChild(noeud('p', 'dissection-vide', 'Surligne ta grille : la lecture de l’application apparaîtra ici.'));
            return;
        }
        var phrase = phraseLogique(b);
        if (phrase) { lg.textContent = phrase; lg.classList.remove('u-hide'); }
        rendreConstats(cs, R, b);
        if (R.description.length) cp.appendChild(noeud('p', 'dissection-crit-desc', R.description.join(' ')));
        if (!R.criteres.length) {
            cp.appendChild(noeud('p', 'dissection-vide', 'Aucun critère pour l’instant : surligne une question que tu te poses devant la copie avec « Critère », ou des réponses avec « Descripteur ».'));
        } else {
            cp.appendChild(tableComprise(R));
        }
        if (R.sansPlace.length) {
            sp.appendChild(noeud('p', null, 'Ces morceaux ont une étiquette, mais l’application ne saurait pas où les ranger :'));
            var ul = noeud('ul');
            R.sansPlace.forEach(function (s) { ul.appendChild(noeud('li', null, '« ' + s.t + ' » (' + D().TYPE[s.type].nom + ') : ' + s.raison)); });
            sp.appendChild(ul);
        }
    }

    // ------------------------------------------------------------------
    // Créer (lot 2a) : le bouton, ou ce qui l'empêche
    // ------------------------------------------------------------------

    function nomsGrilles() {
        try {
            return (db.getSync(cle('grillesTemplates'), []) || []).map(function (g) { return g && g.nom; }).filter(Boolean);
        } catch (err) { return []; }
    }

    // Textes de Claude Code, validé G. 18 oct. ; « Avant de créer, il reste : » est celui de la 1.203.
    var TEXTES_CREER = {
        bouton: 'Créer ma grille',
        enCours: 'Création…',
        nom: 'Nom de ta grille',
        raisons: 'Avant de créer, il reste :',
        // Lot 9, validé G. 18 oct. 20 h 08 : ce qui manque sans empêcher de créer.
        aCompleter: 'Tu pourras créer ta grille, puis compléter dans « Grilles de critères » :',
        // Lot 2b : le choix (logique « les deux » seulement) et le tableau des niveaux.
        choix: 'Le résultat d’une copie viendrait :',
        choixPoints: 'des points',
        choixNiveaux: 'des niveaux',
        niveaux: 'Ce que vaut chaque niveau',
        niveauxAide: 'Pour chaque niveau : la plage de notes qu’il couvre, et la note qu’une copie reçoit à ce niveau.',
        de: 'de',
        a: 'à',
        note: 'note retenue',
        pourcent: '%'
    };

    /** Le nom tapé (C3), ou `undefined` tant que l'enseignant n'a pas touché au champ : le Titre étiqueté vaut. */
    function nomTape() { return etat.nomSaisi == null ? undefined : etat.nomSaisi; }

    function creation(R) { return D().creation(R, { nomsGrilles: nomsGrilles() }, nomTape(), { compte: etat.compte, valeurs: etat.valeurs }); }

    /**
     * Lot 2b : « Le résultat d'une copie viendrait : des points / des niveaux », pour une grille qui a
     * les deux seulement ; « des points » coché par défaut (décision de Grégoire, 18 oct., 7 h 31).
     */
    function champChoix() {
        var fs = noeud('fieldset', 'dissection-creer-choix');
        fs.id = 'dissection-creer-choix';
        fs.appendChild(noeud('legend', null, TEXTES_CREER.choix));
        [['points', TEXTES_CREER.choixPoints], ['niveaux', TEXTES_CREER.choixNiveaux]].forEach(function (o) {
            var lab = noeud('label', 'dissection-creer-option');
            var r = noeud('input');
            r.type = 'radio';
            r.name = 'dissection-compte';
            r.id = 'dissection-compte-' + o[0];
            r.value = o[0];
            r.checked = etat.compte === o[0];
            r.addEventListener('change', function () {
                if (!r.checked) return;
                etat.compte = o[0];
                etat.erreur = '';
                rendreCreer(lire());
            });
            lab.appendChild(r);
            lab.appendChild(noeud('span', null, o[1]));
            fs.appendChild(lab);
        });
        return fs;
    }

    /** Un champ de saisie d'un niveau : vide, sauf ce que l'enseignant y a tapé (décision du 18 oct., 8 h 43). */
    function champNiveau(cleNiv, quoi, id, libelle, nomNiveau, sansUnite) {
        var bloc = noeud('span', 'dissection-niveau-champ');
        var lab = noeud('label');
        lab.setAttribute('for', id);
        lab.appendChild(noeud('span', 'u-lecteur-ecran', nomNiveau + ', '));
        lab.appendChild(document.createTextNode(libelle));
        var c = noeud('input', 'controle-form');
        c.id = id;
        c.type = 'text';
        c.inputMode = 'decimal';
        c.autocomplete = 'off';
        c.value = (etat.valeurs[cleNiv] && etat.valeurs[cleNiv][quoi]) || '';   // .value : jamais du HTML
        c.addEventListener('input', function () {
            if (!etat.valeurs[cleNiv]) etat.valeurs[cleNiv] = {};
            etat.valeurs[cleNiv][quoi] = c.value;
            etat.erreur = '';
            rendreActions(creation(lire()));
        });
        bloc.appendChild(lab);
        bloc.appendChild(c);
        if (!sansUnite) bloc.appendChild(noeud('span', 'dissection-niveau-unite', TEXTES_CREER.pourcent));
        return bloc;
    }

    /**
     * Lot 2b : « Ce que vaut chaque niveau », une rangée par niveau dans l'ordre lu, son nom tel
     * qu'étiqueté, puis « de … à … % » et « note retenue … % ». Rien de proposé ni de calculé, même
     * quand des points sont écrits par niveau. Les `id` suivent le rang du niveau.
     */
    function tableauNiveaux(R) {
        var fs = noeud('fieldset', 'dissection-creer-niveaux');
        fs.id = 'dissection-creer-niveaux';
        fs.appendChild(noeud('legend', null, TEXTES_CREER.niveaux));
        fs.appendChild(noeud('p', 'dissection-creer-niveaux-aide', TEXTES_CREER.niveauxAide));
        var cles = D().clesNiveaux(R);
        R.niveaux.forEach(function (nom, i) {
            var rangee = noeud('div', 'dissection-niveau');
            rangee.appendChild(noeud('span', 'dissection-niveau-nom', nom));
            var plage = noeud('span', 'dissection-niveau-plage');
            plage.appendChild(champNiveau(cles[i], 'min', 'dissection-niv-' + i + '-min', TEXTES_CREER.de, nom, true));   // « de … à … % »
            plage.appendChild(champNiveau(cles[i], 'max', 'dissection-niv-' + i + '-max', TEXTES_CREER.a, nom));
            rangee.appendChild(plage);
            rangee.appendChild(champNiveau(cles[i], 'note', 'dissection-niv-' + i + '-note', TEXTES_CREER.note, nom));
            fs.appendChild(rangee);
        });
        return fs;
    }

    /**
     * C3 (verdict du 18 oct., décision de Grégoire) : le champ « Nom de ta grille », au-dessus du bouton,
     * prérempli avec le Titre étiqueté. Aucun « (2) » ajouté : le nom s'imprime sur le PDF des étudiant·es.
     */
    function champNom(R) {
        var bloc = noeud('div', 'dissection-creer-nom');
        var lab = noeud('label', null, TEXTES_CREER.nom);
        lab.setAttribute('for', 'dissection-nom-grille');
        var champ = noeud('input', 'controle-form');
        champ.id = 'dissection-nom-grille';
        champ.type = 'text';
        champ.maxLength = window.materielAssistant.MAX_NOM;
        champ.autocomplete = 'off';
        champ.value = etat.nomSaisi != null ? etat.nomSaisi : D().nomPropose(R);   // .value : jamais du HTML
        champ.addEventListener('input', function () {
            etat.nomSaisi = champ.value;
            etat.erreur = '';
            rendreActions(creation(lire()));
        });
        bloc.appendChild(lab);
        bloc.appendChild(champ);
        return bloc;
    }

    /** Le bouton, ce qui l'empêche (écrit à côté), l'échec d'une écriture. Le champ n'est pas redessiné. */
    function rendreActions(c) {
        var z = el('dissection-creer-actions'), champ = el('dissection-nom-grille');
        if (!z) return;
        z.textContent = '';
        var b = noeud('button', 'btn btn-principal', etat.enCours ? TEXTES_CREER.enCours : TEXTES_CREER.bouton);
        b.type = 'button';
        b.setAttribute('data-action', 'materielDissection.creer');
        b.disabled = c.raisons.length > 0 || etat.enCours;
        z.appendChild(b);
        if (champ) champ.removeAttribute('aria-describedby');
        if (c.raisons.length) {
            var r = noeud('div', 'dissection-creer-raisons');
            r.id = 'dissection-creer-raisons';
            r.appendChild(noeud('strong', null, TEXTES_CREER.raisons));
            var ul = noeud('ul');
            c.raisons.forEach(function (t) { ul.appendChild(noeud('li', null, t)); });
            r.appendChild(ul);
            z.appendChild(r);
            b.setAttribute('aria-describedby', r.id);
            if (champ) champ.setAttribute('aria-describedby', r.id);
        }
        // Lot 9 : les points ou pondérations qui manquent, sous leur intitulé ; ils ne grisent pas le bouton.
        if ((c.aCompleter || []).length) {
            var ac = noeud('div', 'dissection-creer-a-completer');
            ac.id = 'dissection-creer-a-completer';
            ac.appendChild(noeud('strong', null, TEXTES_CREER.aCompleter));
            var ula = noeud('ul');
            c.aCompleter.forEach(function (t) { ula.appendChild(noeud('li', null, t)); });
            ac.appendChild(ula);
            z.appendChild(ac);
        }
        // Lot 2b : les avertissements de `calculs(m)`, tels quels ; ils n'empêchent rien.
        (c.avertissements || []).forEach(function (t) { z.appendChild(noeud('p', 'alerte alerte-attention dissection-creer-avert', t)); });
        if (etat.erreur) {
            var p = noeud('p', 'alerte alerte-erreur', etat.erreur);
            p.setAttribute('role', 'alert');
            z.appendChild(p);
        }
    }

    /**
     * Sous la lecture : rien sans étiquette ; sinon, le choix (logique « les deux »), le tableau des
     * niveaux (en niveaux, lot 2b), le champ du nom, le bouton et ses raisons. Le champ du nom existant
     * est GARDÉ (pas de focus perdu) ; tant qu'on n'y a pas touché, il suit le Titre étiqueté. Le choix
     * et le tableau se refont d'un geste d'étiquetage ou du choix, jamais d'une frappe : leurs valeurs
     * viennent de l'état de la page.
     */
    function rendreCreer(R) {
        var z = el('dissection-creer');
        if (!z) return;
        if (!Object.keys(etat.liens).length) { z.textContent = ''; return; }
        var c = creation(R);
        var champ = el('dissection-nom-grille');
        if (!champ) {
            z.textContent = '';
            var zc = noeud('div', 'dissection-creer-saisie');
            zc.id = 'dissection-creer-saisie';
            z.appendChild(zc);
            z.appendChild(champNom(R));
            var actions = noeud('div', 'dissection-creer-actions');
            actions.id = 'dissection-creer-actions';
            z.appendChild(actions);
        } else if (etat.nomSaisi == null) champ.value = D().nomPropose(R);
        // Le choix, touché, n'est pas redessiné (son focus resterait sinon en l'air).
        var saisie = el('dissection-creer-saisie'), choix = el('dissection-creer-choix'), tab = el('dissection-creer-niveaux');
        var deux = D().bilan(R).logique === 'deux';
        if (choix && !deux) saisie.removeChild(choix);
        if (!choix && deux) saisie.insertBefore(champChoix(), saisie.firstChild);
        if (tab) saisie.removeChild(tab);
        if (c.enNiveaux) saisie.appendChild(tableauNiveaux(R));
        rendreActions(c);
    }

    /**
     * « Créer ma grille » : l'écriture de `materielCreation.creer`, puis la confirmation. Un échec
     * affiche son message, et la dissection reste telle quelle pour réessayer. Un second toucher
     * pendant l'écriture est sans effet.
     */
    async function creer() {
        if (etat.enCours || !etat.doc) return;
        var c = creation(lire());
        if (c.raisons.length) { rendreLecture(); return; }
        var doc = etat.doc;
        etat.enCours = true;
        etat.erreur = '';
        rendreLecture();
        var r;
        try { r = await window.materielCreation.creer(c.modele); } finally { if (etat.doc === doc) etat.enCours = false; }
        if (etat.doc !== doc) return;   // la page a changé de grille pendant l'écriture
        if (r.erreur) {
            etat.erreur = r.erreur;
            rendreLecture();
            var b = document.querySelector('[data-action="materielDissection.creer"]');
            if (b) b.focus();
            return;
        }
        window.materiel.montrerCreee(r.resume);
    }

    /** Les constats en pastilles : titre, sections, critères, niveaux, réponses, somme et total, morceaux sans étiquette. */
    function rendreConstats(cs, R, b) {
        function constat(t, cl) { cs.appendChild(noeud('span', 'dissection-constat' + (cl ? ' ' + cl : ''), t)); }
        var secs = [];
        R.criteres.forEach(function (c) { if (c.section && secs.indexOf(c.section) < 0) secs.push(c.section); });
        if (R.titre.length) constat('Titre : ' + R.titre.join(' '));
        if (secs.length) constat(pluriel(secs.length, 'section', 'sections'));
        constat(pluriel(R.criteres.length, 'critère', 'critères') + (R.aNommer ? ', dont ' + R.aNommer + ' à nommer' : ''));
        if (R.avecNiveaux) constat(pluriel(R.niveaux.length, 'niveau', 'niveaux'));
        if (R.nb.descripteur) constat(pluriel(R.nb.descripteur, 'réponse décrite', 'réponses décrites'));
        if (b.totalOk != null) {
            constat('Somme des pondérations : ' + fmt(b.somme) + ' · ton total : ' + fmt(R.totalNb) + (b.totalOk ? ' ✓' : ' : écart'),
                b.totalOk ? 'dissection-constat-ok' : 'dissection-constat-ecart');
        } else if (b.aDesPoids) constat('Somme des pondérations : ' + fmt(b.somme));
        constat(pluriel(R.sansEtiquette, 'morceau sans étiquette', 'morceaux sans étiquette'));
    }

    // ------------------------------------------------------------------
    // Ouvrir, fermer
    // ------------------------------------------------------------------

    function brancher() {
        var contenu = el('dissection-contenu');
        if (contenu && !contenu.dataset.dissectionBranche) {
            contenu.addEventListener('pointerdown', surPointeur);
            contenu.dataset.dissectionBranche = '1';
        }
    }

    /**
     * Ouvre la dissection sur un document disséqué (`materielDissectionLecture.docDepuisPressePapiers`
     * ou `exempleDoc`) : l'accueil se masque, la grille s'affiche sans étiquette.
     */
    function ouvrir(doc, message) {
        var vue = el('materiel-dissection'), accueil = el('materiel-accueil');
        if (!doc || !vue) return false;
        etat = etatNeuf(doc);
        desarmer();
        brancher();
        rendrePalette();
        rendreFeuille();
        majPalette(); majBandeau(); rendreLecture(); planifierDessin();
        if (accueil) accueil.classList.add('u-hide');
        vue.classList.remove('u-hide');
        var n = etat.morceaux.ordre.length;
        dire(message || (doc.mode === 'table'
            ? 'Tableau collé : ' + pluriel(doc.rows.length, 'rangée', 'rangées') + ', ' + pluriel(n, 'morceau', 'morceaux') + '. Touche une étiquette, puis surligne.'
            // Validé G. 18 oct. 9 h 52 avec « rattachera » ; revu pour le nom de l'outil du lot 7, validé G. 18 oct. 17 h 18.
            : 'Texte collé : ' + pluriel(n, 'ligne', 'lignes') + ', sans tableau. L’application rangera les morceaux selon leur ordre.'));
        var titre = el('dissection-titre');
        if (titre) titre.focus();   // règle SPA : le focus suit le changement de vue
        return true;
    }

    /** Retour à l'accueil : la dissection en cours est oubliée (rien n'avait été écrit). */
    function fermer() {
        etat = etatNeuf(null);
        blocs = {};
        var vue = el('materiel-dissection'), contenu = el('dissection-contenu'), traits = el('dissection-traits');
        if (contenu) contenu.textContent = '';
        if (traits) traits.textContent = '';
        if (vue) vue.classList.add('u-hide');
        dire('');
    }

    // ------------------------------------------------------------------
    // Les gestes à deux temps : un premier toucher arme le bouton, le second agit
    // ------------------------------------------------------------------

    /** Texte de repos et texte armé (« Confirmer : … » : de Claude Code, validé G. 18 oct.). */
    var DEUX_TEMPS = {
        'materielDissection.toutRetirer': { repos: 'Retirer les étiquettes', armee: 'Confirmer : tout retirer' },
        'materielDissection.collerAutre': { repos: 'Coller une autre grille', armee: 'Confirmer : coller une autre grille' }
    };

    /** Tout autre geste (une étiquette, un surlignage, une autre grille) désarme les boutons. */
    function desarmer() {
        Object.keys(DEUX_TEMPS).forEach(function (action) {
            var b = document.querySelector('[data-action="' + action + '"]');
            if (b) { b.removeAttribute('data-confirmer'); b.textContent = DEUX_TEMPS[action].repos; }
        });
    }

    /** Vrai si ce toucher doit agir : le bouton était armé (ou l'appel ne vient pas d'un bouton). */
    function confirme(bouton, action) {
        if (bouton && bouton.getAttribute && bouton.getAttribute('data-confirmer') !== '1') {
            desarmer();
            bouton.setAttribute('data-confirmer', '1');
            bouton.textContent = DEUX_TEMPS[action].armee;
            return false;
        }
        desarmer();
        return true;
    }

    /**
     * « Coller une autre grille » (C2, relecture du 18 oct.) : sans étiquette posée, retour à l'accueil
     * tout de suite ; dès qu'une étiquette est posée, une coupe faite (lot 5) ou un lien créé (lot 7), un
     * premier toucher demande confirmation.
     */
    function collerAutre(bouton) {
        var travail = Object.keys(etat.liens).length || etat.coupes.length || Object.keys(etat.rattachements).length;
        if (travail && !confirme(bouton, 'materielDissection.collerAutre')) return;
        if (window.materiel) window.materiel.recommencer();
    }

    /** « Retirer les étiquettes » : un premier toucher demande confirmation, le second retire tout. */
    function toutRetirer(bouton) {
        if (!etat.doc || !confirme(bouton, 'materielDissection.toutRetirer')) return;
        etat.liens = {};
        etat.actif = null;
        etat.erreur = '';
        // Lot 2b : les niveaux partent avec leurs étiquettes, et ce qui était saisi pour eux aussi.
        etat.compte = 'points';
        etat.valeurs = {};
        // Lot 5 : les coupes restent, mais une coupe annulée ensuite ne rend plus d'étiquette retirée.
        etat.coupes.forEach(function (c) { c.type = null; });
        // Lot 7 : les liens restent aussi (comme les coupes) ; un choix de suite en cours tombe avec l'outil.
        etat.suite = null;
        etat.morceaux.ordre.forEach(marquer);
        majPalette(); majBandeau(); rendreLecture(); planifierDessin();
        dire('Toutes les étiquettes sont retirées.');
    }

    function initialiser() {
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && etat.actif) terminer(); });
        window.addEventListener('resize', planifierDessin);
        window.addEventListener('scroll', planifierDessin, { passive: true });
        var cv = el('dissection-canevas');
        if (cv) cv.addEventListener('scroll', planifierDessin, { passive: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
    else initialiser();

    window.materielDissection = {
        ouvrir: ouvrir,
        fermer: fermer,
        choisir: choisir,
        terminer: terminer,
        collerAutre: collerAutre,
        toutRetirer: toutRetirer,
        annulerCoupe: annulerCoupe,
        creer: creer,
        construireFeuille: construireFeuille,
        /** L'état de la dissection (lecture) — pour les bancs. */
        etatCourant: function () { return etat; },
        comprise: function () { return etat.doc ? lire() : null; }
    };
})();
