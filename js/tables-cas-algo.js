/* ===============================
   MODULE TABLES-CAS-ALGO — Le critère algorithmique, étape 3b : les tables de cas de l'enseignant·e
   Date : 26 octobre 2026 (consigne `plans de travail/CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3b.md`,
   ébauche validée `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`, plan
   `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 3)

   Vocation
     « Si la valeur est…, ce texte » : sous les paliers, l'enseignant·e ajoute des tables. Chacune lit
     UNE valeur de la copie (le compte, l'étendue, la note, la part de la limite, la moyenne, le code le
     plus fréquent) et choisit UN cas ; le texte de ce cas s'ajoute à la phrase du critère, après la
     projection. C'est le geste que Grégoire faisait dans son classeur avec des `SI` imbriqués
     (`MESURE-2026-10-21-critere-algorithmique.md`, l. 58).

   LA DONNÉE — `critere.tablesCas`, absente tant qu'aucune table n'existe
     [{ id, selon, cas: [{ genre, borne?, code?, texte }] }]
       selon ∈ SELONS ; genre ∈ zero | max | audela | vide (valeurs chiffrées), code | aucun (le code).
     Les identifiants ne nomment aucune discipline et ne changent plus une fois écrits. Bornes : 10 tables,
     40 cas par table, 5 000 caractères par texte (comme un palier). Une table illisible (valeur ou genre
     inconnus, borne non numérique, code impossible) est ÉCARTÉE, jamais devinée (`assainir`) ; le partage,
     lui, la refuse (`refusStructure`, comme le barème). Un critère sans table n'a pas le champ.

   LE CHOIX D'UN CAS (`casChoisi`, celui de l'ébauche)
     Une valeur absente choisit « Sans valeur » ; sinon, dans l'ordre : « 0 » si elle vaut 0, la première
     borne qui la contient (inclusive), puis « Au-delà ». Le code : le plus fréquent (`lePlusFrequent`, la
     règle d'égalité du lot 3a), « Aucun code » sans code posé. Les valeurs sont celles que l'écran montre :
     la note sur la pondération (bornée, comme le pourcentage retenu), la part en pourcentage de la limite
     (comme les seuils des paliers), la moyenne arrondie comme {moyenne}.

   Du texte brut partout : l'appelant échappe. Les fonctions de lecture n'écrivent rien ; les gestes
   (`ajouterTable`, `ecrireTexte`…) écrivent sur le critère reçu, et seulement là.
   Dépendances (lues à l'appel, sur `window` ou par `require`) : enoncesAlgo, projectionAlgo, formulesAlgo,
   codesAnnotation.
   =============================== */

(function() {
'use strict';

var _formaterNombre = (typeof formaterNombre === 'function')
    ? formaterNombre : require('./note-pourcentage.js').formaterNombre;
var _formaterPourcentage = (typeof formaterPourcentage === 'function')
    ? formaterPourcentage : require('./note-pourcentage.js').formaterPourcentage;

function _reg(nom, fichier) {
    if (typeof window !== 'undefined' && window[nom]) return window[nom];
    if (typeof require === 'function') {
        try { return require(fichier); } catch (err) { return null; }
    }
    return null;
}
function _E() { return _reg('enoncesAlgo', './evaluation-enonces.js'); }
function _P() { return _reg('projectionAlgo', './evaluation-projection.js'); }
function _F() { return _reg('formulesAlgo', './evaluation-formules.js'); }
function _C() { return _reg('codesAnnotation', './codes-annotation.js'); }

var SELONS = ['erreurs', 'mots', 'note', 'part', 'moyenne', 'code'];
var GENRES_CHIFFRES = ['zero', 'max', 'audela', 'vide'];
var GENRES_CODE = ['code', 'aucun'];
var MAX_TABLES = 10;
var MAX_CAS = 40;
var MAX_TEXTE = 5000;
var ID_VALIDE = /^[A-Za-z0-9_-]{1,40}$/;
var CODE_VALIDE = /^[A-Za-z0-9_-]{1,20}$/;   // la règle d'un code posable (`codes-annotation.js`)
// « + Ajouter un cas » : une borne au-dessus de la dernière, de ce pas (l'ébauche, `pasSelon`).
var PAS = { erreurs: 2, mots: 10, note: 5, part: 25, moyenne: 5 };
var EPSILON = 1e-9;
var NB = ' ';

// Les mots des valeurs et des cas — ceux de l'ébauche validée, au caractère près. Les mots de la carte
// (« Table de cas », « Retirer cette table »…) sont dans `atelierAlgo.TEXTES.tables`.
var TEXTES = {
    selon: {
        erreurs: function(n) { return 'Le compte des ' + n.erreurs.pluriel; },
        mots: function(n) { return 'Le compte des ' + n.mots.pluriel; },
        note: function() { return 'La note du critère'; },
        part: function() { return 'La part de la limite'; },
        moyenne: function(n) { return 'La moyenne de ' + n.mots.pluriel + ' par ' + n.erreurs.singulier; },
        code: function() { return 'Le code le plus fréquent'; }
    },
    cas: {
        jusqua: 'jusqu’à ',
        auDela: 'au-delà de ',
        touteAutre: 'toute autre valeur',
        sansValeur: 'sans valeur',
        code: 'code ',
        aucun: 'aucun code'
    },
    raisons: {
        note: 'aucune note calculable',
        part: 'aucune limite, ou rien à rapporter',
        moyenne: 'la copie ne porte aucune occurrence'
    }
};

function _fmt(n) { return _formaterNombre(n); }
function _texte(x) { return (typeof x === 'string') ? x : ''; }
function _nombre(x) {
    if (typeof x === 'number') return isFinite(x) ? x : null;
    if (typeof x !== 'string') return null;
    var t = x.trim().replace(/\s/g, '').replace(',', '.');
    return /^-?\d*\.?\d+$/.test(t) ? Number(t) : null;
}

/* ---------------------------------------------------------------------
   La lecture : ce qui entre est relu, ce qui ne se lit pas est écarté
   --------------------------------------------------------------------- */

/** Un cas lisible pour cette valeur, assaini (`chaine` : le nettoyeur des textes importés), ou null. */
function _casLisible(c, selon, chaine) {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    var estCode = selon === 'code';
    var genre = c.genre;
    if ((estCode ? GENRES_CODE : GENRES_CHIFFRES).indexOf(genre) === -1) return null;
    if (c.texte !== undefined && typeof c.texte !== 'string') return null;
    var texte = chaine(_texte(c.texte));
    if (texte.length > MAX_TEXTE) texte = texte.slice(0, MAX_TEXTE);
    var propre = { genre: genre };
    if (genre === 'max') {
        if (typeof c.borne !== 'number' || !isFinite(c.borne)) return null;
        propre.borne = c.borne;
    }
    if (genre === 'code') {
        if (typeof c.code !== 'string' || !CODE_VALIDE.test(c.code)) return null;
        propre.code = c.code;
    }
    propre.texte = texte;
    return propre;
}

/** Une table lisible, assainie, ou null (voir l'en-tête). */
function _tableLisible(t, chaine) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) return null;
    if (typeof t.id !== 'string' || !ID_VALIDE.test(t.id)) return null;
    if (SELONS.indexOf(t.selon) === -1) return null;
    if (!Array.isArray(t.cas) || !t.cas.length || t.cas.length > MAX_CAS) return null;
    var cas = [];
    for (var i = 0; i < t.cas.length; i++) {
        var c = _casLisible(t.cas[i], t.selon, chaine);
        if (!c) return null;
        cas.push(c);
    }
    return { id: t.id, selon: t.selon, cas: cas };
}

/**
 * Les tables lisibles d'une valeur brute, dans leur ordre : une table illisible est écartée, un
 * identifiant déjà vu aussi, au-delà de dix rien n'entre. `chaine` (facultatif) : le nettoyeur des
 * textes venus d'ailleurs (l'import passe `assainirChaine`). Rend toujours un tableau.
 */
function assainir(brut, chaine) {
    if (!Array.isArray(brut)) return [];
    var nettoyer = (typeof chaine === 'function') ? function(s) { return String(chaine(s, MAX_TEXTE)); } : function(s) { return s; };
    var vus = {};
    var tables = [];
    brut.forEach(function(t) {
        if (tables.length >= MAX_TABLES) return;
        var propre = _tableLisible(t, nettoyer);
        if (!propre || vus[propre.id]) return;
        vus[propre.id] = true;
        tables.push(propre);
    });
    return tables;
}

/** Les tables d'un critère, relues (`[]` sans le champ). */
function lire(critere) {
    if (!critere || !Array.isArray(critere.tablesCas)) return [];
    return assainir(critere.tablesCas);
}

/** Le critère a-t-il au moins une table ? */
function aDesTables(critere) {
    return lire(critere).length > 0;
}

/**
 * Ce qu'une valeur brute doit être pour entrer par le PARTAGE, où rien ne s'écarte en silence
 * (`partage-validation.js`, comme la structure du barème) : la raison du refus, ou null.
 */
function refusStructure(brut) {
    if (!Array.isArray(brut)) return 'les tables doivent être une liste';
    if (brut.length > MAX_TABLES) return brut.length + ' tables > max ' + MAX_TABLES;
    var vus = {};
    var identite = function(s) { return s; };
    for (var i = 0; i < brut.length; i++) {
        var t = brut[i];
        if (!_tableLisible(t, identite)) return 'table ' + (i + 1) + ' illisible';
        if (t.cas.some(function(c) { return typeof c.texte === 'string' && c.texte.length > MAX_TEXTE; })) {
            return 'table ' + (i + 1) + ' : texte > ' + MAX_TEXTE + ' caractères';
        }
        if (vus[t.id]) return 'identifiant de table en double (' + t.id + ')';
        vus[t.id] = true;
    }
    return null;
}

/* ---------------------------------------------------------------------
   Les codes et les cas
   --------------------------------------------------------------------- */

/** Les codes que le critère offre, dans l'ordre de sa liste : {id, code, nom}. */
function codesDuCritere(critere) {
    var C = _C();
    if (!C || !critere) return [];
    var liste = C.donneSesCodes(critere) ? C.apercuCodes(critere) : C.listeCodes({ criteres: [critere] });
    return liste.map(function(c) { return { id: c.id, code: c.code, nom: c.nom }; });
}

/** Les cas d'une table neuve selon `selon` — ceux de l'ébauche (`casParDefaut`), tous vides. */
function casParDefaut(selon, critere) {
    var c = function(genre, borne) { var x = { genre: genre }; if (borne !== undefined) x.borne = borne; x.texte = ''; return x; };
    switch (selon) {
        case 'erreurs': return [c('zero'), c('max', 2), c('audela')];
        case 'mots': return [c('max', 10), c('audela')];
        case 'note': return [c('vide'), c('zero'), c('max', 10), c('audela')];
        case 'part': return [c('vide'), c('zero'), c('max', 50), c('max', 100), c('audela')];
        case 'moyenne': return [c('vide'), c('max', 5), c('audela')];
        case 'code':
            return codesDuCritere(critere).filter(function(k) { return CODE_VALIDE.test(k.code); })
                .slice(0, MAX_CAS - 1)
                .map(function(k) { return { genre: 'code', code: k.code, texte: '' }; })
                .concat([{ genre: 'aucun', texte: '' }]);
    }
    return [];
}

/** La clé d'un cas : `code:<n>` ou `aucun` pour la table du code, son rang sinon (en chaîne). */
function cleCas(table, i) {
    var c = table.cas[i];
    if (!c) return null;
    if (c.genre === 'code') return 'code:' + c.code;
    if (c.genre === 'aucun') return 'aucun';
    return String(i);
}

/** Le rang du cas de clé `cleDuCas`, ou -1. */
function indexDeCle(table, cleDuCas) {
    for (var i = 0; i < table.cas.length; i++) if (cleCas(table, i) === String(cleDuCas)) return i;
    return -1;
}

/** La dernière borne avant le rang `avant` (toutes, sans lui), ou null. */
function derniereBorne(table, avant) {
    var b = null;
    var fin = (avant === undefined) ? table.cas.length : avant;
    for (var i = 0; i < fin; i++) if (table.cas[i].genre === 'max') b = table.cas[i].borne;
    return b;
}

/**
 * Les rangées d'une table, telles que l'écran les montre : pour le code, une rangée par code de la liste
 * (son texte, s'il est écrit), puis les codes écrits qui n'y sont plus, puis « Aucun code » ; sinon, ses cas.
 * @returns {Array<{cle, genre, borne?, code?, nom?, texte, index}>} `index` : le rang enregistré, ou -1
 */
function rangees(table, critere) {
    if (table.selon !== 'code') {
        return table.cas.map(function(c, i) { return Object.assign({ cle: String(i), index: i }, c); });
    }
    var liste = codesDuCritere(critere).filter(function(k) { return CODE_VALIDE.test(k.code); });
    var vus = {};
    var r = [];
    liste.forEach(function(k) {
        if (vus[k.code]) return;
        vus[k.code] = true;
        var i = indexDeCle(table, 'code:' + k.code);
        r.push({ cle: 'code:' + k.code, genre: 'code', code: k.code, nom: k.nom, texte: i >= 0 ? table.cas[i].texte : '', index: i });
    });
    table.cas.forEach(function(c, i) {
        if (c.genre !== 'code' || vus[c.code]) return;
        vus[c.code] = true;
        r.push({ cle: 'code:' + c.code, genre: 'code', code: c.code, nom: 'Code ' + c.code, texte: c.texte, index: i });
    });
    var a = indexDeCle(table, 'aucun');
    r.push({ cle: 'aucun', genre: 'aucun', texte: a >= 0 ? table.cas[a].texte : '', index: a });
    return r;
}

/** Un texte est-il écrit dans cette table ? */
function aDesTextes(table) {
    return !!table && table.cas.some(function(c) { return String(c.texte || '').trim() !== ''; });
}

/* ---------------------------------------------------------------------
   Les mots
   --------------------------------------------------------------------- */

function _noms(critere) {
    var E = _E();
    return E ? E.noms(critere)
        : { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
}

/** « Le compte des unités manquantes », « La note du critère »… */
function libelleSelon(selon, critere) {
    var f = TEXTES.selon[selon];
    return f ? f(_noms(critere)) : '';
}

/** L'unité qui suit le champ d'une borne : « / 20 » pour la note (la pondération), « % » pour la part, rien sinon. */
function unite(selon, critere) {
    if (selon === 'note') {
        var p = Number(critere && critere.ponderation);
        return (isFinite(p) && p > 0) ? '/' + NB + _fmt(p) : '';
    }
    return selon === 'part' ? '%' : '';
}

/** Une valeur dite dans son unité : « 10 / 20 », « 50 % » (le module des nombres, #1137), « 2 ». */
function _valeurDite(selon, critere, v) {
    if (selon === 'part') return _formaterPourcentage(v);
    var u = (selon === 'note') ? unite(selon, critere) : '';
    return _fmt(v) + (u ? NB + u : '');
}

/** Le cas en mots, en minuscule (« jusqu’à 2 », « au-delà de 50 % », « code 3 »). */
function libelleCas(table, i, critere) {
    var c = table.cas[i];
    if (!c) return '';
    var T = TEXTES.cas;
    var dite = function(v) { return _valeurDite(table.selon, critere, v); };
    switch (c.genre) {
        case 'zero': return dite(0);
        case 'max': return T.jusqua + dite(c.borne);
        case 'audela': {
            var b = derniereBorne(table, i);
            return b === null ? T.touteAutre : T.auDela + dite(b);
        }
        case 'vide': return T.sansValeur;
        case 'code': return T.code + c.code;
        case 'aucun': return T.aucun;
    }
    return '';
}

/** Le nom d'une zone de table, tel que la palette le dit : « Table selon le compte des erreurs, cas jusqu’à 2 ». */
function nomDeZone(critere, tableId, cleDuCas) {
    var t = lire(critere).filter(function(x) { return x.id === tableId; })[0];
    if (!t) return '';
    var r = rangees(t, critere).filter(function(x) { return x.cle === String(cleDuCas); })[0];
    var cas;
    if (r && r.index >= 0) cas = libelleCas(t, r.index, critere);
    else if (r) cas = (r.genre === 'aucun') ? TEXTES.cas.aucun : TEXTES.cas.code + r.code;
    else cas = '';
    return 'Table selon ' + libelleSelon(t.selon, critere).toLowerCase() + (cas ? ', cas ' + cas : '');
}

/* ---------------------------------------------------------------------
   Les valeurs d'une copie, le cas choisi, le texte
   --------------------------------------------------------------------- */

/**
 * Le code le plus fréquent de `poses` (les identifiants posés, dans l'ordre), par la règle du lot 3a : à
 * égalité, le premier de la liste pour un critère NEUF, le premier à atteindre ce nombre sinon. Rend son
 * numéro (`code`), ou null sans code posé.
 */
function codeLePlusFrequent(critere, poses) {
    var C = _C(), P = _P();
    if (!C || !Array.isArray(poses) || !poses.length) return null;
    var codes = codesDuCritere(critere);
    var liste = (P && P.estNeuf(critere)) ? codes.map(function(c) { return c.id; }) : null;
    var r = C.lePlusFrequent(poses, liste);
    if (!r) return null;
    var connu = codes.filter(function(c) { return c.id === r.code; })[0];
    return connu ? connu.code : C.code({ criteres: [critere] }, r.code).code;
}

/** La note d'une copie sur la pondération, bornée comme le pourcentage retenu ; null sans note. */
function noteDeLaCopie(critere, erreursFormule, mots, compte) {
    var F = _F();
    var pond = Number(critere && critere.ponderation);
    if (!F || !(isFinite(pond) && pond > 0)) return null;
    var d = { ponderation: pond, erreurs: erreursFormule, mots: mots || 0 };
    if (compte !== undefined) d.compte = compte;   // étape 4b : le compte brut, que lit un calcul composé
    var r = F.calculer(critere, d);
    return r.applicable ? r.pctBorne * pond / 100 : null;
}

/**
 * Les six valeurs d'une copie. `copie` : {erreurs (le compte brut), erreursFormule, mots, note?, code?,
 * poses?} — `note` et `code` passés par l'évaluation (sa note, les codes posés sur la copie) ; absents,
 * calculés ici (la copie fictive : la formule, et `poses`).
 */
function valeurs(critere, copie) {
    var x = copie || {};
    var n = Number(x.erreurs) || 0;
    var m = _etendue(x.mots);
    var P = _P();
    var proj = P ? P.calculer(critere, { erreurs: n, mots: m || 0 }) : { applicable: false };
    return {
        erreurs: n,
        mots: m,
        note: _nombreOuNull(_noteDe(critere, x, n, m)),
        part: (proj.applicable && typeof proj.ratio === 'number') ? proj.ratio * 100 : null,
        moyenne: (n > 0 && m > 0) ? Math.round(m / n) : null,
        code: _codeDe(critere, x),
        _proj: proj
    };
}

/** L'étendue d'une copie, ou null (champ vide, illisible). */
function _etendue(mots) {
    if (mots === null || mots === undefined || mots === '') return null;
    var m = Number(mots);
    return isFinite(m) ? m : null;
}
function _nombreOuNull(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }

/** La note passée par l'évaluation, sinon celle de la formule (la copie fictive). */
function _noteDe(critere, x, n, m) {
    if (x.note !== undefined) return x.note;
    return noteDeLaCopie(critere, (x.erreursFormule !== undefined) ? x.erreursFormule : n, m, n);
}

/** Le code passé par l'évaluation, sinon le plus fréquent de ses codes posés. */
function _codeDe(critere, x) {
    var code = (x.code !== undefined) ? x.code : codeLePlusFrequent(critere, x.poses);
    return (typeof code === 'string' && code) ? code : null;
}

/** La clé du cas que `v` atteint dans `table`, ou null (aucun cas ne la contient). */
function casChoisi(table, v) {
    var val = v ? v[table.selon] : null;
    if (val === undefined) val = null;
    return table.selon === 'code' ? _casDuCode(table, val) : _casChiffre(table, val);
}

/** Le code : sa rangée, ou « Aucun code » sans code. */
function _casDuCode(table, val) {
    for (var i = 0; i < table.cas.length; i++) {
        var c = table.cas[i];
        if (val === null && c.genre === 'aucun') return 'aucun';
        if (val !== null && c.genre === 'code' && c.code === String(val)) return 'code:' + c.code;
    }
    return null;
}

/** Une valeur chiffrée : « Sans valeur » si elle manque ; sinon « 0 », la première borne qui la contient, « Au-delà ». */
function _casChiffre(table, val) {
    for (var i = 0; i < table.cas.length; i++) {
        if (_contient(table.cas[i], val)) return String(i);
    }
    return null;
}
function _contient(r, val) {
    if (val === null) return r.genre === 'vide';
    switch (r.genre) {
        case 'zero': return val === 0;
        case 'max': return val <= r.borne + EPSILON;
        case 'audela': return true;
    }
    return false;
}

/** Les valeurs des blocs pour le texte d'un cas : celles de la projection (si elle conclut), sinon celles de la copie. */
function _jetons(critere, copie, v) {
    var E = _E();
    var N = _noms(critere);
    var n = v.erreurs, m = v.mots;
    var accorder = function(k, paire) { return E ? E.accorder(k, paire) : (k >= 2 ? paire.pluriel : paire.singulier); };
    var j = {
        erreurs: _fmt(n),
        mots: (m === null) ? '' : _fmt(m),
        nomErreurs: accorder(n, N.erreurs),
        nomMots: accorder(m || 0, N.mots),
        moyenne: (v.moyenne === null) ? '' : String(v.moyenne),
        projection: '',
        palier: '',
        service: '', seuil: '', longueur: '',
        s: n >= 2 ? 's' : '',
        points: E ? E.mentionPonderee(copie.erreurs, (copie.erreursFormule !== undefined) ? copie.erreursFormule : copie.erreurs) : ''
    };
    Object.assign(j, _jetonsDeLaLimite(critere));
    if (v._proj && v._proj.applicable && v._proj.jetons) {
        Object.keys(v._proj.jetons).forEach(function(k) { j[k] = v._proj.jetons[k]; });
    }
    return j;
}

/** Les trois blocs écrits dans la limite (service, tolérance, longueur), quand elle est fixée. */
function _jetonsDeLaLimite(critere) {
    var P = _P();
    var p = P ? P.normaliser(critere) : null;
    if (!p || !p.modele.projette) return {};
    var nb = function(x) { return (x == null) ? '' : _fmt(x); };
    return { service: String(p.params.nomServiceAide || '').trim(), seuil: nb(p.params.erreursTolerees), longueur: nb(p.params.motsReference) };
}

/**
 * Le texte d'un cas, ses blocs remplis — la règle des paliers (`projectionAlgo.remplir`) : un bloc sans
 * valeur part avec l'espace qui le précède. {points} porte son espace de tête (comme dans le décompte).
 */
function remplirTexte(texte, jetons) {
    var t = String(texte || '');
    var pts = jetons.points;
    t = pts ? t.split('{points}').join(pts) : t.replace(/[ \t]?\{points\}/g, '');
    var P = _P();
    return (P ? P.remplir(t, jetons) : t).trim();
}

/**
 * Ce que les tables d'un critère ajoutent pour une copie : un morceau par table dont le cas atteint porte
 * un texte, dans l'ordre des tables. `atteints` : la clé du cas atteint de chaque table (null : aucun).
 * Sans table : rien, et rien n'est calculé.
 * @returns {{morceaux: Array<{tableId, cle, libelle, texte}>, atteints: Object, texte: string}}
 */
function appliquer(critere, copie) {
    var tables = lire(critere);
    var r = { morceaux: [], atteints: {}, texte: '' };
    if (!tables.length) return r;
    var x = copie || {};
    var v = valeurs(critere, x);
    var j = null;
    tables.forEach(function(t) {
        var cleDuCas = casChoisi(t, v);
        r.atteints[t.id] = cleDuCas;
        if (cleDuCas === null) return;
        var i = indexDeCle(t, cleDuCas);
        var cas = t.cas[i];
        if (!cas || !String(cas.texte || '').trim()) return;
        var tx = remplirTexte(cas.texte, j || (j = _jetons(critere, x, v)));
        if (tx) r.morceaux.push({ tableId: t.id, cle: cleDuCas, libelle: libelleCas(t, i, critere), texte: tx });
    });
    r.texte = r.morceaux.map(function(m) { return m.texte; }).join(' ');
    return r;
}

/** Le texte que les tables ajoutent à la phrase du critère ('' sans table, ou sans texte atteint). */
function texteDesTables(critere, copie) {
    return appliquer(critere, copie).texte;
}

/** La phrase du critère suivie du texte des tables : sans texte des tables, la phrase telle quelle, à l'octet. */
function ajouterALaPhrase(phrase, critere, copie) {
    var t = texteDesTables(critere, copie);
    if (!t) return phrase;
    return phrase ? phrase + ' ' + t : t;
}

/* ---------------------------------------------------------------------
   Les gestes — sur le critère reçu ; `false` : refusé, rien n'est écrit
   --------------------------------------------------------------------- */

function _ecrire(critere, tables) {
    if (tables.length) critere.tablesCas = tables;
    else delete critere.tablesCas;
}
function _table(tables, id) {
    for (var i = 0; i < tables.length; i++) if (tables[i].id === id) return tables[i];
    return null;
}
function _idNeuf(tables) {
    var max = 0;
    tables.forEach(function(t) { var m = /^t(\d+)$/.exec(t.id); if (m) max = Math.max(max, Number(m[1])); });
    return 't' + (max + 1);
}

/** « + Ajouter une table de cas » : selon « Le compte des … » (la valeur que tout critère possède), vide. Rend son id. */
function ajouterTable(critere) {
    if (!critere) return false;
    var tables = lire(critere);
    if (tables.length >= MAX_TABLES) return false;
    var t = { id: _idNeuf(tables), selon: 'erreurs', cas: casParDefaut('erreurs', critere) };
    tables.push(t);
    _ecrire(critere, tables);
    return t.id;
}

function retirerTable(critere, id) {
    var tables = lire(critere);
    var avant = tables.length;
    tables = tables.filter(function(t) { return t.id !== id; });
    if (tables.length === avant) return false;
    _ecrire(critere, tables);
    return true;
}

/** Changer de valeur remplace les cas par ceux de la nouvelle. « La part » sans limite fixée : refusé. */
function changerSelon(critere, id, selon) {
    if (SELONS.indexOf(selon) === -1) return false;
    var P = _P();
    if (selon === 'part' && !(P && P.limiteFixee(critere))) return false;
    var tables = lire(critere);
    var t = _table(tables, id);
    if (!t || t.selon === selon) return false;
    var cas = casParDefaut(selon, critere);
    if (!cas.length) return false;
    t.selon = selon;
    t.cas = cas;
    _ecrire(critere, tables);
    return true;
}

/** « + Ajouter un cas » : une borne au-dessus de la dernière, avant « Au-delà ». Pas pour le code. */
function ajouterCas(critere, id) {
    var tables = lire(critere);
    var t = _table(tables, id);
    if (!t || t.selon === 'code' || t.cas.length >= MAX_CAS) return false;
    var pos = -1;
    t.cas.forEach(function(c, i) { if (pos < 0 && c.genre === 'audela') pos = i; });
    if (pos < 0) pos = t.cas.length;
    var b = derniereBorne(t);
    t.cas.splice(pos, 0, { genre: 'max', borne: (b === null ? 0 : b) + (PAS[t.selon] || 1), texte: '' });
    _ecrire(critere, tables);
    return true;
}

/** « Retirer ce cas » : seulement une borne. */
function retirerCas(critere, id, cleDuCas) {
    var tables = lire(critere);
    var t = _table(tables, id);
    var i = t ? indexDeCle(t, cleDuCas) : -1;
    if (i < 0 || t.cas[i].genre !== 'max') return false;
    t.cas.splice(i, 1);
    _ecrire(critere, tables);
    return true;
}

/** La borne d'un cas (virgule ou point) ; illisible ou sous 0 : refusé. */
function ecrireBorne(critere, id, cleDuCas, saisie) {
    var b = _nombre(saisie);
    if (b === null || b < 0) return false;
    var tables = lire(critere);
    var t = _table(tables, id);
    var i = t ? indexDeCle(t, cleDuCas) : -1;
    if (i < 0 || t.cas[i].genre !== 'max') return false;
    t.cas[i].borne = b;
    _ecrire(critere, tables);
    return true;
}

/**
 * Le texte d'un cas (5 000 caractères au plus). Un code de la liste sans rangée enregistrée (un code ajouté
 * après la table) reçoit la sienne, à sa place dans la liste.
 */
function ecrireTexte(critere, id, cleDuCas, texte) {
    var tables = lire(critere);
    var t = _table(tables, id);
    if (!t) return false;
    var propre = String(texte == null ? '' : texte).slice(0, MAX_TEXTE);
    var i = indexDeCle(t, cleDuCas);
    if (i < 0) {
        var m = /^code:(.+)$/.exec(String(cleDuCas));
        if (t.selon !== 'code' || !m || !CODE_VALIDE.test(m[1]) || t.cas.length >= MAX_CAS) return false;
        var ordre = codesDuCritere(critere).map(function(k) { return k.code; });
        var rang = ordre.indexOf(m[1]);
        if (rang < 0) return false;
        var pos = t.cas.length;
        for (var k = 0; k < t.cas.length; k++) {
            var c = t.cas[k];
            if (c.genre === 'aucun' || (c.genre === 'code' && ordre.indexOf(c.code) > rang)) { pos = k; break; }
        }
        t.cas.splice(pos, 0, { genre: 'code', code: m[1], texte: propre });
    } else {
        t.cas[i].texte = propre;
    }
    _ecrire(critere, tables);
    return true;
}

var api = {
    TEXTES: TEXTES,
    SELONS: SELONS,
    MAX_TABLES: MAX_TABLES,
    MAX_CAS: MAX_CAS,
    MAX_TEXTE: MAX_TEXTE,
    PAS: PAS,
    assainir: assainir,
    lire: lire,
    aDesTables: aDesTables,
    refusStructure: refusStructure,
    codesDuCritere: codesDuCritere,
    casParDefaut: casParDefaut,
    cleCas: cleCas,
    indexDeCle: indexDeCle,
    derniereBorne: derniereBorne,
    rangees: rangees,
    aDesTextes: aDesTextes,
    libelleSelon: libelleSelon,
    unite: unite,
    libelleCas: libelleCas,
    nomDeZone: nomDeZone,
    codeLePlusFrequent: codeLePlusFrequent,
    noteDeLaCopie: noteDeLaCopie,
    valeurs: valeurs,
    casChoisi: casChoisi,
    remplirTexte: remplirTexte,
    appliquer: appliquer,
    texteDesTables: texteDesTables,
    ajouterALaPhrase: ajouterALaPhrase,
    ajouterTable: ajouterTable,
    retirerTable: retirerTable,
    changerSelon: changerSelon,
    ajouterCas: ajouterCas,
    retirerCas: retirerCas,
    ecrireBorne: ecrireBorne,
    ecrireTexte: ecrireTexte
};

if (typeof window !== 'undefined') window.tablesCasAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
