/**
 * PROTOTYPE (Cowork, 17 oct. 2026) — lire une grille écrite en TEXTE BRUT (pas de tableau).
 * Pour éclairer une proposition ; pas du code de l'application. Fonctions pures, aucun DOM.
 *
 * Idée : chaque ligne reçoit une SORTE (critère à points, partie, sous-élément, description,
 * niveau, pied, titre), puis les lignes sont regroupées en critères ; le résultat est rendu
 * sous la forme d'un TABLEAU RECONSTRUIT (`lu` + rôles), que l'étape « Ce que contient ton
 * tableau » montre et corrige comme un tableau collé. Rien n'est inventé : chaque cellule du
 * tableau reconstruit est un morceau d'une ligne du texte.
 */
(function () {
    'use strict';
    var T = {};
    var NB = '(\\d+(?:[.,]\\d+)?)';
    var MESURES = '(?:pts?|points?)';

    function propre(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
    function nombre(s) { return Number(String(s).replace(',', '.')); }

    /** Marque de liste en tête de ligne : sa forme (pour le rang) et le texte qui suit. */
    var MARQUES = [
        { forme: 'num2', re: /^\d{1,2}(?:\.\d{1,2})+\.?\s+/ },     // « 1.1 », « 2.3. »
        { forme: 'num', re: /^(\d{1,2})[.)]\s+/ },
        { forme: 'alpha', re: /^([a-z])[.)]\s+/ },
        { forme: 'romain', re: /^([ivx]{1,4})[.)]\s+/ },
        { forme: 'o', re: /^o\t+/ },                        // 2e niveau d'une liste Word
        { forme: 'case', re: /^[☐☑□■]\s*/ },
        { forme: 'fleche', re: /^[↳➤‣→]\s*/ },
        { forme: 'puce', re: /^[•●▪◦*]\s*/ },
        { forme: 'point', re: /^·\s*/ },
        { forme: 'tiret', re: /^[-–]\s+/ }
    ];
    function marqueDe(l) {
        for (var i = 0; i < MARQUES.length; i++) {
            var m = l.match(MARQUES[i].re);
            if (m) return { forme: MARQUES[i].forme, reste: l.slice(m[0].length) };
        }
        return { forme: '', reste: l };
    }

    /** Les points d'une ligne : en fin (« / 10 », « (10 pts) », « : 10 points », « – 30 % », « sur 10 »,
     *  « ....... 10 », « tab 10 », « (5) ») ou en tête (« 10 pts – »). Jamais un nombre nu dans la prose. */
    var FIN = [
        { forme: 'barre', re: new RegExp('^(.*?)[\\s.…_:–—-]*\\(?\\s*/\\s*' + NB + '\\s*\\)?\\s*$') },
        { forme: 'pts', re: new RegExp('^(.*?)[\\s:–—-]*\\(?\\s*' + NB + '\\s*' + MESURES + '\\s*\\)?\\.?\\s*$', 'i') },
        { forme: 'pourcent', re: new RegExp('^(.*?)[\\s:–—-]*\\(?\\s*' + NB + '\\s*%\\s*\\)?\\s*$') },
        { forme: 'sur', re: new RegExp('^(.*?)\\s+sur\\s+' + NB + '\\s*$', 'i') },
        { forme: 'conduite', re: new RegExp('^(.*?)(?:\\s*[.…]{3,}\\s*|\\t+)' + NB + '\\s*$') },
        { forme: 'parentheses', re: new RegExp('^(.*?)\\s*\\(\\s*' + NB + '\\s*\\)\\s*$') }
    ];
    var DEBUT = [
        { forme: 'pts-avant', re: new RegExp('^\\(?\\s*' + NB + '\\s*' + MESURES + '\\s*\\)?\\s*[:–—-]\\s*(.+)$', 'i') },
        { forme: 'crochets-avant', re: new RegExp('^\\[\\s*/?\\s*' + NB + '\\s*\\]\\s*(.+)$') },
        { forme: 'parentheses-avant', re: new RegExp('^\\(\\s*' + NB + '\\s*\\)\\s+(.+)$') }
    ];
    function pointsDe(t) {
        if (/(^|\s)[-−]\s*\d/.test(t)) return null;              // une déduction n'est pas un maximum
        for (var i = 0; i < FIN.length; i++) {
            var m = t.match(FIN[i].re);
            if (m && /[A-Za-zÀ-ÿ]/.test(m[1])) return { points: nombre(m[2]), reste: m[1].replace(/[\s.…_:–—-]+$/, '').trim(), forme: FIN[i].forme };
        }
        for (var j = 0; j < DEBUT.length; j++) {
            var n = t.match(DEBUT[j].re);
            if (n && /[A-Za-zÀ-ÿ]/.test(n[2])) return { points: nombre(n[1]), reste: n[2].trim(), forme: DEBUT[j].forme };
        }
        return null;
    }

    /** « Excellent (18-20) : texte » ; l'étiquette est courte, la plage facultative. */
    var RE_NIVEAU = new RegExp('^([^:()]{1,30}?)\\s*(?:\\(\\s*(' + NB.slice(1, -1) + '(?:\\s*[-–à]\\s*' + NB.slice(1, -1) + ')?)\\s*' + MESURES + '?\\s*%?\\s*\\))?\\s*[:–—]\\s+(.+)$', 'i');

    var RE_TOTAL = /^(?:(?:sous-|grand\s+)?total|note\s*(?:finale|globale)?\s*[:=]|note\s+(?:finale|globale)\b|résultat(?:\s+final)?\s*[:=])/i;
    var RE_COMMENTAIRES = /^(?:commentaires?|remarques?|observations?|rétroactions?)\b[^/]*:?\s*$/i;
    var RE_DEDUCTION = /(^|\s)[-−]\s*\d|pénalit|retard|par faute|par erreur|par jour/i;
    var RE_BLANC = /^[\s_.\-–—]+$/;

    /** 1. Chaque ligne : sa marque, son rang, ses points, sa sorte provisoire. */
    function classer(texte) {
        var rangs = { '': 0 }, prochain = 1;
        var lignes = [];
        String(texte == null ? '' : texte).split(/\r\n|\r|\n/).forEach(function (brute, i) {
            var sansFin = brute.replace(/\s+$/, '');
            if (!propre(sansFin)) { lignes.push({ i: i, sorte: 'vide' }); return; }
            var retrait = (sansFin.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length / 4) | 0;
            var mq = marqueDe(sansFin.trim());
            if (!(mq.forme in rangs)) rangs[mq.forme] = prochain++;
            var corps = mq.reste.replace(/\t+/g, '\t').trim();
            var l = { i: i, brute: brute, forme: mq.forme, rang: rangs[mq.forme] + retrait, corps: corps };
            var pp = pointsDe(corps);
            if (RE_BLANC.test(corps)) l.sorte = 'blanc';
            else if (RE_TOTAL.test(corps)) { l.sorte = 'pied'; l.raison = 'Ligne de total'; }
            else if (!pp && RE_COMMENTAIRES.test(corps)) { l.sorte = 'pied'; l.raison = 'Espace de commentaires'; }
            else if (!pp && RE_DEDUCTION.test(corps)) { l.sorte = 'pied'; l.raison = 'Déduction ou pénalité'; }
            else if (pp) { l.sorte = 'points'; l.points = pp.points; l.forme_points = pp.forme; l.texte = propre(pp.reste.replace(/\t/g, ' ')); }
            else { l.sorte = 'texte'; l.texte = propre(corps.replace(/\t/g, ' ')); }
            lignes.push(l);
        });
        return lignes.filter(function (l) { return l.sorte !== 'vide'; });
    }

    /** 2. Lignes coupées (copie d'un PDF) : une ligne à points qui commence par une minuscule prolonge les
     *  lignes de texte qui la précèdent, en remontant les suites en minuscule jusqu'à une tête (majuscule ou
     *  marque) ; aucune de ces lignes ne finit par une ponctuation de fin de phrase. */
    function recoller(lignes) {
        var out = [];
        lignes.forEach(function (b) {
            if (b.sorte === 'points' && !b.forme && /^[a-zà-ÿ]/.test(b.texte)) {
                var pris = [];
                for (var q = out.length - 1; q >= 0; q--) {
                    var a = out[q];
                    if (a.sorte !== 'texte' || /[.;!?]$/.test(a.texte)) break;
                    pris.unshift(a);
                    if (!/^[a-zà-ÿ]/.test(a.texte) || a.forme) break;
                }
                if (pris.length && (/^[a-zà-ÿ]/.test(pris[0].texte) && !pris[0].forme)) pris = [];   // pas de tête : on ne recolle pas
                if (pris.length) {
                    out.splice(out.length - pris.length, pris.length);
                    var tete = pris[0];
                    out.push(Object.assign({}, b, { forme: tete.forme, rang: tete.rang, brute: pris.map(function (x) { return x.brute; }).join('\n') + '\n' + b.brute,
                        texte: pris.map(function (x) { return x.texte; }).concat(b.texte).join(' '), recollee: true }));
                    return;
                }
            }
            out.push(b);
        });
        return out;
    }

    /** 3. Les regroupements : titre, avant, parties, critères, et ce qui les suit. */
    T.lire = function (texte) {
        var lignes = recoller(classer(texte));
        var res = { nom: '', avant: [], criteres: [], aClasser: [], avertissements: [], niveaux: [] };
        var premierCritere = lignes.findIndex(function (l) { return l.sorte === 'points'; });
        var aucunPoint = premierCritere < 0;
        // Sans aucune ligne à points (liste de vérification) : chaque ligne à marque est un critère sans points.
        if (aucunPoint) {
            lignes.forEach(function (l, k) {
                if (l.sorte === 'texte' && l.forme && k > 0) { l.sorte = 'points'; l.points = null; }
            });
            premierCritere = lignes.findIndex(function (l) { return l.sorte === 'points'; });
            if (premierCritere < 0) return null;
        }
        // La grille commence au premier critère, ou à la partie qui le précède. Avant : la 1re ligne de
        // texte est le titre ; le reste va à « À classer » (une consigne, une date…).
        var debut = premierCritere;
        // Une « partie » sur la toute première ligne couvrirait toute la grille : c'est son titre.
        if (debut > 1 && estPartie(lignes, debut - 1)) debut--;
        lignes.slice(0, debut).forEach(function (l, k) {
            if (l.sorte !== 'texte') { if (l.sorte === 'pied') res.aClasser.push({ texte: l.brute.trim(), raison: l.raison }); return; }
            if (k === 0 && !l.forme && l.texte.length <= 120) res.nom = l.texte;
            else res.aClasser.push({ texte: l.texte, raison: 'Texte avant la grille' });
        });

        var partie = null, rangPartie = -1, courant = null;
        for (var k = debut; k < lignes.length; k++) {
            var l = lignes[k];
            if (l.sorte === 'pied') { res.aClasser.push({ texte: l.brute.trim(), raison: l.raison }); courant = null; continue; }
            if (l.sorte === 'blanc') continue;
            if (partie && l.rang <= rangPartie && l.sorte !== 'partie') { partie = null; }
            if (l.sorte === 'points') {
                // Une ligne à points suivie de lignes à points plus profondes est une PARTIE.
                var enfants = enfantsAPoints(lignes, k);
                if (enfants.length >= 2) {
                    partie = { nom: nomEtDescription(l.texte).nom, points: l.points }; rangPartie = l.rang;
                    var somme = enfants.reduce(function (s, e) { return s + (e.points || 0); }, 0);
                    if (l.points != null && Math.abs(somme - l.points) > 1e-9) res.avertissements.push('La partie « ' + partie.nom + ' » vaut ' + l.points + ', ses critères totalisent ' + somme + '.');
                    courant = null; continue;
                }
                var nd = nomEtDescription(l.texte);
                courant = { partie: partie ? partie.nom : '', nom: nd.nom, points: l.points, forme: l.forme_points || '', sousCriteres: [], description: nd.description ? [nd.description] : [], niveaux: [], rang: l.rang };
                res.criteres.push(courant);
                continue;
            }
            // Ligne de texte.
            if (estPartie(lignes, k)) { partie = { nom: l.texte.replace(/\s*:$/, '') }; rangPartie = l.rang; courant = null; continue; }
            if (!courant) { res.aClasser.push({ texte: l.texte, raison: 'Ligne hors d’un critère' }); continue; }
            var nv = l.texte.match(RE_NIVEAU);
            if (nv && !l.forme) courant.niveaux.push({ etiquette: propre(nv[1]), plage: nv[2] || '', texte: nv[3], ligne: l.texte });
            else if (l.forme && l.rang > courant.rang) courant.sousCriteres.push(l.texte);
            else if (l.forme) courant.sousCriteres.push(l.texte);
            else courant.description.push(l.texte);
        }
        var der = res.criteres[res.criteres.length - 1];
        if (der && res.criteres.length > 1 && /^(note|total|résultat|sous-total|grand total)\b/i.test(der.nom) && der.points != null) {
            var autres = res.criteres.slice(0, -1).reduce(function (s, c) { return s + (c.points || 0); }, 0);
            if (der.points >= autres) { res.criteres.pop(); res.aClasser.push({ texte: der.nom + ' / ' + der.points, raison: 'Ligne de total' }); }
        }
        decideNiveaux(res);
        res.criteres.forEach(function (c) { c.description = c.description.join('\n'); delete c.rang; });
        return res;
    };

    /** « Nom : explication » → nom court, explication en description (si le nom tient en 60 caractères). */
    var RE_ETIQUETTE = /^(?:crit[eè]re|élément|volet|section|partie|aspect|compétence|question)\s+(?:\d{1,2}|[A-Z]|[IVX]{1,4})\s*[:–—.-]\s*/i;
    function nomEtDescription(t) {
        t = t.replace(RE_ETIQUETTE, '');
        var m = t.match(/^(.{2,60}?)\s+:\s+(.+)$/);
        return m ? { nom: m[1], description: m[2] } : { nom: t, description: '' };
    }

    /** Les lignes à points directement sous la ligne k, plus profondes qu'elle (rang plus grand). */
    function enfantsAPoints(lignes, k) {
        var r = lignes[k].rang, out = [];
        for (var q = k + 1; q < lignes.length; q++) {
            var l = lignes[q];
            if (l.sorte === 'blanc') continue;
            if (l.rang <= r) break;
            if (l.sorte === 'points') out.push(l);
        }
        return out;
    }

    /** Une ligne de texte est une partie si elle est courte, sans ponctuation finale (ou finit par « : »),
     *  et que la ligne suivante est un critère à points plus profond ; ou si elle est en capitales. */
    function estPartie(lignes, k) {
        var l = lignes[k], suiv = lignes[k + 1];
        if (!l || l.sorte !== 'texte' || !suiv || suiv.sorte !== 'points') return false;
        if (l.texte.length > 60 || /[.;!?]$/.test(l.texte)) return false;
        return suiv.rang > l.rang || /:$/.test(l.texte) || (l.texte === l.texte.toUpperCase() && /[A-ZÀ-Ý]/.test(l.texte));
    }

    /** Des lignes « Étiquette (plage) : texte » sont des NIVEAUX si les mêmes étiquettes reviennent sous
     *  au moins deux critères ET qu'au moins la moitié portent des points ; sinon, elles redeviennent des
     *  lignes de description (« Définition : … »). */
    function decideNiveaux(res) {
        var vus = {};
        res.criteres.forEach(function (c) { c.niveaux.forEach(function (n) { (vus[n.etiquette] = vus[n.etiquette] || new Set()).add(c); }); });
        var etiquettes = Object.keys(vus).filter(function (e) { return vus[e].size >= 2; });
        var toutes = [].concat.apply([], res.criteres.map(function (c) { return c.niveaux; }));
        var avecPoints = toutes.filter(function (n) { return n.plage; }).length;
        var oui = etiquettes.length >= 2 && avecPoints * 2 >= toutes.length;
        res.criteres.forEach(function (c) {
            if (oui) c.niveaux = c.niveaux.filter(function (n) { if (etiquettes.indexOf(n.etiquette) >= 0) return true; c.description.push(n.ligne); return false; });
            else { c.niveaux.forEach(function (n) { c.description.push(n.ligne); }); c.niveaux = []; }
        });
        res.niveaux = oui ? etiquettes : [];
    }

    /**
     * 4. Le TABLEAU RECONSTRUIT, dans la forme de `lireHtml` (`{ rangees, avant, apres }`), avec ses
     * rôles : [Partie] | Nom | Points | Sous-critères | Description | un niveau par étiquette. Aucune
     * cellule n'est inventée : en-tête de niveaux = les étiquettes du texte ; les autres cases d'en-tête
     * restent vides.
     */
    T.tableau = function (res) {
        var avecPartie = res.criteres.some(function (c) { return c.partie; });
        var cols = (avecPartie ? ['partie'] : []).concat(['noms', 'pond', 'sousCriteres', 'description']).concat(res.niveaux.map(function () { return 'niveau'; }));
        var rangees = [], roles = [];
        var cel = function (t, rs) { return { t: t || '', span: 1, rspan: rs || 1 }; };
        if (res.niveaux.length) {
            rangees.push(cols.map(function (r, j) { return cel(r === 'niveau' ? res.niveaux[j - cols.indexOf('niveau')] : ''); }));
            roles.push('niveaux');
        }
        res.criteres.forEach(function (c, i) {
            var row = [];
            if (avecPartie) {
                var prec = res.criteres[i - 1];
                if (!c.partie) row.push(cel(''));
                else if (!prec || prec.partie !== c.partie) {
                    var n = 0; for (var q = i; q < res.criteres.length && res.criteres[q].partie === c.partie; q++) n++;
                    row.push(cel(c.partie, n));
                }
            }
            row.push(cel(c.nom), cel(c.points == null ? '' : '/ ' + c.points), cel(c.sousCriteres.join('\n')), cel(c.description));
            res.niveaux.forEach(function (e) {
                var nv = c.niveaux.filter(function (x) { return x.etiquette === e; })[0];
                row.push(cel(nv ? (nv.plage ? '(' + nv.plage + ') ' : '') + nv.texte : ''));
            });
            rangees.push(row); roles.push('critere');
        });
        return {
            lu: { rangees: rangees, avant: res.nom ? [res.nom] : [], apres: [] },
            roles: { rangees: roles, colonnes: cols, suiteNom: 'sousCriteres', propose: true }
        };
    };

    if (typeof window !== 'undefined') window.lectureTexteBrut = T;
    if (typeof module !== 'undefined') module.exports = T;
})();
