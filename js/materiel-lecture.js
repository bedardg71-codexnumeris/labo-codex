/**
 * materiel-lecture.js — « Apporter mon matériel », lot 1 : LIRE une grille collée.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-16-apporter-mon-materiel-1.md`.
 * Référence de comportement : `plans de travail/PROTOTYPE-2026-10-16-apporter-mon-materiel.dc.html`
 * (validé par Grégoire le 16 oct. 2026, 14 h 13) ; ses fonctions `lireHtml`, `lireTexte` et `coder`
 * sont le point de départ de celles-ci.
 *
 * Module de FONCTIONS PURES : aucun accès au stockage, aucun DOM de l'application. Le seul
 * DOM touché est le document INERTE que `DOMParser` fabrique à partir du presse-papiers :
 * il n'est jamais inséré dans la page, ses scripts ne s'exécutent pas, ses images ne se
 * chargent pas, et seul son TEXTE (`textContent`) en sort.
 *
 * ⚰ 19 oct. 2026 (`CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md`) : l'assistant en sept étapes est
 * retiré, et avec lui ce que lui seul appelait ici — l'INTERPRÉTATION d'un tableau en grille : le dépliage
 * des cases fusionnées, les rôles proposés de chaque rangée et de chaque colonne (lot 3a), les grilles en
 * points (étape 5), la reconnaissance des douze grilles (étape 5b), l'inversion, le chargement et ses
 * messages, l'exemple. Reste ce que la dissection et la création reprennent : LIRE le presse-papiers
 * (`lirePressePapiers`, `lireHtml`, `lireTexte` ; les retours à la ligne d'une case survivent, lot 3a),
 * les codes de niveau (`coder`), les parts égales (`partsEgales`), la casse d'une partie (`casseDePartie`,
 * règle 8.16) et les plages contiguës (`plagesContigues`, que `construire` appelle).
 */
(function () {
    'use strict';

    var L = {};

    /** Éléments dont le texte n'est jamais du contenu (Word colle aussi ses <style>). */
    var ELEMENTS_IGNORES = 'script, style, template, noscript, head, title, meta, link, object, embed, iframe';
    /** Blocs de texte : un retour à la ligne dans une case (lot 3a), un passage chacun hors du tableau. */
    var BLOCS = 'p, h1, h2, h3, h4, h5, h6, li, div, blockquote, pre, caption';
    /** Marque d'un retour à la ligne VOULU (bloc, <br>), posée avant que les blancs du source HTML se resserrent. */
    var SAUT = '\uE000';

    function propre(s) {
        return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    }

    /** Les lignes d'un texte marqué : chacune resserrée, les lignes vides retirées. */
    function lignesDe(s) {
        return String(s == null ? '' : s).split(SAUT).map(propre).filter(Boolean);
    }

    function paire(valeur, etat) { return { valeur: valeur, etat: etat }; }

    // ------------------------------------------------------------------
    // 1. LIRE : du presse-papiers à un tableau de rangées de textes
    // ------------------------------------------------------------------

    /**
     * Texte d'une case. Lot 3a : les retours à la ligne SURVIVENT — un bloc interne (un
     * paragraphe Word, un élément de liste) ou un <br> donne un `\n`, les lignes vides se
     * resserrent. Les retours du source HTML, eux, ne sont que des blancs.
     * (Au lot 1, une espace : sept micro-tâches d'une grille Pages se collaient en un bloc.)
     */
    function texteDe(el) {
        var doc = el.ownerDocument;
        Array.prototype.forEach.call(el.querySelectorAll('br'), function (br) {
            br.parentNode.replaceChild(doc.createTextNode(SAUT), br);
        });
        Array.prototype.forEach.call(el.querySelectorAll(BLOCS), function (b) {
            b.insertBefore(doc.createTextNode(SAUT), b.firstChild);
            b.appendChild(doc.createTextNode(SAUT));
        });
        return lignesDe(el.textContent).join('\n');
    }

    /**
     * Le presse-papiers `text/html` (Word, Pages, un tableur) → { rangees, avant, apres }, ou
     * null s'il n'y a pas de tableau d'au moins deux rangées. Première <table> seulement.
     * Une rangée = [{ t: texte, span: colSpan, rspan: rowSpan }].
     *
     * @param {string} html
     * @returns {{rangees: Array, avant: string[], apres: string[]}|null}
     */
    L.lireHtml = function (html) {
        if (!html || typeof DOMParser !== 'function') return null;
        var doc;
        try { doc = new DOMParser().parseFromString(String(html), 'text/html'); } catch (e) { return null; }
        if (!doc || !doc.body) return null;
        // Retirés AVANT toute lecture : leur texte n'est jamais retenu.
        Array.prototype.forEach.call(doc.querySelectorAll(ELEMENTS_IGNORES), function (n) {
            if (n.parentNode) n.parentNode.removeChild(n);
        });
        var table = doc.body.querySelector('table');
        if (!table) return null;
        var hors = textesHorsTableau(doc, table);
        var rangees = rangeesDe(table);
        if (rangees.filter(aDuTexte).length < 2) return null;
        return { rangees: rangees, avant: hors.avant, apres: hors.apres };
    };

    function aDuTexte(row) { return row.some(function (c) { return c.t; }); }

    /**
     * Les rangées d'une <table> : [{ t, span: colSpan, rspan: rowSpan }]. Les rangées vides
     * sont GARDÉES (lot 3a) : une case fusionnée sur plusieurs rangées les compte.
     */
    function rangeesDe(table) {
        return Array.prototype.map.call(table.rows, function (tr) {
            return Array.prototype.map.call(tr.cells, function (td) {
                return { t: texteDe(td), span: td.colSpan || 1, rspan: td.rowSpan || 1 };
            });
        });
    }

    /**
     * Tout le texte hors du tableau, regroupé par bloc (son plus proche ancêtre de BLOCS,
     * sinon l'enfant de <body> qui le porte) : un <span> nu, un texte posé dans <body>,
     * un <div> qui enveloppe le tableau ne perdent rien. La légende du tableau, un titre,
     * passe en tête de « avant ».
     */
    function textesHorsTableau(doc, table) {
        var avant = [], apres = [];
        var legende = table.caption ? propre(table.caption.textContent) : '';
        if (legende) avant.push(legende);
        var groupes = [];
        var parBloc = new Map();
        var marcheur = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */);
        var n;
        while ((n = marcheur.nextNode())) {
            if (table.contains(n) || !propre(n.nodeValue)) continue;
            var bloc = blocDe(doc, n);
            if (!parBloc.has(bloc)) {
                // DOCUMENT_POSITION_PRECEDING (2) : le texte est avant le tableau.
                var g = { morceaux: [], avant: !!(table.compareDocumentPosition(n) & 2) };
                parBloc.set(bloc, g);
                groupes.push(g);
            }
            parBloc.get(bloc).morceaux.push(n.nodeValue);
        }
        groupes.forEach(function (g) {
            var t = propre(g.morceaux.join(' '));
            if (t) (g.avant ? avant : apres).push(t);
        });
        return { avant: avant, apres: apres };
    }

    function blocDe(doc, n) {
        var parent = n.parentNode;
        var bloc = (parent && parent !== doc.body && parent.closest) ? parent.closest(BLOCS) : null;
        if (bloc && bloc !== doc.body) return bloc;
        bloc = n;
        while (bloc.parentNode && bloc.parentNode !== doc.body) bloc = bloc.parentNode;
        return bloc;
    }

    /**
     * Texte tapé ou collé en colonnes séparées par des tabulations → même forme que lireHtml.
     * Les lignes sans tabulation sont du texte avant ou après le tableau.
     */
    L.lireTexte = function (txt) {
        var rangees = [], avant = [], apres = [];
        String(txt == null ? '' : txt).split(/\r\n|\r|\n/).forEach(function (l) {
            if (l.indexOf('\t') >= 0) {
                var cells = l.split('\t').map(function (t) { return { t: propre(t), span: 1, rspan: 1 }; });
                if (cells.some(function (c) { return c.t; })) rangees.push(cells);
            } else {
                var t = propre(l);
                if (t) (rangees.length ? apres : avant).push(t);
            }
        });
        if (rangees.length < 2) return null;
        return { rangees: rangees, avant: avant, apres: apres };
    };

    /**
     * Les deux formats du presse-papiers : le HTML d'abord, le texte à tabulations en repli.
     * @param {{html?: string, texte?: string}} pp
     */
    L.lirePressePapiers = function (pp) {
        var p = pp || {};
        return (p.html ? L.lireHtml(p.html) : null) || L.lireTexte(p.texte);
    };

    // ------------------------------------------------------------------
    // 2. CE QUE LA DISSECTION REPREND : codes, parts égales, casse d'une partie
    // ------------------------------------------------------------------

    /**
     * Codes de niveau tirés des titres, uniques : la 1re lettre, puis un préfixe plus long,
     * puis un suffixe numérique. Marqués « complété ».
     * Lot 3a : EN REPLI SEULEMENT. Un code repris du document, saisi ou vidé par la personne
     * n'est jamais recalculé (modifier un titre ne touche plus son code) ; les codes complétés
     * évitent ceux-là, sans tenir compte de la casse.
     */
    L.coder = function (niveaux) {
        var pris = {};
        function garde(n) { return n.code && n.code.etat !== 'complete'; }
        niveaux.forEach(function (n) { if (garde(n) && n.code.valeur) pris[String(n.code.valeur).trim().toUpperCase()] = true; });
        return niveaux.map(function (n) {
            if (garde(n)) return Object.assign({}, n);
            var s = String(n.titre.valeur || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/[^A-Za-z]/g, '').toUpperCase() || 'N';
            var code = s.slice(0, 1), k = 2;
            while (pris[code] && k <= s.length) { code = s.slice(0, k); k++; }
            var base = code, suffixe = 2;
            while (pris[code]) { code = base + suffixe; suffixe++; }
            pris[code] = true;
            return Object.assign({}, n, { code: paire(code, 'complete') });
        });
    };

    /** Parts égales, en entiers qui totalisent 100 ; marquées « complété ». */
    L.partsEgales = function (criteres) {
        var n = criteres.length;
        if (!n) return criteres;
        var base = Math.floor(100 / n), reste = 100 - base * n;
        criteres.forEach(function (c, i) {
            c.ponderation = paire(String(base + (i < reste ? 1 : 0)), 'complete');
        });
        return criteres;
    };

    /**
     * Règle 8.16 (Grégoire, 17 oct. 2026) : le nom fabriqué s'imprime sur le PDF des étudiant·es, donc
     * une partie écrite entièrement en capitales prend une majuscule initiale (« INTRODUCTION » →
     * « Introduction ») ; une partie qui porte déjà des minuscules garde sa casse. Une lettre seule
     * (« PARTIE A ») ou un chiffre romain (« PARTIE II ») garde sa capitale (même décision) ; une
     * lettre élidée (« DE L’ŒUVRE ») non.
     */
    function casseDePartie(p) {
        if (!/\p{Lu}/u.test(p) || /\p{Ll}/u.test(p)) return p;
        var premier = true;
        return p.replace(/\p{L}+/gu, function (mot, i) {
            var elide = /^['’]/.test(p.slice(i + mot.length));
            var garde = (mot.length === 1 && mot !== 'À' && !elide) || /^(?=[IVX])X{0,3}(IX|IV|V?I{0,3})$/.test(mot);
            var r = garde ? mot : premier ? mot.charAt(0) + mot.slice(1).toLocaleLowerCase('fr') : mot.toLocaleLowerCase('fr');
            premier = false;
            return r;
        });
    }
    L.casseDePartie = casseDePartie;

    // ------------------------------------------------------------------
    // 3. PLAGES : des entiers saisis aux plages contiguës enregistrées
    // ------------------------------------------------------------------

    /**
     * Plages contiguës, comme l'échelle de départ IDME (0-64,99 / 65-74,99…) : saisies en
     * entiers (65-74, 75-84), elles s'enregistrent avec `max` = `min` suivant − 0,01, pour
     * qu'une note de 74,5 tombe dans un niveau. Seul un `max` entier suivi d'un `min` égal à
     * `max + 1` est converti : un chevauchement ou un trou reste tel quel (`calculs` l'avertit). Le niveau le plus haut garde son `max`. Aucune `valeurCalcul` n'est
     * produite (décision du 16 oct., 12 h 55). Ordre d'entrée préservé.
     *
     * @param {Array<{min: number, max: number}>} plages
     * @returns {Array<{min: number, max: number}>} copies
     */
    L.plagesContigues = function (plages) {
        var copies = plages.map(function (p) { return { min: p.min, max: p.max }; });
        var ordre = copies.slice().sort(function (a, b) { return a.min - b.min; });
        for (var q = 0; q < ordre.length - 1; q++) {
            var a = ordre[q], b = ordre[q + 1];
            if (Number.isInteger(a.max) && Number.isInteger(b.min) && b.min === a.max + 1) {
                a.max = Math.round((b.min - 0.01) * 100) / 100;
            }
        }
        return copies;
    };

    window.materielLecture = L;
})();
