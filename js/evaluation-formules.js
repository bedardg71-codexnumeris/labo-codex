/* ===============================
   MODULE EVALUATION-FORMULES — Registre des calculs de la note d'un critère algorithmique

   RAISON D'ÊTRE (#667, 2026-08-31)
   La formule d'un critère algorithmique était écrite en dur en QUATRE endroits
   de calcul indépendants et RÉÉCRITE À LA MAIN en trois endroits d'affichage.
   Sept lieux de vérité pour une seule règle : rien n'empêchait le texte affiché
   de mentir sur le calcul réellement appliqué. Ce module est désormais le SEUL.

   ↻ ÉTAPE 4a DU CRITÈRE ALGORITHMIQUE (27 oct. 2026, consigne
   `plans de travail/CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4a.md`) : #667 poussé
   d'un cran. Chaque calcul tout fait S'ÉCRIT EN BLOCS (ses `jetons`) ; la note, la ligne de
   pastilles du gabarit et la ligne chiffrée de l'évaluation en sortent toutes. Il n'y a plus de
   corps `calculer` écrit à la main par modèle : un seul évaluateur, pur, lit les jetons. Les
   anciens corps ne survivent que comme référence dans le banc d'équivalence
   (`tests/unit/calculs-4a-equivalence.test.js`). Les noms et les textes sont ceux que Grégoire a
   validés le 26 oct. (`TEXTES-2026-10-26-calculs-tout-faits.md`) ; les identifiants enregistrés
   (`penalite_normalisee`, `ratio_cible`, `penalite_par_erreur`, et leurs paramètres) ne changent pas.

   CE QUI EST À L'UTILISATEUR, CE QUI EST AU CODE
   L'enseignant·e choisit un calcul dans le gabarit, en fixe le réglage, et dit ce que vaut la
   note quand une donnée de la copie vaut 0 (`critere.casZero`). Le code fournit les calculs et
   les exécute. Aucune expression n'est interprétée : pas d'eval, pas de new Function (CSP) —
   l'évaluateur ne connaît que des jetons typés et quatre opérations.

   LES JETONS
     {t:'d', k}  une donnée de la copie : 'ponderation', 'compte', 'comptePondere', 'etendue'
     {t:'p', k}  un réglage écrit dans la grille (la clé d'un paramètre du modèle)
     {t:'n', v}  un nombre
     {t:'o', v}  une opération : '+', '−', '×', '÷'
     {t:'('} / {t:')'}
   Les identifiants de données ne nomment aucune discipline : ce que l'enseignant·e lit vient de
   ses deux noms (`enoncesAlgo.noms`). `comptePondere` est ce que `calculer` reçoit sous le nom
   `erreurs` (la somme pondérée des codes posés, ou le nombre tapé) ; `etendue`, ce qu'il reçoit
   sous `mots` ; `compte`, le compte brut, déclaré pour l'étape 4b et lu par aucun des trois.

   MODÈLE DE DONNÉES SUR LE CRITÈRE
     critere.modeleFormule  : string — identifiant du modèle (SSOT)
     critere.paramsFormule  : objet  — paramètres du modèle (SSOT)
     critere.casZero        : objet  — absent tant que l'enseignant·e garde les choix de départ.
       { <modèle>: { <donnée>: 'calcul' | 'aucune' | 'entiere' | 'zero' } }, une entrée seulement
       là où le choix diffère du départ. Les départs sont le comportement d'avant le lot.
     critere.facteurNormalisation : number — MIROIR DE COMPATIBILITÉ, écrit en
       dérivé pour le seul modèle « penalite_normalisee ». Jamais lu quand
       paramsFormule existe. Sentinelle : tests/unit/sentinelle-650-formule-*.

   MIGRATION À LA LECTURE (aucune écriture de masse)
   Un critère d'avant #667 n'a ni modeleFormule ni paramsFormule. `normaliser`
   le lit comme « penalite_normalisee » avec le facteur trouvé sur le critère.

   ATTENTION — ne pas confondre avec `critere.formule` (chaîne décorative
   héritée, qui n'entre dans AUCUN calcul).

   Aucune dépendance obligatoire : ni DOM, ni db, ni evaluationEnCours. Testable en Node. Les
   noms de l'enseignant·e se lisent à l'appel dans `enoncesAlgo` (repli : « erreur » / « mot »).
   =============================== */

(function() {
'use strict';

// #1137 (22 oct. 2026) : les nombres affichés passent par js/note-pourcentage.js, que index.html
// charge avant ce module ; un banc Node (`require`) le requiert.
var _formaterNombre = (typeof window !== 'undefined' && typeof window.formaterNombre === 'function')
    ? window.formaterNombre : require('./note-pourcentage.js').formaterNombre;

// ---------------------------------------------------------------------
// Bornes communes à tous les calculs
// ---------------------------------------------------------------------
// Le pourcentage d'un critère algorithmique est borné à [0, 100] depuis l'origine : c'est
// l'échelle qui l'impose, puisque le niveau se lit dans un intervalle de pourcentage.
var PCT_MIN = 0;
var PCT_MAX = 100;

/** Formate un nombre pour le libellé (pas de décimale inutile ; le moins typographique). */
function _nb(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) return '?';
    return (_formaterNombre(valeur) || '?').replace('-', '−');   // #1137 : à la virgule, deux décimales au plus
}

/** Les deux noms de l'enseignant·e (`enoncesAlgo.noms`), lus à l'appel ; repli : « erreur » et « mot ». */
function _noms(critere) {
    var E = (typeof window !== 'undefined' && window.enoncesAlgo) ? window.enoncesAlgo : null;
    if (!E && typeof require === 'function') {
        try { E = require('./evaluation-enonces.js'); } catch (e) { E = null; }
    }
    if (E && typeof E.noms === 'function') return E.noms(critere);
    return { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
}

// ---------------------------------------------------------------------
// LES CALCULS TOUT FAITS
// ---------------------------------------------------------------------
// Chaque modèle déclare :
//   id           identifiant stable, écrit dans les données
//   nom, court   le nom de la carte, et celui de la chaîne d'étapes
//   texte        ce que veut dire le calcul (validé par Grégoire le 26 oct. à 20 h 53)
//   parametres   [{cle, libelle(N), bloc(N), defaut, min, max}] — le réglage, saisi dans le gabarit ;
//                `libelle` est l'étiquette du champ, `bloc` le nom de sa pastille
//   jetons       le calcul, en blocs
//   cas          les départs de « Quand une donnée de la copie vaut 0 » : le comportement d'avant
//
// Les valeurs `defaut` sont des DÉFAUTS DÉCLARÉS, visibles et modifiables dans le gabarit.

var MODELES = [
    {
        id: 'penalite_normalisee',
        nom: 'Pénalité proportionnelle à la longueur',
        court: 'pénalité proportionnelle',
        texte: 'Chaque occurrence retire des points en proportion de la longueur de la copie : le même nombre d’occurrences coûte moins sur une copie plus longue. Tu fixes la longueur sur laquelle une occurrence coûte un point.',
        parametres: [{
            cle: 'facteurNormalisation',
            libelle: function(N) { return 'Longueur sur laquelle une occurrence coûte un point (' + N.mots.pluriel + ')'; },
            bloc: function() { return 'Longueur fixée'; },
            defaut: 500, min: 1, max: 10000
        }],
        jetons: [{ t: 'd', k: 'ponderation' }, { t: 'o', v: '−' }, { t: 'd', k: 'comptePondere' }, { t: 'o', v: '÷' },
            { t: 'd', k: 'etendue' }, { t: 'o', v: '×' }, { t: 'p', k: 'facteurNormalisation' }],
        cas: { etendue: 'aucune', comptePondere: 'calcul' }
    },
    {
        id: 'ratio_cible',
        nom: 'Rapport visé',
        court: 'rapport visé',
        texte: 'Tu fixes le rapport qui donne la note entière, par exemple une occurrence à chaque 60 mots. Une copie qui l’atteint a la note entière ; en deçà, la note baisse en proportion. Une copie sans occurrence a la note entière.',
        parametres: [{
            cle: 'motsParErreurCible',
            libelle: function(N) { return 'Rapport qui donne la note entière : 1 ' + N.erreurs.singulier + ' à chaque … ' + N.mots.pluriel; },
            bloc: function() { return 'Rapport visé'; },
            defaut: 60, min: 1, max: 10000
        }],
        jetons: [{ t: 'd', k: 'ponderation' }, { t: 'o', v: '×' }, { t: '(' }, { t: 'd', k: 'etendue' }, { t: 'o', v: '÷' },
            { t: 'd', k: 'comptePondere' }, { t: ')' }, { t: 'o', v: '÷' }, { t: 'p', k: 'motsParErreurCible' }],
        cas: { etendue: 'aucune', comptePondere: 'entiere' }
    },
    {
        id: 'penalite_par_erreur',
        nom: 'Pénalité fixe',
        court: 'pénalité fixe',
        texte: 'Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la copie. La longueur reste comptée pour les phrases de l’étudiant·e, mais n’entre pas dans la note.',
        parametres: [{
            cle: 'pointsParErreur',
            libelle: function(N) { return 'Points retirés par ' + N.erreurs.singulier; },
            bloc: function(N) { return 'Points par ' + N.erreurs.singulier; },
            defaut: 1, min: 0, max: 100
        }],
        jetons: [{ t: 'd', k: 'ponderation' }, { t: 'o', v: '−' }, { t: 'd', k: 'comptePondere' }, { t: 'o', v: '×' },
            { t: 'p', k: 'pointsParErreur' }],
        cas: { comptePondere: 'calcul' }
    }
];

var MODELE_PAR_DEFAUT = 'penalite_normalisee';

/** Les données qu'un calcul peut lire, et l'ordre où l'on examine celles qui valent 0. */
var DONNEES = ['ponderation', 'compte', 'comptePondere', 'etendue'];
var ORDRE_CAS = ['etendue', 'compte', 'comptePondere'];
var CHOIX_CAS = ['calcul', 'aucune', 'entiere', 'zero'];
/** Les choix du menu « Si [donnée] vaut 0 » (ceux de l'ébauche ; « aucune » s'y dit avec la donnée). */
var ISSUES = { calcul: 'Calculer normalement', aucune: 'Aucune note : l’évaluation attend cette donnée', entiere: 'La note entière', zero: 'Une note de 0' };

// ---------------------------------------------------------------------
// L'ÉVALUATEUR — pur, sans expression interprétée
// ---------------------------------------------------------------------

var PRIORITE = { '+': 1, '−': 1, '×': 2, '÷': 2 };

/**
 * Évalue des jetons (priorités usuelles, parenthèses). L'algorithme de `evaluer` de l'ébauche
 * validée : les jetons passent en notation postfixée (aiguillage), puis se calculent sur une pile
 * qui retient de quelles données dépend chaque valeur — pour dire QUELLE donnée divise par 0.
 *
 * @param {Array} jetons
 * @param {{donnees: object, params: object}} ctx
 * @returns {{v: number}|{erreur: string}|{divZero: string[]}} `divZero` : les données dont
 *          dépend le diviseur nul, ou ['nombre'] quand il n'en dépend d'aucune
 */
function evaluer(jetons, ctx) {
    if (!Array.isArray(jetons) || !jetons.length) return { erreur: 'vide' };
    var postfixe = _enPostfixe(jetons);
    return postfixe.erreur ? postfixe : _calculerPostfixe(postfixe.sortie, ctx);
}

/** L'aiguillage : les jetons en notation postfixée, ou l'erreur de forme ({sortie} | {erreur}). */
function _enPostfixe(jetons) {
    var etat = { sortie: [], pile: [], attend: true };
    for (var i = 0; i < jetons.length; i++) {
        var erreur = _aiguiller(jetons[i] || {}, etat);
        if (erreur) return { erreur: erreur };
    }
    if (etat.attend) return { erreur: 'incomplet' };
    while (etat.pile.length) {
        var y = etat.pile.pop();
        if (y.t === '(') return { erreur: 'parentheses' };
        etat.sortie.push(y);
    }
    return { sortie: etat.sortie };
}

/** Un jeton passé à l'aiguillage ; rend l'erreur de forme, ou ''. `e.attend` : on attend une donnée, un nombre ou « ( ». */
function _aiguiller(j, e) {
    if (j.t === 'd' || j.t === 'p' || j.t === 'n') {
        if (!e.attend) return 'operation';
        e.sortie.push(j); e.attend = false;
        return '';
    }
    if (j.t === 'o') return _aiguillerOperation(j, e);
    if (j.t === '(') {
        if (!e.attend) return 'operation';
        e.pile.push(j);
        return '';
    }
    return j.t === ')' ? _fermerParenthese(e) : 'jeton';
}

function _aiguillerOperation(j, e) {
    if (!PRIORITE[j.v]) return 'jeton';
    if (e.attend) return 'operation';
    var p = e.pile;
    while (p.length && p[p.length - 1].t === 'o' && PRIORITE[p[p.length - 1].v] >= PRIORITE[j.v]) e.sortie.push(p.pop());
    p.push(j); e.attend = true;
    return '';
}

function _fermerParenthese(e) {
    if (e.attend) return 'incomplet';
    while (e.pile.length) {
        var x = e.pile.pop();
        if (x.t === '(') return '';
        e.sortie.push(x);
    }
    return 'parentheses';
}

/** Le calcul sur une pile, qui retient de quelles données dépend chaque valeur (pour nommer un diviseur nul). */
function _calculerPostfixe(sortie, ctx) {
    var donnees = (ctx && ctx.donnees) || {}, params = (ctx && ctx.params) || {};
    var st = [];
    for (var k = 0; k < sortie.length; k++) {
        var s = sortie[k];
        if (s.t !== 'o') {
            var x = _operande(s, donnees, params);
            if (!x) return { erreur: 'jeton' };
            st.push(x);
            continue;
        }
        var b = st.pop(), a = st.pop();
        if (!a || !b) return { erreur: 'incomplet' };
        if (s.v === '÷' && b.v === 0) return { divZero: b.deps.length ? b.deps : ['nombre'] };
        st.push({ v: _operer(s.v, a.v, b.v), deps: a.deps.concat(b.deps) });
    }
    if (st.length !== 1 || !isFinite(st[0].v)) return { erreur: 'incomplet' };
    return { v: st[0].v };
}

/** La valeur d'une donnée, d'un réglage ou d'un nombre, et les données dont elle dépend ; null : donnée inconnue. */
function _operande(s, donnees, params) {
    if (s.t === 'd') return DONNEES.indexOf(s.k) < 0 ? null : { v: Number(donnees[s.k]), deps: s.k === 'ponderation' ? [] : [s.k] };
    return { v: Number(s.t === 'p' ? params[s.k] : s.v), deps: [] };
}

function _operer(op, a, b) {
    if (op === '+') return a + b;
    if (op === '−') return a - b;
    return op === '×' ? a * b : a / b;
}

/** Les données de la copie qu'un calcul lit (hors pondération), dans l'ordre d'examen. */
function donneesDuCalcul(jetons) {
    var vus = {};
    (jetons || []).forEach(function(j) { if (j && j.t === 'd' && j.k !== 'ponderation') vus[j.k] = true; });
    return ORDRE_CAS.filter(function(k) { return vus[k]; });
}

/** Les données par lesquelles un calcul divise : directement, ou dans une parenthèse qui suit « ÷ ». */
function diviseurs(jetons) {
    var r = {};
    jetons = jetons || [];
    for (var i = 0; i < jetons.length; i++) {
        if (!jetons[i] || jetons[i].t !== 'o' || jetons[i].v !== '÷') continue;
        var s = jetons[i + 1];
        if (!s) continue;
        if (s.t === 'd') { r[s.k] = true; continue; }
        if (s.t !== '(') continue;
        var prof = 0;
        for (var j = i + 1; j < jetons.length; j++) {
            if (jetons[j].t === '(') prof++;
            else if (jetons[j].t === ')') { prof--; if (!prof) break; }
            else if (jetons[j].t === 'd' && jetons[j].k !== 'ponderation') r[jetons[j].k] = true;
        }
    }
    return r;
}

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------

function _copieJetons(jetons) { return jetons.map(function(j) { return Object.assign({}, j); }); }

/** Liste des calculs tout faits, pour les cartes du gabarit. */
function listerModeles() {
    return MODELES.map(function(m) {
        return {
            id: m.id,
            nom: m.nom,
            court: m.court,
            texte: m.texte,
            parametres: m.parametres.map(function(p) { return Object.assign({}, p); }),
            jetons: _copieJetons(m.jetons),
            cas: Object.assign({}, m.cas)
        };
    });
}

/** Le modèle demandé, ou null. Jamais de repli silencieux ici. */
function obtenirModele(modeleId) {
    for (var i = 0; i < MODELES.length; i++) {
        if (MODELES[i].id === modeleId) return MODELES[i];
    }
    return null;
}

/** Un paramètre ramené dans ses bornes ; vide ou illisible : son défaut. */
function _valeurParam(p, brut) {
    var valeur = (brut === undefined || brut === null || brut === '') ? p.defaut : Number(brut);
    if (isNaN(valeur)) valeur = p.defaut;
    if (p.min !== undefined && valeur < p.min) valeur = p.min;
    if (p.max !== undefined && valeur > p.max) valeur = p.max;
    return valeur;
}

/**
 * Lit la formule d'un critère, en migrant à la lecture les critères d'avant
 * #667. Retourne toujours un modèle exploitable et des paramètres complets.
 *
 * @returns {{modeleId, modele, params, herite}} `herite` dit si la valeur a été
 *          reconstituée faute de champ `modeleFormule` — l'appelant peut le
 *          signaler sans avoir à redeviner.
 */
function normaliser(critere) {
    critere = critere || {};
    var declare = typeof critere.modeleFormule === 'string' ? critere.modeleFormule.trim() : '';
    var modele = declare ? obtenirModele(declare) : null;
    var herite = false;

    if (!modele) {
        // Soit le critère est d'avant #667, soit il porte un identifiant de
        // modèle inconnu (grille importée d'une version plus récente). Dans les
        // deux cas on retombe sur le modèle historique — et on le DIT.
        modele = obtenirModele(MODELE_PAR_DEFAUT);
        herite = true;
    }

    var params = {};
    var source = (critere.paramsFormule && typeof critere.paramsFormule === 'object')
        ? critere.paramsFormule : {};

    modele.parametres.forEach(function(p) {
        var brut = source[p.cle];

        // Compatibilité : avant #667, le seul paramètre existant vivait
        // directement sur le critère sous le nom `facteurNormalisation`.
        if ((brut === undefined || brut === null || brut === '')
            && p.cle === 'facteurNormalisation'
            && critere.facteurNormalisation !== undefined
            && critere.facteurNormalisation !== null
            && critere.facteurNormalisation !== '') {
            brut = critere.facteurNormalisation;
        }
        params[p.cle] = _valeurParam(p, brut);
    });

    return { modeleId: modele.id, modele: modele, params: params, herite: herite };
}

/**
 * Un choix « vaut 0 » est-il lisible pour ce modèle et cette donnée ? La donnée doit être lue
 * par le calcul ; « Calculer normalement » est écarté pour une donnée par laquelle on divise.
 */
function _choixLisible(modele, donnee, choix) {
    if (!modele || CHOIX_CAS.indexOf(choix) < 0) return false;
    if (donneesDuCalcul(modele.jetons).indexOf(donnee) < 0) return false;
    return !(choix === 'calcul' && diviseurs(modele.jetons)[donnee]);
}

/**
 * Ce que vaut la note quand une donnée vaut 0, pour le calcul du critère : les départs du
 * modèle, recouverts par les choix LISIBLES de `critere.casZero` ; un choix illisible est
 * écarté (on revient au départ), jamais deviné.
 */
function casDuCritere(critere, modeleId) {
    var modele = obtenirModele(modeleId) || normaliser(critere).modele;
    var r = Object.assign({}, modele.cas);
    var brut = critere && critere.casZero && typeof critere.casZero === 'object' ? critere.casZero[modele.id] : null;
    if (brut && typeof brut === 'object') {
        Object.keys(brut).forEach(function(d) {
            if (_choixLisible(modele, d, brut[d])) r[d] = brut[d];
        });
    }
    return r;
}

/**
 * `casZero` tel qu'il voyage (import, partage) : rend la forme assainie — seulement les entrées
 * lisibles et différentes du départ —, `undefined` quand il n'en reste aucune, et `null` quand la
 * structure n'est pas un objet (le partage la refuse, comme `tablesCas`).
 */
function assainirCasZero(brut) {
    if (brut === undefined) return undefined;
    if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return null;
    var r = {}, vide = true;
    Object.keys(brut).forEach(function(id) {
        var modele = obtenirModele(id), entree = brut[id];
        if (!modele || !entree || typeof entree !== 'object' || Array.isArray(entree)) return;
        Object.keys(entree).forEach(function(d) {
            var choix = entree[d];
            if (!_choixLisible(modele, d, choix) || modele.cas[d] === choix) return;
            (r[id] = r[id] || {})[d] = choix;
            vide = false;
        });
    });
    return vide ? undefined : r;
}

/**
 * La règle du PARTAGE (comme `tablesCasAlgo.refusStructure`) : '' quand `casZero` est absent ou
 * entièrement lisible ; sinon la raison du refus. Le paquet est refusé, rien n'est deviné.
 */
function refusCasZero(brut) {
    if (brut === undefined) return '';
    if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return 'structure illisible';
    var ids = Object.keys(brut);
    for (var i = 0; i < ids.length; i++) {
        var modele = obtenirModele(ids[i]), entree = brut[ids[i]];
        if (!modele) return 'calcul inconnu';
        if (!entree || typeof entree !== 'object' || Array.isArray(entree)) return 'structure illisible';
        var ds = Object.keys(entree);
        for (var j = 0; j < ds.length; j++) {
            if (!_choixLisible(modele, ds[j], entree[ds[j]])) return 'choix illisible pour ' + ds[j];
        }
    }
    return '';
}

/** Les données de l'appelant, sous les noms des jetons. `erreurs` → comptePondere, `mots` → etendue. */
function _donnees(donnees) {
    var cp = Number(donnees && donnees.erreurs) || 0;
    var compte = (donnees && donnees.compte !== undefined) ? (Number(donnees.compte) || 0) : cp;
    return {
        ponderation: Number(donnees && donnees.ponderation),
        compte: compte,
        comptePondere: cp,
        etendue: Number(donnees && donnees.mots) || 0
    };
}

/**
 * Ce que dit « Quand une donnée vaut 0 » pour cette copie, dans l'ordre d'examen : {attend} (aucune note),
 * {note, cas, issue} (la note entière ou 0), ou null (le calcul se fait). Une donnée vaut 0 quand elle
 * n'est pas positive.
 */
function _issueDeLaCopie(f, critere, d, ponderation) {
    var cas = casDuCritere(critere, f.modeleId), lues = donneesDuCalcul(f.modele.jetons);
    for (var i = 0; i < lues.length; i++) {
        var k = lues[i], issue = cas[k] || 'calcul';
        if (d[k] > 0 || issue === 'calcul') continue;
        if (issue === 'aucune') return { attend: k };
        return { note: issue === 'entiere' ? ponderation : 0, cas: k, issue: issue };
    }
    return null;
}

/**
 * Calcule la note d'un critère algorithmique.
 *
 * Une donnée « vaut 0 » quand elle n'est pas positive (un compte négatif n'a pas de sens : il se
 * lit comme 0, ce que faisaient les calculs d'avant). La note s'arrête à la pondération ; sous 0,
 * la note brute reste ce que le calcul rend — comme avant le lot, c'est le pourcentage retenu
 * (`pctBorne`) qui ne descend pas sous 0.
 *
 * @param {object} critere - le critère de grille (porte le modèle, ses params et `casZero`)
 * @param {object} donnees - {ponderation, erreurs (le compte pondéré), mots (l'étendue), compte?}
 * @returns {{applicable, raison, attend?, cas?, issue?, note, brut, pourcentage, pctBorne, modeleId, params}}
 *          `applicable: false` quand la saisie ne permet pas de conclure — le code ne devine pas
 *          une note, il dit qu'il ne peut pas (`attend` : la donnée que l'évaluation attend).
 */
function calculer(critere, donnees) {
    var f = normaliser(critere);
    var d = _donnees(donnees);
    var ponderation = d.ponderation;
    var base = { modeleId: f.modeleId, params: f.params };

    if (!ponderation || isNaN(ponderation) || ponderation <= 0) {
        return Object.assign({ applicable: false, raison: 'ponderation-absente' }, base);
    }

    var issue = _issueDeLaCopie(f, critere, d, ponderation);
    if (issue && issue.attend) {
        return Object.assign({ applicable: false, raison: issue.attend === 'etendue' ? 'mots-absents' : 'donnee-absente', attend: issue.attend }, base);
    }
    var note, brut, extra = {};
    if (issue) {
        note = brut = issue.note;
        extra = { cas: issue.cas, issue: issue.issue };
    } else {
        var r = evaluer(f.modele.jetons, { donnees: d, params: f.params });
        if (r.divZero) return Object.assign({ applicable: false, raison: 'division-par-zero', attend: r.divZero[0] }, base);
        if (r.erreur) return Object.assign({ applicable: false, raison: 'calcul-illisible' }, base);
        brut = r.v;
        note = Math.min(brut, ponderation);
    }

    var pourcentage = (note / ponderation) * 100;
    var pctBorne = Math.max(PCT_MIN, Math.min(PCT_MAX, pourcentage));

    return Object.assign({
        applicable: true,
        raison: '',
        note: note,
        brut: brut,
        pourcentage: pourcentage,
        pctBorne: pctBorne
    }, extra, base);
}

// ---------------------------------------------------------------------
// CE QU'ON LIT — engendré des jetons, aux noms de l'enseignant·e
// ---------------------------------------------------------------------

/** Le nom d'une donnée : « Compte pondéré des unités manquantes ». */
function nomDonnee(k, critere) {
    var N = _noms(critere);
    return {
        ponderation: 'Pondération du critère',
        compte: 'Compte des ' + N.erreurs.pluriel,
        comptePondere: 'Compte pondéré des ' + N.erreurs.pluriel,
        etendue: 'Compte des ' + N.mots.pluriel
    }[k] || k;
}

/** Avec son article : « le compte des calculs », « la pondération du critère ». */
function leDonnee(k, critere) {
    var n = nomDonnee(k, critere);
    return (k === 'ponderation' ? 'la ' : 'le ') + n.charAt(0).toLowerCase() + n.slice(1);
}

function _maj(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function _param(modele, clef) {
    for (var i = 0; i < modele.parametres.length; i++) if (modele.parametres[i].cle === clef) return modele.parametres[i];
    return null;
}

/**
 * Le calcul du critère, en blocs : une pastille par jeton, pour le gabarit. Du texte brut, que
 * l'appelant échappe. `genre` : 'donnee' (une donnée de la copie), 'pose' (la pondération, un
 * réglage), 'nombre', 'operation'.
 * @returns {Array<{genre, texte, jeton}>}
 */
function blocs(critere) {
    var f = normaliser(critere), N = _noms(critere);
    return f.modele.jetons.map(function(j) {
        if (j.t === 'd') return { genre: j.k === 'ponderation' ? 'pose' : 'donnee', texte: nomDonnee(j.k, critere), jeton: Object.assign({}, j) };
        if (j.t === 'p') {
            var p = _param(f.modele, j.k);
            return { genre: 'pose', texte: (p ? p.bloc(N) : j.k) + ' (' + _nb(f.params[j.k]) + ')', jeton: Object.assign({}, j) };
        }
        if (j.t === 'n') return { genre: 'nombre', texte: _nb(j.v), jeton: Object.assign({}, j) };
        return { genre: 'operation', texte: j.t === 'o' ? j.v : j.t, jeton: Object.assign({}, j) };
    });
}

/** Le calcul en chiffres : « 20 − 3 × 2 », « 20 × (600 ÷ 12) ÷ 60 ». */
function enChiffres(critere, donnees) {
    var f = normaliser(critere), d = _donnees(donnees);
    return f.modele.jetons.map(function(j) {
        if (j.t === 'd') return _nb(d[j.k]);
        if (j.t === 'p') return _nb(f.params[j.k]);
        if (j.t === 'n') return _nb(j.v);
        return j.t === 'o' ? j.v : j.t;
    }).join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
}

/** Les mots de la ligne de résultat : au présent (l'évaluation), au conditionnel (la copie fictive). */
var TEMPS = {
    present: {
        attend: function(qui) { return 'Aucune note : l’évaluation attend ' + qui + '.'; },
        entiere: 'la note est entière, ', zero: 'la note est ',
        plafond: ' ; la note s’arrête à la pondération : ', plancher: ' ; la note ne descend pas sous 0 : '
    },
    conditionnel: {
        attend: function(qui) { return 'Aucune note : l’évaluation attendrait ' + qui + '.'; },
        entiere: 'la note serait entière, ', zero: 'la note serait ',
        plafond: ' ; la note s’arrêterait à la pondération : ', plancher: ' ; la note ne descendrait pas sous 0 : '
    }
};

/**
 * La ligne de résultat d'une copie, qui suit les blocs : « Note = 20 − 3 × 2 = 14 / 20 », « … = 100 ;
 * la note s’arrête à la pondération : 20 / 20. », « Le compte des calculs vaut 0 : la note est 0 / 20. ».
 * Rend '' sans pondération ; « Aucune note… » quand l'évaluation attend une donnée (au présent, la
 * ligne de l'évaluation est masquée à la place : voir `libelleChiffre`).
 * @param {'present'|'conditionnel'} temps
 */
function ligneResultat(critere, donnees, temps) {
    var T = TEMPS[temps] || TEMPS.present;
    var res = calculer(critere, donnees);
    if (!res.applicable) {
        if (res.raison === 'ponderation-absente' || !res.attend) return '';
        return T.attend(leDonnee(res.attend, critere));
    }
    var p = _nb(Number(donnees.ponderation));
    if (res.cas) {
        return _maj(leDonnee(res.cas, critere)) + ' vaut 0 : '
            + (res.issue === 'entiere' ? T.entiere + p + ' / ' + p + '.' : T.zero + '0 / ' + p + '.');
    }
    var t = 'Note = ' + enChiffres(critere, donnees) + ' = ' + _nb(res.brut);
    if (res.brut > res.note) return t + T.plafond + p + ' / ' + p + '.';
    if (res.brut < 0) return t + T.plancher + '0 / ' + p + '.';
    return t + ' / ' + p;
}

/**
 * Texte du calcul avec les données de l'évaluation — pour le module Évaluer, au présent.
 * Retourne '' quand aucune note ne se calcule : mieux vaut pas de ligne du tout qu'une ligne qui
 * affiche des tirets là où l'enseignant·e attend un raisonnement.
 */
function libelleChiffre(critere, donnees) {
    var res = calculer(critere, donnees);
    if (!res.applicable) return '';
    return ligneResultat(critere, donnees, 'present');
}

/**
 * Écrit le modèle et ses paramètres sur un critère. Passe aussi le miroir de
 * compatibilité `facteurNormalisation` quand le modèle le comporte, et le
 * RETIRE quand il ne le comporte pas — sans quoi une grille passée à un autre
 * modèle garderait un facteur périmé que l'import relirait comme la vérité.
 * `casZero` n'est pas touché : il est rangé par modèle, et revenir à un calcul retrouve ses choix.
 *
 * Mute et retourne le critère.
 */
function appliquerAuCritere(critere, modeleId, paramsBruts) {
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    var params = {};

    modele.parametres.forEach(function(p) {
        params[p.cle] = _valeurParam(p, paramsBruts ? paramsBruts[p.cle] : undefined);
    });

    critere.modeleFormule = modele.id;
    critere.paramsFormule = params;

    if (Object.prototype.hasOwnProperty.call(params, 'facteurNormalisation')) {
        critere.facteurNormalisation = params.facteurNormalisation;
    } else {
        delete critere.facteurNormalisation;
    }

    return critere;
}

/**
 * Écrit un choix « Si [donnée] vaut 0 » pour le calcul du critère. Un choix égal au départ RETIRE
 * l'entrée (et `casZero` quand il n'en reste rien) : un critère dont on ne touche rien n'en porte
 * pas. Un choix illisible est refusé : rien n'est écrit.
 * @returns {boolean} écrit ou non
 */
function appliquerCasZero(critere, donnee, choix) {
    var f = normaliser(critere), modele = f.modele;
    if (!_choixLisible(modele, donnee, choix)) return false;
    var tous = (critere.casZero && typeof critere.casZero === 'object') ? critere.casZero : {};
    var entree = Object.assign({}, tous[modele.id] || {});
    if (modele.cas[donnee] === choix) delete entree[donnee];
    else entree[donnee] = choix;
    var suite = Object.assign({}, tous);
    if (Object.keys(entree).length) suite[modele.id] = entree;
    else delete suite[modele.id];
    if (Object.keys(suite).length) critere.casZero = suite;
    else delete critere.casZero;
    return true;
}

/**
 * Ce que dit le gabarit sous « Quand une donnée de la copie vaut 0 » : une rangée par donnée lue,
 * ses choix offerts (jamais « Calculer normalement » pour une donnée par laquelle on divise) et le
 * choix actuel ; `divise` : le calcul divise-t-il par une donnée ?
 * @returns {{rangees: Array<{donnee, nom, choix: Array<{valeur, libelle}>, actuel}>, divise: boolean}}
 */
function casAOffrir(critere) {
    var f = normaliser(critere), cas = casDuCritere(critere, f.modeleId);
    var div = diviseurs(f.modele.jetons);
    var rangees = donneesDuCalcul(f.modele.jetons).map(function(d) {
        return {
            donnee: d,
            nom: nomDonnee(d, critere),
            choix: CHOIX_CAS.filter(function(o) { return !(o === 'calcul' && div[d]); }).map(function(o) {
                return { valeur: o, libelle: o === 'aucune' ? 'Aucune note : l’évaluation attend ' + leDonnee(d, critere) : ISSUES[o] };
            }),
            actuel: cas[d]
        };
    });
    return { rangees: rangees, divise: Object.keys(div).length > 0 };
}


// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------
var api = {
    MODELE_PAR_DEFAUT: MODELE_PAR_DEFAUT,
    DONNEES: DONNEES.slice(),
    ISSUES: ISSUES,
    listerModeles: listerModeles,
    obtenirModele: obtenirModele,
    normaliser: normaliser,
    evaluer: evaluer,
    donneesDuCalcul: donneesDuCalcul,
    diviseurs: diviseurs,
    casDuCritere: casDuCritere,
    casAOffrir: casAOffrir,
    assainirCasZero: assainirCasZero,
    refusCasZero: refusCasZero,
    calculer: calculer,
    nomDonnee: nomDonnee,
    leDonnee: leDonnee,
    blocs: blocs,
    enChiffres: enChiffres,
    ligneResultat: ligneResultat,
    libelleChiffre: libelleChiffre,
    appliquerAuCritere: appliquerAuCritere,
    appliquerCasZero: appliquerCasZero
};

if (typeof window !== 'undefined') window.formulesAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
