/**
 * materiel-dissection.js — Conception › « Apporter mon matériel » : la DISSECTION, lot 1.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md` ; plan :
 * `PLAN-2026-10-18-la-dissection-pour-lundi.md`. Elle remplace, dans l'onglet, l'assistant en sept
 * étapes (débranché le 18 oct., retiré le 19 : `CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md`).
 *
 * L'enseignant colle sa grille ; il la voit telle qu'il l'a écrite, chaque ligne de chaque case
 * devenue un morceau. Une étiquette de la palette, touchée, devient son surligneur ; il touche ou
 * glisse sur les morceaux qu'elle désigne, retouche un morceau surligné pour le retirer. Sous la
 * grille, la lecture de l'application se refait à chaque geste (`materielDissectionLecture`).
 *
 * RIEN N'ENTRE DANS SES GRILLES (ni échelles, ni cartouches) tant que l'enseignant ne touche pas
 * « Créer ma grille ». Lot 11 (`CONSIGNE-LOT-2026-10-19-dissection-11-enregistrement.md`) : la dissection
 * en cours, elle, s'enregistre à chaque geste dans son BROUILLON (`<trim>_brouillonDissection`, par le
 * témoin commun « Enregistré »), et se reprend telle quelle à l'ouverture de l'onglet (`reprendre`).
 * Lot 2a (`CONSIGNE-LOT-2026-10-18-dissection-2a-creer-en-points.md`) : « Créer ma grille », sous la
 * lecture, pour une grille en points ; l'écriture est celle de `materielCreation.creer` (le seul
 * chemin, rien de neuf), puis la confirmation de `materiel.js`. Ce qui l'empêche s'écrit à côté.
 * Lot 2b (`CONSIGNE-LOT-2026-10-18-dissection-2b-creer-en-niveaux.md`) : une grille en niveaux se crée
 * aussi ; pour une grille qui a les deux logiques, un choix (des points par défaut). Le tableau « Ce que
 * vaut chaque niveau » demande la plage et la note retenue de chaque niveau, champs VIDES ; ce qui y
 * est saisi s'enregistre avec les étiquettes, dans le brouillon (lot 11).
 *
 * Lot 5 (`CONSIGNE-LOT-2026-10-18-dissection-5-couper.md`) : l'outil « Couper », dans la palette après
 * « Suite », se prend comme une étiquette ; un toucher coupe un morceau en deux à l'espace la plus proche
 * (`materielDissectionLecture.couper`), le glisser ne coupe pas. Les coupes vivent dans la page, en pile,
 * et s'annulent (« Annuler la dernière coupe ») ; le brouillon les garde, pile comprise (lot 11).
 *
 * Lot 7 (`CONSIGNE-LOT-2026-10-18-dissection-7-rattacher.md`) : l'outil « Rattacher », après « Couper ».
 * Lot 12 (`CONSIGNE-LOT-2026-10-19-dissection-12-rattacher-sans-ordre.md`) : deux touchers joignent deux
 * morceaux, dans l'ordre qu'on veut ; deux touchers sur un morceau rattaché le détachent. Un membre garde sa
 * marque, la tête de son groupe montre sous elle le nom entier ; l'outil en main, une flèche va de chaque
 * membre vers la tête.
 * Rien n'est déplacé dans la feuille, rien n'est deviné, rien n'entre dans les grilles avant « Créer ma grille ».
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
     * lot 7, les rattachements { idMembre: idTete } (lot 12) et `choix`, le morceau choisi au premier toucher
     * de « Rattacher ».
     */
    function etatNeuf(doc) {
        // Étape 5 du critère algorithmique (22 oct. 2026) : `destination`, le critère choisi pour une liste de codes
        // (« grilleId\ncritereId ») ; `codesAjoutes`, ce que la confirmation dit. Ni l'un ni l'autre n'entre au brouillon.
        return { doc: doc, liens: {}, actif: null, morceaux: doc ? D().morceaux(doc) : null, erreur: '', enCours: false, nomSaisi: null, compte: 'points', valeurs: {}, coupes: [], rattachements: {}, choix: null,
            destination: null, codesAjoutes: null };
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
     * Lot 7, « Rattacher » : textes de Claude Code (18 oct.), sur le modèle de ceux de « Couper ». Validé G.
     * 18 oct. 17 h 18 : `annule`, `lie`, `etiquetteRetiree`, `defait`, `suiteDe`. Lot 12 : `bandeau`,
     * `bandeauChoix`, `enMain`, `choisi`, `reportee`, `rien`, `nomEntier` et `sansEtiquette` (« le texte
     * entier » pour « les deux », « Détache-le » pour « Défais le lien ») de Claude Code, 19 oct., validé G.
     * 19 oct. 9 h 06.
     * Les textes collés y entrent par leurs premiers mots (`premiersMots`).
     */
    var TEXTES_LIEN = {
        bandeau: 'Outil « Rattacher » : touche deux morceaux d’un même texte, dans l’ordre que tu veux ; l’application les lit dans l’ordre de ta grille. Touche deux fois un morceau rattaché pour le détacher.',
        bandeauChoix: function (b, rattache) { return 'Outil « Rattacher » : touche maintenant le morceau à joindre à « ' + b + ' ». Retouche « ' + b + ' » pour ' + (rattache ? 'le détacher.' : 'annuler.'); },
        enMain: 'Outil « Rattacher » en main : touche un morceau, puis celui à lui joindre.',
        choisi: function (b, rattache) { return 'Morceau choisi : « ' + b + ' ». Touche maintenant celui à lui joindre' + (rattache ? ', ou retouche-le pour le détacher.' : '.'); },
        annule: 'Choix annulé : aucun lien créé.',
        lie: function (t) { return 'Morceaux rattachés : l’application lit « ' + t + ' ».'; },
        etiquetteRetiree: function (nom) { return ' L’étiquette « ' + nom + ' » de la suite est retirée : celle du premier morceau vaut pour le texte entier.'; },
        reportee: function (nom) { return ' L’étiquette « ' + nom + ' » passe au premier morceau : elle vaut pour le texte entier.'; },
        defait: function (b) { return 'Lien défait : « ' + b + ' » redevient un morceau à part.'; },
        rien: 'Ces deux morceaux sont déjà rattachés : rien ne change.',
        sansEtiquette: function (a) { return 'Ce morceau est la suite de « ' + a + ' » : l’étiquette de « ' + a + ' » vaut pour le texte entier. Détache-le avec « Rattacher » pour l’étiqueter à part.'; },
        suiteDe: function (a) { return 'Ce morceau est la suite de « ' + a + ' » : l’application les lit comme un seul texte.'; },
        nomEntier: function (t) { return 'L’application lit : « ' + t + ' »'; }
    };

    /**
     * Lot 11 : textes de Claude Code (19 oct.), validé G. 19 oct. 9 h 06. `geste` n'apparaît que sur un échec, dans
     * le témoin commun (« Non enregistré – ‹geste› : ‹raison› »).
     */
    var TEXTES_BROUILLON = {
        geste: 'enregistrer ta dissection',
        reprise: 'Dissection reprise telle que tu l’as laissée.'
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
    function dire(m) { var s = el('dissection-statut'); if (s) s.textContent = m || ''; }
    function typeDe(id) { var t = etat.liens[id]; return D().TYPE[t] ? t : null; }
    /** La lecture de l'application : les étiquettes et, lot 7, les rattachements. */
    function lire() { return D().comprendre(etat.doc, etat.liens, etat.rattachements); }
    // ------------------------------------------------------------------
    // Le brouillon (lot 11) : écrit à chaque geste, par le témoin commun
    // ------------------------------------------------------------------

    /** Clé du registre des trimestres (`trimestres.js`) : en démo, `cle()` la range sous `demo_`. */
    var CLE_BROUILLON = 'brouillonDissection';
    var minuterieSaisie = null;

    /** Écrit le brouillon de la dissection ouverte ; le témoin commun dit « Enregistré » (ou l'échec). */
    function enregistrer() {
        clearTimeout(minuterieSaisie);
        minuterieSaisie = null;
        if (!etat.doc || typeof window.sauvegarderDonneesSelonMode !== 'function') return;
        window.sauvegarderDonneesSelonMode(CLE_BROUILLON, D().brouillon(etat), { geste: TEXTES_BROUILLON.geste });
    }

    /** Une saisie au clavier : le brouillon s'écrit à la pause de la frappe (et au départ du champ). */
    function enregistrerBientot() {
        clearTimeout(minuterieSaisie);
        minuterieSaisie = setTimeout(enregistrer, 400);
    }

    /** « Coller une autre grille » : le geste de l'enseignant qui efface le brouillon. */
    function oublierBrouillon() {
        clearTimeout(minuterieSaisie);
        minuterieSaisie = null;
        if (typeof window.cle === 'function') db.removeSync(window.cle(CLE_BROUILLON));
    }

    /** #1119 : un brouillon existe (lisible ou non) — la confirmation offre alors « Revenir à mon étiquetage » (#1152, lot 5). */
    function aUnBrouillon() {
        return typeof window.cle === 'function' && db.getSync(window.cle(CLE_BROUILLON), null) != null;
    }

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

    /** `M` : la lecture des rattachements (`morceauxLus`), calculée une fois pour toute la feuille. */
    function marquer(id, M) {
        var b = blocs[id];
        if (!b) return;
        M = M || D().morceauxLus(etat.doc, etat.rattachements);
        var t = typeDe(id);
        b.classList.toggle('dissection-marque', !!t);
        if (t) b.setAttribute('data-type', t); else b.removeAttribute('data-type');
        // Lot 7 : un membre garde sa marque en tout temps (trait en pointillé et symbole, en CSS), dans la
        // couleur de l'étiquette de la tête de son groupe ; le morceau choisi au premier toucher, la sienne.
        var a = etat.rattachements[id];
        b.classList.toggle('dissection-rattache', a != null);
        b.classList.toggle('dissection-choisi', etat.choix === id);
        classeType(b, a != null ? typeDe(a) : t);
        if (a != null) { b.setAttribute('data-suite-de', a); b.title = 'Suite de « ' + mots(a) + ' »'; }
        else { b.removeAttribute('data-suite-de'); b.removeAttribute('title'); }
        // Lot 12 : sous la tête d'un groupe, en tout temps, le nom entier tel que l'application le lit
        // (du texte, lu aussi par les lecteurs d'écran ; `textContent`, jamais de balise).
        var sous = b.nextElementSibling && b.nextElementSibling.classList.contains('dissection-nom-entier') ? b.nextElementSibling : null;
        if (M.suites[id]) {
            if (!sous) { sous = noeud('div', 'dissection-nom-entier'); b.after(sous); }
            sous.setAttribute('data-de', id);
            sous.textContent = TEXTES_LIEN.nomEntier(M.texte[id]);
        } else if (sous) sous.remove();
    }

    function marquerTout() {
        var M = D().morceauxLus(etat.doc, etat.rattachements);
        etat.morceaux.ordre.forEach(function (id) { marquer(id, M); });
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
        marquerTout();
    }

    // ------------------------------------------------------------------
    // La palette : chaque étiquette est un surligneur
    // ------------------------------------------------------------------

    /** Les outils qui ont une bulle au survol (clés de js/accompagnement-contenu-hover.js, 19 oct. 2026). */
    var BULLES_OUTILS = { couper: 'materiel-outil-couper', rattacher: 'materiel-outil-rattacher' };

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
            if (BULLES_OUTILS[t.k]) b.setAttribute('data-tooltip', BULLES_OUTILS[t.k]);   // C5, C6 : le texte est au catalogue des bulles
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
                ? (etat.choix ? TEXTES_LIEN.bandeauChoix(mots(etat.choix), D().estRattache(etat.rattachements, etat.choix)) : TEXTES_LIEN.bandeau)
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
        // Lot 7 : poser « Rattacher » (une autre étiquette, « Terminer », Échap) annule le choix d'un morceau.
        if (etat.choix) { var s = etat.choix; etat.choix = null; marquer(s); }
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
        // Lot 7 : un membre ne prend pas d'étiquette ; celle de la tête de son groupe vaut pour le texte entier.
        if (etat.rattachements[id] != null) { suiteTouchee = id; return; }
        if (mode === 'ajouter') etat.liens[id] = etat.actif;
        else if (etat.liens[id] === etat.actif) delete etat.liens[id];
        marquer(id);
        // C1 du lot 7 (verdict du 18 oct., 17 h 15) : les membres de son groupe prennent la couleur de
        // l'étiquette posée, changée ou retirée sur lui.
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
            enregistrer();
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
        enregistrer();
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
        enregistrer();
        dire(TEXTES_COUPE.annulee(etat.morceaux.texte[c.id]) + (defaits ? TEXTES_COUPE.lienDefait : ''));
    }

    // ------------------------------------------------------------------
    // Rattacher (lot 7, revu au lot 12) : deux touchers, dans l'ordre qu'on veut
    // ------------------------------------------------------------------

    /** La feuille marquée, la palette, le bandeau, la lecture et les flèches, refaits après un geste de lien. */
    function apresLien() {
        etat.erreur = '';
        marquerTout();
        majPalette(); majBandeau(); rendreLecture(); planifierDessin();
    }

    /**
     * Un toucher, « Rattacher » en main (lot 12). Sans choix : le morceau est choisi. Avec : un AUTRE
     * morceau est joint au choisi (leurs groupes se rejoignent, lus dans l'ordre du document) ; le MÊME
     * morceau se détache s'il est rattaché, sinon le choix s'annule. Deux membres d'un même groupe : rien
     * ne change, et cela se dit.
     */
    function toucherLien(id) {
        if (!etat.doc || etat.enCours) return;
        var c = etat.choix;
        if (!c) {
            etat.choix = id;
            apresLien();
            dire(TEXTES_LIEN.choisi(mots(id), D().estRattache(etat.rattachements, id)));
            return;
        }
        etat.choix = null;
        if (id === c) {
            if (!D().estRattache(etat.rattachements, id)) { apresLien(); dire(TEXTES_LIEN.annule); return; }
            var d = D().detacher(etat.doc, etat.rattachements, etat.liens, id);
            etat.rattachements = d.rattachements;
            etat.liens = d.liens;
            apresLien();
            enregistrer();
            dire(TEXTES_LIEN.defait(mots(id)));
            return;
        }
        var r = D().joindre(etat.doc, etat.rattachements, etat.liens, c, id);
        if (r.rien) { apresLien(); dire(TEXTES_LIEN.rien); return; }
        etat.rattachements = r.rattachements;
        etat.liens = r.liens;
        apresLien();
        enregistrer();
        var M = D().morceauxLus(etat.doc, etat.rattachements);
        dire(TEXTES_LIEN.lie(M.texte[r.tete])
            + (r.reportee ? TEXTES_LIEN.reportee(D().TYPE[r.reportee].nom) : '')
            + (r.retiree ? TEXTES_LIEN.etiquetteRetiree(D().TYPE[r.retiree].nom) : ''));
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
     * Lot 7, « Rattacher » en main : une flèche de chaque membre vers la tête de son groupe (lot 12), par la
     * gauche des deux morceaux (un membre est le plus souvent juste sous elle, dans la même case), si les
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
            return p[0] === p[1] ? formaterNombre(p[0]) + ESPACE_INSECABLE + (p[0] > 1 ? 'pts' : 'pt') : formaterNombre(p[0]) + ' à ' + formaterNombre(p[1]) + ESPACE_INSECABLE + 'pts';
        }).join(', ');
    }

    function phraseLogique(b) {
        if (b.logique === 'deux') return 'L’application y lirait les deux logiques : des niveaux nommés, et des points qui s’additionnent' + (b.jusqua != null ? ' jusqu’à ' + formaterNombre(b.jusqua) : '') + '. Ce serait à toi de dire laquelle donne le résultat d’une copie.';   // L2, validé G. 19 oct. 19 h 01
        if (b.logique === 'points') return 'L’application y lirait une grille en points : les points de chaque critère s’additionnent' + (b.jusqua != null ? ' jusqu’à un total de ' + formaterNombre(b.jusqua) : '') + '. Aucun niveau n’y est nommé (et l’application n’en inventerait pas).';
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
            if (c.pond != null) tdp.textContent = formaterNombre(c.pond);
            else if (c.pondDeduite != null) {
                tdp.appendChild(document.createTextNode(formaterNombre(c.pondDeduite) + ' '));
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

    /**
     * Étape 5 du critère algorithmique : la liste de codes comprise, une rangée par code (code, nom, poids,
     * commentaire). Tout passe par `textContent` : rien de collé n'est interprété. Un poids absent se lit
     * « 1 », comme il s'écrira.
     */
    function tableCodes(R) {
        var t = noeud('table', 'dissection-table-comprise dissection-table-codes');
        var thead = noeud('thead'), th = noeud('tr');
        TEXTES_CODES.colonnes.forEach(function (x) { var c = noeud('th', null, x); c.scope = 'col'; th.appendChild(c); });
        thead.appendChild(th);
        t.appendChild(thead);
        var tbody = noeud('tbody');
        D().codesCompris(R).codes.forEach(function (k) {
            var tr = noeud('tr');
            tr.appendChild(noeud('td', 'dissection-crit-nom', k.code));
            tr.appendChild(k.nom ? noeud('td', null, k.nom) : vide());
            tr.appendChild(noeud('td', null, formaterNombre(k.poids)));
            tr.appendChild(k.commentaire ? noeud('td', 'dissection-code-commentaire', k.commentaire) : vide());
            tbody.appendChild(tr);
        });
        t.appendChild(tbody);
        return t;
        function vide() { var td = noeud('td'); td.appendChild(noeud('span', 'dissection-vide', '—')); return td; }
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
        rendreSansPlace(sp, R);
        if (D().estListeDeCodes(R)) {
            cs.appendChild(noeud('span', 'dissection-constat', pluriel(R.codes.length, 'code', 'codes')));
            cs.appendChild(noeud('span', 'dissection-constat', pluriel(R.sansEtiquette, 'morceau sans étiquette', 'morceaux sans étiquette')));
            if (R.codes.length) cp.appendChild(tableCodes(R));
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
    }

    function rendreSansPlace(sp, R) {
        if (!R.sansPlace.length) return;
        sp.appendChild(noeud('p', null, 'Ces morceaux ont une étiquette, mais l’application ne saurait pas où les ranger :'));
        var ul = noeud('ul');
        R.sansPlace.forEach(function (s) { ul.appendChild(noeud('li', null, '« ' + s.t + ' » (' + D().TYPE[s.type].nom + ') : ' + s.raison)); });
        sp.appendChild(ul);
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
        fs.setAttribute('data-tooltip', 'materiel-compte');   // C10
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
                enregistrer();
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
            enregistrerBientot();
        });
        c.addEventListener('change', enregistrer);
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
        bloc.setAttribute('data-tooltip', 'materiel-nom-grille');   // C9
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
            enregistrerBientot();
        });
        champ.addEventListener('change', enregistrer);
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
        b.setAttribute('data-tooltip', 'materiel-creer');   // C11
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
        if (!Object.keys(etat.liens).length) { z.textContent = ''; delete z.dataset.mode; return; }
        // Étape 5 : une liste de codes ne crée pas de grille ; elle va dans un critère existant.
        if (D().estListeDeCodes(R)) { rendreCodes(z, R); return; }
        if (z.dataset.mode === 'codes') { z.textContent = ''; delete z.dataset.mode; }
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

    // ------------------------------------------------------------------
    // Étape 5 du critère algorithmique (22 oct. 2026) : une liste de codes va dans un critère existant.
    // Consigne : `plans de travail/CONSIGNE-LOT-2026-10-22-critere-algorithmique-coller-codes.md`.
    // ------------------------------------------------------------------

    // Textes de Claude Code, validés par Grégoire le 22 oct. 2026 (retouches de Cowork comprises).
    var TEXTES_CODES = {
        colonnes: ['Code', 'Nom', 'Poids', 'Commentaire'],
        ou: 'Où vont ces codes ?',
        ouAide: 'Dans un critère algorithmique qui n’a pas encore de codes. Il garde sa formule et sa pondération ; rien n’est remplacé.',
        aucun: 'Aucun critère algorithmique dans les grilles de ce trimestre. Crée-le d’abord dans « Grilles de critères », puis reviens.',
        choisir: 'le critère qui recevra ces codes',
        bouton: 'Ajouter ces codes',
        enCours: 'Ajout…',
        raisons: 'Avant d’ajouter, il faut :',
        ajoutes: function (r) {
            return pluriel(r.nombre, 'code ajouté', 'codes ajoutés') + ' à « ' + r.critere + ' » (grille « ' + r.grille + ' »). Tu les retrouves dans « Grilles de critères ».';
        }
    };

    function cleDestination(d) { return d.grilleId + '\n' + d.critereId; }

    function destinations() {
        var grilles = [];
        try { grilles = db.getSync(cle('grillesTemplates'), []) || []; } catch (err) { grilles = []; }
        return D().destinationsCodes(grilles, window.materielCreation.reglesCodes());
    }

    /** Le choix du critère : un bouton radio par critère algorithmique ; ceux qui ne peuvent pas recevoir la liste, grisés, leur motif dessous. */
    function champDestination(dests) {
        var fs = noeud('fieldset', 'dissection-creer-choix dissection-destinations');
        fs.id = 'dissection-destinations';
        fs.appendChild(noeud('legend', null, TEXTES_CODES.ou));
        fs.appendChild(noeud('p', 'dissection-creer-niveaux-aide', TEXTES_CODES.ouAide));
        if (!dests.length) { fs.appendChild(noeud('p', 'dissection-vide', TEXTES_CODES.aucun)); return fs; }
        dests.forEach(function (d, i) {
            var lab = noeud('label', 'dissection-creer-option' + (d.motif ? ' dissection-option-refusee' : ''));
            var r = noeud('input');
            r.type = 'radio';
            r.name = 'dissection-destination';
            r.id = 'dissection-destination-' + i;
            r.value = cleDestination(d);   // .value : jamais du HTML
            r.disabled = !!d.motif;
            r.checked = !d.motif && etat.destination === r.value;
            r.addEventListener('change', function () {
                if (!r.checked) return;
                etat.destination = r.value;
                etat.erreur = '';
                etat.codesAjoutes = null;
                rendreActionsCodes(lire());
            });
            lab.appendChild(r);
            var txt = noeud('span', 'dissection-destination-texte');
            txt.appendChild(noeud('span', 'dissection-destination-critere', '« ' + d.critere + ' »'));
            txt.appendChild(noeud('span', 'dissection-destination-grille', d.grille));
            if (d.motif) {
                var m = noeud('span', 'dissection-destination-motif', d.motif);
                m.id = 'dissection-destination-motif-' + i;
                r.setAttribute('aria-describedby', m.id);
                txt.appendChild(m);
            }
            lab.appendChild(txt);
            fs.appendChild(lab);
        });
        return fs;
    }

    /** Ce qui empêche l'ajout, avant même de toucher au bouton : la liste, puis le choix. */
    function raisonsCodes(R) {
        var raisons = D().codesCompris(R).raisons.slice();
        var choisie = destinations().some(function (d) { return !d.motif && cleDestination(d) === etat.destination; });
        if (!choisie) raisons.push(TEXTES_CODES.choisir);
        return raisons;
    }

    function rendreActionsCodes(R) {
        var z = el('dissection-creer-actions');
        if (!z) return;
        z.textContent = '';
        var raisons = raisonsCodes(R);
        var b = noeud('button', 'btn btn-principal', etat.enCours ? TEXTES_CODES.enCours : TEXTES_CODES.bouton);
        b.type = 'button';
        b.setAttribute('data-action', 'materielDissection.ajouterCodes');
        b.disabled = raisons.length > 0 || etat.enCours;
        z.appendChild(b);
        if (raisons.length) {
            var r = noeud('div', 'dissection-creer-raisons');
            r.id = 'dissection-creer-raisons';
            r.appendChild(noeud('strong', null, TEXTES_CODES.raisons));
            var ul = noeud('ul');
            raisons.forEach(function (t) { ul.appendChild(noeud('li', null, t)); });
            r.appendChild(ul);
            z.appendChild(r);
            b.setAttribute('aria-describedby', r.id);
        }
        if (etat.codesAjoutes) {
            var ok = noeud('p', 'alerte alerte-succes', TEXTES_CODES.ajoutes(etat.codesAjoutes));
            ok.id = 'dissection-codes-ajoutes';
            ok.setAttribute('role', 'status');
            z.appendChild(ok);
        }
        if (etat.erreur) {
            var p = noeud('p', 'alerte alerte-erreur', etat.erreur);
            p.setAttribute('role', 'alert');
            z.appendChild(p);
        }
    }

    /** La zone de création, en mode « codes » : le choix du critère, puis le bouton et ses raisons. */
    function rendreCodes(z, R) {
        z.textContent = '';
        z.dataset.mode = 'codes';
        var dests = destinations();
        // Un choix qui ne vaut plus (la liste vient d'y entrer, ou la grille a changé) ne reste pas coché.
        if (!dests.some(function (d) { return !d.motif && cleDestination(d) === etat.destination; })) etat.destination = null;
        var zc = noeud('div', 'dissection-creer-saisie');
        zc.id = 'dissection-creer-saisie';
        zc.appendChild(champDestination(dests));
        z.appendChild(zc);
        var actions = noeud('div', 'dissection-creer-actions');
        actions.id = 'dissection-creer-actions';
        z.appendChild(actions);
        rendreActionsCodes(R);
    }

    /**
     * « Ajouter ces codes » : l'écriture de `materielCreation.ajouterCodes`, puis la confirmation, sur place.
     * La dissection reste ouverte ; le critère qui vient de recevoir la liste ne peut plus en recevoir une
     * autre (il a des codes) : un second toucher n'ajoute rien.
     */
    async function ajouterCodes() {
        if (etat.enCours || !etat.doc) return;
        var R = lire();
        if (raisonsCodes(R).length) { rendreLecture(); return; }
        var parts = etat.destination.split('\n'), doc = etat.doc;
        etat.enCours = true;
        etat.erreur = '';
        etat.codesAjoutes = null;
        rendreLecture();
        var r;
        try { r = await window.materielCreation.ajouterCodes(parts[0], parts[1], D().codesCompris(R).codes); } finally { if (etat.doc === doc) etat.enCours = false; }
        if (etat.doc !== doc) return;
        if (r.erreur) etat.erreur = r.erreur; else etat.codesAjoutes = r.resume;
        rendreLecture();
        // Le focus va à ce qui vient de se passer : la confirmation, ou le bouton à côté de l'échec.
        var cible = r.erreur ? document.querySelector('[data-action="materielDissection.ajouterCodes"]') : el('dissection-codes-ajoutes');
        if (cible) { if (!r.erreur) cible.tabIndex = -1; cible.focus(); }
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
            constat('Somme des pondérations : ' + formaterNombre(b.somme) + ' · ton total : ' + formaterNombre(R.totalNb) + (b.totalOk ? ' ✓' : ' : écart'),
                b.totalOk ? 'dissection-constat-ok' : 'dissection-constat-ecart');
        } else if (b.aDesPoids) constat('Somme des pondérations : ' + formaterNombre(b.somme));
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
     * ou `exempleDoc`) : l'accueil se masque, la grille s'affiche sans étiquette. Lot 11 : le collage
     * est un geste, il écrit le brouillon (il remplace celui d'avant). `reprise` : ce que porte un
     * brouillon relu (`reprendre`), qui ne s'écrit pas de nouveau.
     */
    function ouvrir(doc, message, reprise) {
        var vue = el('materiel-dissection'), accueil = el('materiel-accueil');
        if (!doc || !vue) return false;
        etat = etatNeuf(doc);
        if (reprise) {
            ['liens', 'coupes', 'rattachements', 'nomSaisi', 'compte', 'valeurs'].forEach(function (k) { etat[k] = reprise[k]; });
        }
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
        if (!reprise) enregistrer();
        return true;
    }

    /** Vrai si une dissection est ouverte dans la page. */
    function estOuverte() { return !!etat.doc; }

    /**
     * Lot 11, à l'ouverture de l'onglet : le brouillon lisible rouvre la dissection telle qu'elle était,
     * sans question ('reprise'). Rien ('aucun') : l'accueil. Illisible ('illisible') : l'accueil aussi,
     * et le brouillon n'est PAS effacé (seul un geste de l'enseignant le remplace).
     */
    function reprendre() {
        if (etat.doc || typeof window.cle !== 'function') return 'aucun';
        var b = db.getSync(window.cle(CLE_BROUILLON), null);
        if (b == null) return 'aucun';
        var r = D().lireBrouillon(b);
        if (!r) return 'illisible';
        return ouvrir(r.doc, TEXTES_BROUILLON.reprise, r) ? 'reprise' : 'aucun';
    }

    /**
     * Retour à l'accueil (ou à la confirmation d'une grille créée) : la dissection quitte la page. Son
     * brouillon reste (lot 11) ; seul « Coller une autre grille » l'efface (`oublierBrouillon`).
     */
    function fermer() {
        if (minuterieSaisie) enregistrer();
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
        // Lot 7 : les liens restent aussi (comme les coupes) ; un choix en cours tombe avec l'outil.
        etat.choix = null;
        marquerTout();
        majPalette(); majBandeau(); rendreLecture(); planifierDessin();
        enregistrer();
        dire('Toutes les étiquettes sont retirées.');
    }

    function initialiser() {
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && etat.actif) terminer(); });
        // Lot 11 : une frappe en attente s'écrit avant que la page parte.
        window.addEventListener('pagehide', function () { if (minuterieSaisie) enregistrer(); });
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
        reprendre: reprendre,
        estOuverte: estOuverte,
        oublierBrouillon: oublierBrouillon,
        aUnBrouillon: aUnBrouillon,
        choisir: choisir,
        terminer: terminer,
        collerAutre: collerAutre,
        toutRetirer: toutRetirer,
        annulerCoupe: annulerCoupe,
        creer: creer,
        ajouterCodes: ajouterCodes,
        construireFeuille: construireFeuille,
        /** L'état de la dissection (lecture) — pour les bancs. */
        etatCourant: function () { return etat; },
        comprise: function () { return etat.doc ? lire() : null; }
    };
})();
