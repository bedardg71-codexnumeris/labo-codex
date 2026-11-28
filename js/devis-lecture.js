/**
 * devis-lecture.js — Conception › « Apporter mon matériel » : LIRE un devis ministériel collé.
 *
 * Lot « Le devis ministériel dans Apporter mon matériel » (28 nov. 2026, demande de Grégoire, 7 h 26 à 7 h 55).
 * Un devis copié d'un PDF n'est que du texte à plat, sans tableau : la lecture se fait PAR REPÈRES
 * (« Code : », « Énoncé de la compétence », « Contexte de réalisation », « Éléments de la compétence » ou
 * « Éléments », « Critères de performance », les numéros des éléments, les puces des critères).
 *
 * Fonctions pures : aucun DOM, aucun stockage. Bancs : tests/unit/devis-lecture.test.js, sur les cinq devis
 * réels du 28 nov. (tests/fixtures/devis/).
 *
 * LA RÈGLE DE LA LECTURE : ne rien inventer, ne rien perdre. Une ligne que la lecture ne sait pas ranger va dans
 * `ecartees`, que l'écran montre et d'où l'enseignant·e la reprend. L'ordre du collage n'est JAMAIS reconstruit :
 * une puce se range sous le dernier élément lu, même quand le copier-coller a mélangé les colonnes (devis 000Z).
 *
 * Le modèle rendu, et que les gestes de correction transforment :
 *   { numero, enonce, contexte: [texte], elements: [{ texte, criteres: [texte] }], ecartees: [texte] }
 *
 * CHARGÉ AVANT materiel-devis.js.
 */
(function () {
    'use strict';

    var D = {};

    // ------------------------------------------------------------------
    // 1. LES REPÈRES
    // ------------------------------------------------------------------

    var PUCE = /^(?:[•●▪■◦‣·∙○]|[-–—*](?=\s))\s*/;
    var NUMERO_ELEMENT = /^(\d{1,2})(?:[.)]\s*|\s+)(\S.*)$/;
    var NUMERO_SEUL = /^(\d{1,2})[.)]$/;
    var CODE = /^[0-9A-Za-z]{3,6}$/;
    var MAJUSCULE = /^[«"“(]?\s*[A-ZÀ-ÖØ-Þ]/;
    var FINIE = /[.!?…][»”")]?$/;

    /** Pour comparer un repère : sans accents, sans casse, apostrophe droite, sans deux-points final. */
    function cle(s) {
        return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
            .replace(/[’ʼ`]/g, '\'').replace(/\s*:\s*$/, '').replace(/\s+/g, ' ').trim();
    }

    var TITRES = {
        'enonce de la competence': 'enonce',
        'contexte de realisation': 'contexte',
        'elements de la competence': 'elements',
        'elements': 'elements',
        'criteres de performance': 'criteres',
        'activites d\'apprentissage': 'activites',
        // Les intitulés de colonnes du tableau du ministère : reconnus, sans contenu à ranger.
        'objectif': 'colonne',
        'standard': 'colonne'
    };

    function propre(ligne) {
        return String(ligne).normalize('NFC').replace(/[   \t]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    /** Recoud une phrase coupée en fin de ligne ; un trait d'union final garde son mot d'un seul tenant. */
    function recoudre(debut, suite) {
        if (!debut) return suite;
        if (!suite) return debut;
        return /[A-Za-zÀ-ÿ]-$/.test(debut) ? debut + suite : debut + ' ' + suite;
    }

    function modeleVide() {
        return { numero: '', enonce: '', contexte: [], elements: [], ecartees: [] };
    }
    D.modeleVide = modeleVide;

    // ------------------------------------------------------------------
    // 2. LIRE
    // ------------------------------------------------------------------

    /**
     * Les lignes qui reviennent à l'identique d'une page à l'autre (pied de page, titre courant). Seule une ligne
     * qui OUVRE un bloc (précédée d'un vide) peut l'être : la fin d'un critère (« simples. ») revient aussi d'un
     * critère à l'autre, et ne doit pas partir.
     */
    function reperesRepetes(lignes) {
        var compte = {};
        lignes.forEach(function (l, i) {
            if (!l || (i > 0 && lignes[i - 1])) return;
            if (PUCE.test(l) || NUMERO_ELEMENT.test(l) || TITRES[cle(l)] || /^code\s*:/.test(cle(l) + ':')) return;
            compte[l] = (compte[l] || 0) + 1;
        });
        return compte;
    }

    /**
     * L'état d'une lecture en cours. `etat` : avant | enonce | contexte | elements | activites.
     * `courant` : ce que la prochaine ligne sans repère prolonge, `{ liste, i }` ou `{ element }`.
     */
    function lectureNeuve(repetes) {
        return {
            m: modeleVide(), repetes: repetes, etat: 'avant',
            puisContexte: false,     // « Énoncé » et « Contexte » côte à côte : le premier paragraphe est l'énoncé
            contexteAPuces: false,
            attendCode: false,       // « Code : » seul sur sa ligne : le code suit
            numeroEnAttente: null,   // « 3. » seul sur sa ligne : le texte de l'élément suit
            puceEnAttente: false,    // « • » seul sur sa ligne : le texte suit
            numeros: {}, courant: null, videAvant: true
        };
    }

    function texteCourant(x) {
        if (!x.courant) return '';
        return x.courant.element ? x.courant.element.texte : x.courant.liste[x.courant.i];
    }
    function prolonger(x, l) {
        if (x.courant.element) x.courant.element.texte = recoudre(x.courant.element.texte, l);
        else x.courant.liste[x.courant.i] = recoudre(x.courant.liste[x.courant.i], l);
    }
    function nouvelItem(x, liste, l) {
        liste.push(l);
        x.courant = { liste: liste, i: liste.length - 1 };
    }
    function nouvelElement(x, numero, l) {
        var el = { texte: l, criteres: [] };
        x.m.elements.push(el);
        x.numeros[numero] = true;
        x.courant = { element: el };
    }
    function changerEtat(x, etat) { x.etat = etat; x.courant = null; }

    /** Une ligne vide : elle ferme l'énoncé quand le contexte attend à côté. */
    function surVide(x) {
        if (x.etat === 'enonce' && x.puisContexte && x.m.enonce) { changerEtat(x, 'contexte'); x.puisContexte = false; }
        x.videAvant = true;
    }

    /** Retient un code lu ; un second code, différent, est mis de côté tel qu'écrit. */
    function retenirCode(x, code, ligne) {
        if (!x.m.numero) x.m.numero = code.toUpperCase();
        else if (x.m.numero !== code.toUpperCase()) x.m.ecartees.push(ligne);
    }

    /** Le code de la compétence, parfois sur la ligne qui suit « Code : ». */
    function lireCode(x, l) {
        if (x.attendCode) {
            x.attendCode = false;
            if (CODE.test(l)) { retenirCode(x, l, 'Code : ' + l); return true; }
        }
        var code = /^code\s*:\s*(.*)$/i.exec(l);
        if (!code) return false;
        var v = code[1].trim();
        if (!v) x.attendCode = true;
        else if (CODE.test(v)) retenirCode(x, v, l);
        else x.m.ecartees.push(l);
        return true;
    }

    /** Un intitulé du tableau : il change de zone, et ne porte aucun texte à ranger. */
    function lireTitre(x, l) {
        var titre = TITRES[cle(l)];
        if (!titre) return false;
        x.numeroEnAttente = null;
        x.puceEnAttente = false;
        if (titre === 'enonce') { changerEtat(x, 'enonce'); x.puisContexte = false; }
        else if (titre === 'contexte') {
            if (x.etat === 'enonce' && !x.m.enonce) x.puisContexte = true;
            else changerEtat(x, 'contexte');
        }
        else if (titre === 'elements' || titre === 'criteres') { if (x.etat !== 'elements') changerEtat(x, 'elements'); }
        else if (titre === 'activites') changerEtat(x, 'activites');
        return true;
    }

    /** Ce qui n'est pas la compétence : une ligne qui se répète d'une page à l'autre, un numéro de page, l'avant, les activités. */
    function lireHorsDevis(x, l, ouvreBloc) {
        var hors = (ouvreBloc && x.repetes[l] > 1) || x.etat === 'avant' || x.etat === 'activites' || /^\d{1,4}$/.test(l);
        if (hors) x.m.ecartees.push(l);
        return hors;
    }

    /** Une puce : une ligne du contexte, ou un critère du dernier élément lu. */
    function lirePuce(x, l) {
        var puce = PUCE.exec(l);
        if (!puce) {
            if (!x.puceEnAttente) return false;
            x.puceEnAttente = false;
            prolonger(x, l);
            return true;
        }
        var reste = l.slice(puce[0].length).trim();
        if (x.etat === 'enonce' && x.puisContexte) { changerEtat(x, 'contexte'); x.puisContexte = false; }
        var dernier = x.m.elements[x.m.elements.length - 1];
        if (x.etat === 'contexte') { x.contexteAPuces = true; nouvelItem(x, x.m.contexte, reste); }
        else if (x.etat === 'elements' && dernier) nouvelItem(x, dernier.criteres, reste);
        else { x.m.ecartees.push(l); return true; }
        x.puceEnAttente = !reste;
        return true;
    }

    /** Un élément numéroté (« 1. », « 1 » sans point, ou le numéro seul sur sa ligne). Un numéro déjà lu n'en ouvre pas un second. */
    function lireElement(x, l) {
        if (x.etat !== 'elements') return false;
        if (x.numeroEnAttente !== null) {
            nouvelElement(x, x.numeroEnAttente, l);
            x.numeroEnAttente = null;
            return true;
        }
        var seul = NUMERO_SEUL.exec(l);
        if (seul && !x.numeros[seul[1]]) { x.numeroEnAttente = seul[1]; return true; }
        var num = NUMERO_ELEMENT.exec(l);
        if (!num || x.numeros[num[1]] || !MAJUSCULE.test(num[2])) return false;
        nouvelElement(x, num[1], num[2].trim());
        return true;
    }

    /** Un contexte en phrases, sans puces : une phrase finie, puis une majuscule, c'est la ligne suivante. */
    function lireContexteEnPhrases(x, l) {
        if (x.etat !== 'contexte' || (x.contexteAPuces && x.courant)) return false;
        if (!x.courant || x.contexteAPuces || (FINIE.test(texteCourant(x)) && MAJUSCULE.test(l))) nouvelItem(x, x.m.contexte, l);
        else prolonger(x, l);
        return true;
    }

    /** Une ligne sans repère : la suite de ce qui précède, ou une ligne à part. */
    function lireSuite(x, l, ouvreBloc) {
        if (x.etat === 'enonce') { x.m.enonce = recoudre(x.m.enonce, l); return; }
        if (lireContexteEnPhrases(x, l)) return;
        // Après un vide, sous une phrase finie : ce n'est pas sa suite (un pied de page). Mise de côté, visible.
        if (x.courant && ouvreBloc && FINIE.test(texteCourant(x))) x.courant = null;
        if (x.courant) prolonger(x, l);
        else x.m.ecartees.push(l);
    }

    function lireLigne(x, l) {
        if (!l) { surVide(x); return; }
        var ouvreBloc = x.videAvant;
        x.videAvant = false;
        if (lireCode(x, l) || lireTitre(x, l) || lireHorsDevis(x, l, ouvreBloc) || lirePuce(x, l) || lireElement(x, l)) return;
        lireSuite(x, l, ouvreBloc);
    }

    /**
     * Lit le texte d'un devis collé.
     * @param {string} texte
     * @returns {{numero: string, enonce: string, contexte: string[], elements: Array<{texte: string, criteres: string[]}>,
     *            ecartees: string[], reconnu: boolean}}
     */
    D.lire = function (texte) {
        var lignes = String(texte == null ? '' : texte).replace(/\r\n?/g, '\n').replace(/\f/g, '\n\n').split('\n').map(propre);
        var x = lectureNeuve(reperesRepetes(lignes));
        lignes.forEach(function (l) { lireLigne(x, l); });
        x.m.reconnu = !!(x.m.numero || x.m.enonce || x.m.elements.length);
        return x.m;
    };

    // ------------------------------------------------------------------
    // 3. LES GESTES DE CORRECTION (chacun rend un modèle neuf)
    // ------------------------------------------------------------------

    function copie(m) {
        return {
            numero: m.numero || '',
            enonce: m.enonce || '',
            contexte: (m.contexte || []).slice(),
            elements: (m.elements || []).map(function (el) { return { texte: el.texte || '', criteres: (el.criteres || []).slice() }; }),
            ecartees: (m.ecartees || []).slice()
        };
    }
    D.copie = copie;

    /** La liste que désigne une adresse `{ zone: 'contexte' | 'ecartees' }` ou `{ zone: 'element', e }`. */
    function liste(m, adr) {
        if (!adr) return null;
        if (adr.zone === 'contexte') return m.contexte;
        if (adr.zone === 'ecartees') return m.ecartees;
        if (adr.zone === 'element' && m.elements[adr.e]) return m.elements[adr.e].criteres;
        return null;
    }

    /**
     * Déplace une ligne (ou cette ligne ET celles qui la suivent dans sa liste) au bout d'une autre liste.
     * « Retirer » une ligne, c'est la déplacer vers `ecartees` : rien ne se perd.
     * @param {Object} m - le modèle
     * @param {{zone: string, e?: number, i: number}} de
     * @param {{zone: string, e?: number}} vers
     * @param {boolean} [avecSuivantes]
     */
    D.deplacer = function (m, de, vers, avecSuivantes) {
        var r = copie(m);
        var source = liste(r, de), cible = liste(r, vers);
        if (!source || !cible || source === cible || !(de.i >= 0 && de.i < source.length)) return r;
        var prises = source.splice(de.i, avecSuivantes ? source.length - de.i : 1);
        prises.forEach(function (t) { cible.push(t); });
        return r;
    };

    /** Une ligne mise de côté devient un élément, au bout de la liste. */
    D.enElement = function (m, i) {
        var r = copie(m);
        if (!(i >= 0 && i < r.ecartees.length)) return r;
        r.elements.push({ texte: r.ecartees.splice(i, 1)[0], criteres: [] });
        return r;
    };

    D.ajouterElement = function (m) {
        var r = copie(m);
        r.elements.push({ texte: '', criteres: [] });
        return r;
    };

    D.ajouterLigne = function (m, vers) {
        var r = copie(m), cible = liste(r, vers);
        if (cible) cible.push('');
        return r;
    };

    /** Retirer un élément : son texte et ses critères vont de côté, dans l'ordre. */
    D.retirerElement = function (m, e) {
        var r = copie(m);
        if (!r.elements[e]) return r;
        var el = r.elements.splice(e, 1)[0];
        [el.texte].concat(el.criteres).forEach(function (t) { if (String(t).trim()) r.ecartees.push(t); });
        return r;
    };

    /** Monter (sens −1) ou descendre (sens 1) un élément, avec ses critères. */
    D.bougerElement = function (m, e, sens) {
        var r = copie(m), j = e + sens;
        if (!r.elements[e] || !r.elements[j]) return r;
        var t = r.elements[e]; r.elements[e] = r.elements[j]; r.elements[j] = t;
        return r;
    };

    /** Retoucher un texte : `adr` = { zone: 'numero' | 'enonce' } ou { zone: 'elementTexte', e } ou une adresse de ligne. */
    D.retoucher = function (m, adr, texte) {
        var r = copie(m), t = String(texte == null ? '' : texte);
        if (adr.zone === 'numero') r.numero = t;
        else if (adr.zone === 'enonce') r.enonce = t;
        else if (adr.zone === 'elementTexte') { if (r.elements[adr.e]) r.elements[adr.e].texte = t; }
        else { var l = liste(r, adr); if (l && adr.i >= 0 && adr.i < l.length) l[adr.i] = t; }
        return r;
    };

    // ------------------------------------------------------------------
    // 4. VERS LA FICHE DU COURS, ET DEPUIS ELLE
    // ------------------------------------------------------------------

    function net(t) { return propre(t == null ? '' : t); }

    /** Le texte d'une ligne d'`elementsCompetence`, sans son numéro ni sa puce. */
    function sansRepere(l) {
        var t = net(l).replace(PUCE, '');
        var n = /^(\d{1,2})[.)]\s*(\S.*)$/.exec(t);
        return n ? n[2].trim() : t;
    }

    /**
     * Ce que la fiche du cours reçoit quand l'enseignant·e accepte. `elementsCompetence` reste le texte libre que ses
     * lecteurs découpent par lignes (planification-export.js) : un élément par ligne, numéroté dans l'ordre de l'écran.
     * Les lignes vides partent ; un élément sans texte part avec ses critères seulement s'il n'en a aucun.
     */
    D.versFiche = function (m) {
        var elements = (m.elements || []).map(function (el) {
            return { texte: net(el.texte), criteres: (el.criteres || []).map(net).filter(Boolean) };
        }).filter(function (el) { return el.texte || el.criteres.length; });
        return {
            numeroCompetence: net(m.numero),
            competence: net(m.enonce),
            elementsCompetence: elements.map(function (el, i) { return (i + 1) + '. ' + el.texte; }).join('\n'),
            devisCompetence: {
                contexte: (m.contexte || []).map(net).filter(Boolean),
                elements: elements
            }
        };
    };

    /** `devisCompetence` tel qu'on peut s'y fier : des tableaux de textes, rien d'autre (la fiche voyage). */
    function devisSur(d) {
        if (!d || typeof d !== 'object') return null;
        var textes = function (a) { return Array.isArray(a) ? a.filter(function (t) { return typeof t === 'string'; }) : []; };
        return {
            contexte: textes(d.contexte),
            elements: (Array.isArray(d.elements) ? d.elements : []).filter(function (el) { return el && typeof el === 'object'; })
                .map(function (el) { return { texte: typeof el.texte === 'string' ? el.texte : '', criteres: textes(el.criteres) }; })
        };
    }

    /**
     * Ce que la fiche porte déjà, sous la forme du modèle. `elementsCompetence` fait foi pour les éléments : s'il a été
     * retouché à la main depuis le devis, chaque ligne garde les critères de l'élément du même texte, et ce que le devis
     * rangé portait d'autre paraît dans `ecartees` (rien n'est caché). `aDuContenu` : y a-t-il quelque chose à remplacer ?
     */
    D.depuisFiche = function (cours) {
        var c = cours || {}, m = modeleVide();
        var devis = devisSur(c.devisCompetence);
        m.numero = net(c.numeroCompetence);
        m.enonce = net(c.competence);
        var lignes = String(c.elementsCompetence || '').split('\n').map(sansRepere).filter(Boolean);
        var restants = devis ? devis.elements.slice() : [];
        m.elements = lignes.map(function (t) {
            var k = restants.findIndex(function (el) { return net(el.texte) === t; });
            return { texte: t, criteres: k === -1 ? [] : restants.splice(k, 1)[0].criteres.slice() };
        });
        if (devis) m.contexte = devis.contexte.slice();
        restants.forEach(function (el) {
            [el.texte].concat(el.criteres).forEach(function (t) { if (net(t)) m.ecartees.push(t); });
        });
        m.aDuContenu = !!(m.numero || m.enonce || m.elements.length || m.contexte.length || m.ecartees.length);
        m.aUnDevis = !!devis;
        return m;
    };

    /** Le compte que les écrans disent : éléments, critères, lignes de contexte. */
    D.compter = function (m) {
        var el = (m.elements || []).filter(function (x) { return net(x.texte) || (x.criteres || []).some(net); });
        return {
            elements: el.length,
            criteres: el.reduce(function (n, x) { return n + (x.criteres || []).filter(net).length; }, 0),
            contexte: (m.contexte || []).filter(net).length,
            ecartees: (m.ecartees || []).filter(net).length
        };
    };

    window.devisLecture = D;
})();
