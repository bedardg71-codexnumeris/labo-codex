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
 *   { numero, enonce, contexte: [texte], elements: [{ texte, criteres: [texte] }],
 *     activites: { discipline, ponderation, unites, heures, precisions }, ecartees: [texte] }
 *
 * Correctif du 28 nov., 8 h 08 (Grégoire : « numériser ne touche aucun cours et c'est la création du cours qui vient
 * puiser dans le devis numérisé ») : un devis accepté se range dans une RÉSERVE de devis (§ 4), jamais dans une fiche
 * de cours. `activites` garde ce que le bloc « Activités d'apprentissage » porte, pour la création d'un cours.
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

    var CHAMPS_ACTIVITES = ['discipline', 'ponderation', 'unites', 'heures', 'precisions'];
    function activitesVides() { return { discipline: '', ponderation: '', unites: '', heures: '', precisions: '' }; }

    /** Les libellés du bloc « Activités d'apprentissage », comparés par `cle` (sans accents ni casse). */
    var LIBELLES_ACTIVITES = [
        [/^discipline$/, 'discipline'],
        [/^ponderation$/, 'ponderation'],
        [/^(nombre d')?unites$/, 'unites'],
        [/^(periodes d'enseignement|(nombre d')?heures-contact|nombre d'heures|heures d'enseignement)$/, 'heures'],
        [/^precisions?$/, 'precisions']
    ];

    function modeleVide() {
        return { numero: '', enonce: '', contexte: [], elements: [], activites: activitesVides(), ecartees: [] };
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
            champActivite: null,     // le champ des activités d'apprentissage que la ligne suivante prolonge
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
        x.champActivite = null;
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

    /** Le champ que nomme un libellé des activités d'apprentissage (« Pondération »), ou null. */
    function champActivite(libelle) {
        var k = cle(libelle), trouve = null;
        LIBELLES_ACTIVITES.forEach(function (paire) { if (!trouve && paire[0].test(k)) trouve = paire[1]; });
        return trouve;
    }

    /**
     * Le bloc « Activités d'apprentissage » (formation générale) : « Libellé : valeur », la valeur parfois sur les
     * lignes qui suivent, jusqu'au prochain libellé ou au prochain vide. Ce ne sont pas des critères. Une valeur que
     * rien ne rattache à son libellé (les nombres en vrac de 0013) va de côté : la lecture ne devine pas.
     */
    function lireActivites(x, l) {
        if (x.etat !== 'activites') return false;
        var paire = /^([^:]{3,40}?)\s*:\s*(.*)$/.exec(l);
        var champ = paire ? champActivite(paire[1]) : null;
        if (champ && !x.m.activites[champ]) {
            x.champActivite = champ;
            x.m.activites[champ] = paire[2].trim();
        }
        else if (x.champActivite) x.m.activites[x.champActivite] = recoudre(x.m.activites[x.champActivite], l);
        else x.m.ecartees.push(l);
        return true;
    }

    /** Ce qui n'est pas la compétence : une ligne qui se répète d'une page à l'autre, un numéro de page, l'avant. */
    function lireHorsDevis(x, l, ouvreBloc) {
        var hors = (ouvreBloc && x.repetes[l] > 1) || x.etat === 'avant' || /^\d{1,4}$/.test(l);
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
        if (lireCode(x, l) || lireTitre(x, l) || lireActivites(x, l) || lireHorsDevis(x, l, ouvreBloc) || lirePuce(x, l) || lireElement(x, l)) return;
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

    /** Les cinq champs des activités, en textes, quoi qu'on ait reçu. */
    function activitesSures(a) {
        var r = activitesVides();
        if (a && typeof a === 'object') CHAMPS_ACTIVITES.forEach(function (c) { if (typeof a[c] === 'string') r[c] = a[c]; });
        return r;
    }

    function copie(m) {
        return {
            numero: m.numero || '',
            enonce: m.enonce || '',
            contexte: (m.contexte || []).slice(),
            elements: (m.elements || []).map(function (el) { return { texte: el.texte || '', criteres: (el.criteres || []).slice() }; }),
            activites: activitesSures(m.activites),
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

    /** Retoucher un texte : `adr` = { zone: 'numero' | 'enonce' }, { zone: 'activite', champ }, { zone: 'elementTexte', e } ou une adresse de ligne. */
    D.retoucher = function (m, adr, texte) {
        var r = copie(m), t = String(texte == null ? '' : texte);
        if (adr.zone === 'numero') r.numero = t;
        else if (adr.zone === 'enonce') r.enonce = t;
        else if (adr.zone === 'activite') { if (CHAMPS_ACTIVITES.indexOf(adr.champ) !== -1) r.activites[adr.champ] = t; }
        else if (adr.zone === 'elementTexte') { if (r.elements[adr.e]) r.elements[adr.e].texte = t; }
        else { var l = liste(r, adr); if (l && adr.i >= 0 && adr.i < l.length) l[adr.i] = t; }
        return r;
    };

    // ------------------------------------------------------------------
    // 4. LA RÉSERVE DE DEVIS (une collection à elle, hors trimestre ; aucune fiche de cours n'est touchée)
    // ------------------------------------------------------------------

    function net(t) { return propre(t == null ? '' : t); }
    function codeNet(c) { return net(c).toUpperCase(); }
    function textes(a) { return Array.isArray(a) ? a.filter(function (t) { return typeof t === 'string'; }) : []; }

    /**
     * Ce que la réserve garde d'un devis accepté, tout ce que la création d'un cours voudra lire : le code de la
     * compétence, son énoncé, le contexte de réalisation, les éléments avec leurs critères de performance, et les
     * activités d'apprentissage (discipline, pondération, unités, heures ou périodes, précisions). Les lignes vides
     * partent ; les lignes mises de côté ne sont pas gardées.
     */
    D.pourReserve = function (m) {
        var a = activitesSures(m.activites);
        CHAMPS_ACTIVITES.forEach(function (c) { a[c] = net(a[c]); });
        return {
            code: codeNet(m.numero),
            enonce: net(m.enonce),
            contexte: (m.contexte || []).map(net).filter(Boolean),
            elements: (m.elements || []).map(function (el) {
                return { texte: net(el.texte), criteres: (el.criteres || []).map(net).filter(Boolean) };
            }).filter(function (el) { return el.texte || el.criteres.length; }),
            activites: a
        };
    };

    /** Un devis de la réserve tel qu'on peut s'y fier (la réserve voyage dans les exports) : des textes, rien d'autre. */
    function devisSur(d) {
        if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
        var r = {
            code: typeof d.code === 'string' ? codeNet(d.code) : '',
            enonce: typeof d.enonce === 'string' ? d.enonce : '',
            contexte: textes(d.contexte),
            elements: (Array.isArray(d.elements) ? d.elements : []).filter(function (el) { return el && typeof el === 'object'; })
                .map(function (el) { return { texte: typeof el.texte === 'string' ? el.texte : '', criteres: textes(el.criteres) }; }),
            activites: activitesSures(d.activites)
        };
        ['id', 'dateCreation', 'dateModification'].forEach(function (k) { if (typeof d[k] === 'string') r[k] = d[k]; });
        return r;
    }

    /** La réserve lue du stockage : un tableau de devis sûrs, quoi qu'on y trouve. */
    D.reserveSure = function (v) {
        return (Array.isArray(v) ? v : []).map(devisSur).filter(Boolean);
    };

    /** Un devis de la réserve, sous la forme du modèle de l'écran (pour le relire et le corriger). */
    D.depuisReserve = function (d) {
        var s = devisSur(d) || devisSur({});
        var m = modeleVide();
        m.numero = s.code; m.enonce = s.enonce; m.contexte = s.contexte; m.elements = s.elements; m.activites = s.activites;
        return m;
    };

    /**
     * Où ce devis irait dans la réserve, sans rien écrire.
     *   - rouvert (`idOuvert`) : il reprend sa place, quel que soit son code ; mais si un AUTRE devis porte déjà son
     *     nouveau code, c'est un conflit (`conflit`), et rien ne se range ;
     *   - collé : le devis du même code, s'il existe, est celui qu'il remplacerait (`ancien`).
     * @returns {{index: number, ancien: Object|null, conflit: Object|null}}
     */
    D.place = function (reserve, devis, idOuvert) {
        var liste = D.reserveSure(reserve), code = codeNet(devis.code);
        var parCode = code ? liste.findIndex(function (d) { return d.code === code; }) : -1;
        if (!idOuvert) return { index: parCode, ancien: parCode === -1 ? null : liste[parCode], conflit: null };
        var parId = liste.findIndex(function (d) { return d.id === idOuvert; });
        if (parId === -1) return { index: parCode, ancien: parCode === -1 ? null : liste[parCode], conflit: null };
        if (parCode !== -1 && parCode !== parId) return { index: -1, ancien: null, conflit: liste[parCode] };
        return { index: parId, ancien: liste[parId], conflit: null };
    };

    /**
     * Range un devis dans la réserve et rend la réserve neuve (ou null sur un conflit, ou sans code : rien ne se range).
     * Un devis remplacé garde son `id` et sa date de création ; aucun autre devis ne bouge ; rien n'est supprimé.
     * @param {Array} reserve
     * @param {Object} devis - ce que rend `pourReserve`
     * @param {{idOuvert?: string, idNeuf: string, maintenant: string}} opts
     */
    D.ranger = function (reserve, devis, opts) {
        var liste = D.reserveSure(reserve), net2 = devisSur(devis);
        if (!net2 || !net2.code) return null;
        var p = D.place(liste, net2, opts.idOuvert);
        if (p.conflit) return null;
        net2.dateModification = opts.maintenant;
        if (p.index === -1) {
            net2.id = opts.idNeuf;
            net2.dateCreation = opts.maintenant;
            return liste.concat([net2]);
        }
        net2.id = liste[p.index].id || opts.idNeuf;
        net2.dateCreation = liste[p.index].dateCreation || opts.maintenant;
        liste[p.index] = net2;
        return liste;
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

    /** Deux devis disent-ils la même chose ? (Le contenu seul : ni l'id, ni les dates.) */
    D.memeContenu = function (a, b) {
        var contenu = function (d) {
            var s = devisSur(d) || devisSur({});
            return JSON.stringify(D.pourReserve({ numero: s.code, enonce: s.enonce, contexte: s.contexte, elements: s.elements, activites: s.activites }));
        };
        return contenu(a) === contenu(b);
    };

    /**
     * Les devis d'un fichier reçu, confrontés à la réserve, sans rien écrire. Pour chacun : `neuf` (ce code n'est pas
     * rangé), `identique` (rangé, même contenu : rien à faire) ou `different` (rangé, autre contenu : `ancien` le
     * porte, et rien ne se remplace sans accord). Un devis sans code, ou un second devis du même code dans le fichier,
     * n'est pas proposé.
     */
    D.confronter = function (reserve, fichier) {
        var liste = D.reserveSure(reserve), vus = {};
        return D.reserveSure(fichier).filter(function (d) {
            if (!d.code || vus[d.code]) return false;
            vus[d.code] = true;
            return true;
        }).map(function (d) {
            var ancien = liste.find(function (x) { return x.code === d.code; }) || null;
            return { devis: d, ancien: ancien, etat: !ancien ? 'neuf' : D.memeContenu(ancien, d) ? 'identique' : 'different' };
        });
    };

    D.CHAMPS_ACTIVITES = CHAMPS_ACTIVITES;
    /** La clé de la réserve : globale, hors trimestre (inscrite à CLES_GLOBALES, js/trimestres.js). */
    D.CLE_RESERVE = 'devisMinisteriels';
    /**
     * La réserve de la démonstration (second amendement, 28 nov., 10 h 03) : un devis rangé dans la démo vit avec elle,
     * sous le préfixe `demo_` comme tout ce qu'on y crée, et ne touche jamais la réserve réelle.
     */
    D.CLE_RESERVE_DEMO = 'demo_devisMinisteriels';

    window.devisLecture = D;
})();
