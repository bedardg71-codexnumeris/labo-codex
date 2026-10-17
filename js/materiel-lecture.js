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
        { id: 'ignorer', libelle: 'À ignorer' }
    ];
    L.ROLES_COLONNES = [
        { id: 'noms', libelle: 'Noms des critères' },
        { id: 'pond', libelle: 'Pondération' },
        { id: 'niveau', libelle: 'Un niveau' },
        { id: 'sousCriteres', libelle: 'Sous-critères' },
        { id: 'description', libelle: 'Description du critère' },
        { id: 'ignorer', libelle: 'À ignorer' }
    ];
    /** Dans une « Suite du critère », ce que devient la case de la colonne « Noms des critères ». */
    L.CHOIX_SUITE = [
        { id: 'sousCriteres', libelle: 'des sous-critères, un par ligne' },
        { id: 'description', libelle: 'la description du critère' },
        { id: 'rien', libelle: 'rien à garder' }
    ];
    /**
     * Un seul de ces rôles par tableau : en choisir un autre fait passer le précédent à
     * « À ignorer ». ⚠ « Noms des critères » et « Pondération » aussi (supposition de Claude
     * Code, 17 oct. : la consigne ne lit que la première ; une seconde ne servirait à rien).
     */
    var UNIQUES = { rangees: ['niveaux', 'codes', 'plages'], colonnes: ['noms', 'pond'] };

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
        var fin = 0;
        for (var i = 1; i < g.length; i++) {
            var nomCase = g[i][0];
            if (!nomCase || nomCase.t) break;
            var sousLaPremiere = nomCase.suite === 'v' && g[0][0] && g[0][0].fusion;
            var courtes = casesDe(g[i], colonnes, 'niveau').every(function (c) {
                return !c.t || (c.t.indexOf('\n') < 0 && c.t.length <= L.LONGUEUR_ENTETE_MAX);
            });
            if (!natureEntete(g[i], colonnes) || !(sousLaPremiere || courtes)) break;
            fin = i;
        }
        return fin;
    }

    function estBande(row, colonnes) {
        var cs = casesDe(row, colonnes, 'niveau');
        return !!(row[0] && propre(row[0].t)) && cs.length > 0 && cs.every(function (c) { return estCode(propre(c.t)) && c.t.indexOf('\n') < 0; });
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
        var fin = rangeesEntete(g, colonnes);
        var rangees = rolesEntete(g, colonnes, fin).concat(rolesCorps(g, colonnes, fin));
        return { rangees: rangees, colonnes: colonnes, suiteNom: 'sousCriteres', propose: true };
    };

    /** La 1re colonne nomme les critères ; la 1re dont l'en-tête dit « pondération » la porte ; les autres sont des niveaux. */
    function proposerColonnes(g) {
        var nb = g.length ? g[0].length : 0, colonnes = [];
        for (var j = 0; j < nb; j++) colonnes.push(j === 0 ? 'noms' : 'niveau');
        var fin = rangeesEntete(g, colonnes);
        for (var k = 1; k < nb; k++) {
            var enteteK = g.slice(0, fin + 1).some(function (row) { return estEntetePonderation(propre(row[k].t)); });
            if (enteteK) { colonnes[k] = 'pond'; break; }
        }
        return colonnes;
    }

    /** En tête : la DERNIÈRE rangée de noms nomme les niveaux ; la 1re de codes, de plages les donne ; le reste est ignoré. */
    function rolesEntete(g, colonnes, fin) {
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

    /** Sous l'en-tête : bande + rangée de textes longs → nom et suite ; sous la case fusionnée d'un critère → suite ; sinon un critère. */
    function rolesCorps(g, colonnes, fin) {
        var roles = [];
        var role = function (i) { return i > fin ? roles[i - fin - 1] : ''; };
        for (var i = fin + 1; i < g.length; i++) {
            if (estBande(g[i], colonnes) && i + 1 < g.length && !estBande(g[i + 1], colonnes) && aDesTextesLongs(g[i + 1], colonnes)) {
                roles.push('nomCritere', 'suite');
                i++;
            } else if (g[i][0] && g[i][0].suite === 'v' && ['critere', 'nomCritere', 'suite'].indexOf(role(i - 1)) >= 0) {
                roles.push('suite');
            } else {
                roles.push('critere');
            }
        }
        return roles;
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

    /** En-tête d'une colonne de pondération : pondération, points, pts, total, /N, %. */
    function estEntetePonderation(h) {
        return /pond/i.test(h) || /^(points?|pts|total)\b/i.test(h) || /^\/\s*\d+$/.test(h) || /^%$/.test(h);
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

    /** Puces et cases à cocher en tête de ligne, retirées des sous-critères ET de la description
     *  du critère (relecture de Cowork du lot 3a, 17 oct.). */
    var RE_PUCE = /^[☐☑□■•*-]+\s*/;

    function lignesSansPuces(t) {
        return L.lignes(t).map(function (l) { return l.replace(RE_PUCE, '').trim(); }).filter(Boolean);
    }

    function joindre(a, b) { return a && b ? a + '\n' + b : (a || b); }

    /** Pourquoi une rangée « Un critère » ou « Nom d'un critère » va à « À classer » (règles du lot 1), ou ''. */
    function raisonAClasser(row, colNoms) {
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
    L.modeleDepuisRoles = function (lu, roles) {
        var g = lu.rangees, R = roles.rangees, K = roles.colonnes;
        var aClasser = [], manques = [];
        var nom = '';
        (lu.avant || []).forEach(function (t, i) {
            if (i === 0 && t.length <= L.LONGUEUR_NOM_MAX) nom = t;
            else aClasser.push({ texte: t, raison: 'Texte avant le tableau' });
        });

        var idxNiv = [], colsSous = [], colsDesc = [];
        K.forEach(function (r, j) {
            if (r === 'niveau') idxNiv.push(j);
            else if (r === 'sousCriteres') colsSous.push(j);
            else if (r === 'description') colsDesc.push(j);
        });
        var colNoms = K.indexOf('noms'), colPond = K.indexOf('pond');
        // Textes PROVISOIRES (Claude Code, 17 oct.), relus en 3b.
        if (!idxNiv.length) manques.push('au moins une colonne « Un niveau », à l’étape « Ce que contient ton tableau »');
        if (colNoms < 0) manques.push('une colonne « Noms des critères », à l’étape « Ce que contient ton tableau »');

        var niveaux = niveauxDepuisRoles(g, roles, idxNiv);
        var criteres = [], courant = null, orphelines = [];

        function completer(c, row) {
            colsSous.forEach(function (j) { c.sousCriteres = c.sousCriteres.concat(lignesSansPuces(row[j].t)); });
            colsDesc.forEach(function (j) { c.description = joindre(c.description, lignesSansPuces(row[j].t).join('\n')); });
            if (!c.ponderation) c.ponderation = ponderationDe(row, colPond);
        }

        g.forEach(function (row, i) {
            var role = R[i];
            if (colNoms < 0) return;
            if (role === 'critere' || role === 'nomCritere') {
                var raison = raisonAClasser(row, colNoms);
                if (raison) { aClasser.push({ texte: texteDeRangee(row), raison: raison }); courant = null; return; }
                // Les cases de niveau d'une bande ne vont nulle part : elles restent visibles à l'étape des rôles.
                var c = {
                    nom: propre(row[colNoms].t), ponderation: null, sousCriteres: [], description: '',
                    cases: idxNiv.map(function (k) { return role === 'critere' ? row[k].t : ''; })
                };
                completer(c, row);
                criteres.push(c);
                courant = c;
            } else if (role === 'suite') {
                if (!courant) { orphelines.push(i + 1); return; }
                idxNiv.forEach(function (k, q) { courant.cases[q] = joindre(courant.cases[q], row[k].t); });
                var t = row[colNoms].t;
                if (roles.suiteNom === 'sousCriteres') courant.sousCriteres = courant.sousCriteres.concat(lignesSansPuces(t));
                else if (roles.suiteNom === 'description') courant.description = joindre(courant.description, lignesSansPuces(t).join('\n'));
                completer(courant, row);
            }
        });
        if (orphelines.length) {
            manques.push(orphelines.length === 1
                ? 'un critère au-dessus de la rangée ' + orphelines[0] + ' (« Suite du critère »), à l’étape « Ce que contient ton tableau »'
                : 'un critère au-dessus des rangées ' + orphelines.join(', ') + ' (« Suite du critère »), à l’étape « Ce que contient ton tableau »');
        }
        (lu.apres || []).forEach(function (t) { aClasser.push({ texte: t, raison: 'Texte après le tableau' }); });

        var modeles = criteres.map(function (c) {
            return {
                nom: paire(c.nom, 'repris'),
                ponderation: c.ponderation || paire('', 'remplir'),
                cases: c.cases.map(function (t) { return paire(t, t ? 'repris' : 'vide'); }),
                sousCriteres: c.sousCriteres,
                description: paire(c.description, c.description ? 'repris' : 'vide')
            };
        });
        if (modeles.length && modeles.every(function (c) { return !c.ponderation.valeur; })) L.partsEgales(modeles);

        return {
            tableau: g,
            roles: roles,
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
                cases: niveaux.map(function () { return paire('', 'vide'); }),
                sousCriteres: [], description: paire('', 'vide')
            };
        });
        return {
            source: 'main', lecture: null, critEnColonnes: false, tableau: null, roles: null,
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
