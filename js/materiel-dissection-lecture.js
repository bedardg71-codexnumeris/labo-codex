/**
 * materiel-dissection-lecture.js — « Apporter mon matériel », la dissection, lot 1 : LIRE une
 * grille collée en MORCEAUX, puis COMPRENDRE les étiquettes que l'enseignant y a posées.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md` ;
 * plan : `plans de travail/PLAN-2026-10-18-la-dissection-pour-lundi.md`.
 * Référence de comportement : l'ébauche `PROTOTYPE-2026-10-18-dissection.html` (hors git) ; ses
 * fonctions `comprendre` et `lireCollage` sont portées ici, même comportement.
 *
 * Module de FONCTIONS PURES : ni DOM de l'application, ni stockage. Le collage passe par les
 * lecteurs de `materiel-lecture.js` (`lirePressePapiers` : le HTML de Word ou de Pages lu par
 * un `DOMParser` inerte, ou le texte à tabulations) ; seul le texte brut d'un PDF, sans aucun
 * tableau, est lu ici, ligne par ligne. Le HTML collé n'est jamais inséré : seul son texte sort.
 *
 * Le document disséqué :
 *   { mode: 'table', rows: [[{ cs, rs, lines: [{ id, t }] }]] }  — un tableau, cases fusionnées
 *       comprises ; chaque ligne d'une case (paragraphe, puce, saut de ligne) est un morceau ;
 *   { mode: 'texte', lines: [{ id, t }] }                        — un texte brut, dans l'ordre.
 * Les étiquettes : `liens`, { idDuMorceau: clé d'un type de TYPES }.
 *
 * Règle de la lecture : un morceau étiqueté qui ne trouve pas sa place finit dans `sansPlace`,
 * avec sa raison — jamais en erreur, jamais en silence.
 *
 * Lot 2a (`CONSIGNE-LOT-2026-10-18-dissection-2a-creer-en-points.md`) : la grille comprise devient
 * le modèle EN POINTS de `materielAssistant.construire` (`modele`, `creation`) ; l'écriture reste
 * celle de `materielCreation.creer`.
 * Lot 2b (`CONSIGNE-LOT-2026-10-18-dissection-2b-creer-en-niveaux.md`) : une grille seulement en
 * niveaux, ou une grille « les deux » que l'enseignant choisit de compter par niveaux, devient le
 * modèle EN NIVEAUX (une échelle, puis la grille). La plage et la note retenue de chaque niveau sont
 * celles qu'il a SAISIES, rien de proposé (décision de Grégoire, 18 oct., 8 h 43).
 * Lot 5 (`CONSIGNE-LOT-2026-10-18-dissection-5-couper.md`) : `couper` un morceau en deux (jamais dans un
 * mot, rien de perdu), `recoller` ; des pondérations sur chaque critère, sans niveaux, font une grille en
 * points ; les raisons d'un refus NOMMENT le critère ou le morceau en cause, sans renvoi à l'assistant.
 * Lot 7 (`CONSIGNE-LOT-2026-10-18-dissection-7-rattacher.md`) : rattacher un morceau à celui dont il est
 * la suite. Lot 12 (`CONSIGNE-LOT-2026-10-19-dissection-12-rattacher-sans-ordre.md`) : l'ordre des touchers ne
 * compte plus ; `joindre` fait des groupes, lus dans l'ordre du document (`morceauxLus`). Rien n'est déplacé.
 * Lot 11 (`CONSIGNE-LOT-2026-10-19-dissection-11-enregistrement.md`) : le brouillon de la dissection en
 * cours (`brouillon`, `lireBrouillon`) ; ce module ne l'écrit pas, `materiel-dissection.js` le fait.
 */
(function () {
    'use strict';

    var D = {};

    /**
     * Les étiquettes de la palette. Celles du noyau (critère, élément observable, descripteur,
     * points, niveau) ont été tranchées par Grégoire le 18 oct. 2026 ; les autres textes sont
     * ceux de l'ébauche, validé G. 18 oct.
     */
    D.TYPES = [
        { k: 'titre', nom: 'Titre', aide: 'Le nom de ta grille', groupe: 'La grille' },
        { k: 'description', nom: 'Description', aide: 'Une phrase qui présente la grille ou un critère', groupe: 'La grille' },
        { k: 'section', nom: 'Section', aide: 'Un regroupement de critères', groupe: 'La grille' },
        { k: 'total', nom: 'Total', aide: 'La ligne du total', groupe: 'La grille' },
        { k: 'critere', nom: 'Critère', aide: 'Ce que tu évalues', precision: 'Ce qui est attendu : la question que tu te poses devant la copie', groupe: 'Les critères' },
        { k: 'souscritere', nom: 'Élément observable', aide: 'Un sous-critère', precision: 'Ce que tu regardes dans toutes les copies pour juger du critère', groupe: 'Les critères' },
        { k: 'ponderation', nom: 'Pondération', aide: 'Le poids d’un critère', groupe: 'Les critères' },
        { k: 'descripteur', nom: 'Descripteur', aide: 'Ce que tu vois dans une copie, à un niveau donné', precision: 'Une réponse possible à la question du critère (une seule vaut pour une copie)', groupe: 'Les réponses' },
        { k: 'points', nom: 'Points', aide: 'Les points d’une réponse', precision: 'Ce qu’elle vaut, en chiffres', groupe: 'Les réponses' },
        { k: 'niveau', nom: 'Niveau', aide: 'Le nom d’un niveau de réussite', precision: 'Un stade de qualité du travail observé (par ex. « Sommaire », « Efficace »)', groupe: 'Les réponses' },
        { k: 'suite', nom: 'Suite', aide: 'La fin d’un morceau coupé en deux par la mise en page', groupe: 'Le reste' },
        { k: 'ignorer', nom: 'À ignorer', aide: 'Un symbole, une décoration', groupe: 'Le reste' }
    ];
    var TYPE = {};
    D.TYPES.forEach(function (t) { TYPE[t.k] = t; });
    D.TYPE = TYPE;

    function propre(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    /** Un fabricant d'identifiants de morceaux, propre à chaque document. */
    function fabrique() {
        var n = 0;
        return function (t) { n += 1; return { id: 'm' + n, t: t }; };
    }

    // ------------------------------------------------------------------
    // 1. LIRE : du presse-papiers au document disséqué
    // ------------------------------------------------------------------

    /** Éléments dont le texte n'est jamais du contenu (même liste que materiel-lecture.js). */
    var ELEMENTS_IGNORES = 'script, style, template, noscript, head, title, meta, link, object, embed, iframe';
    var BLOC = /^(P|DIV|LI|H[1-6]|UL|OL|TABLE|TR|BLOCKQUOTE|PRE)$/;

    /** Les lignes d'un HTML collé sans tableau (porté de `lignesDeCellule`, l'ébauche). */
    function lignesDuHtml(html) {
        if (!html || typeof DOMParser !== 'function') return [];
        var doc;
        try { doc = new DOMParser().parseFromString(String(html), 'text/html'); } catch (e) { return []; }
        if (!doc || !doc.body) return [];
        Array.prototype.forEach.call(doc.querySelectorAll(ELEMENTS_IGNORES), function (n) {
            if (n.parentNode) n.parentNode.removeChild(n);
        });
        var out = [], cur = '';
        function pousser() { var t = propre(cur); if (t) out.push(t); cur = ''; }
        (function marcher(n) {
            for (var ch = n.firstChild; ch; ch = ch.nextSibling) {
                if (ch.nodeType === 3) cur += ch.nodeValue;
                else if (ch.nodeType === 1) {
                    var tag = ch.tagName.toUpperCase();
                    if (tag === 'BR') { pousser(); continue; }
                    var b = BLOC.test(tag);
                    if (b) pousser();
                    marcher(ch);
                    if (b) pousser();
                }
            }
        })(doc.body);
        pousser();
        return out;
    }

    /**
     * Les rangées lues par `materielLecture` ({ rangees, avant, apres }) → un document 'table'.
     * Le texte avant et après le tableau (un titre, une note) devient une rangée d'une case sur
     * toute la largeur : il reste à l'écran, étiquetable comme le reste.
     */
    function docDuTableau(lu) {
        var nouveau = fabrique();
        var nb = lu.rangees.length;
        var largeur = lu.rangees.reduce(function (m, row) {
            return Math.max(m, row.reduce(function (s, c) { return s + Math.max(1, c.span || 1); }, 0));
        }, 1);
        function rangeeHors(t) { return [{ cs: largeur, rs: 1, lines: [nouveau(t)] }]; }
        var rows = (lu.avant || []).map(rangeeHors);
        lu.rangees.forEach(function (row, r) {
            rows.push(row.map(function (cell) {
                return {
                    cs: Math.max(1, cell.span || 1),
                    rs: Math.max(1, Math.min(cell.rspan || 1, nb - r)),
                    lines: String(cell.t || '').split('\n').map(propre).filter(Boolean).map(nouveau)
                };
            }));
        });
        (lu.apres || []).forEach(function (t) { rows.push(rangeeHors(t)); });
        return { mode: 'table', rows: rows };
    }

    function docDuTexte(lignes) {
        var nouveau = fabrique();
        var ls = lignes.map(propre).filter(Boolean);
        return ls.length ? { mode: 'texte', lines: ls.map(nouveau) } : null;
    }

    /**
     * Le presse-papiers → le document disséqué, ou null s'il n'y a rien de lisible.
     * Un tableau (HTML, ou texte à tabulations) d'abord, par `materielLecture.lirePressePapiers` ;
     * sinon le texte brut, ligne par ligne (un PDF copié arrive ainsi).
     *
     * @param {{html?: string, texte?: string}} pp
     */
    D.docDepuisPressePapiers = function (pp) {
        var p = pp || {};
        var lu = window.materielLecture.lirePressePapiers({ html: p.html || '', texte: p.texte || '' });
        if (lu) return docDuTableau(lu);
        var txt = String(p.texte || '');
        if (!propre(txt) && p.html) return docDuTexte(lignesDuHtml(p.html));
        return docDuTexte(txt.split(/\r\n|\r|\n/));
    };

    /**
     * Chaque morceau, dans l'ordre de lecture, avec son texte et sa place : rangée, colonne et
     * fusions de sa case, rang dans la case (k). Dans un texte brut, la place est le seul rang.
     */
    D.morceaux = function (doc) {
        var ordre = [], texte = {}, pos = {};
        if (!doc) return { ordre: ordre, texte: texte, pos: pos };
        if (doc.mode === 'table') {
            var occ = {};
            doc.rows.forEach(function (row, r) {
                var c = 0;
                row.forEach(function (cell) {
                    while (occ[r + ',' + c]) c += 1;
                    var cs = cell.cs || 1, rs = cell.rs || 1;
                    for (var i = 0; i < rs; i++) for (var j = 0; j < cs; j++) occ[(r + i) + ',' + (c + j)] = 1;
                    cell.lines.forEach(function (L, k) {
                        ordre.push(L.id); texte[L.id] = L.t;
                        pos[L.id] = { r: r, c: c, cs: cs, rs: rs, k: k };
                    });
                    c += cs;
                });
            });
        } else {
            doc.lines.forEach(function (L, i) { ordre.push(L.id); texte[L.id] = L.t; pos[L.id] = { k: i }; });
        }
        return { ordre: ordre, texte: texte, pos: pos };
    };

    // ------------------------------------------------------------------
    // 1 bis. COUPER (lot 5) : un morceau devient deux, à la même place
    // ------------------------------------------------------------------

    /**
     * Lot 5 (`CONSIGNE-LOT-2026-10-18-dissection-5-couper.md`) : les outils de la palette qui ne sont
     * pas des étiquettes. Ils ne surlignent rien et ne comptent rien. Nom et aide : validé G. 18 oct. 13 h 48.
     */
    D.OUTILS = [
        { k: 'couper', nom: 'Couper', aide: 'Sépare un morceau en deux, là où tu touches', groupe: 'Le reste', apres: 'suite' },
        // Lot 7 : nom et aide validés par Grégoire (18 oct., 16 h 44).
        { k: 'rattacher', nom: 'Rattacher', aide: 'Joint un morceau à celui dont il est la suite', groupe: 'Le reste', apres: 'couper' }
    ];
    var OUTIL = {};
    D.OUTILS.forEach(function (o) { OUTIL[o.k] = o; });
    D.OUTIL = OUTIL;

    /** L'espace la plus proche d'un point du texte (un rang entre deux caractères), ou -1 s'il n'y en a pas. */
    function espaceProche(t, decalage) {
        var meilleure = -1, ecart = Infinity;
        for (var i = 0; i < t.length; i++) {
            if (!/\s/.test(t.charAt(i))) continue;
            // L'espace i sépare les rangs i et i + 1 : y toucher, c'est un écart nul.
            var e = decalage < i ? i - decalage : (decalage > i + 1 ? decalage - (i + 1) : 0);
            if (e < ecart) { ecart = e; meilleure = i; }
        }
        return meilleure;
    }

    /** Le plus grand numéro d'identifiant du document : les parties d'une coupe prennent les suivants. */
    function dernierNumero(doc) {
        return D.morceaux(doc).ordre.reduce(function (m, id) {
            var n = /^m(\d+)$/.exec(id);
            return n ? Math.max(m, parseInt(n[1], 10)) : m;
        }, 0);
    }

    /**
     * Coupe le morceau `id` en deux, à l'espace la plus proche du rang `decalage` (0 à la longueur
     * de son texte) : jamais dans un mot. Les deux parties, sans leurs espaces de bord, prennent sa
     * place, l'une après l'autre (dans la même case d'un tableau), avec des identifiants neufs ; mises
     * bout à bout avec une espace, elles redonnent son texte. L'application ne coupe jamais d'elle-même.
     *
     * @returns {{doc: object, parties: string[]}|null} - le NOUVEAU document (l'ancien est intact) et
     *   les identifiants des deux parties ; null si le morceau n'existe pas ou n'a qu'un mot.
     */
    D.couper = function (doc, id, decalage) {
        if (!doc) return null;
        var n = dernierNumero(doc), parties = null;
        function trancher(lines) {
            var out = [];
            lines.forEach(function (L) {
                if (L.id !== id) { out.push(L); return; }
                var t = String(L.t);
                var i = espaceProche(t, Math.max(0, Math.min(t.length, Math.round(Number(decalage) || 0))));
                var a = i < 0 ? '' : t.slice(0, i).trim(), b = i < 0 ? '' : t.slice(i + 1).trim();
                if (!a || !b) { out.push(L); return; }
                parties = ['m' + (n + 1), 'm' + (n + 2)];
                out.push({ id: parties[0], t: a }, { id: parties[1], t: b });
            });
            return out;
        }
        var nouveau = doc.mode === 'table'
            ? { mode: 'table', rows: doc.rows.map(function (row) {
                return row.map(function (cell) { return { cs: cell.cs, rs: cell.rs, lines: trancher(cell.lines) }; });
            }) }
            : { mode: 'texte', lines: trancher(doc.lines) };
        return parties ? { doc: nouveau, parties: parties } : null;
    };

    /** Les étiquettes après une coupe : la première partie garde celle du morceau coupé, la seconde n'en a pas. */
    D.liensApresCoupe = function (liens, id, parties) {
        var l = Object.assign({}, liens);
        if (l[id]) l[parties[0]] = l[id];
        delete l[id];
        return l;
    };

    /**
     * Annuler une coupe : `coupe` = { doc (le document d'avant), id, type (l'étiquette d'origine, ou
     * null), parties }. Rend ce document tel quel (les deux parties recollées exactement) et les
     * étiquettes, sans celles des parties, avec celle d'origine rendue au morceau. Les coupes
     * s'annulent de la dernière à la première : le document d'avant est alors celui de la page.
     */
    D.recoller = function (liens, coupe) {
        var l = Object.assign({}, liens);
        coupe.parties.forEach(function (p) { delete l[p]; });
        if (coupe.type) l[coupe.id] = coupe.type;
        return { doc: coupe.doc, liens: l };
    };

    // ------------------------------------------------------------------
    // 1 ter. RATTACHER (lot 7) : un morceau lu comme la suite d'un autre
    // ------------------------------------------------------------------

    /*
     * Lot 7 (`CONSIGNE-LOT-2026-10-18-dissection-7-rattacher.md`), revu au lot 12
     * (`CONSIGNE-LOT-2026-10-19-dissection-12-rattacher-sans-ordre.md`) : les rattachements font des GROUPES,
     * { idMembre: idTete }, un seul niveau. La TÊTE est le premier membre dans l'ordre de lecture du document,
     * jamais l'ordre des touchers : elle porte l'étiquette et la place du groupe. Le document n'est jamais
     * touché : chaque morceau garde son texte et sa place, et le détacher le rend tel quel. L'application ne
     * crée jamais de lien d'elle-même.
     */

    /** Le rang de chaque morceau dans l'ordre de lecture. */
    function rangs(doc) {
        var rang = {};
        D.morceaux(doc).ordre.forEach(function (id, i) { rang[id] = i; });
        return rang;
    }

    /** La tête du groupe d'un morceau (lui-même s'il est seul ou tête). */
    function teteDe(rat, id) { return rat[id] != null ? rat[id] : id; }

    /** Les membres du groupe dont `tete` est la tête, elle comprise, dans l'ordre du document. */
    function membres(rat, tete, rang) {
        var m = [tete];
        Object.keys(rat).forEach(function (b) { if (rat[b] === tete && b !== tete) m.push(b); });
        return m.sort(function (x, y) { return rang[x] - rang[y]; });
    }

    /** Vrai si le morceau est dans un groupe (tête ou membre). */
    D.estRattache = function (rattachements, id) {
        var rat = rattachements || {};
        return rat[id] != null || Object.keys(rat).some(function (b) { return rat[b] === id; });
    };

    /** La tête du groupe d'un morceau, ou null s'il est seul. */
    D.teteDuGroupe = function (rattachements, id) {
        var rat = rattachements || {};
        return D.estRattache(rat, id) ? teteDe(rat, id) : null;
    };

    /**
     * Joint deux morceaux, dans l'ordre où ils sont touchés, sans que cet ordre compte : leurs groupes se
     * rejoignent, et la tête est le premier membre dans l'ordre du document. L'étiquette du groupe est celle
     * de la tête ; sans elle, celle du premier membre étiqueté, reportée sur la tête (`reportee`). Les
     * étiquettes des autres membres sont retirées (`retiree` : la première, pour la ligne d'état).
     *
     * @returns {{rattachements: object, liens: object, tete: string, retiree: string|null, reportee: string|null}|{rien: true}}
     *   les NOUVEAUX objets (les anciens sont intacts) ; `rien` si les deux sont déjà du même groupe (ou un seul).
     */
    D.joindre = function (doc, rattachements, liens, id1, id2) {
        var rat = rattachements || {}, rang = rangs(doc);
        if (!(id1 in rang) || !(id2 in rang)) return { rien: true };
        var t1 = teteDe(rat, id1), t2 = teteDe(rat, id2);
        if (t1 === t2) return { rien: true };
        var tous = membres(rat, t1, rang).concat(membres(rat, t2, rang)).sort(function (x, y) { return rang[x] - rang[y]; });
        var tete = tous[0];
        var r = Object.assign({}, rat), l = Object.assign({}, liens);
        tous.forEach(function (m) { if (m === tete) delete r[m]; else r[m] = tete; });
        // L'étiquette gardée : celle de la tête, sinon celle du premier membre étiqueté.
        var garde = TYPE[l[tete]] ? tete : (tous.filter(function (m) { return TYPE[l[m]]; })[0] || null);
        var reportee = null, retiree = null;
        if (garde && garde !== tete) { l[tete] = l[garde]; reportee = l[tete]; }
        tous.forEach(function (m) {
            if (m === tete) return;
            if (m !== garde && TYPE[l[m]] && !retiree) retiree = l[m];
            delete l[m];
        });
        return { rattachements: r, liens: l, tete: tete, retiree: retiree, reportee: reportee };
    };

    /**
     * Détache un morceau de son groupe : il redevient un morceau à part, son texte tel quel. Si c'est la
     * tête, le membre suivant (dans l'ordre du document) devient la tête et garde l'étiquette du groupe ; un
     * groupe d'un seul morceau cesse d'exister. Le morceau détaché repart sans étiquette s'il était la tête
     * (elle reste au groupe) ; un autre membre n'en avait déjà plus.
     *
     * @returns {{rattachements: object, liens: object}} les NOUVEAUX objets.
     */
    D.detacher = function (doc, rattachements, liens, id) {
        var rat = rattachements || {}, r = Object.assign({}, rat), l = Object.assign({}, liens);
        if (rat[id] != null) { delete r[id]; return { rattachements: r, liens: l }; }
        var reste = membres(rat, id, rangs(doc)).filter(function (m) { return m !== id; });
        if (!reste.length) return { rattachements: r, liens: l };
        var nouvelle = reste[0];
        reste.forEach(function (m) { if (m === nouvelle) delete r[m]; else r[m] = nouvelle; });
        if (l[id] != null) { l[nouvelle] = l[id]; delete l[id]; }
        return { rattachements: r, liens: l };
    };

    /** Après une coupe : la première partie prend la place du morceau coupé dans ses liens, comme son étiquette. */
    D.rattachementsApresCoupe = function (rattachements, id, parties) {
        var r = {};
        Object.keys(rattachements || {}).forEach(function (b) {
            var a = rattachements[b];
            r[b === id ? parties[0] : b] = a === id ? parties[0] : a;
        });
        return r;
    };

    /** Annuler une coupe défait d'abord les liens qui touchent ses deux parties (consigne du lot 7, point 6). */
    D.rattachementsSansParties = function (rattachements, parties) {
        var r = {};
        Object.keys(rattachements || {}).forEach(function (b) {
            if (parties.indexOf(b) < 0 && parties.indexOf(rattachements[b]) < 0) r[b] = rattachements[b];
        });
        return r;
    };

    /**
     * Les morceaux tels que la lecture les prend : chaque membre sort de l'ordre de lecture, et le texte de
     * la tête devient celui de tous les membres du groupe, DANS L'ORDRE DE LECTURE DU DOCUMENT (pas dans
     * celui des gestes), séparés par une espace (lot 12). Un lien dont un bout manque au document, ou dont
     * la tête est elle-même membre d'un autre groupe, est ignoré : son membre reste un morceau à part (rien
     * ne se perd). Mêmes champs que `morceaux`, plus `suites` { idTete: [idMembre…] }.
     */
    D.morceauxLus = function (doc, rattachements) {
        var M = D.morceaux(doc), rat = rattachements || {};
        var rang = {};
        M.ordre.forEach(function (id, i) { rang[id] = i; });
        var valide = {};
        Object.keys(rat).forEach(function (b) {
            var a = rat[b];
            if (b !== a && b in rang && a in rang && !(a in rat && rat[a] in rang)) valide[b] = a;
        });
        var suites = {};
        M.ordre.forEach(function (id) { if (valide[id]) (suites[valide[id]] = suites[valide[id]] || []).push(id); });
        var texte = Object.assign({}, M.texte);
        Object.keys(suites).forEach(function (a) {
            var tout = [a].concat(suites[a]).sort(function (x, y) { return rang[x] - rang[y]; });
            texte[a] = tout.map(function (b) { return M.texte[b]; }).join(' ');
        });
        return { ordre: M.ordre.filter(function (id) { return !valide[id]; }), texte: texte, pos: M.pos, suites: suites };
    };

    // ------------------------------------------------------------------
    // 1 quater. LE BROUILLON (lot 11) : la dissection en cours, telle qu'enregistrée
    // ------------------------------------------------------------------

    /*
     * Lot 11 (`CONSIGNE-LOT-2026-10-19-dissection-11-enregistrement.md`) : la dissection en cours
     * s'enregistre à chaque geste, et se reprend telle quelle. Le brouillon porte le document DÉJÀ
     * DISSÉQUÉ (jamais le HTML collé), les étiquettes, les coupes (chacune avec le document d'avant,
     * pour « Annuler la dernière coupe »), les rattachements et la saisie. Rien de l'état d'écran
     * (l'outil en main, le morceau choisi, l'erreur affichée).
     */
    D.FORMAT_BROUILLON = 'dissection-1';

    function copie(x) { return JSON.parse(JSON.stringify(x)); }
    function chaine(x) { return typeof x === 'string'; }
    function dictionnaire(o, valeurOk) {
        return !!o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).every(function (k) { return valeurOk(o[k]); });
    }
    function ligneOk(L) { return !!L && chaine(L.id) && chaine(L.t); }
    function fusionOk(n) { return n === undefined || (Number.isInteger(n) && n >= 1); }
    function docOk(d) {
        if (!d || typeof d !== 'object') return false;
        if (d.mode === 'texte') return Array.isArray(d.lines) && d.lines.every(ligneOk);
        if (d.mode !== 'table' || !Array.isArray(d.rows)) return false;
        return d.rows.every(function (row) {
            return Array.isArray(row) && row.every(function (c) {
                return !!c && fusionOk(c.cs) && fusionOk(c.rs) && Array.isArray(c.lines) && c.lines.every(ligneOk);
            });
        });
    }
    function coupeOk(c) {
        return !!c && docOk(c.doc) && chaine(c.id) && (c.type === null || chaine(c.type))
            && Array.isArray(c.parties) && c.parties.length === 2 && c.parties.every(chaine);
    }

    /**
     * Le brouillon d'une dissection en cours : un NOUVEL objet, sans référence partagée avec `etat`.
     * @param {object} etat - { doc, liens, coupes, rattachements, nomSaisi, compte, valeurs }
     */
    D.brouillon = function (etat) {
        return copie({
            format: D.FORMAT_BROUILLON,
            doc: etat.doc,
            liens: etat.liens || {},
            coupes: etat.coupes || [],
            rattachements: etat.rattachements || {},
            nomSaisi: etat.nomSaisi == null ? null : etat.nomSaisi,
            compte: etat.compte === 'niveaux' ? 'niveaux' : 'points',
            valeurs: etat.valeurs || {}
        });
    };

    /**
     * Relit un brouillon enregistré. Rend une COPIE de ce qu'il porte, ou null s'il est illisible (format
     * inconnu, champ abîmé) : l'appelant laisse alors l'accueil s'ouvrir, sans effacer le brouillon.
     */
    D.lireBrouillon = function (b) {
        if (!b || typeof b !== 'object' || b.format !== D.FORMAT_BROUILLON) return null;
        if (!docOk(b.doc) || !dictionnaire(b.liens, chaine) || !dictionnaire(b.rattachements, chaine)) return null;
        if (!Array.isArray(b.coupes) || !b.coupes.every(coupeOk)) return null;
        if (!(b.nomSaisi === null || chaine(b.nomSaisi)) || (b.compte !== 'points' && b.compte !== 'niveaux')) return null;
        if (!dictionnaire(b.valeurs, function (v) { return dictionnaire(v, chaine); })) return null;
        return copie({ doc: b.doc, liens: b.liens, coupes: b.coupes, rattachements: b.rattachements, nomSaisi: b.nomSaisi, compte: b.compte, valeurs: b.valeurs });
    };

    // ------------------------------------------------------------------
    // 2. COMPRENDRE : des étiquettes à la grille que l'application en tire
    // ------------------------------------------------------------------

    function nombres(t) {
        var m = String(t).match(/\d+(?:[.,]\d+)?/g);
        return m ? m.map(function (x) { return parseFloat(x.replace(',', '.')); }) : [];
    }
    D.nombres = nombres;

    function intervalle(nn) { return [Math.min.apply(null, nn), Math.max.apply(null, nn)]; }

    // La lecture tient son état dans un contexte `x` : R (la grille comprise), table (bool), pos
    // (places des morceaux), nivIdx { colonne: rang du niveau }, avecNiveaux, section et enCours
    // (où l'on en est), parRangee { rangée: critère }, suite (ce qu'une « Suite » complète).

    function sansPlace(x, tx, t, raison) { x.R.sansPlace.push({ t: tx, type: t, raison: raison }); }

    /** Les niveaux nommés : par colonne dans un tableau, par ordre d'apparition dans un texte. */
    function lireNiveaux(x, ordre, texte, typeDe) {
        var colNiv = {};
        ordre.forEach(function (id) {
            if (typeDe(id) !== 'niveau') return;
            var nom = texte[id];
            if (x.table) { var p = x.pos[id]; for (var c = p.c; c < p.c + p.cs; c++) if (!(c in colNiv)) colNiv[c] = nom; }
            else if (x.R.niveaux.indexOf(nom) < 0) x.R.niveaux.push(nom);
        });
        if (x.table) Object.keys(colNiv).map(Number).sort(function (a, b) { return a - b; }).forEach(function (c, i) { x.nivIdx[c] = i; x.R.niveaux.push(colNiv[c]); });
        x.avecNiveaux = x.R.niveaux.length > 0;
    }

    function idxNiveau(x, p) { for (var c = p.c; c < p.c + p.cs; c++) if (c in x.nivIdx) return x.nivIdx[c]; return null; }

    function nouveauCritere(x, nom, auto) {
        var c = { nom: nom, auto: !!auto, section: x.section, desc: [], sous: [], pond: null, niv: {}, reponses: [], nDesc: 0, dernierNiv: null };
        x.R.criteres.push(c); x.enCours = c; return c;
    }

    /** Le critère d'un morceau : celui de sa rangée dans un tableau, sinon le dernier ouvert. */
    function cible(x, id) { if (x.table && x.parRangee[x.pos[id].r]) return x.parRangee[x.pos[id].r]; return x.enCours; }

    // `ecrits` : les points tels que l'enseignant les a écrits (« 3-4 », « 2 points ») ; `pts`, leurs nombres.
    function caseDe(cr, i) { if (!cr.niv[i]) cr.niv[i] = { desc: [], pts: [], ecrits: [] }; return cr.niv[i]; }

    /** Un texte rangé dans un tableau de textes ; une « Suite » le complètera. */
    function ranger(x, arr, tx) { arr.push(tx); var k = arr.length - 1; x.suite = function (s) { arr[k] += ' ' + s; }; }

    /** Les étiquettes qui n'ont pas besoin d'un critère. */
    var LIRE_CADRE = {
        titre: function (x, id, tx) { ranger(x, x.R.titre, tx); },
        section: function (x, id, tx) { var sec = { nom: tx }; x.section = sec; x.enCours = null; x.suite = function (s) { sec.nom += ' ' + s; }; },
        total: function (x, id, tx) { x.R.total = tx; var n = nombres(tx); x.R.totalNb = n.length ? n[n.length - 1] : null; },
        critere: function (x, id, tx) {
            var nc = nouveauCritere(x, tx, false);
            if (x.table) for (var i = 0; i < x.pos[id].rs; i++) x.parRangee[x.pos[id].r + i] = nc;
            x.suite = function (s) { nc.nom += ' ' + s; };
        },
        description: function (x, id, tx) {
            var cd = x.R.criteres.length ? cible(x, id) : null;
            ranger(x, cd ? cd.desc : x.R.description, tx);
        }
    };

    function lireDescripteur(x, cr, id, tx, t) {
        if (!x.avecNiveaux) {
            var rep = { desc: tx, pts: [], ecrits: [], r: x.table ? x.pos[id].r : null };
            cr.reponses.push(rep); x.suite = function (s) { rep.desc += ' ' + s; };
            return;
        }
        var ni;
        if (x.table) ni = idxNiveau(x, x.pos[id]); else { ni = cr.nDesc < x.R.niveaux.length ? cr.nDesc : null; cr.nDesc += 1; }
        if (ni == null) { sansPlace(x, tx, t, x.table ? 'aucun niveau nommé dans sa colonne' : 'plus de réponses que de niveaux'); return; }
        cr.dernierNiv = ni;
        ranger(x, caseDe(cr, ni).desc, tx);
    }

    /** La réponse à qui vont des points : celle de leur rangée, sinon la première encore sans points. */
    function reponsePourPoints(x, cr, id) {
        var q;
        if (x.table) for (q = cr.reponses.length - 1; q >= 0; q--) if (cr.reponses[q].r === x.pos[id].r) return cr.reponses[q];
        for (q = 0; q < cr.reponses.length; q++) if (!cr.reponses[q].pts.length) return cr.reponses[q];
        return null;
    }

    function lirePoints(x, cr, id, tx, t) {
        var nn = nombres(tx);
        if (!nn.length) { sansPlace(x, tx, t, 'aucun nombre'); return; }
        var dest = null;
        if (x.avecNiveaux) {
            var ip = x.table ? idxNiveau(x, x.pos[id]) : null;
            if (ip == null) ip = cr.dernierNiv;
            if (ip != null) dest = caseDe(cr, ip);
        } else dest = reponsePourPoints(x, cr, id);
        if (!dest) { sansPlace(x, tx, t, 'aucune réponse pour ces points'); return; }
        dest.pts.push(intervalle(nn));
        dest.ecrits.push(tx);
    }

    /** Les étiquettes qui se rangent sous un critère. */
    var LIRE_SOUS_CRITERE = {
        souscritere: function (x, cr, id, tx) { ranger(x, cr.sous, tx.replace(/^[·•\-–]\s*/, '')); },
        ponderation: function (x, cr, id, tx, t) {
            var np = nombres(tx);
            if (!np.length) { sansPlace(x, tx, t, 'aucun nombre'); return; }
            if (cr.auto && cr.reponses.length) { cr.reponses[cr.reponses.length - 1].pondApres = np[np.length - 1]; return; }
            // Lot 5 : une seconde Pondération (celle d'une ligne de total, après le dernier critère) ne
            // remplace plus en silence celle du critère. Texte validé G. 18 oct. 13 h 48.
            if (cr.pond != null) { sansPlace(x, tx, t, 'son critère a déjà une pondération (' + String(cr.pond).replace('.', ',') + ') ; une ligne de total prend l’étiquette « Total »'); return; }
            cr.pond = np[np.length - 1];
        },
        descripteur: lireDescripteur,
        points: lirePoints
    };

    /**
     * C1 du lot 5 (verdict du 18 oct., 13 h 36) : dans un tableau, une Pondération ne se range que sous
     * le critère de SA rangée (rangées fusionnées comprises) : celle d'une ligne de total ne devient plus
     * en silence le poids du critère d'au-dessus. Inchangés : le texte brut (l'ordre fait foi) et les
     * critères à nommer (`pondApres`, sans rangée à eux).
     */
    function ciblePonderation(x, id) {
        var cr = cible(x, id);
        if (!x.table || x.parRangee[x.pos[id].r] || (cr && cr.auto && cr.reponses.length)) return cr;
        return null;
    }

    /**
     * Lot 5 : la raison d'un morceau sans critère ; pour une Pondération, l'indice de la ligne de total.
     * « aucun critère avant lui ; une ligne de total… » : validé G. 18 oct. 13 h 48. « aucun critère dans sa
     * rangée ; une ligne de total prend l'étiquette « Total » » (texte de Cowork, verdict du lot 5, 13 h 36) :
     * validé G. 18 oct. 13 h 48 (le texte K13 de sa page, accepté tel quel).
     */
    function raisonSansCritere(x, t) {
        if (t !== 'ponderation') return 'aucun critère avant lui';
        return (x.table ? 'aucun critère dans sa rangée' : 'aucun critère avant lui') + ' ; une ligne de total prend l’étiquette « Total »';
    }

    function lireMorceau(x, id, t, tx) {
        if (t === 'ignorer' || t === 'niveau') return;
        if (t === 'suite') { if (x.suite) x.suite(tx); else sansPlace(x, tx, t, 'aucun morceau à compléter avant elle'); return; }
        // Lot 2a (trouvaille 1 du lot 1, tranchée par Cowork) : une « Suite » complète le dernier TEXTE
        // lu ; des points et une pondération sont des nombres, pas du texte à continuer.
        if (t !== 'points' && t !== 'ponderation') x.suite = null;
        if (LIRE_CADRE[t]) { LIRE_CADRE[t](x, id, tx); return; }
        var cr = t === 'ponderation' ? ciblePonderation(x, id) : cible(x, id);
        // Une réponse sans critère, quand aucun niveau n'est nommé : un critère « à nommer ».
        if (t === 'descripteur' && !cr && !x.avecNiveaux) cr = nouveauCritere(x, null, true);
        if (!cr) { sansPlace(x, tx, t, raisonSansCritere(x, t)); return; }
        LIRE_SOUS_CRITERE[t](x, cr, id, tx, t);
    }

    /** Des réponses sans critère nommé : un nouveau critère commence quand les points remontent (3, 2, 1, 0 puis 1, 0,5, 0). */
    function couperSansNom(criteres) {
        var final = [];
        criteres.forEach(function (c) {
            if (!c.auto) { final.push(c); return; }
            var groupe = null, prec = null;
            c.reponses.forEach(function (rep) {
                var mx = rep.pts.length ? Math.max.apply(null, rep.pts.map(function (p) { return p[1]; })) : null;
                if (!groupe || (mx != null && prec != null && mx >= prec)) {
                    groupe = { nom: null, auto: true, section: c.section, desc: [], sous: [], pond: null, niv: {}, reponses: [] };
                    final.push(groupe); prec = null;
                }
                groupe.reponses.push(rep);
                if (rep.pondApres != null) groupe.pond = rep.pondApres;
                if (mx != null) prec = mx;
            });
        });
        return final;
    }

    /** Le numéro d'un critère à nommer ; la pondération tirée des points, quand aucune n'est écrite. */
    function numeroterEtDeduire(R) {
        var na = 0;
        R.criteres.forEach(function (c) {
            if (c.auto) { na += 1; c.numero = na; }
            var mx = null;
            Object.keys(c.niv).forEach(function (k) { c.niv[k].pts.forEach(function (p) { mx = mx == null ? p[1] : Math.max(mx, p[1]); }); });
            c.reponses.forEach(function (r) { r.pts.forEach(function (p) { mx = mx == null ? p[1] : Math.max(mx, p[1]); }); });
            c.pondDeduite = c.pond == null ? mx : null;
        });
        R.aNommer = na;
    }

    /**
     * La grille comprise. Dans un tableau, c'est la PLACE d'un morceau qui dit à quel critère et
     * à quel niveau il appartient (la rangée d'un critère, la colonne d'un niveau) ; dans un
     * texte brut, c'est son ORDRE.
     *
     * Lot 7 : un morceau rattaché ne se lit pas à part ; son texte complète celui de la tête de son groupe
     * (`morceauxLus`, lot 12), et l'étiquette de la tête vaut pour le texte entier.
     *
     * @param {object} doc - le document disséqué
     * @param {Object<string, string>} liens - { idDuMorceau: type }
     * @param {Object<string, string>} [rattachements] - lot 7 : { idMembre: idTete } (lot 12)
     * @returns {object} R : titre, description, criteres, niveaux, total, totalNb, sansEtiquette,
     *   sansPlace [{ t, type, raison }], nb { type: compte }, aNommer, avecNiveaux, aPoints
     */
    D.comprendre = function (doc, liens, rattachements) {
        var M = D.morceauxLus(doc, rattachements);
        liens = liens || {};
        function typeDe(id) { var t = liens[id]; return TYPE[t] ? t : null; }
        var R = { titre: [], description: [], criteres: [], niveaux: [], total: null, totalNb: null, sansEtiquette: 0, sansPlace: [], nb: {} };
        var x = { R: R, table: !!doc && doc.mode === 'table', pos: M.pos, nivIdx: {}, avecNiveaux: false, section: null, enCours: null, parRangee: {}, suite: null };
        lireNiveaux(x, M.ordre, M.texte, typeDe);
        M.ordre.forEach(function (id) {
            var t = typeDe(id);
            if (!t) { R.sansEtiquette += 1; return; }
            R.nb[t] = (R.nb[t] || 0) + 1;
            lireMorceau(x, id, t, M.texte[id]);
        });
        R.criteres = couperSansNom(R.criteres);
        numeroterEtDeduire(R);
        R.avecNiveaux = x.avecNiveaux;
        // Lot 5 : sans niveaux, des pondérations suffisent à une grille en points : chaque critère est noté
        // sur sa pondération, telle qu'écrite (aucune conversion). Lot 9 : il suffit qu'UN critère en ait une ;
        // ceux qui n'en ont pas sont à compléter ensuite (`creation`, `aCompleter`).
        var pondsLues = !R.avecNiveaux && R.criteres.some(function (c) { return c.pond != null; });
        R.aPoints = (R.nb.points || 0) > 0 || pondsLues;
        return R;
    };

    /**
     * Le bilan d'une grille comprise : la somme des pondérations (lues, ou tirées des points),
     * le total visé, et la logique lue — 'deux' (niveaux nommés ET points), 'points', 'niveaux',
     * ou null. L'application dit laquelle elle lit ; elle ne convertit jamais l'une en l'autre.
     */
    D.bilan = function (R) {
        var somme = 0, aDesPoids = false;
        R.criteres.forEach(function (c) {
            var p = c.pond != null ? c.pond : c.pondDeduite;
            if (p != null) { somme += p; aDesPoids = true; }
        });
        var logique = R.avecNiveaux && R.aPoints ? 'deux' : (R.aPoints ? 'points' : (R.avecNiveaux ? 'niveaux' : null));
        return {
            somme: somme,
            aDesPoids: aDesPoids,
            jusqua: R.totalNb != null ? R.totalNb : (aDesPoids ? somme : null),
            totalOk: aDesPoids && R.totalNb != null ? Math.abs(somme - R.totalNb) < 1e-9 : null,
            logique: logique
        };
    };

    // ------------------------------------------------------------------
    // 3. CRÉER (lot 2a) : de la grille comprise au modèle de `materielAssistant.construire`
    // ------------------------------------------------------------------

    /** Au plus 20 réponses par critère : `parNiveau` n'en voyage pas plus (`maxCles`, `partage-schemas.js`). */
    D.MAX_REPONSES = 20;
    D.MAX_REPONSE = 5000;

    function paire(valeur, etatV) { return { valeur: valeur, etat: etatV }; }

    /** « Section – Critère », la section à la casse de la règle 8.16 ; un critère à nommer, « Critère N ». */
    function nomDuCritere(c) {
        var nom = c.nom != null ? c.nom : 'Critère ' + c.numero;
        return c.section ? window.materielLecture.casseDePartie(c.section.nom) + ' – ' + nom : nom;
    }

    /** Le texte d'un niveau : son ou ses descripteurs, puis, sur une ligne à part, ses points tels qu'écrits. */
    function texteDuNiveau(cell) {
        if (!cell) return '';
        var lignes = [];
        if (cell.desc.length) lignes.push(cell.desc.join(' '));
        if (cell.ecrits.length) lignes.push(cell.ecrits.join(' '));
        return lignes.join('\n');
    }

    /**
     * C1 (verdict du 18 oct.) : des points écrits en nombre seul prennent l'unité, au singulier sous 2
     * (« 0 point », « 0,5 point », « 2 points »). Une clé « 0 » ou « 1 » est un INDICE pour JavaScript
     * (et pour `JSON.parse`) : elle passerait avant les autres, et l'ordre de l'enseignant serait perdu
     * dans l'objet même. Les autres écritures (« 3-4 », « /2 », « 2 points ») restent telles quelles.
     */
    function avecUnite(ecrit) {
        if (!/^\d+(?:[.,]\d+)?$/.test(ecrit)) return ecrit;
        return ecrit + (parseFloat(ecrit.replace(',', '.')) < 2 ? ' point' : ' points');
    }

    /**
     * Sans niveaux, une clé par réponse : ses points tels qu'écrits, avec leur unité s'ils ne sont
     * qu'un nombre (C1) ; « Réponse N » sans points ; deux clés identiques se distinguent par « (2) ».
     * Clés de Claude Code, validé G. 18 oct.
     */
    function clesDesReponses(reponses) {
        var prises = {};
        return reponses.map(function (r, k) {
            var base = r.ecrits.length ? avecUnite(r.ecrits.join(' ')) : 'Réponse ' + (k + 1);
            var libre = base;
            for (var n = 2; prises[libre]; n++) libre = base + ' (' + n + ')';
            prises[libre] = true;
            return { cle: libre, texte: r.desc };
        });
    }

    /**
     * Lot 2b : la clé de chaque niveau lu, à laquelle se rattache ce que l'enseignant saisit pour lui :
     * son nom, et son rang parmi les niveaux du même nom (un nom ne contient jamais de saut de ligne).
     * Une saisie suit ainsi SON niveau quand un autre s'ajoute ou se retire avant lui.
     */
    D.clesNiveaux = function (R) {
        var vus = {};
        return R.niveaux.map(function (n) { vus[n] = (vus[n] || 0) + 1; return n + '\n' + vus[n]; });
    };

    /**
     * Lot 2b : la grille se crée-t-elle EN NIVEAUX ? Seulement en niveaux, oui ; « les deux », si
     * l'enseignant l'a choisi (des points par défaut, décision de Grégoire, 18 oct., 7 h 31).
     * @param {object} R - la grille comprise
     * @param {{compte?: string}} [saisie] - `compte` : 'points' (défaut) ou 'niveaux'
     */
    D.enNiveaux = function (R, saisie) {
        var logique = D.bilan(R).logique;
        return logique === 'niveaux' || (logique === 'deux' && !!saisie && saisie.compte === 'niveaux');
    };

    function saisi(v) { var s = String(v == null ? '' : v).trim(); return paire(s, window.materielAssistant.etatSaisi(s)); }

    /**
     * La grille comprise → le modèle que `materielAssistant.construire` sait écrire. Rien d'inventé.
     *
     * EN POINTS (lot 2a) : ni échelle, ni cartouche. Avec des niveaux nommés, chaque niveau garde son
     * nom (les plages restent vides : elles ne servent pas en points) ; sans niveaux, chaque critère
     * porte ses réponses en `parCle`.
     *
     * EN NIVEAUX (lot 2b, `enNiveaux`) : chaque niveau, son nom tel qu'étiqueté, un code tiré de son nom
     * (`materielLecture.coder`, corrigeable ensuite dans Échelles), puis la plage et la note retenue
     * SAISIES, telles quelles (vides si rien n'est saisi). Nature « descripteurs » : ni cartouche ni
     * rétroaction. La pondération : écrite, sinon tirée des points, sinon, si aucun critère n'en a, les
     * parts égales de `materielLecture.partsEgales` (la règle de la 1.203). Mesuré le 18 oct. : la note
     * d'une grille en niveaux rapporte les pondérations à leur somme (`calculerNote`,
     * `evaluation-calcul.js`) ; elles se reprennent donc telles quelles, sans conversion.
     *
     * @param {object} R - la grille comprise
     * @param {string} [nom] - C3 : le champ « Nom de ta grille », une fois modifié ; sinon le Titre étiqueté
     * @param {{compte?: string, valeurs?: Object<string, {min?: string, max?: string, note?: string}>}} [saisie]
     *   - lot 2b : le choix, et ce qui est saisi pour chaque niveau, par sa clé (`clesNiveaux`)
     */
    D.modele = function (R, nom, saisie) {
        var titre = nom != null ? String(nom).trim() : D.nomPropose(R);
        var desc = R.description.join('\n');
        var enNiveaux = D.enNiveaux(R, saisie);
        var valeurs = (saisie && saisie.valeurs) || {};
        var cles = D.clesNiveaux(R);
        var niveaux = !R.avecNiveaux ? [] : R.niveaux.map(function (n, i) {
            if (!enNiveaux) return { titre: paire(n, 'repris'), min: paire('', 'vide'), max: paire('', 'vide') };
            var v = valeurs[cles[i]] || {};
            return { titre: paire(n, 'repris'), min: saisi(v.min), max: saisi(v.max), note: saisi(v.note) };
        });
        var criteres = R.criteres.map(function (c) {
            var p = c.pond != null ? c.pond : c.pondDeduite;
            var d = c.desc.join('\n');
            var cr = {
                nom: paire(nomDuCritere(c), c.nom != null ? 'repris' : 'complete'),
                ponderation: p != null ? paire(String(p), 'repris') : paire('', 'remplir'),
                cases: R.avecNiveaux ? R.niveaux.map(function (n, i) { var t = texteDuNiveau(c.niv[i]); return paire(t, t ? 'repris' : 'vide'); }) : [],
                sousCriteres: c.sous.slice(),
                description: paire(d, d ? 'repris' : 'vide')
            };
            if (!R.avecNiveaux) cr.parCle = clesDesReponses(c.reponses);
            return cr;
        });
        if (enNiveaux && criteres.length && criteres.every(function (c) { return !c.ponderation.valeur; })) window.materielLecture.partsEgales(criteres);
        var m = {
            source: 'dissection', enPoints: !enNiveaux, lecture: null, tableau: null, roles: null,
            nom: paire(titre, titre ? 'repris' : 'remplir'),
            description: paire(desc, desc ? 'repris' : 'vide'),
            niveaux: enNiveaux ? window.materielLecture.coder(niveaux) : niveaux,
            criteres: criteres,
            aClasser: [], manquesLecture: []
        };
        if (enNiveaux) m.nature = paire('descripteurs', 'choisi');
        return m;
    };

    /** C3 : ce que le champ « Nom de ta grille » propose tant qu'on n'y a pas touché, le Titre étiqueté. */
    D.nomPropose = function (R) { return R.titre.join(' '); };

    function compte(n, un, plusieurs) { return n === 1 ? un : plusieurs.replace('#', n); }

    // ------------------------------------------------------------------
    // Lot 5 : des raisons qui NOMMENT ce qui bloque, et aucun renvoi à l'assistant débranché.
    // Textes de Claude Code (18 oct.), validé G. 18 oct. 13 h 48.
    // ------------------------------------------------------------------

    D.LONGUEUR_PREMIERS_MOTS = 40;

    /** Les premiers mots d'un texte (40 caractères au plus, coupés entre deux mots), suivis de « … » s'il continue. */
    function premiersMots(t) {
        var s = propre(t);
        if (s.length <= D.LONGUEUR_PREMIERS_MOTS) return s;
        var coupe = s.lastIndexOf(' ', D.LONGUEUR_PREMIERS_MOTS);
        return s.slice(0, coupe > 0 ? coupe : D.LONGUEUR_PREMIERS_MOTS) + '…';
    }
    D.premiersMots = premiersMots;

    /** « « A », « B » et « C » », ou, au-delà de trois, « « A », « B », « C » et N autres ». */
    function nommer(textes) {
        var g = textes.slice(0, 3).map(function (t) { return '« ' + premiersMots(t) + ' »'; });
        if (textes.length > 3) return g.join(', ') + ' et ' + (textes.length - 3) + (textes.length - 3 > 1 ? ' autres' : ' autre');
        return g.length > 1 ? g.slice(0, -1).join(', ') + ' et ' + g[g.length - 1] : g.join('');
    }

    function aCouper(base, textes) {
        return base + ' pour ' + nommer(textes) + ' : ' + (textes.length > 1 ? 'coupe-les' : 'coupe-le') + ' avec « Couper »';
    }

    /** Le nom d'un critère compris, tel qu'à l'écran : son texte, ou « Critère à nommer (N) ». */
    function nomAffiche(c) { return c.nom != null ? c.nom : 'Critère à nommer (' + c.numero + ')'; }

    /**
     * Un message de `materielAssistant.calculs(m).manquants` → sa forme dans la dissection : les mêmes
     * conditions, mais le critère ou le morceau en cause nommé, et jamais une étape de l'assistant.
     * Les messages de l'assistant lui-même ne changent pas. `null` : le message est retiré (déjà dit).
     */
    function raisonDissection(t, R, m, b) {
        var A = window.materielAssistant;
        function texteDe(p) { return String(p && p.valeur != null ? p.valeur : '').trim(); }
        function criteresOu(pred) { return m.criteres.map(function (c, i) { return pred(c) ? nomAffiche(R.criteres[i]) : null; }).filter(function (x) { return x != null; }); }
        function sansPoids(c) { return isNaN(A.nombre(c.ponderation.valeur)); }
        if (t === 'des noms de critères plus courts (' + A.MAX_NOM + ' caractères au plus)') {
            return aCouper('des noms de critères plus courts (' + A.MAX_NOM + ' caractères au plus)', criteresOu(function (c) { return texteDe(c.nom).length > A.MAX_NOM; }));
        }
        if (t === 'des sous-critères plus courts (' + A.MAX_NOM + ' caractères au plus)') {
            var sous = [];
            m.criteres.forEach(function (c) { (c.sousCriteres || []).forEach(function (s) { if (s.length > A.MAX_NOM) sous.push(s); }); });
            return aCouper('des éléments observables plus courts (' + A.MAX_NOM + ' caractères au plus)', sous);
        }
        if (t === 'des cases plus courtes (5 000 caractères au plus)') {
            var cases = [];
            m.criteres.forEach(function (c) { c.cases.forEach(function (d) { if (texteDe(d).length > A.MAX_CASE) cases.push(texteDe(d)); }); });
            return aCouper('des réponses plus courtes (5 000 caractères au plus)', cases);
        }
        // Le seul message de `calculs` qui renvoie à une étape de l'assistant (`NOMS_ETAPES.roles`).
        if (t.indexOf('les points de chaque critère') === 0 && t.indexOf('« ' + A.NOMS_ETAPES.roles + ' »') > 0) {
            // Sans aucune logique, « des points ou des niveaux » l'a déjà dit.
            return b.logique ? 'les points de chaque critère : surligne le poids de chaque critère avec l’étiquette « Pondération », ou ce que vaut chaque réponse avec l’étiquette « Points »' : null;
        }
        if (t === 'les points d’un critère' || /^les points de \d+ critères$/.test(t)) return t + ' (' + nommer(criteresOu(sansPoids)) + ')';
        if (t === 'la pondération d’un critère' || /^la pondération de \d+ critères$/.test(t)) return t + ' (' + nommer(criteresOu(sansPoids)) + ')';
        return t;
    }

    /**
     * Lot 9 (`CONSIGNE-LOT-2026-10-18-dissection-9-creer-quand-meme.md`, décision de Grégoire, 17 h 34) : les
     * messages de `calculs` qui ne disent QUE des points ou des pondérations manquants. Ils ne bloquent plus :
     * la grille se crée, et ces critères se complètent ensuite dans « Grilles de critères ». Les points hors de
     * 0 à 100 ou non entiers, eux, bloquent toujours (un objet faux).
     */
    function estACompleter(t) {
        return t === 'les points d’un critère' || /^les points de \d+ critères$/.test(t)
            || t === 'la pondération d’un critère' || /^la pondération de \d+ critères$/.test(t)
            || t.indexOf('les points de chaque critère') === 0;
    }

    /**
     * Peut-on créer ? `{ enNiveaux, raisons, aCompleter, avertissements, modele }`. Lot 9 : `aCompleter`, ce
     * qui manque sans bloquer (points ou pondérations), dit sous un intitulé à part (`estACompleter`). Les raisons d'un refus, dans
     * l'ordre : le nom, les morceaux sans place, les points ou les niveaux, les réponses par critère,
     * puis les mots de `calculs(m).manquants` (en niveaux : la plage, la note retenue, les codes, le
     * nombre de niveaux), ceux qui concernent des critères ou des morceaux précis les NOMMANT, et sans
     * aucun renvoi à une étape de l'assistant (lot 5, `raisonDissection`). Le total qui ne tombe pas juste n'en est pas une : le constat est
     * déjà à l'écran. En niveaux, les avertissements de `calculs(m)` (plages qui se chevauchent ou
     * laissent un trou, note retenue hors de sa plage), tels quels : ils n'empêchent rien.
     * Textes de Claude Code (18 oct.), validé G. 18 oct.
     * @param {object} R - la grille comprise
     * @param {{nomsGrilles?: string[]}} [contexte] - les noms des grilles déjà dans le trimestre
     * @param {string} [nom] - C3 : le champ « Nom de ta grille », une fois modifié
     * @param {object} [saisie] - lot 2b : le choix et les valeurs des niveaux (voir `modele`)
     */
    D.creation = function (R, contexte, nom, saisie) {
        var b = D.bilan(R);
        var m = D.modele(R, nom, saisie);
        var enNiveaux = !m.enPoints;
        var raisons = [], aCompleter = [];
        // C3 : un nom vide (ni Titre étiqueté, ni nom tapé) ; la raison remplace celle du Titre.
        var sansNom = !m.nom.valeur;
        if (sansNom) raisons.push('un nom pour ta grille');
        if (R.sansPlace.length) raisons.push(compte(R.sansPlace.length, 'une place pour le morceau étiqueté listé plus bas', 'une place pour les # morceaux étiquetés listés plus bas'));
        if (!b.logique) raisons.push('des points ou des niveaux : surligne ce que vaut chaque réponse avec l’étiquette « Points », ou le nom de chaque niveau avec l’étiquette « Niveau »');
        m.criteres.forEach(function (c) {
            if (!c.parCle) return;
            if (c.parCle.length > D.MAX_REPONSES) raisons.push('au plus ' + D.MAX_REPONSES + ' réponses par critère (« ' + c.nom.valeur + ' » en a ' + c.parCle.length + ')');
            if (c.parCle.some(function (x) { return x.cle.charAt(0) === '_'; })) raisons.push('des points qui ne commencent pas par « _ » (« ' + c.nom.valeur + ' »)');
        });
        var longues = [];
        m.criteres.forEach(function (c) { (c.parCle || []).forEach(function (x) { if (x.texte.length > D.MAX_REPONSE) longues.push(x.texte); }); });
        if (longues.length) raisons.push(aCouper('des réponses plus courtes (5 000 caractères au plus)', longues));
        var calc = window.materielAssistant.calculs(m, contexte);
        calc.manquants.forEach(function (t) {
            // Sans nom, « le nom de la grille » redirait la première raison.
            if (sansNom && t === 'le nom de la grille') return;
            var r = raisonDissection(t, R, m, b);
            if (r != null) (estACompleter(t) ? aCompleter : raisons).push(r);
        });
        var avertissements = enNiveaux ? [calc.avertPlages, calc.avertNotes].filter(Boolean) : [];
        return { enNiveaux: enNiveaux, raisons: raisons, aCompleter: aCompleter, avertissements: avertissements, modele: m };
    };

    // ------------------------------------------------------------------
    // 4. L'EXEMPLE : une grille FICTIVE, de la forme d'une grille à sections et niveaux
    // ------------------------------------------------------------------

    /**
     * « Essayer avec un exemple » : une grille fictive (aucun texte réel), sans étiquette. Deux
     * sections, quatre critères, quatre niveaux nommés, des points par niveau, un total sur 30.
     * Validé G. 18 oct. ; ses critères disent « L’étudiant·e » (décision de ce jour-là).
     */
    D.exempleDoc = function () {
        var nouveau = fabrique();
        function cell(lignes, cs) { return { cs: cs || 1, rs: 1, lines: lignes.map(nouveau) }; }
        var NIVEAUX = ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable'];
        function rangeeSection(nom) { return [cell([nom])].concat(NIVEAUX.map(function (n) { return cell([n]); })); }
        function rangeeCritere(question, sous, reponses) {
            return [cell([question].concat(sous.map(function (s) { return '· ' + s; })))].concat(reponses.map(function (r) {
                return cell(r[1] ? [r[0], r[1]] : [r[0]]);
            }));
        }
        return { mode: 'table', rows: [
            [cell(['Journal de lecture']), cell(['Rendre compte d’une lecture personnelle et la relier aux notions vues en classe.'], 4)],
            rangeeSection('PARTIE A : COMPRÉHENSION'),
            rangeeCritere('L’étudiant·e résume l’œuvre avec justesse', ['Repérage des événements principaux', 'Exactitude des faits rapportés'],
                [['Résumé absent ou erroné'], ['Résume quelques événements', '2'], ['Résume l’essentiel', '3-4'], ['Résume avec précision et concision', '5']]),
            rangeeCritere('L’étudiant·e relève des procédés d’écriture', ['Procédés nommés correctement', 'Exemples tirés du texte'],
                [['Aucun procédé relevé'], ['Relève un procédé', '3'], ['Relève quelques procédés', '4'], ['Relève et illustre plusieurs procédés', '5']]),
            rangeeSection('PARTIE B : RÉFLEXION'),
            rangeeCritere('L’étudiant·e relie l’œuvre aux notions du cours', ['Liens explicites avec les notions', 'Pertinence des rapprochements'],
                [['Liens absents'], ['Établit un lien', '4-5'], ['Établit quelques liens', '6-7'], ['Établit des liens nombreux et pertinents', '8-10']]),
            rangeeCritere('L’étudiant·e exprime une appréciation argumentée', ['Opinion formulée clairement', 'Arguments appuyés sur le texte'],
                [['Appréciation absente'], ['Donne une opinion', '4-5'], ['Justifie son opinion', '6-8'], ['Argumente avec nuance', '9-10']]),
            [cell(['TOTAL : / 30'], 5)]
        ] };
    };

    window.materielDissectionLecture = D;
})();
