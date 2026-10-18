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
 *
 * Sécurité (règle 1) : tout texte venu du collage s'écrit par `textContent` ; le HTML collé n'est
 * jamais inséré (le document disséqué ne porte que du texte). Boutons par `data-action` (dispatcher
 * de main.js) ; les gestes sur la feuille, par des écouteurs de pointeur posés ici, aucun handler inline.
 *
 * iPad : les gestes passent par les événements de pointeur (pas de glisser-déposer HTML5) ;
 * `touch-action: none` ne vaut sur les morceaux que lorsqu'une étiquette est en main
 * (classe `dissection-pointage`), pour que le canevas défile au doigt le reste du temps.
 *
 * Textes d'écran de Claude Code ou de l'ébauche, PROVISOIRES : ils passent à l'étape 3 du plan.
 */
(function () {
    'use strict';

    var SVG = 'http://www.w3.org/2000/svg';
    var etat = { doc: null, liens: {}, actif: null, morceaux: null, erreur: '', enCours: false };
    var blocs = {};
    var dessinPrevu = false;

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

    function classeType(n, type) {
        D().TYPES.forEach(function (t) { n.classList.remove('dis-t-' + t.k); });
        if (type) n.classList.add('dis-t-' + type);
    }

    function marquer(id) {
        var b = blocs[id];
        if (!b) return;
        var t = typeDe(id);
        b.classList.toggle('dissection-marque', !!t);
        classeType(b, t);
        if (t) b.setAttribute('data-type', t); else b.removeAttribute('data-type');
    }

    function rendreFeuille() {
        var contenu = el('dissection-contenu');
        if (!contenu) return;
        contenu.textContent = '';
        blocs = {};
        var f = construireFeuille(etat.doc);
        Array.prototype.forEach.call(f.querySelectorAll('.dissection-morceau'), function (b) { blocs[b.getAttribute('data-id')] = b; });
        contenu.appendChild(f);
        etat.morceaux.ordre.forEach(marquer);
    }

    // ------------------------------------------------------------------
    // La palette : chaque étiquette est un surligneur
    // ------------------------------------------------------------------

    function rendrePalette() {
        var pal = el('dissection-palette');
        if (!pal || pal.childNodes.length) return;
        var groupes = {};
        D().TYPES.forEach(function (t) {
            if (!groupes[t.groupe]) {
                var g = noeud('div', 'dissection-groupe');
                g.appendChild(noeud('span', 'dissection-groupe-nom', t.groupe));
                groupes[t.groupe] = g;
                pal.appendChild(g);
            }
            var b = noeud('button', 'dissection-etiquette dis-t-' + t.k);
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
        });
        var defs = el('dissection-pointes');
        if (defs && !defs.childNodes.length) {
            D().TYPES.forEach(function (t) {
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
            var t = b.getAttribute('data-type'), T = D().TYPE[t];
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
        var T = etat.actif ? D().TYPE[etat.actif] : null;
        cv.classList.toggle('dissection-pointage', !!T);
        bd.classList.toggle('dissection-bandeau-actif', !!T);
        classeType(bd, etat.actif);
        classeType(cv, etat.actif);
        el('dissection-terminer').classList.toggle('u-hide', !T);
        el('dissection-bandeau-texte').textContent = T
            ? 'Surligneur « ' + T.nom + ' » : touche ou surligne les morceaux de ta grille qu’il désigne. Touche un morceau déjà surligné pour le retirer.'
            : 'Touche une étiquette dans la palette : elle devient ton surligneur.';
        var pr = el('dissection-bandeau-precision');
        pr.textContent = T && T.precision ? T.nom + ' : ' + T.precision : '';
        pr.classList.toggle('u-hide', !(T && T.precision));
    }

    function choisir(type) {
        if (!D().TYPE[type]) return;
        etat.actif = etat.actif === type ? null : type;
        desarmer();
        majPalette(); majBandeau(); planifierDessin();
        dire(etat.actif ? 'Surligneur « ' + D().TYPE[etat.actif].nom + ' » en main : touche ou surligne les morceaux de ta grille qu’il désigne.' : '');
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

    function appliquer(id, mode) {
        etat.erreur = '';
        if (mode === 'ajouter') etat.liens[id] = etat.actif;
        else if (etat.liens[id] === etat.actif) delete etat.liens[id];
        marquer(id);
        planifierDessin();
    }

    function surPointeur(e) {
        var b = e.target.closest ? e.target.closest('.dissection-morceau') : null;
        if (!b || !etat.doc) return;
        var id = b.getAttribute('data-id');
        if (!etat.actif) {
            var t = typeDe(id);
            if (t) { eclair(t); dire('Ce morceau porte l’étiquette « ' + D().TYPE[t].nom + ' ». Pour la changer, touche une autre étiquette, puis ce morceau.'); }
            else dire('Touche d’abord une étiquette dans la palette : elle devient ton surligneur.');
            return;
        }
        e.preventDefault();
        var feuille = e.currentTarget;
        var mode = etat.liens[id] === etat.actif ? 'retirer' : 'ajouter';
        var vus = {};
        vus[id] = 1;
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
        }
        feuille.addEventListener('pointermove', bouger);
        feuille.addEventListener('pointerup', fin);
        feuille.addEventListener('pointercancel', fin);
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
        var it = document.querySelector('#dissection-palette .dissection-etiquette[data-type="' + etat.actif + '"]');
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
        if (b.logique === 'points') return 'L’application y lirait une grille en points : les points de chaque critère s’additionnent' + (b.jusqua != null ? ' jusqu’à un total de ' + fmt(b.jusqua) : '') + '. Aucun niveau n’y est nommé, et l’application n’en inventerait pas.';
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
        var R = D().comprendre(etat.doc, etat.liens), b = D().bilan(R);
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

    // Textes de Claude Code, PROVISOIRES (étape 3 du plan) ; « Avant de créer, il reste : » est celui de la 1.203.
    var TEXTES_CREER = {
        bouton: 'Créer ma grille',
        enCours: 'Création…',
        raisons: 'Avant de créer, il reste :',
        bientot: 'La création des grilles en niveaux arrive bientôt. Pour l’instant, l’application crée les grilles qui ont des points.'
    };

    /** Sous la lecture : rien sans étiquette ; « bientôt » pour une grille en niveaux ; sinon le bouton et ses raisons. */
    function rendreCreer(R) {
        var z = el('dissection-creer');
        if (!z) return;
        z.textContent = '';
        if (!Object.keys(etat.liens).length) return;
        var c = D().creation(R, { nomsGrilles: nomsGrilles() });
        if (c.niveauxSeuls) { z.appendChild(noeud('p', 'dissection-creer-bientot', TEXTES_CREER.bientot)); return; }
        var b = noeud('button', 'btn btn-principal', etat.enCours ? TEXTES_CREER.enCours : TEXTES_CREER.bouton);
        b.type = 'button';
        b.setAttribute('data-action', 'materielDissection.creer');
        b.disabled = c.raisons.length > 0 || etat.enCours;
        z.appendChild(b);
        if (c.raisons.length) {
            var r = noeud('div', 'dissection-creer-raisons');
            r.id = 'dissection-creer-raisons';
            r.appendChild(noeud('strong', null, TEXTES_CREER.raisons));
            var ul = noeud('ul');
            c.raisons.forEach(function (t) { ul.appendChild(noeud('li', null, t)); });
            r.appendChild(ul);
            z.appendChild(r);
            b.setAttribute('aria-describedby', r.id);
        }
        if (etat.erreur) {
            var p = noeud('p', 'alerte alerte-erreur', etat.erreur);
            p.setAttribute('role', 'alert');
            z.appendChild(p);
        }
    }

    /**
     * « Créer ma grille » : l'écriture de `materielCreation.creer`, puis la confirmation. Un échec
     * affiche son message, et la dissection reste telle quelle pour réessayer. Un second toucher
     * pendant l'écriture est sans effet.
     */
    async function creer() {
        if (etat.enCours || !etat.doc) return;
        var c = D().creation(D().comprendre(etat.doc, etat.liens), { nomsGrilles: nomsGrilles() });
        if (c.niveauxSeuls || c.raisons.length) { rendreLecture(); return; }
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
        etat = { doc: doc, liens: {}, actif: null, morceaux: D().morceaux(doc), erreur: '', enCours: false };
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
            : 'Texte collé : ' + pluriel(n, 'ligne', 'lignes') + ', sans tableau. L’application rattachera les morceaux par leur ordre.'));
        var titre = el('dissection-titre');
        if (titre) titre.focus();   // règle SPA : le focus suit le changement de vue
        return true;
    }

    /** Retour à l'accueil : la dissection en cours est oubliée (rien n'avait été écrit). */
    function fermer() {
        etat = { doc: null, liens: {}, actif: null, morceaux: null, erreur: '', enCours: false };
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

    /** Texte de repos et texte armé (« Confirmer : … » : de Claude Code, PROVISOIRE, étape 3). */
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
     * tout de suite ; dès qu'une étiquette est posée, un premier toucher demande confirmation.
     */
    function collerAutre(bouton) {
        if (Object.keys(etat.liens).length && !confirme(bouton, 'materielDissection.collerAutre')) return;
        if (window.materiel) window.materiel.recommencer();
    }

    /** « Retirer les étiquettes » : un premier toucher demande confirmation, le second retire tout. */
    function toutRetirer(bouton) {
        if (!etat.doc || !confirme(bouton, 'materielDissection.toutRetirer')) return;
        etat.liens = {};
        etat.actif = null;
        etat.erreur = '';
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
        creer: creer,
        construireFeuille: construireFeuille,
        /** L'état de la dissection (lecture) — pour les bancs. */
        etatCourant: function () { return etat; },
        comprise: function () { return etat.doc ? D().comprendre(etat.doc, etat.liens) : null; }
    };
})();
