/* ===============================
   MODULE: PLANIFICATION — MOTEUR CARTE MENTALE
   Portage du prototype standalone vers la SPA Monitorage v6

   Tous les IDs et classes sont préfixés 'planif-'
   Toutes les refs DOM sont différées dans initialiser()
   Events globaux gérés via flag planificationActive

   Export: window.planificationCarte
   =============================== */

(function() {
'use strict';

// === ÉTAT DE L'APPLICATION ===
const etat = {
    noeuds: new Map(),
    liens: new Map(),
    compteur: 0,
    compteurLiens: 0,
    selection: null,
    multiSelection: new Set(),
    lienEnCours: null,
    panneauOuvert: false,
    zoom: 1,
    initialise: false
};

// === FLAG D'ACTIVATION ===
let planificationActive = false;

// === UNDO / REDO ===
const UNDO_MAX = 50;
let pileUndo = [];
let pileRedo = [];
let _undoBatch = false;

// === THROTTLE rAF POUR HANDLERS MOUSEMOVE ===
function throttleRAF(fn) {
    var rafId = null;
    return function(e) {
        if (rafId) return;
        rafId = requestAnimationFrame(function() {
            fn(e);
            rafId = null;
        });
    };
}

// === CLÉ DE STOCKAGE SÉANCES ===
var CLE_SEANCES = 'planification_seances';

// === OBJECTIF DE LEÇON ===
// L'objectif vit sur le nœud lui-même (`metadata.objectif`), donc dans la clé
// propre du module (`planification_mindmap`, namespacée par trimestre). Il suit
// ainsi la leçon lors des clones, copies et imports inter-trimestre.
// Avant le 6 août 2026 il vivait dans CLE_SEANCES — clé NUE (partagée entre
// tous les trimestres et avec la démo) à dictionnaire PLAT par id de leçon,
// alors que ces ids ne sont uniques que par carte (#367, rouge D1 de l'audit du
// 5 août). `migrerObjectifsVersMetadata()` fait la bascule.
// Une leçon a TOUJOURS plusieurs objectifs (constat de Grégoire, 6 août 2026 :
// un Keynote de leçon en aligne 4 ou 5). Ils sont stockés en liste d'OBJETS
// porteurs d'un id — jamais en tableau de chaînes — pour qu'un objectif puisse
// devenir la cible d'un lien (« telle activité sert tel objectif ») sans
// migration ultérieure. Une activité peut servir plusieurs objectifs et
// inversement : la relation est N:N, donc les deux bouts ont besoin d'identité.
function objectifsDeLecon(n) {
    if (!n || !n.metadata) return [];
    var liste = n.metadata.objectifs;
    if (!Array.isArray(liste)) return [];
    return liste.filter(function(o) { return o && typeof o.texte === 'string'; });
}

/** Texte du premier objectif — repli d'affichage là où une seule ligne tient. */
function objectifDeLecon(n) {
    var liste = objectifsDeLecon(n);
    return liste.length > 0 ? liste[0].texte : '';
}

/** Donne le focus à une zone éditable en plaçant le curseur après le texte. */
function placerCurseurEnFin(el) {
    el.focus();
    try {
        var plage = document.createRange();
        plage.selectNodeContents(el);
        plage.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(plage);
    } catch (e) { /* focus seul suffit */ }
}

// Ligne d'accueil transitoire après un clic sur « + ». Un objectif vide n'est
// jamais persisté (appliquerObjectifs écarte les lignes vides) : cet état dit
// au rendu d'ouvrir une ligne à remplir au bon rang, sans polluer les données.
// { noeudId, rang } ou null.
var _ajoutObjectif = null;

var _compteurObjectif = 0;
function nouvelIdObjectif() {
    _compteurObjectif++;
    return 'obj_' + Date.now().toString(36) + '_' + _compteurObjectif;
}

function objectifEstDeplie(n) {
    return !!(n && n.metadata && n.metadata.objectifDeplie);
}

/**
 * Lecture par id — porte d'entrée des autres modules (Organisateur, exports).
 * Rend le texte des objectifs, un par ligne : les consommateurs affichent ou
 * exportent du texte, ils n'ont pas besoin des identifiants.
 */
function objectifDeLeconParId(leconId) {
    return objectifsDeLecon(etat.noeuds.get(leconId))
        .map(function(o) { return o.texte; })
        .join('\n');
}

/** Liste structurée par id — pour qui a besoin des identifiants (liens à venir). */
function objectifsDeLeconParId(leconId) {
    return objectifsDeLecon(etat.noeuds.get(leconId));
}

/**
 * Écriture par id — porte de sortie UNIQUE des autres modules (Organisateur).
 * Évite d'exposer `sauvegarder()` brut : un seul chemin d'écriture pour
 * l'objectif, donc une seule vérité.
 * @returns {boolean} true si le nœud existait et a été mis à jour
 */
function appliquerObjectifs(n, textes) {
    if (!n.metadata) n.metadata = {};

    var liste = Array.isArray(textes) ? textes : (textes ? [textes] : []);
    var anciens = objectifsDeLecon(n);
    var nouveaux = [];
    for (var i = 0; i < liste.length; i++) {
        var texte = String(liste[i] === null || liste[i] === undefined ? '' : liste[i]).trim();
        if (texte === '') continue;
        // Réutiliser l'id de l'objectif de même rang : les liens qui le visent
        // survivent à une simple correction de formulation.
        var id = (anciens[nouveaux.length] && anciens[nouveaux.length].id) || nouvelIdObjectif();
        nouveaux.push({ id: id, texte: texte });
    }
    if (nouveaux.length === 0) delete n.metadata.objectifs;
    else n.metadata.objectifs = nouveaux;
    sauvegarder();
    return true;
}

/**
 * Porte publique (Organisateur, vue leçon) : applique PUIS re-rend.
 * Séparée d'appliquerObjectifs() parce que la saisie au fil de la frappe ne
 * doit surtout pas reconstruire le DOM — le champ perdrait le focus à chaque
 * caractère.
 */
function definirObjectifsLecon(leconId, textes) {
    var n = etat.noeuds.get(leconId);
    if (!n || n.type !== 'lecon') return false;
    if (!appliquerObjectifs(n, textes)) return false;
    // reconstruireDOM() repart d'un DOM vide : les badges de validation, posés
    // par appendChild sur les éléments existants, disparaîtraient si on ne les
    // reposait pas APRÈS. Même ordre que chargerCarte().
    reconstruireDOM();
    mettreAJourTousLesBadges();
    return true;
}

/**
 * Migration one-shot, par carte, vers `noeud.metadata.objectifs` (liste).
 * Couvre les DEUX formats antérieurs :
 *   1. CLE_SEANCES[leconId].objectifPersonnalise (avant le 6 août 2026) ;
 *   2. noeud.metadata.objectif, chaîne unique (versions 1.32-1.33).
 * Idempotente : ne touche que les leçons sans `metadata.objectifs`.
 * L'ancienne source n'est retirée qu'APRÈS une sauvegarde réussie — zéro-dette
 * (une seule vérité) sans fenêtre de perte.
 * @returns {number} nombre de leçons migrées
 */
function migrerObjectifsVersMetadata() {
    // `sauvegarder()` sort SILENCIEUSEMENT s'il n'y a pas de carte active : sans
    // cette garde, on muterait l'état en mémoire puis on purgerait l'ancienne
    // source sans que rien n'ait été persisté — donc perte sèche des objectifs.
    // Pas de cible de persistance = pas de migration.
    var index = null;
    try {
        index = window.planificationDonnees && typeof window.planificationDonnees.getIndex === 'function'
            ? window.planificationDonnees.getIndex()
            : null;
    } catch (e0) { return 0; }
    if (!index || !index.active) return 0;

    var seances = {};
    try { seances = db.getSync(window.cle(CLE_SEANCES), {}) || {}; } catch (e) { return 0; }

    var migres = [];
    for (var entry of etat.noeuds) {
        var n = entry[1];
        if (n.type !== 'lecon') continue;
        if (n.metadata && Array.isArray(n.metadata.objectifs)) continue;

        // Format 2 (chaîne unique) : bascule en mémoire, rien à purger ailleurs.
        if (n.metadata && typeof n.metadata.objectif === 'string' && n.metadata.objectif.trim() !== '') {
            n.metadata.objectifs = [{ id: nouvelIdObjectif(), texte: n.metadata.objectif.trim() }];
            delete n.metadata.objectif;
            migres.push(n.id);
            continue;
        }
        if (n.metadata && 'objectif' in n.metadata) delete n.metadata.objectif;

        // Format 1 (ancienne clé de séances).
        var ancien = seances[n.id] && seances[n.id].objectifPersonnalise;
        if (typeof ancien !== 'string' || ancien.trim() === '') continue;
        if (!n.metadata) n.metadata = {};
        n.metadata.objectifs = [{ id: nouvelIdObjectif(), texte: ancien.trim() }];
        migres.push(n.id);
    }
    if (migres.length === 0) return 0;

    try {
        sauvegarder();
    } catch (e) {
        console.warn('[Planification] Migration des objectifs : sauvegarde échouée, ancienne source conservée', e);
        return 0;
    }

    // Sauvegarde confirmée : retirer l'ancienne source.
    try {
        for (var i = 0; i < migres.length; i++) {
            if (seances[migres[i]]) delete seances[migres[i]].objectifPersonnalise;
        }
        db.setSync(window.cle(CLE_SEANCES), seances); // security-ok: données locales du module, aucune source externe
    } catch (e2) {
        console.warn('[Planification] Migration des objectifs : purge de l\'ancienne clé échouée (bénin, metadata fait foi)', e2);
    }
    return migres.length;
}

// === ANCRAGE TEMPOREL (lot 1 du planificateur en grille, 6 août 2026) ===
// D3 du plan : l'ancrage temporel appartient à la LEÇON, et à elle seule. Une
// leçon porte `metadata.semaine` (entier ≥ 1) ; absente = NON PLANIFIÉE.
// Les niveaux supérieurs ne stockent RIEN : leur étendue se DÉRIVE de leurs
// leçons (première → dernière). Une séquence ne peut donc pas annoncer la
// semaine 3 pendant qu'une de ses leçons vit en semaine 5 — la contradiction
// devient structurellement impossible plutôt que simplement déconseillée.
//
// Avant le 6 août, `metadata.semaineDebut` / `semaineFin` vivaient sur la
// SÉQUENCE et se saisissaient dans l'inspecteur de la carte. Deux défauts :
//  1. la séquence pouvait contredire ses leçons ;
//  2. personne ne les remplissait, et les tris qui en dépendaient retombaient
//     tous sur leur repli 999 — d'où deux vues du même plan affichées dans des
//     ordres différents (constat terrain du 601-101, 6 août).
// `migrerAncrageTemporelVersLecon()` retire ces deux champs. Elle ne DEVINE
// aucune semaine : ni depuis l'ancienne valeur de la séquence, ni depuis les
// « Sem. 3 » écrits dans les titres. Tout repart non planifié, l'enseignant
// assigne. Interpréter à sa place produirait des ancrages faux indiscernables
// de vrais.
var SEMAINE_MIN = 1;

/** Semaine d'une leçon, ou null si non planifiée / nœud d'un autre type. */
function semaineDeLecon(n) {
    if (!n || n.type !== 'lecon' || !n.metadata) return null;
    var s = parseInt(n.metadata.semaine, 10);
    return (isNaN(s) || s < SEMAINE_MIN) ? null : s;
}

/**
 * Étendue temporelle dérivée d'un nœud : { debut, fin } ou null si rien de
 * planifié en dessous. Récursive DÈS MAINTENANT, alors que la hiérarchie n'a
 * encore que deux niveaux de conteneurs : les séquences de séquences (voie A,
 * tranchée le 6 août) n'auront ainsi rien à réécrire ici.
 * `vus` garde contre un cycle dans `enfants` — une étendue ne vaut pas une
 * boucle infinie au chargement.
 */
function etendueTemporelle(n, vus) {
    if (!n) return null;
    // La leçon d'abord : elle est AUSSI un conteneur (de ses activités), mais
    // c'est sa propre semaine qui fait foi, pas celle de son contenu.
    if (n.type === 'lecon') {
        var s = semaineDeLecon(n);
        return s === null ? null : { debut: s, fin: s };
    }
    var config = TYPES[n.type];
    if (!(config && config.conteneur)) return null;

    if (!vus) vus = new Set();
    if (vus.has(n.id)) return null;
    vus.add(n.id);

    var debut = null, fin = null;
    var enfants = n.enfants || [];
    for (var i = 0; i < enfants.length; i++) {
        var sous = etendueTemporelle(etat.noeuds.get(enfants[i]), vus);
        if (!sous) continue;
        if (debut === null || sous.debut < debut) debut = sous.debut;
        if (fin === null || sous.fin > fin) fin = sous.fin;
    }
    return debut === null ? null : { debut: debut, fin: fin };
}

/** Porte d'entrée par id — pour l'Organisateur et les exports. */
function etendueTemporelleParId(noeudId) {
    return etendueTemporelle(etat.noeuds.get(noeudId));
}

/** « Sem. 3 », « Sem. 3–5 », ou '' si rien n'est planifié. */
function formaterEtendue(etendue) {
    if (!etendue) return '';
    return 'Sem. ' + etendue.debut + (etendue.fin !== etendue.debut ? '–' + etendue.fin : '');
}

/**
 * Clé de tri temporel : les non planifiés vont EN FIN de liste, jamais en
 * tête. Repli volontairement au-delà de tout cadre plausible — l'ancien code
 * utilisait 999 sur une valeur que personne ne remplissait, ce qui revenait à
 * ne trier sur rien.
 */
function rangTemporel(n) {
    var e = etendueTemporelle(n);
    return e ? e.debut : Number.MAX_SAFE_INTEGER;
}

/**
 * Écriture — porte de sortie UNIQUE de l'ancrage (même patron que
 * `definirObjectifsLecon`). `semaine` null/0/'' = repasser en non planifié.
 * @returns {boolean} true si la leçon existait et a été mise à jour
 */
function definirSemaineLecon(leconId, semaine) {
    var n = etat.noeuds.get(leconId);
    if (!n || n.type !== 'lecon') return false;
    if (!n.metadata) n.metadata = {};

    var s = parseInt(semaine, 10);
    if (isNaN(s) || s < SEMAINE_MIN) {
        if (!('semaine' in n.metadata)) return false;
        delete n.metadata.semaine;
    } else {
        if (n.metadata.semaine === s) return false;
        n.metadata.semaine = s;
    }
    propagerModification(leconId, 'metadata', JSON.parse(JSON.stringify(n.metadata)));
    sauvegarder();
    return true;
}

/**
 * Ablation de l'ancrage porté par la séquence (zéro-dette). Idempotente :
 * une carte déjà migrée ne réécrit rien et ne repasse pas par `sauvegarder()`.
 * Même garde de persistance que `migrerObjectifsVersMetadata()` — sans cible
 * de persistance, on ne mute pas l'état en mémoire.
 * @returns {number} nombre de nœuds purgés
 */
function migrerAncrageTemporelVersLecon() {
    var index = null;
    try {
        index = window.planificationDonnees && typeof window.planificationDonnees.getIndex === 'function'
            ? window.planificationDonnees.getIndex()
            : null;
    } catch (e0) { return 0; }
    if (!index || !index.active) return 0;

    var purges = 0;
    for (var entry of etat.noeuds) {
        var n = entry[1];
        if (!n.metadata) continue;
        if (!('semaineDebut' in n.metadata) && !('semaineFin' in n.metadata)) continue;
        // Purge sèche : l'ancienne valeur n'est REPORTÉE sur aucune leçon.
        delete n.metadata.semaineDebut;
        delete n.metadata.semaineFin;
        purges++;
    }
    if (purges === 0) return 0;

    try {
        sauvegarder();
    } catch (e) {
        console.warn('[Planification] Migration de l\'ancrage temporel : sauvegarde échouée', e);
        return 0;
    }
    return purges;
}

// === INDEX INVERSE CLONES (sourceId → Set d'IDs) ===
var _cloneIndex = new Map();

// === CONFIGURATION DES TYPES ===
const TYPES = {
    // Objectifs
    'competence':     { label: 'Compétence',       couleur: 'var(--planif-couleur-competence)' },
    'idee-maitresse': { label: 'Idée maîtresse',   couleur: 'var(--planif-couleur-idee-maitresse)' },
    // Types de connaissances (Anderson & Krathwohl, 2001)
    'factuelle':      { label: 'Factuelle',          couleur: 'var(--planif-couleur-factuelle)' },
    'conceptuelle':   { label: 'Conceptuelle',       couleur: 'var(--planif-couleur-conceptuelle)' },
    'procedurale':    { label: 'Procédurale',        couleur: 'var(--planif-couleur-procedurale)' },
    'metacognitive':  { label: 'Métacognitive',      couleur: 'var(--planif-couleur-metacognitive)' },
    // Conteneurs
    'sequence':       { label: 'Séquence',          couleur: 'var(--planif-couleur-sequence)',  conteneur: true },
    'lecon':          { label: 'Leçon',             couleur: 'var(--planif-couleur-lecon)',     conteneur: true },
    // Activités
    'activite':       { label: 'Activité',          couleur: 'var(--planif-couleur-activite)' },
    'soutien':        { label: 'Soutien',           couleur: 'var(--planif-couleur-soutien)' },
    'revision':       { label: 'Révision',          couleur: 'var(--planif-couleur-revision)' },
    // Évaluation
    'evaluation':     { label: 'Évaluation',        couleur: 'var(--planif-couleur-evaluation)' }
};

const TYPES_LIENS = [
    { id: 'se_decline_en',        label: 'se décline en' },
    { id: 'se_concretise_dans',   label: 'se concrétise dans' },
    { id: 's_acquiert_par',       label: "s'acquiert par" },
    { id: 'se_verifie_par',       label: 'se vérifie par' },
    { id: 's_appuie_sur',         label: "s'appuie sur" },
    { id: 'complete',             label: 'complète' },
    { id: 'conduit_a',            label: 'conduit à' },
    { id: 'est_mobilise_par',     label: 'est mobilisé(e) par' }
];

// Table des verbes automatiques : direction amont → aval
// clé = "typeSource>typeCible", valeur = { verbe, inverser }
var VERBES_AUTO = {
    // Compétence → Idée maîtresse (se décline en)
    'competence>idee-maitresse':   { verbe: 'se_decline_en' },
    'idee-maitresse>competence':   { verbe: 'se_decline_en', inverser: true },
    // Idée maîtresse → Leçon (se concrétise dans)
    'idee-maitresse>lecon':        { verbe: 'se_concretise_dans' },
    'lecon>idee-maitresse':        { verbe: 'se_concretise_dans', inverser: true },
    'idee-maitresse>sequence':     { verbe: 'se_concretise_dans' },
    'sequence>idee-maitresse':     { verbe: 'se_concretise_dans', inverser: true },
    // Connaissance → Activité (s'acquiert par)
    'factuelle>activite':          { verbe: 's_acquiert_par' },
    'factuelle>soutien':           { verbe: 's_acquiert_par' },
    'factuelle>revision':          { verbe: 's_acquiert_par' },
    'conceptuelle>activite':       { verbe: 's_acquiert_par' },
    'conceptuelle>soutien':        { verbe: 's_acquiert_par' },
    'conceptuelle>revision':       { verbe: 's_acquiert_par' },
    'procedurale>activite':        { verbe: 's_acquiert_par' },
    'procedurale>soutien':         { verbe: 's_acquiert_par' },
    'procedurale>revision':        { verbe: 's_acquiert_par' },
    'metacognitive>activite':      { verbe: 's_acquiert_par' },
    'metacognitive>soutien':       { verbe: 's_acquiert_par' },
    'metacognitive>revision':      { verbe: 's_acquiert_par' },
    'activite>factuelle':          { verbe: 's_acquiert_par', inverser: true },
    'activite>conceptuelle':       { verbe: 's_acquiert_par', inverser: true },
    'activite>procedurale':        { verbe: 's_acquiert_par', inverser: true },
    'activite>metacognitive':      { verbe: 's_acquiert_par', inverser: true },
    'soutien>factuelle':           { verbe: 's_acquiert_par', inverser: true },
    'soutien>conceptuelle':        { verbe: 's_acquiert_par', inverser: true },
    'soutien>procedurale':         { verbe: 's_acquiert_par', inverser: true },
    'soutien>metacognitive':       { verbe: 's_acquiert_par', inverser: true },
    'revision>factuelle':          { verbe: 's_acquiert_par', inverser: true },
    'revision>conceptuelle':       { verbe: 's_acquiert_par', inverser: true },
    'revision>procedurale':        { verbe: 's_acquiert_par', inverser: true },
    'revision>metacognitive':      { verbe: 's_acquiert_par', inverser: true },
    // Idée maîtresse → Évaluation (se vérifie par)
    'idee-maitresse>evaluation':   { verbe: 'se_verifie_par' },
    'evaluation>idee-maitresse':   { verbe: 'se_verifie_par', inverser: true },
    // Connaissance → Évaluation (se vérifie par)
    'factuelle>evaluation':        { verbe: 'se_verifie_par' },
    'conceptuelle>evaluation':     { verbe: 'se_verifie_par' },
    'procedurale>evaluation':      { verbe: 'se_verifie_par' },
    'metacognitive>evaluation':    { verbe: 'se_verifie_par' },
    'evaluation>factuelle':        { verbe: 'se_verifie_par', inverser: true },
    'evaluation>conceptuelle':     { verbe: 'se_verifie_par', inverser: true },
    'evaluation>procedurale':      { verbe: 'se_verifie_par', inverser: true },
    'evaluation>metacognitive':    { verbe: 'se_verifie_par', inverser: true },
    // Activité → Évaluation (se vérifie par)
    'activite>evaluation':         { verbe: 'se_verifie_par' },
    'soutien>evaluation':          { verbe: 'se_verifie_par' },
    'revision>evaluation':         { verbe: 'se_verifie_par' },
    'evaluation>activite':         { verbe: 'se_verifie_par', inverser: true },
    'evaluation>soutien':          { verbe: 'se_verifie_par', inverser: true },
    'evaluation>revision':         { verbe: 'se_verifie_par', inverser: true },
};

// Groupes de types pour normalisation (verbes horizontaux)
var TYPES_CONNAISSANCE = ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive'];
var TYPES_ACTIVITE = ['activite', 'soutien', 'revision'];

function normaliserType(type) {
    if (TYPES_CONNAISSANCE.indexOf(type) !== -1) return 'connaissance';
    if (TYPES_ACTIVITE.indexOf(type) !== -1) return 'activite';
    return type;
}

// Verbes horizontaux : plusieurs choix possibles par couple
var VERBES_HORIZONTAUX = {
    'connaissance>connaissance':     ['s_appuie_sur', 'complete', 'conduit_a', 'est_mobilise_par'],  // normaliserType → 'connaissance'
    'activite>activite':             ['complete', 'conduit_a'],
    'idee-maitresse>idee-maitresse': ['s_appuie_sur', 'complete']
};

// === NIVEAUX COGNITIFS (Anderson & Krathwohl, 2001) ===
var NIVEAUX_COGNITIFS = [
    { id: 'memoriser',   label: 'Mémoriser',   ordre: 1, description: 'Retrouver des connaissances en mémoire' },
    { id: 'comprendre',  label: 'Comprendre',  ordre: 2, description: 'Construire du sens à partir de l\'information' },
    { id: 'appliquer',   label: 'Appliquer',   ordre: 3, description: 'Utiliser une procédure dans une situation donnée' },
    { id: 'analyser',    label: 'Analyser',    ordre: 4, description: 'Décomposer en parties et comprendre les relations' },
    { id: 'evaluer',     label: 'Évaluer',     ordre: 5, description: 'Porter un jugement selon des critères' },
    { id: 'creer',       label: 'Créer',       ordre: 6, description: 'Assembler des éléments pour produire quelque chose de nouveau' }
];

var BANQUE_VERBES = {
    memoriser:  ['reconnaître', 'identifier', 'rappeler', 'nommer', 'lister', 'définir', 'répéter', 'énoncer', 'repérer', 'associer'],
    comprendre: ['interpréter', 'illustrer', 'classifier', 'résumer', 'inférer', 'comparer', 'expliquer', 'paraphraser', 'décrire', 'distinguer'],
    appliquer:  ['exécuter', 'utiliser', 'résoudre', 'démontrer', 'calculer', 'appliquer', 'mettre en œuvre', 'réaliser', 'employer', 'opérer'],
    analyser:   ['différencier', 'organiser', 'attribuer', 'décomposer', 'structurer', 'examiner', 'déconstruire', 'catégoriser', 'schématiser', 'questionner'],
    evaluer:    ['vérifier', 'critiquer', 'juger', 'justifier', 'évaluer', 'argumenter', 'défendre', 'valider', 'recommander', 'prioriser'],
    creer:      ['générer', 'planifier', 'produire', 'concevoir', 'élaborer', 'construire', 'composer', 'formuler', 'inventer', 'synthétiser']
};

// Types de nœuds qui acceptent le sélecteur de niveau cognitif
var TYPES_AVEC_NIVEAU_COGNITIF = ['competence', 'idee-maitresse', 'activite', 'soutien', 'revision', 'evaluation'];

// === GUIDE INTÉGRÉ — 8 pages (7 pédagogiques + 1 technique import/export) ===
var GUIDE_PAGES = [
    {
        titre: 'Construis ta carte d\u2019alignement',
        contenu:
            '<p>Cette carte t\u2019aide à vérifier que tout ce que tu enseignes est relié à ce que tu évalues. C\u2019est ça, l\u2019alignement pédagogique.</p>' +
            '<p>Chaque élément affiche deux <strong>badges</strong> (gauche\u00a0= amont, droite\u00a0= aval) qui t\u2019indiquent l\u2019état de ses connexions\u00a0:</p>' +
            '<ul>' +
                '<li><span class="icone-inline icone-inline--check" aria-hidden="true"></span> = cet élément est bien relié (le badge prend la couleur de l\u2019élément).</li>' +
                '<li><strong>!</strong> (badge gris) = il manque une connexion.</li>' +
                '<li><span class="icone-inline icone-inline--warning" aria-hidden="true"></span> = attention, une évaluation manque quelque part dans la chaîne.</li>' +
            '</ul>' +
            '<p>Ce guide te propose 7\u00a0étapes pour construire ta carte et utiliser l\u2019import\u00a0/\u00a0export. Tu peux le consulter à tout moment depuis la palette.</p>' +
            '<p class="planif-guide-ref">Anderson, L.\u00a0W. (2026). <em>Curricular alignment: A re-examination</em> (Educational Practices Series, No.\u00a037). UNESCO International Bureau of Education. <a href="https://unesdoc.unesco.org/ark:/48223/pf0000397143.locale=en" target="_blank" rel="noopener">unesdoc.unesco.org</a></p>'
    },
    {
        titre: 'Commence par le pourquoi',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque cours vise des compétences — c\u2019est ce que l\u2019étudiant sera capable de faire à la fin. Tout le reste de ta carte en découle.</p>' +
            '<ol>' +
                '<li>Glisse un élément <span class="planif-guide-type" style="background:var(--planif-couleur-competence)"></span> <strong>Compétence</strong> de la palette sur le canevas.</li>' +
                '<li>Double-clique dessus pour écrire l\u2019énoncé de compétence.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Sélectionne la compétence et utilise le <strong>sélecteur de niveau cognitif</strong> dans l\u2019<strong>Inspecteur</strong> (panneau de droite) pour choisir le niveau visé (ex.\u00a0: Analyser, Créer). Les verbes suggérés t\u2019aideront à formuler ton énoncé.</div>'
    },
    {
        titre: 'Ce que l\u2019étudiant doit retenir',
        contenu:
            '<p class="planif-guide-pourquoi">Une idée maîtresse, c\u2019est l\u2019essentiel — ce qui restera quand l\u2019étudiant aura oublié les détails. Chaque compétence se décline en une ou plusieurs idées maîtresses.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-idee-maitresse)"></span> <strong>Idée maîtresse</strong> sur le canevas.</li>' +
                '<li>Relie-la à sa compétence en tirant un lien d\u2019un port à l\u2019autre. Le verbe <em>«\u00a0se décline en\u00a0»</em> s\u2019affiche automatiquement.</li>' +
                '<li>Le badge d\u2019entrée de l\u2019idée maîtresse affiche <span class="icone-inline icone-inline--check" aria-hidden="true"></span> — elle est connectée en amont.</li>' +
            '</ol>'
    },
    {
        titre: 'Organise dans le temps',
        contenu:
            '<p class="planif-guide-pourquoi">Les séquences et les leçons structurent ton cours dans le temps. Une séquence regroupe des leçons qui poursuivent les mêmes idées maîtresses.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-sequence)"></span> <strong>Séquence</strong> sur le canevas, puis des <span class="planif-guide-type" style="background:var(--planif-couleur-lecon)"></span> <strong>Leçons</strong> à l\u2019intérieur.</li>' +
                '<li>Relie chaque leçon à une ou plusieurs idées maîtresses. Le verbe <em>«\u00a0se concrétise dans\u00a0»</em> apparaît.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Tu peux déplacer une leçon d\u2019une séquence à l\u2019autre en la glissant.</div>'
    },
    {
        titre: 'Ce que tu enseignes concrètement',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque leçon transmet des connaissances. Il en existe 4\u00a0types\u00a0:</p>' +
            '<ul class="planif-guide-types-liste">' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-factuelle)"></span> <strong>Factuelle</strong> — des faits, termes, données. <em>(Ex.\u00a0: les dates clés, les définitions, une formule.)</em></li>' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-conceptuelle)"></span> <strong>Conceptuelle</strong> — des principes, théories, modèles. <em>(Ex.\u00a0: la loi de l\u2019offre et la demande, la structure d\u2019un récit.)</em></li>' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-procedurale)"></span> <strong>Procédurale</strong> — des méthodes, techniques, savoir-faire. <em>(Ex.\u00a0: résoudre une équation, rédiger une introduction.)</em></li>' +
                '<li><span class="planif-guide-type" style="background:var(--planif-couleur-metacognitive)"></span> <strong>Métacognitive</strong> — la conscience de son propre apprentissage. <em>(Ex.\u00a0: planifier son étude, s\u2019autoévaluer.)</em></li>' +
            '</ul>' +
            '<ol>' +
                '<li>Glisse le type de connaissance approprié dans une <strong>Leçon</strong>.</li>' +
                '<li>Double-clique pour nommer la connaissance.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Si tu hésites entre Factuelle et Conceptuelle\u00a0: un fait se vérifie, un concept s\u2019explique.</div>'
    },
    {
        titre: 'Comment l\u2019étudiant va apprendre',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque connaissance a besoin d\u2019une activité pour être acquise. Le type d\u2019activité dépend de ce que tu vises\u00a0: un exercice de mémorisation ne développe pas la même chose qu\u2019une analyse de cas.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-activite)"></span> <strong>Activité</strong> dans la leçon.</li>' +
                '<li>Relie-la à la connaissance qu\u2019elle permet d\u2019acquérir. Le verbe <em>«\u00a0s\u2019acquiert par\u00a0»</em> apparaît.</li>' +
                '<li>Utilise le <strong>sélecteur de niveau cognitif</strong> dans l\u2019<strong>Inspecteur</strong> pour t\u2019assurer que l\u2019activité vise le bon niveau.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce"><span class="planif-guide-type" style="background:var(--planif-couleur-soutien)"></span> <strong>Soutien</strong> et <span class="planif-guide-type" style="background:var(--planif-couleur-revision)"></span> <strong>Révision</strong> sont des types d\u2019activités spécialisées. Utilise «\u00a0Soutien\u00a0» pour l\u2019aide supplémentaire, «\u00a0Révision\u00a0» pour le réinvestissement.</div>'
    },
    {
        titre: 'Vérifie que c\u2019est acquis',
        contenu:
            '<p class="planif-guide-pourquoi">L\u2019évaluation ferme la boucle de l\u2019alignement. Elle doit vérifier ce que tu as enseigné, au niveau cognitif que tu as visé — ni plus, ni moins.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-evaluation)"></span> <strong>Évaluation</strong> sur le canevas.</li>' +
                '<li>Relie-la aux éléments qu\u2019elle évalue\u00a0: idées maîtresses, connaissances ou activités. Le verbe <em>«\u00a0se vérifie par\u00a0»</em> apparaît.</li>' +
                '<li>Quand une compétence est atteinte par au moins une évaluation à travers la chaîne, son badge d\u2019avertissement disparaît.</li>' +
            '</ol>' +
            '<p class="planif-guide-conclusion">L\u2019objectif\u00a0: quand tous les badges de ta carte affichent <span class="icone-inline icone-inline--check" aria-hidden="true"></span> et qu\u2019il n\u2019y a plus de <span class="icone-inline icone-inline--warning" aria-hidden="true"></span>, ton cours est aligné — chaque compétence est enseignée et évaluée de manière cohérente.</p>'
    },
    {
        titre: 'Exporter et importer un plan',
        contenu:
            '<p class="planif-guide-pourquoi">Tu peux exporter ton plan de leçons en format texte (Markdown), le retravailler avec une IA ou un collègue, puis le réimporter. La carte se reconstruit automatiquement.</p>' +
            '<p><strong>Exporter</strong></p>' +
            '<ol>' +
                '<li>Va dans <strong>Plan de la leçon</strong> (onglet du haut).</li>' +
                '<li>Clique <strong>Exporter\u00a0/\u00a0Importer</strong>.</li>' +
                '<li>Utilise <strong>Copier MD</strong> pour copier le plan dans le presse-papiers, ou <strong>Exporter MD</strong> pour télécharger un fichier.</li>' +
            '</ol>' +
            '<p><strong>Retravailler avec une IA</strong></p>' +
            '<ol>' +
                '<li>Colle le plan dans un assistant IA de ton choix.</li>' +
                '<li>Demande-lui d\u2019enrichir les objectifs, d\u2019ajouter des leçons, de réorganiser les séquences\u2026</li>' +
                '<li>L\u2019IA comprend les marqueurs <code>[Séquence]</code> et <code>[Leçon]</code> — elle les conservera dans sa réponse.</li>' +
            '</ol>' +
            '<p><strong>Réimporter</strong></p>' +
            '<ol>' +
                '<li>Retourne dans <strong>Exporter\u00a0/\u00a0Importer</strong>, onglet <strong>Importer MD</strong>.</li>' +
                '<li>Colle le plan retravaillé dans la zone de texte.</li>' +
                '<li>Clique <strong>Prévisualiser</strong> pour vérifier ce qui sera créé.</li>' +
                '<li>Choisis <em>Créer une nouvelle carte</em> ou <em>Ajouter à la carte active</em>.</li>' +
                '<li>Clique <strong>Importer</strong>.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Après l\u2019import, tu peux réorganiser les nœuds sur le canevas et relier les éléments à tes compétences et idées maîtresses.</div>'
    }
];

var _guidePageCourante = 0;
var _guideOuvert = false;

function ouvrirGuide() {
    var panel = document.getElementById('planif-guide-panel');
    if (!panel) return;
    _guideOuvert = true;
    _guidePageCourante = 0;

    var conteneur = panel.querySelector('.planif-guide-panel-contenu');
    conteneur.innerHTML = '';
    conteneur.style.display = '';
    var btnReplier = panel.querySelector('.planif-guide-panel-replier');
    if (btnReplier) { btnReplier.textContent = '−'; btnReplier.title = 'Replier le guide'; }

    var guide = document.createElement('div');
    guide.className = 'planif-guide';
    guide.innerHTML =
        '<div class="planif-guide-header">' +
            '<div class="planif-guide-titre"></div>' +
        '</div>' +
        '<div class="planif-guide-corps"></div>' +
        '<div class="planif-guide-nav">' +
            '<button class="planif-guide-btn-prev" title="Précédent">&larr;</button>' +
            '<div class="planif-guide-dots"></div>' +
            '<button class="planif-guide-btn-next" title="Suivant">&rarr;</button>' +
        '</div>' +
        '<div class="planif-guide-page-num"></div>';

    conteneur.appendChild(guide);

    var btnPrev = guide.querySelector('.planif-guide-btn-prev');
    var btnNext = guide.querySelector('.planif-guide-btn-next');
    var dotsContainer = guide.querySelector('.planif-guide-dots');

    // Créer les 7 points de navigation
    for (var i = 0; i < GUIDE_PAGES.length; i++) {
        var dot = document.createElement('button');
        dot.className = 'planif-guide-dot';
        dot.dataset.page = i;
        dot.title = 'Page ' + (i + 1);
        dot.addEventListener('click', function() {
            _guidePageCourante = parseInt(this.dataset.page);
            rendrePageGuide(guide);
        });
        dotsContainer.appendChild(dot);
    }

    btnPrev.addEventListener('click', function() {
        if (_guidePageCourante > 0) {
            _guidePageCourante--;
            rendrePageGuide(guide);
        }
    });
    btnNext.addEventListener('click', function() {
        if (_guidePageCourante < GUIDE_PAGES.length - 1) {
            _guidePageCourante++;
            rendrePageGuide(guide);
        } else {
            fermerGuide();
        }
    });

    panel.style.display = '';
    rendrePageGuide(guide);
}

function rendrePageGuide(guide) {
    var page = GUIDE_PAGES[_guidePageCourante];
    if (!page) return;

    guide.querySelector('.planif-guide-titre').textContent = page.titre;
    guide.querySelector('.planif-guide-corps').innerHTML = page.contenu;
    guide.querySelector('.planif-guide-page-num').textContent = 'Page ' + (_guidePageCourante + 1) + ' / ' + GUIDE_PAGES.length;

    var btnPrev = guide.querySelector('.planif-guide-btn-prev');
    var btnNext = guide.querySelector('.planif-guide-btn-next');
    btnPrev.disabled = _guidePageCourante === 0;
    btnNext.textContent = _guidePageCourante === GUIDE_PAGES.length - 1 ? 'Terminer' : '\u2192';

    var dots = guide.querySelectorAll('.planif-guide-dot');
    for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('planif-guide-dot-actif', i === _guidePageCourante);
    }
}

function fermerGuide() {
    var panel = document.getElementById('planif-guide-panel');
    if (!panel) return;
    _guideOuvert = false;

    var conteneur = panel.querySelector('.planif-guide-panel-contenu');
    if (conteneur) conteneur.innerHTML = '';
    panel.style.display = 'none';
}

function resoudreVerbe(sourceId, cibleId) {
    var src = etat.noeuds.get(sourceId);
    var cbl = etat.noeuds.get(cibleId);
    if (!src || !cbl) return null;

    // 1. Chercher un verbe vertical (automatique)
    var cle = src.type + '>' + cbl.type;
    var match = VERBES_AUTO[cle];
    if (match) {
        if (match.inverser) {
            return { type: 'vertical', verbe: match.verbe, source: cibleId, cible: sourceId };
        }
        return { type: 'vertical', verbe: match.verbe, source: sourceId, cible: cibleId };
    }

    // 2. Chercher des verbes horizontaux (choix utilisateur)
    var srcN = normaliserType(src.type);
    var cblN = normaliserType(cbl.type);
    var cleH = srcN + '>' + cblN;
    var verbesH = VERBES_HORIZONTAUX[cleH];
    if (verbesH && verbesH.length > 0) {
        return { type: 'horizontal', verbes: verbesH, source: sourceId, cible: cibleId };
    }

    return null;
}

// Migration anciens verbes → nouveaux verbes
var MIGRATION_VERBES = {
    'developpe':    { nouveauVerbe: 'se_decline_en',      inverserDirection: true },
    'vise':         { nouveauVerbe: 'se_concretise_dans', inverserDirection: true },
    'mobilise':     { nouveauVerbe: 's_acquiert_par',     inverserDirection: true },
    'evalue':       { nouveauVerbe: 'se_verifie_par',     inverserDirection: true },
    'verifie':      { nouveauVerbe: 'se_verifie_par',     inverserDirection: true },
    'requiert':     { nouveauVerbe: 's_appuie_sur',       inverserDirection: false },
    'sappuie_sur':  { nouveauVerbe: 's_appuie_sur',       inverserDirection: false }
};

// Compatibilité anciens verbes pour affichage
var VERBES_COMPAT = {
    'prerequis_de': 's_appuie_sur', 'evalue_par': 'se_verifie_par',
    'soutenu_par': 's_acquiert_par', 'revise_dans': 's_acquiert_par',
    'sequence_avant': 'se_concretise_dans',
    'developpe': 'se_decline_en', 'vise': 'se_concretise_dans',
    'mobilise': 's_acquiert_par', 'evalue': 'se_verifie_par',
    'verifie': 'se_verifie_par', 'requiert': 's_appuie_sur',
    'sappuie_sur': 's_appuie_sur'
};
function trouverConfigLien(typeId) {
    var t = TYPES_LIENS.find(function(tl) { return tl.id === typeId; });
    if (t) return t;
    var compat = VERBES_COMPAT[typeId];
    if (compat) return TYPES_LIENS.find(function(tl) { return tl.id === compat; });
    return null;
}

var TYPES_PREALABLE = { 'factuelle': true, 'conceptuelle': true, 'procedurale': true, 'metacognitive': true };

function obtenirLabelNoeud(donnees) {
    var config = TYPES[donnees.type];
    if (!config) return '';
    if (TYPES_PREALABLE[donnees.type] && donnees.metadata && donnees.metadata.prealable) {
        return config.label + ' préalable';
    }
    return config.label;
}

function obtenirCouleurNoeud(donnees) {
    var config = TYPES[donnees.type];
    if (!config) return '#94a3b8';
    if (TYPES_PREALABLE[donnees.type] && donnees.metadata && donnees.metadata.prealable) {
        return 'var(--planif-couleur-prerequis)';
    }
    return config.couleur;
}

function mettreAJourApparenceNoeud(donnees) {
    var el = document.getElementById(donnees.id);
    if (!el) return;
    var couleur = obtenirCouleurNoeud(donnees);
    el.style.borderColor = couleur;
    var typeEl = el.querySelector('.planif-noeud-type');
    if (typeEl) {
        typeEl.textContent = obtenirLabelNoeud(donnees);
        typeEl.style.color = couleur;
    }
    // Badge niveau cognitif
    var badgeCognitif = el.querySelector('.planif-badge-cognitif');
    if (donnees.metadata && donnees.metadata.niveauCognitif && TYPES_AVEC_NIVEAU_COGNITIF.indexOf(donnees.type) !== -1) {
        var nc = NIVEAUX_COGNITIFS.find(function(n) { return n.id === donnees.metadata.niveauCognitif; });
        if (nc) {
            if (!badgeCognitif) {
                badgeCognitif = document.createElement('span');
                badgeCognitif.className = 'planif-badge-cognitif';
                el.appendChild(badgeCognitif);
            }
            badgeCognitif.textContent = nc.label;
        }
    } else if (badgeCognitif) {
        badgeCognitif.remove();
    }
    mettreAJourBadge(donnees);
}

// Traverse la chaîne IM→IM pour trouver une compétence (toute direction de lien)
function ideeMaitresseAtteinCompetence(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var liens = getLiensDeNoeud(noeudId);
    for (var i = 0; i < liens.length; i++) {
        if (liens[i].noeudType === 'competence') return true;
        if (liens[i].noeudType === 'idee-maitresse') {
            if (ideeMaitresseAtteinCompetence(liens[i].noeudId, visited)) return true;
        }
    }
    return false;
}

// Traverse la chaîne IM→IM pour trouver une leçon (toute direction de lien)
function ideeMaitresseAtteinLecon(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var liens = getLiensDeNoeud(noeudId);
    for (var i = 0; i < liens.length; i++) {
        if (liens[i].noeudType === 'lecon' || liens[i].noeudType === 'sequence') return true;
    }
    return false;
}

// Traverse la chaîne horizontale connaissance→connaissance pour trouver un lien vers une activité
function connaissanceAtteinActivite(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var tousLesClones = trouverClones(noeudId);
    var liens = [];
    for (var ci = 0; ci < tousLesClones.length; ci++) {
        liens = liens.concat(getLiensDeNoeud(tousLesClones[ci].id));
    }
    for (var i = 0; i < liens.length; i++) {
        var l = liens[i];
        if (l.noeudType === 'activite' || l.noeudType === 'soutien' || l.noeudType === 'revision') return true;
        if (TYPES_CONNAISSANCE.indexOf(l.noeudType) !== -1) {
            if (connaissanceAtteinActivite(l.noeudId, visited)) return true;
        }
    }
    return false;
}

// Traverse la chaîne IM→IM et descend via leçon→contenu→activité pour trouver une évaluation
function ideeMaitresseAtteinEvaluation(noeudId, visited) {
    if (!visited) visited = {};
    if (visited[noeudId]) return false;
    visited[noeudId] = true;
    var tousLesClones = trouverClones(noeudId);
    var liens = [];
    for (var ci = 0; ci < tousLesClones.length; ci++) {
        liens = liens.concat(getLiensDeNoeud(tousLesClones[ci].id));
    }
    for (var i = 0; i < liens.length; i++) {
        var l = liens[i];
        // Lien direct vers une évaluation
        if (l.noeudType === 'evaluation') return true;
        // Traverser la chaîne IM→IM (complète, s'appuie sur)
        if (l.noeudType === 'idee-maitresse') {
            if (ideeMaitresseAtteinEvaluation(l.noeudId, visited)) return true;
        }
        // Descendre via leçon/séquence → enfants → évaluation
        if (l.noeudType === 'lecon' || l.noeudType === 'sequence') {
            var conteneur = etat.noeuds.get(l.noeudId);
            if (conteneur && conteneur.enfants) {
                for (var j = 0; j < conteneur.enfants.length; j++) {
                    var enfant = etat.noeuds.get(conteneur.enfants[j]);
                    if (!enfant) continue;
                    var liensEnfant = getLiensDeNoeud(enfant.id);
                    if (liensEnfant.some(function(le) { return le.noeudType === 'evaluation'; })) return true;
                    // Connaissance (factuelle/conceptuelle/procédurale/métacognitive) → activité → évaluation
                    if (TYPES_CONNAISSANCE.indexOf(enfant.type) !== -1) {
                        for (var k = 0; k < liensEnfant.length; k++) {
                            if (liensEnfant[k].noeudType === 'activite' || liensEnfant[k].noeudType === 'soutien' || liensEnfant[k].noeudType === 'revision') {
                                var liensAct = getLiensDeNoeud(liensEnfant[k].noeudId);
                                if (liensAct.some(function(la) { return la.noeudType === 'evaluation'; })) return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

// Retourne { entree: {valide, message}, sortie: {valide, message} }
// entree = amont (compétence/objectif), sortie = aval (leçon/activité)
// NOTE clones : Les LIENS sont agrégés sur tous les clones (identité partagée),
// mais le PARENT (containment) est vérifié sur le nœud courant seulement
// car chaque clone vit à sa propre position dans la hiérarchie.
function evaluerBadge(noeud) {
    var type = noeud.type;
    var tousLesClones = trouverClones(noeud.id);
    var liens = [];
    for (var ci = 0; ci < tousLesClones.length; ci++) {
        liens = liens.concat(getLiensDeNoeud(tousLesClones[ci].id));
    }
    switch (type) {
        case 'competence':
            var devParIM = liens.some(function(l) { return l.noeudType === 'idee-maitresse'; });
            var compAtteinEval = devParIM && liens.some(function(l) {
                return l.noeudType === 'idee-maitresse' && ideeMaitresseAtteinEvaluation(l.noeudId);
            });
            var resComp = {
                entree: { valide: true, message: "Point de départ de l'alignement" },
                sortie: devParIM
                    ? { valide: true, message: "Se décline en idée(s) maîtresse(s)" }
                    : { valide: false, message: "Cette compétence ne se décline en aucune idée maîtresse" }
            };
            if (devParIM && !compAtteinEval) {
                resComp.avertissement = "Aucune évaluation ne vérifie cette compétence";
            }
            return resComp;

        case 'idee-maitresse':
            var atteinComp = ideeMaitresseAtteinCompetence(noeud.id);
            var atteinLecon = ideeMaitresseAtteinLecon(noeud.id);
            var atteinEval = ideeMaitresseAtteinEvaluation(noeud.id);
            var resIM = {
                entree: atteinComp
                    ? { valide: true, message: "Reliée à une compétence" }
                    : { valide: false, message: "Aucune compétence reliée (directement ou via une autre idée)" },
                sortie: atteinLecon
                    ? { valide: true, message: "Se concrétise dans une séquence ou leçon" }
                    : { valide: false, message: "Cette idée ne se concrétise dans aucune séquence ou leçon" }
            };
            if (atteinComp && atteinLecon && !atteinEval) {
                resIM.avertissement = "Cette idée ne se vérifie par aucune évaluation";
            }
            return resIM;

        case 'factuelle':
        case 'conceptuelle':
        case 'procedurale':
        case 'metacognitive':
            var labelConn = TYPES[type] ? TYPES[type].label.toLowerCase() : type;
            var dansLecon = noeud.parent && etat.noeuds.get(noeud.parent);
            var estDansLecon = dansLecon && dansLecon.type === 'lecon';
            var atteinActivite = connaissanceAtteinActivite(noeud.id);
            return {
                entree: estDansLecon
                    ? { valide: true, message: "Intégrée dans une leçon" }
                    : { valide: false, message: 'Cette connaissance ' + labelConn + " n'est dans aucune leçon" },
                sortie: atteinActivite
                    ? { valide: true, message: "Reliée à une activité" }
                    : { valide: false, message: "Aucune activité reliée (tracer un lien)" }
            };

        case 'activite':
        case 'soutien':
        case 'revision':
            var lieeConnaissanceE = liens.some(function(l) {
                return TYPES_CONNAISSANCE.indexOf(l.noeudType) !== -1;
            });
            return {
                entree: lieeConnaissanceE
                    ? { valide: true, message: "Reliée à du contenu" }
                    : { valide: false, message: "Aucune connaissance reliée (tracer un lien)" },
                sortie: lieeConnaissanceE
                    ? { valide: true, message: "Reliée à du contenu" }
                    : { valide: false, message: "Aucune connaissance reliée (tracer un lien)" }
            };

        case 'sequence':
            var contientLecon = (noeud.enfants || []).some(function(eid) {
                var e = etat.noeuds.get(eid);
                return e && e.type === 'lecon';
            });
            return {
                entree: { valide: true, message: "Structure organisationnelle" },
                sortie: contientLecon
                    ? { valide: true, message: "Contient au moins une leçon" }
                    : { valide: false, message: "Aucune leçon dans cette séquence" }
            };

        case 'lecon':
            var viseIM = liens.some(function(l) { return l.noeudType === 'idee-maitresse'; });
            var aConn = (noeud.enfants || []).some(function(eid) {
                var e = etat.noeuds.get(eid);
                return e && TYPES_CONNAISSANCE.indexOf(e.type) !== -1;
            });
            var aAct = (noeud.enfants || []).some(function(eid) {
                var e = etat.noeuds.get(eid);
                return e && (e.type === 'activite' || e.type === 'soutien' || e.type === 'revision');
            });
            var msgsSortie = [];
            if (!aConn) msgsSortie.push("Aucune connaissance");
            if (!aAct) msgsSortie.push("Aucune activité");
            return {
                entree: viseIM
                    ? { valide: true, message: "Reliée à une idée maîtresse" }
                    : { valide: false, message: "Aucune idée maîtresse ne se concrétise dans cette leçon" },
                sortie: msgsSortie.length === 0
                    ? { valide: true, message: "Contient du contenu et des activités" }
                    : { valide: false, message: msgsSortie.join(' · ') }
            };

        case 'evaluation':
            var typesAmontEval = ['idee-maitresse', 'factuelle', 'conceptuelle', 'procedurale', 'metacognitive'];
            var typesActivite = ['activite', 'soutien', 'revision'];
            var lieeActiviteOuContenu = liens.some(function(l) {
                return typesAmontEval.indexOf(l.noeudType) !== -1 || typesActivite.indexOf(l.noeudType) !== -1;
            });
            return {
                entree: lieeActiviteOuContenu
                    ? { valide: true, message: "Vérifie un objectif, une connaissance ou une activité" }
                    : { valide: false, message: "Aucun élément relié (tracer un lien vers une activité ou un contenu)" },
                sortie: { valide: true, message: "Preuve de réussite" }
            };

        default:
            return {
                entree: { valide: true, message: "" },
                sortie: { valide: true, message: "" }
            };
    }
}

function resoudreCouleur(cssVar) {
    if (!cssVar || !cssVar.startsWith('var(')) return cssVar;
    var temp = document.createElement('span');
    temp.style.color = cssVar;
    document.body.appendChild(temp);
    var resolved = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return resolved;
}

function appliquerBadge(badge, resultat, couleur) {
    if (resultat.valide) {
        badge.style.backgroundColor = couleur;
        badge.textContent = '\u2713';
        badge.title = resultat.message || '';
        badge.classList.remove('planif-badge-gris');
    } else {
        badge.style.backgroundColor = 'var(--gris-clair)';
        badge.textContent = '!';
        badge.title = resultat.message;
        badge.classList.add('planif-badge-gris');
    }
}

function mettreAJourBadge(donnees) {
    var el = document.getElementById(donnees.id);
    if (!el) return;
    var couleur = resoudreCouleur(obtenirCouleurNoeud(donnees));
    var resultat = evaluerBadge(donnees);

    // Badge entrée (amont — coin supérieur gauche)
    var badgeEntree = el.querySelector('.planif-badge-entree');
    if (!badgeEntree) {
        badgeEntree = document.createElement('span');
        badgeEntree.className = 'planif-badge-validation planif-badge-entree';
        el.appendChild(badgeEntree);
    }
    appliquerBadge(badgeEntree, resultat.entree, couleur);

    // Badge sortie (aval — coin supérieur droit)
    var badgeSortie = el.querySelector('.planif-badge-sortie');
    if (!badgeSortie) {
        badgeSortie = document.createElement('span');
        badgeSortie.className = 'planif-badge-validation planif-badge-sortie';
        el.appendChild(badgeSortie);
    }
    appliquerBadge(badgeSortie, resultat.sortie, couleur);

    // Triangle d'avertissement (non bloquant, ex: IM sans évaluation)
    var triangle = el.querySelector('.planif-badge-avertissement');
    if (resultat.avertissement) {
        if (!triangle) {
            triangle = document.createElement('span');
            triangle.className = 'planif-badge-avertissement';
            el.appendChild(triangle);
        }
        triangle.textContent = '\u26A0';
        triangle.title = resultat.avertissement;
        triangle.style.display = '';
    } else if (triangle) {
        triangle.style.display = 'none';
    }

    mettreAJourIndicateurClone(donnees);
}

function mettreAJourTousLesBadges() {
    for (var entry of etat.noeuds) {
        mettreAJourBadge(entry[1]);
    }
}

// === CONSTANTES ===
const OFFSET_X = 5000;
const OFFSET_Y = 3000;
const ESPACE_W = 10000;
const ESPACE_H = 6000;

// === RÉFÉRENCES DOM (initialisées dans initialiser()) ===
let zoneTravail, espace, espaceWrapper, coucheNoeuds, coucheLiens, canvas, lienTemp;
let panneau, menuLien, rectSelection;
let panneauSeances, panneauSeancesContenu, btnSeances;
let orgSelectSequence, orgSelectLecon, orgLecon;
let seancesOuvert = false;

// === UTILITAIRES DE COORDONNÉES ===
function clientVersData(clientX, clientY) {
    const rect = zoneTravail.getBoundingClientRect();
    return {
        x: (clientX - rect.left + zoneTravail.scrollLeft) / etat.zoom - OFFSET_X,
        y: (clientY - rect.top + zoneTravail.scrollTop) / etat.zoom - OFFSET_Y
    };
}

function clientVersEspace(clientX, clientY) {
    const rect = zoneTravail.getBoundingClientRect();
    return {
        x: (clientX - rect.left + zoneTravail.scrollLeft) / etat.zoom,
        y: (clientY - rect.top + zoneTravail.scrollTop) / etat.zoom
    };
}

// === ZOOM ===
function appliquerZoom() {
    espace.style.transform = 'scale(' + etat.zoom + ')';
    espaceWrapper.style.width = (ESPACE_W * etat.zoom) + 'px';
    espaceWrapper.style.height = (ESPACE_H * etat.zoom) + 'px';
}

function zoomer(clientX, clientY, facteur) {
    const oldZoom = etat.zoom;
    etat.zoom = Math.max(0.25, Math.min(3, etat.zoom * facteur));
    if (etat.zoom === oldZoom) return;

    appliquerZoom();

    const rect = zoneTravail.getBoundingClientRect();
    const cursorLocalX = clientX - rect.left;
    const cursorLocalY = clientY - rect.top;
    const espaceX = (cursorLocalX + zoneTravail.scrollLeft) / oldZoom;
    const espaceY = (cursorLocalY + zoneTravail.scrollTop) / oldZoom;
    zoneTravail.scrollLeft = espaceX * etat.zoom - cursorLocalX;
    zoneTravail.scrollTop = espaceY * etat.zoom - cursorLocalY;

    const zoomInfo = document.getElementById('planif-zoom-info');
    if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
    mettreAJourBoutonsZoomPreset();
}

function mettreAJourBoutonsZoomPreset() {
    var zoomArrondi = Math.round(etat.zoom * 100);
    var texte = zoomArrondi + '%';
    document.querySelectorAll('.planif-btn-zoom-preset').forEach(function(btn) {
        var presetVal = Math.round(parseFloat(btn.dataset.zoom) * 100);
        btn.classList.toggle('actif', presetVal === zoomArrondi);
    });
    var infoHeader = document.getElementById('planif-zoom-info-header');
    if (infoHeader) infoHeader.textContent = texte;
    var infoFooter = document.getElementById('planif-zoom-info');
    if (infoFooter) infoFooter.textContent = texte;
}

// === CRÉER UN NŒUD ===
function creerNoeud(type, x, y) {
    enregistrerPourUndo();
    const id = 'planif-noeud_' + (++etat.compteur);
    const config = TYPES[type];

    const donnees = {
        id: id, type: type,
        titre: '',
        description: '',
        x: x, y: y,
        parent: null,
        enfants: [],
        metadata: {},
        cloneSourceId: null
    };
    etat.noeuds.set(id, donnees);

    const estConteneur = config.conteneur === true;

    const el = document.createElement('div');
    el.className = (estConteneur ? 'planif-noeud planif-conteneur' : 'planif-noeud') + ' planif-type-' + type;
    el.id = id;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.borderColor = estConteneur ? '' : obtenirCouleurNoeud(donnees);

    if (estConteneur) {
        el.innerHTML =
            '<div class="planif-noeud-entete">' +
                '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(donnees) + '">' + obtenirLabelNoeud(donnees) + '</span>' +
            '</div>' +
            '<div class="planif-noeud-titre" contenteditable="true"></div>' +
            '<div class="planif-noeud-zone planif-vide"></div>' +
            '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
            '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
            '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
            '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
    } else {
        el.innerHTML =
            '<div class="planif-noeud-entete">' +
                '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(donnees) + '">' + obtenirLabelNoeud(donnees) + '</span>' +
            '</div>' +
            '<div class="planif-noeud-titre" contenteditable="true"></div>' +
            '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
            '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
            '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
            '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
    }

    attacherEvenements(el, donnees);
    coucheNoeuds.appendChild(el);

    const titreEl = el.querySelector('.planif-noeud-titre');
    setTimeout(function() { titreEl.focus(); }, 50);

    sauvegarder();
    return id;
}

// === SÉLECTION ===
function selectionnerNoeud(id) {
    if (etat.selection) {
        const ancien = document.getElementById(etat.selection);
        if (ancien) ancien.classList.remove('selected');
    }
    etat.selection = id;
    if (id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('selected');
    }
    fermerMenuLien();
}

function deselectionnerTout() {
    if (etat.selection) {
        const ancien = document.getElementById(etat.selection);
        if (ancien) ancien.classList.remove('selected');
        etat.selection = null;
    }
    for (const nid of etat.multiSelection) {
        const el = document.getElementById(nid);
        if (el) el.classList.remove('selected');
    }
    etat.multiSelection.clear();
}

function toggleMultiSelection(id) {
    if (etat.multiSelection.has(id)) {
        etat.multiSelection.delete(id);
        const el = document.getElementById(id);
        if (el) el.classList.remove('selected');
    } else {
        if (etat.selection && !etat.multiSelection.has(etat.selection)) {
            etat.multiSelection.add(etat.selection);
        }
        etat.multiSelection.add(id);
        const el = document.getElementById(id);
        if (el) el.classList.add('selected');
    }
}

function toutSelectionner() {
    etat.multiSelection.clear();
    for (const [nid] of etat.noeuds) {
        etat.multiSelection.add(nid);
        const el = document.getElementById(nid);
        if (el) el.classList.add('selected');
    }
}

function deselectionner() {
    deselectionnerTout();
    fermerPanneau();
}

// === PANNEAU LATÉRAL ===
function ouvrirPanneau(id) {
    const donnees = etat.noeuds.get(id);
    if (!donnees) return;
    if (!donnees.metadata) donnees.metadata = {};
    const config = TYPES[donnees.type];

    document.getElementById('planif-panneau-pastille').style.background = obtenirCouleurNoeud(donnees);
    document.getElementById('planif-panneau-type').textContent = obtenirLabelNoeud(donnees);
    document.getElementById('planif-panneau-titre').value = donnees.titre;
    document.getElementById('planif-panneau-description').value = donnees.description || '';

    // Champs extra selon le type
    const extra = document.getElementById('planif-panneau-extra');
    extra.innerHTML = '';

    // Chantier temps (4 ao\u00fbt 2026, d\u00e9cision Gr\u00e9goire) : les ACTIVIT\u00c9S portent
    // une dur\u00e9e estim\u00e9e en minutes ; la dur\u00e9e d'une LE\u00c7ON est un rollup pur
    // (somme de ses activit\u00e9s). La conversion en p\u00e9riodes suit TOUJOURS
    // \u00ab Dur\u00e9e d'une p\u00e9riode \u00bb du cadre (obtenirDureePeriode) \u2014 jamais en dur.
    if (donnees.type === 'activite') {
        var meta = donnees.metadata;
        var hasDuree = !!meta.duree;
        extra.innerHTML +=
            '<div class="planif-duree-section" id="planif-duree-section" style="' + (hasDuree ? '' : 'display:none') + '">' +
                '<label for="planif-duree-min">Dur\u00e9e estim\u00e9e</label>' +
                '<div class="planif-duree-calc">' +
                    '<input type="number" id="planif-duree-min" value="' + (parseInt(meta.duree, 10) || '') + '" min="1" max="600" placeholder="min">' +
                    '<span class="planif-duree-sep">min</span>' +
                    '<span class="planif-duree-total" id="planif-duree-equiv">' + equivalencePeriodesTexte(meta.duree) + '</span>' +
                '</div>' +
            '</div>' +
            '<button type="button" class="planif-duree-ajouter" id="planif-duree-ajouter" style="' + (hasDuree ? 'display:none' : '') + '">+ Dur\u00e9e</button>';

        function recalcDuree() {
            var min = parseInt(document.getElementById('planif-duree-min').value) || 0;
            meta.duree = min || null;
            // L'ancien couple p\u00e9riodes \u00d7 min/p\u00e9r PAR N\u0152UD faisait doublon avec
            // la dur\u00e9e de p\u00e9riode du cadre : purg\u00e9 \u00e0 la premi\u00e8re r\u00e9\u00e9dition.
            delete meta.periodes;
            delete meta.minutesParPeriode;
            document.getElementById('planif-duree-equiv').textContent = equivalencePeriodesTexte(min);
            propagerModification(id, 'metadata', JSON.parse(JSON.stringify(meta)));
            sauvegarder();
            mettreAJourPlanificateur();
        }

        var minInput = extra.querySelector('#planif-duree-min');
        minInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        minInput.addEventListener('input', recalcDuree);

        extra.querySelector('#planif-duree-ajouter').addEventListener('click', function() {
            document.getElementById('planif-duree-section').style.display = '';
            this.style.display = 'none';
            document.getElementById('planif-duree-min').focus();
        });
    }

    if (donnees.type === 'lecon') {
        var totalLecon = dureeRollupNoeud(donnees);
        extra.innerHTML +=
            '<div class="planif-duree-section">' +
                '<label>Dur\u00e9e (somme des activit\u00e9s)</label>' +
                '<div class="planif-duree-rollup">' +
                    (totalLecon
                        ? '\u03a3 ' + totalLecon + '\u2009min ' + equivalencePeriodesTexte(totalLecon)
                        : '\u2014 estime la dur\u00e9e de ses activit\u00e9s pour la calculer') +
                '</div>' +
            '</div>';
    }

    // Ancrage temporel : SAISI sur la leçon (D3), DÉRIVÉ sur la séquence.
    // L'ancien couple « Semaine début / Semaine fin » de la séquence est retiré
    // — il pouvait contredire ses propres leçons.
    if (donnees.type === 'lecon') {
        var semLecon = semaineDeLecon(donnees);
        extra.innerHTML +=
            '<label for="planif-panneau-semaine">Semaine</label>' +
            '<input type="number" id="planif-panneau-semaine" value="' + (semLecon === null ? '' : semLecon) + '" min="1" placeholder="non planifiée">';
        var semInput = extra.querySelector('#planif-panneau-semaine');
        semInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        semInput.addEventListener('input', function(e) {
            definirSemaineLecon(id, e.target.value);
            mettreAJourPlanificateur();
        });
    }

    // « Dans la leçon » — déplacement SANS geste, depuis l'inspecteur (friction
    // F7, précision du 6 août : sur iPad il n'existe ni ⌘ ni glisser de nœud
    // — le tactile du canevas est une porte ouverte du relais. Le double-clic
    // qui ouvre cet inspecteur, lui, marche partout : le sélecteur devient le
    // chemin universel pour changer une activité de leçon ou la sortir.)
    if (peutContenir('lecon', donnees.type)) {
        var leconsCarte = [];
        for (var entryL of etat.noeuds) {
            if (entryL[1].type === 'lecon') leconsCarte.push(entryL[1]);
        }
        leconsCarte.sort(function(a, b) { return ((a.y || 0) - (b.y || 0)) || ((a.x || 0) - (b.x || 0)); });
        if (leconsCarte.length > 0) {
            var htmlDeplacer = '<label for="planif-panneau-deplacer">Dans la leçon</label>' +
                '<select id="planif-panneau-deplacer">' +
                '<option value=""' + (donnees.parent ? '' : ' selected') + '>— Aucune (bloc libre)</option>';
            for (var li2 = 0; li2 < leconsCarte.length; li2++) {
                var lc2 = leconsCarte[li2];
                htmlDeplacer += '<option value="' + lc2.id + '"' + (donnees.parent === lc2.id ? ' selected' : '') + '>' +
                    echapperHtml(lc2.titre || 'Sans titre') + '</option>';
            }
            htmlDeplacer += '</select>';
            extra.innerHTML += htmlDeplacer;
            // ⚠ Le listener est posé EN FIN de ouvrirPanneau : tout
            // `extra.innerHTML +=` ultérieur (ex. bloc niveau cognitif des
            // activités) re-sérialise le conteneur et tuerait un listener
            // posé ici.
        }
    }

    if (donnees.type === 'sequence') {
        var etendueSeq = etendueTemporelle(donnees);
        extra.innerHTML +=
            '<label>Semaines (dérivées des leçons)</label>' +
            '<div class="planif-panneau-derive">' +
                (etendueSeq
                    ? formaterEtendue(etendueSeq)
                    : '— assigne une semaine à ses leçons') +
            '</div>';
    }

    if (TYPES_PREALABLE[donnees.type]) {
        var checked = donnees.metadata && donnees.metadata.prealable ? ' checked' : '';
        extra.innerHTML +=
            '<div class="planif-panneau-prealable">' +
                '<label class="planif-checkbox-label">' +
                    '<input type="checkbox" id="planif-panneau-prealable"' + checked + '>' +
                    ' Préalable' +
                '</label>' +
            '</div>';
        extra.querySelector('#planif-panneau-prealable').addEventListener('change', function(e) {
            enregistrerPourUndo();
            if (!donnees.metadata) donnees.metadata = {};
            donnees.metadata.prealable = e.target.checked;
            mettreAJourApparenceNoeud(donnees);
            document.getElementById('planif-panneau-pastille').style.background = obtenirCouleurNoeud(donnees);
            document.getElementById('planif-panneau-type').textContent = obtenirLabelNoeud(donnees);
            sauvegarder();
        });
    }

    if (donnees.type === 'evaluation') {
        var retros = [['aucune', 'Aucune'], ['orale', 'Orale'], ['ecrite', 'Écrite'], ['pairs', 'Par les pairs']];
        var retVal = donnees.metadata.retroaction || 'aucune';
        var htmlRetro = '<label for="planif-panneau-retroaction">Rétroaction</label>' +
            '<select id="planif-panneau-retroaction">';
        for (var ri = 0; ri < retros.length; ri++) {
            htmlRetro += '<option value="' + retros[ri][0] + '"' + (retVal === retros[ri][0] ? ' selected' : '') + '>' + retros[ri][1] + '</option>';
        }
        htmlRetro += '</select>';

        var prodVal = donnees.metadata.productionId || '';
        var productions = chargerProductions();
        var htmlProd = '<label for="planif-panneau-production">Production</label>' +
            '<select id="planif-panneau-production">' +
            '<option value="">Aucune</option>';
        if (productions.length > 0) {
            var parType = {};
            for (var pp = 0; pp < productions.length; pp++) {
                var tp = productions[pp].type || 'autre';
                if (!parType[tp]) parType[tp] = [];
                parType[tp].push(productions[pp]);
            }
            var typesOrdre = ['travail', 'examen', 'projet', 'quiz', 'autre'];
            var typesLabels = { travail: 'Travaux', examen: 'Examens', projet: 'Projets', quiz: 'Quiz', autre: 'Autres' };
            for (var ti = 0; ti < typesOrdre.length; ti++) {
                var grp = parType[typesOrdre[ti]];
                if (!grp || grp.length === 0) continue;
                htmlProd += '<optgroup label="' + (typesLabels[typesOrdre[ti]] || typesOrdre[ti]) + '">';
                for (var pi = 0; pi < grp.length; pi++) {
                    var selAttr = prodVal === grp[pi].id ? ' selected' : '';
                    htmlProd += '<option value="' + grp[pi].id + '"' + selAttr + '>' + grp[pi].nom + ' (' + (grp[pi].ponderation || 0) + ' %)</option>';
                }
                htmlProd += '</optgroup>';
            }
        }
        htmlProd += '</select>';

        extra.innerHTML += htmlRetro + htmlProd;

        extra.querySelector('#planif-panneau-retroaction').addEventListener('change', function(e) {
            enregistrerPourUndo();
            donnees.metadata.retroaction = e.target.value;
            sauvegarder();
        });
        extra.querySelector('#planif-panneau-production').addEventListener('change', function(e) {
            enregistrerPourUndo();
            donnees.metadata.productionId = e.target.value || null;
            sauvegarder();
        });
    }

    // Sélecteur de niveau cognitif (Anderson)
    if (TYPES_AVEC_NIVEAU_COGNITIF.indexOf(donnees.type) !== -1) {
        var niveauVal = donnees.metadata.niveauCognitif || '';
        var htmlNiveau = '<label for="planif-panneau-niveau-cognitif">Niveau cognitif</label>' +
            '<select id="planif-panneau-niveau-cognitif">' +
            '<option value="">— Non défini —</option>';
        for (var ni = 0; ni < NIVEAUX_COGNITIFS.length; ni++) {
            var nc = NIVEAUX_COGNITIFS[ni];
            htmlNiveau += '<option value="' + nc.id + '"' + (niveauVal === nc.id ? ' selected' : '') + '>' + nc.ordre + '. ' + nc.label + '</option>';
        }
        htmlNiveau += '</select>';
        htmlNiveau += '<div id="planif-panneau-niveau-desc" class="planif-panneau-niveau-desc"></div>';
        htmlNiveau += '<div id="planif-panneau-verbes" class="planif-panneau-verbes"></div>';
        extra.innerHTML += htmlNiveau;

        var selectNiveau = extra.querySelector('#planif-panneau-niveau-cognitif');
        var descDiv = extra.querySelector('#planif-panneau-niveau-desc');
        var verbesDiv = extra.querySelector('#planif-panneau-verbes');

        function afficherVerbes(niveauId) {
            if (!niveauId) {
                descDiv.textContent = '';
                verbesDiv.innerHTML = '';
                return;
            }
            var niveauObj = NIVEAUX_COGNITIFS.find(function(n) { return n.id === niveauId; });
            if (niveauObj) descDiv.textContent = niveauObj.description;
            var verbes = BANQUE_VERBES[niveauId] || [];
            verbesDiv.innerHTML = '';
            for (var vi = 0; vi < verbes.length; vi++) {
                var tag = document.createElement('button');
                tag.type = 'button';
                tag.className = 'planif-verbe-tag';
                tag.textContent = verbes[vi];
                tag.dataset.verbe = verbes[vi];
                tag.addEventListener('click', function() {
                    var verbe = this.dataset.verbe;
                    var titreInput = document.getElementById('planif-panneau-titre');
                    if (titreInput) {
                        var titreCourant = titreInput.value.trim();
                        if (!titreCourant.toLowerCase().startsWith(verbe.toLowerCase())) {
                            enregistrerPourUndo();
                            var nouveauTitre = verbe.charAt(0).toUpperCase() + verbe.slice(1) + (titreCourant ? ' ' + titreCourant : '');
                            titreInput.value = nouveauTitre;
                            titreInput.dispatchEvent(new Event('input'));
                        }
                    }
                });
                verbesDiv.appendChild(tag);
            }
        }
        afficherVerbes(niveauVal);

        selectNiveau.addEventListener('change', function(e) {
            enregistrerPourUndo();
            donnees.metadata.niveauCognitif = e.target.value || null;
            afficherVerbes(e.target.value);
            mettreAJourApparenceNoeud(donnees);
            sauvegarder();
        });
    }

    // Événements du panneau
    document.getElementById('planif-panneau-titre').onfocus = function() {
        enregistrerPourUndo();
    };
    document.getElementById('planif-panneau-titre').oninput = function(e) {
        donnees.titre = e.target.value;
        const titreEl = document.getElementById(id);
        if (titreEl) {
            const t = titreEl.querySelector('.planif-noeud-titre');
            if (t) t.textContent = donnees.titre;
        }
        propagerModification(id, 'titre', e.target.value);
    };

    document.getElementById('planif-panneau-description').onfocus = function() {
        enregistrerPourUndo();
    };
    document.getElementById('planif-panneau-description').oninput = function(e) {
        donnees.description = e.target.value;
        propagerModification(id, 'description', e.target.value);
        sauvegarder();
    };

    // Clone info
    var cloneInfo = document.getElementById('planif-panneau-clone-info');
    if (cloneInfo) {
        if (doitAfficherIndicateurClone(donnees)) {
            var clones = trouverClones(id);
            var nb = clones.length;
            cloneInfo.style.display = '';
            cloneInfo.innerHTML = '<span class="planif-clone-compteur">\uD83E\uDDEC ' + nb + ' instance' + (nb > 1 ? 's' : '') + '</span>' +
                ' <a href="#" id="planif-clone-voir-autres" class="planif-clone-lien">Voir les autres</a>';
            var lienVoir = document.getElementById('planif-clone-voir-autres');
            if (lienVoir) {
                lienVoir.onclick = function(ev) {
                    ev.preventDefault();
                    var autresClones = trouverClones(id);
                    for (var ac = 0; ac < autresClones.length; ac++) {
                        if (autresClones[ac].id !== id) {
                            var elClone = document.getElementById(autresClones[ac].id);
                            if (elClone) {
                                elClone.classList.add('clone-surbrillance');
                                (function(el2) {
                                    setTimeout(function() { el2.classList.remove('clone-surbrillance'); }, 2500);
                                })(elClone);
                            }
                        }
                    }
                };
            }
        } else {
            cloneInfo.style.display = 'none';
            cloneInfo.innerHTML = '';
        }
    }

    // Bouton cloner/dupliquer : feuille = instance liée (« Cloner »),
    // conteneur = copie indépendante en profondeur (« Dupliquer »).
    var btnCloner = document.getElementById('planif-btn-cloner');
    if (btnCloner) {
        var estConteneurP = config && config.conteneur;
        btnCloner.disabled = false;
        btnCloner.innerHTML = '<img src="icons/icon-copy.svg" alt="" class="btn-inline-icon"> ' + // security-ok: ternaire de deux littéraux statiques, aucune donnée utilisateur
            (estConteneurP ? 'Dupliquer' : 'Cloner');
        btnCloner.onclick = function() {
            clonerNoeud(id);
            fermerPanneau();
        };
    }

    document.getElementById('planif-btn-supprimer').onclick = function() {
        supprimerNoeud(id);
        fermerPanneau();
    };

    // « Dans la leçon » : attaché APRÈS la dernière écriture d'innerHTML dans
    // `extra` — une écriture ultérieure re-crée les éléments et perd les
    // listeners posés avant elle (constaté à la sonde Chromium, 6 août).
    var selDeplacer = extra.querySelector('#planif-panneau-deplacer');
    if (selDeplacer) {
        selDeplacer.addEventListener('change', function(e) {
            enregistrerPourUndo();
            var cibleDep = e.target.value;
            if (cibleDep) {
                rattacherAuConteneur(id, cibleDep);
            } else if (donnees.parent) {
                detacherDuConteneur(id);
            }
            sauvegarder();
            mettreAJourPlanificateur();
        });
    }

    panneau.classList.add('visible');
    etat.panneauOuvert = true;
}

function fermerPanneau() {
    if (panneau) panneau.classList.remove('visible');
    etat.panneauOuvert = false;
}

// === SUPPRESSION ===
function supprimerNoeud(id) {
    enregistrerPourUndo();
    const donnees = etat.noeuds.get(id);

    // Clone transfer: if deleting an original that has clones, promote first clone
    if (donnees && !donnees.cloneSourceId && aDesClones(id)) {
        var clonesATransferer = [];
        for (var entry of etat.noeuds) {
            var n = entry[1];
            if (n.cloneSourceId === id) clonesATransferer.push(n);
        }
        // Désindexer tous les clones de l'ancien sourceId avant transfert
        for (var cdi = 0; cdi < clonesATransferer.length; cdi++) {
            _desindexerClone(clonesATransferer[cdi]);
        }
        if (clonesATransferer.length > 0) {
            var nouvelOriginal = clonesATransferer[0];
            nouvelOriginal.cloneSourceId = null;
            for (var ct = 1; ct < clonesATransferer.length; ct++) {
                clonesATransferer[ct].cloneSourceId = nouvelOriginal.id;
                _indexerClone(clonesATransferer[ct]);
            }
        }
    } else if (donnees) {
        _desindexerClone(donnees);
    }

    if (donnees && donnees.enfants) {
        for (const eid of [].concat(donnees.enfants)) {
            detacherDuConteneur(eid);
        }
    }

    if (donnees && donnees.parent) {
        detacherDuConteneur(id);
    }

    var liensASupprimer = [];
    for (const [lienId, lien] of etat.liens) {
        if (lien.source === id || lien.cible === id) {
            liensASupprimer.push(lienId);
        }
    }
    for (var li = 0; li < liensASupprimer.length; li++) {
        supprimerLien(liensASupprimer[li]);
    }
    etat.noeuds.delete(id);
    const el = document.getElementById(id);
    if (el) el.remove();
    if (etat.selection === id) etat.selection = null;

    // Update clone indicators for remaining clones
    if (donnees) {
        var sourceId = donnees.cloneSourceId || id;
        var restants = [];
        for (var entryR of etat.noeuds) {
            var nR = entryR[1];
            if (nR.id === sourceId || nR.cloneSourceId === sourceId) restants.push(nR);
        }
        for (var ri = 0; ri < restants.length; ri++) {
            mettreAJourIndicateurClone(restants[ri]);
        }
    }

    sauvegarder();
}

// === CLONAGE — UTILITAIRES ===
function mettreAJourIndicateurClone(noeud) {
    if (!noeud) return;
    var el = document.getElementById(noeud.id);
    if (!el) return;
    var indicateur = el.querySelector('.indicateur-clone');
    if (doitAfficherIndicateurClone(noeud)) {
        if (!indicateur) {
            indicateur = document.createElement('span');
            indicateur.className = 'indicateur-clone';
            indicateur.textContent = '\uD83E\uDDEC';
            indicateur.title = 'Ce nœud est un clone';
            el.appendChild(indicateur);
            indicateur.addEventListener('mouseenter', function() {
                var clones = trouverClones(noeud.id);
                for (var i = 0; i < clones.length; i++) {
                    if (clones[i].id !== noeud.id) {
                        var clEl = document.getElementById(clones[i].id);
                        if (clEl) clEl.classList.add('clone-surbrillance');
                    }
                }
            });
            indicateur.addEventListener('mouseleave', function() {
                var clones = trouverClones(noeud.id);
                for (var i = 0; i < clones.length; i++) {
                    if (clones[i].id !== noeud.id) {
                        var clEl = document.getElementById(clones[i].id);
                        if (clEl) clEl.classList.remove('clone-surbrillance');
                    }
                }
            });
        }
    } else {
        if (indicateur) indicateur.remove();
    }
}

// --- Maintenance de l'index inverse clones ---
function _indexerClone(noeud) {
    if (!noeud || !noeud.cloneSourceId) return;
    var set = _cloneIndex.get(noeud.cloneSourceId);
    if (!set) { set = new Set(); _cloneIndex.set(noeud.cloneSourceId, set); }
    set.add(noeud.id);
}

function _desindexerClone(noeud) {
    if (!noeud || !noeud.cloneSourceId) return;
    var set = _cloneIndex.get(noeud.cloneSourceId);
    if (set) {
        set.delete(noeud.id);
        if (set.size === 0) _cloneIndex.delete(noeud.cloneSourceId);
    }
}

function _reconstruireCloneIndex() {
    _cloneIndex.clear();
    for (var entry of etat.noeuds) {
        _indexerClone(entry[1]);
    }
}

function trouverClones(noeudId) {
    var donnees = etat.noeuds.get(noeudId);
    if (!donnees) return [];
    var sourceId = donnees.cloneSourceId || noeudId;
    var resultats = [];
    // L'original
    var original = etat.noeuds.get(sourceId);
    if (original) resultats.push(original);
    // Les clones via l'index
    var set = _cloneIndex.get(sourceId);
    if (set) {
        for (var cid of set) {
            var c = etat.noeuds.get(cid);
            if (c && c.id !== sourceId) resultats.push(c);
        }
    }
    return resultats;
}

function estClone(noeudId) {
    var donnees = etat.noeuds.get(noeudId);
    return donnees != null && donnees.cloneSourceId != null;
}

function aDesClones(noeudId) {
    var set = _cloneIndex.get(noeudId);
    return set != null && set.size > 0;
}

function doitAfficherIndicateurClone(noeud) {
    if (!noeud) return false;
    if (noeud.cloneSourceId) return true;
    return aDesClones(noeud.id);
}

function propagerModification(noeudId, champ, valeur) {
    var clones = trouverClones(noeudId);
    for (var i = 0; i < clones.length; i++) {
        var c = clones[i];
        if (c.id === noeudId) continue;
        if (champ === 'metadata') {
            c.metadata = JSON.parse(JSON.stringify(valeur));
        } else {
            c[champ] = valeur;
        }
        if (champ === 'titre') {
            var el = document.getElementById(c.id);
            if (el) {
                var t = el.querySelector('.planif-noeud-titre');
                if (t) t.textContent = valeur;
            }
        }
    }
}

/**
 * Dupliquer un CONTENEUR en profondeur — copie INDÉPENDANTE, pas une
 * instance liée (demande Grégoire, 6 août soir : le patron « prototype »
 * de Keynote — une leçon modèle qu'on duplique puis dont on modifie le
 * contenu librement). Le clonage-miroir reste réservé aux feuilles : pour
 * un conteneur, la synchronisation des ENFANTS entre instances n'a pas de
 * réponse simple, et la metadata propagée embarquerait la semaine.
 *
 * La copie : nouveaux ids partout, cloneSourceId null (indépendance),
 * positions relatives conservées (+40/+40), objectifs recopiés avec de
 * NOUVEAUX ids (l'unicité prépare #403), liens INTERNES recréés entre les
 * copies — les liens vers l'extérieur ne sont PAS copiés : la copie n'est
 * pas encore alignée, ne pas le prétendre.
 * @returns {string|null} id de la racine copiée
 */
function dupliquerConteneurEnProfondeur(noeudId) {
    var source = etat.noeuds.get(noeudId);
    if (!source) return null;
    var configD = TYPES[source.type];
    if (!configD || !configD.conteneur) return null;

    enregistrerPourUndo();
    var DX = 40, DY = 40;
    var correspondance = new Map();

    function copier(nid, parentId) {
        var n = etat.noeuds.get(nid);
        if (!n) return null;
        var nouveau = {
            id: 'planif-noeud_' + (++etat.compteur),
            type: n.type,
            titre: n.titre || '',
            description: n.description || '',
            x: n.x + DX,
            y: n.y + DY,
            parent: parentId,
            enfants: [],
            metadata: JSON.parse(JSON.stringify(n.metadata || {})),
            cloneSourceId: null
        };
        if (Array.isArray(nouveau.metadata.objectifs)) {
            nouveau.metadata.objectifs.forEach(function(o) { if (o) o.id = nouvelIdObjectif(); });
        }
        etat.noeuds.set(nouveau.id, nouveau);
        correspondance.set(nid, nouveau.id);
        (n.enfants || []).forEach(function(eid) {
            var copie = copier(eid, nouveau.id);
            if (copie) nouveau.enfants.push(copie);
        });
        return nouveau.id;
    }

    var racineId = copier(noeudId, source.parent);

    // Le prototype vit dans une séquence ? La copie y entre aussi.
    if (source.parent) {
        var parentD = etat.noeuds.get(source.parent);
        if (parentD) {
            if (!parentD.enfants) parentD.enfants = [];
            parentD.enfants.push(racineId);
        }
    }

    for (var entryLD of etat.liens) {
        var lD = entryLD[1];
        if (correspondance.has(lD.source) && correspondance.has(lD.cible)) {
            var idLien = 'planif-lien_' + (++etat.compteurLiens);
            etat.liens.set(idLien, {
                id: idLien,
                source: correspondance.get(lD.source),
                cible: correspondance.get(lD.cible),
                type: lD.type
            });
        }
    }

    reconstruireDOM();
    sauvegarder();
    if (source.parent) reLayoutAvecAnimation(source.parent);
    afficherToastLien('Copie indépendante créée — modifie-la sans toucher l\'originale.');
    return racineId;
}

function clonerNoeud(noeudId) {
    var source = etat.noeuds.get(noeudId);
    if (!source) return;
    var config = TYPES[source.type];
    if (config && config.conteneur) {
        // Conteneur : copie indépendante en profondeur (le miroir lié reste
        // réservé aux feuilles — cf. dupliquerConteneurEnProfondeur).
        return dupliquerConteneurEnProfondeur(noeudId);
    }
    enregistrerPourUndo();

    var DECALAGE = 60;
    var newId = 'planif-noeud_' + (++etat.compteur);
    var cloneSourceId = source.cloneSourceId || source.id;

    var donnees = {
        id: newId, type: source.type,
        titre: source.titre || '',
        description: source.description || '',
        x: source.x + DECALAGE, y: source.y + DECALAGE,
        parent: null,
        enfants: [],
        metadata: JSON.parse(JSON.stringify(source.metadata || {})),
        cloneSourceId: cloneSourceId
    };
    etat.noeuds.set(newId, donnees);
    _indexerClone(donnees);

    var el = document.createElement('div');
    el.className = 'planif-noeud planif-type-' + source.type;
    el.id = newId;
    el.style.left = donnees.x + 'px';
    el.style.top = donnees.y + 'px';
    el.style.borderColor = obtenirCouleurNoeud(donnees);

    el.innerHTML =
        '<div class="planif-noeud-entete">' +
            '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(donnees) + '">' + obtenirLabelNoeud(donnees) + '</span>' +
        '</div>' +
        '<div class="planif-noeud-titre" contenteditable="true">' + echapperHtml(donnees.titre || '') + '</div>' +
        '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
        '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
        '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
        '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';

    attacherEvenements(el, donnees);
    coucheNoeuds.appendChild(el);

    mettreAJourIndicateurClone(donnees);
    var sourceOriginal = etat.noeuds.get(cloneSourceId);
    if (sourceOriginal) mettreAJourIndicateurClone(sourceOriginal);
    // Also update other clones' indicators
    var tousClones = trouverClones(newId);
    for (var ci = 0; ci < tousClones.length; ci++) {
        if (tousClones[ci].id !== newId && tousClones[ci].id !== cloneSourceId) {
            mettreAJourIndicateurClone(tousClones[ci]);
        }
    }

    selectionnerNoeud(newId);
    sauvegarder();
    return newId;
}

function supprimerLien(lienId) {
    enregistrerPourUndo();
    etat.liens.delete(lienId);
    const groupe = document.getElementById(lienId + '-groupe');
    if (groupe) groupe.remove();
    sauvegarder();
}

// === LIENS ===
function demarrerLien(noeudId, direction, e) {
    etat.lienEnCours = { noeudSourceId: noeudId, portDirection: direction };
    const pos = getPortPosition(noeudId, direction);
    lienTemp.setAttribute('x1', pos.x);
    lienTemp.setAttribute('y1', pos.y);
    lienTemp.setAttribute('x2', pos.x);
    lienTemp.setAttribute('y2', pos.y);
    lienTemp.style.display = 'block';

    function onMove(e2) {
        var p = clientVersData(e2.clientX, e2.clientY);
        lienTemp.setAttribute('x2', p.x);
        lienTemp.setAttribute('y2', p.y);
    }

    function onUp(e2) {
        lienTemp.style.display = 'none';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        var elSous = document.elementFromPoint(e2.clientX, e2.clientY);
        var noeudCibleEl = elSous ? elSous.closest('.planif-noeud') : null;
        if (noeudCibleEl && noeudCibleEl.id !== noeudId) {
            afficherMenuLien(e2.clientX, e2.clientY, noeudId, noeudCibleEl.id);
        }
        etat.lienEnCours = null;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function creerLien(sourceId, cibleId, typeLien) {
    // #130 : vérifier doublon avant création
    for (var entry of etat.liens) {
        var ex = entry[1];
        if (ex.source === sourceId && ex.cible === cibleId && ex.type === typeLien) {
            return ex.id;
        }
    }
    enregistrerPourUndo();
    var id = 'planif-lien_' + (++etat.compteurLiens);
    var donnees = { id: id, source: sourceId, cible: cibleId, type: typeLien };
    etat.liens.set(id, donnees);
    dessinerLien(donnees);

    // Re-layouter si les deux nœuds partagent le même conteneur
    var srcNode = etat.noeuds.get(sourceId);
    var cblNode = etat.noeuds.get(cibleId);
    if (srcNode && cblNode && srcNode.parent && srcNode.parent === cblNode.parent) {
        reLayoutConteneur(srcNode.parent);
    }

    sauvegarder();
    return id;
}

function dessinerLien(donnees) {
    var sourceEl = document.getElementById(donnees.source);
    var cibleEl = document.getElementById(donnees.cible);
    if (!sourceEl || !cibleEl) return;

    var ports = trouverMeilleursPorts(donnees.source, donnees.cible);
    var p1 = getPortPosition(donnees.source, ports.portSource);
    var p2 = getPortPosition(donnees.cible, ports.portCible);

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var tension = Math.max(Math.min(dist * 0.35, 80), 30);
    var cx1 = ports.portSource === 'droite' ? p1.x + tension : ports.portSource === 'gauche' ? p1.x - tension : p1.x;
    var cy1 = ports.portSource === 'bas' ? p1.y + tension : ports.portSource === 'haut' ? p1.y - tension : p1.y;
    var cx2 = ports.portCible === 'droite' ? p2.x + tension : ports.portCible === 'gauche' ? p2.x - tension : p2.x;
    var cy2 = ports.portCible === 'bas' ? p2.y + tension : ports.portCible === 'haut' ? p2.y - tension : p2.y;

    var ancien = document.getElementById(donnees.id + '-groupe');
    if (ancien) ancien.remove();

    var groupe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupe.id = donnees.id + '-groupe';
    groupe.setAttribute('class', 'planif-lien-groupe');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = donnees.id;
    path.setAttribute('d', 'M ' + p1.x + ' ' + p1.y + ' C ' + cx1 + ' ' + cy1 + ', ' + cx2 + ' ' + cy2 + ', ' + p2.x + ' ' + p2.y);
    path.setAttribute('class', 'planif-lien');

    var sourceData = etat.noeuds.get(donnees.source);
    var couleur = (sourceData && TYPES[sourceData.type]) ? TYPES[sourceData.type].couleur : 'var(--planif-couleur-lien)';
    path.style.stroke = couleur;

    // Créer un marker de flèche dédié avec la couleur du lien
    var markerId = donnees.id + '-fleche';
    var ancienMarker = document.getElementById(markerId);
    if (ancienMarker) ancienMarker.remove();
    var defs = canvas.querySelector('defs');
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.id = markerId;
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('orient', 'auto-start-reverse');
    var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', couleur);
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    path.setAttribute('marker-end', 'url(#' + markerId + ')');

    path.addEventListener('click', function(e) {
        e.stopPropagation();
        afficherMenuLienExistant(e.clientX, e.clientY, donnees.id);
    });

    groupe.appendChild(path);

    var typeLienConfig = trouverConfigLien(donnees.type);
    if (typeLienConfig) {
        var mx = (p1.x + p2.x) / 2;
        var my = (p1.y + p2.y) / 2;
        // Fond blanc derrière le libellé pour la lisibilité
        var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('class', 'planif-lien-label-bg');
        var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.id = donnees.id + '-label';
        label.setAttribute('x', mx);
        label.setAttribute('y', my - 6);
        label.setAttribute('class', 'planif-lien-label');
        label.textContent = typeLienConfig.label;
        groupe.appendChild(bg);
        groupe.appendChild(label);
        // Ajuster le rect de fond après insertion (pour mesurer le texte)
        requestAnimationFrame(function() {
            try {
                var bbox = label.getBBox();
                bg.setAttribute('x', bbox.x - 3);
                bg.setAttribute('y', bbox.y - 1);
                bg.setAttribute('width', bbox.width + 6);
                bg.setAttribute('height', bbox.height + 2);
                bg.setAttribute('rx', '3');
            } catch(e) { console.warn('[Planif-Carte] SVG label bbox measurement failed:', e.message || e); }
        });
    }

    var poigneeSource = creerPoigneeLien(p1.x, p1.y, donnees.id, 'source');
    var poigneeCible = creerPoigneeLien(p2.x, p2.y, donnees.id, 'cible');
    groupe.appendChild(poigneeSource);
    groupe.appendChild(poigneeCible);

    coucheLiens.appendChild(groupe);
}

// === POIGNÉES DE RECONNEXION ===
function creerPoigneeLien(x, y, lienId, extremite) {
    var cercle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cercle.setAttribute('cx', x);
    cercle.setAttribute('cy', y);
    cercle.setAttribute('r', 7);
    cercle.setAttribute('class', 'planif-lien-poignee');
    cercle.setAttribute('data-lien', lienId);
    cercle.setAttribute('data-extremite', extremite);

    cercle.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
        demarrerReconnexion(lienId, extremite, e);
    });

    return cercle;
}

function demarrerReconnexion(lienId, extremite, e) {
    var lien = etat.liens.get(lienId);
    if (!lien) return;

    var noeudFixeId = extremite === 'source' ? lien.cible : lien.source;
    var groupeEl = document.getElementById(lienId + '-groupe');
    if (groupeEl) groupeEl.style.opacity = '0.2';

    var fixePos = getCentre(noeudFixeId);
    lienTemp.setAttribute('x1', fixePos.x);
    lienTemp.setAttribute('y1', fixePos.y);
    var pInit = clientVersData(e.clientX, e.clientY);
    lienTemp.setAttribute('x2', pInit.x);
    lienTemp.setAttribute('y2', pInit.y);
    lienTemp.style.display = 'block';

    function onMove(e2) {
        var p = clientVersData(e2.clientX, e2.clientY);
        lienTemp.setAttribute('x2', p.x);
        lienTemp.setAttribute('y2', p.y);
    }

    function onUp(e2) {
        lienTemp.style.display = 'none';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        var elSous = document.elementFromPoint(e2.clientX, e2.clientY);
        var noeudCibleEl = elSous && elSous.closest ? elSous.closest('.planif-noeud') : null;

        if (noeudCibleEl && noeudCibleEl.id !== noeudFixeId) {
            enregistrerPourUndo();
            if (extremite === 'source') {
                lien.source = noeudCibleEl.id;
            } else {
                lien.cible = noeudCibleEl.id;
            }
            dessinerLien(lien);
            sauvegarder();
        } else {
            if (groupeEl) groupeEl.style.opacity = '1';
        }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function mettreAJourLiens(noeudId) {
    for (var entry of etat.liens) {
        var lien = entry[1];
        if (lien.source === noeudId || lien.cible === noeudId) {
            dessinerLien(lien);
        }
    }
}

// === MENU TYPE DE LIEN ===
function afficherMenuLien(x, y, sourceId, cibleId) {
    var resolution = resoudreVerbe(sourceId, cibleId);
    if (!resolution) {
        // Lien invalide — afficher un message discret
        var src = etat.noeuds.get(sourceId);
        var cbl = etat.noeuds.get(cibleId);
        var srcLabel = src ? (TYPES[src.type] ? TYPES[src.type].label : src.type) : '?';
        var cblLabel = cbl ? (TYPES[cbl.type] ? TYPES[cbl.type].label : cbl.type) : '?';
        afficherToastLien('Ce lien n\'est pas possible entre ' + srcLabel + ' et ' + cblLabel + '.');
        return;
    }

    // Vertical : verbe automatique, pas de popup
    if (resolution.type === 'vertical') {
        creerLien(resolution.source, resolution.cible, resolution.verbe);
        return;
    }

    // Horizontal : popup de choix de verbe
    menuLien.innerHTML = '';
    var titre = document.createElement('div');
    titre.style.cssText = 'padding: 4px 8px 2px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
    titre.textContent = 'Type de relation';
    menuLien.appendChild(titre);

    for (var vi = 0; vi < resolution.verbes.length; vi++) {
        (function(verbeId) {
            var cfg = trouverConfigLien(verbeId);
            var btn = document.createElement('button');
            btn.textContent = cfg ? cfg.label : verbeId;
            btn.addEventListener('click', function() {
                creerLien(resolution.source, resolution.cible, verbeId);
                fermerMenuLien();
            });
            menuLien.appendChild(btn);
        })(resolution.verbes[vi]);
    }

    var posMenu = clientVersEspace(x, y);
    menuLien.style.left = posMenu.x + 'px';
    menuLien.style.top = posMenu.y + 'px';
    menuLien.style.display = 'block';
}

function afficherToastLien(message) {
    var toast = document.createElement('div');
    toast.className = 'planif-toast-lien';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('planif-toast-visible'); }, 10);
    setTimeout(function() {
        toast.classList.remove('planif-toast-visible');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

function afficherMenuLienExistant(x, y, lienId) {
    var lien = etat.liens.get(lienId);
    if (!lien) return;

    // Déterminer les verbes pertinents pour ce couple source-cible
    var resolution = resoudreVerbe(lien.source, lien.cible);
    var verbesPertinents = [];
    if (resolution) {
        if (resolution.type === 'vertical') {
            verbesPertinents = [resolution.verbe];
        } else {
            verbesPertinents = resolution.verbes;
        }
    }
    // Toujours inclure le verbe actuel normalisé (même si la résolution a changé)
    var verbeNormalise = VERBES_COMPAT[lien.type] || lien.type;
    if (verbeNormalise && verbesPertinents.indexOf(verbeNormalise) === -1) {
        verbesPertinents.push(verbeNormalise);
    }

    menuLien.innerHTML = '';

    // Titre du menu
    var titre = document.createElement('div');
    titre.style.cssText = 'padding: 4px 8px 2px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
    titre.textContent = 'Verbe du lien';
    menuLien.appendChild(titre);

    // Boutons pour chaque verbe pertinent
    for (var vi = 0; vi < verbesPertinents.length; vi++) {
        (function(verbeId) {
            var cfg = trouverConfigLien(verbeId);
            var btn = document.createElement('button');
            btn.textContent = cfg ? cfg.label : verbeId;
            if (lien.type === verbeId) btn.classList.add('actif');
            btn.addEventListener('click', function() {
                if (lien.type !== verbeId) {
                    enregistrerPourUndo();
                    lien.type = verbeId;
                    dessinerLien(lien);
                    sauvegarder();
                }
                fermerMenuLien();
            });
            menuLien.appendChild(btn);
        })(verbesPertinents[vi]);
    }

    var sep = document.createElement('hr');
    sep.style.cssText = 'border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;';
    menuLien.appendChild(sep);

    var btnSuppr = document.createElement('button');
    btnSuppr.textContent = 'Supprimer ce lien';
    btnSuppr.classList.add('u-texte-danger');
    btnSuppr.addEventListener('click', function() {
        supprimerLien(lienId);
        fermerMenuLien();
    });
    menuLien.appendChild(btnSuppr);

    var posMenu = clientVersEspace(x, y);
    menuLien.style.left = posMenu.x + 'px';
    menuLien.style.top = posMenu.y + 'px';
    menuLien.style.display = 'block';
}

function fermerMenuLien() {
    if (menuLien) menuLien.style.display = 'none';
}

// === UTILITAIRES GÉOMÉTRIQUES ===
function getCentre(noeudId) {
    var el = document.getElementById(noeudId);
    if (!el) return { x: 0, y: 0 };
    var donnees = etat.noeuds.get(noeudId);
    return {
        x: donnees.x + el.offsetWidth / 2,
        y: donnees.y + el.offsetHeight / 2
    };
}

function getPortPosition(noeudId, direction) {
    var el = document.getElementById(noeudId);
    var donnees = etat.noeuds.get(noeudId);
    if (!el || !donnees) return { x: 0, y: 0 };

    var w = el.offsetWidth;
    var h = el.offsetHeight;

    switch (direction) {
        case 'droite': return { x: donnees.x + w, y: donnees.y + h / 2 };
        case 'gauche': return { x: donnees.x, y: donnees.y + h / 2 };
        case 'bas':    return { x: donnees.x + w / 2, y: donnees.y + h };
        case 'haut':   return { x: donnees.x + w / 2, y: donnees.y };
        default:       return getCentre(noeudId);
    }
}

function trouverMeilleursPorts(sourceId, cibleId) {
    var s = getCentre(sourceId);
    var c = getCentre(cibleId);
    var dx = c.x - s.x;
    var dy = c.y - s.y;

    var portSource, portCible;
    if (Math.abs(dx) > Math.abs(dy)) {
        portSource = dx > 0 ? 'droite' : 'gauche';
        portCible = dx > 0 ? 'gauche' : 'droite';
    } else {
        portSource = dy > 0 ? 'bas' : 'haut';
        portCible = dy > 0 ? 'haut' : 'bas';
    }
    return { portSource: portSource, portCible: portCible };
}

// === GESTION DES CONTENEURS ===

function collecterDescendants(racine, parent, liste) {
    var enfants = parent.enfants || [];
    for (var i = 0; i < enfants.length; i++) {
        var eid = enfants[i];
        var ed = etat.noeuds.get(eid);
        if (!ed) continue;
        liste.push({ id: eid, dx: ed.x - racine.x, dy: ed.y - racine.y });
        if (TYPES[ed.type] && TYPES[ed.type].conteneur && ed.enfants) {
            collecterDescendants(racine, ed, liste);
        }
    }
}

function peutContenir(conteneurType, enfantType) {
    // Voie A (tranchée le 6 août 2026, livrée ici) : une séquence peut contenir
    // des SÉQUENCES — le regroupement au-dessus (module, étape, thème) est le
    // conteneur existant rendu récursif, pas un nouveau type. Un seul concept,
    // appliqué à deux échelles. Les cycles sont bloqués par estDescendantDe()
    // dans trouverConteneurPour().
    if (conteneurType === 'sequence') return enfantType === 'lecon' || enfantType === 'sequence';
    if (conteneurType === 'lecon') return enfantType === 'activite' || enfantType === 'soutien' || enfantType === 'revision' || TYPES_CONNAISSANCE.indexOf(enfantType) !== -1 || enfantType === 'evaluation';
    return false;
}

function trouverConteneurPour(clientX, clientY, excludeId, enfantType) {
    var data = clientVersData(clientX, clientY);
    var meilleur = null;
    var meilleurAire = Infinity;
    for (var entry of etat.noeuds) {
        var cid = entry[0];
        var cdata = entry[1];
        if (cid === excludeId) continue;
        var config = TYPES[cdata.type];
        if (!config || !config.conteneur) continue;
        if (!peutContenir(cdata.type, enfantType)) continue;
        if (estDescendantDe(cid, excludeId)) continue;
        var cel = document.getElementById(cid);
        if (!cel) continue;
        var w = parseFloat(cel.style.width) || cel.offsetWidth || 200;
        var h = parseFloat(cel.style.height) || cel.offsetHeight || 80;
        if (data.x >= cdata.x && data.x <= cdata.x + w && data.y >= cdata.y && data.y <= cdata.y + h) {
            var aire = w * h;
            if (aire < meilleurAire) {
                meilleur = cid;
                meilleurAire = aire;
            }
        }
    }
    return meilleur;
}

/**
 * Conteneur d'accueil d'après le RECOUVREMENT du bloc — complément de
 * `trouverConteneurPour`, qui ne regarde que le point du curseur. Un bloc posé
 * majoritairement (> 50 % de sa surface) sur un conteneur qui accepte son type
 * lui appartient : c'est le geste que l'utilisateur a fait, même si le curseur
 * a relâché quelques pixels à côté. (Cas réel du 6 août : activité créée
 * « sur » une leçon, restée orpheline en débordement — et impossible à
 * raccrocher puisque rien ne signalait qu'elle était dehors.)
 * @returns {string|null} id du plus petit conteneur majoritairement recouvert
 */
function trouverConteneurParRecouvrement(noeudId, enfantType) {
    var noeud = etat.noeuds.get(noeudId);
    if (!noeud) return null;
    var nel = document.getElementById(noeudId);
    var nw = nel ? (nel.offsetWidth || 140) : 140;
    var nh = nel ? (nel.offsetHeight || 50) : 50;
    var aire = nw * nh;
    if (!aire) return null;

    var meilleur = null;
    var meilleurAire = Infinity;
    for (var entry of etat.noeuds) {
        var cid = entry[0];
        var cdata = entry[1];
        if (cid === noeudId) continue;
        var config = TYPES[cdata.type];
        if (!config || !config.conteneur) continue;
        if (!peutContenir(cdata.type, enfantType)) continue;
        if (estDescendantDe(cid, noeudId)) continue;
        var cel = document.getElementById(cid);
        if (!cel) continue;
        var cw = parseFloat(cel.style.width) || cel.offsetWidth || 200;
        var ch = parseFloat(cel.style.height) || cel.offsetHeight || 80;
        var ix = Math.max(0, Math.min(noeud.x + nw, cdata.x + cw) - Math.max(noeud.x, cdata.x));
        var iy = Math.max(0, Math.min(noeud.y + nh, cdata.y + ch) - Math.max(noeud.y, cdata.y));
        if ((ix * iy) / aire <= 0.5) continue;
        var aireC = cw * ch;
        if (aireC < meilleurAire) {
            meilleur = cid;
            meilleurAire = aireC;
        }
    }
    return meilleur;
}

function estDescendantDe(candidatId, noeudId, visited) {
    if (!visited) visited = new Set();
    if (visited.has(noeudId)) return false;
    visited.add(noeudId);
    var noeud = etat.noeuds.get(noeudId);
    if (!noeud || !noeud.enfants) return false;
    for (var i = 0; i < noeud.enfants.length; i++) {
        if (noeud.enfants[i] === candidatId) return true;
        if (estDescendantDe(candidatId, noeud.enfants[i], visited)) return true;
    }
    return false;
}

function rattacherAuConteneur(noeudId, conteneurId) {
    var noeud = etat.noeuds.get(noeudId);
    var conteneur = etat.noeuds.get(conteneurId);
    if (!noeud || !conteneur) return;

    if (noeud.parent && noeud.parent !== conteneurId) {
        detacherDuConteneur(noeudId);
    }

    noeud.parent = conteneurId;
    if (!conteneur.enfants) conteneur.enfants = [];
    if (!conteneur.enfants.includes(noeudId)) {
        conteneur.enfants.push(noeudId);
    }

    var el = document.getElementById(noeudId);
    if (el) el.classList.add('planif-enfant-conteneur');
    reLayoutAvecAnimation(conteneurId);
}

function detacherDuConteneur(noeudId) {
    var noeud = etat.noeuds.get(noeudId);
    if (!noeud || !noeud.parent) return;

    var ancienParentId = noeud.parent;
    var ancienParent = etat.noeuds.get(ancienParentId);
    if (ancienParent && ancienParent.enfants) {
        ancienParent.enfants = ancienParent.enfants.filter(function(eid) { return eid !== noeudId; });
    }

    noeud.parent = null;
    var el = document.getElementById(noeudId);
    if (el) el.classList.remove('planif-enfant-conteneur');

    if (ancienParent) {
        if (ancienParent.enfants && ancienParent.enfants.length > 0) {
            reLayoutConteneur(ancienParentId);
        } else {
            mettreAJourZoneConteneur(ancienParentId);
        }
    }
}

var _layoutEnCours = new Set();
var _zoneEnCours = new Set();
// Bornes de la poignée de redimensionnement (feuilles seulement).
var LARGEUR_MIN_NOEUD = 100;

/**
 * Largeur plancher d'un conteneur, posée à la poignée (option B).
 * La disposition automatique garde la main sur tout le reste : elle ne fait
 * qu'élargir jusqu'à ce plancher si son calcul donne moins.
 */
function largeurPlancher(noeud) {
    return (noeud && noeud.metadata && noeud.metadata.largeurMin) || 0;
}

var HAUTEUR_MIN_NOEUD = 44;

var LAYOUT_GAP = 60;
var LAYOUT_PADDING = 30;
var LAYOUT_HEADER_H = 45;

function reLayoutAvecAnimation(conteneurId) {
    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) return;
    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var elements = [];
    for (var i = 0; i < enfants.length; i++) {
        var eel = document.getElementById(enfants[i]);
        if (eel) {
            eel.classList.add('planif-snap-transition');
            elements.push(eel);
        }
    }
    var cel = document.getElementById(conteneurId);
    if (cel) {
        cel.classList.add('planif-snap-transition');
        elements.push(cel);
    }
    reLayoutConteneur(conteneurId);
    setTimeout(function() {
        for (var j = 0; j < elements.length; j++) {
            elements[j].classList.remove('planif-snap-transition');
        }
    }, 350);
}

/**
 * Hauteur RÉELLE de l'en-tête d'un conteneur, mesurée dans le DOM.
 *
 * LAYOUT_HEADER_H (45 px) était une constante juste tant que l'en-tête tenait
 * en une ligne. Depuis les objectifs dépliables (1.32+) elle ne l'est plus : un
 * en-tête peut porter le type, N objectifs et un titre sur deux lignes. Une
 * hauteur figée faisait alors chevaucher les activités par-dessus le titre
 * (constaté en terrain le 6 août).
 *
 * On mesure le bas du dernier élément d'en-tête présent. `offsetTop` est
 * relatif au nœud (positionné en absolu) et `offsetHeight` ignore le zoom de la
 * carte — les deux sont donc dans le même repère que x/y.
 * La constante ne sert plus que de repli si le DOM n'est pas encore rendu.
 */
var LAYOUT_RESPIRATION = 8;
function hauteurEnteteConteneur(el) {
    if (!el) return LAYOUT_HEADER_H;
    // Ordre du DOM : entête → objectifs → titre. Le dernier présent borne le bas.
    var reperes = ['.planif-noeud-titre', '.planif-noeud-objectifs', '.planif-noeud-entete'];
    for (var i = 0; i < reperes.length; i++) {
        var e = el.querySelector(reperes[i]);
        if (e && e.offsetHeight > 0) {
            return e.offsetTop + e.offsetHeight + LAYOUT_RESPIRATION;
        }
    }
    return LAYOUT_HEADER_H;
}

function reLayoutConteneur(conteneurId) {
    if (_layoutEnCours.has(conteneurId)) return;
    _layoutEnCours.add(conteneurId);

    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) { _layoutEnCours.delete(conteneurId); return; }
    var config = TYPES[conteneur.type];
    if (!config || !config.conteneur) { _layoutEnCours.delete(conteneurId); return; }

    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    if (enfants.length === 0) {
        mettreAJourZoneConteneur(conteneurId);
        _layoutEnCours.delete(conteneurId);
        return;
    }

    // Recursively layout nested containers first
    var aDesEnfantsConteneurs = false;
    for (var i = 0; i < enfants.length; i++) {
        var ed = etat.noeuds.get(enfants[i]);
        if (ed && TYPES[ed.type] && TYPES[ed.type].conteneur) {
            aDesEnfantsConteneurs = true;
            if (ed.enfants && ed.enfants.length > 0) {
                reLayoutConteneur(enfants[i]);
            }
        }
    }

    // Conteneurs avec enfants-conteneurs (ex: séquence → leçons) : disposition libre
    if (aDesEnfantsConteneurs) {
        _layoutEnCours.delete(conteneurId);
        mettreAJourZoneConteneur(conteneurId);
        return;
    }

    // Enfants feuilles (ex: leçon → activités) : colonne verticale centrée
    // Sort children by Y position
    enfants.sort(function(a, b) {
        var da = etat.noeuds.get(a);
        var db = etat.noeuds.get(b);
        return (da ? da.y : 0) - (db ? db.y : 0);
    });
    conteneur.enfants = enfants;

    var GAP = LAYOUT_GAP;
    var PADDING = LAYOUT_PADDING;
    var HEADER_H = hauteurEnteteConteneur(document.getElementById(conteneurId));

    // Measure children widths/heights
    var maxW = 0;
    var totalH = 0;
    var dims = [];
    for (var j = 0; j < enfants.length; j++) {
        var eel = document.getElementById(enfants[j]);
        var w = eel ? (eel.offsetWidth || 140) : 140;
        var h = eel ? (eel.offsetHeight || 50) : 50;
        dims.push({ w: w, h: h });
        if (w > maxW) maxW = w;
        totalH += h;
    }
    totalH += GAP * (enfants.length - 1);

    // Container dimensions
    var newW = maxW + PADDING * 2;
    newW = Math.max(newW, largeurPlancher(conteneur));
    var newH = totalH + PADDING * 2 + HEADER_H;

    // Stack children in centered column
    var curY = conteneur.y + HEADER_H + PADDING;
    for (var k = 0; k < enfants.length; k++) {
        var ed2 = etat.noeuds.get(enfants[k]);
        if (!ed2) continue;
        ed2.x = conteneur.x + (newW - dims[k].w) / 2;
        ed2.y = curY;
        var eel2 = document.getElementById(enfants[k]);
        if (eel2) {
            eel2.style.left = ed2.x + 'px';
            eel2.style.top = ed2.y + 'px';
        }
        mettreAJourLiens(enfants[k]);
        curY += dims[k].h + GAP;
    }

    var cel = document.getElementById(conteneurId);
    if (cel) {
        cel.style.width = newW + 'px';
        cel.style.height = newH + 'px';
        cel.style.borderColor = obtenirCouleurNoeud(conteneur);
        cel.classList.add('planif-a-enfants');
        var zone = cel.querySelector('.planif-noeud-zone');
        if (zone) zone.classList.remove('planif-vide');
    }

    mettreAJourLiens(conteneurId);

    _layoutEnCours.delete(conteneurId);

    // Recurse to parent
    if (conteneur.parent) {
        reLayoutConteneur(conteneur.parent);
    }
}

function reLayoutConteneurSaufDragged(conteneurId, draggedId) {
    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) return;
    var config = TYPES[conteneur.type];
    if (!config || !config.conteneur) return;

    var enfants = (conteneur.enfants || []).filter(function(eid) {
        return etat.noeuds.has(eid) && eid !== draggedId;
    });
    if (enfants.length === 0) return;

    // Sort by Y
    enfants.sort(function(a, b) {
        var da = etat.noeuds.get(a);
        var db = etat.noeuds.get(b);
        return (da ? da.y : 0) - (db ? db.y : 0);
    });

    var GAP = LAYOUT_GAP;
    var PADDING = LAYOUT_PADDING;
    var HEADER_H = hauteurEnteteConteneur(document.getElementById(conteneurId));

    var maxW = 0;
    var totalH = 0;
    var dims = [];
    for (var j = 0; j < enfants.length; j++) {
        var eel = document.getElementById(enfants[j]);
        var w = eel ? (eel.offsetWidth || 140) : 140;
        var h = eel ? (eel.offsetHeight || 50) : 50;
        dims.push({ w: w, h: h });
        if (w > maxW) maxW = w;
        totalH += h;
    }
    totalH += GAP * (enfants.length - 1);

    var newW = Math.max(maxW + PADDING * 2, largeurPlancher(conteneur));
    var newH = totalH + PADDING * 2 + HEADER_H;

    var curY = conteneur.y + HEADER_H + PADDING;
    for (var k = 0; k < enfants.length; k++) {
        var ed2 = etat.noeuds.get(enfants[k]);
        if (!ed2) continue;
        ed2.x = conteneur.x + (newW - dims[k].w) / 2;
        ed2.y = curY;
        var eel2 = document.getElementById(enfants[k]);
        if (eel2) {
            eel2.style.transition = 'left 150ms ease, top 150ms ease';
            eel2.style.left = ed2.x + 'px';
            eel2.style.top = ed2.y + 'px';
            // Clear transition after animation
            (function(el) {
                setTimeout(function() { el.style.transition = ''; }, 160);
            })(eel2);
        }
        mettreAJourLiens(enfants[k]);
        curY += dims[k].h + GAP;
    }

    var cel = document.getElementById(conteneurId);
    if (cel) {
        cel.style.width = newW + 'px';
        cel.style.height = newH + 'px';
    }
    mettreAJourLiens(conteneurId);
}

function mettreAJourZoneConteneur(conteneurId) {
    if (_zoneEnCours.has(conteneurId)) return;
    _zoneEnCours.add(conteneurId);
    var conteneur = etat.noeuds.get(conteneurId);
    var el = document.getElementById(conteneurId);
    if (!conteneur || !el) { _zoneEnCours.delete(conteneurId); return; }

    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var zone = el.querySelector('.planif-noeud-zone');

    if (enfants.length === 0) {
        el.classList.remove('planif-a-enfants');
        el.style.width = '';
        el.style.height = '';
        el.style.borderColor = '';
        if (zone) { zone.classList.add('planif-vide'); zone.textContent = ''; }
        _zoneEnCours.delete(conteneurId);
        return;
    }

    el.classList.add('planif-a-enfants');

    var PADDING = LAYOUT_PADDING;
    var HEADER_H = hauteurEnteteConteneur(el);

    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < enfants.length; i++) {
        var ed = etat.noeuds.get(enfants[i]);
        var eel = document.getElementById(enfants[i]);
        if (!ed || !eel) continue;
        var w = eel.offsetWidth || 140;
        var h = eel.offsetHeight || 50;
        if (ed.x < minX) minX = ed.x;
        if (ed.y < minY) minY = ed.y;
        if (ed.x + w > maxX) maxX = ed.x + w;
        if (ed.y + h > maxY) maxY = ed.y + h;
    }

    var newX = minX - PADDING;
    var newY = minY - PADDING - HEADER_H;
    var newW = Math.max((maxX - minX) + PADDING * 2, largeurPlancher(conteneur));
    var newH = (maxY - minY) + PADDING * 2 + HEADER_H;

    conteneur.x = newX;
    conteneur.y = newY;
    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';

    mettreAJourLiens(conteneurId);

    _zoneEnCours.delete(conteneurId);

    if (conteneur.parent) {
        mettreAJourZoneConteneur(conteneur.parent);
    }
}


// === UNDO / REDO ===
function clonerEtatPersistant() {
    return {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()).map(function(n) {
            return {
                id: n.id, type: n.type, titre: n.titre, description: n.description,
                x: n.x, y: n.y, parent: n.parent,
                enfants: n.enfants ? n.enfants.slice() : [],
                metadata: JSON.parse(JSON.stringify(n.metadata || {})),
                cloneSourceId: n.cloneSourceId || null
            };
        }),
        liens: Array.from(etat.liens.values()).map(function(l) {
            return { id: l.id, source: l.source, cible: l.cible, type: l.type };
        })
    };
}

function enregistrerPourUndo() {
    if (_undoBatch) return;
    pileUndo.push(clonerEtatPersistant());
    if (pileUndo.length > UNDO_MAX) pileUndo.shift();
    pileRedo = [];
}

function _collecterDescendants(noeudId, ensemble) {
    ensemble.add(noeudId);
    var nd = etat.noeuds.get(noeudId);
    if (!nd || !nd.enfants) return;
    for (var i = 0; i < nd.enfants.length; i++) {
        _collecterDescendants(nd.enfants[i], ensemble);
    }
}

function reconstruireDOM() {
    // Sans canevas monté (module pas encore initialisé, ou bac à sable de
    // test), il n'y a rien à reconstruire — les DONNÉES restent la vérité,
    // le rendu suivra au montage.
    if (!coucheNoeuds) return;
    coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';

    // (L'objectif de leçon vit sur le nœud — `metadata.objectif` — depuis le
    // 6 août 2026 : plus aucune lecture de CLE_SEANCES n'est nécessaire ici.)

    // Filtrage par séquence active (null = tout visible)
    var visibles = null;  // Set des nœuds à afficher (vue focalisée)
    var masques = null;   // Set des nœuds à masquer (vue globale compacte)
    if (sequenceActiveId && etat.noeuds.has(sequenceActiveId)) {
        visibles = new Set();
        _collecterDescendants(sequenceActiveId, visibles);
    } else {
        // Vue globale : compacter les séquences (masquer leurs descendants)
        var seqs = obtenirSequencesCarte();
        if (seqs.length > 0) {
            masques = new Set();
            for (var si = 0; si < seqs.length; si++) {
                var enfantsSeq = seqs[si].enfants || [];
                for (var ei = 0; ei < enfantsSeq.length; ei++) {
                    _collecterDescendants(enfantsSeq[ei], masques);
                }
            }
        }
    }

    for (var entry of etat.noeuds) {
        var n = entry[1];
        if (visibles && !visibles.has(n.id)) continue;
        if (masques && masques.has(n.id)) continue;
        var config = TYPES[n.type];
        if (!config) continue;
        var estConteneur = config.conteneur === true;
        var estCompact = masques && n.type === 'sequence';
        var el = document.createElement('div');
        el.className = (estConteneur ? 'planif-noeud planif-conteneur' : 'planif-noeud') + ' planif-type-' + n.type;
        if (estCompact) el.classList.add('planif-seq-compact');
        if (n.parent) el.classList.add('planif-enfant-conteneur');
        el.id = n.id;
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
        el.style.borderColor = obtenirCouleurNoeud(n);
        // Taille choisie à la poignée (feuilles uniquement) : la disposition
        // automatique la respecte, puisqu'elle mesure les enfants au lieu de
        // les contraindre.
        if (!estConteneur && n.metadata && (n.metadata.largeur || n.metadata.hauteur)) {
            // La classe libère le max-width de 240 px, sans quoi une largeur
            // posée en ligne resterait plafonnée.
            el.classList.add('planif-noeud--taille-libre');
            if (n.metadata.largeur) el.style.width = n.metadata.largeur + 'px';
            if (n.metadata.hauteur) el.style.height = n.metadata.hauteur + 'px';
        }

        if (estCompact) {
            // Vue globale compacte : bloc résumé (titre + badge leçons).
            // Leçons DESCENDANTES (voie A) : un simple compte d'enfants aurait
            // rangé les sous-séquences parmi les « leçons ».
            var nbLecons = compterLeconsDescendantes(n);
            var nbSousSeq = (n.enfants || []).filter(function(eid) {
                var se = etat.noeuds.get(eid);
                return se && se.type === 'sequence';
            }).length;
            var infoCompact = nbLecons + ' le\u00e7on' + (nbLecons > 1 ? 's' : '');
            if (nbSousSeq > 0) infoCompact = nbSousSeq + ' séquence' + (nbSousSeq > 1 ? 's' : '') + ' \u00b7 ' + infoCompact;
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' + obtenirLabelNoeud(n) + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre">' + echapperHtml(n.titre || '') + '</div>' +
                '<div class="planif-seq-compact-info">' + infoCompact + (dureeRollupNoeud(n) ? ' \u00b7 ' + formaterPeriodes(dureeRollupNoeud(n)) : '') + '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
        } else if (estConteneur) {
            var nbEnfants = (n.enfants || []).length;
            // Le\u00e7on : en-t\u00eate \u00e0 deux sections \u2014 identification (\u00ab Le\u00e7on \u00bb +
            // titre) puis objectif d\u00e9pliable. Le badge \ud83c\udfaf est la bascule ;
            // gris\u00e9, il signale qu'un objectif PEUT \u00eatre pos\u00e9 (l'ancien badge
            // n'apparaissait qu'une fois l'objectif saisi \u2014 la fonction \u00e9tait
            // donc ind\u00e9couvrable).
            // En-t\u00eate \u00e0 deux \u00e9tages : le TYPE du bloc (\u00ab Le\u00e7on \u00bb), puis LES
            // objectifs \u2014 une le\u00e7on en a toujours plusieurs. Le TITRE, lui, est
            // d\u00e9cal\u00e9 SOUS l'en-t\u00eate : c'est une information, pas l'identit\u00e9 du
            // bloc. (Structure pr\u00e9cis\u00e9e par Gr\u00e9goire le 6 ao\u00fbt 2026.)
            var estLecon = n.type === 'lecon';
            var objs = estLecon ? objectifsDeLecon(n) : [];
            var objDeplie = estLecon && objectifEstDeplie(n);
            var htmlObjectifs = '';
            if (objDeplie) {
                htmlObjectifs = '<div class="planif-noeud-objectifs">';
                if (objs.length === 0) {
                    // Liste vide : une ligne \u00e0 remplir, sans boutons \u2014 il n'y a
                    // encore rien \u00e0 retirer ni apr\u00e8s quoi ins\u00e9rer.
                    htmlObjectifs += '<div class="planif-noeud-objectif-ligne">' +
                                     '<div class="planif-noeud-objectif" contenteditable="true" data-obj-rang="0"' +
                                     ' data-placeholder="Sera en mesure de\u2026"></div>' +
                                     '</div>';
                } else {
                    var rangAccueil = (_ajoutObjectif && _ajoutObjectif.noeudId === n.id)
                        ? _ajoutObjectif.rang : -1;
                    var rangRendu = 0;
                    for (var io_ = 0; io_ <= objs.length; io_++) {
                        if (io_ === rangAccueil) {
                            // La ligne d'accueil porte les M\u00caMES commandes que
                            // les autres : sans elles, la ligne qu'on vient
                            // d'ajouter serait la seule sans + / \u2212 (constat\u00e9 en
                            // terrain le 6 ao\u00fbt).
                            htmlObjectifs += '<div class="planif-noeud-objectif-ligne">' +
                                '<div class="planif-noeud-objectif" contenteditable="true"' +
                                ' data-obj-rang="' + rangRendu + '" data-accueil="1"' +
                                ' data-placeholder="Sera en mesure de\u2026"></div>' +
                                '<span class="planif-obj-btn planif-obj-ajouter" data-obj-rang="' + rangRendu + '"' +
                                ' role="button" tabindex="0" aria-label="Ajouter un objectif apr\u00e8s celui-ci"' +
                                ' title="Ajouter un objectif">+</span>' +
                                '<span class="planif-obj-btn planif-obj-retirer" data-obj-rang="' + rangRendu + '"' +
                                ' role="button" tabindex="0" aria-label="Retirer cet objectif"' +
                                ' title="Retirer cet objectif">\u2212</span>' +
                                '</div>';
                            rangRendu++;
                        }
                        if (io_ === objs.length) break;
                        htmlObjectifs +=
                            '<div class="planif-noeud-objectif-ligne">' +
                                '<div class="planif-noeud-objectif" contenteditable="true" data-obj-rang="' + rangRendu + '">' +
                                    echapperHtml(objs[io_].texte) +
                                '</div>' +
                                '<span class="planif-obj-btn planif-obj-ajouter" data-obj-rang="' + rangRendu + '"' +
                                ' role="button" tabindex="0" aria-label="Ajouter un objectif apr\u00e8s celui-ci"' +
                                ' title="Ajouter un objectif">+</span>' +
                                '<span class="planif-obj-btn planif-obj-retirer" data-obj-rang="' + rangRendu + '"' +
                                ' role="button" tabindex="0" aria-label="Retirer cet objectif"' +
                                ' title="Retirer cet objectif">\u2212</span>' +
                            '</div>';
                        rangRendu++;
                    }
                }
                htmlObjectifs += '</div>';
            }
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' + obtenirLabelNoeud(n) + '</span>' +
                    (estLecon
                        ? '<span class="planif-badge-objectif' + (objs.length ? '' : ' planif-badge-objectif--vide') + '"' +
                          ' role="button" tabindex="0" aria-expanded="' + (objDeplie ? 'true' : 'false') + '"' +
                          ' title="' + (objs.length ? objs.length + ' objectif' + (objs.length > 1 ? 's' : '') : 'Aucun objectif') +
                          ' \u2014 cliquer pour ' + (objDeplie ? 'replier' : 'd\u00e9plier') + '">\ud83c\udfaf</span>'
                        : '') +
                '</div>' +
                htmlObjectifs +
                '<div class="planif-noeud-titre" contenteditable="true">' + echapperHtml(n.titre || '') + '</div>' +
                '<div class="planif-noeud-zone ' + (nbEnfants === 0 ? 'planif-vide' : '') + '">' +
                    (nbEnfants > 0 ? nbEnfants + ' \u00e9l\u00e9ment' + (nbEnfants > 1 ? 's' : '') : '') +
                '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>' +
                // Option B (6 août) : sur un conteneur, la poignée ne règle que
                // la LARGEUR — une largeur plancher. La hauteur reste calculée
                // depuis les enfants, donc aucun geste n'est jamais défait.
                '<div class="planif-noeud-poignee planif-noeud-poignee--largeur"' +
                ' role="separator" aria-label="Ajuster la largeur de ce bloc"></div>';
        } else {
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' + obtenirLabelNoeud(n) + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre" contenteditable="true">' + echapperHtml(n.titre || '') + '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>' +
                // Poignée de redimensionnement — FEUILLES SEULEMENT (option A,
                // décision du 6 août). Les conteneurs sont dimensionnés par
                // reLayoutConteneur à partir de leurs enfants : une taille posée
                // à la main y serait écrasée au prochain ajout.
                '<div class="planif-noeud-poignee" role="separator" aria-label="Redimensionner ce bloc"></div>';
        }
        attacherEvenements(el, n);
        coucheNoeuds.appendChild(el);
        // Indicateur clone synchrone (avant le rAF layout)
        mettreAJourIndicateurClone(n);
        // Badge cognitif (si défini)
        if (n.metadata && n.metadata.niveauCognitif && TYPES_AVEC_NIVEAU_COGNITIF.indexOf(n.type) !== -1) {
            var ncObj = NIVEAUX_COGNITIFS.find(function(nc) { return nc.id === n.metadata.niveauCognitif; });
            if (ncObj) {
                var badgeC = document.createElement('span');
                badgeC.className = 'planif-badge-cognitif';
                badgeC.textContent = ncObj.label;
                el.appendChild(badgeC);
            }
        }
        // Le badge 🎯 est rendu DANS l'en-tête du bloc leçon (bascule de
        // l'objectif) — voir la branche `estConteneur` ci-dessus. Il n'est plus
        // ajouté ici : il devait auparavant son existence à la présence d'un
        // objectif, ce qui rendait la fonction indécouvrable (friction F1 du
        // 6 août 2026).
    }

    requestAnimationFrame(function() {
        // Répartition automatique des conteneurs (skip masqués et compacts)
        for (var entry2 of etat.noeuds) {
            var n2 = entry2[1];
            if (visibles && !visibles.has(n2.id)) continue;
            if (masques && masques.has(n2.id)) continue;
            if (masques && n2.type === 'sequence') continue; // Compact : pas de layout enfants
            if (TYPES[n2.type] && TYPES[n2.type].conteneur && n2.enfants && n2.enfants.length > 0 && !n2.parent) {
                reLayoutConteneur(n2.id);
            }
        }
        // Handle containers with no children
        for (var entry2b of etat.noeuds) {
            var n2b = entry2b[1];
            if (visibles && !visibles.has(n2b.id)) continue;
            if (masques && masques.has(n2b.id)) continue;
            if (TYPES[n2b.type] && TYPES[n2b.type].conteneur && (!n2b.enfants || n2b.enfants.length === 0)) {
                mettreAJourZoneConteneur(n2b.id);
            }
        }
        // Liens : seulement si les deux extrémités sont visibles (pas masquées)
        for (var entry3 of etat.liens) {
            var l = entry3[1];
            if (visibles && (!visibles.has(l.source) || !visibles.has(l.cible))) continue;
            if (masques && (masques.has(l.source) || masques.has(l.cible))) continue;
            dessinerLien(l);
        }
        mettreAJourPlanificateur();
    });
}

function restaurerSnapshot(snapshot) {
    etat.noeuds.clear();
    etat.liens.clear();
    _cloneIndex.clear();
    etat.compteur = snapshot.compteur;
    etat.compteurLiens = snapshot.compteurLiens;

    for (var i = 0; i < snapshot.noeuds.length; i++) {
        var n = snapshot.noeuds[i];
        if (n.type === 'prerequis') {
            n.type = 'factuelle';
            if (!n.metadata) n.metadata = {};
            n.metadata.prealable = true;
        }
        // Migration anciens types de connaissances → Anderson
        if (n.type === 'connaissance') n.type = 'factuelle';
        else if (n.type === 'strategie') n.type = 'procedurale';
        else if (n.type === 'condition') n.type = 'procedurale';
        var clone = {
            id: n.id, type: n.type, titre: n.titre, description: n.description,
            x: n.x, y: n.y, parent: n.parent,
            enfants: n.enfants ? n.enfants.slice() : [],
            metadata: JSON.parse(JSON.stringify(n.metadata || {})),
            cloneSourceId: n.cloneSourceId || null
        };
        etat.noeuds.set(clone.id, clone);
    }
    for (var j = 0; j < snapshot.liens.length; j++) {
        var l = snapshot.liens[j];
        if (etat.noeuds.has(l.source) && etat.noeuds.has(l.cible)) {
            etat.liens.set(l.id, { id: l.id, source: l.source, cible: l.cible, type: l.type });
        }
    }
    // Nettoyer les références parent/enfants invalides
    for (var entryV of etat.noeuds) {
        var nV = entryV[1];
        if (nV.parent && !etat.noeuds.has(nV.parent)) nV.parent = null;
        if (nV.enfants) nV.enfants = nV.enfants.filter(function(eid) { return etat.noeuds.has(eid); });
    }
    _reconstruireCloneIndex();

    reconstruireDOM();
    etat.selection = null;
    etat.multiSelection.clear();
    fermerPanneau();
    fermerMenuLien();
    sauvegarder();
    requestAnimationFrame(function() { mettreAJourTousLesBadges(); });
}

function annuler() {
    if (pileUndo.length === 0) return;
    pileRedo.push(clonerEtatPersistant());
    restaurerSnapshot(pileUndo.pop());
}

function retablir() {
    if (pileRedo.length === 0) return;
    pileUndo.push(clonerEtatPersistant());
    restaurerSnapshot(pileRedo.pop());
}

// === SAUVEGARDE ===
function sauvegarder() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var donnees = {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    window.planificationDonnees.sauvegarderCarte(index.active, donnees);

    if (seancesOuvert) rafraichirSeances();
    mettreAJourTousLesBadges();
}

function viderCanvas() {
    if (coucheNoeuds) coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';
    etat.noeuds.clear();
    etat.liens.clear();
    _cloneIndex.clear();
    etat.compteur = 0;
    etat.compteurLiens = 0;
    etat.selection = null;
    etat.multiSelection.clear();
    pileUndo = [];
    pileRedo = [];
    fermerPanneau();
    fermerMenuLien();
}

function chargerCarte(carteId) {
    sequenceActiveId = null;
    leconActiveId = null;
    _ajoutObjectif = null;
    viderCanvas();
    var donnees = window.planificationDonnees.chargerCarte(carteId);
    if (!donnees) { centrerVueSurContenu(); return; }

    etat.compteur = donnees.compteur || 0;
    etat.compteurLiens = donnees.compteurLiens || 0;

    var noeudsListe = donnees.noeuds || [];
    for (var i = 0; i < noeudsListe.length; i++) {
        var n = noeudsListe[i];
        if (n.type === 'prerequis') {
            n.type = 'factuelle';
            if (!n.metadata) n.metadata = {};
            n.metadata.prealable = true;
        }
        // Migration anciens types de connaissances → Anderson
        if (n.type === 'connaissance') n.type = 'factuelle';
        else if (n.type === 'strategie') n.type = 'procedurale';
        else if (n.type === 'condition') n.type = 'procedurale';
        var config = TYPES[n.type];
        if (!config) continue;
        if (isNaN(n.x)) n.x = 100;
        if (isNaN(n.y)) n.y = 100;
        if (n.enfants === undefined) n.enfants = [];
        if (n.parent === undefined) n.parent = null;
        if (!n.metadata) n.metadata = {};
        if (!('cloneSourceId' in n)) n.cloneSourceId = null;

        // Remap IDs si nécessaire (ancien format sans préfixe)
        if (!n.id.startsWith('planif-')) {
            var oldId = n.id;
            n.id = 'planif-' + oldId;
            // Remap parent
            if (n.parent && !n.parent.startsWith('planif-')) n.parent = 'planif-' + n.parent;
            // Remap enfants
            n.enfants = n.enfants.map(function(eid) {
                return eid.startsWith('planif-') ? eid : 'planif-' + eid;
            });
        }

        etat.noeuds.set(n.id, n);
    }
    _reconstruireCloneIndex();

    // Remap et charger les liens
    var liensListe = donnees.liens || [];
    var liensModifies = false;
    for (var m = 0; m < liensListe.length; m++) {
        var l = liensListe[m];
        if (!l.id.startsWith('planif-')) l.id = 'planif-' + l.id;
        if (!l.source.startsWith('planif-')) l.source = 'planif-' + l.source;
        if (!l.cible.startsWith('planif-')) l.cible = 'planif-' + l.cible;
        // Migration anciens verbes → nouveaux verbes + inversion direction
        var migration = MIGRATION_VERBES[l.type];
        if (migration) {
            if (migration.inverserDirection) {
                var ancienneSource = l.source;
                l.source = l.cible;
                l.cible = ancienneSource;
            }
            l.type = migration.nouveauVerbe;
            liensModifies = true;
        }
        // Post-migration : normaliser via VERBES_COMPAT (renommage simple)
        var compat = VERBES_COMPAT[l.type];
        if (compat) {
            l.type = compat;
            liensModifies = true;
        }
        etat.liens.set(l.id, l);
    }

    // Bascule des objectifs de leçon vers le nœud (idempotente, avant le rendu
    // pour que la carte affiche déjà les objectifs migrés).
    migrerObjectifsVersMetadata();
    // Ablation de l'ancrage porté par la séquence, avant le rendu pour que
    // l'étendue affichée soit déjà la dérivée et non l'ancienne valeur saisie.
    migrerAncrageTemporelVersLecon();

    reconstruireDOM();
    if (liensModifies) sauvegarder();

    requestAnimationFrame(function() {
        centrerVueSurContenu();
        mettreAJourTousLesBadges();
    });

    pileUndo = [];
    pileRedo = [];
}

function centrerVueSurContenu() {
    if (!zoneTravail) return;
    if (etat.noeuds.size === 0) {
        zoneTravail.scrollLeft = OFFSET_X * etat.zoom - zoneTravail.clientWidth / 2;
        zoneTravail.scrollTop = OFFSET_Y * etat.zoom - zoneTravail.clientHeight / 2;
    } else {
        var sumX = 0, sumY = 0, count = 0;
        for (var entry of etat.noeuds) {
            var nd = entry[1];
            sumX += nd.x;
            sumY += nd.y;
            count++;
        }
        var cx = (sumX / count + OFFSET_X) * etat.zoom;
        var cy = (sumY / count + OFFSET_Y) * etat.zoom;
        zoneTravail.scrollLeft = cx - zoneTravail.clientWidth / 2;
        zoneTravail.scrollTop = cy - zoneTravail.clientHeight / 2;
    }
}

// === ATTACHER ÉVÉNEMENTS D'UN NŒUD ===
function attacherEvenements(el, donnees) {
    var id = donnees.id;
    var config = TYPES[donnees.type];
    var estConteneur = config && config.conteneur === true;

    el.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('planif-noeud-port') || e.target.isContentEditable) return;
        e.preventDefault();

        if (e.metaKey || e.ctrlKey) {
            toggleMultiSelection(id);
            return;
        }

        // ⌥ (Mac) / Alt (Windows) + glisser : dupliquer le bloc et glisser le
        // doublon (4 août 2026, exercice 601-101). Feuille = instance liée ;
        // conteneur = copie indépendante en profondeur (6 août soir).
        if (e.altKey) {
            var cloneId = clonerNoeud(id);
            if (cloneId) {
                var clone = etat.noeuds.get(cloneId);
                var cloneEl = document.getElementById(cloneId);
                if (clone && cloneEl) {
                    if (!estConteneur) {
                        // Le doublon (feuille) part de la position de la source
                        // (pas du décalage de ⌘D) puis suit le curseur. Un
                        // CONTENEUR copié garde son +40/+40 : téléporter sa
                        // racine seule décollerait ses enfants.
                        clone.x = donnees.x;
                        clone.y = donnees.y;
                        cloneEl.style.left = clone.x + 'px';
                        cloneEl.style.top = clone.y + 'px';
                    }
                    cloneEl.dispatchEvent(new MouseEvent('mousedown', {
                        bubbles: true, cancelable: true,
                        clientX: e.clientX, clientY: e.clientY, button: 0
                    }));
                }
                return;
            }
        }

        // Multi-selection group drag
        var estDragGroupe = etat.multiSelection.size > 1 && etat.multiSelection.has(id);
        if (estDragGroupe) {
            enregistrerPourUndo();
            var startMouseX = e.clientX;
            var startMouseY = e.clientY;
            var positionsInitiales = new Map();
            var tousNoeuds = new Set(etat.multiSelection);

            for (var nid2 of etat.multiSelection) {
                var nd2 = etat.noeuds.get(nid2);
                if (nd2 && TYPES[nd2.type] && TYPES[nd2.type].conteneur && nd2.enfants) {
                    var desc2 = [];
                    collecterDescendants(nd2, nd2, desc2);
                    for (var d2 = 0; d2 < desc2.length; d2++) tousNoeuds.add(desc2[d2].id);
                }
            }

            for (var nid3 of tousNoeuds) {
                var nd3 = etat.noeuds.get(nid3);
                if (nd3) positionsInitiales.set(nid3, { x: nd3.x, y: nd3.y });
            }

            el.classList.add('planif-dragging');

            function onMoveGroupe(e2) {
                var dx2 = (e2.clientX - startMouseX) / etat.zoom;
                var dy2 = (e2.clientY - startMouseY) / etat.zoom;

                for (var entry2 of positionsInitiales) {
                    var nid4 = entry2[0];
                    var pos2 = entry2[1];
                    var nd4 = etat.noeuds.get(nid4);
                    if (!nd4) continue;
                    nd4.x = pos2.x + dx2;
                    nd4.y = pos2.y + dy2;
                    var nel2 = document.getElementById(nid4);
                    if (nel2) {
                        nel2.style.left = nd4.x + 'px';
                        nel2.style.top = nd4.y + 'px';
                    }
                    mettreAJourLiens(nid4);
                }
            }

            function onUpGroupe() {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveGroupeThrottled);
                document.removeEventListener('mouseup', onUpGroupe);
                sauvegarder();
            }

            var onMoveGroupeThrottled = throttleRAF(onMoveGroupe);
            document.addEventListener('mousemove', onMoveGroupeThrottled);
            document.addEventListener('mouseup', onUpGroupe);
            return;
        }

        enregistrerPourUndo();
        if (etat.multiSelection.size > 0) {
            deselectionnerTout();
        }
        selectionnerNoeud(id);

        var startMouseX2 = e.clientX;
        var startMouseY2 = e.clientY;
        var startDataX = donnees.x;
        var startDataY = donnees.y;

        // CAS B — INVERSION DU MODÈLE (décision Grégoire, 6 août 2026) :
        // saisir une FEUILLE la déplace SEULE, sans double-clic ni ⌘. C'est le
        // geste de Keynote/Figma/Miro : on saisit un objet, on déplace cet
        // objet. Pour déplacer le groupe, on saisit le CADRE du conteneur
        // (CAS C) — un conteneur emporte naturellement son contenu.
        // L'ancien « mode individuel » (rituel de double-clic) est RETIRÉ.
        if (donnees.parent && !estConteneur) {
            el.classList.add('planif-dragging');
            var parentId = donnees.parent;
            var parentData = etat.noeuds.get(parentId);
            var survolConteneurB = null;

            function onMoveB(e2) {
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                el.style.left = donnees.x + 'px';
                el.style.top = donnees.y + 'px';
                mettreAJourLiens(id);

                // Un AUTRE conteneur d'accueil sous le curseur ? (déménagement
                // direct, 6 août 2026 : « je ne suis pas capable de sortir
                // l'activité pour la mettre dans une autre leçon »). Le parent
                // courant n'est jamais surligné — rester dedans est l'état
                // normal, pas une cible.
                var ancienSurvolB = survolConteneurB;
                var candidatB = trouverConteneurPour(e2.clientX, e2.clientY, id, donnees.type);
                survolConteneurB = (candidatB && candidatB !== parentId) ? candidatB : null;
                if (ancienSurvolB !== survolConteneurB) {
                    if (ancienSurvolB) {
                        var aElB = document.getElementById(ancienSurvolB);
                        if (aElB) aElB.classList.remove('planif-conteneur-survol');
                        var znB = aElB ? aElB.querySelector('.planif-noeud-zone') : null;
                        if (znB) znB.classList.remove('planif-survol');
                    }
                    if (survolConteneurB) {
                        var sElB = document.getElementById(survolConteneurB);
                        if (sElB) sElB.classList.add('planif-conteneur-survol');
                        var znB2 = sElB ? sElB.querySelector('.planif-noeud-zone') : null;
                        if (znB2) znB2.classList.add('planif-survol');
                    }
                }

                // ⚠ NE PAS recalculer la zone du parent pendant le drag :
                // avec un enfant unique, la zone recalculée SUIT le bloc 1:1 —
                // « la leçon vient toujours avec », impossible d'en sortir
                // (constat terrain Grégoire, 6 août soir ; reproduit au
                // glisser incrémental). Le parent reste FIGÉ ; il se referme
                // au relâchement (reLayoutAvecAnimation / detacher).
            }

            function onUpB(e2) {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveBThrottled);
                document.removeEventListener('mouseup', onUpB);
                document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                // Déménagement direct vers un autre conteneur : curseur
                // d'abord, recouvrement en filet (bloc posé majoritairement
                // sur la cible, curseur relâché à côté).
                var cibleB = survolConteneurB;
                if (!cibleB) {
                    var parRecouvrement = trouverConteneurParRecouvrement(id, donnees.type);
                    if (parRecouvrement && parRecouvrement !== parentId) cibleB = parRecouvrement;
                }
                if (cibleB) {
                    // rattacherAuConteneur détache de l'ancien parent (qui se
                    // re-dispose) puis dispose la cible.
                    rattacherAuConteneur(id, cibleB);
                    sauvegarder();
                    return;
                }

                // Check if out of bounds → detach
                if (parentData) {
                    var cel2 = document.getElementById(parentId);
                    if (cel2) {
                        var cw2 = parseFloat(cel2.style.width) || cel2.offsetWidth || 200;
                        var ch2 = parseFloat(cel2.style.height) || cel2.offsetHeight || 80;
                        var outOfBounds2 = donnees.x + (el.offsetWidth || 140) < parentData.x ||
                                           donnees.x > parentData.x + cw2 ||
                                           donnees.y + (el.offsetHeight || 50) < parentData.y ||
                                           donnees.y > parentData.y + ch2;
                        if (outOfBounds2) {
                            detacherDuConteneur(id);
                            sauvegarder();
                            return;
                        }
                    }
                }

                // Répartition automatique au lâcher
                if (donnees.parent) {
                    reLayoutAvecAnimation(donnees.parent);
                }
                sauvegarder();
            }

            var onMoveBThrottled = throttleRAF(onMoveB);
            document.addEventListener('mousemove', onMoveBThrottled);
            document.addEventListener('mouseup', onUpB);
            return;
        }

        // CAS C: Conteneur → drag du groupe entier (+ hover-detection pour Leçon)
        if (estConteneur) {
            el.classList.add('planif-dragging');
            var descendantsInit = [];
            if (donnees.enfants) {
                collecterDescendants(donnees, donnees, descendantsInit);
            }

            // Voie A (6 août 2026) : une séquence peut aussi être déposée dans
            // une séquence — même geste que pour une leçon.
            var peutEtreEnfant = donnees.type === 'lecon' || donnees.type === 'sequence';
            var survolConteneur = null;

            function onMoveC(e2) {
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                el.style.left = donnees.x + 'px';
                el.style.top = donnees.y + 'px';
                mettreAJourLiens(id);

                for (var j = 0; j < descendantsInit.length; j++) {
                    var di = descendantsInit[j];
                    var dd = etat.noeuds.get(di.id);
                    if (!dd) continue;
                    dd.x = donnees.x + di.dx;
                    dd.y = donnees.y + di.dy;
                    var del2 = document.getElementById(di.id);
                    if (del2) { del2.style.left = dd.x + 'px'; del2.style.top = dd.y + 'px'; }
                    mettreAJourLiens(di.id);
                }

                // (Zone du parent NON recalculée pendant le drag — même
                // poursuite qu'au CAS B ; réajustée au relâchement.)

                if (peutEtreEnfant) {
                    var ancienSurvol = survolConteneur;
                    survolConteneur = trouverConteneurPour(e2.clientX, e2.clientY, id, donnees.type);
                    if (ancienSurvol !== survolConteneur) {
                        if (ancienSurvol) {
                            var ancienEl = document.getElementById(ancienSurvol);
                            if (ancienEl) ancienEl.classList.remove('planif-conteneur-survol');
                            var zn = ancienEl ? ancienEl.querySelector('.planif-noeud-zone') : null;
                            if (zn) zn.classList.remove('planif-survol');
                        }
                        if (survolConteneur) {
                            var survolEl = document.getElementById(survolConteneur);
                            if (survolEl) survolEl.classList.add('planif-conteneur-survol');
                            var zn2 = survolEl ? survolEl.querySelector('.planif-noeud-zone') : null;
                            if (zn2) zn2.classList.add('planif-survol');
                        }
                    }
                }
            }

            function onUpC() {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveCThrottled);
                document.removeEventListener('mouseup', onUpC);

                document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                if (peutEtreEnfant) {
                    // Recouvrement en filet, comme pour les feuilles.
                    if (!survolConteneur) {
                        survolConteneur = trouverConteneurParRecouvrement(id, donnees.type);
                    }
                    if (survolConteneur && survolConteneur !== donnees.parent) {
                        rattacherAuConteneur(id, survolConteneur);
                    } else if (!survolConteneur && donnees.parent) {
                        detacherDuConteneur(id);
                    } else if (donnees.parent) {
                        // Resté dans son parent : la zone (figée pendant le
                        // drag) se réajuste maintenant.
                        mettreAJourZoneConteneur(donnees.parent);
                    }
                }

                sauvegarder();
            }

            var onMoveCThrottled = throttleRAF(onMoveC);
            document.addEventListener('mousemove', onMoveCThrottled);
            document.addEventListener('mouseup', onUpC);
            return;
        }

        // CAS D: Noeud libre → drag simple + hover-detection conteneur
        el.classList.add('planif-dragging');
        var survolConteneurD = null;

        function onMoveD(e2) {
            donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
            donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
            el.style.left = donnees.x + 'px';
            el.style.top = donnees.y + 'px';
            mettreAJourLiens(id);

            var ancienSurvolD = survolConteneurD;
            survolConteneurD = trouverConteneurPour(e2.clientX, e2.clientY, id, donnees.type);
            if (ancienSurvolD !== survolConteneurD) {
                if (ancienSurvolD) {
                    var aElD = document.getElementById(ancienSurvolD);
                    if (aElD) aElD.classList.remove('planif-conteneur-survol');
                    var znD = aElD ? aElD.querySelector('.planif-noeud-zone') : null;
                    if (znD) znD.classList.remove('planif-survol');
                }
                if (survolConteneurD) {
                    var sElD = document.getElementById(survolConteneurD);
                    if (sElD) sElD.classList.add('planif-conteneur-survol');
                    var znD2 = sElD ? sElD.querySelector('.planif-noeud-zone') : null;
                    if (znD2) znD2.classList.add('planif-survol');
                }
            }
        }

        function onUpD() {
            el.classList.remove('planif-dragging');
            document.removeEventListener('mousemove', onMoveDThrottled);
            document.removeEventListener('mouseup', onUpD);

            document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
            document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

            // Le curseur d'abord, le recouvrement en filet : un bloc relâché
            // majoritairement SUR un conteneur lui appartient, même si le
            // curseur a fini quelques pixels à côté.
            if (!survolConteneurD) {
                survolConteneurD = trouverConteneurParRecouvrement(id, donnees.type);
            }

            if (survolConteneurD && survolConteneurD !== donnees.parent) {
                rattacherAuConteneur(id, survolConteneurD);
            } else if (!survolConteneurD && donnees.parent) {
                detacherDuConteneur(id);
            }

            sauvegarder();
        }

        var onMoveDThrottled = throttleRAF(onMoveD);
        document.addEventListener('mousemove', onMoveDThrottled);
        document.addEventListener('mouseup', onUpD);
    });

    // Double-clic: mode individuel pour enfants, panneau pour le reste
    el.addEventListener('dblclick', function(e) {
        if (e.target.isContentEditable) return;

        // Bloc compact → ouvrir la vue focalisée
        if (el.classList.contains('planif-seq-compact')) {
            ouvrirSequence(id);
            return;
        }

        // Enfant ou libre : même geste, l'inspecteur. (L'ancien « mode
        // individuel » de drag est retiré — inversion du 6 août.)
        selectionnerNoeud(id);
        ouvrirPanneau(id);
    });

    var titreEl = el.querySelector('.planif-noeud-titre');
    titreEl.addEventListener('focus', function() {
        enregistrerPourUndo();
    });
    titreEl.addEventListener('input', throttleRAF(function() {
        donnees.titre = titreEl.textContent;
        sauvegarder();
        // Un titre qui passe sur deux lignes grandit l'en-tête : les enfants
        // doivent redescendre d'autant (même cause que pour les objectifs).
        if (estConteneur) reLayoutConteneur(id);
    }));
    titreEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); titreEl.blur(); }
    });

    // === OBJECTIF DE LEÇON (bascule + saisie) ===
    var badgeObjectif = el.querySelector('.planif-badge-objectif');
    if (badgeObjectif) {
        // Le mousedown du bloc démarre le déplacement : on l'intercepte AVANT
        // qu'il ne remonte (les ports font de même).
        badgeObjectif.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
        });
        var basculerObjectif = function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (!donnees.metadata) donnees.metadata = {};
            donnees.metadata.objectifDeplie = !donnees.metadata.objectifDeplie;
            _ajoutObjectif = null;
            sauvegarder();
            // Reposer les badges APRÈS la reconstruction (cf. definirObjectifLecon).
            reconstruireDOM();
            mettreAJourTousLesBadges();
            // Déplier depuis le badge = intention d'écrire : donner le focus.
            if (donnees.metadata.objectifDeplie) {
                var frais = document.getElementById(id);
                var champ = frais && frais.querySelector('.planif-noeud-objectif');
                if (champ) champ.focus();
            }
        };
        badgeObjectif.addEventListener('click', basculerObjectif);
        badgeObjectif.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') basculerObjectif(e);
        });
    }

    var zoneObjectifs = el.querySelector('.planif-noeud-objectifs');
    if (zoneObjectifs) {
        // Chaque ligne est un objectif ; la dernière, vide, sert à en ajouter.
        var lireLignes = function() {
            var textes = [];
            zoneObjectifs.querySelectorAll('.planif-noeud-objectif').forEach(function(ligne) {
                textes.push(ligne.textContent.trim());
            });
            return textes;
        };
        var rerendreEtFocaliser = function(rang) {
            reconstruireDOM();
            mettreAJourTousLesBadges();
            var frais = document.getElementById(id);
            if (!frais) return;
            var lignes = frais.querySelectorAll('.planif-noeud-objectif');
            var cible = lignes[Math.min(rang, lignes.length - 1)];
            if (cible) placerCurseurEnFin(cible);
        };

        zoneObjectifs.querySelectorAll('.planif-noeud-objectif').forEach(function(ligne) {
            ligne.addEventListener('focus', function() { enregistrerPourUndo(); });

            // Au fil de la frappe : mettre à jour les données SANS reconstruire
            // — le champ perdrait le focus à chaque caractère.
            ligne.addEventListener('input', throttleRAF(function() {
                appliquerObjectifs(donnees, lireLignes());
                // Dès que la ligne d'accueil porte du texte, elle est devenue un
                // objectif comme les autres : l'état transitoire n'a plus lieu.
                if (ligne.dataset.accueil && ligne.textContent.trim() !== '') {
                    delete ligne.dataset.accueil;
                    _ajoutObjectif = null;
                }
                if (badgeObjectif) {
                    var vide = objectifsDeLecon(donnees).length === 0;
                    badgeObjectif.classList.toggle('planif-badge-objectif--vide', vide);
                }
                // Un objectif qui passe sur deux lignes grandit l'en-tête : sans
                // ça, les activités resteraient sous l'ancienne hauteur et se
                // feraient recouvrir. Throttlé en rAF — une passe par frame.
                reLayoutConteneur(id);
            }));

            ligne.addEventListener('keydown', function(e) {
                var rang = parseInt(ligne.dataset.objRang, 10) || 0;
                if (e.key === 'Enter' && !e.shiftKey) {
                    // Entrée = objectif suivant (patron des éditeurs de listes).
                    // Même mécanique que le bouton « + » : une ligne d'accueil,
                    // pas un objectif vide persisté.
                    e.preventDefault();
                    appliquerObjectifs(donnees, lireLignes());
                    if (ligne.textContent.trim() === '') return; // rien à enchaîner
                    _ajoutObjectif = { noeudId: id, rang: rang + 1 };
                    reconstruireDOM();
                    mettreAJourTousLesBadges();
                    var fr = document.getElementById(id);
                    var acc = fr && fr.querySelector('.planif-noeud-objectif[data-accueil]');
                    if (acc) placerCurseurEnFin(acc);
                    return;
                }
                if (e.key === 'Backspace' && ligne.textContent.trim() === '' &&
                    objectifsDeLecon(donnees).length > 0 && rang > 0) {
                    // Vider une ligne puis reculer la supprime.
                    e.preventDefault();
                    var textes = lireLignes();
                    textes.splice(rang, 1);
                    appliquerObjectifs(donnees, textes);
                    rerendreEtFocaliser(rang - 1);
                }
            });

            ligne.addEventListener('blur', function() {
                // Une ligne vidée en plein milieu laisserait un trou : on
                // recompacte, mais seulement si la structure a bougé.
                var avant = objectifsDeLecon(donnees).length;
                var abandonAccueil = !!ligne.dataset.accueil && ligne.textContent.trim() === '';
                if (abandonAccueil) _ajoutObjectif = null;
                appliquerObjectifs(donnees, lireLignes());
                if (abandonAccueil || objectifsDeLecon(donnees).length !== avant) {
                    reconstruireDOM();
                    mettreAJourTousLesBadges();
                }
            });
        });

        // Boutons + / − : les raccourcis clavier (Entrée, Retour arrière) ne se
        // voient pas. Même travers que l'ancien badge 🎯 — une commande
        // invisible n'existe pas pour qui ne la connaît pas déjà.
        zoneObjectifs.querySelectorAll('.planif-obj-btn').forEach(function(btn) {
            btn.addEventListener('mousedown', function(e) {
                // Sans quoi le mousedown du bloc démarrerait un déplacement.
                e.stopPropagation();
                e.preventDefault();
            });
            var agir = function(e) {
                e.stopPropagation();
                e.preventDefault();
                // `rang` est un index de LIGNE RENDUE (une ligne d'accueil vide
                // en fait partie), alors que l'état d'accueil s'exprime en
                // index d'OBJECTIF — les lignes vides ne sont pas persistées.
                var rang = parseInt(btn.dataset.objRang, 10) || 0;
                var textes = lireLignes();
                if (btn.classList.contains('planif-obj-ajouter')) {
                    var rangObjectif = textes.slice(0, rang + 1).filter(function(t) {
                        return t !== '';
                    }).length;
                    // Un objectif vide n'est jamais persisté : on demande au
                    // rendu d'ouvrir une ligne d'accueil au bon rang.
                    appliquerObjectifs(donnees, textes);
                    _ajoutObjectif = { noeudId: id, rang: rangObjectif };
                    reconstruireDOM();
                    mettreAJourTousLesBadges();
                    var frais = document.getElementById(id);
                    var accueil = frais && frais.querySelector('.planif-noeud-objectif[data-accueil]');
                    if (accueil) placerCurseurEnFin(accueil);
                } else {
                    // Retirer marche sur la ligne, accueil compris (l'annuler).
                    textes.splice(rang, 1);
                    _ajoutObjectif = null;
                    appliquerObjectifs(donnees, textes);
                    reconstruireDOM();
                    mettreAJourTousLesBadges();
                }
            };
            btn.addEventListener('click', agir);
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') agir(e);
            });
        });
    }

    el.querySelectorAll('.planif-noeud-port').forEach(function(port) {
        port.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            demarrerLien(id, port.dataset.dir, e);
        });
    });

    // === POIGNÉE DE REDIMENSIONNEMENT (feuilles seulement) ===
    var poignee = el.querySelector('.planif-noeud-poignee');
    if (poignee) {
        poignee.addEventListener('mousedown', function(e) {
            e.stopPropagation();  // sinon le bloc partirait en déplacement
            e.preventDefault();
            enregistrerPourUndo();

            var departX = e.clientX;
            var departY = e.clientY;
            var largeurDepart = el.offsetWidth;
            var hauteurDepart = el.offsetHeight;

            var surDeplacement = throttleRAF(function(ev) {
                // Les deltas sont en pixels ÉCRAN ; les tailles du nœud sont en
                // coordonnées de carte. Diviser par le zoom, comme le fait la
                // conversion de position (cf. clientX → coordonnées carte).
                var z = etat.zoom || 1;
                var w = Math.max(LARGEUR_MIN_NOEUD, largeurDepart + (ev.clientX - departX) / z);

                if (estConteneur) {
                    // Option B : on ne pose qu'une largeur PLANCHER et on laisse
                    // la disposition recalculer. Écrire style.width serait vain
                    // — reLayoutConteneur l'écraserait au prochain passage.
                    if (!donnees.metadata) donnees.metadata = {};
                    donnees.metadata.largeurMin = Math.round(w);
                    reLayoutConteneur(id);
                    return;
                }

                var h = Math.max(HAUTEUR_MIN_NOEUD, hauteurDepart + (ev.clientY - departY) / z);
                el.classList.add('planif-noeud--taille-libre');
                el.style.width = w + 'px';
                el.style.height = h + 'px';
                mettreAJourLiens(id);
            });

            var surRelachement = function() {
                document.removeEventListener('mousemove', surDeplacement);
                document.removeEventListener('mouseup', surRelachement);
                if (!donnees.metadata) donnees.metadata = {};
                if (!estConteneur) {
                    donnees.metadata.largeur = Math.round(el.offsetWidth);
                    donnees.metadata.hauteur = Math.round(el.offsetHeight);
                }
                sauvegarder();
                // Le parent se dimensionne d'après ses enfants : il doit
                // reprendre la mesure du bloc qu'on vient de retailler.
                if (donnees.parent) reLayoutConteneur(donnees.parent);
                mettreAJourTousLesBadges();
            };

            document.addEventListener('mousemove', surDeplacement);
            document.addEventListener('mouseup', surRelachement);
        });

        // Double-clic : revenir à la taille automatique.
        poignee.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            e.preventDefault();
            enregistrerPourUndo();
            if (donnees.metadata) {
                delete donnees.metadata.largeur;
                delete donnees.metadata.hauteur;
                delete donnees.metadata.largeurMin;
            }
            el.classList.remove('planif-noeud--taille-libre');
            el.style.width = '';
            el.style.height = '';
            sauvegarder();
            if (estConteneur) reLayoutConteneur(id);
            if (donnees.parent) reLayoutConteneur(donnees.parent);
            mettreAJourTousLesBadges();
        });
    }

    el.addEventListener('click', function(e) {
        if (e.target.classList.contains('planif-noeud-port')) return;
        if (e.metaKey || e.ctrlKey) return;
        if (etat.multiSelection.size === 0) {
            selectionnerNoeud(id);
            // Rafraîchir l'inspecteur si déjà ouvert
            if (etat.panneauOuvert) {
                ouvrirPanneau(id);
            }
        }
    });
}

// === PANNEAU SÉANCES ===
function toggleSeances() {
    seancesOuvert = !seancesOuvert;
    if (panneauSeances) panneauSeances.classList.toggle('visible', seancesOuvert);
    if (btnSeances) btnSeances.classList.toggle('actif', seancesOuvert);
    if (seancesOuvert) rafraichirSeances();
}

function getLiensDeNoeud(noeudId) {
    var resultat = [];
    for (var entry of etat.liens) {
        var lien = entry[1];
        if (lien.source === noeudId || lien.cible === noeudId) {
            var autreId = lien.source === noeudId ? lien.cible : lien.source;
            var autre = etat.noeuds.get(autreId);
            var typeLienConfig = trouverConfigLien(lien.type);
            if (autre && typeLienConfig) {
                resultat.push({
                    noeudId: autreId,
                    noeudTitre: autre.titre || (TYPES[autre.type] ? TYPES[autre.type].label : '?'),
                    noeudType: autre.type,
                    lienLabel: typeLienConfig.label,
                    direction: lien.source === noeudId ? 'sortant' : 'entrant'
                });
            }
        }
    }
    return resultat;
}

function naviguerVers(noeudId) {
    var donnees = etat.noeuds.get(noeudId);
    if (!donnees) return;

    deselectionnerTout();
    selectionnerNoeud(noeudId);

    var el = document.getElementById(noeudId);
    if (!el) return;
    var targetX = (donnees.x + OFFSET_X + (el.offsetWidth || 140) / 2) * etat.zoom - zoneTravail.clientWidth / 2;
    var targetY = (donnees.y + OFFSET_Y + (el.offsetHeight || 50) / 2) * etat.zoom - zoneTravail.clientHeight / 2;

    zoneTravail.scrollTo({ left: targetX, top: targetY, behavior: 'smooth' });

    el.style.transition = 'box-shadow 0.3s';
    el.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.4), 0 0 20px rgba(59,130,246,0.2)';
    setTimeout(function() {
        el.style.boxShadow = '';
        el.style.transition = '';
    }, 1200);
}

// === ORGANISATEUR — SÉLECTEURS ET AFFICHAGE LEÇON ===

function peuplerSelecteursOrganisateur() {
    // Collecter séquences
    var sequences = [];
    for (var entry of etat.noeuds) {
        if (entry[1].type === 'sequence') sequences.push(entry[1]);
    }
    sequences.sort(function(a, b) { return rangTemporel(a) - rangTemporel(b); });

    // Peupler select séquence
    var valActuelle = orgSelectSequence.value;
    orgSelectSequence.innerHTML = '<option value="">— Séquence —</option>';
    for (var i = 0; i < sequences.length; i++) {
        var opt = document.createElement('option');
        opt.value = sequences[i].id;
        opt.textContent = sequences[i].titre || 'Séquence ' + (i + 1);
        orgSelectSequence.appendChild(opt);
    }
    orgSelectSequence.value = valActuelle;

    peuplerSelecteurLecons();
}

function peuplerSelecteurLecons() {
    var seqId = orgSelectSequence.value;
    var lecons = [];

    if (seqId) {
        // Leçons enfants de la séquence sélectionnée
        var seq = etat.noeuds.get(seqId);
        if (seq && seq.enfants) {
            for (var i = 0; i < seq.enfants.length; i++) {
                var e = etat.noeuds.get(seq.enfants[i]);
                if (e && e.type === 'lecon') lecons.push(e);
            }
        }
    } else {
        // Toutes les leçons
        for (var entry of etat.noeuds) {
            if (entry[1].type === 'lecon') lecons.push(entry[1]);
        }
    }

    var valActuelle = orgSelectLecon.value;
    orgSelectLecon.innerHTML = '<option value="">— Leçon —</option>';
    for (var j = 0; j < lecons.length; j++) {
        var opt = document.createElement('option');
        opt.value = lecons[j].id;
        opt.textContent = lecons[j].titre || 'Leçon ' + (j + 1);
        orgSelectLecon.appendChild(opt);
    }
    orgSelectLecon.value = valActuelle;

    afficherLeconOrganisateur();
}

function trouverIdeesMaitressesAncetres(noeudId) {
    // Remonter les branches (parent + liens) pour trouver TOUTES les idées maîtresses
    var visite = {};
    var aExplorer = [noeudId];
    var resultats = [];
    var ids = {};
    while (aExplorer.length > 0) {
        var courantId = aExplorer.shift();
        if (visite[courantId]) continue;
        visite[courantId] = true;
        var courant = etat.noeuds.get(courantId);
        if (!courant) continue;

        // Vérifier les liens de ce nœud pour des idées maîtresses
        var liens = getLiensDeNoeud(courantId);
        for (var i = 0; i < liens.length; i++) {
            var cible = etat.noeuds.get(liens[i].noeudId);
            if (cible && cible.type === 'idee-maitresse' && !ids[cible.id]) {
                resultats.push(cible);
                ids[cible.id] = true;
            }
        }

        // Remonter au parent (conteneur)
        if (courant.parent && !visite[courant.parent]) {
            aExplorer.push(courant.parent);
        }
    }
    return resultats;
}

function chargerProductions() {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return [];
    try {
        var productions = db.getSync(window.cle('productions'), []);
        return productions.filter(function(p) { return p.estActive; }).map(function(p) {
            // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
            var infoC = db.getSync('infoCours', null);
            var gcPlanif = infoC ? (infoC._groupeCoursId || infoC.id || null) : null;
            var dateEch = (typeof obtenirEcheanceEffective === 'function')
                ? obtenirEcheanceEffective(p, gcPlanif).date : p.dateEcheance;
            return { id: p.id, nom: p.nom, type: p.type || 'autre', ponderation: p.ponderation || 0, grilleId: p.grilleId, dateEcheance: dateEch };
        });
    } catch(e) { return []; }
}

function afficherDetailsProduction(productionId, productions) {
    if (!productionId) return null;
    var prod = null;
    for (var i = 0; i < productions.length; i++) {
        if (productions[i].id === productionId) { prod = productions[i]; break; }
    }
    if (!prod) return null;
    var nomGrille = 'Aucune grille';
    var nomEchelle = 'Aucune échelle';
    try {
        if (typeof db !== 'undefined' && typeof window.cle === 'function' && prod.grilleId) {
            var grilles = db.getSync(window.cle('grillesTemplates'), []);
            var grille = grilles.find(function(g) { return g.id === prod.grilleId; });
            if (grille) {
                nomGrille = grille.nom || nomGrille;
                var echelles = db.getSync(window.cle('echellesTemplates'), []);
                var echelle = echelles.find(function(e) { return e.id === grille.echelleId; });
                if (echelle) nomEchelle = echelle.nom || nomEchelle;
            }
        }
    } catch(e) { console.warn('[Planif-Carte] grille/echelle lookup skipped:', e.message || e); }
    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
    var infoCDet = db.getSync('infoCours', null);
    var gcDetPlanif = infoCDet ? (infoCDet._groupeCoursId || infoCDet.id || null) : null;
    var dateEchDet = (typeof obtenirEcheanceEffective === 'function')
        ? obtenirEcheanceEffective(prod, gcDetPlanif).date : (prod.dateEcheance || null);
    return { nomProduction: prod.nom, ponderation: prod.ponderation, nomGrille: nomGrille, nomEchelle: nomEchelle, dateEcheance: dateEchDet };
}

function sauvegarderChoixActivite(leconId, activiteId, retroaction, productionId) {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return;
    var seances = db.getSync(window.cle(CLE_SEANCES), {});
    if (!seances[leconId]) seances[leconId] = {};
    if (!seances[leconId].activites) seances[leconId].activites = {};
    seances[leconId].activites[activiteId] = { retroaction: retroaction, productionId: productionId || null };
    db.setSync(window.cle(CLE_SEANCES), seances);
}

function afficherLeconOrganisateur() {
    var leconId = orgSelectLecon.value;
    if (!leconId) {
        orgLecon.style.display = 'none';
        return;
    }
    orgLecon.style.display = '';

    var lecon = etat.noeuds.get(leconId);
    if (!lecon) return;

    // Objectif — remonter les branches pour trouver toutes les idées maîtresses
    var objContenu = orgLecon.querySelector('#planif-org-objectif .planif-org-section-contenu');
    var ideesM = trouverIdeesMaitressesAncetres(leconId);
    if (ideesM.length === 0) {
        objContenu.textContent = 'Aucune idée maîtresse associée. Reliez la branche à une idée maîtresse.';
        objContenu.classList.add('planif-org-placeholder');
    } else if (ideesM.length === 1) {
        var titre = (ideesM[0].titre || '...').toLowerCase();
        var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
        objContenu.textContent = 'Au terme de la leçon, l\'étudiant·e sera capable ' + prefixe + titre + '.';
        objContenu.classList.remove('planif-org-placeholder');
    } else {
        var html = 'Au terme de la leçon, l\u2019étudiant·e sera capable\u00a0:<br>';
        for (var k = 0; k < ideesM.length; k++) {
            var t = (ideesM[k].titre || '...').toLowerCase();
            var p = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(t) ? "d'" : 'de ';
            html += '\u00a0\u00a0— ' + p + t + (k < ideesM.length - 1 ? '\u00a0;' : '.') + '<br>';
        }
        objContenu.innerHTML = html;
        objContenu.classList.remove('planif-org-placeholder');
    }

    // Enseignement explicite — checkbox
    var eeContenu = document.getElementById('planif-org-ee-checkbox');
    if (eeContenu) {
        eeContenu.checked = !!(lecon.metadata && lecon.metadata.enseignementExplicite);
    }

    // Prérequis — placeholder (Phase 2)
    // Productions — placeholder (Phase 2)

    // Signal de cohérence évaluation
    var evalsLecon = (lecon.enfants || []).filter(function(eid) {
        var e = etat.noeuds.get(eid);
        return e && e.type === 'evaluation';
    });

    // Cœur de la leçon — afficher les enfants (activités, soutiens, révisions, évaluations)
    var coeurContenu = document.getElementById('planif-org-coeur-contenu');
    var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var activites = enfants.filter(function(eid) {
        var e = etat.noeuds.get(eid);
        return e && (e.type === 'activite' || e.type === 'soutien' || e.type === 'revision');
    });

    // Charger les productions depuis Construction de la note
    var productions = chargerProductions();
    var seances = typeof db !== 'undefined' ? db.getSync(window.cle(CLE_SEANCES), {}) : {};

    if (activites.length === 0) {
        coeurContenu.innerHTML = '<div class="planif-org-placeholder">Aucune activité dans cette leçon.</div>';
    } else {
        // Vérifier cohérence évaluation
        var aucuneProd = activites.every(function(eid) {
            var choix = (seances[leconId] && seances[leconId].activites && seances[leconId].activites[eid]) || {};
            return !choix.productionId;
        });
        var h = '';
        if (evalsLecon.length > 0 && aucuneProd) {
            h += '<div class="planif-org-avertissement">\u26A0 ' + evalsLecon.length + ' évaluation' + (evalsLecon.length > 1 ? 's' : '') + ' dans la carte ' + (evalsLecon.length > 1 ? 'ne sont reliées' : "n'est reliée") + ' à aucune activité ci-dessous.</div>';
        }

        for (var j = 0; j < activites.length; j++) {
            var enf = etat.noeuds.get(activites[j]);
            if (!enf) continue;
            var choixAct = (seances[leconId] && seances[leconId].activites && seances[leconId].activites[enf.id]) || { retroaction: 'aucune', productionId: null };

            h += '<div class="planif-org-activite" data-noeud="' + enf.id + '">';
            h += '<div class="planif-org-activite-entete">';
            h += '<span class="planif-cal-pastille-mini" style="background: ' + obtenirCouleurNoeud(enf) + '"></span>';
            h += '<span class="planif-cal-item-titre">' + (enf.titre || obtenirLabelNoeud(enf)) + '</span>';
            h += '<span class="planif-org-activite-type">' + obtenirLabelNoeud(enf).toUpperCase() + '</span>';
            if (enf.metadata && enf.metadata.duree) {
                h += ' <span class="planif-cal-duree">' + enf.metadata.duree + ' min</span>';
            }
            h += '</div>';

            // Rétroaction
            h += '<div class="planif-org-activite-detail">';
            h += '<label>Rétroaction\u00a0:</label>';
            h += '<select class="planif-org-select-retro" data-activite="' + enf.id + '" data-lecon="' + leconId + '">';
            var retros = [['aucune', 'Aucune'], ['orale', 'Orale'], ['ecrite', 'Écrite'], ['pairs', 'Par les pairs']];
            for (var r = 0; r < retros.length; r++) {
                h += '<option value="' + retros[r][0] + '"' + (choixAct.retroaction === retros[r][0] ? ' selected' : '') + '>' + retros[r][1] + '</option>';
            }
            h += '</select>';
            h += '</div>';

            // Production
            h += '<div class="planif-org-activite-detail">';
            h += '<label>Production\u00a0:</label>';
            h += '<select class="planif-org-select-prod" data-activite="' + enf.id + '" data-lecon="' + leconId + '">';
            h += '<option value="">Aucune</option>';
            if (productions.length > 0) {
                var parType = {};
                for (var p = 0; p < productions.length; p++) {
                    var tp = productions[p].type || 'autre';
                    if (!parType[tp]) parType[tp] = [];
                    parType[tp].push(productions[p]);
                }
                var typesOrdre = ['travail', 'examen', 'projet', 'quiz', 'autre'];
                var typesLabels = { travail: 'Travaux', examen: 'Examens', projet: 'Projets', quiz: 'Quiz', autre: 'Autres' };
                for (var ti = 0; ti < typesOrdre.length; ti++) {
                    var grp = parType[typesOrdre[ti]];
                    if (!grp || grp.length === 0) continue;
                    h += '<optgroup label="' + (typesLabels[typesOrdre[ti]] || typesOrdre[ti]) + '">';
                    for (var pi = 0; pi < grp.length; pi++) {
                        var selected = choixAct.productionId === grp[pi].id ? ' selected' : '';
                        h += '<option value="' + grp[pi].id + '"' + selected + '>' + grp[pi].nom + ' (' + (grp[pi].ponderation || 0) + ' %)</option>';
                    }
                    h += '</optgroup>';
                }
            }
            h += '</select>';
            h += '</div>';

            // Détails production (si sélectionnée)
            if (choixAct.productionId) {
                var details = afficherDetailsProduction(choixAct.productionId, productions);
                if (details) {
                    h += '<div class="planif-org-prod-details">';
                    h += 'Grille\u00a0: ' + details.nomGrille + ' \u00b7 Échelle\u00a0: ' + details.nomEchelle;
                    if (details.dateEcheance) h += '<br>Échéance\u00a0: ' + details.dateEcheance;
                    h += '</div>';
                }
            }

            h += '</div>';
        }
        coeurContenu.innerHTML = h;

        // Brancher les event listeners
        coeurContenu.querySelectorAll('.planif-org-select-retro').forEach(function(sel) {
            sel.addEventListener('change', function() {
                sauvegarderChoixActivite(sel.dataset.lecon, sel.dataset.activite, sel.value, null);
            });
        });
        coeurContenu.querySelectorAll('.planif-org-select-prod').forEach(function(sel) {
            sel.addEventListener('change', function() {
                var retro = sel.closest('.planif-org-activite').querySelector('.planif-org-select-retro');
                sauvegarderChoixActivite(sel.dataset.lecon, sel.dataset.activite, retro ? retro.value : 'aucune', sel.value || null);
                afficherLeconOrganisateur(); // Refresh to show production details
            });
        });
        coeurContenu.querySelectorAll('.planif-org-activite-entete').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var nid = el.closest('[data-noeud]').dataset.noeud;
                if (nid) naviguerVers(nid);
            });
        });
    }
}

function rafraichirSeances() {
    if (!seancesOuvert) return;
    // Peupler les sélecteurs. (La Vue calendrier — rendu recyclé + rognage
    // DOM — est RETIRÉE au lot 2 : le planificateur en grille la remplace.)
    if (orgSelectSequence) peuplerSelecteursOrganisateur();
}

// === EXPORT DU PLAN DE COURS ===
function genererPlanTexte() {
    var sequences = [];
    var leconsOrphelines = [];
    var index = window.planificationDonnees.getIndex();
    var nomCarte = 'Sans titre';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    // Ordre hiérarchique : chaque sous-séquence a sa section, après son parent.
    var hierarchie = listerSequencesHierarchie('temporel');
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }
    sequences = hierarchie.map(function(e) { return e.seq; });

    function formatDuree(min) {
        if (!min) return '';
        var h = Math.floor(min / 60);
        var m = min % 60;
        return h > 0 ? h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '') : m + ' min';
    }

    function liensTexte(noeudId, indent) {
        var liens = getLiensDeNoeud(noeudId);
        if (liens.length === 0) return '';
        var s = '';
        for (var i = 0; i < liens.length; i++) {
            var l = liens[i];
            var fleche = l.direction === 'sortant' ? '→' : '←';
            s += indent + fleche + ' ' + l.lienLabel + ' : ' + l.noeudTitre + '\n';
        }
        return s;
    }

    var txt = '═══════════════════════════════════════\n';
    txt += 'PLAN DE COURS — ' + nomCarte + '\n';
    txt += 'Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n';
    txt += '═══════════════════════════════════════\n\n';

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        var etendueSeq = formaterEtendue(etendueTemporelle(seq));
        var semTxt = etendueSeq ? ' (' + etendueSeq + ')' : '';

        // Une sous-séquence est titrée par son CHEMIN (« Parent › Enfant »)
        // pour rester lisible dans un document plat.
        var titreSeq = hierarchie[i].niveau > 0 ? cheminSequence(seq) : (seq.titre || 'Sans titre');
        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉQUENCE : ' + titreSeq + semTxt + '\n';
        txt += '───────────────────────────────────────\n';
        txt += liensTexte(seq.id, '  ');

        var enfants = (seq.enfants || []).filter(function(eid) {
            var nd1 = etat.noeuds.get(eid);
            // Les sous-séquences ont leur propre section plus bas.
            return nd1 && nd1.type !== 'sequence';
        });
        var dureeSeq = 0;

        for (var j = 0; j < enfants.length; j++) {
            var ed = etat.noeuds.get(enfants[j]);
            if (!ed) continue;

            if (ed.type === 'lecon') {
                var dureeLecon = ed.metadata && ed.metadata.duree ? ' — ' + formatDuree(ed.metadata.duree) : '';
                txt += '\n  ┌ SÉANCE : ' + (ed.titre || 'Sans titre') + dureeLecon + '\n';
                txt += liensTexte(ed.id, '  │ ');
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;

                var enfantsLecon = (ed.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
                for (var k = 0; k < enfantsLecon.length; k++) {
                    var cd = etat.noeuds.get(enfantsLecon[k]);
                    if (!cd) continue;
                    var dureeAct = cd.metadata && cd.metadata.duree ? ' (' + formatDuree(cd.metadata.duree) + ')' : '';
                    txt += '  │ • [' + obtenirLabelNoeud(cd) + '] ' + (cd.titre || 'Sans titre') + dureeAct + '\n';
                    txt += liensTexte(enfantsLecon[k], '  │   ');
                    if (cd.metadata && cd.metadata.duree) dureeSeq += cd.metadata.duree;
                }
                txt += '  └─\n';
            } else {
                var dureeEd = ed.metadata && ed.metadata.duree ? ' (' + formatDuree(ed.metadata.duree) + ')' : '';
                txt += '  • [' + obtenirLabelNoeud(ed) + '] ' + (ed.titre || 'Sans titre') + dureeEd + '\n';
                txt += liensTexte(enfants[j], '    ');
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;
            }
        }

        if (dureeSeq > 0) txt += '  Durée totale : ' + formatDuree(dureeSeq) + '\n';
        txt += '\n';
    }

    if (leconsOrphelines.length > 0) {
        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉANCES HORS SÉQUENCE\n';
        txt += '───────────────────────────────────────\n';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            var lecon = leconsOrphelines[p];
            var dlOrph = lecon.metadata && lecon.metadata.duree ? ' — ' + formatDuree(lecon.metadata.duree) : '';
            txt += '\n  ┌ SÉANCE : ' + (lecon.titre || 'Sans titre') + dlOrph + '\n';
            txt += liensTexte(lecon.id, '  │ ');
            var enfOrph = (lecon.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
            for (var q = 0; q < enfOrph.length; q++) {
                var cdOrph = etat.noeuds.get(enfOrph[q]);
                if (!cdOrph) continue;
                var dureeOrph = cdOrph.metadata && cdOrph.metadata.duree ? ' (' + formatDuree(cdOrph.metadata.duree) + ')' : '';
                txt += '  │ • [' + obtenirLabelNoeud(cdOrph) + '] ' + (cdOrph.titre || 'Sans titre') + dureeOrph + '\n';
                txt += liensTexte(enfOrph[q], '  │   ');
            }
            txt += '  └─\n';
        }
    }

    return txt;
}

function genererPlanTSV() {
    var leconsOrphelines = [];

    // Ordre hiérarchique ; la colonne « Séquence » d'une sous-séquence porte
    // son chemin (« Parent › Enfant ») — le format tabulaire reste plat.
    var hierarchie = listerSequencesHierarchie('temporel');
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }
    var sequences = hierarchie.map(function(e) { return e.seq; });

    var tsv = 'Séquence\tSemaines\tSéance\tDurée séance (min)\tType\tTitre\tDurée (min)\tLiens\n';

    function liensCompacts(noeudId) {
        var liens = getLiensDeNoeud(noeudId);
        return liens.map(function(l) {
            var fleche = l.direction === 'sortant' ? '→' : '←';
            return fleche + ' ' + l.lienLabel + ' : ' + l.noeudTitre;
        }).join(' ; ');
    }

    function escape(str) {
        return (str || '').replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        // Colonne « Semaines » du TSV : sans le préfixe « Sem. », c'est un
        // en-tête de colonne qui le porte.
        var etendueSeq = etendueTemporelle(seq);
        var semTxt = etendueSeq
            ? etendueSeq.debut + (etendueSeq.fin !== etendueSeq.debut ? '–' + etendueSeq.fin : '')
            : '';
        var seqLiens = liensCompacts(seq.id);
        var seqNom = escape(hierarchie[i].niveau > 0 ? cheminSequence(seq) : (seq.titre || 'Sans titre'));
        var enfants = (seq.enfants || []).filter(function(eid) {
            var nd2 = etat.noeuds.get(eid);
            // Les sous-séquences ont leurs propres lignes plus bas.
            return nd2 && nd2.type !== 'sequence';
        });

        if (enfants.length === 0) {
            tsv += seqNom + '\t' + semTxt + '\t\t\tSéquence\t' + seqNom + '\t\t' + escape(seqLiens) + '\n';
            continue;
        }

        for (var j = 0; j < enfants.length; j++) {
            var ed = etat.noeuds.get(enfants[j]);
            if (!ed) continue;

            if (ed.type === 'lecon') {
                var leconNom = escape(ed.titre || 'Sans titre');
                var leconDuree = ed.metadata && ed.metadata.duree || '';
                var leconLiens = liensCompacts(ed.id);
                tsv += seqNom + '\t' + semTxt + '\t' + leconNom + '\t' + leconDuree + '\tSéance\t' + leconNom + '\t' + leconDuree + '\t' + escape(leconLiens) + '\n';

                var enfantsLecon = (ed.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
                for (var k = 0; k < enfantsLecon.length; k++) {
                    var cd = etat.noeuds.get(enfantsLecon[k]);
                    if (!cd) continue;
                    var actLiens = liensCompacts(enfantsLecon[k]);
                    tsv += seqNom + '\t' + semTxt + '\t' + leconNom + '\t' + leconDuree + '\t' + escape(obtenirLabelNoeud(cd)) + '\t' + escape(cd.titre || 'Sans titre') + '\t' + (cd.metadata && cd.metadata.duree || '') + '\t' + escape(actLiens) + '\n';
                }
            } else {
                var actLiens2 = liensCompacts(enfants[j]);
                tsv += seqNom + '\t' + semTxt + '\t\t\t' + escape(obtenirLabelNoeud(ed)) + '\t' + escape(ed.titre || 'Sans titre') + '\t' + (ed.metadata && ed.metadata.duree || '') + '\t' + escape(actLiens2) + '\n';
            }
        }
    }

    for (var p = 0; p < leconsOrphelines.length; p++) {
        var lecon2 = leconsOrphelines[p];
        var leconNom2 = escape(lecon2.titre || 'Sans titre');
        var leconDuree2 = lecon2.metadata && lecon2.metadata.duree || '';
        var leconLiens2 = liensCompacts(lecon2.id);
        tsv += '(Hors séquence)\t\t' + leconNom2 + '\t' + leconDuree2 + '\tSéance\t' + leconNom2 + '\t' + leconDuree2 + '\t' + escape(leconLiens2) + '\n';

        var enfOrph = (lecon2.enfants || []).filter(function(cid) { return etat.noeuds.has(cid); });
        for (var q = 0; q < enfOrph.length; q++) {
            var cdOrph = etat.noeuds.get(enfOrph[q]);
            if (!cdOrph) continue;
            var actLiens3 = liensCompacts(enfOrph[q]);
            tsv += '(Hors séquence)\t\t' + leconNom2 + '\t' + leconDuree2 + '\t' + escape(obtenirLabelNoeud(cdOrph)) + '\t' + escape(cdOrph.titre || 'Sans titre') + '\t' + (cdOrph.metadata && cdOrph.metadata.duree || '') + '\t' + escape(actLiens3) + '\n';
        }
    }

    return tsv;
}

function telechargerFichier(contenu, nomFichier, type) {
    var blob = new Blob(['\uFEFF' + contenu], { type: type + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);
}

// === MULTI-CARTES UI ===
function mettreAJourListeCartes() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var select = document.getElementById('planif-liste-cartes');
    if (!select) return;
    select.innerHTML = '';
    for (var i = 0; i < index.cartes.length; i++) {
        var carte = index.cartes[i];
        var opt = document.createElement('option');
        opt.value = carte.id;
        opt.textContent = carte.nom;
        if (carte.id === index.active) opt.selected = true;
        select.appendChild(opt);
    }
}

function nouvelleCarte(nom) {
    sequenceActiveId = null;
    var index = window.planificationDonnees.getIndex();
    if (!index) index = { active: null, compteurCartes: 0, cartes: [] };
    var id = 'carte_' + (++index.compteurCartes);
    index.cartes.push({ id: id, nom: nom || 'Sans titre', dateCreation: new Date().toISOString() });
    index.active = id;
    window.planificationDonnees.sauvegarderIndex(index);
    viderCanvas();
    mettreAJourListeCartes();
    sauvegarder();
    centrerVueSurContenu();
}

function renommerCarteActive(nouveauNom) {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    if (!carte) return;
    carte.nom = nouveauNom || 'Sans titre';
    window.planificationDonnees.sauvegarderIndex(index);
    mettreAJourListeCartes();
}

function exporterCarte() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    var donnees = {
        nom: carte ? carte.nom : 'Sans titre',
        dateExport: new Date().toISOString(),
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    var blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = ((carte ? carte.nom : 'carte').replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '')) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importerCarte(fichier) {
    var lecteur = new FileReader();
    lecteur.onload = function(e) {
        try {
            var donnees = JSON.parse(e.target.result);
            if (!donnees.noeuds || !Array.isArray(donnees.noeuds)) {
                console.warn('[Planification] Format de fichier invalide.');
                return;
            }
            var nom = donnees.nom || fichier.name.replace('.json', '') || 'Importée';
            var index = window.planificationDonnees.getIndex();
            if (!index) index = { active: null, compteurCartes: 0, cartes: [] };
            var id = 'carte_' + (++index.compteurCartes);
            index.cartes.push({ id: id, nom: nom, dateCreation: new Date().toISOString() });
            index.active = id;
            window.planificationDonnees.sauvegarderIndex(index);
            // Migration anciens types de connaissances → Anderson (fichiers importés)
            for (var mi = 0; mi < donnees.noeuds.length; mi++) {
                var nm = donnees.noeuds[mi];
                if (nm.type === 'connaissance') nm.type = 'factuelle';
                else if (nm.type === 'strategie') nm.type = 'procedurale';
                else if (nm.type === 'condition') nm.type = 'procedurale';
                else if (nm.type === 'prerequis') {
                    nm.type = 'factuelle';
                    if (!nm.metadata) nm.metadata = {};
                    nm.metadata.prealable = true;
                }
            }
            var contenu = {
                compteur: donnees.compteur || 0,
                compteurLiens: donnees.compteurLiens || 0,
                noeuds: donnees.noeuds,
                liens: donnees.liens || []
            };
            window.planificationDonnees.sauvegarderCarte(id, contenu);
            mettreAJourListeCartes();
            chargerCarte(id);
        } catch (err) {
            console.warn('[Planification] Erreur importation :', err.message);
        }
    };
    lecteur.readAsText(fichier);
}

function supprimerCarteActive() {
    var index = window.planificationDonnees.getIndex();
    if (!index || index.cartes.length <= 1) {
        console.warn('[Planification] Impossible de supprimer la dernière carte.');
        return;
    }
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    if (!confirm('Supprimer la carte « ' + (carte ? carte.nom : '') + ' » ?')) return;

    window.planificationDonnees.supprimerCarte(index.active);
    index.cartes = index.cartes.filter(function(c) { return c.id !== index.active; });
    index.active = index.cartes[0].id;
    window.planificationDonnees.sauvegarderIndex(index);
    mettreAJourListeCartes();
    chargerCarte(index.active);
}

function dupliquerCarteActive() {
    sauvegarder();
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var carteOrigine = index.cartes.find(function(c) { return c.id === index.active; });
    var nomOrigine = carteOrigine ? carteOrigine.nom : 'Sans titre';
    var nom = prompt('Nom de la copie :', nomOrigine + ' (copie)');
    if (nom === null) return;
    var id = 'carte_' + (++index.compteurCartes);
    index.cartes.push({ id: id, nom: nom.trim() || nomOrigine + ' (copie)', dateCreation: new Date().toISOString() });
    var contenu = {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    window.planificationDonnees.sauvegarderCarte(id, contenu);
    index.active = id;
    window.planificationDonnees.sauvegarderIndex(index);
    mettreAJourListeCartes();
    chargerCarte(id);
}

function changerCarte(carteId) {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    sauvegarder();
    index.active = carteId;
    window.planificationDonnees.sauvegarderIndex(index);
    chargerCarte(carteId);
    mettreAJourListeCartes();
}

// === INITIALISATION ===
function initialiser() {
    if (etat.initialise) return;

    // Refs DOM
    zoneTravail = document.getElementById('planif-zone-travail');
    espace = document.getElementById('planif-espace');
    espaceWrapper = document.getElementById('planif-espace-wrapper');
    coucheNoeuds = document.getElementById('planif-couche-noeuds');
    coucheLiens = document.getElementById('planif-couche-liens');
    canvas = document.getElementById('planif-canvas');
    lienTemp = document.getElementById('planif-lien-temp');
    panneau = document.getElementById('planif-panneau');
    menuLien = document.getElementById('planif-menu-lien');
    rectSelection = document.getElementById('planif-rect-selection');
    panneauSeances = document.getElementById('planif-panneau-seances');
    panneauSeancesContenu = document.getElementById('planif-panneau-seances-contenu');
    btnSeances = document.getElementById('planif-btn-seances');
    orgSelectSequence = document.getElementById('planif-org-select-sequence');
    orgSelectLecon = document.getElementById('planif-org-select-lecon');
    orgLecon = document.getElementById('planif-org-lecon');

    if (!zoneTravail || !espace) {
        console.warn('[Planification] DOM non prêt.');
        return;
    }

    appliquerZoom();

    // Zoom molette
    var gestureEnCours = false;
    zoneTravail.addEventListener('wheel', function(e) {
        if (e.ctrlKey && !gestureEnCours) {
            e.preventDefault();
            var facteur = e.deltaY < 0 ? 1.05 : 0.95;
            zoomer(e.clientX, e.clientY, facteur);
        }
    }, { passive: false });

    // Zoom gestuel Safari
    if ('GestureEvent' in window) {
        var gestureBaseZoom = 1;
        zoneTravail.addEventListener('gesturestart', function(e) {
            e.preventDefault();
            gestureEnCours = true;
            gestureBaseZoom = etat.zoom;
        });
        zoneTravail.addEventListener('gesturechange', function(e) {
            e.preventDefault();
            var oldZoom = etat.zoom;
            etat.zoom = Math.max(0.25, Math.min(3, gestureBaseZoom * e.scale));
            appliquerZoom();
            var rect = zoneTravail.getBoundingClientRect();
            var cx = rect.width / 2;
            var cy = rect.height / 2;
            var espaceX = (cx + zoneTravail.scrollLeft) / oldZoom;
            var espaceY = (cy + zoneTravail.scrollTop) / oldZoom;
            zoneTravail.scrollLeft = espaceX * etat.zoom - cx;
            zoneTravail.scrollTop = espaceY * etat.zoom - cy;
            var zoomInfo = document.getElementById('planif-zoom-info');
            if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
            mettreAJourBoutonsZoomPreset();
        });
        zoneTravail.addEventListener('gestureend', function(e) {
            e.preventDefault();
            gestureEnCours = false;
        });
    }

    // Zoom tactile
    var touchStartDist = null;
    var touchStartZoom = null;
    zoneTravail.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDist = Math.hypot(dx, dy);
            touchStartZoom = etat.zoom;
        }
    }, { passive: true });
    zoneTravail.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && touchStartDist) {
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            var dist = Math.hypot(dx, dy);
            var scale = dist / touchStartDist;
            var oldZoom = etat.zoom;
            etat.zoom = Math.max(0.25, Math.min(3, touchStartZoom * scale));
            appliquerZoom();
            var rect = zoneTravail.getBoundingClientRect();
            var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            var localX = midX - rect.left;
            var localY = midY - rect.top;
            var espaceX = (localX + zoneTravail.scrollLeft) / oldZoom;
            var espaceY = (localY + zoneTravail.scrollTop) / oldZoom;
            zoneTravail.scrollLeft = espaceX * etat.zoom - localX;
            zoneTravail.scrollTop = espaceY * etat.zoom - localY;
            var zoomInfo = document.getElementById('planif-zoom-info');
            if (zoomInfo) zoomInfo.textContent = Math.round(etat.zoom * 100) + '%';
            mettreAJourBoutonsZoomPreset();
        }
    }, { passive: true });
    zoneTravail.addEventListener('touchend', function() {
        touchStartDist = null;
        touchStartZoom = null;
    });

    // Palette drag & drop
    var paletteDragType = null;
    var paletteSurvolConteneur = null;

    document.querySelectorAll('#planif-palette .planif-palette-btn').forEach(function(btn) {
        btn.addEventListener('dragstart', function(e) {
            paletteDragType = btn.dataset.type;
            e.dataTransfer.setData('planif-type', btn.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
        });

        btn.addEventListener('dragend', function() {
            if (paletteSurvolConteneur) {
                var el = document.getElementById(paletteSurvolConteneur);
                if (el) {
                    el.classList.remove('planif-conteneur-survol');
                    var zn = el.querySelector('.planif-noeud-zone');
                    if (zn) zn.classList.remove('planif-survol');
                }
            }
            paletteDragType = null;
            paletteSurvolConteneur = null;
        });

        btn.addEventListener('click', function(e) {
            if (e.detail === 1) {
                var rect = zoneTravail.getBoundingClientRect();
                var centre = clientVersData(rect.left + rect.width / 2, rect.top + rect.height / 2);
                var x = centre.x - 70 + (Math.random() - 0.5) * 100;
                var y = centre.y - 30 + (Math.random() - 0.5) * 100;
                creerNoeud(btn.dataset.type, x, y);
            }
        });
    });

    // Drag + repli des palettes flottantes (Nœuds, Navigation — même mécanique)
    function rendrePaletteFlottante(palette) {
        if (!palette) return;
        var paletteBarre = palette.querySelector('.planif-palette-barre');
        if (paletteBarre) {
            // Pointer Events : couvre souris, doigt (iPad) et Apple Pencil.
            // Nécessite touch-action:none sur .planif-palette-barre (styles.css).
            paletteBarre.addEventListener('pointerdown', function(e) {
                if (e.target.closest('.planif-palette-toggle')) return;
                if (!e.isPrimary) return;
                e.preventDefault();
                var pointerId = e.pointerId;
                var startX = e.clientX;
                var startY = e.clientY;
                var rect = palette.getBoundingClientRect();
                var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
                var startLeft = rect.left - wrapperRect.left;
                var startTop = rect.top - wrapperRect.top;
                // La palette Navigation est ancrée par `right` : libérer l'ancre
                // dès qu'on la déplace, sinon left+right s'affrontent (étirement).
                palette.style.right = 'auto';

                function onMove(e2) {
                    if (e2.pointerId !== pointerId) return;
                    palette.style.left = (startLeft + e2.clientX - startX) + 'px';
                    palette.style.top = (startTop + e2.clientY - startY) + 'px';
                }
                function onUp(e2) {
                    if (e2.pointerId !== pointerId) return;
                    paletteBarre.removeEventListener('pointermove', onMove);
                    paletteBarre.removeEventListener('pointerup', onUp);
                    paletteBarre.removeEventListener('pointercancel', onUp);
                }
                paletteBarre.setPointerCapture(pointerId);
                paletteBarre.addEventListener('pointermove', onMove);
                paletteBarre.addEventListener('pointerup', onUp);
                paletteBarre.addEventListener('pointercancel', onUp);
            });
        }
        var paletteToggle = palette.querySelector('.planif-palette-toggle');
        if (paletteToggle) {
            paletteToggle.addEventListener('click', function() {
                palette.classList.toggle('planif-palette-replie');
                paletteToggle.textContent = palette.classList.contains('planif-palette-replie') ? '+' : '−';
                paletteToggle.title = palette.classList.contains('planif-palette-replie') ? 'Ouvrir la palette' : 'Réduire la palette';
            });
        }
    }
    var palette = document.getElementById('planif-palette');
    rendrePaletteFlottante(palette);
    rendrePaletteFlottante(document.getElementById('planif-palette-nav'));
    initialiserDragGrille();

    // Inspecteur — bouton 🔎 de la palette
    var btnInspecteur = document.getElementById('planif-palette-inspecteur-btn');
    if (btnInspecteur) {
        btnInspecteur.addEventListener('click', function() {
            if (etat.panneauOuvert) {
                fermerPanneau();
            } else if (etat.selection) {
                ouvrirPanneau(etat.selection);
            }
        });
    }

    // Raccourcis flottant — bouton 🛎️ de la palette
    var raccourcisPanel = document.getElementById('planif-raccourcis-panel');
    var btnRaccourcis = document.getElementById('planif-palette-raccourcis-btn');
    if (btnRaccourcis && raccourcisPanel) {
        btnRaccourcis.addEventListener('click', function() {
            var estVisible = raccourcisPanel.style.display !== 'none';
            raccourcisPanel.style.display = estVisible ? 'none' : '';
        });
        var raccFermerBtn = raccourcisPanel.querySelector('.planif-raccourcis-panel-fermer');
        if (raccFermerBtn) {
            raccFermerBtn.addEventListener('click', function() {
                raccourcisPanel.style.display = 'none';
            });
        }
        var raccReplierBtn = raccourcisPanel.querySelector('.planif-raccourcis-panel-replier');
        if (raccReplierBtn) {
            raccReplierBtn.addEventListener('click', function() {
                var contenu = raccourcisPanel.querySelector('.planif-raccourcis-panel-contenu');
                if (!contenu) return;
                var estReplie = contenu.style.display === 'none';
                contenu.style.display = estReplie ? '' : 'none';
                raccReplierBtn.textContent = estReplie ? '−' : '+';
                raccReplierBtn.title = estReplie ? 'Replier' : 'Déplier';
            });
        }
        // Drag panneau raccourcis
        var raccBarre = raccourcisPanel.querySelector('.planif-guide-barre');
        if (raccBarre) {
            raccBarre.addEventListener('mousedown', function(e) {
                if (e.target.closest('.planif-raccourcis-panel-fermer') || e.target.closest('.planif-raccourcis-panel-replier')) return;
                e.preventDefault();
                var startX = e.clientX;
                var startY = e.clientY;
                var rect = raccourcisPanel.getBoundingClientRect();
                var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
                var startLeft = rect.left - wrapperRect.left;
                var startTop = rect.top - wrapperRect.top;
                function onMove(e2) {
                    raccourcisPanel.style.left = (startLeft + e2.clientX - startX) + 'px';
                    raccourcisPanel.style.top = (startTop + e2.clientY - startY) + 'px';
                    raccourcisPanel.style.right = 'auto';
                }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        }
    }

    // Guide flottant — bouton 📔 de la palette (#167)
    var btnAidePalette = document.getElementById('planif-palette-aide-btn');
    if (btnAidePalette) {
        btnAidePalette.addEventListener('click', function() {
            if (_guideOuvert) {
                fermerGuide();
            } else {
                ouvrirGuide();
            }
        });
    }

    // Bouton fermer du panneau guide
    var guidePanel = document.getElementById('planif-guide-panel');
    var guideFermerBtn = guidePanel ? guidePanel.querySelector('.planif-guide-panel-fermer') : null;
    if (guideFermerBtn) {
        guideFermerBtn.addEventListener('click', fermerGuide);
    }

    // Bouton replier/déplier du panneau guide
    var guideReplierBtn = guidePanel ? guidePanel.querySelector('.planif-guide-panel-replier') : null;
    if (guideReplierBtn) {
        guideReplierBtn.addEventListener('click', function() {
            var contenu = guidePanel.querySelector('.planif-guide-panel-contenu');
            if (!contenu) return;
            var estReplie = contenu.style.display === 'none';
            contenu.style.display = estReplie ? '' : 'none';
            guideReplierBtn.textContent = estReplie ? '−' : '+';
            guideReplierBtn.title = estReplie ? 'Replier le guide' : 'Déplier le guide';
        });
    }

    // Drag panneau guide flottant — même pattern que la palette
    var guideBarre = guidePanel ? guidePanel.querySelector('.planif-guide-barre') : null;
    if (guideBarre) {
        guideBarre.addEventListener('mousedown', function(e) {
            if (e.target.closest('.planif-guide-panel-fermer') || e.target.closest('.planif-guide-panel-replier')) return;
            e.preventDefault();
            var startX = e.clientX;
            var startY = e.clientY;
            var rect = guidePanel.getBoundingClientRect();
            var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
            var startLeft = rect.left - wrapperRect.left;
            var startTop = rect.top - wrapperRect.top;

            function onMove(e2) {
                guidePanel.style.left = (startLeft + e2.clientX - startX) + 'px';
                guidePanel.style.top = (startTop + e2.clientY - startY) + 'px';
                guidePanel.style.right = 'auto';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // Clic sur un panneau flottant = premier plan
    var _zIndexPanneaux = 81;
    [raccourcisPanel, guidePanel].forEach(function(panel) {
        if (panel) {
            panel.addEventListener('mousedown', function() {
                panel.style.zIndex = ++_zIndexPanneaux;
            });
        }
    });

    zoneTravail.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        if (paletteDragType) {
            var ancien = paletteSurvolConteneur;
            paletteSurvolConteneur = trouverConteneurPour(e.clientX, e.clientY, null, paletteDragType);
            if (ancien !== paletteSurvolConteneur) {
                if (ancien) {
                    var aEl = document.getElementById(ancien);
                    if (aEl) {
                        aEl.classList.remove('planif-conteneur-survol');
                        var zn = aEl.querySelector('.planif-noeud-zone');
                        if (zn) zn.classList.remove('planif-survol');
                    }
                }
                if (paletteSurvolConteneur) {
                    var sEl = document.getElementById(paletteSurvolConteneur);
                    if (sEl) {
                        sEl.classList.add('planif-conteneur-survol');
                        var zn2 = sEl.querySelector('.planif-noeud-zone');
                        if (zn2) zn2.classList.add('planif-survol');
                    }
                }
            }
        }
    });

    zoneTravail.addEventListener('drop', function(e) {
        e.preventDefault();
        var type = e.dataTransfer.getData('planif-type');
        if (!type || !TYPES[type]) return;

        // Capturer le conteneur cible détecté pendant le dragover
        var conteneurCible = paletteSurvolConteneur;

        // Nettoyer le feedback visuel du survol palette
        if (paletteSurvolConteneur) {
            var scEl = document.getElementById(paletteSurvolConteneur);
            if (scEl) {
                scEl.classList.remove('planif-conteneur-survol');
                var scZn = scEl.querySelector('.planif-noeud-zone');
                if (scZn) scZn.classList.remove('planif-survol');
            }
        }

        var pos = clientVersData(e.clientX, e.clientY);
        var newId = creerNoeud(type, pos.x - 70, pos.y - 20);

        // Fallback: re-détecter le conteneur si pas détecté pendant le dragover
        if (!conteneurCible) {
            conteneurCible = trouverConteneurPour(e.clientX, e.clientY, newId, type);
        }

        // Différer au prochain macrotask pour garantir le rendu complet de
        // l'élément — et, à ce moment-là seulement, tenter le RECOUVREMENT :
        // le bloc créé s'étend à gauche/au-dessus du curseur (pos -70/-20), il
        // peut donc être posé « sur » un conteneur alors que le curseur a
        // relâché juste à côté. Sans ce filet, le bloc restait orphelin en
        // débordement visuel (constat terrain, 6 août).
        setTimeout(function() {
            if (!conteneurCible) {
                conteneurCible = trouverConteneurParRecouvrement(newId, type);
            }
            if (conteneurCible) {
                rattacherAuConteneur(newId, conteneurCible);
                sauvegarder();
            }
        }, 0);

        paletteDragType = null;
        paletteSurvolConteneur = null;
    });

    // Sélection par rectangle (lasso)
    espace.addEventListener('mousedown', function(e) {
        if (e.target.closest('.planif-noeud') || e.target.closest('.planif-lien-groupe') || e.target.closest('.planif-noeud-port')) return;
        if (e.target !== espace && e.target !== canvas && e.target.tagName !== 'svg'
            && e.target.id !== 'planif-couche-noeuds' && !e.target.closest('#planif-couche-svg-offset')) return;
        if (e.target.closest('#planif-panneau') || e.target.closest('#planif-menu-lien')) return;

        var startEspace = clientVersEspace(e.clientX, e.clientY);
        var startEspaceX = startEspace.x;
        var startEspaceY = startEspace.y;
        var moved = false;

        deselectionnerTout();

        function onMove(e2) {
            moved = true;
            var cur = clientVersEspace(e2.clientX, e2.clientY);
            var x = Math.min(startEspaceX, cur.x);
            var y = Math.min(startEspaceY, cur.y);
            var w = Math.abs(cur.x - startEspaceX);
            var h = Math.abs(cur.y - startEspaceY);

            rectSelection.style.left = x + 'px';
            rectSelection.style.top = y + 'px';
            rectSelection.style.width = w + 'px';
            rectSelection.style.height = h + 'px';
            rectSelection.style.display = 'block';

            for (var entry of etat.noeuds) {
                var nid = entry[0];
                var nd = entry[1];
                var nel = document.getElementById(nid);
                if (!nel) continue;
                var nx = nd.x + OFFSET_X;
                var ny = nd.y + OFFSET_Y;
                var nw = nel.offsetWidth || 140;
                var nh = nel.offsetHeight || 50;
                var intersecte = !(nx + nw < x || nx > x + w || ny + nh < y || ny > y + h);
                if (intersecte) nel.classList.add('selected');
                else nel.classList.remove('selected');
            }
        }

        function onUp(e2) {
            document.removeEventListener('mousemove', onMoveThrottled);
            document.removeEventListener('mouseup', onUp);
            rectSelection.style.display = 'none';

            if (!moved) { deselectionner(); return; }

            var cur = clientVersEspace(e2.clientX, e2.clientY);
            var x = Math.min(startEspaceX, cur.x);
            var y = Math.min(startEspaceY, cur.y);
            var w = Math.abs(cur.x - startEspaceX);
            var h = Math.abs(cur.y - startEspaceY);

            etat.multiSelection.clear();
            for (var entry of etat.noeuds) {
                var nid = entry[0];
                var nd = entry[1];
                var nel = document.getElementById(nid);
                if (!nel) continue;
                var nx = nd.x + OFFSET_X;
                var ny = nd.y + OFFSET_Y;
                var nw = nel.offsetWidth || 140;
                var nh = nel.offsetHeight || 50;
                var intersecte = !(nx + nw < x || nx > x + w || ny + nh < y || ny > y + h);
                if (intersecte) {
                    etat.multiSelection.add(nid);
                    nel.classList.add('selected');
                }
            }

            if (etat.multiSelection.size === 1) {
                var seul = Array.from(etat.multiSelection)[0];
                etat.multiSelection.clear();
                selectionnerNoeud(seul);
            } else if (etat.multiSelection.size === 0) {
                deselectionner();
            }
        }

        var onMoveThrottled = throttleRAF(onMove);
        document.addEventListener('mousemove', onMoveThrottled);
        document.addEventListener('mouseup', onUp);
    });

    // Événements multi-cartes
    var listeCartes = document.getElementById('planif-liste-cartes');
    if (listeCartes) {
        listeCartes.addEventListener('change', function(e) { changerCarte(e.target.value); });
    }

    // Menu déroulant Actions
    var btnActions = document.getElementById('planif-btn-actions');
    var dropdown = document.getElementById('planif-actions-dropdown');
    if (btnActions && dropdown) {
        btnActions.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('ouvert');
        });
        document.addEventListener('click', function() {
            dropdown.classList.remove('ouvert');
        });
        dropdown.addEventListener('click', function() {
            dropdown.classList.remove('ouvert');
        });
    }

    var btnNouvelle = document.getElementById('planif-btn-nouvelle-carte');
    if (btnNouvelle) {
        btnNouvelle.addEventListener('click', function() {
            var nom = prompt('Nom de la nouvelle carte :', 'Nouvelle carte');
            if (nom === null) return;
            nouvelleCarte(nom.trim() || 'Sans titre');
        });
    }

    var btnSupprimerCarte = document.getElementById('planif-btn-supprimer-carte');
    if (btnSupprimerCarte) btnSupprimerCarte.addEventListener('click', supprimerCarteActive);

    var btnDupliquerCarte = document.getElementById('planif-btn-dupliquer-carte');
    if (btnDupliquerCarte) btnDupliquerCarte.addEventListener('click', dupliquerCarteActive);

    var btnImporterCarte = document.getElementById('planif-btn-importer-carte');
    if (btnImporterCarte) {
        btnImporterCarte.addEventListener('click', function() {
            document.getElementById('planif-fichier-import').click();
        });
    }

    // Import inter-trimestre (4 août 2026, patron Brique C) : copie une carte
    // d'un autre trimestre vers le trimestre actif — sans sortir de l'app.
    var btnImportTri = document.getElementById('planif-btn-import-trimestre');
    var panneauImportTri = document.getElementById('planif-import-tri-panel');
    if (btnImportTri && panneauImportTri) {
        btnImportTri.addEventListener('click', function(e) {
            e.stopPropagation();
            var dropdownActions = document.getElementById('planif-actions-dropdown');
            if (dropdownActions) dropdownActions.classList.remove('ouvert');
            rendrePanneauImportTrimestre();
            panneauImportTri.classList.add('ouvert');
        });
        document.addEventListener('click', function() {
            panneauImportTri.classList.remove('ouvert');
        });
        panneauImportTri.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    var btnAnnuler = document.getElementById('planif-btn-annuler');
    if (btnAnnuler) btnAnnuler.addEventListener('click', annuler);

    var fichierImport = document.getElementById('planif-fichier-import');
    if (fichierImport) {
        fichierImport.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                importerCarte(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // Bouton exporter carte (menu Actions)
    var btnExporterCarte = document.getElementById('planif-btn-exporter-carte');
    if (btnExporterCarte) {
        btnExporterCarte.addEventListener('click', function() {
            var idx = window.planificationDonnees.getIndex();
            if (idx && idx.active && typeof exporterAlignementJSON === 'function') {
                exporterAlignementJSON(idx.active);
            }
        });
    }

    // Bouton bibliothèque (palette d'éléments)
    var btnBibliotheque = document.getElementById('planif-palette-bibliotheque-btn');
    if (btnBibliotheque) {
        btnBibliotheque.addEventListener('click', function() {
            if (typeof afficherBibliothequeAlignements === 'function') {
                afficherBibliothequeAlignements();
            }
        });
    }

    // Renommer la carte active (menu Actions — remplace l'ancien titre éditable
    // du centre de la barre, retiré le 4 août 2026 : il dupliquait le sélecteur)
    var btnRenommerCarte = document.getElementById('planif-btn-renommer-carte');
    if (btnRenommerCarte) {
        btnRenommerCarte.addEventListener('click', function() {
            var index = window.planificationDonnees.getIndex();
            var carte = index && index.cartes.find(function(c) { return c.id === index.active; });
            if (!carte) return;
            var nom = prompt('Nouveau nom de la carte :', carte.nom);
            if (nom === null) return;
            renommerCarteActive(nom.trim());
        });
    }

    // Fermer panneau
    var btnFermerPanneau = document.getElementById('planif-btn-fermer-panneau');
    if (btnFermerPanneau) btnFermerPanneau.addEventListener('click', fermerPanneau);

    // Séances — Naviguer vers le sous-onglet Organisateur
    if (btnSeances) btnSeances.addEventListener('click', function() {
        // Pré-sélectionner la leçon active si possible
        var leconId = etat.selection;
        if (leconId) {
            var noeud = etat.noeuds.get(leconId);
            if (!noeud || noeud.type !== 'lecon') leconId = null;
        }
        if (typeof window.organisateur !== 'undefined' && leconId) {
            window.organisateur.naviguerVersLecon(leconId);
        } else if (typeof afficherSousSection === 'function') {
            afficherSousSection('conception-organisateur');
            var boutons = document.querySelectorAll('.sous-navigation button');
            boutons.forEach(function(btn) {
                btn.classList.toggle('actif', btn.getAttribute('data-sous-onglet') === 'conception-organisateur');
            });
        }
    });

    // Legacy: Organisateur side panel selectors (kept for backward compat)
    if (orgSelectSequence) orgSelectSequence.addEventListener('change', peuplerSelecteurLecons);
    if (orgSelectLecon) orgSelectLecon.addEventListener('change', afficherLeconOrganisateur);
    var eeCheckbox = document.getElementById('planif-org-ee-checkbox');
    if (eeCheckbox) {
        eeCheckbox.addEventListener('change', function(e) {
            var leconId = orgSelectLecon ? orgSelectLecon.value : '';
            if (!leconId) return;
            var lecon = etat.noeuds.get(leconId);
            if (!lecon) return;
            enregistrerPourUndo();
            if (!lecon.metadata) lecon.metadata = {};
            lecon.metadata.enseignementExplicite = e.target.checked;
            sauvegarder();
        });
    }

    // Export texte/TSV
    var btnExportTexte = document.getElementById('planif-btn-export-texte');
    if (btnExportTexte) {
        btnExportTexte.addEventListener('click', function() {
            var index = window.planificationDonnees.getIndex();
            var nomCarte = 'plan';
            if (index && index.cartes) {
                var c = index.cartes.find(function(cc) { return cc.id === index.active; });
                if (c) nomCarte = c.nom;
            }
            var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + '_plan.txt';
            telechargerFichier(genererPlanTexte(), nomFichier, 'text/plain');
        });
    }

    var btnExportTSV = document.getElementById('planif-btn-export-tsv');
    if (btnExportTSV) {
        btnExportTSV.addEventListener('click', function() {
            var index = window.planificationDonnees.getIndex();
            var nomCarte = 'plan';
            if (index && index.cartes) {
                var c = index.cartes.find(function(cc) { return cc.id === index.active; });
                if (c) nomCarte = c.nom;
            }
            var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + '_plan.tsv';
            telechargerFichier(genererPlanTSV(), nomFichier, 'text/tab-separated-values');
        });
    }

    // Recentrer
    var btnRecentrer = document.getElementById('planif-btn-recentrer');
    if (btnRecentrer) btnRecentrer.addEventListener('click', function() { centrerVueSurContenu(); });

    // Boutons de zoom prédéfinis (100%, 75%, 50%, 25%)
    document.querySelectorAll('.planif-btn-zoom-preset').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var niveauZoom = parseFloat(btn.dataset.zoom);
            etat.zoom = niveauZoom;
            appliquerZoom();
            var zoomInfo = document.getElementById('planif-zoom-info');
            if (zoomInfo) zoomInfo.textContent = Math.round(niveauZoom * 100) + '%';
            mettreAJourBoutonsZoomPreset();
            centrerVueSurContenu();
        });
    });

    etat.initialise = true;

    // Charger les données
    window.planificationDonnees.migrerDonneesProto();
    var index = window.planificationDonnees.initialiserSiNecessaire();
    mettreAJourListeCartes();
    chargerCarte(index.active);
}

// === RACCOURCIS CLAVIER (gérés via planificationActive flag) ===
function gererKeydown(e) {
    if (!planificationActive) return;

    var pasDansChamp = !document.activeElement.isContentEditable
        && document.activeElement.tagName !== 'INPUT'
        && document.activeElement.tagName !== 'TEXTAREA';

    // Vérifier qu'on est bien dans la section structure (carte mentale)
    var sectionPlanif = document.getElementById('section-conception');
    if (!sectionPlanif || !sectionPlanif.classList.contains('active')) return;

    if ((e.metaKey || e.ctrlKey) && e.key === 'a' && pasDansChamp) {
        e.preventDefault();
        toutSelectionner();
        return;
    }

    if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+') && pasDansChamp) {
        e.preventDefault();
        var rect = zoneTravail.getBoundingClientRect();
        zoomer(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.15);
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '-' && pasDansChamp) {
        e.preventDefault();
        var rect2 = zoneTravail.getBoundingClientRect();
        zoomer(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2, 0.85);
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '0' && pasDansChamp) {
        e.preventDefault();
        etat.zoom = 1;
        appliquerZoom();
        var zoomInfo = document.getElementById('planif-zoom-info');
        if (zoomInfo) zoomInfo.textContent = '100%';
        mettreAJourBoutonsZoomPreset();
        centrerVueSurContenu();
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '1' && pasDansChamp) {
        e.preventDefault();
        recentrerVue();
        return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'd' && pasDansChamp) {
        e.preventDefault();
        if (etat.selection) clonerNoeud(etat.selection);
        return;
    }

    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z' && pasDansChamp) {
        e.preventDefault();
        annuler();
        return;
    }
    if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        if (pasDansChamp) {
            e.preventDefault();
            retablir();
            return;
        }
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (pasDansChamp) {
            if (etat.multiSelection.size > 0) {
                enregistrerPourUndo();
                _undoBatch = true;
                for (var nid of Array.from(etat.multiSelection)) {
                    supprimerNoeud(nid);
                }
                _undoBatch = false;
                etat.multiSelection.clear();
                fermerPanneau();
            } else if (etat.selection) {
                supprimerNoeud(etat.selection);
                fermerPanneau();
            }
        }
    }
    if (e.key === 'Escape') {
        deselectionner();
        fermerMenuLien();
    }
}

// Attacher/détacher le keydown global
document.addEventListener('keydown', gererKeydown);

// === EXPORT ===
/**
 * Injecte une liste de nœuds dans la carte active, reconstruit le DOM et sauvegarde.
 * Utilisé par l'import MD de l'organisateur.
 * @param {Array} listeNoeuds - Nœuds au format { id, type, titre, x, y, parent, enfants, metadata }
 */
function injecterNoeuds(listeNoeuds) {
    for (var i = 0; i < listeNoeuds.length; i++) {
        var n = listeNoeuds[i];
        if (!n.enfants) n.enfants = [];
        if (!n.parent) n.parent = null;
        if (!n.metadata) n.metadata = {};
        if (!('cloneSourceId' in n)) n.cloneSourceId = null;
        etat.noeuds.set(n.id, n);
    }
    reconstruireDOM();
    sauvegarder();
    requestAnimationFrame(function() {
        centrerVueSurContenu();
        mettreAJourTousLesBadges();
    });
}

// =========== SOMMAIRE DE NAVIGATION (palette Navigation) ===========
// Remplace les carrousels séquences/leçons de la barre d'outils (4 août 2026,
// exercice 601-101) : la hiérarchie Vue globale › séquences › leçons est
// verticale par nature, le sommaire la montre d'un coup d'œil.

var sequenceActiveId = null; // null = vue globale (tout visible)

function obtenirSequencesCarte() {
    var sequences = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
    }
    sequences.sort(function(a, b) { return a.y - b.y; });
    return sequences;
}

// === SÉQUENCES DE SÉQUENCES (voie A, 6 août 2026) — lecture hiérarchique ===
// Toute vue qui LISTE les séquences doit passer par ces helpers, jamais par un
// scan plat de `type === 'sequence'` : depuis la voie A, une séquence peut en
// contenir d'autres, et un scan plat afficherait chaque sous-séquence DEUX
// fois (à la racine et sous son parent).

/** Une séquence racine n'est pas contenue dans une autre séquence. */
function estSequenceRacine(n) {
    if (!n || n.type !== 'sequence') return false;
    if (!n.parent) return true;
    var p = etat.noeuds.get(n.parent);
    return !(p && p.type === 'sequence');
}

/**
 * Liste hiérarchique aplatie : chaque racine suivie de ses sous-séquences,
 * en profondeur d'abord. `ordre` s'applique ENTRE FRÈRES à chaque niveau :
 * 'spatial' (position sur la carte — palette Navigation) ou 'temporel'
 * (étendue dérivée — Vue calendrier, exports).
 * @returns {Array<{seq: Object, niveau: number}>}
 */
function listerSequencesHierarchie(ordre) {
    var comparer = ordre === 'temporel'
        ? function(a, b) { return (rangTemporel(a) - rangTemporel(b)) || ((a.x || 0) - (b.x || 0)); }
        : function(a, b) { return ((a.y || 0) - (b.y || 0)) || ((a.x || 0) - (b.x || 0)); };

    var resultat = [];
    var vus = new Set();
    function visiter(seq, niveau) {
        if (vus.has(seq.id)) return;
        vus.add(seq.id);
        resultat.push({ seq: seq, niveau: niveau });
        (seq.enfants || [])
            .map(function(eid) { return etat.noeuds.get(eid); })
            .filter(function(nd) { return nd && nd.type === 'sequence'; })
            .sort(comparer)
            .forEach(function(s) { visiter(s, niveau + 1); });
    }
    obtenirSequencesCarte().filter(estSequenceRacine).sort(comparer)
        .forEach(function(s) { visiter(s, 0); });
    return resultat;
}

/** « Parent › Enfant » — contexte d'une sous-séquence dans les documents. */
function cheminSequence(seq) {
    var morceaux = [seq.titre || 'Sans titre'];
    var vus = new Set([seq.id]);
    var courant = seq;
    while (courant && courant.parent) {
        var p = etat.noeuds.get(courant.parent);
        if (!p || p.type !== 'sequence' || vus.has(p.id)) break;
        vus.add(p.id);
        morceaux.unshift(p.titre || 'Sans titre');
        courant = p;
    }
    return morceaux.join(' › ');
}

/** Leçons descendantes, à toute profondeur (badge des séquences compactes). */
function compterLeconsDescendantes(n, vus) {
    if (!n || !n.enfants) return 0;
    if (!vus) vus = new Set();
    if (vus.has(n.id)) return 0;
    vus.add(n.id);
    var total = 0;
    for (var i = 0; i < n.enfants.length; i++) {
        var e = etat.noeuds.get(n.enfants[i]);
        if (!e) continue;
        if (e.type === 'lecon') total++;
        else if (e.type === 'sequence') total += compterLeconsDescendantes(e, vus);
    }
    return total;
}

function obtenirLeconsDeSequence(seq) {
    if (!seq || !seq.enfants) return [];
    var lecons = [];
    for (var i = 0; i < seq.enfants.length; i++) {
        var nd = etat.noeuds.get(seq.enfants[i]);
        if (nd && nd.type === 'lecon') lecons.push(nd);
    }
    // Ordre spatial de lecture (gauche → droite, puis haut → bas), pas
    // l'ordre d'insertion dans enfants[].
    lecons.sort(function(a, b) { return (a.x - b.x) || (a.y - b.y); });
    return lecons;
}

// === COMPTABILITÉ DU TEMPS (chantier du 4 août 2026) ===
// Rollup pur : activité (durée saisie, min) → leçon → séquence → carte.
// La conversion en périodes suit « Durée d'une période » du cadre (Horaire) —
// source unique obtenirDureePeriode(), jamais de valeur en dur.

function dureePeriodeMinutes() {
    return (typeof obtenirDureePeriode === 'function' && obtenirDureePeriode()) || 55;
}

// Somme des durées (metadata.duree) des descendants non-conteneurs.
function dureeRollupNoeud(nd) {
    if (!nd) return 0;
    var config = TYPES[nd.type];
    if (!(config && config.conteneur)) {
        return parseInt(nd.metadata && nd.metadata.duree) || 0;
    }
    var total = 0;
    var enfants = nd.enfants || [];
    for (var i = 0; i < enfants.length; i++) {
        total += dureeRollupNoeud(etat.noeuds.get(enfants[i]));
    }
    return total;
}

function arrondirPeriodes(minutes) {
    var per = Math.round((minutes / dureePeriodeMinutes()) * 10) / 10;
    return (per % 1 === 0) ? String(per) : String(per).replace('.', ',');
}

// « 2 pér. » / « 1,9 pér. » ; sous une période → minutes brutes.
function formaterPeriodes(minutes) {
    if (!minutes) return '';
    if (minutes < dureePeriodeMinutes()) return minutes + ' min';
    return arrondirPeriodes(minutes) + ' pér.';
}

// « ≈ 0,6 pér. » — équivalence affichée en regard d'une durée en minutes.
function equivalencePeriodesTexte(minutes) {
    minutes = parseInt(minutes) || 0;
    if (!minutes) return '';
    return '≈ ' + arrondirPeriodes(minutes) + ' pér.';
}

// Heures d'enseignement (RREC) du cours actif — lecture seule (SSOT : cours).
function obtenirHeuresCadreCoursActif() {
    try {
        var tous = db.getSync('cours', []);
        var actif = tous.find(function(c) { return c.actif; });
        if (!actif && typeof obtenirCoursActifId === 'function') {
            var idActif = obtenirCoursActifId();
            actif = tous.find(function(c) { return c.id === idActif; });
        }
        var h = actif ? parseFloat(actif.heuresContact) : NaN;
        return (isNaN(h) || h <= 0) ? null : h;
    } catch (e) {
        return null;
    }
}

// Jauge indicative au pied de la palette Navigation. JAMAIS bloquante :
// du texte teinté, pas d'alerte (imprévus de session assumés).
function mettreAJourJaugeTemps(sequences) {
    var jauge = document.getElementById('planif-jauge-temps');
    if (!jauge) return;
    var totalMin = 0;
    for (var i = 0; i < sequences.length; i++) {
        totalMin += dureeRollupNoeud(sequences[i]);
    }
    if (!totalMin) {
        jauge.style.display = 'none';
        jauge.innerHTML = '';
        return;
    }
    var dp = dureePeriodeMinutes();
    var heures = Math.round((totalMin / 60) * 10) / 10;
    var texte = 'Total planifié : <strong>' + arrondirPeriodes(totalMin) + ' pér.</strong>' +
                ' (≈ ' + String(heures).replace('.', ',') + ' h)';
    var classe = '';
    var heuresCadre = obtenirHeuresCadreCoursActif();
    if (heuresCadre) {
        texte += ' / ' + String(heuresCadre).replace('.', ',') + ' h au cadre';
        var ratio = (totalMin / 60) / heuresCadre;
        if (ratio > 1.1) classe = ' planif-jauge-depasse';
        else if (ratio >= 0.9) classe = ' planif-jauge-cible';
    }
    texte += '<span class="planif-jauge-rappel">1 pér. = ' + dp + ' min (Cadre › Horaire)</span>';
    jauge.className = 'planif-jauge-temps' + classe;
    jauge.style.display = '';
    jauge.innerHTML = texte;
}

// =========== PLANIFICATEUR EN GRILLE (lot 2, 6 août 2026) ===========
// Remplace le sommaire arborescent de la palette Navigation ET la Vue
// calendrier (rendu recyclé + post-traitement DOM, retirés au même lot).
// D2 : une rangée par semaine, numérotée à gauche (« Ordre de composition »
// de Keynote). D5 : les rangées DÉRIVENT du calendrier généré par le Cadre
// du trimestre — jamais redemandées ici. Q1/Q2 : tout ce qui n'a pas
// d'ancrage vit dans la zone « Non planifié » en pied de grille.

// Leçons dont le déroulé est déplié dans la grille (état d'affichage, non persisté).
var _leconsDepliees = new Set();

function basculerDetailLecon(leconId) {
    if (_leconsDepliees.has(leconId)) _leconsDepliees.delete(leconId);
    else _leconsDepliees.add(leconId);
    mettreAJourPlanificateur();
}

/**
 * Rangées de la grille, dérivées du calendrier complet (parcours
 * chronologique) : semaines numérotées (paquet-de-5) et semaines spéciales
 * à leur position réelle. Repli sans cadre : les semaines déjà utilisées
 * par les leçons, pour ne rien cacher.
 * @returns {{rangees: Array<{type: string, num?: number}>, source: string}}
 */
function deriverRangeesGrille() {
    var cal = null;
    try { cal = db.getSync(cle('calendrierComplet'), null); } catch (e) { cal = null; }

    if (cal && typeof cal === 'object' && Object.keys(cal).length > 0) {
        var rangees = [];
        var vues = new Set();
        var vuPlanif = false, vuExamens = false;
        Object.keys(cal).sort().forEach(function(dateStr) {
            var j = cal[dateStr];
            if (!j) return;
            if ((j.statut === 'cours' || j.statut === 'reprise') && j.numeroSemaine && !vues.has(j.numeroSemaine)) {
                vues.add(j.numeroSemaine);
                rangees.push({ type: 'semaine', num: j.numeroSemaine });
            } else if (j.statut === 'semaine-planification' && !vuPlanif) {
                vuPlanif = true;
                rangees.push({ type: 'planification' });
            } else if (j.statut === 'semaine-examens' && !vuExamens) {
                vuExamens = true;
                rangees.push({ type: 'examens' });
            }
        });
        if (rangees.length > 0) return { rangees: rangees, source: 'cadre' };
    }

    // Repli : aucune rangée dérivable — montrer au moins les semaines saisies.
    var maxSem = 0;
    for (var entry of etat.noeuds) {
        var sem = semaineDeLecon(entry[1]);
        if (sem !== null && sem > maxSem) maxSem = sem;
    }
    var repli = [];
    for (var n = 1; n <= maxSem; n++) repli.push({ type: 'semaine', num: n });
    return { rangees: repli, source: 'repli' };
}

function itemSequenceGrille(seq, niveau) {
    var etendue = etendueTemporelle(seq);
    var libelle = niveau > 0 ? cheminSequence(seq) : (seq.titre || 'Sans titre');
    var dureeSeq = dureeRollupNoeud(seq);
    var pill = etendue && etendue.fin !== etendue.debut
        ? formaterEtendue(etendue)
        : (dureeSeq ? formaterPeriodes(dureeSeq) : compterLeconsDescendantes(seq) + ' leçon' + (compterLeconsDescendantes(seq) > 1 ? 's' : ''));
    return '<div class="planif-som-item planif-som-seq' + (seq.id === sequenceActiveId ? ' actif' : '') + '"' +
           ' data-grille-type="sequence" data-grille-id="' + seq.id + '"' +
           ' data-action="planificationCarte.ouvrirSequence"' +
           ' data-param="' + seq.id + '"' +
           ' title="' + echapperHtml(libelle) + '">' +
           '<span class="planif-som-nom">' + echapperHtml(libelle) + '</span>' +
           '<span class="planif-som-pill">' + echapperHtml(pill) + '</span>' +
           '</div>';
}

function itemLeconGrille(lec, avecContexte) {
    var duree = formaterPeriodes(dureeRollupNoeud(lec));
    var depliee = _leconsDepliees.has(lec.id);
    var enfants = (lec.enfants || []).map(function(eid) { return etat.noeuds.get(eid); }).filter(Boolean);
    var parent = lec.parent ? etat.noeuds.get(lec.parent) : null;
    var contexte = (avecContexte && parent && parent.type === 'sequence')
        ? '<span class="planif-grille-contexte">' + echapperHtml(parent.titre || 'Sans titre') + '</span>'
        : '';

    var html = '<div class="planif-som-item planif-som-lecon' + (lec.id === leconActiveId ? ' actif' : '') + '"' +
        ' data-grille-type="lecon" data-grille-id="' + lec.id + '"' +
        ' data-action="planificationCarte.naviguerSommaireLecon"' +
        ' data-param="' + lec.id + '"' +
        ' title="' + echapperHtml(lec.titre || 'Sans titre') + '">' +
        (enfants.length > 0
            ? '<span class="planif-grille-chevron" data-action="planificationCarte.basculerDetailLecon" data-param="' + lec.id + '" title="' + (depliee ? 'Replier' : 'Déplier') + ' le déroulé">' + (depliee ? '▾' : '▸') + '</span>'
            : '<span class="planif-grille-chevron planif-grille-chevron--vide"></span>') +
        '<span class="planif-som-nom">' + echapperHtml(lec.titre || 'Sans titre') + contexte + '</span>' +
        (duree ? '<span class="planif-som-pill planif-som-pill-duree">' + duree + '</span>' : '') +
        '</div>';

    if (depliee && enfants.length > 0) {
        html += '<div class="planif-grille-detail">';
        for (var i = 0; i < enfants.length; i++) {
            var en = enfants[i];
            var config = TYPES[en.type];
            if (!config) continue;
            html += '<div class="planif-grille-detail-item" data-action="planificationCarte.naviguerVers" data-param="' + en.id + '">' +
                '<span class="planif-cal-pastille-mini" style="background: ' + obtenirCouleurNoeud(en) + '"></span>' +
                '<span class="planif-grille-detail-titre">' + echapperHtml(en.titre || obtenirLabelNoeud(en)) + '</span>' +
                (en.metadata && en.metadata.duree ? '<span class="planif-som-pill planif-som-pill-duree">' + en.metadata.duree + ' min</span>' : '') +
                '</div>';
        }
        html += '</div>';
    }
    return html;
}

/** Leçons descendantes d'une séquence, à toute profondeur (voie A). */
function leconsDescendantesDe(seq, vus) {
    if (!vus) vus = new Set();
    if (!seq || vus.has(seq.id)) return [];
    vus.add(seq.id);
    var resultat = [];
    (seq.enfants || []).forEach(function(eid) {
        var e = etat.noeuds.get(eid);
        if (!e) return;
        if (e.type === 'lecon') resultat.push(e);
        else if (e.type === 'sequence') resultat = resultat.concat(leconsDescendantesDe(e, vus));
    });
    return resultat;
}

/**
 * Lot 3 — déplacer une SÉQUENCE dans la grille : ses leçons bougent en bloc,
 * en conservant leurs écarts relatifs (D4). Bornes : jamais sous la semaine 1,
 * jamais au-delà du cadre (delta calé). Cas particuliers, sans deviner :
 *  - cible null (zone « Non planifié ») → toutes les leçons sont désancrées ;
 *  - leçons mixtes → seules les PLANIFIÉES se décalent (pas d'invention
 *    d'ancrage pour les autres) ;
 *  - aucune leçon planifiée → le dépôt sur une rangée ancre tout le bloc à
 *    cette semaine (c'est le geste d'assignation, pas une déduction).
 * @returns {boolean} true si quelque chose a changé
 */
function deplacerSequenceVersSemaine(seqId, cible, maxSemaine) {
    var seq = etat.noeuds.get(seqId);
    if (!seq || seq.type !== 'sequence') return false;
    var lecons = leconsDescendantesDe(seq);
    if (lecons.length === 0) return false;

    var ecrire = function(l, valeur) {
        if (!l.metadata) l.metadata = {};
        if (valeur === null) delete l.metadata.semaine;
        else l.metadata.semaine = valeur;
        propagerModification(l.id, 'metadata', JSON.parse(JSON.stringify(l.metadata)));
    };

    if (cible === null) {
        var aDesancrer = lecons.filter(function(l) { return semaineDeLecon(l) !== null; });
        if (aDesancrer.length === 0) return false;
        enregistrerPourUndo();
        aDesancrer.forEach(function(l) { ecrire(l, null); });
        sauvegarder();
        mettreAJourPlanificateur();
        return true;
    }

    cible = parseInt(cible, 10);
    if (isNaN(cible) || cible < SEMAINE_MIN) return false;

    var planifiees = lecons.filter(function(l) { return semaineDeLecon(l) !== null; });

    if (planifiees.length === 0) {
        // Bloc entièrement non planifié : le dépôt EST l'assignation.
        enregistrerPourUndo();
        lecons.forEach(function(l) { ecrire(l, cible); });
        sauvegarder();
        mettreAJourPlanificateur();
        return true;
    }

    var min = Infinity, max = -Infinity;
    planifiees.forEach(function(l) {
        var s = semaineDeLecon(l);
        if (s < min) min = s;
        if (s > max) max = s;
    });
    // L'étendue ne rentre pas dans le cadre : refuser plutôt que d'écraser
    // les écarts.
    if (maxSemaine && (max - min) > (maxSemaine - SEMAINE_MIN)) {
        afficherToastLien('Cette séquence s\'étale sur plus de semaines que le trimestre n\'en a.');
        return false;
    }
    var delta = cible - min;
    if (min + delta < SEMAINE_MIN) delta = SEMAINE_MIN - min;
    if (maxSemaine && max + delta > maxSemaine) delta = maxSemaine - max;
    if (delta === 0) return false;

    enregistrerPourUndo();
    planifiees.forEach(function(l) { ecrire(l, semaineDeLecon(l) + delta); });
    sauvegarder();
    mettreAJourPlanificateur();
    return true;
}

/** Lot 3 — point d'entrée du dépôt dans la grille (leçon OU séquence). */
function deposerDansGrille(type, id, semaine) {
    var maxSemaine = 0;
    deriverRangeesGrille().rangees.forEach(function(r) {
        if (r.type === 'semaine' && r.num > maxSemaine) maxSemaine = r.num;
    });
    if (type === 'lecon') {
        var n = etat.noeuds.get(id);
        if (!n || n.type !== 'lecon') return false;
        if (semaine !== null && maxSemaine && semaine > maxSemaine) semaine = maxSemaine;
        var avant = semaineDeLecon(n);
        var apres = (semaine === null) ? null : semaine;
        if (avant === apres) return false;
        enregistrerPourUndo();
        definirSemaineLecon(id, semaine === null ? '' : semaine);
        mettreAJourPlanificateur();
        return true;
    }
    if (type === 'sequence') {
        return deplacerSequenceVersSemaine(id, semaine, maxSemaine || null);
    }
    return false;
}

// Lot 3 — glisser vertical dans la grille (pointer events : souris d'abord ;
// le tactile du canevas ET de la grille reste une porte ouverte du relais).
// Délégation UNIQUE sur le conteneur : la grille se re-rend souvent, les
// listeners ne doivent pas vivre sur les items.
function initialiserDragGrille() {
    var conteneur = document.getElementById('planif-sommaire');
    if (!conteneur) return;
    var drag = null; // { id, type, item, x0, y0, demarre }
    var rangeeCible = null;

    function nettoyerCible() {
        if (rangeeCible) rangeeCible.classList.remove('planif-grille-rangee--cible');
        rangeeCible = null;
    }

    // Cible résolue GÉOMÉTRIQUEMENT (spans verticaux des rangées), pas par
    // elementFromPoint : un overlay ou un z-index quelconque ne doit pas
    // avaler le dépôt, et dans une grille seule la verticale compte.
    function rangeeSousPointeur(x, y) {
        var rc = conteneur.getBoundingClientRect();
        if (x < rc.left - 60 || x > rc.right + 60) return null; // sorti de la palette
        var cibles = conteneur.querySelectorAll('[data-grille-semaine]');
        for (var i = 0; i < cibles.length; i++) {
            var r = cibles[i].getBoundingClientRect();
            if (r.height > 0 && y >= r.top && y <= r.bottom) return cibles[i];
        }
        return null;
    }

    conteneur.addEventListener('pointerdown', function(e) {
        if (e.button) return;
        var item = e.target.closest('[data-grille-id]');
        if (!item) return;
        drag = { id: item.dataset.grilleId, type: item.dataset.grilleType, item: item,
                 x0: e.clientX, y0: e.clientY, demarre: false };
    });

    document.addEventListener('pointermove', function(e) {
        if (!drag) return;
        if (!drag.demarre) {
            if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) < 5) return;
            drag.demarre = true;
            drag.item.classList.add('planif-grille-item-drag');
        }
        var rangee = rangeeSousPointeur(e.clientX, e.clientY);
        if (rangee !== rangeeCible) {
            nettoyerCible();
            if (rangee) {
                rangeeCible = rangee;
                rangee.classList.add('planif-grille-rangee--cible');
            }
        }
    });

    document.addEventListener('pointerup', function(e) {
        if (!drag) return;
        var info = drag;
        drag = null;
        nettoyerCible();
        if (!info.demarre) return; // simple clic : la navigation suit son cours
        info.item.classList.remove('planif-grille-item-drag');
        // Avaler le clic de navigation qui suit un vrai glisser.
        document.addEventListener('click', function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }, { capture: true, once: true });

        var rangee = rangeeSousPointeur(e.clientX, e.clientY);
        if (!rangee) return;
        var brut = rangee.getAttribute('data-grille-semaine');
        deposerDansGrille(info.type, info.id, brut === '' ? null : parseInt(brut, 10));
    });
}

function mettreAJourPlanificateur() {
    var conteneur = document.getElementById('planif-sommaire');
    if (!conteneur) return;

    var derive = deriverRangeesGrille();
    var hierarchie = listerSequencesHierarchie('temporel');
    var toutesLecons = [];
    for (var entry of etat.noeuds) {
        if (entry[1].type === 'lecon') toutesLecons.push(entry[1]);
    }
    toutesLecons.sort(function(a, b) { return ((a.x || 0) - (b.x || 0)) || ((a.y || 0) - (b.y || 0)); });

    if (hierarchie.length === 0 && toutesLecons.length === 0) {
        conteneur.innerHTML = '<div class="planif-som-vide">Aucune séquence — glisse un nœud « Séquence » sur la carte pour planifier ici.</div>';
        mettreAJourJaugeTemps([]);
        return;
    }

    var html = '<div class="planif-som-item planif-som-globale' + (!sequenceActiveId ? ' actif' : '') + '"' +
               ' data-action="planificationCarte.ouvrirSequence"' +
               ' data-param=""' +
               ' title="Afficher tous les nœuds">' +
               '<span class="planif-som-nom">Vue globale</span>' +
               '</div>';

    if (derive.source === 'repli' && derive.rangees.length > 0) {
        html += '<div class="planif-grille-avis">Semaines dérivées des leçons — configure le Cadre du trimestre (Réglages) pour les rangées réelles.</div>';
    }

    html += '<div class="planif-grille">';
    for (var r = 0; r < derive.rangees.length; r++) {
        var rangee = derive.rangees[r];
        if (rangee.type !== 'semaine') {
            html += '<div class="planif-grille-rangee planif-grille-rangee--speciale">' +
                    '<div class="planif-grille-num">—</div>' +
                    '<div class="planif-grille-cellule">' +
                    (rangee.type === 'planification' ? 'Semaine de planification' : "Semaine d'examens") +
                    '</div></div>';
            continue;
        }
        var num = rangee.num;
        var contenu = '';
        for (var h = 0; h < hierarchie.length; h++) {
            var et = etendueTemporelle(hierarchie[h].seq);
            if (et && et.debut === num) contenu += itemSequenceGrille(hierarchie[h].seq, hierarchie[h].niveau);
        }
        for (var l = 0; l < toutesLecons.length; l++) {
            if (semaineDeLecon(toutesLecons[l]) === num) contenu += itemLeconGrille(toutesLecons[l], true);
        }
        html += '<div class="planif-grille-rangee' + (contenu ? '' : ' planif-grille-rangee--vide') + '" data-grille-semaine="' + num + '">' +
                '<div class="planif-grille-num">' + num + '</div>' +
                '<div class="planif-grille-cellule">' + contenu + '</div>' +
                '</div>';
    }
    html += '</div>';

    // Zone « Non planifié » (Q1/Q2) : séquences sans étendue + leçons sans
    // semaine. À la migration, TOUT part ici — c'est la liste de travail.
    var nonPlanifie = '';
    for (var h2 = 0; h2 < hierarchie.length; h2++) {
        if (!etendueTemporelle(hierarchie[h2].seq)) nonPlanifie += itemSequenceGrille(hierarchie[h2].seq, hierarchie[h2].niveau);
    }
    for (var l2 = 0; l2 < toutesLecons.length; l2++) {
        if (semaineDeLecon(toutesLecons[l2]) === null) nonPlanifie += itemLeconGrille(toutesLecons[l2], true);
    }
    if (nonPlanifie) {
        html += '<div class="planif-grille-nonplanifie" data-grille-semaine="">' +
                '<div class="planif-grille-nonplanifie-titre">Non planifié</div>' +
                nonPlanifie + '</div>';
    }

    conteneur.innerHTML = html;
    mettreAJourJaugeTemps(hierarchie.filter(function(e) { return e.niveau === 0; })
        .map(function(e) { return e.seq; }));

    requestAnimationFrame(function() {
        var itemActif = conteneur.querySelector('.planif-som-lecon.actif') ||
                        conteneur.querySelector('.planif-som-seq.actif');
        if (itemActif) itemActif.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// === IMPORT INTER-TRIMESTRE — panneau (données : planification-donnees.js) ===
function rendrePanneauImportTrimestre() {
    var panneau = document.getElementById('planif-import-tri-panel');
    if (!panneau) return;
    var sources = window.planificationDonnees.listerTrimestresAvecCartes();
    if (!sources.length) {
        panneau.innerHTML = '<div class="planif-import-tri-vide">Aucune carte dans les autres trimestres.</div>';
        return;
    }
    var html = '';
    for (var i = 0; i < sources.length; i++) {
        var t = sources[i];
        html += '<div class="planif-import-tri-groupe">' + echapperHtml(t.nom) + '</div>';
        for (var j = 0; j < t.cartes.length; j++) {
            var c = t.cartes[j];
            html += '<div class="planif-import-tri-ligne">' +
                    '<span class="planif-import-tri-nom" title="' + echapperHtml(c.nom) + '">' + echapperHtml(c.nom) + '</span>' +
                    '<span class="planif-import-tri-nb">' + c.nbNoeuds + ' nœud' + (c.nbNoeuds > 1 ? 's' : '') + '</span>' +
                    '<button type="button" class="planif-btn-carte planif-import-tri-btn" data-tid="' + echapperHtml(t.id) + '" data-cid="' + echapperHtml(c.id) + '">Importer</button>' +
                    '</div>';
        }
    }
    panneau.innerHTML = html;
    panneau.querySelectorAll('.planif-import-tri-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var nouvelId = window.planificationDonnees.importerCarteDepuisTrimestre(btn.dataset.tid, btn.dataset.cid);
            panneau.classList.remove('ouvert');
            if (nouvelId) {
                mettreAJourListeCartes();
                chargerCarte(nouvelId);
                afficherToastLien('Carte importée — copie indépendante, la source reste intacte.');
            } else {
                afficherToastLien("L'import a échoué — rien n'a été modifié.");
            }
        });
    });
}

// Clic sur une leçon du sommaire : ouvrir d'abord sa séquence parente si besoin.
function naviguerSommaireLecon(leconId) {
    if (!etat.noeuds.has(leconId)) return;
    var sequences = obtenirSequencesCarte();
    var seqParente = null;
    for (var i = 0; i < sequences.length; i++) {
        if ((sequences[i].enfants || []).indexOf(leconId) !== -1) { seqParente = sequences[i]; break; }
    }
    if (seqParente && seqParente.id !== sequenceActiveId) ouvrirSequence(seqParente.id);
    ouvrirLecon(leconId);
}

// Recentrer la vue selon le contexte (bouton ◎ de la barre + ⌘1).
function recentrerVue() {
    if (sequenceActiveId) centrerVueSurSequence(sequenceActiveId);
    else centrerVueSurContenu();
}

function centrerVueSurSequence(seqId) {
    var seq = etat.noeuds.get(seqId);
    if (!seq || !zoneTravail) return;

    // Calculer le bounding box de la séquence et ses enfants
    var minX = seq.x, maxX = seq.x, minY = seq.y, maxY = seq.y;
    var el = document.getElementById(seq.id);
    if (el) {
        maxX = seq.x + (el.offsetWidth || 200);
        maxY = seq.y + (el.offsetHeight || 100);
    }
    var enfants = (seq.enfants || []);
    for (var i = 0; i < enfants.length; i++) {
        var enfant = etat.noeuds.get(enfants[i]);
        if (!enfant) continue;
        var eel = document.getElementById(enfants[i]);
        var w = eel ? (eel.offsetWidth || 140) : 140;
        var h = eel ? (eel.offsetHeight || 50) : 50;
        if (enfant.x < minX) minX = enfant.x;
        if (enfant.x + w > maxX) maxX = enfant.x + w;
        if (enfant.y < minY) minY = enfant.y;
        if (enfant.y + h > maxY) maxY = enfant.y + h;
    }

    var cx = ((minX + maxX) / 2 + OFFSET_X) * etat.zoom;
    var cy = ((minY + maxY) / 2 + OFFSET_Y) * etat.zoom;
    zoneTravail.scrollTo({
        left: cx - zoneTravail.clientWidth / 2,
        top: cy - zoneTravail.clientHeight / 2,
        behavior: 'smooth'
    });
}

function ouvrirSequence(seqId) {
    var ancienId = sequenceActiveId;
    sequenceActiveId = seqId || null; // "" ou null = vue globale
    leconActiveId = null;
    // Restaurer le canevas si on revient du niveau micro
    var vueLecon = document.getElementById('planif-vue-lecon');
    if (vueLecon) vueLecon.style.display = 'none';
    if (zoneTravail) zoneTravail.style.display = '';
    if (sequenceActiveId === ancienId) return;
    reconstruireDOM();
    requestAnimationFrame(function() {
        if (sequenceActiveId) {
            centrerVueSurSequence(sequenceActiveId);
        } else {
            centrerVueSurContenu();
        }
    });
}


// =========== VUE LEÇON (niveau micro) ===========

var leconActiveId = null; // null = vue séquence (méso), ID = vue leçon (micro)

function ouvrirLecon(leconId) {
    leconActiveId = leconId || null;
    mettreAJourPlanificateur();

    var vueLecon = document.getElementById('planif-vue-lecon');
    if (leconActiveId) {
        // Niveau 3 : masquer le canevas, afficher la vue leçon
        if (zoneTravail) zoneTravail.style.display = 'none';
        if (vueLecon) { vueLecon.style.display = ''; rendreVueLecon(leconActiveId); }
    } else {
        // Retour au niveau 2 : masquer la vue leçon, restaurer le canevas
        if (vueLecon) vueLecon.style.display = 'none';
        if (zoneTravail) zoneTravail.style.display = '';
    }
}

function rendreVueLecon(leconId) {
    var vueLecon = document.getElementById('planif-vue-lecon');
    if (!vueLecon) return;

    var lec = etat.noeuds.get(leconId);
    if (!lec) { vueLecon.innerHTML = ''; return; }

    // (Plus aucune lecture de CLE_SEANCES ici : l'objectif est porté par le
    // nœud, et la section « Notes » a été retirée.)
    var duree = lec.metadata && lec.metadata.duree ? lec.metadata.duree : '';

    // Séquence parente
    var seqParent = sequenceActiveId ? etat.noeuds.get(sequenceActiveId) : null;
    var seqTitre = seqParent ? echapperHtml(seqParent.titre || '') : '';

    // Activités enfants
    var activites = (lec.enfants || []).map(function(eid) { return etat.noeuds.get(eid); }).filter(Boolean);

    // Construire le HTML
    var html = '<div class="planif-vue-lecon-inner">';

    // En-tête
    html += '<div class="planif-vue-lecon-header">';
    html += '<div class="planif-vue-lecon-breadcrumb">';
    if (seqTitre) html += '<span class="planif-vue-lecon-seq">' + seqTitre + '</span> <span class="planif-vue-lecon-sep">\u203A</span> ';
    html += '<span class="planif-vue-lecon-titre-label">' + echapperHtml(lec.titre || 'Sans titre') + '</span>';
    html += '</div>';
    if (duree) html += '<span class="planif-vue-lecon-duree">' + duree + '\u2009min</span>';
    html += '</div>';

    // Objectif — même source que la carte (`metadata.objectif`), aucune copie.
    html += '<div class="planif-vue-lecon-section">';
    html += '<h4>Objectif</h4>';
    html += '<div class="planif-vue-lecon-objectif" contenteditable="true" data-lecon-id="' + leconId + '" data-champ="objectif">' +
            echapperHtml(objectifsDeLecon(lec).map(function(o) { return o.texte; }).join('\n')) + '</div>';
    html += '</div>';

    // Activités
    if (activites.length > 0) {
        html += '<div class="planif-vue-lecon-section">';
        html += '<h4>Activit\u00e9s <span class="planif-vue-lecon-count">' + activites.length + '</span></h4>';
        html += '<div class="planif-vue-lecon-activites">';
        for (var i = 0; i < activites.length; i++) {
            var act = activites[i];
            var typeConfig = TYPES[act.type];
            var couleur = typeConfig ? typeConfig.couleur : 'var(--texte-secondaire)';
            var label = typeConfig ? typeConfig.label : act.type;
            var actDuree = act.metadata && act.metadata.duree ? act.metadata.duree + '\u2009min' : '';
            html += '<div class="planif-vue-lecon-activite">';
            html += '<span class="planif-vue-lecon-act-type" style="color:' + couleur + '">' + label + '</span>';
            html += '<span class="planif-vue-lecon-act-titre">' + echapperHtml(act.titre || '') + '</span>';
            if (actDuree) html += '<span class="planif-vue-lecon-act-duree">' + actDuree + '</span>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
    }

    // (Section « Notes » RETIRÉE le 6 août 2026 — décision Grégoire : champ
    // sans fonction à ce stade. Retiré partout, y compris de l'export et de
    // l'import Markdown de l'Organisateur.)

    html += '</div>';
    vueLecon.innerHTML = html;

    // Brancher la sauvegarde sur les champs éditables. L'objectif est le SEUL
    // champ de cette vue, et il vit sur le nœud — une seule vérité, partagée
    // avec la carte.
    vueLecon.querySelectorAll('[contenteditable]').forEach(function(el) {
        el.addEventListener('blur', function() {
            var lid = el.dataset.leconId;
            if (!lid || el.dataset.champ !== 'objectif') return;
            var noeud = etat.noeuds.get(lid);
            if (!noeud) return;
            if (!noeud.metadata) noeud.metadata = {};
            noeud.metadata.objectif = el.textContent.trim();
            sauvegarder();
        });
    });
}

// =========== FIN NAVIGATION ===========

window.planificationCarte = {
    initialiser: initialiser,
    activer: function() { planificationActive = true; },
    desactiver: function() { planificationActive = false; },
    centrerVueSurContenu: centrerVueSurContenu,
    mettreAJourListeCartes: mettreAJourListeCartes,
    chargerCarte: chargerCarte,
    changerCarte: changerCarte,
    etat: etat,
    getLiensDeNoeud: getLiensDeNoeud,
    obtenirLabelNoeud: obtenirLabelNoeud,
    obtenirCouleurNoeud: obtenirCouleurNoeud,
    TYPES: TYPES,
    TYPES_LIENS: TYPES_LIENS,
    trouverIdeesMaitressesAncetres: trouverIdeesMaitressesAncetres,
    chargerProductions: chargerProductions,
    afficherDetailsProduction: afficherDetailsProduction,
    naviguerVers: naviguerVers,
    CLE_SEANCES: CLE_SEANCES,
    migrerObjectifsVersMetadata: migrerObjectifsVersMetadata,
    objectifDeLecon: objectifDeLecon,
    objectifsDeLecon: objectifsDeLecon,
    appliquerObjectifs: appliquerObjectifs,
    objectifDeLeconParId: objectifDeLeconParId,
    objectifsDeLeconParId: objectifsDeLeconParId,
    definirObjectifsLecon: definirObjectifsLecon,
    // Ancrage temporel : la leçon écrit, tout le reste dérive (D3)
    migrerAncrageTemporelVersLecon: migrerAncrageTemporelVersLecon,
    semaineDeLecon: semaineDeLecon,
    etendueTemporelle: etendueTemporelle,
    etendueTemporelleParId: etendueTemporelleParId,
    formaterEtendue: formaterEtendue,
    rangTemporel: rangTemporel,
    definirSemaineLecon: definirSemaineLecon,
    // Séquences de séquences (voie A) : lecture hiérarchique partagée
    listerSequencesHierarchie: listerSequencesHierarchie,
    cheminSequence: cheminSequence,
    compterLeconsDescendantes: compterLeconsDescendantes,
    peutContenir: peutContenir,
    trouverConteneurParRecouvrement: trouverConteneurParRecouvrement,
    recentrerVue: recentrerVue,
    injecterNoeuds: injecterNoeuds,
    nouvelleCarte: nouvelleCarte,
    ouvrirGuide: ouvrirGuide,
    // Sommaire de navigation (palette Navigation)
    ouvrirSequence: ouvrirSequence,
    ouvrirLecon: ouvrirLecon,
    naviguerSommaireLecon: naviguerSommaireLecon,
    mettreAJourPlanificateur: mettreAJourPlanificateur,
    basculerDetailLecon: basculerDetailLecon,
    // Lot 3 : déplacement dans la grille + annulation
    deposerDansGrille: deposerDansGrille,
    dupliquerConteneurEnProfondeur: dupliquerConteneurEnProfondeur,
    clonerNoeud: clonerNoeud,
    deplacerSequenceVersSemaine: deplacerSequenceVersSemaine,
    annuler: annuler,
    retablir: retablir,
    // Plein écran
    togglePleinEcran: togglePleinEcranCarte
};

// === COULEUR DE FOND CANEVAS ===
(function() {
    var btnFond = document.getElementById('planif-btn-fond');
    var dropdown = document.getElementById('planif-fond-dropdown');
    if (!btnFond || !dropdown) return;

    btnFond.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('visible');
    });

    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        var swatch = e.target.closest('[data-fond]');
        if (!swatch) return;
        var couleur = swatch.dataset.fond;
        var zone = document.getElementById('planif-zone-wrapper');
        if (zone) zone.style.background = couleur || '';
        db.setSync('planif-fond-canvas', couleur);
        dropdown.classList.remove('visible');
    });

    document.addEventListener('click', function() {
        dropdown.classList.remove('visible');
    });

    // Restaurer
    var fondSauve = db.getSync('planif-fond-canvas', null);
    if (fondSauve) {
        var zone = document.getElementById('planif-zone-wrapper');
        if (zone) zone.style.background = fondSauve;
    }
})();

var _planifPleinEcran = false;

function togglePleinEcranCarte() {
    var zone = document.getElementById('conception-carte');
    if (!zone) return;
    _planifPleinEcran = !_planifPleinEcran;
    zone.classList.toggle('planif-plein-ecran', _planifPleinEcran);
    document.body.classList.toggle('planif-plein-ecran-actif', _planifPleinEcran);
    var btn = document.getElementById('planif-btn-plein-ecran');
    if (btn) {
        btn.innerHTML = _planifPleinEcran ? '<img src="icons/icon-collapse.svg" alt="" class="planif-icon">' : '<img src="icons/icon-fit-to-width.svg" alt="" class="planif-icon">';
        btn.title = _planifPleinEcran ? 'Quitter le plein \u00e9cran' : 'Plein \u00e9cran';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _planifPleinEcran) {
        togglePleinEcranCarte();
    }
});

})();
