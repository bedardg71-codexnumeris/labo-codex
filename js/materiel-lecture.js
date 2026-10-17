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
 * Lot 3a (`CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3a-roles.md`) : le tableau est
 * DÉPLIÉ en grille régulière (cases fusionnées), les retours à la ligne d'une case survivent,
 * et le modèle se construit à partir des RÔLES de chaque rangée et de chaque colonne
 * (`proposerRoles`, `modeleDepuisRoles`) : la lecture automatique n'est qu'une proposition,
 * que la personne corrige à l'étape « Ce que contient ton tableau ».
 *
 * Étape 5 du plan « prêt pour lundi » (`CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md`) :
 * une grille SANS colonne de niveau est une grille EN POINTS (`enPoints`), acceptée telle
 * quelle — chaque critère porte ses points, rien n'est inventé. Rôle de colonne « Partie »
 * (un regroupement, préfixé au nom du critère) ; une case de critère sur plusieurs lignes
 * donne son nom (1re ligne) et sa description (les suivantes).
 *
 * Étape 5b (`CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md`, d'après
 * `PROPOSITION-2026-10-17-reconnaissance-des-grilles.md`, numéros repris) : lignes de pied et de
 * calcul à classer (2), puces retirées partout (3), points écrits dans les cases de niveau (4) ou
 * en réglette (5) — la grille est alors EN POINTS, ses niveaux ne gardent que leur nom —, case de
 * nom : sous-critères à puce, description sans (6), suites sous un critère et noms coupés (7),
 * colonnes de cases à cocher et constats (8), pas d'en-tête (9), parties en rangée (10),
 * pondération au bout du nom (11).
 *
 * Ce que produit la lecture (le « modèle » d'une grille collée, consommé par l'assistant) :
 * chaque valeur est une paire `{ valeur, etat }`.
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
    /** Blocs de texte : un retour à la ligne dans une case (lot 3a), un passage chacun hors du tableau. */
    var BLOCS = 'p, h1, h2, h3, h4, h5, h6, li, div, blockquote, pre, caption';
    /** Marque d'un retour à la ligne VOULU (bloc, <br>), posée avant que les blancs du source HTML se resserrent. */
    var SAUT = '\uE000';

    function propre(s) {
        return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    }
    L.propre = propre;

    /** Les lignes d'un texte marqué : chacune resserrée, les lignes vides retirées. */
    function lignesDe(s) {
        return String(s == null ? '' : s).split(SAUT).map(propre).filter(Boolean);
    }

    /** Les lignes d'une case lue (`\n` entre elles). */
    L.lignes = function (t) {
        return String(t == null ? '' : t).split('\n').map(propre).filter(Boolean);
    };

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
     * sont GARDÉES (lot 3a) : une case fusionnée sur plusieurs rangées les compte ; le
     * dépliage les retire ensuite.
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

    var RE_NOMBRE = '(\\d+(?:[.,]\\d+)?)';
    var RE_SEP = '\\s*%?\\s*(?:-|–|—|à|au)\\s*';
    /** « Excellent (85-100 %) », « Excellent 85 à 100 », « 85 % – 100 % ». */
    var RE_PLAGE = new RegExp(RE_NOMBRE + RE_SEP + RE_NOMBRE + '\\s*%?');
    var RE_PLAGE_A_RETIRER = new RegExp('[(\\[]?\\s*' + RE_NOMBRE + RE_SEP + RE_NOMBRE + '\\s*%?\\s*[)\\]]?');

    // ------------------------------------------------------------------
    // 2. DÉPLIER : des rangées lues à une grille régulière (lot 3a)
    // ------------------------------------------------------------------

    /**
     * Les cases fusionnées sont DÉPLIÉES avant toute interprétation : une case sur N colonnes
     * garde son texte dans la première et laisse les suivantes vides ; une case sur N rangées,
     * dans la première rangée. Chaque rangée a alors le même nombre de cases.
     * Une case de la grille : { t, fusion: fait partie d'une case fusionnée,
     *   suite: '' (case d'origine ou normale) | 'h' (à droite de l'origine) | 'v' (sous elle),
     *   manque: true si la rangée était plus courte que le tableau (dépliage impossible) }.
     * Les rangées vides sont retirées APRÈS le dépliage.
     *
     * @param {Array} rangees - rangées lues ({ t, span, rspan })
     * @returns {Array} rangées de cases dépliées, toutes de même largeur
     */
    L.deplier = function (rangees) {
        var g = [];
        rangees.forEach(function (row, r) {
            g[r] = g[r] || [];
            var c = 0;
            row.forEach(function (cell) {
                while (g[r][c]) c++;
                var cs = Math.max(1, cell.span || 1);
                var rs = Math.max(1, Math.min(cell.rspan || 1, rangees.length - r));
                var fusion = cs > 1 || rs > 1;
                for (var dr = 0; dr < rs; dr++) {
                    g[r + dr] = g[r + dr] || [];
                    for (var dc = 0; dc < cs; dc++) {
                        g[r + dr][c + dc] = {
                            t: dr === 0 && dc === 0 ? (cell.t || '') : '', fusion: fusion,
                            suite: dr > 0 ? 'v' : (dc > 0 ? 'h' : '')
                        };
                    }
                }
                c += cs;
            });
        });
        var largeur = g.reduce(function (m, row) { return Math.max(m, row.length); }, 0);
        return g.map(function (row) {
            var out = [];
            for (var j = 0; j < largeur; j++) out.push(row[j] || { t: '', fusion: false, suite: '', manque: true });
            return out;
        }).filter(aDuTexte);
    };

    /** Transpose une grille dépliée : une suite horizontale devient verticale, et l'inverse. */
    function transposerGrille(g) {
        var largeur = g.length ? g[0].length : 0, t = [];
        for (var j = 0; j < largeur; j++) {
            t.push(g.map(function (row) {
                var c = row[j];
                return Object.assign({}, c, { suite: c.suite === 'h' ? 'v' : (c.suite === 'v' ? 'h' : '') });
            }));
        }
        return t.filter(aDuTexte);
    }

    /**
     * La lecture DANS LE SENS CHOISI à l'étape « Sens du tableau » : la grille dépliée, transposée
     * si les critères sont en colonnes. C'est à elle que s'appliquent les rôles.
     * ⚠ Écart assumé au prototype (lot 1) : ce sont les rangées LUES qui sont transposées puis
     * réinterprétées, pas le modèle ; deux inversions rendent la lecture d'origine.
     */
    L.orienter = function (lu, enColonnes) {
        var g = L.deplier(lu.rangees);
        return { rangees: enColonnes ? transposerGrille(g) : g, avant: lu.avant || [], apres: lu.apres || [] };
    };

    // ------------------------------------------------------------------
    // 3. LES RÔLES : ce qu'est chaque rangée, chaque colonne (lot 3a)
    // ------------------------------------------------------------------

    /**
     * Principe de Grégoire (17 oct., 8 h 23) : la lecture automatique n'est qu'une PROPOSITION ;
     * l'utilisateur dit ce qu'est chaque rangée et chaque colonne. Libellés PROVISOIRES (relus en 3b).
     */
    L.ROLES_RANGEES = [
        { id: 'niveaux', libelle: 'Noms des niveaux' },
        { id: 'codes', libelle: 'Codes des niveaux' },
        { id: 'plages', libelle: 'Plages de notes' },
        { id: 'critere', libelle: 'Un critère' },
        { id: 'nomCritere', libelle: 'Nom d’un critère' },
        { id: 'suite', libelle: 'Suite du critère' },
        // Étape 5b (17 oct.) : un regroupement de critères écrit en rangée (« INTRODUCTION »),
        // préfixé au nom des critères qui le suivent. Libellé PROVISOIRE (étape 7).
        { id: 'partie', libelle: 'Partie' },
        { id: 'ignorer', libelle: 'À ignorer' }
    ];
    L.ROLES_COLONNES = [
        { id: 'noms', libelle: 'Noms des critères' },
        // Étape 5 (17 oct.) : un regroupement de critères (« Introduction »), souvent en case
        // fusionnée verticale. Libellé PROVISOIRE (étape 7).
        { id: 'partie', libelle: 'Partie' },
        // Étape 5 : avec des colonnes de niveau, la pondération ; sans, les points (le maximum
        // de chaque critère). Libellé PROVISOIRE (étape 7).
        { id: 'pond', libelle: 'Points ou pondération' },
        { id: 'niveau', libelle: 'Un niveau' },
        { id: 'sousCriteres', libelle: 'Sous-critères' },
        { id: 'description', libelle: 'Description du critère' },
        { id: 'ignorer', libelle: 'À ignorer' }
    ];
    /** Dans une « Suite du critère », ce que devient la case de la colonne « Noms des critères ». */
    L.CHOIX_SUITE = [
        // Étape 5b (17 oct.) : proposé par défaut. Libellé PROVISOIRE (étape 7).
        { id: 'selonPuces', libelle: 'selon les puces : un sous-critère par ligne à puce, la description pour les autres lignes' },
        { id: 'sousCriteres', libelle: 'des sous-critères, un par ligne' },
        { id: 'description', libelle: 'la description du critère' },
        { id: 'rien', libelle: 'rien à garder' }
    ];
    /**
     * Un seul de ces rôles par tableau : en choisir un autre fait passer le précédent à
     * « À ignorer ». ⚠ « Noms des critères » et « Pondération » aussi (supposition de Claude
     * Code, 17 oct. : la consigne ne lit que la première ; une seconde ne servirait à rien).
     * « Partie » de même (étape 5) : une seule colonne de regroupement.
     */
    var UNIQUES = { rangees: ['niveaux', 'codes', 'plages'], colonnes: ['noms', 'pond', 'partie'] };

    /** Un code de niveau tel qu'un document l'écrit : court (≤ 4 caractères), sans espace. */
    function estCode(t) { return !!t && t.length <= 4 && !/\s/.test(t); }

    /** Une case qui ne porte qu'une plage : « 65-74 », « 65 à 74 % ». */
    var RE_PLAGE_SEULE = new RegExp('^' + RE_NOMBRE + RE_SEP + RE_NOMBRE + '\\s*%?$');

    /** Au-delà, une case d'en-tête n'est plus un nom de niveau (sauf sous une case fusionnée de la 1re rangée). */
    L.LONGUEUR_ENTETE_MAX = 60;

    function casesDe(row, colonnes, role) {
        var out = [];
        colonnes.forEach(function (r, j) { if (r === role && row[j]) out.push(row[j]); });
        return out;
    }

    /** Ce que porte une rangée d'en-tête : 'plages', 'codes', 'noms', ou '' (rien dans les niveaux). */
    function natureEntete(row, colonnes) {
        var cs = casesDe(row, colonnes, 'niveau').map(function (c) { return propre(c.t); }).filter(Boolean);
        if (!cs.length) return '';
        if (cs.every(function (t) { return RE_PLAGE_SEULE.test(t); })) return 'plages';
        if (cs.every(estCode)) return 'codes';
        return 'noms';
    }

    /**
     * Les rangées d'en-tête : la 1re, puis celles qui la suivent sans nom de critère et dont les
     * cases de niveau sont courtes — ou qui sont sous une case fusionnée de la 1re rangée.
     */
    function rangeesEntete(g, colonnes) {
        var fin = 0, colNoms = Math.max(0, colonnes.indexOf('noms'));
        for (var i = 1; i < g.length; i++) {
            var nomCase = g[i][colNoms];
            if (!nomCase || nomCase.t) break;
            var sousLaPremiere = nomCase.suite === 'v' && g[0][colNoms] && g[0][colNoms].fusion;
            var courtes = casesDe(g[i], colonnes, 'niveau').every(function (c) {
                return !c.t || (c.t.indexOf('\n') < 0 && c.t.length <= L.LONGUEUR_ENTETE_MAX);
            });
            if (!natureEntete(g[i], colonnes) || !(sousLaPremiere || courtes)) break;
            fin = i;
        }
        return fin;
    }

    function estBande(row, colonnes) {
        var cs = casesDe(row, colonnes, 'niveau'), nom = row[Math.max(0, colonnes.indexOf('noms'))];
        return !!(nom && propre(nom.t)) && cs.length > 0 && cs.every(function (c) { return estCode(propre(c.t)) && c.t.indexOf('\n') < 0; });
    }

    /** « 0 1 2 … 15 », « 0, 1, 2, 3 » : une suite de nombres (une réglette de points). */
    var RE_REGLETTE = /^\d+(?:[.,]\d+)?(?:\s*[,;]?\s*(?:…|\.{3})?\s*\d+(?:[.,]\d+)?)+$/;

    function nombresDe(t) {
        return (String(t).match(/\d+(?:[.,]\d+)?/g) || []).map(function (n) { return parseFloat(n.replace(',', '.')); });
    }

    /**
     * Étape 5b (point 5) : une bande à RÉGLETTE — la case de nom remplie, et les cases de niveau
     * ne forment qu'une case fusionnée de nombres (« 0 1 2 … 15 ») ou de points (« / 5 »).
     * Rend le plus grand nombre (les points du critère), ou null.
     */
    function pointsReglette(row, colonnes) {
        var cs = casesDe(row, colonnes, 'niveau'), nom = row[Math.max(0, colonnes.indexOf('noms'))];
        if (!nom || !propre(nom.t) || cs.length < 2 || !cs.slice(1).every(function (c) { return c.suite === 'h'; })) return null;
        var t = propre(cs[0].t).replace(/\s*…\s*/g, ' … ');
        if (!RE_REGLETTE.test(propre(cs[0].t)) && !estPoints(t)) return null;
        return Math.max.apply(null, nombresDe(t));
    }
    function estReglette(row, colonnes) { return pointsReglette(row, colonnes) !== null; }
    L.pointsReglette = pointsReglette;

    /** « 3 », « 7-8 », « 10-11-12 » : la dernière ligne d'une case de niveau qui porte ses points. */
    var RE_POINTS_NIVEAU = /^\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)*$/;

    /**
     * Étape 5b (point 4) : les points d'un niveau. Quand chaque case de niveau remplie (sauf, au plus,
     * la première) porte un texte PUIS, sur sa dernière ligne, un nombre, une plage ou une énumération
     * (la forme de la proposition : « un descripteur ou un qualificatif, puis les points »), le plus grand
     * nombre de la rangée est le maximum du critère (Q1 de Grégoire, 12 h 11 : « aussitôt qu'il y a
     * des chiffres, il s'agit d'une note chiffrée »). Deux cases au moins ; rend null sinon. Le
     * nombre RESTE dans le texte de la case.
     * @param {string[]} cases - le texte des cases de niveau d'un critère
     */
    L.pointsDesNiveaux = function (cases) {
        var pleines = cases.map(L.lignes).filter(function (l) { return l.length; });
        // Une case faite d'un seul nombre (« 1 », « 2 ») reste un descripteur : supposition de Claude
        // Code (17 oct.), pour que les grilles des lots 1 et 3a se lisent comme avant.
        var nombres = pleines.map(function (l) { return l.length > 1 && RE_POINTS_NIVEAU.test(l[l.length - 1]) ? Math.max.apply(null, nombresDe(l[l.length - 1])) : null; });
        var avec = nombres.filter(function (n) { return n !== null; });
        if (avec.length < 2 || nombres.slice(1).some(function (n) { return n === null; })) return null;
        return Math.max.apply(null, avec);
    };

    /** Une case à cocher (« [ ] », « [ », « ] », « ☐ ») ; un petit numéro (« 1 ») l'accompagne parfois. */
    var RE_CASE_A_COCHER = /^(?:\[\s*\]?|\]|[☐□☑■])$/;

    /**
     * Étape 5b (point 8) : une colonne de cases à cocher — ses cases remplies (rangée de numéros
     * comprise) sont toutes des cases à cocher ou de petits numéros, avec au moins une case.
     */
    function colonneACocher(g, k) {
        var pleines = g.map(function (row) { return propre(row[k].t); }).filter(Boolean);
        return pleines.some(function (t) { return RE_CASE_A_COCHER.test(t); }) &&
            pleines.every(function (t) { return RE_CASE_A_COCHER.test(t) || /^\d{1,2}$/.test(t); });
    }

    /**
     * Étape 5b (point 9) : PAS D'EN-TÊTE. La 1re rangée est un critère quand elle porte des points
     * dans une colonne où les suivantes en portent, ou quand aucune de ses cases de niveau n'est
     * courte. Une 1re case qui parle de critères reste un en-tête.
     */
    function premiereEstCritere(g, colonnes) {
        if (g.length < 2) return false;
        var r0 = g[0], colNoms = Math.max(0, colonnes.indexOf('noms'));
        var nom = propre(r0[colNoms].t);
        if (!nom || /crit/i.test(nom)) return false;
        for (var k = 0; k < r0.length; k++) {
            if (k !== colNoms && estPoints(r0[k].t) && casesDePoints(g.slice(1), k)) return true;
        }
        var cs = casesDe(r0, colonnes, 'niveau').filter(function (c) { return propre(c.t); });
        return cs.length > 0 && cs.every(function (c) { return c.t.indexOf('\n') >= 0 || c.t.length > L.LONGUEUR_ENTETE_MAX; });
    }

    /** La dernière rangée d'en-tête, ou -1 s'il n'y en a pas (point 9). */
    function finEntete(g, colonnes) {
        return premiereEstCritere(g, colonnes) ? -1 : rangeesEntete(g, colonnes);
    }

    function aDesTextesLongs(row, colonnes) {
        return casesDe(row, colonnes, 'niveau').some(function (c) { return c.t && !estCode(propre(c.t)); });
    }

    /**
     * Ce que propose l'application (fonction pure). Colonnes : la 1re nomme les critères, une
     * colonne d'en-tête « pondération » la porte, les autres sont des niveaux. Rangées : en
     * tête, la DERNIÈRE rangée de noms courts nomme les niveaux (les précédentes sont « À
     * ignorer ») ; une rangée de codes ou de plages seules les donne. Puis, une bande dont les
     * cases de niveau sont des codes suivie d'une rangée de textes longs : « Nom d'un critère »
     * puis « Suite du critère » ; une rangée sous la case fusionnée d'un critère : sa suite ;
     * sinon « Un critère ».
     *
     * @param {{rangees: Array}} lu - la lecture orientée (`orienter`)
     * @returns {{rangees: string[], colonnes: string[], suiteNom: string, propose: boolean}}
     */
    L.proposerRoles = function (lu) {
        var g = lu.rangees;
        var colonnes = proposerColonnes(g);
        var fin = finEntete(g, colonnes);
        var entete = rolesEntete(g, colonnes, fin);
        var rangees = entete.concat(rolesCorps(g, colonnes, fin, g[entete.indexOf('niveaux')]));
        // Étape 5b (point 6) : « selon les puces » proposé par défaut.
        return { rangees: rangees, colonnes: colonnes, suiteNom: 'selonPuces', propose: true };
    };

    /**
     * La 1re colonne nomme les critères ; la 1re dont l'en-tête dit « pondération » ou « points »,
     * ou dont les cases sont surtout des points (« /4 », « 4 pts », « sur 18 »), la porte ; une
     * colonne « Commentaires » vide est à ignorer (étape 5) ; les autres sont des niveaux.
     * Une 1re colonne aux cases fusionnées verticalement devient « Partie » quand la 2e peut
     * porter les noms (`proposerPartie`).
     */
    function proposerColonnes(g) {
        var nb = g.length ? g[0].length : 0, colonnes = [];
        for (var j = 0; j < nb; j++) colonnes.push(j === 0 ? 'noms' : 'niveau');
        var fin = finEntete(g, colonnes);
        var entete = g.slice(0, fin + 1), corps = g.slice(fin + 1), pond = false, aCocher = false;
        for (var k = 1; k < nb; k++) {
            var titres = entete.map(function (row) { return propre(row[k].t); });
            if (!pond && (titres.some(estEntetePonderation) || casesDePoints(corps, k))) { colonnes[k] = 'pond'; pond = true; }
            else if (titres.some(estEnteteCommentaires) && corps.every(function (row) { return !propre(row[k].t); })) colonnes[k] = 'ignorer';
            else if (colonneACocher(g, k)) { colonnes[k] = 'ignorer'; aCocher = true; }
        }
        // Étape 5b (point 8, Q2 validée par Grégoire à 12 h 52) : à côté de cases à cocher, les autres
        // colonnes de texte sont des constats — la description du critère, ni niveaux ni rétroactions.
        if (aCocher) colonnes.forEach(function (r, q) { if (r === 'niveau') colonnes[q] = 'description'; });
        if (proposerPartie(g, colonnes, fin)) { colonnes[0] = 'partie'; colonnes[1] = 'noms'; }
        return colonnes;
    }

    /** « /4 », « / 18 », « sur 25 », « 4 pts », « 4 points » (des traits à remplir devant sont permis) ; jamais un nombre nu. */
    var RE_POINTS_PREFIXE = /^(?:sur|\/)\s*\d+(?:[.,]\d+)?\s*(?:pts?\.?|points?)?$/i;
    var RE_POINTS_SUFFIXE = /^\d+(?:[.,]\d+)?\s*(?:pts?\.?|points?)$/i;

    function estPoints(t) {
        var s = propre(t).replace(/^[_.…\s]+/, '');
        return RE_POINTS_PREFIXE.test(s) || RE_POINTS_SUFFIXE.test(s);
    }

    /** Les cases non vides d'une colonne sont SURTOUT des points (plus de la moitié). */
    function casesDePoints(corps, k) {
        var pleines = corps.map(function (row) { return propre(row[k].t); }).filter(Boolean);
        return pleines.length > 0 && pleines.filter(estPoints).length * 2 > pleines.length;
    }

    function estEnteteCommentaires(h) { return /^(commentaires?|remarques?)\b/i.test(h); }

    /**
     * « Partie » (étape 5) : la 1re colonne porte, SOUS l'en-tête, une case fusionnée sur
     * plusieurs rangées, chacune de ces rangées a un texte dans la 2e colonne, et celle-ci
     * peut porter les noms — son en-tête prolonge celui de la 1re (« CRITÈRES » sur deux
     * colonnes), parle de critères, ou il n'y a aucune autre colonne de niveau (une grille en
     * points). Sinon, la rangée sous une case fusionnée reste la suite d'un critère (lot 3a).
     */
    function proposerPartie(g, colonnes, fin) {
        if (!g.length || g[0].length < 2 || colonnes[1] !== 'niveau') return false;
        var corps = g.slice(fin + 1), couvertes = [];
        corps.forEach(function (row, q) {
            if (row[0].suite === 'v' && q > 0 && (couvertes.indexOf(q - 1) >= 0 || (corps[q - 1][0].fusion && !corps[q - 1][0].suite))) {
                if (couvertes.indexOf(q - 1) < 0) couvertes.push(q - 1);
                couvertes.push(q);
            }
        });
        if (!couvertes.length || !couvertes.every(function (q) { return propre(corps[q][1].t); })) return false;
        var entete1 = g.slice(0, fin + 1).map(function (row) { return row[1]; });
        var autresNiveaux = colonnes.some(function (r, j) { return j > 1 && r === 'niveau'; });
        return entete1.some(function (c) { return c.suite === 'h' || /crit/i.test(c.t); }) || !autresNiveaux;
    }

    /**
     * En tête : la DERNIÈRE rangée de noms nomme les niveaux ; la 1re de codes, de plages les donne ;
     * le reste est ignoré. Sans colonne de niveau (une grille en points, étape 5), tout est ignoré.
     */
    function rolesEntete(g, colonnes, fin) {
        if (colonnes.indexOf('niveau') < 0) return g.slice(0, fin + 1).map(function () { return 'ignorer'; });
        var natures = g.slice(0, fin + 1).map(function (row) { return natureEntete(row, colonnes); });
        var noms = natures.lastIndexOf('noms');
        if (noms < 0) noms = 0;
        var roles = [];
        natures.forEach(function (nat, h) {
            if (h === noms) roles.push('niveaux');
            else if ((nat === 'codes' || nat === 'plages') && roles.indexOf(nat) < 0) roles.push(nat);
            else roles.push('ignorer');
        });
        return roles;
    }

    /** Les cases de niveau d'une rangée répètent celles de l'en-tête (une partie qui le recopie, point 10). */
    function repeteEntete(row, entete, colonnes) {
        if (!entete || !propre(row[Math.max(0, colonnes.indexOf('noms'))].t)) return false;
        var a = casesDe(row, colonnes, 'niveau').map(function (c) { return propre(c.t); });
        var b = casesDe(entete, colonnes, 'niveau').map(function (c) { return propre(c.t); });
        return a.some(Boolean) && a.join('\u0001') === b.join('\u0001');
    }

    /** Seule la case de nom est remplie, en majuscules, et un critère suit : une partie (point 10). */
    function estPartieSeule(g, i, colNoms) {
        var row = g[i], nom = propre(row[colNoms].t), suivante = g[i + 1];
        var lettres = nom.replace(/[^A-Za-zÀ-ÿ]/g, '');
        return lettres.length >= 2 && lettres === lettres.toUpperCase() &&
            row.every(function (c, j) { return j === colNoms || !propre(c.t); }) &&
            !!suivante && !!propre(suivante[colNoms].t) && !raisonPied(suivante, colNoms) &&
            !suivante.every(function (c, j) { return j === colNoms || !propre(c.t); });
    }

    /** Toutes les cases remplies de la rangée sont dans des colonnes à ignorer (la rangée de numéros, point 8). */
    function seulementIgnorees(row, colonnes) {
        return row.every(function (c, j) { return !propre(c.t) || colonnes[j] === 'ignorer'; });
    }

    var FIN_DE_PHRASE = /[.:;!?)»]$/;

    /** Un nom coupé sur deux rangées (point 7) : une seule ligne de part et d'autre, la seconde en minuscule. */
    function nomCoupe(lignesHaut, lignesBas) {
        return lignesHaut.length === 1 && !FIN_DE_PHRASE.test(lignesHaut[0]) &&
            lignesBas.length === 1 && /^[a-zà-ÿ]/.test(lignesBas[0]);
    }

    /**
     * Sous l'en-tête. Étape 5b : une ligne de pied ou de calcul est « Un critère », qui ira à
     * « À classer » avec sa raison (point 2) ; une rangée de numéros de cases, « À ignorer »
     * (point 8) ; une partie, « Partie » (point 10). Puis : bande (codes ou réglette) + rangée de
     * textes longs → nom et suite ; une bande seule → son nom (point 5) ; sous un critère, une case
     * de nom fusionnée, vide (point 7) ou qui prolonge un nom coupé → suite ; sinon un critère.
     */
    function rolesCorps(g, colonnes, fin, entete) {
        var x = {
            g: g, colonnes: colonnes, entete: entete, fin: fin, roles: [],
            colNoms: Math.max(0, colonnes.indexOf('noms')), colPond: colonnes.indexOf('pond'),
            critereValide: false,   // la rangée de critère au-dessus n'est pas allée « À classer »
            codesBande: null        // les codes de la dernière bande suivie de sa rangée de textes
        };
        for (var i = fin + 1; i < g.length; i++) i += roleDeRangee(x, i);
        return x.roles;
    }

    function pousser(x, role, valide) { x.roles.push(role); x.critereValide = valide; return 0; }

    function codesDe(row, colonnes) { return casesDe(row, colonnes, 'niveau').map(function (c) { return propre(c.t); }).join('\u0001'); }

    function estUneBande(row, colonnes) { return estBande(row, colonnes) || estReglette(row, colonnes); }

    /** Le rôle de la rangée i (et de la suivante, pour une bande suivie de ses textes) ; rend le nombre de rangées sautées. */
    function roleDeRangee(x, i) {
        var row = x.g[i], cols = x.colonnes;
        if (raisonPied(row, x.colNoms)) return pousser(x, 'critere', false);
        if (seulementIgnorees(row, cols)) return pousser(x, 'ignorer', x.critereValide);
        if (repeteEntete(row, x.entete, cols) || estPartieSeule(x.g, i, x.colNoms)) return pousser(x, 'partie', false);
        var bande = roleDeBande(x, i);
        if (bande >= 0) return bande;
        if (estSuiteProposee(x, i)) return pousser(x, 'suite', x.critereValide);
        return pousser(x, 'critere', !raisonAClasser(row, x.colNoms));
    }

    /** Une bande + sa rangée de textes longs → nom et suite ; une bande seule → son nom (point 5). Rend -1 sinon. */
    function roleDeBande(x, i) {
        var row = x.g[i], suivante = x.g[i + 1], cols = x.colonnes;
        if (!estUneBande(row, cols)) return -1;
        var valide = !raisonAClasser(row, x.colNoms);
        if (suivante && !estUneBande(suivante, cols) && !raisonPied(suivante, x.colNoms) && aDesTextesLongs(suivante, cols)) {
            x.roles.push('nomCritere');
            pousser(x, 'suite', valide);
            if (estBande(row, cols)) x.codesBande = codesDe(row, cols);
            return 1;
        }
        // Une bande seule : une réglette, ou les mêmes codes qu'une bande appariée (la langue, F2).
        if (estReglette(row, cols) || codesDe(row, cols) === x.codesBande) return pousser(x, 'nomCritere', valide);
        return -1;
    }

    /** Sous un critère : une case de nom fusionnée, vide (point 7), ou qui prolonge un nom coupé. */
    function estSuiteProposee(x, i) {
        var row = x.g[i], prec = i > x.fin + 1 ? x.roles[i - x.fin - 2] : '';
        var nom = row[x.colNoms];
        if (!x.critereValide || ['critere', 'nomCritere', 'suite'].indexOf(prec) < 0 || !nom) return false;
        if (nom.suite === 'v' || !propre(nom.t)) return true;
        return prec === 'critere' && (x.colPond < 0 || !propre(row[x.colPond].t)) &&
            nomCoupe(L.lignes(x.g[i - 1][x.colNoms].t), L.lignes(nom.t));
    }

    /**
     * Change le rôle d'une rangée (`'rangees'`) ou d'une colonne (`'colonnes'`) : rend une COPIE,
     * plus « proposée ». Un rôle unique déjà pris ailleurs y passe à « À ignorer ».
     */
    L.changerRole = function (roles, sorte, index, role) {
        var r = JSON.parse(JSON.stringify(roles));
        var liste = r[sorte];
        var permis = (sorte === 'rangees' ? L.ROLES_RANGEES : L.ROLES_COLONNES).map(function (x) { return x.id; });
        if (!liste || index < 0 || index >= liste.length || permis.indexOf(role) < 0) return roles;
        if (UNIQUES[sorte].indexOf(role) >= 0) {
            liste.forEach(function (x, q) { if (x === role && q !== index) liste[q] = 'ignorer'; });
        }
        liste[index] = role;
        r.propose = false;
        return r;
    };

    // ------------------------------------------------------------------
    // 4. INTERPRÉTER : de la grille et de ses rôles au modèle d'une grille
    // ------------------------------------------------------------------

    /** En-tête d'une colonne de pondération ou de points : pondération, points, pts, note(s), total, /N, sur N, %. */
    function estEntetePonderation(h) {
        return /pond/i.test(h) || /^(points?|pts|notes?|total)\b/i.test(h) || /^(\/|sur)\s*\d+$/i.test(h) || /^%$/.test(h);
    }

    function nombreTexte(s) { return String(s).replace(',', '.'); }

    function plageDe(brut) {
        var p = brut.match(RE_PLAGE);
        if (!p) return null;
        var lo = nombreTexte(p[1]), hi = nombreTexte(p[2]);
        if (parseFloat(lo) > parseFloat(hi)) { var tmp = lo; lo = hi; hi = tmp; }
        return { min: paire(lo, 'repris'), max: paire(hi, 'repris') };
    }

    function niveauDeLEntete(brut) {
        var p = plageDe(brut);
        if (p) {
            var titre = propre(brut.replace(RE_PLAGE_A_RETIRER, '').replace(/[:–—-]\s*$/, ''));
            return { titre: paire(titre, titre ? 'repris' : 'remplir'), min: p.min, max: p.max };
        }
        return {
            titre: paire(brut, brut ? 'repris' : 'remplir'),
            min: paire('', 'remplir'), max: paire('', 'remplir')
        };
    }

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
        return row.map(function (c) { return propre(c.t); }).filter(Boolean).join(' · ');
    }

    /** Puces et cases à cocher en tête de ligne, retirées des sous-critères, de la description du
     *  critère (relecture de Cowork du lot 3a, 17 oct.) et, depuis l'étape 5b (point 3), du nom. */
    var RE_PUCE = /^[☐☑□■•*↳·▪◦‣➤–-]+\s*/;

    function sansPuce(l) { return l.replace(RE_PUCE, '').trim(); }
    function estAPuce(l) { return RE_PUCE.test(l) && !!sansPuce(l); }

    function lignesSansPuces(t) {
        return L.lignes(t).map(sansPuce).filter(Boolean);
    }

    /** Étape 5b (point 6) : les lignes à puce sont des sous-critères, les autres la description. */
    function selonPuces(lignes) {
        return {
            sous: lignes.filter(estAPuce).map(sansPuce),
            description: lignes.filter(function (l) { return !estAPuce(l) && sansPuce(l); }).map(sansPuce).join('\n')
        };
    }

    function joindre(a, b) { return a && b ? a + '\n' + b : (a || b); }

    /** Étape 5b (point 11) : une pondération au bout du nom — « | 0,20 », « (25 %) », « – 15 pts », « / 40 ». */
    var RE_POND_NOM = /\s*(?:\|\s*(\d+(?:[.,]\d+)?)\s*%?|\(\s*(\d+(?:[.,]\d+)?)\s*%\s*\)|[–—-]\s*(\d+(?:[.,]\d+)?)\s*(?:pts?\.?|points?)|\s\/\s*(\d+(?:[.,]\d+)?))\s*$/i;

    /** Le nom sans sa pondération finale, et cette pondération (ou null). */
    function nomEtPonderation(nom) {
        var p = nom.match(RE_POND_NOM);
        if (!p || !nom.slice(0, p.index).trim()) return { nom: nom, pond: null };
        return { nom: nom.slice(0, p.index).trim(), pond: nombreTexte(p[1] || p[2] || p[3] || p[4]) };
    }

    /**
     * Les raisons d'aller « À classer ». Étape 5, puis 5b (point 2), Claude Code (17 oct.) : PROVISOIRES
     * (étape 7). Une ligne de pied comptée comme critère doublerait la note, ou en inventerait un.
     */
    L.RAISONS_PIED = {
        total: 'Ligne de total : l’application le calcule elle-même',
        calcul: 'Ligne de calcul de la langue : l’application ne la lit pas encore comme un critère',
        penalite: 'Ligne de pénalité : l’application ne la lit pas encore comme un critère',
        commentaires: 'Espace de commentaires : il se remplit à la correction'
    };
    var RE_LIGNE_TOTAL = /^(?:total\b|note finale\b|note\s*:|r[ée]sultat\b)/i;

    function premierTexte(row, colNoms) {
        var nom = propre(row[colNoms] && row[colNoms].t);
        if (nom) return nom;
        for (var j = 0; j < row.length; j++) if (propre(row[j].t)) return propre(row[j].t);
        return '';
    }

    /**
     * Étape 5b (point 2) : une ligne de pied ou de calcul, jamais un critère. Total, note finale,
     * « Note : », résultat ; une ligne de calcul (« erreurs » et « mots », avec des blancs « ___ ») ;
     * une pénalité ; « Commentaires : » seul. Rend sa raison, ou ''.
     */
    function raisonPied(row, colNoms) {
        var premier = premierTexte(row, colNoms), tout = texteDeRangee(row);
        if (RE_LIGNE_TOTAL.test(premier)) return L.RAISONS_PIED.total;
        if (/\berreurs?\b/i.test(tout) && /\bmots?\b/i.test(tout) && /_{2,}/.test(tout)) return L.RAISONS_PIED.calcul;
        if (/^p[ée]nalit/i.test(premier)) return L.RAISONS_PIED.penalite;
        if (/^commentaires?\s*:?$/i.test(premier) && tout === premier) return L.RAISONS_PIED.commentaires;
        return '';
    }

    /** Pourquoi une rangée « Un critère » ou « Nom d'un critère » va à « À classer » (règles du lot 1, pied de 5b), ou ''. */
    function raisonAClasser(row, colNoms) {
        var pied = raisonPied(row, colNoms);
        if (pied) return pied;
        var irreguliere = row.some(function (c) { return c.manque; }) ||
            (row.length > 1 && row[0].fusion && row.slice(1).every(function (c) { return c.suite === 'h'; }));
        if (irreguliere) return 'Ligne d’une autre forme que le tableau (cases fusionnées ?)';
        var nom = propre(row[colNoms].t);
        if (!nom) return 'Ligne sans nom de critère';
        if (/^pond/i.test(nom)) return 'Ligne de pondération, à reporter sur les critères';
        return '';
    }

    function ponderationDe(row, colPond) {
        var p = colPond >= 0 ? (propre(row[colPond].t).match(/\d+(?:[.,]\d+)?/) || [])[0] : undefined;
        return p ? paire(nombreTexte(p), 'repris') : null;
    }

    /** Les niveaux : titres de « Noms des niveaux », plages de « Plages de notes », codes repris ou complétés. */
    function niveauxDepuisRoles(g, roles, idxNiv) {
        var R = roles.rangees;
        var rN = R.indexOf('niveaux'), rC = R.indexOf('codes'), rP = R.indexOf('plages');
        var bandes = [];
        R.forEach(function (r, i) { if (r === 'nomCritere') bandes.push(i); });
        return L.coder(idxNiv.map(function (k) {
            var n = rN >= 0 ? niveauDeLEntete(propre(g[rN][k].t))
                : { titre: paire('', 'remplir'), min: paire('', 'remplir'), max: paire('', 'remplir') };
            var p = rP >= 0 ? plageDe(propre(g[rP][k].t)) : null;
            if (p) { n.min = p.min; n.max = p.max; }
            var code = '';
            if (rC >= 0) code = propre(g[rC][k].t);
            else if (bandes.length) {
                // Les cases de niveau d'une bande « NOM | I | D | M | E » : des codes, s'ils sont
                // identiques d'une bande à l'autre.
                var vus = bandes.map(function (i) { return propre(g[i][k].t); });
                if (vus.every(function (v) { return estCode(v) && v === vus[0]; })) code = vus[0];
            }
            if (code) n.code = paire(code, 'repris');
            return n;
        }));
    }

    /**
     * La grille orientée et ses rôles → le modèle (fonction pure). Ce qui ne trouve pas sa
     * place va dans `aClasser` avec sa raison ; ce qui empêche de construire va dans
     * `manquesLecture` (affiché dans « Avant de créer, il reste »).
     *
     * @param {{rangees: Array, avant: string[], apres: string[]}} lu - la lecture orientée
     * @param {{rangees: string[], colonnes: string[], suiteNom: string}} roles
     */
    /**
     * L'état d'une lecture (étape 5b : le parcours des rangées est découpé en lecteurs ci-dessous,
     * qui le partagent — sentinelle de complexité).
     */
    function etatDeLecture(g, roles) {
        var K = roles.colonnes, R = roles.rangees, rN = R.indexOf('niveaux');
        var e = {
            g: g, R: R, K: K, suiteNom: roles.suiteNom, idxNiv: [], colsSous: [], colsDesc: [],
            colNoms: K.indexOf('noms'), colPond: K.indexOf('pond'), colPartie: K.indexOf('partie'),
            // Étape 5b (point 10) : quand les parties RECOPIENT l'en-tête, la case d'angle nomme la première.
            parEntete: rN >= 0 && R.some(function (r, i) { return r === 'partie' && repeteEntete(g[i], g[rN], K); }),
            partie: '', partieRangee: '', partiePuce: null,
            criteres: [], courant: null, orphelines: [], aClasser: []
        };
        K.forEach(function (r, j) {
            if (r === 'niveau') e.idxNiv.push(j);
            else if (r === 'sousCriteres') e.colsSous.push(j);
            else if (r === 'description') e.colsDesc.push(j);
        });
        return e;
    }

    function completer(e, c, row) {
        e.colsSous.forEach(function (j) { c.sousCriteres = c.sousCriteres.concat(lignesSansPuces(row[j].t)); });
        e.colsDesc.forEach(function (j) { c.description = joindre(c.description, lignesSansPuces(row[j].t).join('\n')); });
        if (!c.ponderation) c.ponderation = ponderationDe(row, e.colPond);
    }

    function premiereLigne(t) { return sansPuce(L.lignes(t)[0] || ''); }

    /**
     * Étape 5 : la colonne « Partie » court sur les rangées que sa case fusionnée couvre ; une case
     * vide non fusionnée, ou une rangée d'en-tête, l'arrête. Étape 5b (point 10) : la partie en rangée.
     */
    function suivrePartie(e, row, role) {
        if (e.colPartie >= 0) {
            var cp = row[e.colPartie];
            if (['niveaux', 'codes', 'plages'].indexOf(role) >= 0) e.partie = '';
            else if (propre(cp.t)) e.partie = propre(cp.t);
            else if (cp.suite !== 'v') e.partie = '';
        }
        if (role === 'niveaux') e.partieRangee = e.parEntete ? premiereLigne(row[e.colNoms].t) : '';
        if (role === 'partie') { e.partieRangee = premiereLigne(row[e.colNoms].t); e.partiePuce = null; e.courant = null; }
    }

    /** Point 10 : quand les critères d'une partie s'écrivent à puce, un nom sans puce la clôt (F8). */
    function prefixeDePartie(e, aPuce) {
        if (e.partieRangee && e.partiePuce === null) e.partiePuce = aPuce;
        else if (e.partieRangee && e.partiePuce && !aPuce) e.partieRangee = '';
        return e.partie || e.partieRangee;
    }

    /** Une rangée « Un critère » ou « Nom d'un critère » : un critère, ou un passage à classer. */
    function lireCritere(e, row, role) {
        var raison = raisonAClasser(row, e.colNoms);
        if (raison) {
            e.aClasser.push({ texte: texteDeRangee(row), raison: raison });
            e.courant = null;
            if (raisonPied(row, e.colNoms)) e.partieRangee = '';   // point 10 : le pied clôt la partie (F6)
            return;
        }
        // Étape 5 : une case de critère sur plusieurs lignes — la 1re est le nom ; 5b (point 6) :
        // les suivantes à puce sont des sous-critères, les autres la description. La partie précède le nom.
        var lignesNom = L.lignes(row[e.colNoms].t), reste = selonPuces(lignesNom.slice(1));
        var prefixe = prefixeDePartie(e, estAPuce(lignesNom[0] || ''));
        var np = nomEtPonderation(sansPuce(lignesNom[0] || ''));
        // Les cases de niveau d'une bande ne vont nulle part : elles restent visibles à l'étape des rôles.
        var c = {
            nom: (prefixe ? prefixe + ' – ' : '') + np.nom, ponderation: null,
            sousCriteres: reste.sous, description: reste.description,
            cases: e.idxNiv.map(function (k) { return role === 'critere' ? row[k].t : ''; }),
            // Point 7 : un nom d'une seule ligne, sans ponctuation finale, peut se poursuivre en dessous.
            nomOuvert: role === 'critere' && lignesNom.length === 1
        };
        // Point 5 : les points d'une bande à réglette.
        var reglette = role === 'nomCritere' ? pointsReglette(row, e.K) : null;
        if (reglette !== null) { c.ponderation = paire(String(reglette), 'repris'); c.pointsNiveaux = true; }
        completer(e, c, row);
        if (!c.ponderation && np.pond !== null) { c.ponderation = paire(np.pond, 'repris'); c.pondDuNom = true; }
        e.criteres.push(c);
        e.courant = c;
    }

    /** Dans une « Suite du critère », la case de la colonne des noms, selon le choix de la personne. */
    function ajouterSelonSuite(c, lignesT, suiteNom) {
        var t = lignesT.join('\n');
        if (suiteNom === 'selonPuces') {
            var r = selonPuces(lignesT);
            c.sousCriteres = c.sousCriteres.concat(r.sous);
            c.description = joindre(c.description, r.description);
        } else if (suiteNom === 'sousCriteres') c.sousCriteres = c.sousCriteres.concat(lignesSansPuces(t));
        else if (suiteNom === 'description') c.description = joindre(c.description, lignesSansPuces(t).join('\n'));
    }

    function lireSuite(e, row, i) {
        var c = e.courant;
        if (!c) { e.orphelines.push(i + 1); return; }
        e.idxNiv.forEach(function (k, q) { c.cases[q] = joindre(c.cases[q], row[k].t); });
        var lignesT = L.lignes(row[e.colNoms].t);
        if (c.nomOuvert && nomCoupe(L.lignes(c.nom), lignesT)) {
            c.nom += ' ' + lignesT[0];   // point 7 : « Mise en » / « contexte »
            lignesT = [];
        }
        c.nomOuvert = false;
        ajouterSelonSuite(c, lignesT, e.suiteNom);
        completer(e, c, row);
    }

    /** Après le parcours : les pondérations tirées des noms (point 11), les points des niveaux (point 4). */
    function finirCriteres(criteres, idxNiv) {
        // Point 11 : des pondérations décimales tirées des noms, qui totalisent 1, sont des parts de 100.
        if (criteres.length && criteres.every(function (c) { return c.pondDuNom; })) {
            var somme = criteres.reduce(function (t, c) { return t + parseFloat(c.ponderation.valeur); }, 0);
            if (Math.abs(somme - 1) < 0.011) criteres.forEach(function (c) { c.ponderation = paire(String(Math.round(parseFloat(c.ponderation.valeur) * 100)), 'repris'); });
        }
        // Point 4 : les points écrits dans les cases de niveau donnent le maximum du critère.
        criteres.forEach(function (c) {
            var p = !c.ponderation && idxNiv.length ? L.pointsDesNiveaux(c.cases) : null;
            if (p !== null) { c.ponderation = paire(nombreTexte(String(p)), 'repris'); c.pointsNiveaux = true; }
        });
    }

    /**
     * La grille orientée et ses rôles → le modèle (fonction pure). Ce qui ne trouve pas sa
     * place va dans `aClasser` avec sa raison ; ce qui empêche de construire va dans
     * `manquesLecture` (affiché dans « Avant de créer, il reste »).
     *
     * @param {{rangees: Array, avant: string[], apres: string[]}} lu - la lecture orientée
     * @param {{rangees: string[], colonnes: string[], suiteNom: string}} roles
     */
    L.modeleDepuisRoles = function (lu, roles) {
        var g = lu.rangees, e = etatDeLecture(g, roles), aClasser = e.aClasser, manques = [];
        var nom = '';
        (lu.avant || []).forEach(function (t, i) {
            if (i === 0 && t.length <= L.LONGUEUR_NOM_MAX) nom = t;
            else aClasser.push({ texte: t, raison: 'Texte avant le tableau' });
        });
        var colNoms = e.colNoms, idxNiv = e.idxNiv, criteres = e.criteres, orphelines = e.orphelines;
        // Textes PROVISOIRES (Claude Code, 17 oct.), relus en 3b.
        if (colNoms < 0) manques.push('une colonne « Noms des critères », à l’étape « Ce que contient ton tableau »');

        var niveaux = niveauxDepuisRoles(g, roles, idxNiv);
        if (colNoms >= 0) g.forEach(function (row, i) {
            var role = e.R[i];
            suivrePartie(e, row, role);
            if (role === 'critere' || role === 'nomCritere') lireCritere(e, row, role);
            else if (role === 'suite') lireSuite(e, row, i);
        });
        finirCriteres(criteres, idxNiv);
        if (orphelines.length) {
            manques.push(orphelines.length === 1
                ? 'un critère au-dessus de la rangée ' + orphelines[0] + ' (« Suite du critère »), à l’étape « Ce que contient ton tableau »'
                : 'un critère au-dessus des rangées ' + orphelines.join(', ') + ' (« Suite du critère »), à l’étape « Ce que contient ton tableau »');
        }
        (lu.apres || []).forEach(function (t) { aClasser.push({ texte: t, raison: 'Texte après le tableau' }); });
        // Étape 5 : sans colonne de niveau, la grille est EN POINTS — ce n'est plus un manque.
        // Il ne manque quelque chose que s'il n'y a ni niveau ni points (`materielAssistant.calculs`).
        // Étape 5b (point 4, Q1) : avec des niveaux, aussi quand CHAQUE critère tire ses points de ses
        // cases de niveau ou de sa réglette ; les niveaux ne gardent alors que leur nom (#941 : une
        // grille entièrement analytique se note sans échelle). Une grille mixte reste à niveaux (16, inscrit).
        var enPoints = colNoms >= 0 && (!idxNiv.length || (criteres.length > 0 && criteres.every(function (c) { return c.pointsNiveaux; })));

        var modeles = criteres.map(function (c) {
            return {
                nom: paire(c.nom, 'repris'),
                ponderation: c.ponderation || paire('', 'remplir'),
                cases: c.cases.map(function (t) { return paire(t, t ? 'repris' : 'vide'); }),
                sousCriteres: c.sousCriteres,
                description: paire(c.description, c.description ? 'repris' : 'vide')
            };
        });
        // Des points ne se complètent pas : des parts égales inventeraient le maximum d'un critère.
        if (!enPoints && modeles.length && modeles.every(function (c) { return !c.ponderation.valeur; })) L.partsEgales(modeles);

        return {
            tableau: g,
            roles: roles,
            enPoints: enPoints,
            fusionnees: g.some(function (row) { return row.some(function (c) { return c.fusion; }); }),
            manquesLecture: manques,
            nom: paire(nom, nom ? 'repris' : 'remplir'),
            nature: L.proposerNature(modeles),
            niveaux: niveaux,
            criteres: modeles,
            aClasser: aClasser.map(function (a, n) { return Object.assign({ id: n, statut: 'attente' }, a); })
        };
    };

    /** La lecture BRUTE (non orientée) → le modèle, dans un sens, avec des rôles (proposés si absents). */
    function construire(lu, source, enColonnes, roles) {
        var o = L.orienter(lu, enColonnes);
        var m = L.modeleDepuisRoles(o, roles || L.proposerRoles(o));
        return Object.assign({
            source: source,
            lecture: { rangees: lu.rangees, avant: lu.avant || [], apres: lu.apres || [] },
            critEnColonnes: !!enColonnes
        }, m);
    }

    /**
     * Rangées lues → modèle, critères en lignes, rôles proposés par l'application.
     * @param {{rangees: Array, avant: string[], apres: string[]}} lu
     * @param {'colle'|'exemple'|'main'} source
     */
    L.interpreter = function (lu, source) { return construire(lu, source, false, null); };

    /** Ce qui survit à une relecture : le nom (repris d'au-dessus du tableau), la nature si elle a été choisie. */
    function garder(nouveau, modele) {
        nouveau.nom = modele.nom;
        if (modele.nature && modele.nature.etat !== 'propose') nouveau.nature = modele.nature;
        return nouveau;
    }

    /**
     * Le sens du tableau, choisi par la personne (cadrage, idée de Grégoire du 15 oct.) : la
     * lecture est réorientée et RELUE, les rôles remis à la proposition de l'application. Une
     * grille aux niveaux en lignes a ses plages dans la 1re colonne et sa pondération dans une
     * ligne ; relues dans le bon sens, elles sont reprises. Deux inversions rendent la lecture
     * d'origine.
     */
    L.inverser = function (modele) {
        return garder(construire(modele.lecture, modele.source, !modele.critEnColonnes, null), modele);
    };

    /** Lot 3a : un rôle changé RELIT tout depuis le document (même règle qu'une inversion). */
    L.relire = function (modele, roles) {
        return garder(construire(modele.lecture, modele.source, modele.critEnColonnes, roles), modele);
    };

    // ------------------------------------------------------------------
    // 5. CHARGER : de ce qu'on a collé à un modèle, ou à un message clair
    // ------------------------------------------------------------------

    L.MESSAGE_SANS_TABLEAU = 'L’application n’a pas trouvé de tableau dans ce que tu as collé. Si ta grille vient d’un PDF, ce serait la cause : un PDF ne transmet que du texte, sans ses cases. Tu pourrais la copier depuis son fichier d’origine (Word, Pages ou un autre traitement de texte), en sélectionnant le tableau entier, ou la taper à la main.';   // validé par Grégoire, 17 oct., 8 h 53
    L.MESSAGE_INCOMPLET = 'Le tableau collé semble incomplet : il faut au moins un critère et deux niveaux. Tu pourrais vérifier ta sélection dans le document, ou taper ta grille à la main.';

    /**
     * @returns {{modele: Object}|{erreur: string}} — jamais d'échec muet.
     */
    L.charger = function (lu, source) {
        if (!lu) return { erreur: L.MESSAGE_SANS_TABLEAU };
        var m = L.interpreter(lu, source);
        // Une grille en points (étape 5) n'a aucun niveau : elle n'en demande pas deux.
        if ((!m.enPoints && m.niveaux.length < 2) || m.criteres.length < 1) return { erreur: L.MESSAGE_INCOMPLET };
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
                cases: niveaux.map(function () { return paire('', 'vide'); }),
                sousCriteres: [], description: paire('', 'vide')
            };
        });
        return {
            source: 'main', lecture: null, critEnColonnes: false, tableau: null, roles: null, enPoints: false,
            fusionnees: false, manquesLecture: [],
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
    // 6. PLAGES : des entiers saisis aux plages contiguës enregistrées
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
