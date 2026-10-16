/**
 * materiel-lecture.js — « Apporter mon matériel », lot 1 : LIRE une grille collée.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-16-apporter-mon-materiel-1.md`.
 * Référence de comportement : `plans de travail/PROTOTYPE-2026-10-16-apporter-mon-materiel.dc.html`
 * (validé par Grégoire le 16 oct. 2026, 14 h 13) ; ses fonctions `lireHtml`, `lireTexte`,
 * `interpreter`, `inverser` et `coder` sont le point de départ de celles-ci.
 *
 * Module de FONCTIONS PURES : aucun accès au stockage, aucun DOM de l'application. Le seul
 * DOM touché est le document INERTE que `DOMParser` fabrique à partir du presse-papiers :
 * il n'est jamais inséré dans la page, ses scripts ne s'exécutent pas, ses images ne se
 * chargent pas, et seul son TEXTE (`textContent`) en sort.
 *
 * Ce que produit la lecture (le « modèle » d'une grille collée, consommé par l'aperçu du
 * lot 1 et par l'assistant du lot 2) : chaque valeur est une paire `{ valeur, etat }`.
 *   etat 'repris'   : tel quel dans le document ;
 *        'complete' : l'application l'a complétée (parts égales, code de niveau) ;
 *        'propose'  : l'application l'a déduite du texte, à vérifier (nature des cases) ;
 *        'remplir'  : absente du document, requise ;
 *        'vide'     : une case de descripteur vide — facultative, donc pas « à remplir ».
 *
 * Règle tirée de l'essai d'exam.net (cadrage, 16 oct.) : RIEN NE DISPARAÎT EN SILENCE. Ce qui
 * ne trouve pas sa place dans le tableau va dans `aClasser`, avec sa raison.
 */
(function () {
    'use strict';

    var L = {};

    /** Le nom proposé est la 1re ligne avant le tableau, si elle est courte. */
    L.LONGUEUR_NOM_MAX = 120;
    /** Part des cases au tutoiement à partir de laquelle on propose « rétroactions ». */
    L.SEUIL_TUTOIEMENT = 0.3;

    /** Éléments dont le texte n'est jamais du contenu (Word colle aussi ses <style>). */
    var ELEMENTS_IGNORES = 'script, style, template, noscript, head, title, meta, link, object, embed, iframe';
    /** Blocs de texte : séparés par une espace dans une case, un passage chacun hors du tableau. */
    var BLOCS = 'p, h1, h2, h3, h4, h5, h6, li, div, blockquote, pre, caption';

    function propre(s) {
        return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    }
    L.propre = propre;

    function paire(valeur, etat) { return { valeur: valeur, etat: etat }; }

    // ------------------------------------------------------------------
    // 1. LIRE : du presse-papiers à un tableau de rangées de textes
    // ------------------------------------------------------------------

    /**
     * Texte d'une case : les blocs internes (un paragraphe Word par ligne, des <br>) sont
     * séparés par une espace, sinon « Ligne unLigne deux » se soudent.
     */
    function texteDe(el) {
        var doc = el.ownerDocument;
        Array.prototype.forEach.call(el.querySelectorAll('br'), function (br) {
            br.parentNode.replaceChild(doc.createTextNode(' '), br);
        });
        Array.prototype.forEach.call(el.querySelectorAll(BLOCS), function (b) {
            b.appendChild(doc.createTextNode(' '));
        });
        return propre(el.textContent);
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
        var rangees = rangeesDe(table);
        if (rangees.length < 2) return null;
        var hors = textesHorsTableau(doc, table);
        return { rangees: rangees, avant: hors.avant, apres: hors.apres };
    };

    /** Les rangées non vides d'une <table> : [{ t, span: colSpan, rspan: rowSpan }]. */
    function rangeesDe(table) {
        var rangees = [];
        Array.prototype.forEach.call(table.rows, function (tr) {
            var cells = Array.prototype.map.call(tr.cells, function (td) {
                return { t: texteDe(td), span: td.colSpan || 1, rspan: td.rowSpan || 1 };
            });
            if (cells.some(function (c) { return c.t; })) rangees.push(cells);
        });
        return rangees;
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
    // 2. INTERPRÉTER : des rangées au modèle d'une grille
    // ------------------------------------------------------------------

    /** En-tête d'une colonne de pondération : pondération, points, pts, total, /N, %. */
    function estEntetePonderation(h) {
        return /pond/i.test(h) || /^(points?|pts|total)\b/i.test(h) || /^\/\s*\d+$/.test(h) || /^%$/.test(h);
    }

    var RE_NOMBRE = '(\\d+(?:[.,]\\d+)?)';
    var RE_SEP = '\\s*%?\\s*(?:-|–|—|à|au)\\s*';
    /** « Excellent (85-100 %) », « Excellent 85 à 100 », « 85 % – 100 % ». */
    var RE_PLAGE = new RegExp(RE_NOMBRE + RE_SEP + RE_NOMBRE + '\\s*%?');
    var RE_PLAGE_A_RETIRER = new RegExp('[(\\[]?\\s*' + RE_NOMBRE + RE_SEP + RE_NOMBRE + '\\s*%?\\s*[)\\]]?');

    function nombreTexte(s) { return String(s).replace(',', '.'); }

    function niveauDeLEntete(brut) {
        var p = brut.match(RE_PLAGE);
        if (p) {
            var lo = nombreTexte(p[1]), hi = nombreTexte(p[2]);
            if (parseFloat(lo) > parseFloat(hi)) { var tmp = lo; lo = hi; hi = tmp; }
            var titre = propre(brut.replace(RE_PLAGE_A_RETIRER, '').replace(/[:–—-]\s*$/, ''));
            return {
                titre: paire(titre, titre ? 'repris' : 'remplir'),
                min: paire(lo, 'repris'), max: paire(hi, 'repris')
            };
        }
        return {
            titre: paire(brut, brut ? 'repris' : 'remplir'),
            min: paire('', 'remplir'), max: paire('', 'remplir')
        };
    }

    /**
     * Codes de niveau tirés des titres, uniques : la 1re lettre, puis un préfixe plus long,
     * puis un suffixe numérique. Marqués « complété » : le document n'en donne jamais.
     */
    L.coder = function (niveaux) {
        var pris = {};
        return niveaux.map(function (n) {
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
     * Tutoiement : « tu », « ton », « ta », « tes », « toi », « te », et l'élision « t' ».
     * ⚠ Écart au prototype : son motif exigeait une frontière APRÈS « t' », si bien que
     * « t'es », « t'aider » n'étaient jamais reconnus. Ajout de « te » (« te permet »).
     */
    var RE_TUTOIEMENT = /(^|[^A-Za-zÀ-ÿ])((tu|ton|ta|tes|toi|te)([^A-Za-zÀ-ÿ]|$)|t[’'][A-Za-zÀ-ÿ])/i;

    /**
     * La nature PROPOSÉE des cases : des rétroactions si au moins 30 % des cases non vides
     * tutoient, des descripteurs sinon. Toujours « propose » : la personne le confirme.
     * Aucune case de texte → rien à proposer (null).
     */
    L.proposerNature = function (criteres) {
        var textes = [];
        criteres.forEach(function (c) { c.cases.forEach(function (d) { if (d.valeur) textes.push(d.valeur); }); });
        if (!textes.length) return null;
        var auTu = textes.filter(function (t) { return RE_TUTOIEMENT.test(t); }).length;
        return paire(auTu / textes.length >= L.SEUIL_TUTOIEMENT ? 'retroactions' : 'descripteurs', 'propose');
    };

    function texteDeRangee(row) {
        return row.map(function (c) { return c.t; }).filter(Boolean).join(' · ');
    }

    /**
     * Rangées lues → modèle. 1re rangée = niveaux, 1re colonne = critères.
     * @param {{rangees: Array, avant: string[], apres: string[]}} lu
     * @param {'colle'|'exemple'|'main'} source
     */
    L.interpreter = function (lu, source) {
        var r = lu.rangees, entete = r[0], nb = entete.length;
        var aClasser = [];
        var nom = '';
        (lu.avant || []).forEach(function (t, i) {
            if (i === 0 && t.length <= L.LONGUEUR_NOM_MAX) nom = t;
            else aClasser.push({ texte: t, raison: 'Texte avant le tableau' });
        });

        var enteteIrreguliere = entete.some(function (c) { return c.span > 1 || c.rspan > 1; });
        var colPond = -1;
        for (var i = 1; i < nb; i++) {
            if (estEntetePonderation(entete[i].t)) { colPond = i; break; }
        }
        var idxNiv = [];
        for (var j = 1; j < nb; j++) if (j !== colPond) idxNiv.push(j);
        var niveaux = L.coder(idxNiv.map(function (k) { return niveauDeLEntete(entete[k].t); }));

        var criteres = [];
        r.slice(1).forEach(function (row) {
            var texte = texteDeRangee(row);
            if (row.length !== nb || row.some(function (c) { return c.span > 1 || c.rspan > 1; })) {
                aClasser.push({ texte: texte, raison: 'Ligne d’une autre forme que le tableau (cases fusionnées ?)' });
                return;
            }
            if (!row[0].t) { aClasser.push({ texte: texte, raison: 'Ligne sans nom de critère' }); return; }
            if (/^pond/i.test(row[0].t)) {
                aClasser.push({ texte: texte, raison: 'Ligne de pondération, à reporter sur les critères' });
                return;
            }
            var p = colPond >= 0 ? (row[colPond].t.match(/\d+(?:[.,]\d+)?/) || [])[0] : undefined;
            criteres.push({
                nom: paire(row[0].t, 'repris'),
                ponderation: p ? paire(nombreTexte(p), 'repris') : paire('', 'remplir'),
                cases: idxNiv.map(function (k) { return paire(row[k].t, row[k].t ? 'repris' : 'vide'); })
            });
        });
        (lu.apres || []).forEach(function (t) { aClasser.push({ texte: t, raison: 'Texte après le tableau' }); });

        if (criteres.length && criteres.every(function (c) { return !c.ponderation.valeur; })) L.partsEgales(criteres);

        return {
            source: source,
            lecture: { rangees: r, avant: lu.avant || [], apres: lu.apres || [] },
            critEnColonnes: false,
            enteteIrreguliere: enteteIrreguliere,
            nom: paire(nom, nom ? 'repris' : 'remplir'),
            nature: L.proposerNature(criteres),
            niveaux: niveaux,
            criteres: criteres,
            aClasser: aClasser.map(function (a, n) { return Object.assign({ id: n, statut: 'attente' }, a); })
        };
    };

    // ------------------------------------------------------------------
    // 3. INVERSER : critères en colonnes → en lignes
    // ------------------------------------------------------------------

    /**
     * Transpose les rangées LUES. Une case fusionnée sur N colonnes devient N cases marquées
     * fusionnées : après la transposition, leurs rangées vont à « À classer ».
     */
    L.transposer = function (rangees) {
        var grille = rangees.map(function (row) {
            var out = [];
            row.forEach(function (c) {
                var n = Math.max(1, c.span || 1);
                var fusion = n > 1 || (c.rspan || 1) > 1;
                for (var q = 0; q < n; q++) {
                    out.push({ t: q === 0 ? c.t : '', span: fusion ? 2 : 1, rspan: 1 });
                }
            });
            return out;
        });
        var largeur = grille.reduce(function (m, row) { return Math.max(m, row.length); }, 0);
        var t = [];
        for (var j = 0; j < largeur; j++) {
            t.push(grille.map(function (row) { return row[j] || { t: '', span: 1, rspan: 1 }; }));
        }
        return t.filter(function (row) { return row.some(function (c) { return c.t; }); });
    };

    /**
     * Le sens du tableau, choisi par la personne (cadrage, idée de Grégoire du 15 oct.).
     * ⚠ Écart assumé au prototype : il transposait le MODÈLE (critères × niveaux), ce qui
     * jetait la colonne de pondération et les passages à classer. Ici, ce sont les rangées
     * LUES qui sont transposées puis réinterprétées : une grille aux niveaux en lignes a ses
     * plages dans la 1re colonne (« Excellent (85-100 %) ») et sa pondération dans une ligne ;
     * relues dans le bon sens, elles sont reprises au lieu d'être à remplir. Ce qui ne se
     * relit pas retombe comme le dit la consigne : parts égales, plages à remplir. Deux
     * inversions rendent la lecture d'origine.
     * Le nom (repris d'au-dessus du tableau) et la nature, s'ils ont été choisis, sont gardés.
     */
    L.inverser = function (modele) {
        var lu = modele.lecture;
        var nouveau = L.interpreter({ rangees: L.transposer(lu.rangees), avant: lu.avant, apres: lu.apres }, modele.source);
        nouveau.critEnColonnes = !modele.critEnColonnes;
        nouveau.nom = modele.nom;
        if (modele.nature && modele.nature.etat !== 'propose') nouveau.nature = modele.nature;
        return nouveau;
    };

    // ------------------------------------------------------------------
    // 4. CHARGER : de ce qu'on a collé à un modèle, ou à un message clair
    // ------------------------------------------------------------------

    L.MESSAGE_SANS_TABLEAU = 'L’application n’a pas trouvé de tableau dans ce que tu as collé. Dans Word ou Pages, sélectionne le tableau lui-même en entier, ou tape ta grille à la main.';
    L.MESSAGE_INCOMPLET = 'Le tableau collé semble incomplet : il faut au moins un critère et deux niveaux. Tu pourrais vérifier ta sélection dans le document, ou taper ta grille à la main.';

    /**
     * @returns {{modele: Object}|{erreur: string}} — jamais d'échec muet.
     */
    L.charger = function (lu, source) {
        if (!lu) return { erreur: L.MESSAGE_SANS_TABLEAU };
        var m = L.interpreter(lu, source);
        if (m.niveaux.length < 2 || m.criteres.length < 1) return { erreur: L.MESSAGE_INCOMPLET };
        return { modele: m };
    };

    /** Une grille vide de 3 critères × 4 niveaux, pour « Taper ma grille à la main ». */
    L.modeleVide = function () {
        var niveaux = L.coder([1, 2, 3, 4].map(function () {
            return { titre: paire('', 'remplir'), min: paire('', 'remplir'), max: paire('', 'remplir') };
        }));
        var criteres = [1, 2, 3].map(function () {
            return {
                nom: paire('', 'remplir'), ponderation: paire('', 'remplir'),
                cases: niveaux.map(function () { return paire('', 'vide'); })
            };
        });
        return {
            source: 'main', lecture: null, critEnColonnes: false, enteteIrreguliere: false,
            nom: paire('', 'remplir'), nature: null, niveaux: niveaux, criteres: criteres, aClasser: []
        };
    };

    /** La grille fictive du prototype (« Exposé oral ») : 3 critères, 4 niveaux, 1 passage à classer. */
    L.exempleHtml = function () {
        return '<p>Exposé oral : grille d’évaluation</p>' +
            '<table>' +
            '<tr><td>Critères</td><td>Pondération</td><td>Excellent</td><td>Satisfaisant</td><td>À améliorer</td><td>Insuffisant</td></tr>' +
            '<tr><td>Contenu</td><td>40</td><td>Les idées sont justes, précises et appuyées par des exemples pertinents.</td><td>Les idées sont justes et généralement appuyées.</td><td>Les idées sont parfois imprécises ou peu appuyées.</td><td>Les idées sont souvent inexactes ou absentes.</td></tr>' +
            '<tr><td>Organisation</td><td>30</td><td>Le plan est clair ; les transitions guident l’auditoire.</td><td>Le plan est perceptible ; quelques transitions manquent.</td><td>Le plan est difficile à suivre.</td><td>Aucun plan ne se dégage.</td></tr>' +
            '<tr><td>Communication</td><td>30</td><td>Le débit, le volume et le regard soutiennent le propos.</td><td>La communication est claire malgré quelques hésitations.</td><td>Les hésitations nuisent à la compréhension.</td><td>Le propos est difficile à suivre.</td></tr>' +
            '</table>' +
            '<p>La qualité de la langue est évaluée à part, selon la politique du département.</p>';
    };

    // ------------------------------------------------------------------
    // 5. PLAGES : des entiers saisis aux plages contiguës enregistrées
    // ------------------------------------------------------------------

    /**
     * Plages contiguës, comme l'échelle de départ IDME (0-64,99 / 65-74,99…) : saisies en
     * entiers (65-74, 75-84), elles s'enregistrent avec `max` = `min` suivant − 0,01, pour
     * qu'une note de 74,5 tombe dans un niveau. Seul un `max` entier suivi d'un `min` égal à
     * `max + 1` est converti : un chevauchement ou un trou reste tel quel (l'assistant du
     * lot 2 l'avertit). Le niveau le plus haut garde son `max`. Aucune `valeurCalcul` n'est
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
