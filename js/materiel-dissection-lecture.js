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
 */
(function () {
    'use strict';

    var D = {};

    /**
     * Les étiquettes de la palette. Celles du noyau (critère, élément observable, descripteur,
     * points, niveau) ont été tranchées par Grégoire le 18 oct. 2026 ; les autres textes sont
     * ceux de l'ébauche, PROVISOIRES (étape 3 du plan).
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
            if (cr.auto && cr.reponses.length) cr.reponses[cr.reponses.length - 1].pondApres = np[np.length - 1]; else cr.pond = np[np.length - 1];
        },
        descripteur: lireDescripteur,
        points: lirePoints
    };

    function lireMorceau(x, id, t, tx) {
        if (t === 'ignorer' || t === 'niveau') return;
        if (t === 'suite') { if (x.suite) x.suite(tx); else sansPlace(x, tx, t, 'aucun morceau à compléter avant elle'); return; }
        // Lot 2a (trouvaille 1 du lot 1, tranchée par Cowork) : une « Suite » complète le dernier TEXTE
        // lu ; des points et une pondération sont des nombres, pas du texte à continuer.
        if (t !== 'points' && t !== 'ponderation') x.suite = null;
        if (LIRE_CADRE[t]) { LIRE_CADRE[t](x, id, tx); return; }
        var cr = cible(x, id);
        // Une réponse sans critère, quand aucun niveau n'est nommé : un critère « à nommer ».
        if (t === 'descripteur' && !cr && !x.avecNiveaux) cr = nouveauCritere(x, null, true);
        if (!cr) { sansPlace(x, tx, t, 'aucun critère avant lui'); return; }
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
     * @param {object} doc - le document disséqué
     * @param {Object<string, string>} liens - { idDuMorceau: type }
     * @returns {object} R : titre, description, criteres, niveaux, total, totalNb, sansEtiquette,
     *   sansPlace [{ t, type, raison }], nb { type: compte }, aNommer, avecNiveaux, aPoints
     */
    D.comprendre = function (doc, liens) {
        var M = D.morceaux(doc);
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
        R.aPoints = (R.nb.points || 0) > 0;
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
     * Clés PROVISOIRES (étape 3).
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

    /**
     * Peut-on créer ? `{ enNiveaux, raisons, avertissements, modele }`. Les raisons d'un refus, dans
     * l'ordre : le nom, les morceaux sans place, les points ou les niveaux, les réponses par critère,
     * puis les mots de `calculs(m).manquants`, tels quels (en niveaux : la plage, la note retenue, les
     * codes, le nombre de niveaux). Le total qui ne tombe pas juste n'en est pas une : le constat est
     * déjà à l'écran. En niveaux, les avertissements de `calculs(m)` (plages qui se chevauchent ou
     * laissent un trou, note retenue hors de sa plage), tels quels : ils n'empêchent rien.
     * Textes PROVISOIRES (Claude Code, 18 oct.), relus à l'étape 3.
     * @param {object} R - la grille comprise
     * @param {{nomsGrilles?: string[]}} [contexte] - les noms des grilles déjà dans le trimestre
     * @param {string} [nom] - C3 : le champ « Nom de ta grille », une fois modifié
     * @param {object} [saisie] - lot 2b : le choix et les valeurs des niveaux (voir `modele`)
     */
    D.creation = function (R, contexte, nom, saisie) {
        var b = D.bilan(R);
        var m = D.modele(R, nom, saisie);
        var enNiveaux = !m.enPoints;
        var raisons = [];
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
        if (m.criteres.some(function (c) { return c.parCle && c.parCle.some(function (x) { return x.texte.length > D.MAX_REPONSE; }); })) {
            raisons.push('des réponses plus courtes (5 000 caractères au plus)');
        }
        var calc = window.materielAssistant.calculs(m, contexte);
        calc.manquants.forEach(function (t) {
            // Sans nom, « le nom de la grille » redirait la première raison.
            if (!(sansNom && t === 'le nom de la grille')) raisons.push(t);
        });
        var avertissements = enNiveaux ? [calc.avertPlages, calc.avertNotes].filter(Boolean) : [];
        return { enNiveaux: enNiveaux, raisons: raisons, avertissements: avertissements, modele: m };
    };

    // ------------------------------------------------------------------
    // 4. L'EXEMPLE : une grille FICTIVE, de la forme d'une grille à sections et niveaux
    // ------------------------------------------------------------------

    /**
     * « Essayer avec un exemple » : une grille fictive (aucun texte réel), sans étiquette. Deux
     * sections, quatre critères, quatre niveaux nommés, des points par niveau, un total sur 30.
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
            rangeeCritere('L’élève résume l’œuvre avec justesse', ['Repérage des événements principaux', 'Exactitude des faits rapportés'],
                [['Résumé absent ou erroné'], ['Résume quelques événements', '2'], ['Résume l’essentiel', '3-4'], ['Résume avec précision et concision', '5']]),
            rangeeCritere('L’élève relève des procédés d’écriture', ['Procédés nommés correctement', 'Exemples tirés du texte'],
                [['Aucun procédé relevé'], ['Relève un procédé', '3'], ['Relève quelques procédés', '4'], ['Relève et illustre plusieurs procédés', '5']]),
            rangeeSection('PARTIE B : RÉFLEXION'),
            rangeeCritere('L’élève relie l’œuvre aux notions du cours', ['Liens explicites avec les notions', 'Pertinence des rapprochements'],
                [['Liens absents'], ['Établit un lien', '4-5'], ['Établit quelques liens', '6-7'], ['Établit des liens nombreux et pertinents', '8-10']]),
            rangeeCritere('L’élève exprime une appréciation argumentée', ['Opinion formulée clairement', 'Arguments appuyés sur le texte'],
                [['Appréciation absente'], ['Donne une opinion', '4-5'], ['Justifie son opinion', '6-8'], ['Argumente avec nuance', '9-10']]),
            [cell(['TOTAL : / 30'], 5)]
        ] };
    };

    window.materielDissectionLecture = D;
})();
