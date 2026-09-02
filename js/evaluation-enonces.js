/* ===============================
   MODULE EVALUATION-ENONCES — Registre des modèles d'énoncé algorithmique

   RAISON D'ÊTRE (#581, 2026-09-02)
   Un critère algorithmique compte des erreurs et engendre des phrases. Ces
   phrases nommaient la discipline de leur auteur : « Ta rédaction contient 12
   erreurs de français pour 500 mots. » Un enseignant de chimie qui compte des
   erreurs de calcul voyait donc son critère rebaptisé « Français écrit » dans
   le PDF remis à son élève, et lisait « rédaction » là où il n'y a pas de texte.

   Ce module est le troisième d'une même famille, après #667 (les formules) et
   #668 (la projection) : ce qui appartient à la pratique d'une personne remonte
   dans le gabarit de la grille ; le code ne garde que la mécanique.

   ⚠ LE DISCRIMINANT EST LE NOM DU CRITÈRE, ET C'EST UNE DÉVIATION ASSUMÉE
   PAR RAPPORT AU PATRON DE #668.
   Le patron migre TOUT critère sans réglage vers le texte d'hier, reproduit au
   caractère près. Appliqué ici, il laisserait « français » sortir chez
   l'enseignant de chimie : le défaut que ce lot corrige survivrait à sa
   correction. Un critère sans réglage est donc lu selon SON NOM :
     · le nom dit « français »  ⮕ modèle `discipline_francais`, textes d'hier
       AU CARACTÈRE PRÈS. Les élèves de qui a nommé son critère ainsi ne voient
       aucun changement — c'est la fidélité du patron, appliquée là où elle a
       un sens ;
     · le nom dit autre chose   ⮕ modèle `generique`, qui ne nomme aucune
       discipline. Il porte le nom du critère là où la phrase le demande
       (le défi prioritaire, ce qui reste à travailler) et PAS dans le
       décompte — décision de Grégoire du 2 septembre 2026 : le nom titre
       déjà le panneau et la ligne du PDF où cette phrase s'affiche.
   ⮕ Ce n'est pas une devinette : le nom est une donnée écrite par
   l'utilisateur, et `modeleEnonces` écrit dans le gabarit le supplante
   toujours. Le code ne fait que choisir un défaut, jamais un verdict.

   MODÈLE DE DONNÉES SUR LE CRITÈRE (SSOT)
     critere.modeleEnonces : string — identifiant du modèle
     critere.enonces       : objet  — {cle: texte}, textes libres de l'auteur

   LES JETONS
     {critere}  le nom du critère, tel qu'il est dans la grille
     {erreurs}  le nombre d'erreurs
     {s}        « s » quand {erreurs} est au pluriel, vide sinon
     {mots}     le nombre de mots
     {points}   la mention pondérée, avec son espace de tête, ou vide
   ⚠ Un jeton que l'appel ne fournit pas est retiré du texte, jamais rendu
   littéralement : un élève ne doit pas lire « {critere} » sur son PDF.

   ⚠ CE MODULE N'ENGENDRE QUE DES PHRASES. Le nom qui TITRE une section
   (l'en-tête du PDF, le titre du décompte) n'est pas un énoncé réglable : c'est
   le nom du critère, lu tel quel. `libelleCritere` le rend, et ne passe par
   aucun modèle — voir §2(1) de la consigne : « aucun registre à créer ».

   Aucune dépendance : ni DOM, ni db, ni evaluationEnCours. Testable en Node.
   =============================== */

(function() {
'use strict';

// ---------------------------------------------------------------------
// Le nom qui titre — volet (A), sans modèle
// ---------------------------------------------------------------------

// Ce que porte une section de décompte quand AUCUN critère algorithmique n'est
// lisible. Ce n'est pas un nom de discipline : c'est la description de ce que
// la section contient, vraie pour tout le monde.
var LIBELLE_SANS_CRITERE = 'Erreurs annotées';

// Ce que porte {critere} A L'INTERIEUR D'UNE PHRASE quand aucun nom n'est
// lisible. ⚠ CE N'EST PAS `LIBELLE_SANS_CRITERE`, ET LA DISTINCTION EST
// MESUREE : le repli de titre donnait « Concentre-toi sur Erreurs annotées »,
// une phrase qui ne veut rien dire, remise à un élève. Un titre nomme ce que
// la section contient ; une phrase s'adresse à quelqu'un. Les deux replis
// disent la même absence, pas dans la même grammaire.
var CRITERE_SANS_NOM = 'ce critère';

/**
 * Le nom à afficher au-dessus d'un décompte d'erreurs.
 *
 * @param {object|null} critere - le critère algorithmique, s'il est connu
 * @returns {string} son nom, ou un libellé neutre. Jamais une discipline.
 */
function libelleCritere(critere) {
    var nom = (critere && typeof critere.nom === 'string') ? critere.nom.trim() : '';
    return nom || LIBELLE_SANS_CRITERE;
}

/**
 * Le critère algorithmique d'une grille — celui qui compte des erreurs.
 *
 * ⚠ LE PREMIER, ET C'EST DIT PLUTÔT QUE SUPPOSÉ. Rien n'interdit deux critères
 * algorithmiques dans une grille. Les sites qui appellent ceci titrent UNE
 * section de décompte d'annotations, qui n'est rattachée à aucun critère par
 * les données : les erreurs sont des annotations sur la copie, pas des entrées
 * de grille. Prendre le premier reproduit ce que fait déjà
 * `_detecterAlgoA0Bilan` (evaluation-retroaction.js), qui écrase sa variable à
 * chaque tour de boucle et garde donc le DERNIER. Les deux se valent tant
 * qu'il n'y en a qu'un ; le jour où il y en a deux, aucun des deux n'a raison,
 * et c'est le modèle de données qu'il faudra corriger, pas ce choix-ci.
 *
 * @returns {object|null} le critère, ou `null` si la grille n'en porte aucun.
 */
function critereAlgorithmique(grille) {
    var criteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
    for (var i = 0; i < criteres.length; i++) {
        if (criteres[i] && criteres[i].type === 'algorithmique') return criteres[i];
    }
    return null;
}

// ---------------------------------------------------------------------
// Les jetons
// ---------------------------------------------------------------------

var JETON_CRITERE = '{critere}';
var JETON_ERREURS = '{erreurs}';
var JETON_PLURIEL = '{s}';
var JETON_MOTS    = '{mots}';
var JETON_POINTS  = '{points}';

var JETONS = [JETON_CRITERE, JETON_ERREURS, JETON_PLURIEL, JETON_MOTS, JETON_POINTS];

// ---------------------------------------------------------------------
// LES ÉNONCÉS D'HIER — repris des quatre sites au caractère près
// ---------------------------------------------------------------------
// Chaque clé nomme un ENDROIT où une phrase sort, pas une phrase :
//   decompte     la rétroaction du critère, mode simple et mode catégories
//                (evaluation-calcul.js:502 et :680)
//   priorite     le défi mis en tête du bilan (evaluation-retroaction.js:785)
//   concentre    ce qui reste à travailler quand tout est maîtrisé
//                (evaluation-retroaction.js:854 et
//                 synthese-retroaction-data.js:728 — MÊMES MOTS OBLIGATOIRES,
//                 `copierToutRetroaction` copie l'un dans le document de l'autre)
//   aucune       l'état vide du volet « spécifique » (evaluation-retroaction.js:487)
//
// ⚠ Les apostrophes sont typographiques ou ASCII SELON LE SITE D'ORIGINE. Ne
// pas uniformiser : la reproduction au caractère près est ce qui garantit
// qu'aucun élève de Grégoire ne reçoit un texte différent d'hier.
var ENONCES_FRANCAIS = {
    decompte:  'Ta rédaction contient ' + JETON_ERREURS + ' erreur' + JETON_PLURIEL + ' de français' + JETON_POINTS + ' pour ' + JETON_MOTS + ' mots.',
    priorite:  'la qualité du français écrit est à travailler en priorité',
    concentre: 'Concentre-toi sur la qualité du français',
    aucune:    'Aucun tampon ni erreur de français annotés.'
};

// Les mêmes énoncés, sans discipline.
//
// ⚠ « rédaction » DISPARAÎT AUSSI, et pour la même raison que « français » :
// un critère qui compte des erreurs de calcul ne s'applique pas à une
// rédaction, et qui corrige une partition n'en lit aucune. « production » est
// le mot que l'application emploie partout ailleurs pour ce que l'élève remet
// — ce n'est pas un mot neuf.
//
// ⚠ CES QUATRE TEXTES SONT DE LA PROSE QUE DES ÉLÈVES LIRONT. Ils ne se
// changent pas au jugement d'une session : `CLAUDE.md` les met dans ce qui
// remonte à Grégoire. Ceux-ci ont été arrêtés par lui le 2 septembre 2026.
var ENONCES_GENERIQUES = {
    // ⚠ LE DECOMPTE NE PORTE PAS {critere}, ET C'EST UNE DECISION DE GREGOIRE
    // (2 septembre 2026), prise sur les trois formulations rendues côte à côte.
    // « en {critere} » était bancal (« 12 erreurs en Notation musicale ») et
    // forçait un repli là où la grille est illisible. Le nom du critère titre
    // déjà le panneau au-dessus de cette phrase, et la section du PDF : le
    // répéter dans la phrase ne dit rien de plus à l'élève.
    decompte:  'Ta production contient ' + JETON_ERREURS + ' erreur' + JETON_PLURIEL + JETON_POINTS + ' pour ' + JETON_MOTS + ' mots.',
    priorite:  JETON_CRITERE + ' est à travailler en priorité',
    concentre: 'Concentre-toi sur ' + JETON_CRITERE,
    aucune:    'Aucun tampon ni erreur annotés.'
};

// L'ordre et les libellés des clés, pour le gabarit de la grille.
var CLES = [
    { cle: 'decompte',  libelle: 'Décompte des erreurs',        aide: 'La phrase engendrée sous le critère, et reprise dans le PDF de l\'élève.' },
    { cle: 'priorite',  libelle: 'Défi prioritaire',            aide: 'Mise en tête du bilan quand ce critère est effondré.' },
    { cle: 'concentre', libelle: 'Quand tout est maîtrisé',     aide: 'Ce qui reste à travailler lorsque tous les critères sont acquis.' },
    { cle: 'aucune',    libelle: 'Aucune annotation',           aide: 'Affiché à l\'enseignant·e quand la copie ne porte ni tampon ni erreur.' }
];

// ---------------------------------------------------------------------
// LES MODÈLES
// ---------------------------------------------------------------------

var MODELES = [
    {
        id: 'generique',
        nom: 'Générique (nom du critère)',
        description: 'Les phrases nomment le critère tel qu\'il est écrit dans la grille. Convient à toute discipline.',
        enoncesParDefaut: ENONCES_GENERIQUES
    },
    {
        id: 'discipline_francais',
        nom: 'Français écrit (formulations d\'origine)',
        description: 'Les phrases d\'avant #581, mot pour mot. À conserver pour un critère de français écrit dont les élèves ont déjà reçu ces textes.',
        enoncesParDefaut: ENONCES_FRANCAIS
    }
];

var MODELE_PAR_DEFAUT = 'generique';

/**
 * Le nom d'un critère annonce-t-il le français écrit ?
 *
 * ⚠ MESURÉ, PAS DEVINÉ. Ce prédicat ne sert QU'À CHOISIR UN DÉFAUT pour un
 * critère qui n'a jamais été réglé. Il ne décide d'aucun texte dès que
 * `modeleEnonces` est écrit dans le gabarit — c'est-à-dire dès que
 * l'utilisateur a exprimé un choix.
 *
 * Accents et casse sont neutralisés : « Français écrit », « FRANCAIS »,
 * « Qualité du français » passent tous. Un critère nommé « Franchise » ne
 * passe pas — la frontière est le mot, pas la sous-chaîne.
 */
function _nomDitFrancais(nom) {
    if (typeof nom !== 'string' || !nom) return false;
    var nu = nom.toLowerCase();
    // Neutralisation d'accents sans dépendre de String.normalize (absent de
    // certains moteurs anciens) : seules les voyelles accentuées du français
    // écrit nous intéressent ici.
    nu = nu.replace(/[àâä]/g, 'a').replace(/[çÇ]/g, 'c').replace(/[éèêë]/g, 'e')
           .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u');
    return /(^|[^a-z])francais([^a-z]|$)/.test(nu);
}

function listerModeles() {
    return MODELES.map(function(m) {
        return { id: m.id, nom: m.nom, description: m.description };
    });
}

function obtenirModele(id) {
    for (var i = 0; i < MODELES.length; i++) if (MODELES[i].id === id) return MODELES[i];
    return null;
}

/** Les clés d'énoncé et leurs libellés, pour le gabarit. */
function listerCles() {
    return CLES.map(function(c) { return { cle: c.cle, libelle: c.libelle, aide: c.aide }; });
}

// ---------------------------------------------------------------------
// Lecture d'un critère
// ---------------------------------------------------------------------

/**
 * Lit les énoncés d'un critère, en migrant à la lecture ceux d'avant #581.
 *
 * @returns {{modeleId, enonces, herite}} `herite` dit si le modèle a été
 *          choisi faute de champ `modeleEnonces`.
 */
function normaliser(critere) {
    critere = critere || {};
    var declare = typeof critere.modeleEnonces === 'string' ? critere.modeleEnonces.trim() : '';
    var modele = declare ? obtenirModele(declare) : null;
    var herite = false;

    if (!modele) {
        // Critère d'avant #581, ou identifiant venu d'une version plus récente.
        // Le NOM tranche — voir la déviation nommée en tête de fichier.
        modele = obtenirModele(_nomDitFrancais(critere.nom) ? 'discipline_francais' : MODELE_PAR_DEFAUT);
        herite = true;
    }

    var source = (critere.enonces && typeof critere.enonces === 'object') ? critere.enonces : {};
    var enonces = {};
    CLES.forEach(function(c) {
        var brut = source[c.cle];
        // Une chaîne VIDE est un choix : elle fait taire l'énoncé. C'est
        // `undefined` — l'absence de réglage — qui retombe sur le défaut.
        enonces[c.cle] = (typeof brut === 'string') ? brut : modele.enoncesParDefaut[c.cle];
    });

    return { modeleId: modele.id, enonces: enonces, herite: herite };
}

// ---------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------

/** Échappe une chaîne pour un usage dans une RegExp littérale. */
function _echapperRegExp(texte) {
    return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remplit les jetons d'un texte.
 *
 * ⚠ UN JETON NON FOURNI EST RETIRÉ, PAS RENDU. Un texte du gabarit peut porter
 * un jeton que le site d'appel ne connaît pas ({points} hors du mode pondéré,
 * par exemple) : le laisser en place mettrait « {points} » sous les yeux d'un
 * élève. Il part, et le texte reste une phrase.
 *
 * @param {string} texte
 * @param {object} valeurs - les jetons fournis, sans leurs accolades
 */
function rendre(texte, valeurs) {
    if (typeof texte !== 'string' || !texte) return '';
    var v = (valeurs && typeof valeurs === 'object') ? valeurs : {};
    var sortie = texte;

    JETONS.forEach(function(jeton) {
        var cle = jeton.slice(1, -1);
        var brut = v[cle];
        var vide = (brut === undefined || brut === null || brut === '');
        // ⚠ UN JETON VIDE EMPORTE L'ESPACE QUI LE PRÉCÈDE, ET RIEN D'AUTRE.
        // La version d'avant repassait sur TOUT le texte
        // (`.replace(/\s+([.,;:!?])/g, '$1')`) pour refermer le trou. Mesuré le
        // 2 septembre 2026 : « Attention : 3 erreurs ; revois ! » ressortait
        // « Attention: 3 erreurs; revois! » — le registre RÉÉCRIVAIT la
        // typographie française du texte que l'enseignant·e avait tapé, dans un
        // lot dont tout l'objet est de respecter sa prose. L'espace fine avant
        // « ; : ! ? » est correcte en français ; seul un trou laissé par un
        // jeton retiré doit être refermé, et il se referme ici, localement.
        var motif = vide
            ? new RegExp('[ \\t]?' + _echapperRegExp(jeton), 'g')
            : new RegExp(_echapperRegExp(jeton), 'g');
        sortie = sortie.replace(motif, vide ? '' : String(brut));
    });

    return sortie.trim();
}

/**
 * L'énoncé d'un critère pour une clé donnée, jetons remplis.
 *
 * @param {object} critere - le critère de grille (porte le modèle et les textes)
 * @param {string} cle - une des clés de `listerCles()`
 * @param {object} valeurs - les jetons ({erreurs}, {mots}, {points}…)
 * @returns {string} la phrase, ou '' si l'énoncé a été vidé par l'utilisateur.
 *
 * ⚠ `{critere}` est fourni PAR CE MODULE, jamais par l'appelant : il n'y a
 * qu'une source pour le nom d'un critère, et c'est le critère.
 */
function enonce(critere, cle, valeurs) {
    var p = normaliser(critere);
    var texte = p.enonces[cle];
    if (typeof texte !== 'string') return '';

    var v = {};
    if (valeurs && typeof valeurs === 'object') {
        Object.keys(valeurs).forEach(function(k) { v[k] = valeurs[k]; });
    }
    // ⚠ LE REPLI DE PHRASE, PAS CELUI DE TITRE — voir `CRITERE_SANS_NOM`.
    var nomCritere = (critere && typeof critere.nom === 'string') ? critere.nom.trim() : '';
    v.critere = nomCritere || CRITERE_SANS_NOM;
    // Le pluriel suit le décompte d'erreurs, et seulement lui. Un énoncé qui
    // ne porte pas {erreurs} ne porte pas {s} non plus.
    if (v.s === undefined) {
        var n = Number(v.erreurs);
        v.s = (!isNaN(n) && Math.abs(n) > 1) ? 's' : '';
    }
    return rendre(texte, v);
}

/**
 * Écrit le modèle et les énoncés sur le critère. Le gabarit appelle ceci ; le
 * module ne touche jamais aux données de son propre chef.
 *
 * ⚠ N'ÉCRIT QUE CE QUI DIFFÈRE DU DÉFAUT. Recopier les défauts dans les
 * données les figerait : une correction du registre n'atteindrait plus les
 * grilles déjà enregistrées, et chaque grille partagée transporterait quatre
 * phrases que personne n'a écrites. Même règle qu'au §`appliquerAuCritere` de
 * `evaluation-projection.js`.
 */
function appliquerAuCritere(critere, modeleId, enonces) {
    critere = critere || {};
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    critere.modeleEnonces = modele.id;

    var source = (enonces && typeof enonces === 'object') ? enonces : {};
    var propres = {};
    var aQuelqueChose = false;
    CLES.forEach(function(c) {
        var brut = source[c.cle];
        if (typeof brut !== 'string') return;
        if (brut === modele.enoncesParDefaut[c.cle]) return;
        propres[c.cle] = brut;
        aQuelqueChose = true;
    });

    if (aQuelqueChose) {
        critere.enonces = propres;
    } else {
        delete critere.enonces;
    }
    return critere;
}

/** Les énoncés par défaut d'un modèle — pour préremplir le gabarit. */
function enoncesParDefaut(modeleId) {
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    return JSON.parse(JSON.stringify(modele.enoncesParDefaut));
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------
var api = {
    MODELE_PAR_DEFAUT: MODELE_PAR_DEFAUT,
    LIBELLE_SANS_CRITERE: LIBELLE_SANS_CRITERE,
    CRITERE_SANS_NOM: CRITERE_SANS_NOM,
    JETON_CRITERE: JETON_CRITERE,
    JETON_ERREURS: JETON_ERREURS,
    JETON_PLURIEL: JETON_PLURIEL,
    JETON_MOTS: JETON_MOTS,
    JETON_POINTS: JETON_POINTS,
    listerModeles: listerModeles,
    listerCles: listerCles,
    obtenirModele: obtenirModele,
    normaliser: normaliser,
    rendre: rendre,
    enonce: enonce,
    libelleCritere: libelleCritere,
    critereAlgorithmique: critereAlgorithmique,
    appliquerAuCritere: appliquerAuCritere,
    enoncesParDefaut: enoncesParDefaut
};

if (typeof window !== 'undefined') window.enoncesAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
