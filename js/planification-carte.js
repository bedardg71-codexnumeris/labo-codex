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
    // #445 : QUEL nœud l'Inspecteur montre. `panneauOuvert` seul ne suffit
    // pas pour synchroniser une case : deux blocs d'une même leçon affichent
    // les mêmes objectifs, donc la case existe aussi quand l'Inspecteur parle
    // d'un autre bloc.
    panneauNoeudId: null,
    zoom: 1,
    // Mode loupe (11 août 2026) : une VUE en survol, pas un second canevas.
    loupeActive: false,
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

// === #367 (7 août 2026) — LA CLÉ COMPOSITE DES NOTES DE LEÇON ===
//
// Deux défauts, découverts séparément et corrigés ensemble parce qu'ils
// demandent la MÊME migration :
//
//  1. `planification_seances` n'était PAS namespacée : `cle()` la retournait
//     NUE (cas « clé non reconnue »), donc les notes étaient partagées entre
//     TOUS les trimestres — et la démo y écrivait aussi.
//  2. Le dictionnaire était PLAT, indexé par id de leçon. Or ces ids
//     (`planif-noeud_N`) sont produits par un compteur PAR CARTE : deux cartes
//     ont chacune leur `planif-noeud_3`. Les notes étaient donc déjà aliassées
//     ENTRE CARTES d'un même trimestre (rouge D1 de l'audit du 5 août).
//
// Namespacer sans composer n'aurait réglé que la moitié — c'est pourquoi les
// deux vont ensemble.
//
// La clé devient `<carteId>::<leconId>`. Le carteId est TOUJOURS celui de la
// carte active : on ne lit et n'écrit les notes que de la carte ouverte.
var SEPARATEUR_NOTE = '::';

/**
 * Porte UNIQUE de composition de la clé d'une note de leçon.
 * @param {string} leconId
 * @param {string} [carteId] force une carte (migration, copie) ; sinon l'active
 * @returns {string|null} null si aucune carte n'est identifiable — l'appelant
 *   doit alors s'abstenir plutôt que d'écrire sous une clé nue, qui
 *   recréerait l'aliasing qu'on retire ici.
 */
function cleNoteLecon(leconId, carteId) {
    if (!leconId) return null;
    var cid = carteId;
    if (!cid) {
        try {
            var index = window.planificationDonnees && typeof window.planificationDonnees.getIndex === 'function'
                ? window.planificationDonnees.getIndex()
                : null;
            cid = index && index.active;
        } catch (e) {
            cid = null;
        }
    }
    if (!cid) return null;
    return cid + SEPARATEUR_NOTE + leconId;
}

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

// ---------------------------------------------------------------------------
// #403 — liens objectif → activité / évaluation (design tranché le 6 août 2026)
//
// Le lien vit sur le nœud SERVANT (`metadata.objectifsServis = [idObjectif…]`),
// jamais sur l'objectif : pas de nouveau type de nœud, pas de second système de
// liens. La relation est N:N et les deux bouts ont une identité — les objectifs
// portent un id depuis 1.34.0 précisément pour ça.
//
// Les types servants sont les mêmes que partout ailleurs dans le module :
// activité, soutien et révision forment un trio (cf. connaissanceAtteinActivite
// et evaluerBadge), plus l'évaluation qui peut cocher en direct. Restreindre au
// seul type « activité » aurait créé une exception locale — une activité de
// révision qui sert un objectif ne pourrait pas le déclarer.
var TYPES_SERVANTS_OBJECTIF = ['expose', 'activite', 'soutien', 'revision', 'evaluation',
    'ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture'];

/** La leçon qui contient ce nœud, ou null s'il est libre / ailleurs. */
function leconParenteDe(n) {
    if (!n || !n.parent) return null;
    var parent = etat.noeuds.get(n.parent);
    return parent && parent.type === 'lecon' ? parent : null;
}

/**
 * Objectifs déclarés servis par ce nœud, FILTRÉS aux objectifs de sa propre
 * leçon. Le filtre n'est pas défensif, il est structurel : un clone déplacé
 * dans une autre leçon garderait sinon des ids étrangers, et un objectif retiré
 * laisserait une référence morte. La leçon parente fait foi à la lecture.
 */
function objectifsServisPar(n) {
    if (!n || !n.metadata || !Array.isArray(n.metadata.objectifsServis)) return [];
    var lecon = leconParenteDe(n);
    if (!lecon) return [];
    var idsLecon = {};
    objectifsDeLecon(lecon).forEach(function(o) { idsLecon[o.id] = true; });
    return n.metadata.objectifsServis.filter(function(id) { return idsLecon[id]; });
}

/**
 * #964 (27 sept. 2026) — UNE ÉVALUATION SE RELIE À DES OBJECTIFS, ET À RIEN
 * D'AUTRE (décision didactique de Grégoire : un seul geste, un seul signal).
 *
 * Elle coche, dans son Inspecteur, les objectifs de sa leçon ou d'une leçon
 * placée avant elle (`leconsProposeesAEvaluation`). À la LECTURE, en revanche,
 * tout objectif coché qui existe encore sur la carte compte, quelle que soit sa
 * leçon — et c'est voulu, pas laxiste :
 *   - déplacer une leçon après l'évaluation ne doit pas effacer en silence ce
 *     que l'enseignant·e a coché (le filtre de `objectifsServisPar` le ferait) ;
 *   - le lot suivant (#965) signale justement « servi qu'après cette
 *     évaluation » : il a besoin que ce cas reste lisible.
 * Un identifiant qui ne résout plus rien (objectif retiré) est écarté, comme
 * partout ailleurs.
 *
 * ⚠ Les blocs NON-évaluation gardent `objectifsServisPar` et sa règle : un bloc
 * sert les objectifs de SA leçon.
 */
function indexObjectifsCarte() {
    var index = {};
    for (var entryIO of etat.noeuds) {
        var n = entryIO[1];
        if (n.type !== 'lecon') continue;
        var objs = objectifsDeLecon(n);
        for (var io = 0; io < objs.length; io++) index[objs[io].id] = n;
    }
    return index;
}

function objectifsVerifiesPar(evaluation, index) {
    if (!evaluation || evaluation.type !== 'evaluation') return [];
    if (!evaluation.metadata || !Array.isArray(evaluation.metadata.objectifsServis)) return [];
    var idx = index || indexObjectifsCarte();
    return evaluation.metadata.objectifsServis.filter(function(id) { return !!idx[id]; });
}

/** Vrai si la leçon `a` est placée STRICTEMENT avant `b` : semaine antérieure, ou même semaine et séance antérieure. */
function leconEstAvant(a, b) {
    var sa = semaineDeLecon(a), sb = semaineDeLecon(b);
    if (sa === null || sb === null) return false;
    if (sa !== sb) return sa < sb;
    var ra = rangSeanceDeLecon(a), rb = rangSeanceDeLecon(b);
    return ra !== null && rb !== null && ra < rb;
}

/**
 * Leçons dont une évaluation peut cocher les objectifs (#964, choix de Grégoire
 * du 27 sept.) : la sienne d'abord, puis celles placées avant elle, de la plus
 * proche à la plus ancienne. Une leçon sans semaine n'est jamais « avant » ;
 * une évaluation dans une leçon sans semaine ne voit que sa leçon ; une
 * évaluation hors de toute leçon n'en voit aucune.
 */
function leconsProposeesAEvaluation(evaluation) {
    var hote = leconParenteDe(evaluation);
    if (!hote) return [];
    var avant = [];
    for (var entryLP of etat.noeuds) {
        var n = entryLP[1];
        if (n.type === 'lecon' && n.id !== hote.id && leconEstAvant(n, hote)) avant.push(n);
    }
    avant.sort(function(a, b) {
        return (semaineDeLecon(b) - semaineDeLecon(a))
            || ((rangSeanceDeLecon(b) || 0) - (rangSeanceDeLecon(a) || 0))
            || ((a.x || 0) - (b.x || 0)) || ((a.y || 0) - (b.y || 0));
    });
    return [hote].concat(avant);
}

/**
 * Les rubriques de l'Inspecteur d'une évaluation : les leçons proposées, PUIS
 * celles des objectifs déjà cochés qui ne sont plus proposées (leçon passée
 * après l'évaluation, sans semaine, évaluation déplacée…).
 * ⚠ Ce second ajout n'est pas cosmétique (R3 a, relecture de Cowork) : les
 * cases de l'Inspecteur RÉÉCRIVENT la liste entière au premier clic
 * (`appliquerCasesServies`). Un objectif coché sans case serait effacé en
 * silence dès qu'on coche autre chose.
 */
function leconsInspecteurEvaluation(evaluation, index) {
    var idx = index || indexObjectifsCarte();
    var groupes = leconsProposeesAEvaluation(evaluation);
    objectifsVerifiesPar(evaluation, idx).forEach(function(oid) {
        var lec = idx[oid];
        if (lec && groupes.indexOf(lec) === -1) groupes.push(lec);
    });
    return groupes;
}

/** Vrai si au moins une évaluation de la carte, où qu'elle soit, coche cet objectif. */
function objectifVerifieParUneEvaluation(objectifId, index) {
    var idx = index || indexObjectifsCarte();
    for (var entryOV of etat.noeuds) {
        var n = entryOV[1];
        if (n.type === 'evaluation' && objectifsVerifiesPar(n, idx).indexOf(objectifId) !== -1) return true;
    }
    return false;
}

/** Vrai si au moins un objectif de cette leçon est vérifié par une évaluation. */
function leconAObjectifVerifie(lecon, index) {
    var idx = index || indexObjectifsCarte();
    return objectifsDeLecon(lecon).some(function(o) { return objectifVerifieParUneEvaluation(o.id, idx); });
}

/** Écriture — porte unique, comme appliquerObjectifs l'est pour les objectifs. */
function definirObjectifsServis(noeudId, ids) {
    var n = etat.noeuds.get(noeudId);
    if (!n) return false;
    if (TYPES_SERVANTS_OBJECTIF.indexOf(n.type) === -1) return false;
    if (!n.metadata) n.metadata = {};
    var propres = (Array.isArray(ids) ? ids : []).filter(function(id) {
        return typeof id === 'string' && id !== '';
    });
    if (propres.length === 0) delete n.metadata.objectifsServis;
    else n.metadata.objectifsServis = propres;
    sauvegarder();
    return true;
}

/**
 * Lecture par id — porte d'entrée des autres modules (générateur d'export).
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
 * Écriture par id — porte de sortie UNIQUE des autres modules.
 * Évite d'exposer `sauvegarder()` brut : un seul chemin d'écriture pour
 * l'objectif, donc une seule vérité.
 *
 * Accepte des chaînes OU des objets `{id, texte}`. L'id compte depuis #403 :
 * il est la cible des `objectifsServis`, donc le RÉATTRIBUER, c'est déplacer
 * silencieusement un lien d'un objectif à un autre. Trois résolutions, dans
 * cet ordre :
 *
 *   1. **par id fourni** — la carte connaît l'identité de chaque ligne (elle
 *      la porte en `data-obj-id`) : insertion et retrait au milieu sont exacts ;
 *   2. **par texte inchangé** — un appelant qui n'envoie que du texte ; un
 *      objectif dont la formulation n'a pas bougé garde son id même si son
 *      RANG a bougé (c'est le cas « j'insère une ligne au milieu du champ ») ;
 *   3. **par rang**, pour le reste — c'est ce qui fait survivre une simple
 *      correction de formulation.
 *
 * Chaque ancien id n'est consommé qu'une fois : deux objectifs ne peuvent pas
 * hériter du même, sans quoi un lien viserait les deux.
 *
 * ⚠ Avant le 7 août 2026, seule l'étape 3 existait. Insérer un objectif au
 * milieu décalait donc tous les ids d'un cran — inoffensif tant que rien ne
 * les visait, faux dès #403.
 *
 * @returns {boolean} true si le nœud existait et a été mis à jour
 */
function appliquerObjectifs(n, textes) {
    if (!n.metadata) n.metadata = {};

    var liste = Array.isArray(textes) ? textes : (textes ? [textes] : []);
    var anciens = objectifsDeLecon(n);
    var consommes = {};

    // Normalisation : { texte, idDemande } — les entrées vides ne sont jamais
    // persistées (une ligne d'accueil en cours de saisie en est une).
    var entrees = [];
    for (var i = 0; i < liste.length; i++) {
        var brut = liste[i];
        var estObjet = brut && typeof brut === 'object';
        var texte = String((estObjet ? brut.texte : brut) == null ? '' : (estObjet ? brut.texte : brut)).trim();
        if (texte === '') continue;
        entrees.push({ texte: texte, idDemande: estObjet && brut.id ? String(brut.id) : null });
    }

    function reserver(id) {
        if (!id || consommes[id]) return null;
        if (!anciens.some(function(o) { return o.id === id; })) return null;
        consommes[id] = true;
        return id;
    }

    // Passes 1 et 2 d'abord, sur TOUTES les entrées : une résolution certaine
    // ne doit jamais se faire voler son id par un repli de rang situé plus haut.
    for (var p = 0; p < entrees.length; p++) {
        entrees[p].id = reserver(entrees[p].idDemande);
    }
    for (var q = 0; q < entrees.length; q++) {
        if (entrees[q].id) continue;
        var jumeau = anciens.find(function(o) {
            return !consommes[o.id] && o.texte.trim() === entrees[q].texte;
        });
        if (jumeau) entrees[q].id = reserver(jumeau.id);
    }
    // Passe 3 : repli par rang sur ce qui reste des deux côtés.
    var restants = anciens.filter(function(o) { return !consommes[o.id]; });
    var curseur = 0;
    for (var r = 0; r < entrees.length; r++) {
        if (entrees[r].id) continue;
        entrees[r].id = (restants[curseur] && reserver(restants[curseur].id)) || nouvelIdObjectif();
        curseur++;
    }

    var nouveaux = entrees.map(function(e) { return { id: e.id, texte: e.texte }; });
    if (nouveaux.length === 0) delete n.metadata.objectifs;
    else n.metadata.objectifs = nouveaux;
    sauvegarder();
    return true;
}

/**
 * Porte publique : applique PUIS re-rend.
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

        // SAUVETAGE (7 août 2026) — une leçon peut porter les DEUX champs.
        // La « vue leçon » retirée ce jour offrait un champ d'objectif qui LISAIT
        // `metadata.objectifs` (la liste) mais RÉÉCRIVAIT `metadata.objectif` (la
        // chaîne, format mort). Comme la migration ci-dessous saute toute leçon
        // ayant déjà une liste, ce qui y était saisi n'a plus jamais été relu :
        // du texte d'enseignant dormant dans un champ que rien ne lit. Retirer
        // le chemin d'écriture sans récupérer d'abord aurait rendu la perte
        // définitive.
        //
        // Le champ rendait tous les objectifs dans une seule zone, séparés par
        // des sauts de ligne, et réécrivait le bloc entier : on redécoupe donc,
        // et on n'ajoute que les lignes ABSENTES de la liste — sans quoi chaque
        // objectif déjà présent reviendrait en double.
        if (n.metadata && Array.isArray(n.metadata.objectifs)
            && typeof n.metadata.objectif === 'string' && n.metadata.objectif.trim() !== '') {
            var connus = {};
            objectifsDeLecon(n).forEach(function(o) { connus[o.texte.trim()] = true; });
            var recuperes = n.metadata.objectif.split('\n')
                .map(function(t) { return t.trim(); })
                .filter(function(t) { return t !== '' && !connus[t]; });
            recuperes.forEach(function(texte) {
                n.metadata.objectifs.push({ id: nouvelIdObjectif(), texte: texte });
            });
            delete n.metadata.objectif;
            migres.push(n.id);
            if (recuperes.length > 0) {
                console.warn('[Planification] Objectif récupéré d\'un champ mort sur la leçon ' + n.id
                             + ' (' + recuperes.length + ' ligne' + (recuperes.length > 1 ? 's' : '') + ')');
            }
            continue;
        }
        if (n.metadata && Array.isArray(n.metadata.objectifs)) {
            // #158 (10 août 2026) — un objectif au format LISTE mais SANS id
            // (import, fusion, état intermédiaire d'avant 1.34) passait ici
            // sans être complété. Or TOUT le système de liens (#403 :
            // objectifsServis, pastilles, cases de l'Inspecteur) résout par
            // id : sans id, chaque édition de la liste re-minte des
            // identifiants neufs en passe 3 d'appliquerObjectifs — et les
            // liens existants meurent ou glissent d'un cran. On stampe ici,
            // une fois, à la migration par carte : idempotent, additif.
            var completes = 0;
            n.metadata.objectifs.forEach(function(o) {
                if (o && typeof o.texte === 'string' && !o.id) {
                    o.id = nouvelIdObjectif();
                    completes++;
                }
            });
            if (completes > 0) {
                migres.push(n.id);
                console.warn('[Planification] ' + completes + ' objectif(s) sans id complété(s) sur la leçon '
                             + n.id + ' (#158) — les liens « objectifs servis » redeviennent stables');
            }
            continue;
        }

        // Format 2 (chaîne unique) : bascule en mémoire, rien à purger ailleurs.
        if (n.metadata && typeof n.metadata.objectif === 'string' && n.metadata.objectif.trim() !== '') {
            n.metadata.objectifs = [{ id: nouvelIdObjectif(), texte: n.metadata.objectif.trim() }];
            delete n.metadata.objectif;
            migres.push(n.id);
            continue;
        }
        if (n.metadata && 'objectif' in n.metadata) delete n.metadata.objectif;

        // Format 1 (ancienne clé de séances).
        var cleAncienne = cleNoteLecon(n.id);
        var ancien = cleAncienne && seances[cleAncienne] && seances[cleAncienne].objectifPersonnalise;
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
            var cleM = cleNoteLecon(migres[i]);
            if (cleM && seances[cleM]) delete seances[cleM].objectifPersonnalise;
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

/** Porte d'entrée par id — pour le générateur d'export. */
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

// === LE TRAVAIL HORS CLASSE (12 août 2026, #416 lot B) ===
//
// La sixième colonne du calendrier de Grégoire s'appelle « Travail personnel ».
// Rien dans le modèle ne disait « ce nœud se fait hors des heures de classe » :
// le patron le plus proche était `metadata.prealable`, un drapeau booléen avec
// sa case dans l'Inspecteur. C'est celui-là.
//
// ⚠ UN NŒUD HORS CLASSE NE PORTE AUCUNE DURÉE (D3, arbitrée par Grégoire). Ce
// n'est pas une restriction gratuite : `dureeRollupNoeud` additionne tous les
// descendants d'une leçon, et la règle du projet dit qu'UNE MINUTE DE CLASSE
// APPARTIENT À EXACTEMENT UN NŒUD. Une durée hors classe gonflerait le Σ d'une
// leçon avec du temps qui n'est PAS du temps de classe — un total faux, sans
// rien pour le signaler. C'est le même raisonnement qui a exclu les
// connaissances de `TYPES_AVEC_DUREE`.
//
// ⚠ DEUX GARDES, PAS UNE, et c'est délibéré : cocher la case RETIRE la durée,
// et `dureeRollupNoeud` ignore de toute façon les nœuds hors classe. La
// seconde couvre ce que la première ne voit pas — une durée arrivée par import
// sur un nœud déjà marqué.

/** Le nœud se fait-il hors des heures de classe ? */
function estHorsClasseNoeud(n) {
    return !!(n && n.metadata && n.metadata.horsClasse === true);
}

/**
 * Porte d'écriture UNIQUE du drapeau (patron `definirRangSeance`).
 * @returns {boolean} true si le nœud existait et a été mis à jour
 */
function definirHorsClasse(noeudId, horsClasse) {
    var n = etat.noeuds.get(noeudId);
    if (!n || TYPES_HORS_CLASSE.indexOf(n.type) === -1) return false;
    if (!n.metadata) n.metadata = {};

    var vise = horsClasse === true;
    if (estHorsClasseNoeud(n) === vise) return false;

    if (vise) {
        n.metadata.horsClasse = true;
        // D3 : la durée part AVEC la case. La garder « au cas où » ferait
        // réapparaître du temps de classe le jour où on décoche, sans que
        // personne ne l'ait demandé.
        delete n.metadata.duree;
    } else {
        delete n.metadata.horsClasse;
    }

    propagerModification(noeudId, 'metadata', JSON.parse(JSON.stringify(n.metadata)));
    sauvegarder();
    return true;
}

// === RANG DE SÉANCE DANS LA SEMAINE (12 août 2026, #416 lot A) ===
//
// LE REPORT EST LEVÉ. Depuis le 7 août, `analyserRepereTitre` sait détecter
// « séance 2 » dans un titre mais REFUSE de le retirer, et le backlog en donne
// le motif : « la séance n'a pas de logement dans le modèle (colonnes
// reportées) ». Retirer un repère qui compense un concept manquant aurait fait
// perdre l'information. Ce lot donne le logement ; le lot E pourra alors
// proposer le retrait, comme il propose déjà celui de « Sem. 11 ».
//
// ⚠ UN RANG, PAS UNE LETTRE (décision Grégoire, 12 août). Le stockage est un
// ENTIER — 1, 2, 3 — et l'affichage seul dit A, B, C. Deux raisons :
//   1. `obtenirRangSeanceDansSemaine()` (horaire.js) raisonne déjà en rang :
//      stocker la lettre obligerait à traduire dans l'autre sens à chaque
//      lecture de l'horaire, c'est-à-dire à chaque résolution de date ;
//   2. « A/B » suppose deux séances par semaine. C'est vrai du 601-101, et de
//      personne d'autre nécessairement.
//
// ⚠ LEÇONS SEULEMENT — asymétrie DÉLIBÉRÉE avec le sélecteur de semaine, qui
// sert aussi les séquences. Une séquence s'étend sur des semaines ; elle n'a
// pas de rang DANS une semaine. Lui en donner un rouvrirait exactement la
// contradiction séquence/leçons retirée le 6 août.

// Plafond du sélecteur. C'est une CAPACITÉ D'INTERFACE, pas une inférence sur
// l'horaire : le rang dit « la n-ième rencontre de la semaine » et garde ce
// sens même sans horaire saisi. On ne le dérive donc pas des séances — ce
// serait faire dépendre la saisie d'une donnée d'un autre module, et rendre le
// champ muet chez qui n'a pas encore rempli son cadre de trimestre.
var RANG_SEANCE_MAX = 4;

/** « A », « B »… pour l'AFFICHAGE. Jamais stocké sous cette forme. */
function lettreRangSeance(rang) {
    var r = parseInt(rang, 10);
    if (isNaN(r) || r < 1 || r > RANG_SEANCE_MAX) return '';
    return String.fromCharCode(64 + r); // 1 → 'A'
}

/** Rang d'une leçon dans sa semaine, ou null si non posé / autre type. */
function rangSeanceDeLecon(n) {
    if (!n || n.type !== 'lecon' || !n.metadata) return null;
    var r = parseInt(n.metadata.rangSeance, 10);
    return (isNaN(r) || r < 1 || r > RANG_SEANCE_MAX) ? null : r;
}

/**
 * Écriture — porte de sortie UNIQUE du rang (même patron que
 * `definirSemaineLecon`). `rang` null/0/'' = repasser en « non posé ».
 * @returns {boolean} true si la leçon existait et a été mise à jour
 */
function definirRangSeance(leconId, rang) {
    var n = etat.noeuds.get(leconId);
    if (!n || n.type !== 'lecon') return false;
    if (!n.metadata) n.metadata = {};

    var r = parseInt(rang, 10);
    if (isNaN(r) || r < 1 || r > RANG_SEANCE_MAX) {
        if (!('rangSeance' in n.metadata)) return false;
        delete n.metadata.rangSeance;
    } else {
        if (n.metadata.rangSeance === r) return false;
        n.metadata.rangSeance = r;
    }
    propagerModification(leconId, 'metadata', JSON.parse(JSON.stringify(n.metadata)));
    sauvegarder();
    return true;
}

// === SÉLECTEUR DE SEMAINE DANS LE BLOC (7 août 2026) ===
//
// Demande de Grégoire : « à côté du type Leçon ou Séquence, un dropdown avec
// toutes les semaines du trimestre ». Le champ existait déjà — dans
// l'inspecteur, en saisie libre — mais personne ne le remplissait, et
// l'enseignant compensait en écrivant « Sem. 11 » dans ses titres. C'est le
// motif de F1 et F3 une troisième fois : un champ qui n'est pas là où le
// travail se fait se fait compenser dans le texte.
//
// ⮕ Les deux gestes se répondent parce qu'ils passent par la MÊME porte :
// `deposerDansGrille()`, déjà utilisée par le glisser dans la grille. Sur une
// leçon elle ÉCRIT `metadata.semaine` ; sur une séquence elle DÉPLACE le bloc
// entier (décalage de toutes ses leçons, étendue toujours dérivée). Rien de
// nouveau n'est stocké sur la séquence — la contradiction séquence/leçons
// retirée le 6 août ne se rouvre pas.

/**
 * Rendu PARESSEUX : seule l'option courante est écrite au rendu du bloc. La
 * liste complète est peuplée au premier contact (`peuplerSelecteurSemaine`).
 * `reconstruireDOM()` passe souvent et une carte porte des dizaines de blocs :
 * écrire quinze options par bloc à chaque passage serait du travail jeté.
 */
/**
 * Champ de durée posé DANS l'en-tête du nœud (8 août 2026, décision Grégoire).
 *
 * Il vivait dans l'Inspecteur, derrière un bouton « + » qui le révélait. Deux
 * défauts : il fallait ouvrir un panneau pour lire une information qu'on
 * consulte en survolant sa carte, et la fonction était indécouvrable tant
 * qu'aucune durée n'était posée — le reproche exact fait au badge 🎯 avant
 * qu'on le grise (friction F1). L'input est donc TOUJOURS VISIBLE, vide quand
 * il n'y a rien : rendre la fonction visible plutôt que devinable.
 *
 * ⚠ SÉCURITÉ — `parseInt` n'est pas cosmétique. `metadata.duree` est une donnée
 * PERSISTÉE qui peut venir d'un import (bibliothèque d'alignements, import
 * inter-trimestre) : sans coercition, une valeur non numérique sortirait de
 * l'interpolation dans l'attribut `value=`, et la CSP ne protège pas
 * l'injection d'attributs. Invariant hérité de l'Inspecteur, il voyage avec le
 * champ — cf. `sentinelle-inspecteur-duree-coercition`.
 */
function dureeControleHTML(n) {
    if (!n || TYPES_AVEC_DUREE.indexOf(n.type) === -1) return '';
    // D3 : un nœud hors classe n'accepte aucune durée — le champ disparaît
    // plutôt que d'être grisé. Un champ grisé invite à demander pourquoi ; un
    // champ absent dit que la question ne se pose pas.
    if (estHorsClasseNoeud(n)) return '';
    var minutes = parseInt(n.metadata && n.metadata.duree, 10) || '';
    return '<span class="planif-noeud-duree-boite">' +
        '<input type="number" class="planif-noeud-duree" data-duree-noeud="' + echapperHtml(n.id) + '"' +
        ' value="' + minutes + '" min="1" max="600" placeholder="—"' +
        ' title="Durée estimée, en minutes"' +
        ' aria-label="Durée estimée de ce bloc, en minutes">' +
        '<span class="planif-noeud-duree-unite" aria-hidden="true">min</span>' +
        '</span>';
}

/**
 * Compteur de durée dans l'en-tête d'une leçon ou d'une séquence.
 *
 * AFFICHAGE PUR : `dureeRollupNoeud` calcule déjà ce total, récursivement, et
 * alimente le planificateur depuis le 6 août. Aucun calcul neuf, aucune
 * nouvelle source de vérité — on montre sur la carte ce qui n'était lisible
 * qu'en ouvrant l'Inspecteur ou en regardant la grille.
 */
/**
 * Texte du compteur. Une SEULE formulation, partagée par le rendu initial et le
 * rafraîchissement — sinon les deux divergent au premier ajustement, et le
 * total afficherait deux formes selon qu'on vient de charger la carte ou de
 * taper une durée. Espaces insécables LITTÉRALES (\u00a0) et non `&nbsp;` :
 * elles traversent aussi bien `innerHTML` que `textContent`, ce qui permet au
 * rafraîchissement de se passer d'`innerHTML`.
 */
function texteRollup(total) {
    return total ? '\u03a3\u00a0' + total + '\u00a0min' : '\u03a3\u00a0\u2014';
}

function compteurDureeHTML(n) {
    if (!n || !(TYPES[n.type] && TYPES[n.type].conteneur)) return '';
    var total = dureeRollupNoeud(n);
    return '<span class="planif-noeud-rollup' + (total ? '' : ' planif-noeud-rollup--vide') + '"' +
        ' data-rollup-noeud="' + echapperHtml(n.id) + '"' +
        ' title="' + (total
            ? 'Somme des durées de son contenu'
            : 'Aucune durée estimée dans son contenu') + '">' +
        texteRollup(total) +
        '</span>';
}

/**
 * Rafraîchit les compteurs de TOUS les ancêtres d'un nœud, sans reconstruire le
 * DOM. C'est la seule logique neuve du lot : le rollup n'existait qu'à deux
 * endroits recalculés à l'ouverture (l'Inspecteur, le planificateur) ; dans
 * l'en-tête d'un nœud il devient permanent, donc taper une durée sur une
 * activité doit remonter la chaîne activité → leçon → séquence.
 *
 * On remonte par `parent` plutôt que de tout re-rendre : reconstruire le DOM à
 * chaque frappe ferait perdre le focus de l'input qu'on est en train de remplir.
 */
function rafraichirRollupsAncetres(noeudId) {
    var vus = new Set();
    var courant = etat.noeuds.get(noeudId);
    while (courant && courant.parent && !vus.has(courant.parent)) {
        vus.add(courant.parent);
        var parent = etat.noeuds.get(courant.parent);
        if (!parent) break;
        var el = document.getElementById(parent.id);
        var cible = el && el.querySelector('[data-rollup-noeud]');
        if (cible) {
            var total = dureeRollupNoeud(parent);
            // `textContent` et non `innerHTML` : le total est un nombre, mais
            // un point d'injection qu'on peut supprimer vaut mieux qu'un point
            // d'injection qu'on annote comme sûr.
            cible.textContent = texteRollup(total);
            cible.classList.toggle('planif-noeud-rollup--vide', !total);
        }
        courant = parent;
    }
}

function selecteurSemaineHTML(n) {
    if (!n || (n.type !== 'lecon' && n.type !== 'sequence')) return '';
    var courante = null;
    if (n.type === 'lecon') {
        courante = semaineDeLecon(n);
    } else {
        var e = etendueTemporelle(n);
        courante = e ? e.debut : null;
    }
    var estSeq = n.type === 'sequence';
    return '<select class="planif-noeud-semaine" data-semaine-noeud="' + echapperHtml(n.id) + '"' +
        ' title="' + (estSeq
            ? 'Semaine de début — déplace toute la séquence'
            : 'Semaine de cette leçon') + '"' +
        ' aria-label="' + (estSeq ? 'Semaine de début de la séquence' : 'Semaine de la leçon') + '">' +
        '<option value="' + (courante === null ? '' : courante) + '" selected>' +
        (courante === null ? '—' : 'S' + courante) + '</option>' +
        '</select>';
}

/**
 * Sélecteur de rang, à côté de celui de la semaine. Même rendu PARESSEUX :
 * une seule option au rendu du bloc, la liste au premier contact.
 *
 * ⚠ SÉCURITÉ — `rangSeanceDeLecon` coerce par `parseInt` et borne. Ce n'est
 * pas cosmétique : `metadata.rangSeance` est une donnée PERSISTÉE qui peut
 * venir d'un import (bibliothèque d'alignements, reprise inter-trimestre).
 * Sans coercition, une valeur non numérique sortirait dans l'attribut
 * `value=`, et la CSP ne protège pas l'injection d'attributs. Même invariant
 * que `metadata.duree` — cf. `sentinelle-inspecteur-duree-coercition`.
 */
function selecteurRangSeanceHTML(n) {
    if (!n || n.type !== 'lecon') return '';
    var courant = rangSeanceDeLecon(n);
    return '<select class="planif-noeud-seance" data-seance-noeud="' + echapperHtml(n.id) + '"' +
        ' title="Rang de cette leçon dans sa semaine (A = 1re rencontre)"' +
        ' aria-label="Rang de la leçon dans la semaine">' +
        '<option value="' + (courant === null ? '' : courant) + '" selected>' +
        (courant === null ? '—' : lettreRangSeance(courant)) + '</option>' +
        '</select>';
}

/** Peuple la liste au premier contact. Idempotent. */
function peuplerSelecteurRangSeance(select) {
    if (!select || select.dataset.peuple === '1') return;
    var courant = select.value;

    // Construit en DOM, comme la semaine : pas d'`innerHTML` concaténé.
    select.textContent = '';
    var vide = document.createElement('option');
    vide.value = '';
    vide.textContent = '—';
    select.appendChild(vide);

    for (var r = 1; r <= RANG_SEANCE_MAX; r++) {
        var opt = document.createElement('option');
        opt.value = String(r);
        opt.textContent = lettreRangSeance(r);
        select.appendChild(opt);
    }
    select.value = courant;
    select.dataset.peuple = '1';
}

// #150 (8 août 2026) — le bloc porte son propre sélecteur de semaine, et une
// écriture venue de l'INSPECTEUR ne le rafraîchissait pas : la valeur était
// bien sauvegardée, mais la feuille du canevas ne bougeait pas (l'inverse,
// bloc → inspecteur, passait par reconstruireDOM et marchait). On ne peut ni
// reconstruire le DOM ici (le handler de l'inspecteur est sur `input` : une
// reconstruction pendant la frappe détruirait le focus du champ), ni poser
// `.value` à l'aveugle (la liste est peuplée PARESSEUSEMENT — avant le premier
// contact le <select> n'a qu'une option). On le ramène donc à son état de
// premier rendu : une option unique qui reflète la donnée, et la liste se
// repeuplera au prochain contact.
function synchroniserSelecteurSemaine(noeudId) {
    var el = document.getElementById(noeudId);
    if (!el) return;
    var select = el.querySelector('.planif-noeud-semaine');
    if (!select) return;
    var n = etat.noeuds.get(noeudId);
    if (!n) return;
    var courante;
    if (n.type === 'lecon') {
        courante = semaineDeLecon(n);
    } else {
        var e = etendueTemporelle(n);
        courante = e ? e.debut : null;
    }
    select.textContent = '';
    var opt = document.createElement('option');
    opt.value = courante === null ? '' : String(courante);
    opt.textContent = courante === null ? '—' : 'S' + courante;
    opt.selected = true;
    select.appendChild(opt);
    delete select.dataset.peuple;
}

/** Peuple la liste au premier contact. Idempotent. */
function peuplerSelecteurSemaine(select) {
    if (!select || select.dataset.peuple === '1') return;
    var courant = select.value;
    var cadre = cadreSemainesGrille(deriverRangeesGrille().rangees);
    var nums = Array.from(cadre).sort(function(a, b) { return a - b; });

    // Construit en DOM : aucune donnée d'enseignant ici, mais `innerHTML` sur
    // une chaîne concaténée serait signalé par l'audit statique — et le DOM est
    // de toute façon plus clair pour une liste d'options.
    select.textContent = '';
    var vide = document.createElement('option');
    vide.value = '';
    vide.textContent = '—';
    select.appendChild(vide);

    if (nums.length === 0) {
        var aucune = document.createElement('option');
        aucune.value = '';
        aucune.disabled = true;
        aucune.textContent = 'Configure le Cadre du trimestre';
        select.appendChild(aucune);
    }

    for (var i = 0; i < nums.length; i++) {
        var opt = document.createElement('option');
        opt.value = String(nums[i]);
        opt.textContent = 'S' + nums[i];
        select.appendChild(opt);
    }
    select.value = courant;
    select.dataset.peuple = '1';
}

// === NETTOYAGE DES REPÈRES DE SEMAINE DANS LES TITRES (7 août 2026) ===
//
// Tant que la semaine n'avait pas de logement visible, l'enseignant l'écrivait
// dans ses titres : « Sem. 11 – «Kanatuut» : … ». Depuis le sélecteur (1.51.0)
// le repère est redondant — mais c'est SA donnée, pas notre rendu.
//
// ⚠ RIEN N'EST APPLIQUÉ D'OFFICE. La migration d'ancrage du 6 août a refusé de
// LIRE la semaine dans les titres, au motif qu'interpréter produit des ancrages
// faux indiscernables de vrais. La réciproque tient : on ne réécrit pas les
// titres de l'enseignant depuis un champ. On PROPOSE, avec aperçu, et il
// tranche cas par cas.
//
// ⚠ LE REPÈRE DE SÉANCE EST TRAITÉ DEPUIS LE #416 LOT E (12 août 2026). Il ne
// l'était pas : « la séance n'a pas de logement dans le modèle », donc retirer
// « séance 2 » d'un titre aurait fait perdre l'information. Le lot A lui a
// donné ce logement (`metadata.rangSeance`), et le report tombe.
//
// ⚠⚠ MAIS LA RÉCIPROQUE DE LA RÈGLE DU 6 AOÛT TIENT, ET ELLE COMMANDE : on ne
// LIT JAMAIS le rang depuis le titre pour le poser d'office. Le repère n'est
// retirable que si un rang est DÉJÀ posé dans le modèle ET qu'il concorde avec
// ce que le titre annonce. Un titre qui dit « séance 2 » sur une leçon sans
// rang reste intact : c'est peut-être la seule trace de l'intention.

var RE_REPERE_SEMAINE = /^\s*sem(?:aine)?\s*\.?\s*(\d{1,2})\s*(?:[-–—:.·]+\s*)?/i;
var RE_REPERE_SEANCE = /s[ée]ance\s*(\d+)/i;

/**
 * Analyse le titre d'un nœud à la recherche d'un repère de semaine.
 * Fonction PURE : elle ne lit et n'écrit aucun stockage.
 *
 * @returns {Object|null} null si le titre ne porte pas de repère, sinon
 *   `{ id, titre, titreNettoye, semaineTitre, semaineAncree, categorie, aRepereSeance }`
 *   où `categorie` vaut :
 *     'pret'     — le repère CONCORDE avec la semaine ancrée : retrait sûr ;
 *     'ancrable' — repère présent, leçon NON ancrée : proposer d'ancrer puis
 *                  de retirer (l'enseignant confirme — ce n'est pas une
 *                  déduction silencieuse) ;
 *     'conflit'  — le repère CONTREDIT la semaine ancrée : ne rien toucher,
 *                  seul lui sait laquelle fait foi ;
 *     'vide'     — retirer le repère ne laisserait rien de signifiant
 *                  (titre vide, ou réduit à un repère de séance).
 */
function analyserRepereTitre(n) {
    if (!n || (n.type !== 'lecon' && n.type !== 'sequence')) return null;
    var titre = String(n.titre || '');
    var m = RE_REPERE_SEMAINE.exec(titre);
    if (!m) return null;

    var semaineTitre = parseInt(m[1], 10);
    if (isNaN(semaineTitre) || semaineTitre < SEMAINE_MIN) return null;

    var reste = titre.slice(m[0].length).trim();

    // #416 lot E — le repère de séance, et à quelle condition il part.
    var mSeance = RE_REPERE_SEANCE.exec(titre);
    var rangTitre = mSeance ? parseInt(mSeance[1], 10) : null;
    var aRepereSeance = mSeance !== null;
    var rangAncre = n.type === 'lecon' ? rangSeanceDeLecon(n) : null;

    // ⚠ TROIS CONDITIONS, ET AUCUNE N'EST FACULTATIVE : le titre porte un rang,
    // le MODÈLE en porte un aussi, et les deux disent la même chose. Il ne
    // suffit pas qu'un rang existe quelque part — deux rangs qui se
    // contredisent, c'est un désaccord dont seul l'enseignant sait l'issue.
    var seanceRetirable = rangTitre !== null && rangAncre !== null && rangTitre === rangAncre;

    // Le repère de séance ne part QUE s'il est retirable ; sinon il reste dans
    // le titre nettoyé, comme avant le lot E.
    if (seanceRetirable) {
        reste = reste.replace(RE_REPERE_SEANCE, '').replace(/^\s*[-–—:.·]+\s*/, '').trim();
    }

    // Une séquence n'a pas de semaine à elle : son étendue est dérivée.
    var semaineAncree = n.type === 'lecon' ? semaineDeLecon(n) : null;
    if (n.type === 'sequence') {
        var e = etendueTemporelle(n);
        semaineAncree = e ? e.debut : null;
    }

    var categorie;
    // Le titre ne doit JAMAIS devenir vide ou réduit à un repère orphelin :
    // « Sem. 1 séance 2 » deviendrait « séance 2 », qui ne nomme rien.
    //
    // ⚠ Cette catégorie a MAIGRI au lot E, et c'est ce que le lot devait
    // produire. « Sem. 3 séance 2 — L'incipit » y tombait : le reste commençait
    // par un repère orphelin. Le repère de séance partant désormais avec la
    // semaine (quand le rang est ancré et concorde), le reste est « L'incipit »
    // et la leçon devient traitable. Ce qui reste dans « vide » y est pour la
    // bonne raison : retirer laisserait un titre qui ne nomme plus rien.
    if (reste === '' || RE_REPERE_SEANCE.test(reste) && reste.replace(RE_REPERE_SEANCE, '').trim() === '') {
        categorie = 'vide';
    } else if (semaineAncree === null) {
        categorie = 'ancrable';
    } else if (semaineAncree === semaineTitre) {
        categorie = 'pret';
    } else {
        categorie = 'conflit';
    }

    return {
        id: n.id,
        type: n.type,
        titre: titre,
        titreNettoye: reste,
        semaineTitre: semaineTitre,
        semaineAncree: semaineAncree,
        categorie: categorie,
        aRepereSeance: aRepereSeance,
        // #416 lot E — de quoi expliquer À L'ÉCRAN pourquoi un repère de séance
        // part ou reste, sans que l'appelant ait à refaire l'analyse.
        rangTitre: rangTitre,
        rangAncre: rangAncre,
        seanceRetirable: seanceRetirable
    };
}

/** Tous les repères de la carte, triés par catégorie. Lecture pure. */
function inventaireReperesTitres() {
    var res = { pret: [], ancrable: [], conflit: [], vide: [] };
    for (var entry of etat.noeuds) {
        var a = analyserRepereTitre(entry[1]);
        if (a) res[a.categorie].push(a);
    }
    return res;
}

/**
 * Applique le retrait sur UN nœud. Ne touche jamais à une catégorie que
 * l'enseignant n'a pas choisie : l'appelant filtre en amont.
 * @returns {boolean} true si le titre a changé
 */
function retirerRepereTitre(noeudId, ancrerAussi) {
    var n = etat.noeuds.get(noeudId);
    if (!n) return false;
    var a = analyserRepereTitre(n);
    if (!a || a.categorie === 'conflit' || a.categorie === 'vide') return false;

    if (ancrerAussi && a.categorie === 'ancrable' && n.type === 'lecon') {
        definirSemaineLecon(noeudId, a.semaineTitre);
    }
    n.titre = a.titreNettoye;
    propagerModification(noeudId, 'titre', a.titreNettoye);
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
    // Déroulement — ce qui occupe le temps de classe, prof ET élève
    // « Exposé » (8 août 2026, décision Grégoire) : il manquait un nœud pour
    // dire « j'enseigne ». La famille était entièrement tournée vers l'ÉLÈVE
    // qui agit (Activité, Soutien, Révision), et l'enseignant n'apparaissait
    // que dans l'enseignement explicite — donc à l'intérieur d'UNE méthode.
    // Qui ne la pratique pas n'avait aucun moyen de se mettre lui-même dans sa
    // leçon, ni d'y compter son temps de parole.
    // ⚠ Ce n'est PAS un substitut aux cinq nœuds d'EE, c'en est le complément :
    // qui pratique la méthode pose une Ouverture et une Modélisation ; qui
    // expose hors méthode pose un Exposé. (Réserve instruite puis écartée par
    // Grégoire : non, l'enseignement du déclaratif ne se fait pas qu'en amorce
    // de leçon — il a lieu à tout moment.)
    'expose':         { label: 'Exposé',            couleur: 'var(--planif-couleur-expose)' },
    'activite':       { label: 'Activité',          couleur: 'var(--planif-couleur-activite)' },
    'soutien':        { label: 'Soutien',           couleur: 'var(--planif-couleur-soutien)' },
    'revision':       { label: 'Révision',          couleur: 'var(--planif-couleur-revision)' },
    // Enseignement explicite (7 août 2026, décision Grégoire) : les CINQ étapes
    // de la méthode deviennent des nœuds, FRÈRES D'ACTIVITÉ — mêmes contenants,
    // même durée, mêmes liens. L'ancienne UI d'étapes du Plan de la leçon est
    // RETIRÉE (suppression franche actée) : le concept entre dans le modèle au
    // lieu d'être compensé par un formulaire — même mouvement que la semaine
    // (#410) et les objectifs (F1).
    'ouverture':         { label: 'Ouverture',         couleur: 'var(--planif-couleur-ouverture)' },
    'modelisation':      { label: 'Modélisation',      couleur: 'var(--planif-couleur-modelisation)' },
    'pratique-guidee':   { label: 'Pratique guidée',   couleur: 'var(--planif-couleur-pratique-guidee)' },
    'pratique-autonome': { label: 'Pratique autonome', couleur: 'var(--planif-couleur-pratique-autonome)' },
    'cloture':           { label: 'Clôture',           couleur: 'var(--planif-couleur-cloture)' },
    // Évaluation
    'evaluation':     { label: 'Évaluation',        couleur: 'var(--planif-couleur-evaluation)' }
};

// Options de rétroaction — CONSTANTE UNIQUE (portage #424, 8 août 2026).
// La liste vivait en dur à trois endroits (deux ici, un dans organisateur.js) :
// le prochain ajout d'option se serait fait à deux endroits sur trois. Les
// copies internes sont rabattues ici ; celle de l'Organisateur est partie
// avec la page (#424 Lot G). Exportée : le générateur d'export en résout les libellés.
const RETROACTIONS = [
    ['aucune', 'Aucune'],
    ['orale', 'Orale'],
    ['ecrite', 'Écrite'],
    ['pairs', 'Par les pairs']
];

// Le sélecteur de rétroaction de l'Inspecteur — DEUX libellés, une fabrique
// (#424 Lot E, décision D2b option 2) : « Rétroaction formative » sur une
// activité, « Rétroaction sur le rendu » sur une évaluation. Libellés
// statiques, valeurs de RETROACTIONS : rien à échapper.
function selecteurRetroactionHTML(libelle, valeurCourante) {
    var val = valeurCourante || 'aucune';
    var html = '<label for="planif-panneau-retroaction">' + libelle + '</label>' +
        '<select id="planif-panneau-retroaction">';
    for (var ri = 0; ri < RETROACTIONS.length; ri++) {
        html += '<option value="' + RETROACTIONS[ri][0] + '"' +
            (val === RETROACTIONS[ri][0] ? ' selected' : '') + '>' + RETROACTIONS[ri][1] + '</option>';
    }
    return html + '</select>';
}

// Porte d'écriture UNIQUE de metadata.retroaction (#424 Lot E). « aucune »
// RETIRE le champ : un défaut n'est pas un rattachement — même règle que le
// relevé D1, qui ne comptait pas les 'aucune' comme des données.
function appliquerRetroactionNoeud(donnees, valeur) {
    if (!donnees.metadata) donnees.metadata = {};
    if (!valeur || valeur === 'aucune') delete donnees.metadata.retroaction;
    else donnees.metadata.retroaction = valeur;
}

const TYPES_LIENS = [
    { id: 'se_decline_en',        label: 'se décline en' },
    { id: 'se_concretise_dans',   label: 'se concrétise dans' },
    { id: 's_acquiert_par',       label: "s'acquiert par" },
    // « se réactive dans » (15 août 2026, demande de Grégoire). Il PORTE une
    // distinction que la carte avait perdue : acquérir et réactiver ne sont
    // pas le même geste. Une Ouverture qui rappelle les concepts de la leçon
    // précédente ne les fait pas acquérir — ils sont déjà là.
    // ⮕ Cette distinction a EXISTÉ puis a été fondue : `VERBES_COMPAT` porte
    // encore `'revise_dans' → 's_acquiert_par'`. On la rétablit.
    { id: 'se_reactive_dans',     label: 'se réactive dans' },
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
    'conceptuelle>activite':       { verbe: 's_acquiert_par' },
    'conceptuelle>soutien':        { verbe: 's_acquiert_par' },
    'procedurale>activite':        { verbe: 's_acquiert_par' },
    'procedurale>soutien':         { verbe: 's_acquiert_par' },
    'metacognitive>activite':      { verbe: 's_acquiert_par' },
    'metacognitive>soutien':       { verbe: 's_acquiert_par' },
    // ⚠ LES HUIT PAIRES « connaissance ↔ révision » ONT ÉTÉ RETIRÉES d'ici le
    // 15 août 2026, sur décision de Grégoire. Elles disaient « s'acquiert
    // par » ; une Révision est de la pratique RÉPARTIE sur un acquis, pas une
    // première rencontre. La règle `TYPES_REACTIVATION` les remplace, plus bas.
    // ⮕ RETIRÉES, et pas laissées à côté : la table brute est consultée en
    // PREMIER, donc les garder aurait rendu la règle sans effet — le genre de
    // changement qui a l'air fait et ne fait rien. Les deux paires
    // « révision ↔ évaluation » restent : une révision SE VÉRIFIE bien par une
    // évaluation, ce verbe-là n'a jamais été en cause.
    'activite>factuelle':          { verbe: 's_acquiert_par', inverser: true },
    'activite>conceptuelle':       { verbe: 's_acquiert_par', inverser: true },
    'activite>procedurale':        { verbe: 's_acquiert_par', inverser: true },
    'activite>metacognitive':      { verbe: 's_acquiert_par', inverser: true },
    'soutien>factuelle':           { verbe: 's_acquiert_par', inverser: true },
    'soutien>conceptuelle':        { verbe: 's_acquiert_par', inverser: true },
    'soutien>procedurale':         { verbe: 's_acquiert_par', inverser: true },
    'soutien>metacognitive':       { verbe: 's_acquiert_par', inverser: true },
    // ⚠ LES SEIZE PAIRES « …>evaluation » (se vérifie par) SONT RETIRÉES le
    // 27 sept. 2026 (#964, décision didactique de Grégoire) : une évaluation se
    // relie UNIQUEMENT à des objectifs, cochés dans son Inspecteur. Tracer vers
    // une évaluation est donc refusé, avec un message qui oriente vers ce geste
    // (`afficherMenuLien`). Le repli sur la famille (étape 1 bis de
    // `resoudreVerbe`) n'en retrouve aucune : il ne consulte que cette table.
    // ⮕ CE QUI N'EST PAS RETIRÉ, et ne doit pas l'être : l'entrée
    // `se_verifie_par` de `TYPES_LIENS` et ses correspondances de
    // `VERBES_COMPAT`. Les liens déjà tracés restent stockés, affichés et
    // comptés (non négociable, consigne du lot).
};

// Groupes de types pour normalisation (verbes horizontaux)
var TYPES_CONNAISSANCE = ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive'];

/**
 * CE QUI RÉACTIVE UN ACQUIS PLUTÔT QUE DE LE FAIRE ACQUÉRIR (15 août 2026).
 *
 * Constat terrain de Grégoire : « comme j'ai en Ouverture une révision de
 * concepts de la leçon précédente, il faudrait revoir le verbe ». Une
 * connaissance reliée à une Ouverture recevait « s'acquiert par », c'est-à-dire
 * le verbe de l'acquisition INITIALE — alors que la connaissance est déjà
 * acquise et qu'on la remet en service.
 *
 * ⚠ POURQUOI UNE LISTE ET NON DES PAIRES ÉCRITES À LA MAIN. Le repli sur la
 * famille (#415, 8 août) écrase les cinq étapes d'enseignement explicite en un
 * seul « activite » : `conceptuelle>ouverture` retombait donc sur
 * `conceptuelle>activite`. Écrire les 16 paires manquantes serait de
 * l'empilement — et il faudrait recommencer au type suivant. Une liste nommée,
 * consultée AVANT le repli, dit la règle une seule fois.
 *
 * ▣ « révision » Y FIGURE depuis le 15 août, sur décision de Grégoire. Le type
 * « Révision et réutilisation » a exactement la même nature : des occasions de
 * pratique réparties sur un acquis, pas une première rencontre.
 * ⚠ Il a fallu RETIRER les huit paires `connaissance ↔ révision` de
 * `VERBES_AUTO` pour que cette ligne serve à quelque chose.
 *
 * ⚠ ET UNE OUVERTURE NE RÉACTIVE PAS TOUJOURS : elle introduit parfois du
 * neuf. C'est donc un DÉFAUT, pas une vérité — ce qui le rend acceptable,
 * c'est que le menu du lien offre désormais tous les verbes (même date) :
 * l'utilisateur corrige d'un clic au lieu d'être bloqué.
 */
var TYPES_REACTIVATION = ['ouverture', 'revision'];
// « Frère d'Activité » se définit ICI et nulle part ailleurs : tout site qui
// énumérait le triplet en dur a été rabattu sur cette liste (7 août 2026) —
// sans quoi chaque nouveau frère devait retrouver tous les triplets.
var TYPES_ACTIVITE = ['expose', 'activite', 'soutien', 'revision',
    'ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture'];

/**
 * LES CINQ PHASES DE L'ENSEIGNEMENT EXPLICITE — et seulement elles.
 *
 * Besoin de Grégoire, 15 août : « quand je monte un alignement, il serait
 * pratique de pouvoir changer de phase d'enseignement sans nécessairement
 * créer un nouveau bloc et y coller le contenu ».
 *
 * ▣ POURQUOI CETTE BASCULE EST SÛRE, ET POURQUOI ELLE S'ARRÊTE ICI. Les cinq
 * phases sont sœurs par construction (décision du 7 août : « FRÈRES
 * D'ACTIVITÉ — mêmes contenants, même durée, mêmes liens »), et les trois
 * tables du module le confirment : elles sont toutes dans `TYPES_ACTIVITE`,
 * toutes dans `TYPES_AVEC_DUREE`, toutes dans `TYPES_SERVANTS_OBJECTIF`.
 * Passer de l'une à l'autre ne peut donc ni perdre une durée, ni orpheliner un
 * objectif servi, ni rendre un parent illégal.
 *
 * ⚠ CE N'EST PAS VRAI DE LA FAMILLE ENTIÈRE. `TYPES_ACTIVITE` contient aussi
 * Exposé, Activité, Soutien et Révision — techniquement interchangeables, mais
 * passer de « pratique autonome » à « exposé » n'est plus un changement de
 * PHASE, c'est un changement de NATURE. Bornage décidé par Grégoire le 15 août.
 *
 * ⏳ Une conséquence assumée : les VERBES des liens déjà tracés ne sont pas
 * réécrits. `resoudreVerbe` suggère selon le type, mais un verbe posé est une
 * donnée de l'enseignant — le réécrire en douce à chaque bascule serait pire
 * que de le laisser inexact. Cas concret : « se réactive dans » se suggère sur
 * une Ouverture ; devenue Pratique guidée, le lien garde son verbe jusqu'à ce
 * que Grégoire le change. Rien n'est cassé (les deux types sont des activités,
 * donc tous les liens restent structurellement valides), seule la suggestion
 * diverge.
 */
var PHASES_EE = ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture'];

function estPhaseEE(type) {
    return PHASES_EE.indexOf(type) !== -1;
}

/**
 * Les frères d'Activité qui ne sont PAS des phases de méthode.
 * ⚠ DÉRIVÉ de `TYPES_ACTIVITE`, jamais réécrit à la main : « frère d'activité »
 * se définit à un seul endroit (règle posée le 7 août). Un frère ajouté là-bas
 * rejoint cette famille tout seul ; recopier le quatuor ici le ferait manquer.
 */
var TYPES_DEROULEMENT = TYPES_ACTIVITE.filter(function(t) { return !estPhaseEE(t); });

/** L'intention curriculaire — les deux nœuds du « pourquoi ». */
var TYPES_INTENTION = ['competence', 'idee-maitresse'];

/**
 * LES FAMILLES PERMUTABLES — dans quelle liste un bloc peut-il changer de type
 * sans quitter sa nature (16 août 2026, demande de Grégoire).
 *
 * ▣ CE QUI EST GÉNÉRALISÉ, ET POURQUOI C'EST SÛR. Le sélecteur de phase du
 * 15 août était borné aux cinq étapes parce que les cinq sont sœurs par
 * construction. Grégoire demande le même geste pour tous les types ; la
 * question n'est donc plus « est-ce une phase ? » mais « ces deux types
 * répondent-ils pareil à toutes les tables du module ? ».
 *
 * ⮕ VÉRIFIÉ TABLE PAR TABLE, et c'est ce qui borne les familles ci-dessous :
 * `TYPES_AVEC_DUREE`, `TYPES_HORS_CLASSE`, `TYPES_AVEC_NIVEAU_COGNITIF`,
 * `TYPES_SERVANTS_OBJECTIF`, `TYPES_PREALABLE` et la règle de parent légal
 * (`accepteEnfant`) répondent TOUTES de façon uniforme à l'intérieur de chacune
 * des quatre familles. Une permutation ne peut donc ni perdre une durée, ni
 * orpheliner un objectif servi, ni rendre un parent illégal.
 *
 * ⚠ UNE SEULE TABLE N'EST PAS UNIFORME : `normaliserType`, qui résout les
 * VERBES des liens. Compétence et Idée maîtresse s'y résolvent chacune sur
 * elle-même, et `TYPES_REACTIVATION` ne contient qu'Ouverture et Révision. Une
 * permutation peut donc laisser un lien porter un verbe que le nouveau type ne
 * suggérerait plus. Le verbe n'est PAS réécrit — c'est une donnée de
 * l'enseignant — mais le changement est DIT (`signalerVerbesDevenusInexacts`,
 * verdict 3.4 de Grégoire, porte terrain du 16 août).
 *
 * ⚠ CE QUI N'A DÉLIBÉRÉMENT PAS DE FAMILLE :
 * - **Séquence et Leçon** : une leçon porte une semaine, un rang de séance et
 *   des objectifs qu'une séquence n'a pas. Permuter orphelinerait ces données.
 *   « Elles ne sont pas intervertibles » — Grégoire, 16 août. Libellé inerte.
 * - **Évaluation** : elle est seule de son type. Sa nuance formative /
 *   certificative est un MODIFICATEUR (`metadata.visee`), pas un type — voir
 *   `VISEES_EVALUATION`. C'est ce qui préserve le pont vers les productions.
 */
var FAMILLES_PERMUTABLES = [TYPES_INTENTION, TYPES_CONNAISSANCE, TYPES_DEROULEMENT, PHASES_EE];

/**
 * LA VISÉE D'UNE ÉVALUATION — formative ou certificative (16 août 2026).
 *
 * ⚠⚠ POURQUOI UN MODIFICATEUR ET NON DEUX TYPES. Grégoire a demandé deux
 * entrées au menu de l'en-tête. Deux TYPES auraient été la lecture naïve de sa
 * demande, et elle casse trois choses mesurées avant d'écrire une ligne :
 *
 * 1. `evaluation` est le SEUL type qui porte `metadata.productionId` — le pont
 *    entre la carte et les vraies productions du Codex. La moisson de `main.js`
 *    cherche « le nœud Évaluation unique de la leçon » : deux types nommés
 *    autrement, et elle n'en trouve plus aucun, EN SILENCE.
 * 2. `planification-export.js` classe par `type === 'evaluation'` — marqueur ◆,
 *    section Évaluation, colonnes pondération et échéance, agrégation du
 *    sommaire.
 * 3. `evaluerObjectif` coche un objectif comme « vérifié » via ce type.
 *
 * ⮕ Le projet a déjà le patron : `metadata.prealable` et `metadata.retroaction`
 * sont des nuances posées À CÔTÉ du type. La visée en est une de plus. Le menu
 * de l'en-tête est identique à l'écran, et les trois mécanismes ci-dessus
 * continuent de fonctionner sans être touchés.
 *
 * ▣ TROIS ÉTATS EN MÉMOIRE, DEUX ENTRÉES AU MENU — et cet écart est délibéré.
 * Le champ absent ne veut pas dire « certificative », il veut dire « Grégoire
 * ne s'est pas encore prononcé ». La distinction compte parce que le libellé
 * part dans son PLAN DE COURS : écrire « Évaluation certificative » sur un bloc
 * qu'il n'a jamais qualifié mettrait dans un document destiné à ses étudiants
 * une affirmation qu'il n'a pas faite.
 * ⮕ Tant qu'il n'a rien choisi, l'export dit « Évaluation », comme avant. Le
 * menu, lui, doit bien afficher quelque chose : il montre « Certificative »,
 * qui est le comportement effectif. Dès qu'il touche au menu, le choix est
 * ÉCRIT — y compris « certificative ».
 *
 * ⚠ C'EST UN ÉCART ASSUMÉ À L'IDIOME DU MODULE. `appliquerRetroactionNoeud`
 * RETIRE le champ quand la valeur vaut le défaut (« un défaut n'est pas un
 * rattachement »). Ici, « il a choisi certificative » et « il n'a rien choisi »
 * ne produisent pas le même document : l'un est une donnée, l'autre une
 * absence. Le raccourci coûterait la différence.
 *
 * ⮕ Conséquence heureuse et mesurée : le golden master des exports (#416) et la
 * sentinelle de granularité restent VERTS sans être retouchés. Une conception
 * qui n'oblige pas à refiger un golden master est une conception qui ne change
 * rien à ce que Grégoire reçoit — c'est le contrôle, pas la commodité.
 *
 * ▣ DEUX LIBELLÉS, ET C'EST VOULU. Le menu de l'en-tête dit « Formative » /
 * « Certificative » ; `obtenirLabelNoeud` (Inspecteur, exports, recherche) dit
 * « Évaluation formative » / « Évaluation certificative ». La leçon de la porte
 * 2.7 est que deux libellés de même couleur qui se tronquent deviennent
 * indiscernables — or « Évaluation certificative » fait 24 caractères, contre
 * 17 pour « Pratique autonome » qui passait déjà à la ligne. Tronqués à huit
 * lettres, « FORMATIVE » et « CERTIFICAT… » restent distincts.
 *
 * ⚠ Décision de Grégoire, 16 août : une évaluation formative VÉRIFIE un
 * objectif au même titre qu'une certificative. `evaluerObjectif` n'est donc pas
 * touchée — sa carte se lit demain comme elle se lit aujourd'hui.
 */
var VISEES_EVALUATION = [
    ['certificative', 'Certificative', 'Évaluation certificative'],
    ['formative',     'Formative',     'Évaluation formative']
];

/**
 * Ce que Grégoire a RÉELLEMENT choisi — null tant qu'il ne s'est pas prononcé.
 * C'est cette lecture-ci qui commande le libellé des exports.
 */
function viseeChoisie(donnees) {
    var v = donnees && donnees.metadata && donnees.metadata.visee;
    return (v === 'formative' || v === 'certificative') ? v : null;
}

/**
 * Ce que le MENU affiche — jamais null : sans choix, le comportement effectif
 * est « certificative », et un `<select>` doit bien montrer une entrée.
 */
function viseeEvaluation(donnees) {
    return viseeChoisie(donnees) || 'certificative';
}

/**
 * Écriture — porte de sortie UNIQUE de la visée.
 * ⚠ La comparaison porte sur `viseeChoisie` et NON sur `viseeEvaluation` :
 * sur un bloc jamais qualifié, choisir « certificative » doit ÉCRIRE le champ.
 * Comparer la valeur affichée refuserait ce geste en silence, et le libellé de
 * l'export ne se préciserait jamais.
 * @returns {boolean} true si le nœud existait et a changé de visée
 */
function definirViseeEvaluation(noeudId, visee) {
    var n = etat.noeuds.get(noeudId);
    if (!n || n.type !== 'evaluation') return false;
    if (visee !== 'formative' && visee !== 'certificative') return false;
    if (viseeChoisie(n) === visee) return false;
    enregistrerPourUndo();
    if (!n.metadata) n.metadata = {};
    n.metadata.visee = visee;
    // Un clone est une INSTANCE LIÉE : sa visée suit celle de sa source.
    propagerModification(noeudId, 'metadata', n.metadata);
    sauvegarder();
    return true;
}

/** La famille permutable d'un type, ou null s'il n'en a pas. */
function famillePermutableDe(type) {
    for (var fi = 0; fi < FAMILLES_PERMUTABLES.length; fi++) {
        if (FAMILLES_PERMUTABLES[fi].indexOf(type) !== -1) return FAMILLES_PERMUTABLES[fi];
    }
    return null;
}

/**
 * Écriture — porte de sortie UNIQUE du type d'un nœud (même patron que
 * `definirSemaineLecon` et `definirObjectifsLecon`).
 * Refuse toute permutation qui sort de la famille : la borne est DANS la porte,
 * pas seulement dans l'interface qui l'appelle.
 * @returns {boolean} true si le nœud existait et a changé de type
 */
function definirTypeNoeud(noeudId, nouveauType) {
    var n = etat.noeuds.get(noeudId);
    if (!n) return false;
    var famille = famillePermutableDe(n.type);
    if (!famille || famille.indexOf(nouveauType) === -1) return false;
    if (n.type === nouveauType) return false;
    enregistrerPourUndo();
    n.type = nouveauType;
    // Un clone est une INSTANCE LIÉE : son type suit celui de sa source, comme
    // son titre et sa durée.
    propagerModification(noeudId, 'type', nouveauType);
    sauvegarder();
    return true;
}

/**
 * Ce qui CONSOMME DU TEMPS DE CLASSE (8 août 2026).
 *
 * ⚠ Liste SÉPARÉE de `TYPES_ACTIVITE`, et non un ajout dedans. Les deux disent
 * des choses différentes : `TYPES_ACTIVITE` répond à « est-ce une tâche
 * d'apprentissage ? » et alimente `normaliserType()`, donc la résolution des
 * verbes de liens. Y glisser `evaluation` ferait retomber
 * `normaliserType('evaluation')` sur `'activite'` et changerait en silence les
 * verbes disponibles pour les paires non couvertes — relier deux évaluations
 * offrirait soudain « complète / conduit à », qui ne donne rien aujourd'hui.
 *
 * Une évaluation occupe une période sans être une activité. Même raisonnement
 * que `TYPES_AVEC_NIVEAU_COGNITIF` plus bas, qui exclut délibérément les cinq
 * étapes de méthode : un prédicat par question, jamais un rabattement forcé.
 *
 * ⚠ Les TYPES DE CONNAISSANCES n'y sont PAS, et c'est une décision (Grégoire,
 * 8 août). Une connaissance ne consomme pas de temps — l'exposé ou l'activité
 * qui la fait acquérir, oui. Lui donner une durée la ferait compter EN PLUS de
 * cette activité dans `dureeRollupNoeud`, qui additionne tous les descendants
 * d'une leçon : le compteur afficherait un total faux sans rien pour le
 * signaler. Et le clonage aggraverait le tout — `propagerModification` recopie
 * la metadata entière vers toutes les instances, or une connaissance est
 * précisément ce qu'on réutilise d'une leçon à l'autre : les trois instances
 * partageraient UNE durée.
 *
 * ⮕ Règle qui arbitre : UNE MINUTE DE CLASSE APPARTIENT À EXACTEMENT UN NŒUD.
 */
var TYPES_AVEC_DUREE = TYPES_ACTIVITE.concat(['evaluation']);

/**
 * Ce qui peut se faire HORS des heures de classe (#416 lot B, D4).
 *
 * ⚠ Liste volontairement IDENTIQUE à `TYPES_AVEC_DUREE`, et pourtant séparée.
 * Les deux répondent à des questions différentes : « ce nœud consomme-t-il du
 * temps ? » et « ce temps est-il du temps de classe ? ». Les fondre ferait
 * qu'ajouter un type à l'une l'ajouterait à l'autre sans que personne ne
 * l'ait décidé. Le CSV de Grégoire met dans cette colonne des remises
 * d'artefacts (évaluations) et du travail de lecture ou de rédaction
 * (activités) — pas des connaissances, qui ne se « font » pas.
 */
var TYPES_HORS_CLASSE = TYPES_ACTIVITE.concat(['evaluation']);

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
// ⚠ Les cinq types d'enseignement explicite N'Y SONT PAS, et c'est délibéré
// (7 août 2026) : le niveau cognitif (Anderson & Krathwohl) qualifie une TÂCHE
// d'apprentissage ; une étape de méthode (Ouverture, Clôture…) n'en a pas.
// Ce n'est donc pas un « triplet en dur » à rabattre sur TYPES_ACTIVITE.
// « expose » y entre (8 août) : un exposé vise un niveau cognitif comme une
// activité — on n'expose pas pour mémoriser comme on expose pour analyser.
// Il ne rejoint donc PAS les cinq étapes de méthode exclues juste au-dessus.
var TYPES_AVEC_NIVEAU_COGNITIF = ['competence', 'idee-maitresse', 'expose', 'activite', 'soutien', 'revision', 'evaluation'];

// #403/#445 — LES TROIS ÉTATS D'UN OBJECTIF, source unique.
//
// ⚠ Ces symboles et ces libellés apparaissent maintenant sur TROIS surfaces :
// la pastille elle-même, la légende de l'Inspecteur de leçon, et la page 5 du
// guide. Deux surfaces qui disent deux vérités, c'est exactement le défaut que
// #443 a mis au jour ailleurs dans l'app — d'où la table unique, déclarée ICI,
// au-dessus de `GUIDE_PAGES` : ce tableau est évalué au chargement et appelle
// la légende, donc les constantes doivent exister avant lui.
var SYMBOLES_PASTILLE_OBJECTIF = { invitation: '!', servi: '⚠', verifie: '✓' };

var LEGENDE_PASTILLES_OBJECTIF = [
    { etat: 'invitation', libelle: 'Aucun bloc ne sert encore cet objectif.' },
    { etat: 'servi', libelle: 'Servi par au moins un bloc, mais aucune évaluation ne le vérifie.' },
    { etat: 'verifie', libelle: 'Servi et vérifié par une évaluation.' }
];

// #965 (27 sept. 2026) — LA PASTILLE D'UNE ÉVALUATION : ce qu'elle vérifie
// a-t-il été enseigné, et AVANT elle ? Symboles et textes validés par Grégoire
// (consigne du lot), reproduits tels quels. Du pire au meilleur : ✕, ⚠, ?, ✓.
// « ? » (28 sept. 2026, décision didactique de Grégoire) : l'application ne peut
// pas trancher. Il remplace le ✓ qu'elle donnait par défaut dans ce cas.
var SYMBOLES_PASTILLE_EVALUATION = { aucun: '!', nonEnseigne: '\u2715', apres: '\u26A0', incertain: '?', avant: '\u2713' };

var LEGENDE_PASTILLES_EVALUATION = [
    { etat: 'aucun', libelle: 'Aucun objectif relié : cette évaluation ne dit pas ce qu\'elle vérifie.' },
    { etat: 'nonEnseigne', libelle: 'Un objectif vérifié n\'est servi par aucun bloc : il n\'a pas été enseigné.' },
    { etat: 'apres', libelle: 'Un objectif vérifié n\'est servi qu\'après cette évaluation.' },
    { etat: 'incertain', libelle: 'Impossible de dire si chaque objectif a été enseigné avant : une leçon n\'a pas encore sa semaine ou sa séance, ou l\'évaluation n\'est dans aucune leçon.' },
    { etat: 'avant', libelle: 'Chaque objectif vérifié a été enseigné avant cette évaluation.' }
];

/**
 * #965 — État de la pastille d'une évaluation. LECTURE SEULE.
 *
 * Pour chaque objectif qu'elle coche (`objectifsVerifiesPar`, #964), on cherche
 * les blocs NON-évaluation qui le servent (`objectifsServisPar`, où qu'ils
 * soient), et l'on juge chacun « avant » ou « après » elle :
 *   - même leçon : l'ORDRE DES BLOCS fait foi, du haut vers le bas (choix de
 *     Grégoire, 27 sept. ; mesuré fiable : `reLayoutConteneur` retrie
 *     `enfants` par position verticale à chaque mise en page) ;
 *   - autre leçon : la semaine, puis le rang de séance ; même séance (deux
 *     leçons au même rang) : « avant », l'ordre n'étant pas connu ;
 *   - une leçon sans semaine, une séance non posée dans la même semaine, une
 *     évaluation ou un bloc hors leçon : on NE CONCLUT PAS, et le cas est
 *     marqué `inconclusif`.
 * Un objectif servi à la fois avant et après compte comme enseigné avant.
 * « ? » (28 sept., décision de Grégoire, préséance tranchée par Cowork) : un
 * objectif est INCERTAIN quand aucun bloc ne le sert sûrement avant et qu'un
 * bloc au moins ne peut pas être situé. Avant : « avant » par défaut, donc ✓.
 * Le pire état l'emporte (✕, puis ⚠, puis ?, puis ✓) ; aucun objectif coché : « ! ».
 * Les liens « se vérifie par » hérités ne créent AUCUN objectif vérifié.
 *
 * @returns {{etat: string, message: string, inconclusif: boolean}}
 */
function evaluerPastilleEvaluation(evaluation) {
    var index = indexObjectifsCarte();
    var objectifs = objectifsVerifiesPar(evaluation, index);
    var libelle = function(etatP) {
        for (var li = 0; li < LEGENDE_PASTILLES_EVALUATION.length; li++) {
            if (LEGENDE_PASTILLES_EVALUATION[li].etat === etatP) return LEGENDE_PASTILLES_EVALUATION[li].libelle;
        }
        return '';
    };
    if (objectifs.length === 0) return { etat: 'aucun', message: libelle('aucun'), inconclusif: false };

    var leconEval = leconParenteDe(evaluation);
    var servants = [];
    for (var entryPE of etat.noeuds) {
        var n = entryPE[1];
        if (n.type === 'evaluation' || TYPES_SERVANTS_OBJECTIF.indexOf(n.type) === -1) continue;
        servants.push({ noeud: n, objectifs: objectifsServisPar(n) });
    }

    var inconclusif = false;
    // 'avant' | 'apres' | 'inconnu' pour un bloc servant, relativement à l'évaluation.
    function position(bloc) {
        var leconBloc = leconParenteDe(bloc);
        if (!leconEval || !leconBloc) { inconclusif = true; return 'inconnu'; }
        if (leconBloc.id === leconEval.id) {
            var ordre = leconEval.enfants || [];
            return ordre.indexOf(bloc.id) < ordre.indexOf(evaluation.id) ? 'avant' : 'apres';
        }
        var sb = semaineDeLecon(leconBloc), se = semaineDeLecon(leconEval);
        if (sb === null || se === null) { inconclusif = true; return 'inconnu'; }
        if (sb !== se) return sb < se ? 'avant' : 'apres';
        var rb = rangSeanceDeLecon(leconBloc), re = rangSeanceDeLecon(leconEval);
        if (rb === null || re === null) { inconclusif = true; return 'inconnu'; }
        return rb <= re ? 'avant' : 'apres';
    }

    var GRAVITE = { avant: 0, incertain: 1, apres: 2, nonEnseigne: 3 };
    var pire = 'avant';
    for (var oi = 0; oi < objectifs.length; oi++) {
        var positions = servants
            .filter(function(sv) { return sv.objectifs.indexOf(objectifs[oi]) !== -1; })
            .map(function(sv) { return position(sv.noeud); });
        var etatObjectif = positions.length === 0 ? 'nonEnseigne'
            : positions.indexOf('avant') !== -1 ? 'avant'
            : positions.indexOf('inconnu') !== -1 ? 'incertain'
            : 'apres';
        if (GRAVITE[etatObjectif] > GRAVITE[pire]) pire = etatObjectif;
    }
    return { etat: pire, message: libelle(pire), inconclusif: inconclusif };
}

/** La pastille, rendue dans l'en-tête du bloc Évaluation (même facture que celle d'un objectif). */
function pastilleEvaluationHTML(n) {
    if (!n || n.type !== 'evaluation') return '';
    var res = evaluerPastilleEvaluation(n);
    // security-ok: res.etat vaut l'une des cinq clés littérales de
    // SYMBOLES_PASTILLE_EVALUATION ; le message est un littéral de ce fichier.
    return '<span class="planif-obj-pastille planif-eval-pastille planif-eval-pastille--' + res.etat + '"' +
           ' title="' + echapperHtml(res.message) + '" aria-label="' + echapperHtml(res.message) + '">' +
           SYMBOLES_PASTILLE_EVALUATION[res.etat] + '</span>';
}

/** Recalcul sur place, branché dans mettreAJourBadge comme celles des objectifs. */
function rafraichirPastilleEvaluation(n) {
    if (!n || n.type !== 'evaluation') return;
    var el = document.getElementById(n.id);
    if (!el) return;
    var p = el.querySelector('.planif-eval-pastille');
    if (!p) return;
    var res = evaluerPastilleEvaluation(n);
    p.className = 'planif-obj-pastille planif-eval-pastille planif-eval-pastille--' + res.etat;
    p.textContent = SYMBOLES_PASTILLE_EVALUATION[res.etat];
    p.title = res.message;
    p.setAttribute('aria-label', res.message);
}

/** Le bloc de l'Inspecteur : titre et légende, tout en littéraux de ce fichier. */
function blocLegendeEvaluationHTML() {
    return '<label>Pastille de l\'évaluation</label>' + legendePastillesEvaluationHTML();
}

function legendePastillesEvaluationHTML() {
    var html = '<div class="planif-legende-pastilles">';
    for (var i = 0; i < LEGENDE_PASTILLES_EVALUATION.length; i++) {
        var e = LEGENDE_PASTILLES_EVALUATION[i];
        // security-ok: états et libellés sont des littéraux de ce fichier.
        html += '<div class="planif-legende-pastille-ligne">' +
            '<span class="planif-obj-pastille planif-eval-pastille planif-eval-pastille--' + e.etat + '">' +
                SYMBOLES_PASTILLE_EVALUATION[e.etat] +
            '</span>' +
            '<span class="planif-legende-pastille-texte">' + e.libelle + '</span>' +
        '</div>';
    }
    return html + '</div>';
}

/**
 * #445 — La légende des pastilles, rendue à l'identique partout.
 *
 * POURQUOI ELLE EXISTE. Le sens des pastilles ne vivait que dans l'attribut
 * `title` : une infobulle au survol. Sur iPad il n'y a pas de survol — le
 * code couleur était donc purement décoratif pour la moitié des usages, et
 * indevinable pour l'autre.
 */
function legendePastillesObjectifHTML() {
    var html = '<div class="planif-legende-pastilles">';
    for (var i = 0; i < LEGENDE_PASTILLES_OBJECTIF.length; i++) {
        var e = LEGENDE_PASTILLES_OBJECTIF[i];
        // security-ok: états et libellés sont des littéraux de ce fichier —
        // aucune donnée utilisateur ne traverse cette fonction.
        html += '<div class="planif-legende-pastille-ligne">' +
            '<span class="planif-obj-pastille planif-obj-pastille--' + e.etat + '">' +
                SYMBOLES_PASTILLE_OBJECTIF[e.etat] +
            '</span>' +
            '<span class="planif-legende-pastille-texte">' + e.libelle + '</span>' +
        '</div>';
    }
    return html + '</div>';
}

// === GUIDE INTÉGRÉ — 8 pages (7 pédagogiques + 1 technique import/export) ===
var GUIDE_PAGES = [
    {
        // #966 (27 sept. 2026) — textes validés par Grégoire, reproduits tels
        // quels (typographie du guide : apostrophes courbes, espaces insécables).
        // Le lien unesdoc est RETIRÉ sur sa demande : il le vérifiera à la main.
        titre: 'Construis ta carte d\u2019alignement',
        contenu:
            '<p>Un principe guide toute la carte\u00a0: tu évalues ce que tu enseignes, et tu enseignes ce que tu évalues, au même niveau d\u2019exigence. C\u2019est ça, l\u2019alignement pédagogique.</p>' +
            '<p>La carte le rend visible sur trois étages\u00a0:</p>' +
            '<ul>' +
                '<li>la <strong>compétence</strong>, ce que le programme exige (Anderson parle d\u2019alignement curriculaire)\u00a0;</li>' +
                '<li>les <strong>idées maîtresses</strong>, l\u2019essentiel autour duquel tu organises ton contenu (Gauthier, Bissonnette et Richard)\u00a0;</li>' +
                '<li>tes <strong>leçons</strong>, où objectifs, activités et évaluations sont reliés par un même verbe (Biggs parle d\u2019alignement constructif).</li>' +
            '</ul>' +
            '<p>Deux chemins mènent à une carte alignée\u00a0: partir de tes objectifs et descendre jusqu\u2019à tes séances, comme le propose ce guide, ou bâtir d\u2019abord tes séances, puis relier et vérifier. La carte vérifie les liens, quel que soit l\u2019ordre dans lequel tu les poses.</p>' +
            '<p>Trois signaux t\u2019aident à vérifier ta carte\u00a0:</p>' +
            '<ul>' +
                '<li>Les <strong>badges</strong> de chaque bloc (gauche\u00a0= ce qui le relie en amont, droite\u00a0= ce qui le relie en aval)\u00a0: <span class="guide-glyphe guide-glyphe--check">\u2713</span> quand le lien est posé (le badge prend la couleur du bloc), <span class="guide-glyphe guide-glyphe--gris">!</span> sur fond gris quand il en manque un.</li>' +
                '<li>Le <span class="guide-glyphe guide-glyphe--warning">\u26A0</span> sur une compétence ou une idée maîtresse\u00a0: aucune évaluation ne vérifie encore un objectif qui s\u2019y rattache.</li>' +
                '<li>Les <strong>pastilles</strong> des objectifs et des évaluations\u00a0: elles disent si ce que tu enseignes est évalué, et si ce que tu évalues a été enseigné avant (pages 5 et 8).</li>' +
            '</ul>' +
            '<p>Ce guide te propose 8\u00a0repères pour construire ta carte et exporter ton plan. Tu peux le consulter à tout moment depuis la palette.</p>' +
            '<p class="planif-guide-ref"><strong>Références\u00a0:</strong><br>' +
                'Anderson, L.\u00a0W. (2026). <em>Curriculum alignment</em> (Educational Practices Series, no\u00a037). International Academy of Education\u00a0; Bureau international d\u2019éducation de l\u2019UNESCO.<br>' +
                'Biggs, J. (2014). Constructive alignment in university teaching. <em>HERDSA Review of Higher Education, 1</em>, 5-22.<br>' +
                'Gauthier, C., Bissonnette, S. et Richard, M. (avec la collaboration de M. Castonguay) (2013). <em>Enseignement explicite et réussite des élèves\u00a0: la gestion des apprentissages</em>. ERPI.</p>'
    },
    {
        titre: 'Commence par le pourquoi',
        contenu:
            '<p class="planif-guide-pourquoi">Chaque cours vise des compétences — c\u2019est ce que l\u2019étudiant sera capable de faire à la fin. Tout le reste de ta carte en découle.</p>' +
            '<ol>' +
                '<li>Glisse un élément <span class="planif-guide-type" style="background:var(--planif-couleur-competence)"></span> <strong>Compétence</strong> de la palette sur le canevas.</li>' +
                '<li>Double-clique dessus pour écrire l\u2019énoncé de compétence.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Sélectionne la compétence et utilise le <strong>sélecteur de niveau cognitif</strong> dans l\u2019<strong>Inspecteur</strong> (panneau de droite) pour choisir le niveau visé (ex.\u00a0: Analyser, Créer). Les verbes suggérés t\u2019aideront à formuler ton énoncé.</div>' +
            // #966 — ligne ajoutée, texte validé par Grégoire (27 sept. 2026).
            '<p>Ces niveaux sont les processus cognitifs de la taxonomie révisée d\u2019Anderson et Krathwohl, du plus simple au plus exigeant\u00a0: mémoriser, comprendre, appliquer, analyser, évaluer, créer. Le verbe que tu choisis ici, tes activités devront le faire exercer et tes évaluations devront l\u2019exiger.</p>'
    },
    {
        titre: 'Ce que l\u2019étudiant doit retenir',
        contenu:
            '<p class="planif-guide-pourquoi">Une idée maîtresse, c\u2019est l\u2019essentiel — ce qui restera quand l\u2019étudiant aura oublié les détails. Chaque compétence se décline en une ou plusieurs idées maîtresses.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-idee-maitresse)"></span> <strong>Idée maîtresse</strong> sur le canevas.</li>' +
                '<li>Relie-la à sa compétence en tirant un lien d\u2019un port à l\u2019autre. Le verbe <em>«\u00a0se décline en\u00a0»</em> s\u2019affiche automatiquement.</li>' +
                '<li>Le badge d\u2019entrée de l\u2019idée maîtresse affiche <span class="guide-glyphe guide-glyphe--check">\u2713</span> — elle est connectée en amont.</li>' +
            '</ol>'
    },
    {
        // #966 — remplacée par le texte validé (27 sept. 2026) : la séquence
        // devient facultative ; la leçon porte sa semaine et sa séance.
        titre: 'Organise dans le temps',
        contenu:
            '<p class="planif-guide-pourquoi">Tes leçons structurent ton cours dans le temps\u00a0: chacune porte sa semaine et sa séance.</p>' +
            '<ol>' +
                '<li>Glisse des <span class="planif-guide-type" style="background:var(--planif-couleur-lecon)"></span> <strong>Leçons</strong> sur le canevas et pose leur semaine dans l\u2019<strong>Inspecteur</strong>.</li>' +
                '<li>Relie chaque leçon à une ou plusieurs idées maîtresses. Le verbe <em>«\u00a0se concrétise dans\u00a0»</em> apparaît. C\u2019est ce lien qui fait remonter tes objectifs et tes évaluations jusqu\u2019à la compétence.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Facultatif\u00a0: une <span class="planif-guide-type" style="background:var(--planif-couleur-sequence)"></span> <strong>Séquence</strong> regroupe des leçons qui poursuivent les mêmes idées maîtresses. Elle aide à voir ton cours par blocs, mais l\u2019alignement n\u2019en a pas besoin. Tu peux déplacer une leçon d\u2019une séquence à l\u2019autre en la glissant.</div>'
    },
    {
        // Ajoutée le 9 août 2026 (#421). Le guide faisait construire la carte
        // sans jamais nommer l'objectif de leçon — celui-là même que Grégoire
        // ne trouvait pas (METHODE-ALIGNEMENT §4.1 bis, 6 août). La cause
        // racine y était diagnostiquée comme un défaut d'affordance ; le badge
        // grisé l'a réglée dans l'interface, le manuel devait suivre.
        titre: 'Ce que la leçon vise',
        contenu:
            '<p class="planif-guide-pourquoi">L’objectif de leçon est la boussole : c’est lui qui dit ce que l’étudiant saura faire à la fin, et c’est par rapport à lui que se choisissent les connaissances, les activités et l’évaluation.</p>' +
            '<ol>' +
                '<li>Sur un bloc <span class="planif-guide-type" style="background:var(--planif-couleur-lecon)"></span> <strong>Leçon</strong>, clique le badge <strong>🎯</strong> de l’en-tête : il déplie la zone des objectifs. Grisé, il t’indique qu’aucun objectif n’est encore posé.</li>' +
                '<li>Écris l’objectif. Le <strong>+</strong> en ajoute un autre, le <strong>−</strong> retire celui de la ligne — une leçon en porte souvent plusieurs.</li>' +
                '<li>Dans l’<strong>Inspecteur</strong> d’une activité ou d’un exposé de cette leçon, coche les <strong>objectifs servis</strong> ; dans celui d’une évaluation, les <strong>objectifs vérifiés</strong>, ceux de sa leçon ou d’une leçon placée avant elle. C’est ainsi que tu vérifies qu’aucun objectif ne reste sans moyen.</li>' +
                '<li>Plus rapide : <strong>trace un lien</strong> depuis le bloc et <strong>dépose-le sur la ligne de l’objectif</strong> — la case se coche toute seule. Une activité ou un exposé doit être dans la même leçon que l’objectif ; une évaluation, dans cette leçon ou une leçon placée après.</li>' +
            '</ol>' +
            '<p class="planif-guide-pourquoi">Chaque objectif porte une <strong>pastille</strong> qui dit où il en est\u00a0:</p>' +
            legendePastillesObjectifHTML() +
            '<div class="planif-guide-astuce">Pose aussi la <strong>semaine</strong> de la leçon (Inspecteur) et la <strong>durée</strong> de chaque bloc (dans son en-tête) : la leçon totalise les durées de ce qu’elle contient, et le planificateur place le tout sur les semaines de ton trimestre.</div>'
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
            // #966 — ligne ajoutée, texte validé par Grégoire (27 sept. 2026).
            '<p>Ces quatre types viennent de la taxonomie révisée d\u2019Anderson et Krathwohl. Si tu connais plutôt les connaissances déclaratives, procédurales et conditionnelles\u00a0: les déclaratives regroupent les factuelles et les conceptuelles, et les conditionnelles (quand et pourquoi agir) relèvent de la métacognitive.</p>' +
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
            '<div class="planif-guide-astuce">La famille compte d\u2019autres blocs\u00a0: <span class="planif-guide-type" style="background:var(--planif-couleur-expose)"></span> <strong>Exposé</strong> pose ton temps d\u2019enseignement\u00a0; <span class="planif-guide-type" style="background:var(--planif-couleur-soutien)"></span> <strong>Soutien</strong> sert à l\u2019aide supplémentaire et <span class="planif-guide-type" style="background:var(--planif-couleur-revision)"></span> <strong>Révision</strong> au réinvestissement\u00a0; et les cinq étapes de l\u2019<strong>enseignement explicite</strong> (Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture) sont des activités à part entière.</div>'
    },
    {
        // #966 — remplacée par le texte validé (27 sept. 2026) : l'évaluation
        // coche les objectifs qu'elle vérifie (#964) et porte une pastille (#965).
        // La légende est celle de l'Inspecteur, depuis la même fonction.
        titre: 'Vérifie que c\u2019est acquis',
        contenu:
            '<p class="planif-guide-pourquoi">L\u2019évaluation ferme la boucle\u00a0: elle vérifie ce que tu as enseigné, au niveau que tu as visé, ni plus, ni moins.</p>' +
            '<ol>' +
                '<li>Glisse une <span class="planif-guide-type" style="background:var(--planif-couleur-evaluation)"></span> <strong>Évaluation</strong> dans la leçon où elle a lieu.</li>' +
                '<li>Dans l\u2019<strong>Inspecteur</strong>, coche les objectifs qu\u2019elle vérifie\u00a0: ceux de cette leçon ou d\u2019une leçon précédente.</li>' +
                '<li>Choisis son niveau cognitif. Il devrait correspondre au verbe de ces objectifs.</li>' +
            '</ol>' +
            '<p class="planif-guide-pourquoi">Chaque évaluation porte une <strong>pastille</strong> qui dit où elle en est\u00a0:</p>' +
            legendePastillesEvaluationHTML() +
            '<p class="planif-guide-conclusion">Ta carte est alignée quand chaque objectif est servi et vérifié, et que chaque évaluation ne vérifie que des objectifs déjà enseignés.</p>'
    },
    {
        // Réécrite le 8 août 2026 (1.57.0 a supprimé la page « Plan de la
        // leçon » et l'import MD) : la page documente le RÉEL — le menu
        // Actions, les niveaux par usage, le Personnalisé, et les deux
        // imports qui existent encore (JSON, inter-trimestre).
        titre: 'Exporte ton plan',
        contenu:
            '<p class="planif-guide-pourquoi">Ta carte sait produire le document que tu remets\u00a0: plan de cours, déroulement pour la classe, ou preuve d\u2019alignement. Un geste, neuf documents possibles.</p>' +
            '<p><strong>Exporter</strong></p>' +
            '<ol>' +
                '<li>Clique <strong>Actions\u00a0\u25BE</strong> (barre d\u2019outils), puis <strong>Exporter le plan\u2026</strong></li>' +
                '<li>Choisis le <strong>niveau</strong>\u00a0: <em>Plan de cours</em> (le sommaire collable), <em>En classe</em> (objectifs, activités, durées, rétroactions) ou <em>Preuve d\u2019alignement</em> (tout, liens compris).</li>' +
                '<li>Choisis le <strong>format</strong> — texte, tableau (TSV, se colle dans Numbers ou Excel) ou Markdown — puis <strong>Copier</strong> ou <strong>Télécharger</strong>.</li>' +
            '</ol>' +
            '<p><strong>Personnaliser</strong></p>' +
            '<ol>' +
                '<li><strong>Régler le niveau personnalisé\u2026</strong> ouvre une fenêtre\u00a0: coche les contenus, choisis l\u2019ordre des sections — l\u2019aperçu suit.</li>' +
                '<li>Ton réglage est mémorisé\u00a0: le niveau <em>Personnalisé</em> l\u2019utilise tel quel, d\u2019un export à l\u2019autre.</li>' +
            '</ol>' +
            '<div class="planif-guide-astuce">Le document copié se retravaille où tu veux — avec une IA, un collègue, ton traitement de texte. C\u2019est un document de SORTIE\u00a0: la carte reste la source.</div>' +
            '<p><strong>Importer</strong></p>' +
            '<ol>' +
                '<li><strong>Importer une carte (fichier)</strong> recharge une carte exportée en JSON.</li>' +
                '<li><strong>Importer d\u2019un autre trimestre\u2026</strong> reprend la carte d\u2019un cours donné à une session précédente — copie indépendante, la source reste intacte.</li>' +
            '</ol>'
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

    // Créer les points de navigation (un par page de GUIDE_PAGES)
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

    // 1. Chercher un verbe vertical (automatique), sur les types BRUTS
    var match = VERBES_AUTO[src.type + '>' + cbl.type];

    // 1 bis. REPLI SUR LA FAMILLE (8 août 2026) — corrige #415.
    //
    // Les cinq nœuds d'enseignement explicite sont entrés le 7 août dans TYPES,
    // TYPES_ACTIVITE, TYPES_SERVANTS_OBJECTIF et la palette — mais JAMAIS dans
    // `VERBES_AUTO`. Ils y avaient zéro paire, et `VERBES_HORIZONTAUX` n'a pas
    // de `connaissance>activite` : relier une connaissance à une Modélisation
    // rendait donc null, c'est-à-dire le toast « Ce lien n'est pas possible ».
    // Ces nœuds étaient décoratifs au sens strict — une couleur, une durée, une
    // place dans la leçon, et aucune relation.
    //
    // Le correctif n'est pas d'écrire les ~50 paires manquantes à la main : ce
    // serait de l'empilement, et il faudrait recommencer au type suivant. On
    // rabat sur la FAMILLE, comme #415 avait rabattu les six triplets en dur
    // sur TYPES_ACTIVITE. `conceptuelle>modelisation` retombe ainsi sur
    // `conceptuelle>activite` (« s'acquiert par »). (`modelisation>evaluation`
    // retombait sur `activite>evaluation` jusqu'au 27 sept. 2026 ; #964 a
    // retiré cette paire : aucun verbe ne mène plus à une évaluation.)
    //
    // ⚠ C'est un SECOURS, jamais un remplacement : la correspondance brute est
    // consultée d'abord et gagne toujours. Un type de la famille qui mériterait
    // un verbe à lui garde donc le sien.
    // 1 ter. RÉACTIVATION AVANT REPLI (15 août 2026). Une connaissance reliée
    // à une Ouverture ou à une Révision se RÉACTIVE, elle ne s'acquiert pas.
    // ⚠ Placée ici et pas ailleurs : APRÈS la correspondance brute (une paire
    // écrite explicitement doit continuer de gagner) et AVANT le repli sur la
    // famille (qui écraserait Ouverture en « activite » et rendrait
    // « s'acquiert par »).
    if (!match) {
        if (TYPES_CONNAISSANCE.indexOf(src.type) !== -1 && TYPES_REACTIVATION.indexOf(cbl.type) !== -1) {
            match = { verbe: 'se_reactive_dans' };
        } else if (TYPES_REACTIVATION.indexOf(src.type) !== -1 && TYPES_CONNAISSANCE.indexOf(cbl.type) !== -1) {
            match = { verbe: 'se_reactive_dans', inverser: true };
        }
    }

    if (!match) {
        match = VERBES_AUTO[src.type + '>' + normaliserType(cbl.type)]
             || VERBES_AUTO[normaliserType(src.type) + '>' + cbl.type];
    }

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

/**
 * SIGNALER UN VERBE DEVENU INEXACT — verdict 3.4 de Grégoire (porte terrain du
 * 16 août 2026 : « signaler »).
 *
 * ⚠ CE QUE CETTE FONCTION NE FAIT PAS, ET C'EST L'ESSENTIEL : elle ne réécrit
 * AUCUN verbe. Un verbe posé est une donnée de l'enseignant ; le corriger en
 * douce à chaque permutation serait pire que de le laisser inexact, parce que
 * la correction serait invisible. Elle se contente de DIRE, et le menu du lien
 * offre déjà tous les verbes pour corriger d'un clic.
 *
 * ▣ ELLE NE SIGNALE QUE LA BASCULE « accordé → désaccordé ». Un lien dont le
 * verbe divergeait DÉJÀ de la suggestion avant le geste est un choix délibéré,
 * pas une conséquence : le compter reviendrait à reprocher à Grégoire, à chaque
 * permutation, un verbe qu'il a choisi exprès. C'est la raison du relevé pris
 * AVANT le changement.
 *
 * ⮕ Vaut pour TOUS les changements de type, pas seulement les phases : c'est la
 * généralisation du 16 août qui rend le signalement nécessaire ailleurs que
 * dans l'enseignement explicite. Compétence ↔ Idée maîtresse change la
 * résolution (les deux se résolvent sur elles-mêmes dans `normaliserType`), et
 * Ouverture ou Révision quittant `TYPES_REACTIVATION` fait perdre au lien le
 * verbe « se réactive dans ».
 */
function verbeEstSuggere(lien) {
    var resolution = resoudreVerbe(lien.source, lien.cible);
    if (!resolution) return false;
    if (resolution.type === 'horizontal') return resolution.verbes.indexOf(lien.type) !== -1;
    return resolution.verbe === lien.type;
}

/** Relevé AVANT permutation : quels liens du nœud portaient un verbe accordé. */
function releverVerbesDeNoeud(noeudId) {
    var releve = [];
    for (var entryRV of etat.liens) {
        var lien = entryRV[1];
        if (lien.source !== noeudId && lien.cible !== noeudId) continue;
        releve.push({ id: entryRV[0], accorde: verbeEstSuggere(lien) });
    }
    return releve;
}

/** Compte APRÈS permutation, et le dit une seule fois pour tout le geste. */
function signalerVerbesDevenusInexacts(noeudId, releveAvant) {
    var accordeAvant = {};
    for (var ri = 0; ri < releveAvant.length; ri++) {
        if (releveAvant[ri].accorde) accordeAvant[releveAvant[ri].id] = true;
    }
    var devenus = 0;
    for (var entrySV of etat.liens) {
        var lienSV = entrySV[1];
        if (lienSV.source !== noeudId && lienSV.cible !== noeudId) continue;
        if (accordeAvant[entrySV[0]] && !verbeEstSuggere(lienSV)) devenus++;
    }
    if (devenus === 0) return;
    afficherToastLien(devenus === 1
        ? 'Un lien de ce bloc garde un verbe qui ne correspond plus à son nouveau type — clique le lien pour le changer.'
        : devenus + ' liens de ce bloc gardent un verbe qui ne correspond plus à son nouveau type — clique un lien pour le changer.');
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
    // La visée dit le nom COMPLET partout où il y a de la place — Inspecteur,
    // exports, recherche. L'en-tête du bloc, lui, montre la forme courte du
    // menu (cf. `VISEES_EVALUATION`).
    // ⚠ `viseeChoisie` et NON `viseeEvaluation` : sans choix explicite, le
    // libellé reste « Évaluation », comme avant le 16 août. Le plan de cours ne
    // doit affirmer que ce que Grégoire a posé.
    if (donnees.type === 'evaluation') {
        var v = viseeChoisie(donnees);
        for (var vi = 0; v && vi < VISEES_EVALUATION.length; vi++) {
            if (VISEES_EVALUATION[vi][0] === v) return VISEES_EVALUATION[vi][2];
        }
    }
    return config.label;
}

function obtenirCouleurNoeud(donnees) {
    var config = TYPES[donnees.type];
    if (!config) return '#94a3b8';
    // ▣ PLUS DE TEINTE POUR « PRÉALABLE » (16 août 2026). Une connaissance
    // préalable prenait l'orange le plus foncé de la famille — la dernière
    // nuance intra-famille du module. Grégoire l'a tranché en même temps que
    // les autres : « j'accepte qu'un préalable ne se distingue plus du tout sur
    // la carte ; c'est une fonction théorique non utilisée, elle va
    // probablement disparaître ». L'état reste écrit dans l'Inspecteur.
    return config.couleur;
}

function mettreAJourApparenceNoeud(donnees) {
    var el = document.getElementById(donnees.id);
    if (!el) return;
    var couleur = obtenirCouleurNoeud(donnees);
    el.style.borderColor = couleur;
    // ▣ LE LIBELLÉ D'EN-TÊTE N'EST PLUS RETOUCHÉ ICI (16 août 2026, nettoyage
    // de la généralisation du sélecteur). Une seule chose le faisait varier :
    // la case « Préalable », qui ajoutait « préalable » au libellé et changeait
    // la teinte. Or les connaissances portent désormais un `<select>`, dont
    // l'option sélectionnée ne peut pas dire « Factuelle préalable » — et la
    // couleur ne varie plus, une famille n'ayant qu'un jeton. Le seul en-tête
    // qui garde un libellé inerte (Séquence, Leçon) n'a ni préalable ni teinte
    // variable. Ces trois lignes ne pouvaient donc plus rien changer.
    // ⮕ L'état « préalable » reste DIT dans l'Inspecteur, qui écrit son propre
    // libellé et sa pastille (cf. la case `#planif-panneau-prealable`).
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
        if (TYPES_ACTIVITE.indexOf(l.noeudType) !== -1) return true;
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
            // #964 — une leçon reliée dont un objectif est vérifié par une
            // évaluation, où qu'elle soit sur la carte, lève le ⚠. Même
            // profondeur que la règle des liens : la leçon reliée, ou une leçon
            // enfant directe de la séquence reliée.
            if (conteneur && conteneur.type === 'lecon' && leconAObjectifVerifie(conteneur)) return true;
            if (conteneur && conteneur.enfants) {
                for (var j = 0; j < conteneur.enfants.length; j++) {
                    var enfant = etat.noeuds.get(conteneur.enfants[j]);
                    if (!enfant) continue;
                    if (enfant.type === 'lecon' && leconAObjectifVerifie(enfant)) return true;
                    var liensEnfant = getLiensDeNoeud(enfant.id);
                    if (liensEnfant.some(function(le) { return le.noeudType === 'evaluation'; })) return true;
                    // Connaissance (factuelle/conceptuelle/procédurale/métacognitive) → activité → évaluation
                    if (TYPES_CONNAISSANCE.indexOf(enfant.type) !== -1) {
                        for (var k = 0; k < liensEnfant.length; k++) {
                            if (TYPES_ACTIVITE.indexOf(liensEnfant[k].noeudType) !== -1) {
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

/**
 * #403 — état d'alignement d'UN objectif de leçon.
 *
 * Le patron est celui des idées maîtresses, transposé d'un cran plus bas :
 *   servi   = au moins une activité de SA leçon le déclare (entrée)
 *   vérifié = une évaluation le vérifie (sortie), en DIRECT (une évaluation de
 *             la leçon le coche — le nœud évaluation à rétroaction orale coche
 *             très bien ça) ou en TRANSITIF (une des activités qui le servent
 *             est reliée à une évaluation).
 *
 * Trois états, jamais bloquants (§6 quinquies — l'exigence est progressive) :
 *   'invitation' — personne ne le sert encore ; gris, c'est une invitation
 *   'servi'      — servi mais rien ne le vérifie ; ⚠ orange
 *   'verifie'    — servi ET vérifié ; ✓
 *
 * Comme partout dans le module, les LIENS sont agrégés sur les clones (identité
 * partagée) ; le CONTENANT, lui, est celui du nœud courant.
 *
 * @returns {{etat: string, message: string}}
 */
function evaluerObjectif(lecon, objectifId) {
    if (!lecon || !objectifId) {
        return { etat: 'invitation', message: 'Aucune activité ne sert cet objectif' };
    }
    var enfants = (lecon.enfants || [])
        .map(function(eid) { return etat.noeuds.get(eid); })
        .filter(Boolean);

    var servants = enfants.filter(function(e) {
        return e.type !== 'evaluation' &&
               TYPES_SERVANTS_OBJECTIF.indexOf(e.type) !== -1 &&
               objectifsServisPar(e).indexOf(objectifId) !== -1;
    });

    if (servants.length === 0) {
        return { etat: 'invitation', message: 'Aucune activité ne sert cet objectif' };
    }

    // #964 — vérifié dès qu'une évaluation, dans n'importe quelle leçon, le
    // coche. (Avant : seulement une évaluation de la même leçon.)
    var verifieDirect = objectifVerifieParUneEvaluation(objectifId);

    var verifieTransitif = !verifieDirect && servants.some(function(s) {
        var clones = trouverClones(s.id);
        for (var ci = 0; ci < clones.length; ci++) {
            var liens = getLiensDeNoeud(clones[ci].id);
            for (var li = 0; li < liens.length; li++) {
                if (liens[li].noeudType === 'evaluation') return true;
            }
        }
        return false;
    });

    var nb = servants.length;
    var texteServi = 'Servi par ' + nb + ' activit' + (nb > 1 ? 'és' : 'é');

    if (verifieDirect || verifieTransitif) {
        return {
            etat: 'verifie',
            message: texteServi + ' — vérifié par une évaluation' +
                     (verifieDirect ? '' : ' (via une activité reliée)')
        };
    }
    return {
        etat: 'servi',
        message: texteServi + ", mais aucune évaluation ne le vérifie"
    };
}

/**
 * Pastille d'un objectif, rendue DANS l'innerHTML de la leçon plutôt que posée
 * par appendChild comme les badges de nœud. Ce n'est pas un détail : le 6 août,
 * des badges ajoutés par appendChild ont été effacés par un reconstruireDOM()
 * appelé après coup (régression 2 du relais). Rendue avec la ligne, la pastille
 * ne peut pas se désynchroniser de son objectif.
 */
function pastilleObjectifHTML(lecon, objectifId) {
    var res = evaluerObjectif(lecon, objectifId);
    // security-ok: res.etat ne peut valoir que 'invitation', 'servi' ou
    // 'verifie' — trois littéraux rendus par evaluerObjectif, jamais de donnée
    // utilisateur. L'id et le message, eux, sont échappés.
    return '<span class="planif-obj-pastille planif-obj-pastille--' + res.etat + '"' +
           ' data-obj-id="' + echapperHtml(objectifId) + '"' +
           ' title="' + echapperHtml(res.message) + '"' +
           ' aria-label="' + echapperHtml(res.message) + '">' +
           SYMBOLES_PASTILLE_OBJECTIF[res.etat] + '</span>';
}

/**
 * Recalcule les pastilles déjà rendues d'une leçon, sans reconstruire le DOM :
 * l'état d'un objectif dépend d'AUTRES nœuds (ses activités, leurs liens), donc
 * il change sans que la leçon soit touchée. Branché dans mettreAJourBadge() —
 * le point que tous les chemins de modification appellent déjà.
 */
function rafraichirPastillesObjectifs(lecon) {
    if (!lecon || lecon.type !== 'lecon') return;
    var el = document.getElementById(lecon.id);
    if (!el) return;
    var pastilles = el.querySelectorAll('.planif-obj-pastille');
    for (var i = 0; i < pastilles.length; i++) {
        var p = pastilles[i];
        var res = evaluerObjectif(lecon, p.getAttribute('data-obj-id'));
        p.className = 'planif-obj-pastille planif-obj-pastille--' + res.etat;
        p.textContent = SYMBOLES_PASTILLE_OBJECTIF[res.etat];
        p.title = res.message;
        p.setAttribute('aria-label', res.message);
    }
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

        // #964 — l'Exposé rejoint le calcul des activités. Il tombait dans le
        // `default` (✓/✓ sans condition) depuis son ajout du 8 août.
        case 'expose':
        case 'activite':
        case 'soutien':
        case 'revision':
        case 'ouverture':
        case 'modelisation':
        case 'pratique-guidee':
        case 'pratique-autonome':
        case 'cloture':
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
                return e && TYPES_ACTIVITE.indexOf(e.type) !== -1;
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
            // Les liens « se vérifie par » déjà tracés comptent comme avant
            // (compatibilité, #964) ; le geste neuf est l'objectif coché.
            var lieeActiviteOuContenu = liens.some(function(l) {
                return typesAmontEval.indexOf(l.noeudType) !== -1 || TYPES_ACTIVITE.indexOf(l.noeudType) !== -1;
            });
            var nbVerifies = objectifsVerifiesPar(noeud).length;
            return {
                entree: nbVerifies > 0
                    ? { valide: true, message: 'Vérifie ' + nbVerifies + ' objectif' + (nbVerifies > 1 ? 's' : '') }
                    : lieeActiviteOuContenu
                        ? { valide: true, message: "Vérifie un objectif, une connaissance ou une activité" }
                        : { valide: false, message: "Aucun objectif coché : coche dans l’Inspecteur les objectifs qu’elle vérifie" },
                // Le message de sortie DIT la visée : c'est la seule surface où
                // la nuance formative / certificative se lit en toutes lettres
                // sur la carte, l'en-tête ne montrant que la forme courte.
                sortie: { valide: true, message: obtenirLabelNoeud(noeud) }
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

    // #403 : les pastilles d'objectif d'une leçon dépendent de ses activités et
    // de leurs liens — elles se rafraîchissent donc au même moment que les
    // badges, par le même point d'entrée.
    if (donnees.type === 'lecon') rafraichirPastillesObjectifs(donnees);
    // #965 — la pastille d'une évaluation dépend d'autres nœuds (les blocs qui
    // servent ses objectifs, leurs leçons) : même point de rafraîchissement.
    if (donnees.type === 'evaluation') rafraichirPastilleEvaluation(donnees);

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

// Bornes du zoom. ⚠ Le plancher était à 0,25 (trois sites : molette, geste
// Safari, pincement tactile) — et il MORDAIT : la carte réelle de Grégoire
// (601-101 A26) ne tient pas à 25 %, du contenu sort de l'écran à droite.
// « Tout voir » (11 août 2026) doit pouvoir descendre plus bas, sinon il
// promet ce qu'il ne peut pas tenir. À 0,10 un bloc fait ~14 px : illisible,
// et c'est assumé — c'est la LOUPE qui lit, pas le zoom arrière.
const ZOOM_MIN = 0.10;
const ZOOM_MAX = 3;

// Sensibilité de la molette et du pincement trackpad. Reprise telle quelle de
// `travaux-visionneuse.js` (#660) : c'est un CALIBRAGE, pas une mesure — il se
// juge au doigt, pas au banc.
const ZOOM_SENSIBILITE_MOLETTE = 0.025;

// Grossissement de la loupe, et zoom d'atterrissage quand on clique dedans :
// on arrive exactement à l'échelle qu'on venait de lire.
const LOUPE_ZOOM = 1;

// === RÉFÉRENCES DOM (initialisées dans initialiser()) ===
let zoneTravail, espace, espaceWrapper, coucheNoeuds, coucheLiens, canvas, lienTemp;
let panneau, menuLien, rectSelection;

// Loupe de navigation — déclarée ICI et non près de son code, en bas du
// fichier : `reconstruireDOM()` (au milieu) invalide la copie, et `let` n'est
// pas hoisté. Le module se charge de haut en bas avant tout appel, donc rien
// ne cassait aujourd'hui — mais la dépendance était invisible et un seul
// déplacement de fonction l'aurait réveillée.
let _loupeEl = null;           // le cadre (position fixe, au-dessus de tout)
let _loupeContenu = null;      // l'enveloppe qui porte la copie et la décale
let _loupeCopieValide = false;
let _loupeDernierPoint = null; // dernier point d'espace visé {x, y}

const LOUPE_L = 420;   // largeur du cadre, en px écran
const LOUPE_H = 300;

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
    // La barre d'alignement est positionnée en pixels d'ÉCRAN à partir des
    // coordonnées de carte : tout changement d'échelle la laisse derrière.
    majBarreAlignement();
    espace.style.transform = 'scale(' + etat.zoom + ')';
    espaceWrapper.style.width = (ESPACE_W * etat.zoom) + 'px';
    espaceWrapper.style.height = (ESPACE_H * etat.zoom) + 'px';
}

function zoomer(clientX, clientY, facteur) {
    const oldZoom = etat.zoom;
    etat.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, etat.zoom * facteur));
    if (etat.zoom === oldZoom) return;

    appliquerZoom();

    const rect = zoneTravail.getBoundingClientRect();
    const cursorLocalX = clientX - rect.left;
    const cursorLocalY = clientY - rect.top;
    const espaceX = (cursorLocalX + zoneTravail.scrollLeft) / oldZoom;
    const espaceY = (cursorLocalY + zoneTravail.scrollTop) / oldZoom;
    zoneTravail.scrollLeft = espaceX * etat.zoom - cursorLocalX;
    zoneTravail.scrollTop = espaceY * etat.zoom - cursorLocalY;

    mettreAJourBoutonsZoomPreset();
}

// Le seul affichage qui doive suivre un pincement image par image : les deux
// badges de pourcentage. Détaché de `mettreAJourBoutonsZoomPreset()`, qui
// parcourt en plus les boutons de préréglage — inutile à chaque frame.
function afficherPourcentageZoom(zoom) {
    var texte = Math.round(zoom * 100) + '%';
    var infoHeader = document.getElementById('planif-zoom-info-header');
    if (infoHeader) infoHeader.textContent = texte;
    var infoFooter = document.getElementById('planif-zoom-info');
    if (infoFooter) infoFooter.textContent = texte;
}

function mettreAJourBoutonsZoomPreset() {
    var zoomArrondi = Math.round(etat.zoom * 100);
    document.querySelectorAll('.planif-btn-zoom-preset').forEach(function(btn) {
        var presetVal = Math.round(parseFloat(btn.dataset.zoom) * 100);
        btn.classList.toggle('actif', presetVal === zoomArrondi);
    });
    afficherPourcentageZoom(etat.zoom);
}

// === ARITHMÉTIQUE DU ZOOM AUTOUR D'UN POINT ===
// Pures, et isolées pour cette raison : le pincement lui-même ne se joue pas au
// banc (WebKit absent des conteneurs, #456), son calcul si. Les deux tiennent la
// MÊME promesse — le point de carte sous les doigts ne bouge pas — mais à deux
// moments : pendant le geste c'est le transform qui porte le décalage, après le
// geste c'est le défilement.

/** Décalage du transform d'aperçu qui fige `pointEspace` sous `focal`. */
function decalageApercuZoom(focal, defilement, pointEspace, zoom) {
    return focal + defilement - pointEspace * zoom;
}

/** Défilement à poser après le geste pour figer `pointEspace` sous `focal`. */
function defilementApresZoom(pointEspace, zoom, focal) {
    return pointEspace * zoom - focal;
}

// === APERÇU DE ZOOM PENDANT UN GESTE ===
// Ce qui rendait le pincement saccadé sur iPad (retour de Grégoire, 6 sept.
// 2026) : chaque événement tactile refaisait le cycle de zoom AU COMPLET —
// redimensionner l'enveloppe de 10 000 × 6 000 px (reflow de toute la carte),
// lire `getBoundingClientRect()`, réécrire `scrollLeft`/`scrollTop`, puis
// parcourir les boutons de préréglage. Un aller-retour écriture-lecture-écriture
// de mise en page par événement, sur l'espace qui porte tous les nœuds ; et
// Safari en émet plus qu'il n'y a d'images à l'écran.
//
// Le modèle est celui d'Annoter et Évaluer : pendant le geste on ne touche
// QU'À `transform`, que le compositeur applique sans remettre la page en page ;
// l'enveloppe, le défilement et les boutons attendent la fin du geste.
var apercuZoom = {
    actif: false,
    zoomDepart: 1,
    zoomCible: 1,
    focalX: 0,
    focalY: 0,
    espaceX: 0,
    espaceY: 0,
    frame: 0
};

function demarrerApercuZoom(clientX, clientY) {
    // UNE lecture de géométrie, au départ du geste — pas une par événement.
    var rect = zoneTravail.getBoundingClientRect();
    apercuZoom.actif = true;
    apercuZoom.zoomDepart = etat.zoom;
    apercuZoom.zoomCible = etat.zoom;
    // Le point focal se fige ici pour tout le geste. Le réécrire à chaque
    // événement fait dériver la carte de ce que les doigts ont parcouru — c'est
    // la correction du 31 août sur la visionneuse, même piège ici.
    apercuZoom.focalX = clientX - rect.left;
    apercuZoom.focalY = clientY - rect.top;
    apercuZoom.espaceX = (apercuZoom.focalX + zoneTravail.scrollLeft) / etat.zoom;
    apercuZoom.espaceY = (apercuZoom.focalY + zoneTravail.scrollTop) / etat.zoom;
}

function majApercuZoom(zoomVise) {
    if (!apercuZoom.actif) return;
    apercuZoom.zoomCible = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomVise));
    // Une seule image par rafraîchissement, quel que soit le nombre
    // d'événements reçus entre-temps : Safari en émet davantage.
    if (apercuZoom.frame) return;
    apercuZoom.frame = requestAnimationFrame(function() {
        apercuZoom.frame = 0;
        if (!apercuZoom.actif) return;
        var z = apercuZoom.zoomCible;
        // Le défilement se relit ici plutôt que de se figer au départ : à deux
        // doigts, Safari peut faire glisser la zone pendant le pincement, et
        // l'aperçu doit suivre. Lecture puis écriture, une fois par image —
        // pas l'alternance des deux qu'on vient de retirer.
        var tx = decalageApercuZoom(apercuZoom.focalX, zoneTravail.scrollLeft, apercuZoom.espaceX, z);
        var ty = decalageApercuZoom(apercuZoom.focalY, zoneTravail.scrollTop, apercuZoom.espaceY, z);
        // `#planif-espace` a `transform-origin: 0 0` : un point d'espace E se
        // pose donc en E × z + t.
        espace.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + z + ')';
        afficherPourcentageZoom(z);
    });
}

function finirApercuZoom() {
    if (!apercuZoom.actif) return;
    apercuZoom.actif = false;
    if (apercuZoom.frame) {
        cancelAnimationFrame(apercuZoom.frame);
        apercuZoom.frame = 0;
    }
    var z = apercuZoom.zoomCible;
    etat.zoom = z;
    // `appliquerZoom()` réécrit `transform` sans décalage : c'est le défilement
    // qui le reprend à son compte, exactement à la position où l'aperçu laissait
    // le point focal. Rien ne saute entre la dernière image et ici.
    appliquerZoom();
    zoneTravail.scrollLeft = defilementApresZoom(apercuZoom.espaceX, z, apercuZoom.focalX);
    zoneTravail.scrollTop = defilementApresZoom(apercuZoom.espaceY, z, apercuZoom.focalY);
    mettreAJourBoutonsZoomPreset();
}

/** Point d'écran d'un geste Safari — `clientX`, avec repli sur `pageX`. */
function pointClientDuGeste(e) {
    return {
        x: typeof e.clientX === 'number' ? e.clientX : e.pageX - window.scrollX,
        y: typeof e.clientY === 'number' ? e.clientY : e.pageY - window.scrollY
    };
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
    // La bordure était laissée VIDE sur un conteneur, alors que
    // `reconstruireDOM` la pose : une Leçon neuve n'avait donc pas son liseré
    // mauve avant le rechargement suivant. Même divergence que le contenu,
    // même correctif — l'état rendu au rechargement fait foi.
    el.style.borderColor = obtenirCouleurNoeud(donnees);

    el.innerHTML = contenuNoeudHTML(donnees);

    attacherEvenements(el, donnees);
    // Même garde que `reconstruireDOM` : sans canevas monté (module pas encore
    // initialisé, ou bac à sable de test), la DONNÉE reste la vérité et le
    // rendu suivra au montage. `reconstruireDOM` se gardait déjà, ces deux
    // sites-ci non — asymétrie relevée en écrivant la sentinelle du 11 août.
    if (coucheNoeuds) coucheNoeuds.appendChild(el);

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
    majBarreAlignement();
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
    majBarreAlignement();
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
    majBarreAlignement();
}

function toutSelectionner() {
    etat.multiSelection.clear();
    for (const [nid] of etat.noeuds) {
        etat.multiSelection.add(nid);
        const el = document.getElementById(nid);
        if (el) el.classList.add('selected');
    }
    majBarreAlignement();
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

    // ▣ LA DURÉE A QUITTÉ CE PANNEAU (8 août 2026, décision Grégoire).
    // Le champ « Durée estimée » vit désormais dans l'EN-TÊTE DU NŒUD, et le
    // rollup de la leçon y est un compteur permanent. Deux motifs :
    //   • on consultait ici, en ouvrant un panneau, une information qu'on lit
    //     en survolant sa carte ;
    //   • le rollup était une LECTURE SEULE répétée — l'Inspecteur doit ajouter
    //     de l'information, pas redoubler ce que la carte montre déjà.
    // Voir `dureeControleHTML` et `compteurDureeHTML`. La coercition `parseInt`
    // et la propagation aux clones ont voyagé avec le champ.


    // Ancrage temporel : SAISI sur la leçon (D3), DÉRIVÉ sur la séquence.
    // L'ancien couple « Semaine début / Semaine fin » de la séquence est retiré
    // — il pouvait contredire ses propres leçons.
    if (donnees.type === 'lecon') {
        var semLecon = semaineDeLecon(donnees);
        extra.innerHTML +=
            '<label for="planif-panneau-semaine">Semaine</label>' +
            '<input type="number" id="planif-panneau-semaine" value="' + (semLecon === null ? '' : semLecon) + '" min="1" placeholder="non planifiée">' +
            // #695 — dans la MÊME écriture que le champ : un `innerHTML +=`
            // posé après l'écouteur ci-dessous le détruirait.
            LIGNE_DATE_INSPECTEUR_HTML;
        var semInput = extra.querySelector('#planif-panneau-semaine');
        semInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        semInput.addEventListener('input', function(e) {
            definirSemaineLecon(id, e.target.value);
            // #150 : la feuille du canevas doit suivre — le bloc et ses
            // séquences ancêtres (dont la semaine est DÉRIVÉE des leçons).
            synchroniserSelecteurSemaine(id);
            for (var pSem = etat.noeuds.get(donnees.parent); pSem; pSem = etat.noeuds.get(pSem.parent)) {
                if (pSem.type === 'sequence') synchroniserSelecteurSemaine(pSem.id);
            }
            mettreAJourPlanificateur();
        });
    }

    // #445 — la légende des pastilles, dans l'Inspecteur de la LEÇON.
    // C'est le seul endroit atteignable au doigt : sur iPad il n'y a pas de
    // survol, donc l'infobulle `title` des pastilles n'existe pas. L'Inspecteur,
    // lui, s'ouvre au double-tap et par le bouton de la barre depuis #444.
    // Affichée seulement quand la leçon PORTE des objectifs : sans eux il n'y a
    // aucune pastille à l'écran, et la légende serait du bruit.
    if (donnees.type === 'lecon' && objectifsDeLecon(donnees).length > 0) {
        extra.innerHTML +=
            '<label>Pastilles des objectifs</label>' +
            legendePastillesObjectifHTML();
    }
    // #965 — même raison pour la pastille d'une évaluation : toujours affichée,
    // puisque l'évaluation porte toujours sa pastille (« ! » sans objectif).
    if (donnees.type === 'evaluation') {
        extra.innerHTML += blocLegendeEvaluationHTML();
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
            // #695 — la date de l'évaluation est celle de sa leçon parente.
            if (donnees.type === 'evaluation') htmlDeplacer += LIGNE_DATE_INSPECTEUR_HTML;
            extra.innerHTML += htmlDeplacer;
            // ⚠ Le listener est posé EN FIN de ouvrirPanneau : tout
            // `extra.innerHTML +=` ultérieur (ex. bloc niveau cognitif des
            // activités) re-sérialise le conteneur et tuerait un listener
            // posé ici.
        }
    }

    // #403 — « Objectifs servis » : saisie DÉCLARATIVE par cases à cocher, pas
    // par tracé de lien. Trois raisons : le geste marche sur iPad (où il n'y a
    // ni ⌘ ni glisser de nœud), l'objectif n'est pas un nœud donc rien à viser
    // sur le canevas, et la liste est bornée aux objectifs de SA leçon — on ne
    // peut pas se tromper de cible. La section n'apparaît pas quand il n'y a
    // rien à servir : une leçon sans objectif reste un usage complet.
    if (donnees.type === 'evaluation') {
        // #964 — l'évaluation coche les objectifs qu'elle VÉRIFIE : ceux de sa
        // leçon, puis ceux des leçons placées avant elle. Un objectif déjà
        // coché dont la leçon n'est plus proposée (déplacée après, ou sans
        // semaine) reste affiché dans son groupe, pour qu'on puisse le décocher.
        var idxEval = indexObjectifsCarte();
        var dejaVerifies = objectifsVerifiesPar(donnees, idxEval);
        var groupes = leconsInspecteurEvaluation(donnees, idxEval);
        var hoteEval = leconParenteDe(donnees);
        var htmlVerifies = '';
        groupes.forEach(function(lec) {
            var objs = objectifsDeLecon(lec);
            if (objs.length === 0) return;
            var sem = semaineDeLecon(lec);
            var seance = lettreRangSeance(rangSeanceDeLecon(lec));
            var titreGroupe = lec === hoteEval
                ? 'Cette leçon'
                : 'Leçon « ' + (lec.titre || 'Sans titre') + ' »'
                    + (sem !== null ? ' (semaine ' + sem + (seance ? ', séance ' + seance : '') + ')' : '');
            htmlVerifies += '<div class="planif-objectifs-servis-groupe">' + echapperHtml(titreGroupe) + '</div>';
            objs.forEach(function(o) {
                htmlVerifies +=
                    '<label class="planif-checkbox-label planif-objectif-servi-ligne">' +
                        '<input type="checkbox" class="planif-objectif-servi"' +
                        ' data-obj-id="' + echapperHtml(o.id) + '"' +
                        (dejaVerifies.indexOf(o.id) !== -1 ? ' checked' : '') + '>' +
                        ' <span>' + echapperHtml(o.texte) + '</span>' +
                    '</label>';
            });
        });
        if (htmlVerifies) {
            // security-ok: htmlVerifies est construit ci-dessus, chaque titre de
            // groupe, id et texte d'objectif passé par echapperHtml().
            extra.innerHTML += '<label>Objectifs vérifiés</label>' +
                '<div class="planif-objectifs-servis" id="planif-objectifs-servis">' + htmlVerifies + '</div>';
        }
    } else if (TYPES_SERVANTS_OBJECTIF.indexOf(donnees.type) !== -1) {
        var leconHote = leconParenteDe(donnees);
        var objsHote = leconHote ? objectifsDeLecon(leconHote) : [];
        if (objsHote.length > 0) {
            var dejaServis = objectifsServisPar(donnees);
            var htmlServis = '<label>Objectifs servis</label>' +
                '<div class="planif-objectifs-servis" id="planif-objectifs-servis">';
            for (var osi = 0; osi < objsHote.length; osi++) {
                var oServi = objsHote[osi];
                var coche = dejaServis.indexOf(oServi.id) !== -1 ? ' checked' : '';
                htmlServis +=
                    '<label class="planif-checkbox-label planif-objectif-servi-ligne">' +
                        '<input type="checkbox" class="planif-objectif-servi"' +
                        ' data-obj-id="' + echapperHtml(oServi.id) + '"' + coche + '>' +
                        ' <span>' + echapperHtml(oServi.texte) + '</span>' +
                    '</label>';
            }
            htmlServis += '</div>';
            extra.innerHTML += htmlServis;
            // ⚠ Listeners posés EN FIN de ouvrirPanneau, comme « Dans la
            // leçon » : un `extra.innerHTML +=` ultérieur (niveau cognitif des
            // activités, juste en dessous) re-sérialise le conteneur.
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
        // ⚠ LISTENER POSÉ EN FIN DE `ouvrirPanneau`, pas ici. Il fonctionnait
        // attaché à cet endroit, mais par CHANCE : aucun bloc ultérieur ne
        // concerne les types de connaissance, donc aucun `extra.innerHTML +=`
        // ne venait le détruire. Le jour où l'un d'eux en aurait concerné un,
        // la case aurait cessé de répondre en silence — c'est exactement ce
        // qui est arrivé à « Travail hors classe » le 12 août.
    }

    // #416 lot B — « Travail hors classe », patron de la case « Préalable ».
    // La case vit dans l'INSPECTEUR et non dans l'en-tête du bloc : c'est une
    // propriété qu'on pose une fois en concevant, pas un réglage qu'on ajuste
    // en déplaçant des blocs. Le sélecteur de semaine et celui de rang sont
    // dans l'en-tête pour la raison inverse.
    if (TYPES_HORS_CLASSE.indexOf(donnees.type) !== -1) {
        var horsClasseCoche = estHorsClasseNoeud(donnees) ? ' checked' : '';
        extra.innerHTML +=
            '<div class="planif-panneau-prealable">' +
                '<label class="planif-checkbox-label">' +
                    '<input type="checkbox" id="planif-panneau-hors-classe"' + horsClasseCoche + '>' +
                    ' Travail hors classe' +
                '</label>' +
                '<div class="planif-panneau-derive planif-note-hors-classe">' +
                    'Sort du total de la leçon : ce temps n’est pas du temps de classe.' +
                '</div>' +
            '</div>';
        // ⚠ LISTENER POSÉ EN FIN DE `ouvrirPanneau`, pas ici — même contrainte
        // d'ordre que « Dans la leçon » et la rétroaction. Chaque
        // `extra.innerHTML +=` qui suit RE-SÉRIALISE tout le panneau et détruit
        // les écouteurs déjà attachés. Posé ici, il survivait à l'affichage mais
        // pas au clic : la case apparaissait, se cochait, et ne faisait RIEN.
    }

    // #424 Lot E (veto D2b) : la rétroaction FORMATIVE vit sur l'ACTIVITÉ —
    // elle porte sur le travail PENDANT qu'il se fait. Jusqu'ici, poser ce
    // geste n'était possible que depuis la page « Plan de la leçon », celle
    // qu'on supprime : la capacité entre dans l'Inspecteur avant que la page
    // meure. Écrit metadata.retroaction du nœud activité.
    if (TYPES_ACTIVITE.indexOf(donnees.type) !== -1) {
        extra.innerHTML += selecteurRetroactionHTML('Rétroaction formative', donnees.metadata.retroaction);
        // ⚠ Listener posé EN FIN de ouvrirPanneau — le bloc « niveau
        // cognitif » ci-dessous re-sérialise `extra`.
    }

    if (donnees.type === 'evaluation') {
        // Décision Grégoire (option 2, 8 août midi) : ce sélecteur-ci garde un
        // sens DISTINCT — la rétroaction sur le RENDU, comment l'étudiant
        // reçoit son travail commenté. Deux notions, deux libellés.
        extra.innerHTML += selecteurRetroactionHTML('Rétroaction sur le rendu', donnees.metadata.retroaction);

        // Le contenu du sélecteur vit dans `optionsProductionsHTML` (fin de
        // module, à côté de `chargerProductions`) : les deux bouts du pont
        // carte ↔ productions se lisent ensemble, et la construction devient
        // testable sans ouvrir un panneau.
        var prodVal = donnees.metadata.productionId || '';
        var htmlProd = '<label for="planif-panneau-production">Production</label>' +
            '<select id="planif-panneau-production">' +
            '<option value="">Aucune</option>' +
            optionsProductionsHTML(chargerProductions(), prodVal) +
            '</select>';

        extra.innerHTML += htmlProd;
        // ⚠ Listeners posés EN FIN de ouvrirPanneau, pas ici. L'ancien câblage
        // s'attachait AVANT le bloc « niveau cognitif » — dont le
        // `extra.innerHTML +=` re-sérialisait le conteneur : sur un nœud
        // Évaluation (présent dans TYPES_AVEC_NIVEAU_COGNITIF), les sélecteurs
        // Rétroaction et Production étaient MUETS. Bug préexistant, corrigé
        // par le Lot E — même contrainte que « Dans la leçon » (6 août).
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

    // Clone info — et la sortie, là où on voit les instances (3 sept. 2026).
    // ▣ L'Inspecteur ANNONÇAIT « 🧬 N instances » sans offrir d'en sortir :
    // Grégoire a cherché « décloner » ici, et ne l'a trouvé nulle part. Le
    // bouton du menu Actions RESTE : lui seul sert la multisélection. Ici, le
    // geste porte sur LE bloc affiché, même si d'autres sont allumés sur la
    // carte — l'Inspecteur décrit un bloc, pas une sélection.
    var cloneInfo = document.getElementById('planif-panneau-clone-info');
    if (cloneInfo) {
        if (doitAfficherIndicateurClone(donnees)) {
            var clones = trouverClones(id);
            var nb = clones.length;
            cloneInfo.style.display = '';
            cloneInfo.innerHTML = '<span class="planif-clone-compteur">\uD83E\uDDEC ' + nb + ' instance' + (nb > 1 ? 's' : '') + '</span>' + // security-ok: littéraux statiques et un nombre, aucune donnée utilisateur
                ' <a href="#" id="planif-clone-voir-autres" class="planif-clone-lien">Voir les autres</a>' +
                '<button type="button" class="planif-btn-carte" id="planif-btn-decloner" data-tooltip="planif-detacher-clone">Décloner</button>';
            var btnDecloner = document.getElementById('planif-btn-decloner');
            if (btnDecloner) {
                btnDecloner.onclick = function() {
                    var nDecl = detacherDeLaFamille([id]);
                    annoncerDeclonage(nDecl);
                    // Décloné, le bloc n'a plus d'instances à annoncer : ce
                    // coin s'efface, comme `doitAfficherIndicateurClone` le
                    // dirait maintenant. Le reste du panneau ne bouge pas.
                    if (nDecl > 0) {
                        cloneInfo.style.display = 'none';
                        cloneInfo.innerHTML = '';
                    }
                };
            }
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

    // ▣ CE BOUTON N'A PAS DE MODIFICATEUR, DONC IL NOMME LA DISTINCTION.
    // Les raccourcis encodent le choix dans ⇧ ; ici il n'y a rien à enfoncer,
    // et un bouton unique devrait donc décider à la place de Grégoire. Il
    // devient « Copier » — l'issue indépendante, celle qu'un geste sans
    // modificateur doit produire d'après sa règle du 16 août.
    // ⚠ Le clonage n'est PAS retiré pour autant : il reste sous ⇧⌥ + glisser et
    // ⇧⌘D, et le bouton voisin le dit (`planif-btn-cloner-lie`, cf. index.html).
    // Retirer une capacité en silence aurait été pire que de ne rien changer.
    // Un CONTENEUR n'a jamais eu de miroir : il garde son seul « Dupliquer ».
    var estConteneurP = config && config.conteneur;
    var btnCloner = document.getElementById('planif-btn-cloner');
    if (btnCloner) {
        btnCloner.disabled = false;
        btnCloner.innerHTML = '<img src="icons/icon-copy.svg" alt="" class="btn-inline-icon"> ' + // security-ok: ternaire de deux littéraux statiques, aucune donnée utilisateur
            (estConteneurP ? 'Dupliquer' : 'Copier');
        btnCloner.onclick = function() {
            dupliquerNoeud(id, false, false);
            fermerPanneau();
        };
    }
    var btnClonerLie = document.getElementById('planif-btn-cloner-lie');
    if (btnClonerLie) {
        // Sur un conteneur, le clone lié n'existe pas : le bouton disparaît
        // plutôt que d'être désactivé sans explication.
        btnClonerLie.style.display = estConteneurP ? 'none' : '';
        btnClonerLie.onclick = function() {
            dupliquerNoeud(id, false, true);
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

    // Case « Préalable » — même contrainte d'ordre (déplacée ici le 12 août).
    var casePrealable = extra.querySelector('#planif-panneau-prealable');
    if (casePrealable) {
        casePrealable.addEventListener('change', function(e) {
            enregistrerPourUndo();
            if (!donnees.metadata) donnees.metadata = {};
            donnees.metadata.prealable = e.target.checked;
            mettreAJourApparenceNoeud(donnees);
            document.getElementById('planif-panneau-pastille').style.background = obtenirCouleurNoeud(donnees);
            document.getElementById('planif-panneau-type').textContent = obtenirLabelNoeud(donnees);
            sauvegarder();
        });
    }

    // #416 lot B : « Travail hors classe » — même contrainte d'ordre. Le HTML
    // est écrit plus haut avec les autres champs du type ; l'écouteur ne peut
    // être attaché qu'ICI, une fois que plus rien ne réécrit `extra`.
    var caseHorsClasse = extra.querySelector('#planif-panneau-hors-classe');
    if (caseHorsClasse) {
        caseHorsClasse.addEventListener('change', function(e) {
            enregistrerPourUndo();
            definirHorsClasse(donnees.id, e.target.checked);
            // Le bloc de la carte porte le champ Durée : cocher le fait
            // disparaître (D3), décocher le fait revenir. Sans ce re-rendu, le
            // champ resterait à l'écran jusqu'au prochain passage.
            reconstruireDOM();
            ouvrirPanneau(donnees.id);
        });
    }

    // #424 Lot E : rétroaction (formative sur activité, « sur le rendu » sur
    // évaluation) et production — même contrainte d'ordre que « Dans la
    // leçon ». La valeur « aucune » RETIRE le champ : un défaut n'est pas un
    // rattachement (même règle que le relevé D1).
    var selRetro = extra.querySelector('#planif-panneau-retroaction');
    if (selRetro) {
        selRetro.addEventListener('change', function(e) {
            enregistrerPourUndo();
            appliquerRetroactionNoeud(donnees, e.target.value);
            sauvegarder();
        });
    }
    var selProd = extra.querySelector('#planif-panneau-production');
    if (selProd) {
        selProd.addEventListener('change', function(e) {
            enregistrerPourUndo();
            if (!donnees.metadata) donnees.metadata = {};
            donnees.metadata.productionId = e.target.value || null;
            sauvegarder();
        });
    }

    // #403 : même contrainte d'ordre que « Dans la leçon » ci-dessus.
    var casesServies = extra.querySelectorAll('.planif-objectif-servi');
    if (casesServies.length > 0) {
        var appliquerCasesServies = function() {
            var choisis = [];
            var toutes = extra.querySelectorAll('.planif-objectif-servi');
            for (var ci3 = 0; ci3 < toutes.length; ci3++) {
                if (toutes[ci3].checked) choisis.push(toutes[ci3].getAttribute('data-obj-id'));
            }
            definirObjectifsServis(id, choisis);
            // La pastille vit sur la LEÇON, pas sur le nœud qu'on édite : c'est
            // elle qu'il faut rafraîchir pour que le geste ait un retour visible.
            var leconMaj = leconParenteDe(donnees);
            if (leconMaj) rafraichirPastillesObjectifs(leconMaj);
        };
        for (var ci4 = 0; ci4 < casesServies.length; ci4++) {
            casesServies[ci4].addEventListener('change', function() {
                enregistrerPourUndo();
                appliquerCasesServies();
            });
        }
    }

    panneau.classList.add('visible');
    etat.panneauOuvert = true;
    etat.panneauNoeudId = id;

    // #695 — l'horaire de chaque groupe se construit ICI, une fois par
    // ouverture ; les gestes qui suivent ne font que relire ce cache.
    horairesInspecteur = null;
    if (document.getElementById('planif-panneau-date')) {
        var exporteurDate = window.planificationExport;
        if (exporteurDate && typeof exporteurDate.horairesDesGroupesDuCours === 'function') {
            var coursDate = exporteurDate.coursDeLaCarteActive();
            horairesInspecteur = { coursId: coursDate, groupes: exporteurDate.horairesDesGroupesDuCours(coursDate) };
        }
        rafraichirDateInspecteur();
    }
}

// === LA DATE DANS L'INSPECTEUR (#695, 22 sept. 2026) ===
//
// Une ligne de LECTURE SEULE, jamais un champ : la date est la conséquence du
// couple (semaine, rang) et de l'horaire du groupe. La rendre modifiable en
// ferait une troisième source de vérité. Le calcul n'est pas ici : il vit dans
// `planification-export.js` (`lignesDateDeLecon`), le même que l'export du plan.

var LIGNE_DATE_INSPECTEUR_HTML =
    '<label>Date</label><div class="planif-panneau-derive" id="planif-panneau-date"></div>';

/** { coursId, groupes } construit à l'ouverture de l'Inspecteur, ou null. */
var horairesInspecteur = null;

/**
 * Réécrit la ligne « Date » de l'Inspecteur ouvert, si elle y est. Appelée à
 * chaque `sauvegarder()` : c'est le point par où passent TOUS les gestes qui la
 * changent — semaine (Inspecteur, sélecteur de l'en-tête, glisser dans la
 * grille), rang (`B`), leçon parente. (Annuler ferme l'Inspecteur.)
 */
function rafraichirDateInspecteur() {
    if (!etat.panneauOuvert) return;
    var cible = document.getElementById('planif-panneau-date');
    if (!cible) return;
    var n = etat.noeuds.get(etat.panneauNoeudId);
    var exporteur = window.planificationExport;
    if (!n || !horairesInspecteur || !exporteur || typeof exporteur.lignesDateDeLecon !== 'function') {
        cible.textContent = '';
        return;
    }
    var lecon = n.type === 'lecon' ? n : leconParenteDe(n);
    var rang = rangSeanceDeLecon(lecon);
    var lignes = exporteur.lignesDateDeLecon({
        horsLecon: !lecon,
        coursId: horairesInspecteur.coursId,
        groupes: horairesInspecteur.groupes,
        semaine: semaineDeLecon(lecon),
        rang: rang,
        lettre: lettreRangSeance(rang)
    });
    // textContent : le nom d'un groupe est une donnée saisie.
    cible.replaceChildren.apply(cible, lignes.map(function(texte) {
        var ligne = document.createElement('div');
        ligne.textContent = texte;
        return ligne;
    }));
}

function fermerPanneau() {
    if (panneau) panneau.classList.remove('visible');
    etat.panneauOuvert = false;
    etat.panneauNoeudId = null;
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
    // Purge de la note de leçon (#367, 7 août 2026). Elle ne l'était JAMAIS :
    // l'entrée survivait au nœud et, comme les ids de leçon sont recyclés par le
    // compteur de la carte, une leçon créée plus tard pouvait HÉRITER des notes
    // d'une leçon supprimée. La clé composite le rend possible sans risque de
    // toucher une autre carte.
    if (donnees && donnees.type === 'lecon') {
        try {
            var cleNotePurge = cleNoteLecon(id);
            if (cleNotePurge) {
                var notes = db.getSync(window.cle(CLE_SEANCES), {}) || {};
                if (cleNotePurge in notes) {
                    delete notes[cleNotePurge];
                    db.setSync(window.cle(CLE_SEANCES), notes); // security-ok: purge locale, aucune source externe
                }
            }
        } catch (e) {
            console.warn('[Planification] Purge de la note de leçon échouée (bénin) :', e);
        }
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
 * @param {string} noeudId - conteneur à copier
 * @param {boolean} [silencieux] - ne pas afficher le toast (duplication en
 *   lot : un seul message pour tout le geste, pas N messages empilés).
 * @returns {string|null} id de la racine copiée
 */
function dupliquerConteneurEnProfondeur(noeudId, silencieux, cloneDemande) {
    var source = etat.noeuds.get(noeudId);
    if (!source) return null;
    var configD = TYPES[source.type];
    if (!configD || !configD.conteneur) return null;

    enregistrerPourUndo();
    var DX = 40, DY = 40;
    var correspondance = new Map();
    // #403 : les objectifs de la copie reçoivent de NOUVEAUX ids (ci-dessous),
    // donc les `objectifsServis` de ses activités doivent suivre — sinon la
    // copie naît avec des liens pointant vers les objectifs de l'ORIGINALE,
    // que objectifsServisPar() écarterait silencieusement. La leçon est copiée
    // avant ses enfants : la correspondance est toujours prête à temps.
    // ⚠ R2 (relecture de Cowork, 28 sept.) : « toujours prête à temps » était
    // faux depuis #964. Une évaluation peut cocher l'objectif d'une AUTRE leçon
    // du sous-arbre ; si cette leçon vient après elle dans `enfants`, son
    // objectif n'était pas encore renuméroté quand l'évaluation était copiée,
    // et la copie gardait l'objectif de l'ORIGINALE. Deux passes désormais :
    // toute la correspondance des objectifs du sous-arbre d'abord, la copie
    // ensuite.
    var correspondanceObjectifs = new Map();
    (function preparerObjectifs(nid, vus) {
        var n = etat.noeuds.get(nid);
        if (!n || vus[nid]) return;
        vus[nid] = true;
        if (n.metadata && Array.isArray(n.metadata.objectifs)) {
            n.metadata.objectifs.forEach(function(o) {
                if (o && o.id && !correspondanceObjectifs.has(o.id)) correspondanceObjectifs.set(o.id, nouvelIdObjectif());
            });
        }
        (n.enfants || []).forEach(function(eid) { preparerObjectifs(eid, vus); });
    })(noeudId, {});

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
            nouveau.metadata.objectifs.forEach(function(o) {
                if (!o) return;
                o.id = (o.id && correspondanceObjectifs.get(o.id)) || nouvelIdObjectif();
            });
        }
        if (Array.isArray(nouveau.metadata.objectifsServis)) {
            // #964 — une ÉVALUATION peut vérifier l'objectif d'une leçon placée
            // avant la sienne : cet id n'est pas dans la copie, il vise une
            // leçon qui existe toujours, il se garde tel quel. Les autres blocs
            // ne servent que leur leçon : un id hors correspondance y reste écarté.
            var estEvaluation = nouveau.type === 'evaluation';
            nouveau.metadata.objectifsServis = nouveau.metadata.objectifsServis
                .map(function(oid) { return correspondanceObjectifs.get(oid) || (estEvaluation ? oid : null); })
                .filter(Boolean);
            if (nouveau.metadata.objectifsServis.length === 0) {
                delete nouveau.metadata.objectifsServis;
            }
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
    if (!silencieux) {
        // #459 (20 août 2026, porte types-familles 1.2) : quand ⇧ était tenu,
        // l'app faisait la copie SANS dire pourquoi le clone n'avait pas eu
        // lieu — Grégoire a conclu que ⇧⌥ ne clonait pas du tout. Un geste
        // ignoré se DIT, il ne s'avale pas.
        afficherToastLien(cloneDemande
            ? 'Copie indépendante créée — une leçon ou une séquence ne se clone jamais : le clone lié (⇧) est réservé aux blocs simples.'
            : 'Copie indépendante créée — modifie-la sans toucher l\'originale.');
    }
    return racineId;
}

/**
 * DUPLIQUER UN BLOC — copie indépendante, ou clone lié (16 août 2026).
 *
 * ⚠⚠ LA DISTINCTION EST DE GRÉGOIRE, ET ELLE ÉTAIT ABSENTE DU CODE. Ses mots :
 * « une COPIE est indépendante de l'originale ; un CLONE en est dépendant.
 * Quand modifier le deuxième altère aussi l'original, ce n'est pas une copie,
 * c'est un clone. » Or `⌥ + glisser` sur une FEUILLE produisait un clone lié
 * depuis le 4 août, sous un geste qui laissait croire à une copie — et rien à
 * l'écran ne le disait avant que le bloc ne se mette à changer tout seul.
 *
 * ▣ CE N'EST PAS UNE RÉGRESSION DU 16 AOÛT, mais c'est lui qui l'a révélée :
 * jusqu'à la généralisation du sélecteur, seuls le titre, la durée et la
 * metadata se propageaient. Le TYPE s'y est ajouté, et un clone qui change de
 * type sous les yeux de son jumeau ne peut plus passer inaperçu.
 *
 * ⮕ LA RÈGLE, UNE SEULE POUR TOUS LES GESTES (décision de Grégoire) :
 *   **sans ⇧ → copie indépendante · avec ⇧ → clone lié.**
 *   `⌥ glisser` / `⌘D` → copie ; `⇧⌥ glisser` / `⇧⌘D` → clone.
 *
 * ⚠ `lie` est FAUX PAR DÉFAUT, et c'est délibéré. Un appelant qu'on oublierait
 * de mettre à jour produira une copie indépendante — l'issue inoffensive. Le
 * défaut inverse ferait qu'un oubli relie silencieusement deux blocs, c'est-à-dire
 * exactement le défaut qu'on vient de corriger.
 *
 * @param {string} noeudId - le bloc à dupliquer
 * @param {boolean} [silencieux] - ne pas afficher le toast (duplication en lot)
 * @param {boolean} [lie] - true = clone lié (miroir) ; défaut = copie indépendante
 * @returns {string|null} id du nouveau bloc
 */
function dupliquerNoeud(noeudId, silencieux, lie) {
    var source = etat.noeuds.get(noeudId);
    if (!source) return;
    var config = TYPES[source.type];
    if (config && config.conteneur) {
        // Conteneur : copie indépendante en profondeur, TOUJOURS. Le miroir lié
        // reste réservé aux feuilles — la synchronisation des ENFANTS entre deux
        // instances n'a pas de réponse simple, et la metadata propagée
        // embarquerait la semaine (décision du 6 août, inchangée).
        // #459 : `lie` est transmis pour que le toast DISE que le ⇧ a été
        // ignoré, au lieu de l'avaler en silence.
        return dupliquerConteneurEnProfondeur(noeudId, silencieux, lie);
    }
    enregistrerPourUndo();

    var DECALAGE = 60;
    var newId = 'planif-noeud_' + (++etat.compteur);
    // ⚠ Un clone DE clone rejoint la même famille (on remonte à la source),
    // alors qu'une copie ne rejoint rien : `null` la rend indépendante, même
    // quand elle est faite depuis un bloc qui est lui-même un clone.
    var cloneSourceId = lie ? (source.cloneSourceId || source.id) : null;

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
    if (cloneSourceId) _indexerClone(donnees);

    var el = document.createElement('div');
    el.className = 'planif-noeud planif-type-' + source.type;
    el.id = newId;
    el.style.left = donnees.x + 'px';
    el.style.top = donnees.y + 'px';
    el.style.borderColor = obtenirCouleurNoeud(donnees);

    el.innerHTML = contenuNoeudHTML(donnees);

    attacherEvenements(el, donnees);
    // Même garde que `reconstruireDOM` : sans canevas monté (module pas encore
    // initialisé, ou bac à sable de test), la DONNÉE reste la vérité et le
    // rendu suivra au montage. `reconstruireDOM` se gardait déjà, ces deux
    // sites-ci non — asymétrie relevée en écrivant la sentinelle du 11 août.
    if (coucheNoeuds) coucheNoeuds.appendChild(el);

    // L'indicateur 🧬 ne concerne QUE les clones : une copie indépendante n'a
    // aucune famille à signaler, et lui en poser un serait dire le contraire de
    // ce qu'elle est.
    if (cloneSourceId) {
        mettreAJourIndicateurClone(donnees);
        var sourceOriginal = etat.noeuds.get(cloneSourceId);
        if (sourceOriginal) mettreAJourIndicateurClone(sourceOriginal);
        // Les autres membres de la famille : leur indicateur compte un membre
        // de plus.
        var tousClones = trouverClones(newId);
        for (var ci = 0; ci < tousClones.length; ci++) {
            if (tousClones[ci].id !== newId && tousClones[ci].id !== cloneSourceId) {
                mettreAJourIndicateurClone(tousClones[ci]);
            }
        }
    }

    selectionnerNoeud(newId);
    sauvegarder();
    // #459 : le chemin feuille était MUET — clone comme copie se créaient sans
    // un mot, et seul l'indicateur 🧬 distinguait les deux. Le geste dit
    // maintenant ce qu'il vient de faire (même règle que les conteneurs).
    if (!silencieux) {
        afficherToastLien(cloneSourceId
            ? 'Clone lié créé — titre, durée et type suivront l\'original (indicateur 🧬).'
            : 'Copie indépendante créée — modifie-la sans toucher l\'originale.');
    }
    return newId;
}

/**
 * DÉCLONER : DÉTACHER UN BLOC DE SES CLONES (16 août 2026, demande de Grégoire).
 * ⮕ À l'écran, le geste s'appelle « Décloner » depuis le 3 septembre 2026 — ses
 * mots : rendre le clonage réversible, sans prolonger la métaphore généalogique.
 * Le nom de la fonction reste : il dit ce que le code fait à la donnée, et il
 * n'est lu par personne d'autre que nous.
 *
 * ⚠⚠ POURQUOI ÇA MANQUAIT. La distinction copie / clone est livrée le même jour,
 * mais elle ne vaut que pour les gestes À VENIR. Les blocs qu'il a dupliqués
 * avant — avec un `⌥` qui rendait un clone sans le dire — restent liés, et il a
 * choisi de ne PAS les convertir en masse (« on n'y touche pas »). Sans porte de
 * sortie, ce choix l'enfermait : aucun moyen de rompre un lien sur un bloc
 * précis, celui qui le surprend.
 *
 * ▣ DEUX SENS, PARCE QU'UNE FAMILLE A DEUX RÔLES — et c'est ce qu'il faut avoir
 * en tête avant de lire le code :
 *   • sur un CLONE (`cloneSourceId` posé) → lui seul quitte la famille ;
 *   • sur l'ORIGINAL (pas de `cloneSourceId`, mais des clones qui le visent) →
 *     la famille se DISSOUT, tous ses clones deviennent indépendants.
 * ⮕ Le second cas n'est pas un choix esthétique : un original ne peut pas
 * « partir » en laissant ses clones pointer vers lui. Ou il reste, ou la famille
 * n'existe plus. Prétendre le détacher seul laisserait des clones orphelins
 * pointant vers un id qui n'est plus une source — un état que rien ne sait lire.
 *
 * ⚠ AUCUNE AUTRE DONNÉE N'EST TOUCHÉE. Titre, durée, type, metadata, position,
 * liens : tout reste. Détacher ne défait pas les propagations passées, il arrête
 * les propagations futures. Un bloc détaché garde ce qu'il avait reçu.
 *
 * @param {string[]} noeudIds - blocs sur lesquels le geste porte (la sélection)
 * @returns {number} nombre de blocs réellement détachés
 */
function detacherDeLaFamille(noeudIds) {
    if (!noeudIds || !noeudIds.length) return 0;

    // On calcule d'ABORD l'ensemble à détacher, puis on écrit. Sans cette
    // séparation, dissoudre une famille pendant qu'on la parcourt ferait
    // dépendre le résultat de l'ordre de la sélection.
    var aDetacher = new Set();
    for (var i = 0; i < noeudIds.length; i++) {
        var n = etat.noeuds.get(noeudIds[i]);
        if (!n) continue;
        if (n.cloneSourceId) {
            aDetacher.add(n.id);
        } else if (aDesClones(n.id)) {
            // L'original : la famille entière se dissout.
            var membres = trouverClones(n.id);
            for (var m = 0; m < membres.length; m++) {
                if (membres[m].cloneSourceId) aDetacher.add(membres[m].id);
            }
        }
    }
    if (aDetacher.size === 0) return 0;

    enregistrerPourUndo();
    // Les originaux dont la famille change : leur indicateur 🧬 doit être
    // recalculé APRÈS coup — un original sans plus aucun clone n'en porte plus.
    var originauxTouches = new Set();
    aDetacher.forEach(function(id) {
        var n = etat.noeuds.get(id);
        if (!n) return;
        originauxTouches.add(n.cloneSourceId);
        _desindexerClone(n);
        n.cloneSourceId = null;
        mettreAJourIndicateurClone(n);
    });
    originauxTouches.forEach(function(id) {
        var o = etat.noeuds.get(id);
        if (o) mettreAJourIndicateurClone(o);
    });
    sauvegarder();
    return aDetacher.size;
}

/**
 * DÉCLONER — ce que l'écran dit APRÈS le geste, en un seul endroit (3 sept. 2026).
 *
 * Deux boutons appellent `detacherDeLaFamille` : le menu Actions, sur la
 * SÉLECTION (c'est lui qui sert le lot), et l'Inspecteur, sur le bloc affiché
 * (c'est là qu'on voit les instances, donc là qu'on cherche la sortie). Le
 * message qui suit ne doit pas diverger d'un bouton à l'autre : il vit ici,
 * pas dans chaque écouteur.
 *
 * ⚠ « Décloner » peut se lire « supprimer le clone ». Le geste ne détruit rien,
 * et le message le dit en toutes lettres : le contenu est inchangé.
 *
 * @param {number} n - ce que `detacherDeLaFamille` a rendu
 */
function annoncerDeclonage(n) {
    if (n === 0) {
        afficherToastLien('Rien à décloner : aucun des blocs sélectionnés n’est un clone, ni l’original d’un clone.');
        return;
    }
    afficherToastLien(n === 1
        ? 'Bloc décloné — il ne suivra plus son original, et son original ne le suivra plus. Son contenu est inchangé.'
        : n + ' blocs déclonés — ils ne se suivent plus. Leur contenu est inchangé.');
}

/**
 * Dupliquer TOUTE la multi-sélection en un geste (⌘D).
 *
 * Demande de Grégoire, 11 août 2026, en préparant son 601-101 : « je voudrais
 * pouvoir dupliquer d'un coup plusieurs éléments sélectionnés ».
 *
 * ▣ Ce n'est pas une fonctionnalité neuve, c'est une ASYMÉTRIE refermée. La
 * multi-sélection existe depuis longtemps (⌘+clic, ⌘A) et `Supprimer` la
 * traite déjà en lot, avec le lot d'undo qui va avec (`gererKeydown`, touche
 * Delete). ⌘D, lui, ne regardait que `etat.selection` — un seul nœud, quel
 * que soit le nombre de blocs allumés à l'écran. Rien ne le signalait :
 * l'utilisateur sélectionnait cinq blocs, appuyait, et n'en obtenait qu'un.
 *
 * ⚠ **On ne duplique que les RACINES de la sélection.** Un conteneur copie
 * déjà ses descendants (`dupliquerConteneurEnProfondeur`). Si une leçon ET
 * l'une de ses activités sont toutes deux sélectionnées, dupliquer l'activité
 * à part en ferait une SECONDE copie, hors de la leçon copiée — un doublon
 * orphelin que rien ne rattache. Le filtre par descendance est donc une
 * condition de justesse, pas une optimisation.
 *
 * Un seul instantané d'undo pour tout le geste (`_undoBatch`), comme pour la
 * suppression multiple : ⌘Z défait la duplication entière, pas bloc par bloc.
 *
 * @returns {string[]} ids des copies créées (vide si rien à dupliquer)
 */
function dupliquerSelection(lie) {
    var ids = Array.from(etat.multiSelection);

    // Sélection simple : le chemin d'origine, inchangé.
    if (ids.length === 0) {
        if (etat.selection) {
            var seul = dupliquerNoeud(etat.selection, false, lie);
            return seul ? [seul] : [];
        }
        return [];
    }
    if (ids.length === 1) {
        var unique = dupliquerNoeud(ids[0], false, lie);
        return unique ? [unique] : [];
    }

    var couverts = new Set();
    for (var i = 0; i < ids.length; i++) {
        var nd = etat.noeuds.get(ids[i]);
        if (!nd || !TYPES[nd.type] || !TYPES[nd.type].conteneur || !nd.enfants) continue;
        var desc = [];
        collecterDescendants(nd, nd, desc);
        for (var d = 0; d < desc.length; d++) couverts.add(desc[d].id);
    }
    var racines = ids.filter(function (id) { return !couverts.has(id); });
    if (racines.length === 0) return [];

    enregistrerPourUndo();
    _undoBatch = true;
    var nouveaux = [];
    try {
        for (var r = 0; r < racines.length; r++) {
            var nid = dupliquerNoeud(racines[r], true, lie);
            if (nid) nouveaux.push(nid);
        }
    } finally {
        _undoBatch = false;
    }

    // Les copies deviennent la sélection : le geste suivant (les déplacer,
    // les aligner) porte sur ce qu'on vient de créer, pas sur les originaux.
    // Après `dupliquerConteneurEnProfondeur`, le DOM a été reconstruit — d'où
    // le marquage APRÈS la boucle et non pendant.
    deselectionnerTout();
    for (var n = 0; n < nouveaux.length; n++) {
        etat.multiSelection.add(nouveaux[n]);
        var elN = document.getElementById(nouveaux[n]);
        if (elN) elN.classList.add('selected');
    }

    if (nouveaux.length > 0) {
        afficherToastLien(nouveaux.length + ' copies créées — elles sont sélectionnées, glisse-les où tu veux.');
        majBarreAlignement();
        sauvegarder();
    }
    return nouveaux;
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
    var pid = e ? e.pointerId : undefined;
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
        if (pid !== undefined && e2.pointerId !== pid) return;
        lienTemp.style.display = 'none';
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);

        var elSous = document.elementFromPoint(e2.clientX, e2.clientY);
        // #445 — une LIGNE D'OBJECTIF intercepte le dépôt avant le nœud qui la
        // contient. L'ordre compte : la ligne vit DANS la leçon, donc
        // `closest('.planif-noeud')` la capterait aussi et le geste retomberait
        // dans le menu de lien, où l'objectif n'existe pas comme cible.
        var ligneObjectif = elSous ? elSous.closest('.planif-noeud-objectif-ligne') : null;
        if (ligneObjectif && deposerLienSurObjectif(noeudId, ligneObjectif)) {
            etat.lienEnCours = null;
            return;
        }
        var noeudCibleEl = elSous ? elSous.closest('.planif-noeud') : null;
        if (noeudCibleEl && noeudCibleEl.id !== noeudId) {
            afficherMenuLien(e2.clientX, e2.clientY, noeudId, noeudCibleEl.id);
        }
        etat.lienEnCours = null;
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
}

/**
 * #445 (10 août 2026) — Déposer un lien sur une ligne d'objectif COCHE la case
 * « objectifs servis » du nœud source.
 *
 * POURQUOI CE CHEMIN EXISTE. #403 a tranché que le lien objectif↔activité se
 * déclare par cases à cocher, et ce choix reste le bon (l'objectif n'est pas un
 * nœud, la liste est bornée à sa leçon, et ça marche au doigt). Mais le canevas
 * enseigne le tracé de lien partout ailleurs : au terrain du 10 août, Grégoire a
 * tenté de relier une activité à un objectif **en traçant**, et n'a rien obtenu.
 * Ce n'était pas un bug — c'était un canal inexistant, donc un silence. On ne
 * remplace pas le déclaratif : on branche le geste que l'interface a appris à
 * l'utilisateur sur la MÊME écriture (`definirObjectifsServis`), porte unique.
 *
 * ⮕ Le dépôt AJOUTE, il ne bascule pas : « cette activité sert cet objectif »
 * est une affirmation, et un second dépôt sur la même ligne ne peut pas
 * raisonnablement vouloir dire le contraire. Le décochage reste à l'Inspecteur,
 * là où l'état est visible.
 *
 * ⚠ Refus EXPLICITES plutôt que silence — c'est tout le sujet de l'item : un
 * geste sans effet et sans message est indiscernable d'un bug.
 *
 * @param {string} sourceId - nœud d'où part le lien
 * @param {HTMLElement} ligneEl - la ligne d'objectif sous le point de dépôt
 * @returns {boolean} true si le dépôt a été TRAITÉ ici (écriture ou refus dit),
 *   false s'il faut laisser le chemin normal du menu de lien s'appliquer.
 */
function deposerLienSurObjectif(sourceId, ligneEl) {
    var champ = ligneEl.querySelector('.planif-noeud-objectif[data-obj-id]');
    var objectifId = champ ? champ.getAttribute('data-obj-id') : null;
    // Ligne d'accueil (objectif pas encore créé) : rien à servir. On rend la
    // main au chemin normal plutôt que d'inventer un message.
    if (!objectifId) return false;

    var source = etat.noeuds.get(sourceId);
    if (!source) return false;

    if (TYPES_SERVANTS_OBJECTIF.indexOf(source.type) === -1) {
        afficherToastLien('Ce bloc ne peut pas servir un objectif — seules les activités, les exposés et les évaluations le peuvent.');
        return true;
    }

    var leconEl = ligneEl.closest('.planif-noeud');
    var leconObjectif = leconEl ? etat.noeuds.get(leconEl.id) : null;
    var leconSource = leconParenteDe(source);

    // #964 — une évaluation coche les objectifs de sa leçon ou d'une leçon
    // placée avant elle : le même ensemble que son Inspecteur propose.
    if (source.type === 'evaluation') {
        if (!leconObjectif || leconsProposeesAEvaluation(source).indexOf(leconObjectif) === -1) {
            afficherToastLien('Une évaluation coche les objectifs de sa leçon ou d’une leçon placée avant elle.');
            return true;
        }
        var dejaVerifies = objectifsVerifiesPar(source);
        if (dejaVerifies.indexOf(objectifId) !== -1) {
            afficherToastLien('Déjà coché : cette évaluation vérifie cet objectif.');
            return true;
        }
        enregistrerPourUndo();
        definirObjectifsServis(sourceId, dejaVerifies.concat([objectifId]));
        if (etat.panneauOuvert && etat.panneauNoeudId === sourceId) {
            var caseEval = document.querySelector(
                '.planif-objectif-servi[data-obj-id="' + (window.CSS && CSS.escape ? CSS.escape(objectifId) : objectifId) + '"]');
            if (caseEval) caseEval.checked = true;
        }
        afficherToastLien('Objectif coché : cette évaluation le vérifie désormais.');
        return true;
    }

    if (!leconObjectif || !leconSource || leconObjectif.id !== leconSource.id) {
        // Refus assumé, et pas défensif : `objectifsServisPar` filtre à la leçon
        // parente. Écrire un id étranger produirait une case cochée que la
        // lecture écarterait aussitôt — un mensonge silencieux.
        afficherToastLien('Un objectif ne peut être servi que par un bloc de SA leçon. Déplace le bloc dans cette leçon d’abord.');
        return true;
    }

    // Base = la liste FILTRÉE : les ids devenus étrangers (clone déplacé,
    // objectif retiré) ne sont pas réécrits au passage.
    var deja = objectifsServisPar(source);
    if (deja.indexOf(objectifId) !== -1) {
        afficherToastLien('Déjà coché : ce bloc sert cet objectif.');
        return true;
    }

    enregistrerPourUndo();
    definirObjectifsServis(sourceId, deja.concat([objectifId]));
    rafraichirPastillesObjectifs(leconObjectif);

    // Si l'Inspecteur est ouvert SUR CE NŒUD, sa case doit suivre — sinon deux
    // surfaces diraient deux choses. On vise par l'id du nœud inspecté, pas par
    // la seule présence d'une case : un autre bloc de la même leçon affiche les
    // mêmes objectifs, et cocher la sienne serait faux.
    if (etat.panneauOuvert && etat.panneauNoeudId === sourceId) {
        var caseInspecteur = document.querySelector(
            '.planif-objectif-servi[data-obj-id="' + (window.CSS && CSS.escape ? CSS.escape(objectifId) : objectifId) + '"]');
        if (caseInspecteur) caseInspecteur.checked = true;
    }

    afficherToastLien('Objectif coché — ce bloc le sert désormais.');
    return true;
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

/* =====================================================================
   ROUTAGE DES LIENS — CONTOURNER LES BLOCS (15 août 2026)

   Demande de Grégoire, captures à l'appui : « je voudrais éviter que les
   liens passent par-dessus d'autres blocs ».

   ▣ CE QUI SE PASSAIT. Un lien était UNE courbe entre deux ports, et les
   ports étaient choisis sur le seul axe dominant : si l'écart horizontal
   l'emportait, ce serait droite→gauche, sinon haut→bas. Rien ne regardait ce
   qu'il y avait ENTRE les deux. Sur sa carte, « se vérifie par » traversait
   ainsi toute une leçon et trois blocs en diagonale.

   ▣ CE QU'ON FAIT, ET DANS CET ORDRE — c'est l'ordre qui compte :
     1. CHOISIR LES PORTS. On essaie les seize combinaisons et on garde celle
        qui ne traverse rien. À elle seule elle règle la majorité des cas,
        pour un coût dérisoire : souvent le chemin existait déjà, on le
        prenait juste par le mauvais côté.
     2. DÉVIER, seulement si aucune combinaison n'est libre. On ajoute UN
        point de passage à côté de ce qui gêne, et on relie le tout par une
        courbe lisse. Le style reste celui d'aujourd'hui (arbitrage de
        Grégoire : courbes déviées, pas coudes à angle droit).
     3. ACCEPTER LE MOINS MAUVAIS si même la déviation ne dégage pas. Une
        carte peut être trop dense pour qu'un passage existe ; on ne fait pas
        semblant, on prend le tracé qui traverse le moins.

   ⚠ CE QUI N'EST PAS UN OBSTACLE, et c'est essentiel : les CONTENEURS qui
   contiennent une des deux extrémités. Un lien d'un bloc de la leçon A vers
   un bloc de la leçon B doit forcément sortir du cadre de A et entrer dans
   celui de B — les compter comme obstacles rendrait tout tracé impossible et
   on tomberait toujours dans le cas 3.
   ===================================================================== */

/* ── LE CONTOURNEMENT EST UN CHOIX (15 août 2026, demande de Grégoire) ──
   « Est-ce que ce serait beaucoup de travail que d'offrir l'option, de sorte
   que s'il préfère la version antérieure les deux s'offrent à lui ? »

   ▣ Le tracé direct N'EST PAS un repli de compatibilité — ce serait
   exactement l'empilement « au cas où » que la règle zéro-dette du projet
   refuse. C'est un réglage que l'enseignant pose et voit : sur une carte
   aérée, la courbe directe se lit mieux qu'un contournement qui s'écarte pour
   rien. Les deux chemins sont donc vivants, et tous deux éprouvés.

   ⚠ LE DÉFAUT EST « CONTOURNER » : c'est le comportement que Grégoire a jugé
   « beaucoup mieux ». Une carte existante s'ouvre donc contournée sans qu'il
   ait rien à faire.

   ⚠ LU UNE FOIS, PAS À CHAQUE LIEN. `calculerTraceLien` est appelée pour
   CHAQUE lien à chaque redessin ; interroger le stockage à chaque appel
   paierait un accès disque par lien et par image pendant un glisser. */
var CLE_PREF_CONTOURNER = 'planif-liens-contourner';
var _lienContourner = true;

function chargerPrefContournement() {
    var v = db.getSync(CLE_PREF_CONTOURNER, null);
    _lienContourner = (v === null || v === undefined) ? true : !!v;
    return _lienContourner;
}

function definirContournement(actif) {
    _lienContourner = !!actif;
    db.setSync(CLE_PREF_CONTOURNER, _lienContourner);
    majItemContournement();
    // Redessiner TOUS les liens : le réglage change leur tracé, pas leur
    // contenu — inutile de reconstruire la carte entière.
    for (var e of etat.liens) dessinerLien(e[1]);
}

function contournementActif() { return _lienContourner; }

/**
 * L'item du menu porte son ÉTAT, pas seulement son nom.
 *
 * ⚠ Un item de menu qui dit « Liens : contourner les blocs » sans rien
 * d'autre ne répond pas à la question qu'on se pose en l'ouvrant — « est-ce
 * que c'est actif en ce moment ? ». La coche le dit ; le sous-titre dit ce
 * qu'on obtiendra en cliquant, pour qu'on n'ait pas à essayer pour savoir.
 */
function majItemContournement() {
    var btn = document.getElementById('planif-btn-liens-contourner');
    if (!btn) return;
    btn.textContent = (_lienContourner ? '✓ ' : '') + 'Liens : contourner les blocs';
    btn.title = _lienContourner
        ? 'Actif — les liens évitent les blocs. Cliquer pour revenir au tracé direct.'
        : 'Inactif — les liens vont droit au but. Cliquer pour qu\'ils contournent.';
    btn.setAttribute('aria-pressed', _lienContourner ? 'true' : 'false');
}

// Marge autour d'un bloc : le lien ne doit pas le frôler non plus.
var LIEN_MARGE = 14;
// Nombre de points échantillonnés le long d'une courbe pour la tester. 18 est
// le compromis mesuré : en dessous, une courbe traverse un bloc étroit entre
// deux points sans qu'on le voie.
var LIEN_ECHANTILLONS = 18;
var LIEN_PORTS = ['droite', 'gauche', 'haut', 'bas'];

/** Rectangle d'un nœud en coordonnées d'espace, marge comprise. */
function rectNoeud(id, marge) {
    var nd = etat.noeuds.get(id);
    if (!nd) return null;
    var el = document.getElementById(id);
    var w = el ? (el.offsetWidth || 140) : 140;
    var h = el ? (el.offsetHeight || 50) : 50;
    var m = marge || 0;
    return { x1: nd.x - m, y1: nd.y - m, x2: nd.x + w + m, y2: nd.y + h + m };
}

/** Remonte la chaîne des conteneurs d'un nœud (lui-même compris). */
function _chaineAncetres(id, sortie) {
    var vus = {};
    var courant = id;
    while (courant && !vus[courant]) {
        vus[courant] = true;
        sortie[courant] = true;
        var nd = etat.noeuds.get(courant);
        courant = nd ? nd.parent : null;
    }
}

/**
 * Les blocs qu'un lien doit contourner.
 *
 * Exclut les deux extrémités et TOUS leurs conteneurs ancêtres : traverser le
 * cadre de sa propre leçon est inévitable quand on en sort.
 */
function obstaclesPourLien(sourceId, cibleId) {
    var exclus = {};
    _chaineAncetres(sourceId, exclus);
    _chaineAncetres(cibleId, exclus);

    // Boîte de travail : les deux extrémités, élargies. Un bloc situé à
    // l'autre bout de la carte ne peut pas gêner ce lien — le tester à chaque
    // combinaison de ports serait payer 150 blocs pour en écarter 145. Mesuré
    // le 15 août : c'est ce filtre qui rend le routage tenable sur une carte
    // dense. La marge généreuse laisse la place à une déviation.
    var ra = rectNoeud(sourceId, 0), rb = rectNoeud(cibleId, 0);
    var zone = null;
    if (ra && rb) {
        var MARGE_ZONE = 260;
        zone = {
            x1: Math.min(ra.x1, rb.x1) - MARGE_ZONE, y1: Math.min(ra.y1, rb.y1) - MARGE_ZONE,
            x2: Math.max(ra.x2, rb.x2) + MARGE_ZONE, y2: Math.max(ra.y2, rb.y2) + MARGE_ZONE
        };
    }

    var liste = [];
    for (var entree of etat.noeuds) {
        var id = entree[0];
        if (exclus[id]) continue;
        var r = rectNoeud(id, LIEN_MARGE);
        if (!r) continue;
        if (zone && (r.x2 < zone.x1 || r.x1 > zone.x2 || r.y2 < zone.y1 || r.y1 > zone.y2)) continue;
        liste.push(r);
    }
    return liste;
}

function _dansRect(x, y, r) {
    return x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2;
}

/** Vecteur sortant d'un port — la direction dans laquelle le lien démarre. */
function _directionPort(port) {
    if (port === 'droite') return { x: 1, y: 0 };
    if (port === 'gauche') return { x: -1, y: 0 };
    if (port === 'bas') return { x: 0, y: 1 };
    return { x: 0, y: -1 };
}

/**
 * Courbe lisse passant par TOUS les points donnés, en partant et en arrivant
 * dans la direction des ports.
 *
 * Les points intermédiaires prennent leur tangente de leurs voisins
 * (Catmull-Rom) : c'est ce qui donne une déviation arrondie plutôt qu'un
 * angle, et c'est le style que Grégoire a retenu.
 */
function cheminLisse(points, dirDepart, dirArrivee) {
    if (points.length < 2) return '';
    var total = 0;
    for (var k = 1; k < points.length; k++) {
        total += Math.hypot(points[k].x - points[k - 1].x, points[k].y - points[k - 1].y);
    }
    var tension = Math.max(Math.min(total * 0.3, 90), 28);

    var d = 'M ' + points[0].x + ' ' + points[0].y;
    for (var i = 0; i < points.length - 1; i++) {
        var p0 = points[i], p1 = points[i + 1];
        var c1, c2;
        if (i === 0) {
            c1 = { x: p0.x + dirDepart.x * tension, y: p0.y + dirDepart.y * tension };
        } else {
            var avant = points[i - 1];
            c1 = { x: p0.x + (p1.x - avant.x) / 6, y: p0.y + (p1.y - avant.y) / 6 };
        }
        if (i === points.length - 2) {
            c2 = { x: p1.x + dirArrivee.x * tension, y: p1.y + dirArrivee.y * tension };
        } else {
            var apres = points[i + 2];
            c2 = { x: p1.x - (apres.x - p0.x) / 6, y: p1.y - (apres.y - p0.y) / 6 };
        }
        d += ' C ' + c1.x + ' ' + c1.y + ', ' + c2.x + ' ' + c2.y + ', ' + p1.x + ' ' + p1.y;
    }
    return d;
}

/** Points échantillonnés le long du même chemin — sert au test et au libellé. */
function _echantillonner(points, dirDepart, dirArrivee) {
    // On rééchantillonne la POLYLIGNE des points de passage enrichie des
    // milieux : suffisant pour détecter une traversée, et sans dépendance au
    // DOM (donc utilisable en bac à sable de test).
    var total = 0;
    for (var k = 1; k < points.length; k++) {
        total += Math.hypot(points[k].x - points[k - 1].x, points[k].y - points[k - 1].y);
    }
    var tension = Math.max(Math.min(total * 0.3, 90), 28);
    var sortie = [];
    for (var i = 0; i < points.length - 1; i++) {
        var p0 = points[i], p1 = points[i + 1];
        var c1, c2;
        if (i === 0) c1 = { x: p0.x + dirDepart.x * tension, y: p0.y + dirDepart.y * tension };
        else { var av = points[i - 1]; c1 = { x: p0.x + (p1.x - av.x) / 6, y: p0.y + (p1.y - av.y) / 6 }; }
        if (i === points.length - 2) c2 = { x: p1.x + dirArrivee.x * tension, y: p1.y + dirArrivee.y * tension };
        else { var ap = points[i + 2]; c2 = { x: p1.x - (ap.x - p0.x) / 6, y: p1.y - (ap.y - p0.y) / 6 }; }
        var n = Math.max(4, Math.round(LIEN_ECHANTILLONS / (points.length - 1)));
        for (var s = 0; s <= n; s++) {
            var t = s / n, u = 1 - t;
            sortie.push({
                x: u*u*u*p0.x + 3*u*u*t*c1.x + 3*u*t*t*c2.x + t*t*t*p1.x,
                y: u*u*u*p0.y + 3*u*u*t*c1.y + 3*u*t*t*c2.y + t*t*t*p1.y
            });
        }
    }
    return sortie;
}

/** Combien d'obstacles DISTINCTS le tracé traverse. */
function _traversees(echantillons, obstacles) {
    var n = 0;
    for (var o = 0; o < obstacles.length; o++) {
        for (var e = 0; e < echantillons.length; e++) {
            if (_dansRect(echantillons[e].x, echantillons[e].y, obstacles[o])) { n++; break; }
        }
    }
    return n;
}

function _longueur(echantillons) {
    var l = 0;
    for (var i = 1; i < echantillons.length; i++) {
        l += Math.hypot(echantillons[i].x - echantillons[i-1].x, echantillons[i].y - echantillons[i-1].y);
    }
    return l;
}

/**
 * Calcule le tracé d'un lien : le chemin SVG, les extrémités, et un point
 * SUR la courbe pour poser le libellé.
 *
 * ⚠ Le libellé se posait jusqu'ici au milieu GÉOMÉTRIQUE des deux extrémités,
 * un point qui n'appartient pas à la courbe — d'où des libellés atterrissant
 * sur un bloc sans rapport (« s'acquiert par » dans sa capture). Il suit
 * désormais la courbe, et s'écarte s'il tombe sur un bloc.
 */
function calculerTraceLien(sourceId, cibleId) {
    // ── TRACÉ DIRECT — le comportement d'avant le 15 août, offert en option.
    // Ports choisis sur le seul axe dominant, une courbe, libellé au milieu
    // géométrique. On ne calcule AUCUN obstacle : c'est ce qui rend ce mode
    // moins coûteux, et c'est aussi pourquoi `traversees` vaut null plutôt
    // que 0 — non mesuré n'est pas « aucune ».
    if (!_lienContourner) {
        var pd = trouverMeilleursPorts(sourceId, cibleId);
        var a = getPortPosition(sourceId, pd.portSource);
        var b2 = getPortPosition(cibleId, pd.portCible);
        return {
            d: cheminLisse([a, b2], _directionPort(pd.portSource), _directionPort(pd.portCible)),
            p1: a, p2: b2,
            etiquette: { x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2 },
            traversees: null
        };
    }

    var obstacles = obstaclesPourLien(sourceId, cibleId);

    // ── 1. La meilleure paire de ports ────────────────────────────────
    var meilleur = null;
    for (var a = 0; a < LIEN_PORTS.length; a++) {
        for (var b = 0; b < LIEN_PORTS.length; b++) {
            var q1 = getPortPosition(sourceId, LIEN_PORTS[a]);
            var q2 = getPortPosition(cibleId, LIEN_PORTS[b]);
            var d1 = _directionPort(LIEN_PORTS[a]);
            var d2 = _directionPort(LIEN_PORTS[b]);
            var pts = [q1, q2];
            var ech = _echantillonner(pts, d1, d2);
            var croise = _traversees(ech, obstacles);
            // La longueur départage à égalité de traversées : sans elle, un
            // tracé qui fait le tour de la carte vaudrait un tracé direct.
            var score = croise * 100000 + _longueur(ech);
            if (!meilleur || score < meilleur.score) {
                meilleur = { score: score, croise: croise, points: pts, d1: d1, d2: d2, ech: ech };
            }
        }
    }
    if (!meilleur) return null;

    // ── 2. Dévier, si et seulement si rien n'est libre ────────────────
    if (meilleur.croise > 0) {
        var devie = _devier(meilleur, obstacles);
        if (devie && devie.croise < meilleur.croise) meilleur = devie;
    }


    return {
        d: cheminLisse(meilleur.points, meilleur.d1, meilleur.d2),
        p1: meilleur.points[0],
        p2: meilleur.points[meilleur.points.length - 1],
        etiquette: _pointEtiquette(meilleur.ech, obstacles),
        traversees: meilleur.croise
    };
}

/**
 * Ajoute UN point de passage pour éviter ce qui gêne.
 *
 * On essaie les quatre côtés de la boîte englobant les obstacles traversés et
 * on garde le meilleur. Un seul point suffit dans la quasi-totalité des cas
 * réels ; en empiler davantage produirait des méandres illisibles, ce qui
 * remplacerait un défaut par un autre.
 */
function _devier(candidat, obstacles) {
    var p1 = candidat.points[0];
    var p2 = candidat.points[candidat.points.length - 1];
    var milieuX = (p1.x + p2.x) / 2, milieuY = (p1.y + p2.y) / 2;
    var ECART = 16;

    var quiGene = function(ech) {
        return obstacles.filter(function(o) {
            for (var e = 0; e < ech.length; e++) {
                if (_dansRect(ech[e].x, ech[e].y, o)) return true;
            }
            return false;
        });
    };

    // ⚠ L'OBSTRUCTION S'ACCUMULE D'UN ESSAI À L'AUTRE, et c'est LE point.
    // Une première version calculait le détour autour des seuls blocs
    // traversés : contourner deux blocs d'un mur fait atterrir sur leurs
    // VOISINS, et le lien traversait toujours. Mesuré au navigateur sur un mur
    // de quatorze blocs sans interstice — la déviation s'y déclenchait et
    // n'améliorait rien. En gardant tout ce qui a gêné jusqu'ici, la boîte à
    // contourner grossit jusqu'à couvrir l'obstruction entière.
    var accumules = quiGene(candidat.ech);
    if (!accumules.length) return null;

    var meilleur = null;
    for (var essai = 0; essai < 4; essai++) {
        var bx1 = Math.min.apply(null, accumules.map(function(o) { return o.x1; }));
        var by1 = Math.min.apply(null, accumules.map(function(o) { return o.y1; }));
        var bx2 = Math.max.apply(null, accumules.map(function(o) { return o.x2; }));
        var by2 = Math.max.apply(null, accumules.map(function(o) { return o.y2; }));

        // UN point de passage, pour les obstructions étroites…
        var candidats = [
            [{ x: bx1 - ECART, y: milieuY }],   // par la gauche
            [{ x: bx2 + ECART, y: milieuY }],   // par la droite
            [{ x: milieuX, y: by1 - ECART }],   // par le haut
            [{ x: milieuX, y: by2 + ECART }]    // par le bas
        ];

        // …et DEUX points, aux coins, pour les contourner vraiment.
        //
        // ⚠ UN SEUL POINT NE CONTOURNE PAS UNE BOÎTE. Mesuré au navigateur :
        // sur un mur de quatorze blocs, le point « par le haut » est posé au
        // MILIEU horizontal de l'obstruction — le lien montait au-dessus puis
        // replongeait aussitôt dedans. Il faut monter, TRAVERSER en longeant,
        // puis redescendre : c'est ce que disent les deux coins.
        //
        // Les coins sont ordonnés du plus proche de la source au plus proche
        // de la cible : c'est ce qui rend le sens du contournement correct
        // quel que soit le côté d'où l'on vient, sans avoir à le tester.
        var parProximite = function(a, b) {
            return Math.hypot(a.x - p1.x, a.y - p1.y) - Math.hypot(b.x - p1.x, b.y - p1.y);
        };
        candidats.push([{ x: bx1 - ECART, y: by1 - ECART }, { x: bx2 + ECART, y: by1 - ECART }].sort(parProximite));
        candidats.push([{ x: bx1 - ECART, y: by2 + ECART }, { x: bx2 + ECART, y: by2 + ECART }].sort(parProximite));
        candidats.push([{ x: bx1 - ECART, y: by1 - ECART }, { x: bx1 - ECART, y: by2 + ECART }].sort(parProximite));
        candidats.push([{ x: bx2 + ECART, y: by1 - ECART }, { x: bx2 + ECART, y: by2 + ECART }].sort(parProximite));

        var nouveaux = [];
        for (var i = 0; i < candidats.length; i++) {
            var pts = [p1].concat(candidats[i], [p2]);
            var ech = _echantillonner(pts, candidat.d1, candidat.d2);
            var croise = _traversees(ech, obstacles);
            var score = croise * 100000 + _longueur(ech);
            if (!meilleur || score < meilleur.score) {
                meilleur = { score: score, croise: croise, points: pts, d1: candidat.d1, d2: candidat.d2, ech: ech };
            }
            if (croise > 0) nouveaux = nouveaux.concat(quiGene(ech));
        }

        if (meilleur.croise === 0) break;

        // Grossir l'obstruction avec ce qui vient de gêner. Si rien de neuf
        // n'apparaît, un essai de plus donnerait la même boîte : on s'arrête.
        var avant = accumules.length;
        for (var k = 0; k < nouveaux.length; k++) {
            if (accumules.indexOf(nouveaux[k]) === -1) accumules.push(nouveaux[k]);
        }
        if (accumules.length === avant) break;
    }
    return meilleur;
}

/** Un point de la courbe où poser le libellé, en évitant les blocs. */
function _pointEtiquette(echantillons, obstacles) {
    if (!echantillons.length) return { x: 0, y: 0 };
    var milieu = Math.floor(echantillons.length / 2);
    // On part du milieu et on s'écarte de part et d'autre jusqu'à trouver un
    // point libre : le milieu reste le choix par défaut, ce n'est un compromis
    // que lorsqu'il tombe effectivement sur un bloc.
    for (var pas = 0; pas < milieu; pas++) {
        for (var s = 0; s < 2; s++) {
            var i = milieu + (s === 0 ? pas : -pas);
            if (i < 0 || i >= echantillons.length) continue;
            var pt = echantillons[i];
            var libre = true;
            for (var o = 0; o < obstacles.length; o++) {
                if (_dansRect(pt.x, pt.y, obstacles[o])) { libre = false; break; }
            }
            if (libre) return pt;
        }
    }
    return echantillons[milieu];
}

function dessinerLien(donnees) {
    var sourceEl = document.getElementById(donnees.source);
    var cibleEl = document.getElementById(donnees.cible);
    if (!sourceEl || !cibleEl) return;

    var trace = calculerTraceLien(donnees.source, donnees.cible);
    if (!trace) return;
    var p1 = trace.p1;
    var p2 = trace.p2;

    var ancien = document.getElementById(donnees.id + '-groupe');
    if (ancien) ancien.remove();

    var groupe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupe.id = donnees.id + '-groupe';
    groupe.setAttribute('class', 'planif-lien-groupe');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = donnees.id;
    path.setAttribute('d', trace.d);
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
        // Le libellé suit la COURBE (et s'écarte s'il tombe sur un bloc). Il
        // se posait au milieu géométrique des deux extrémités — un point qui
        // n'appartient pas au tracé, d'où des libellés atterrissant sur un
        // bloc sans rapport.
        var mx = trace.etiquette.x;
        var my = trace.etiquette.y;
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

    cercle.addEventListener('pointerdown', function(e) {
        if (!e.isPrimary || e.button > 0) return;
        e.stopPropagation();
        e.preventDefault();
        demarrerReconnexion(lienId, extremite, e);
    });

    return cercle;
}

function demarrerReconnexion(lienId, extremite, e) {
    var pid = e ? e.pointerId : undefined;
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
        if (pid !== undefined && e2.pointerId !== pid) return;
        lienTemp.style.display = 'none';
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);

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

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
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
        // #964 — une évaluation ne se relie plus par un lien : le message dit
        // le bon geste au lieu de seulement refuser.
        if ((src && src.type === 'evaluation') || (cbl && cbl.type === 'evaluation')) {
            afficherToastLien('Une évaluation se relie à ses objectifs : ouvre son Inspecteur et coche ceux qu’elle vérifie.');
            return;
        }
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

    // TOUS LES AUTRES VERBES, sous les pertinents (15 août 2026).
    //
    // ⚠ LE MENU ÉTAIT UN CUL-DE-SAC. Pour une résolution « verticale » il
    // n'offrait qu'UN verbe : `verbesPertinents = [resolution.verbe]`. Quand
    // ce verbe unique était le mauvais — le cas de l'Ouverture qui réactive —
    // l'utilisateur n'avait AUCUN moyen de le corriger. Un défaut de la table
    // devenait une impasse pour lui.
    //
    // ⮕ Arbitrage de Grégoire : garder le guidage (les pertinents d'abord,
    // c'est le cadre théorique qui parle) mais ne jamais bloquer. Ce qui suit
    // le séparateur est le reste des verbes, dans l'ordre du référentiel.
    var autresVerbes = TYPES_LIENS
        .map(function(t) { return t.id; })
        .filter(function(id) { return verbesPertinents.indexOf(id) === -1; });

    menuLien.innerHTML = '';

    // Titre du menu
    var titre = document.createElement('div');
    titre.style.cssText = 'padding: 4px 8px 2px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
    titre.textContent = verbesPertinents.length > 1 ? 'Verbes suggérés' : 'Verbe suggéré';
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

    // Les autres verbes, sous leur propre titre : le guidage reste lisible,
    // mais la sortie de secours existe.
    if (autresVerbes.length) {
        var sepAutres = document.createElement('hr');
        sepAutres.style.cssText = 'border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;';
        menuLien.appendChild(sepAutres);

        var titreAutres = document.createElement('div');
        titreAutres.style.cssText = 'padding: 4px 8px 2px; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;';
        titreAutres.textContent = 'Autres verbes';
        menuLien.appendChild(titreAutres);

        for (var vj = 0; vj < autresVerbes.length; vj++) {
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
            })(autresVerbes[vj]);
        }
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
    if (conteneurType === 'lecon') return TYPES_ACTIVITE.indexOf(enfantType) !== -1 || TYPES_CONNAISSANCE.indexOf(enfantType) !== -1 || enfantType === 'evaluation';
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

    // Measure children widths/heights (leur taille ne dépend pas de la
    // largeur du conteneur : feuilles positionnées en absolu)
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

    // Container width
    var newW = maxW + PADDING * 2;
    newW = Math.max(newW, largeurPlancher(conteneur));

    // #157 (terrain 10 août 2026) : poser la LARGEUR AVANT de mesurer
    // l'en-tête. La hauteur des objectifs et du titre dépend de la largeur
    // (le texte se replie) : mesurée sur l'ancienne largeur, la zone dépliée
    // du badge 🎯 rendait un en-tête trop court, les enfants étaient posés
    // dessous, puis le texte se repliait sur la nouvelle largeur et le titre
    // descendait sur la première feuille. Invisible avec des objectifs
    // courts (une ligne ne se replie pas) — systématique avec des vrais.
    var celMesure = document.getElementById(conteneurId);
    if (celMesure) celMesure.style.width = newW + 'px';
    var HEADER_H = hauteurEnteteConteneur(celMesure);

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

    // #157 : même consigne que reLayoutConteneur — la largeur AVANT la
    // mesure de l'en-tête (le repli du texte des objectifs en dépend).
    var celMesure = document.getElementById(conteneurId);
    if (celMesure) celMesure.style.width = newW + 'px';
    var HEADER_H = hauteurEnteteConteneur(celMesure);

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

/**
 * Coller dans un champ de la carte, c'est coller du TEXTE (9 août 2026).
 *
 * Constat terrain de Grégoire, capture à l'appui : un titre collé depuis une
 * autre application arrive avec SA typographie — corps, graisse, police — et
 * ne s'aligne pas sur la carte. Le défaut est natif : dans un
 * `contenteditable`, coller insère le `text/html` du presse-papiers, balises
 * et styles en ligne compris.
 *
 * ▣ Ce que ça cassait vraiment, au-delà du coup d'œil. La DONNÉE, elle, est
 * saine — `donnees.titre = titreEl.textContent` ne retient que le texte, et
 * un rechargement rendait le titre propre. Mais entre les deux, le DOM porte
 * un balisage étranger : c'est lui que `reLayoutConteneur` mesure pour
 * décider de la hauteur du bloc et de la descente de ses enfants. Un titre
 * collé en corps 24 poussait donc la disposition, jusqu'au prochain
 * rechargement, sans qu'aucune donnée ne soit fautive.
 *
 * ⮕ `execCommand('insertText')` est déprécié, et c'est pourtant le bon outil :
 * c'est le seul qui insère dans la pile d'annulation NATIVE du champ. Une
 * insertion par `Range` obligerait ⌘Z à défaire autre chose que ce que
 * l'utilisateur vient de faire. Le repli manuel n'existe que pour les moteurs
 * qui refuseraient la commande — mieux vaut une annulation imparfaite qu'un
 * collage muet.
 *
 * Les sauts de ligne deviennent des espaces : les deux champs concernés sont
 * des libellés d'UNE ligne, tous deux interceptent déjà la touche Entrée
 * (le titre sort du champ, un objectif en ouvre un autre). Un collage
 * multiligne qui poserait N objectifs d'un coup serait une fonction en soi,
 * pas un effet de bord du presse-papiers.
 */
function collerEnTexteBrut(champ) {
    if (!champ) return;
    champ.addEventListener('paste', function(e) {
        var presse = e.clipboardData || (typeof window !== 'undefined' && window.clipboardData);
        if (!presse) return;
        e.preventDefault();
        var texte = String(presse.getData('text/plain') || '').replace(/\s*\r?\n\s*/g, ' ').trim();
        if (!texte) return;
        var insere = false;
        try {
            insere = document.execCommand('insertText', false, texte);
        } catch (err) {
            insere = false;
        }
        if (insere) return;
        var sel = typeof window !== 'undefined' && window.getSelection && window.getSelection();
        if (!sel || !sel.rangeCount) return;
        var plage = sel.getRangeAt(0);
        plage.deleteContents();
        var noeudTexte = document.createTextNode(texte);
        plage.insertNode(noeudTexte);
        plage.setStartAfter(noeudTexte);
        plage.collapse(true);
        sel.removeAllRanges();
        sel.addRange(plage);
        // Le repli ne déclenche pas `input` tout seul : sans ça, le texte
        // serait à l'écran mais jamais enregistré.
        champ.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

/**
 * Une commande de ligne d'objectif. Quatre par ligne depuis le 9 août 2026 :
 * ▲ ▼ pour l'ordre, + − pour la structure.
 *
 * `inerte` rend le bouton PRÉSENT mais muet (première ligne qui ne peut pas
 * monter, dernière qui ne peut pas descendre, ligne d'accueil pas encore
 * persistée). Présent et non retiré : quatre lignes qui n'ont pas le même
 * nombre de commandes ne s'alignent plus, et la largeur du texte se met à
 * danser d'une ligne à l'autre. Muet et non désactivé : `aria-hidden` le
 * retire du parcours clavier et de la synthèse vocale, où un bouton qui ne
 * fait rien n'a rien à annoncer.
 */
function commandeObjectifHTML(classe, rang, glyphe, libelle, inerte) {
    if (inerte) {
        return '<span class="planif-obj-btn ' + classe + ' planif-obj-btn--inerte"' +
               ' aria-hidden="true">' + glyphe + '</span>';
    }
    return '<span class="planif-obj-btn ' + classe + '" data-obj-rang="' + rang + '"' +
           ' role="button" tabindex="0" aria-label="' + libelle + '"' +
           ' title="' + libelle + '">' + glyphe + '</span>';
}

/** Le groupe complet des quatre commandes, dans l'ordre ordre → structure. */
function commandesObjectifHTML(rang, premier, dernier) {
    return commandeObjectifHTML('planif-obj-monter', rang, '▲',
               'Déplacer cet objectif vers le haut', premier) +
           commandeObjectifHTML('planif-obj-descendre', rang, '▼',
               'Déplacer cet objectif vers le bas', dernier) +
           commandeObjectifHTML('planif-obj-ajouter', rang, '+',
               'Ajouter un objectif après celui-ci', false) +
           commandeObjectifHTML('planif-obj-retirer', rang, '−',
               'Retirer cet objectif', false);
}

/** Le bloc dépliable des objectifs d'une leçon. '' si replié ou pas une leçon. */
function objectifsLeconHTML(n) {
    if (n.type !== 'lecon' || !objectifEstDeplie(n)) return '';
    var objs = objectifsDeLecon(n);
    var html = '<div class="planif-noeud-objectifs">';
    if (objs.length === 0) {
        // Liste vide : une ligne à remplir, sans commandes — il n'y a encore
        // rien à retirer, ni après quoi insérer, ni quoi réordonner.
        html += '<div class="planif-noeud-objectif-ligne">' +
                '<div class="planif-noeud-objectif" contenteditable="true" data-obj-rang="0"' +
                ' data-placeholder="Sera en mesure de…"></div>' +
                '</div>';
        return html + '</div>';
    }
    var rangAccueil = (_ajoutObjectif && _ajoutObjectif.noeudId === n.id)
        ? _ajoutObjectif.rang : -1;
    // Nombre de lignes RENDUES (la ligne d'accueil en est une) : c'est la
    // borne qui dit quelle ligne ne peut plus descendre.
    var nbLignes = objs.length + (rangAccueil >= 0 ? 1 : 0);
    var rangRendu = 0;
    for (var io_ = 0; io_ <= objs.length; io_++) {
        if (io_ === rangAccueil) {
            // La ligne d'accueil porte les MÊMES commandes que les autres :
            // sans elles, la ligne qu'on vient d'ajouter serait la seule sans
            // + / − (constaté en terrain le 6 août). Ses flèches sont inertes :
            // elle n'est pas encore un objectif, il n'y a rien à déplacer.
            html += '<div class="planif-noeud-objectif-ligne">' +
                '<div class="planif-noeud-objectif" contenteditable="true"' +
                ' data-obj-rang="' + rangRendu + '" data-accueil="1"' +
                ' data-placeholder="Sera en mesure de…"></div>' +
                commandesObjectifHTML(rangRendu, true, true) +
                '</div>';
            rangRendu++;
        }
        if (io_ === objs.length) break;
        html +=
            '<div class="planif-noeud-objectif-ligne">' +
                pastilleObjectifHTML(n, objs[io_].id) +
                // data-obj-id : l'identité voyage AVEC la ligne.
                // Sans lui, appliquerObjectifs() doit la deviner
                // au rang — et se trompe dès qu'on insère ou
                // retire au milieu (cf. son en-tête, #403).
                '<div class="planif-noeud-objectif" contenteditable="true" data-obj-rang="' + rangRendu + '"' +
                ' data-obj-id="' + echapperHtml(objs[io_].id) + '">' +
                    echapperHtml(objs[io_].texte) +
                '</div>' +
                commandesObjectifHTML(rangRendu, rangRendu === 0, rangRendu === nbLignes - 1) +
            '</div>';
        rangRendu++;
    }
    return html + '</div>';
}

/**
 * LE contenu d'un nœud — chemin de rendu UNIQUE (9 août 2026).
 *
 * ⚠ POURQUOI CETTE FONCTION EXISTE. Le contenu d'un nœud se construisait à
 * TROIS endroits : `creerNoeud` (glisser depuis la palette), le clone
 * Alt+glisser, et `reconstruireDOM` (rechargement de la carte). Seul le
 * troisième était complet. Un bloc fraîchement posé sortait donc SANS son
 * champ de durée et SANS sa poignée de redimensionnement ; un conteneur neuf,
 * sans son compteur Σ, son sélecteur de semaine ni son badge 🎯. Tout
 * réapparaissait au rechargement suivant, quand `reconstruireDOM` reprenait la
 * main — d'où le symptôme rapporté en terrain : « la durée n'est pas TOUJOURS
 * visible sur les feuilles Exposé ».
 *
 * ⮕ Le défaut n'était pas dans le champ de durée : il était dans la
 * duplication. Trois copies d'un même rendu ne peuvent que diverger, et
 * elles avaient divergé à CHAQUE enrichissement de l'en-tête depuis (la durée,
 * la semaine, les objectifs, la poignée — quatre fois le même oubli, au même
 * endroit). Les trois appelants passent désormais ici : un contrôle ajouté à
 * l'en-tête est visible par construction, quel que soit le chemin qui a créé
 * le nœud. Sentinelle : `sentinelle-carte-rendu-unique-437`.
 */
/**
 * L'IDENTITÉ DU BLOC DANS SON EN-TÊTE — libellé inerte, ou poignée + sélecteur.
 *
 * ⚠⚠ LA POIGNÉE N'EST PAS UNE DÉCORATION : ELLE REMPLACE UNE PRISE QU'ON RETIRE.
 * Le glisser d'un bloc part d'un `pointerdown` sur le bloc ENTIER, avec deux
 * exceptions seulement (les ports, et tout ce qui est `contenteditable`). Le
 * libellé de type est donc, aujourd'hui, une surface de PRISE — inerte, donc
 * saisissable. Un `<select>` ne peut pas l'être : il doit couper la propagation
 * du `pointerdown`, comme le font déjà les sélecteurs de semaine et de rang.
 *
 * MESURÉ sur un bloc de 230 px : en-tête utile 174 px, libellé « Pratique
 * autonome » 115 px, boîte de durée 53 px — soit ZÉRO pixel nu. Et le titre en
 * dessous est `contenteditable`, donc exclu du glisser lui aussi. Échanger le
 * libellé contre un sélecteur SANS rien rendre en retour laisserait un bloc
 * dont l'en-tête entier ne se saisit plus.
 * ⮕ D'où la poignée, et d'où le fait qu'elle NE coupe PAS la propagation :
 * c'est le seul élément de l'en-tête qui doit laisser passer le geste.
 *
 * (Option retenue par Grégoire le 15 août parmi trois. Bénéfice au-delà de ce
 * chantier : la prise d'un bloc était implicite, et chaque contrôle ajouté à
 * l'en-tête l'a grignotée sans que personne ne le décide.)
 */
/**
 * La poignée — PREMIER élément de TOUTE en-tête (16 août 2026, demande de
 * Grégoire : « je veux qu'elle soit le premier élément à gauche dans l'entête »).
 *
 * ▣ ELLE EST DÉSORMAIS PARTOUT, y compris sur Séquence et Leçon dont le libellé
 * reste inerte et donc saisissable. Ce n'est pas de la décoration : c'est la
 * seule prise dont la position ne dépend PAS du contenu de l'en-tête. La prise
 * d'un bloc était implicite, et chaque contrôle ajouté depuis un an l'a
 * grignotée sans que personne ne le décide.
 *
 * ⮕ Elle ne porte AUCUN écouteur : le geste doit remonter au bloc pour
 * déclencher le glisser. C'est le seul élément de l'en-tête dans ce cas — ne
 * pas « harmoniser » avec les sélecteurs, qui eux coupent la propagation.
 */
function poigneeHTML() {
    return '<span class="planif-noeud-prise" title="Glisser pour déplacer ce bloc"' +
        ' aria-hidden="true">⠿</span>';
}

/**
 * Le plancher de largeur d'un sélecteur d'en-tête, dit en CARACTÈRES.
 *
 * ⚠ POURQUOI PAS UN PLANCHER UNIQUE. Les 130 px du sélecteur de phase étaient
 * calibrés pour « Pratique autonome », le plus long libellé du module. Les
 * appliquer à « Exposé » réserverait 130 px pour six lettres et pousserait la
 * boîte de durée à la ligne sur des blocs où tout tient aujourd'hui — une
 * régression visible sur toute la carte, au moment précis où le sélecteur
 * s'étend à tous les types.
 * ⮕ Le plancher suit donc le plus long libellé de CHAQUE famille. Le facteur
 * de conversion est mesuré au navigateur, pas estimé (cf. `--planif-select-ch`
 * dans styles.css).
 */
function plancherSelecteur(libelles) {
    var max = 0;
    for (var i = 0; i < libelles.length; i++) {
        if (libelles[i].length > max) max = libelles[i].length;
    }
    return max;
}

function selecteurEnTeteHTML(n, classe, attributDonnee, entrees, valeurCourante, titre) {
    var libelles = entrees.map(function(e) { return e[1]; });
    var html = '<select class="' + classe + '" ' + attributDonnee + '="' + echapperHtml(n.id) + '"' +
        ' style="color: ' + obtenirCouleurNoeud(n) + '; --planif-select-ch: ' + plancherSelecteur(libelles) + '"' +
        ' title="' + echapperHtml(titre) + '"' +
        ' aria-label="' + echapperHtml(titre) + ' de ce bloc">';
    for (var i = 0; i < entrees.length; i++) {
        html += '<option value="' + echapperHtml(entrees[i][0]) + '"' +
            (entrees[i][0] === valeurCourante ? ' selected' : '') + '>' +
            echapperHtml(entrees[i][1]) + '</option>';
    }
    return html + '</select>';
}

function enTeteIdentiteHTML(n) {
    var prise = poigneeHTML();

    // Évaluation : la nuance est une VISÉE, pas un type — le menu écrit
    // `metadata.visee` et le type reste `evaluation` (cf. VISEES_EVALUATION).
    // ⚠ LES `title` SONT L'ACCOMPAGNEMENT DE CES DEUX MENUS, et volontairement.
    // Le système d'infobulles du projet est délégué, donc il ATTEINDRAIT un
    // `data-tooltip` posé ici — mais il s'ajouterait au `title` natif d'un
    // <select> qu'on est en train d'ouvrir : deux bulles sur l'élément le plus
    // manipulé de la carte. Le `title` dit donc ce que le menu fait ET sa borne,
    // là où il ne disait que « Type de ce bloc ».
    if (n.type === 'evaluation') {
        return prise + selecteurEnTeteHTML(n, 'planif-noeud-visee', 'data-visee-noeud',
            VISEES_EVALUATION.map(function(v) { return [v[0], v[1]]; }),
            viseeEvaluation(n),
            'Visée de cette évaluation — formative ou certificative. Tant que rien n’est choisi, les exports écrivent « Évaluation »');
    }

    // Familles permutables : le menu écrit le TYPE, borné à la famille.
    var famille = famillePermutableDe(n.type);
    if (famille) {
        return prise + selecteurEnTeteHTML(n, 'planif-noeud-type-select', 'data-type-noeud',
            famille.map(function(t) { return [t, TYPES[t].label]; }),
            n.type,
            'Changer le type de ce bloc, à l’intérieur de sa famille — le titre, la durée et les liens restent en place');
    }

    // Séquence et Leçon : pas de famille, donc pas de menu. Le libellé reste
    // inerte — et donc saisissable, ce qui ne coûte rien puisque la poignée
    // est là de toute façon.
    return prise + '<span class="planif-noeud-type" style="color: ' + obtenirCouleurNoeud(n) + '">' +
        obtenirLabelNoeud(n) + '</span>';
}

function contenuNoeudHTML(n) {
    var estConteneur = !!(TYPES[n.type] && TYPES[n.type].conteneur);
    var enTete =
        '<div class="planif-noeud-entete">' +
            enTeteIdentiteHTML(n) +
            (estConteneur
                ? compteurDureeHTML(n) + selecteurSemaineHTML(n) + selecteurRangSeanceHTML(n) + badgeObjectifHTML(n)
                // #965 — la pastille d'une évaluation ouvre la rangée de la
                // durée, hors du couloir calibré de la poignée et du badge amont.
                : pastilleEvaluationHTML(n) + dureeControleHTML(n)) +
        '</div>';
    var ports =
        '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
        '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
        '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
        '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';

    if (estConteneur) {
        var nbEnfants = (n.enfants || []).length;
        return enTete +
            objectifsLeconHTML(n) +
            '<div class="planif-noeud-titre" contenteditable="true">' + echapperHtml(n.titre || '') + '</div>' +
            '<div class="planif-noeud-zone ' + (nbEnfants === 0 ? 'planif-vide' : '') + '">' +
                (nbEnfants > 0 ? nbEnfants + ' élément' + (nbEnfants > 1 ? 's' : '') : '') +
            '</div>' +
            ports +
            // Option B (6 août) : sur un conteneur, la poignée ne règle que
            // la LARGEUR — une largeur plancher. La hauteur reste calculée
            // depuis les enfants, donc aucun geste n'est jamais défait.
            '<div class="planif-noeud-poignee planif-noeud-poignee--largeur"' +
            ' role="separator" aria-label="Ajuster la largeur de ce bloc"></div>';
    }
    return enTete +
        '<div class="planif-noeud-titre" contenteditable="true">' + echapperHtml(n.titre || '') + '</div>' +
        ports +
        // Poignée de redimensionnement — FEUILLES SEULEMENT (option A,
        // décision du 6 août). Les conteneurs sont dimensionnés par
        // reLayoutConteneur à partir de leurs enfants : une taille posée
        // à la main y serait écrasée au prochain ajout.
        '<div class="planif-noeud-poignee" role="separator" aria-label="Redimensionner ce bloc"></div>';
}

/**
 * Badge 🎯 des objectifs — leçons uniquement.
 * Toujours rendu : l'ancien badge n'apparaissait qu'une fois l'objectif saisi,
 * la fonction était donc indécouvrable (friction F1). Gris tant qu'aucun
 * objectif n'est posé, en couleur dès qu'il y en a un (décision de Grégoire,
 * 15 août 2026).
 *
 * L'emoji est enveloppé dans un `<span>` DÉDIÉ, et ce n'est pas cosmétique :
 * la désaturation de l'état vide s'y applique. Posée sur le badge, elle
 * grisait aussi son liséré pointillé — le seul repère de couleur qui rend
 * l'affordance trouvable quand il y a zéro objectif (cf. #151, styles.css).
 */
function badgeObjectifHTML(n) {
    if (n.type !== 'lecon') return '';
    var objs = objectifsDeLecon(n);
    var deplie = objectifEstDeplie(n);
    return '<span class="planif-badge-objectif' + (objs.length ? '' : ' planif-badge-objectif--vide') + '"' +
           ' role="button" tabindex="0" aria-expanded="' + (deplie ? 'true' : 'false') + '"' +
           ' title="' + (objs.length ? objs.length + ' objectif' + (objs.length > 1 ? 's' : '') : 'Aucun objectif') +
           ' — cliquer pour ' + (deplie ? 'replier' : 'déplier') + '">' +
           '<span class="planif-badge-objectif__glyphe">🎯</span></span>';
}

function reconstruireDOM() {
    // La loupe montre une COPIE : elle se périme dès que la carte bouge.
    // Sans ça, on lirait un état d'avant la modification — le pire des
    // affichages, celui qui a l'air juste.
    _loupeCopieValide = false;
    // Les textes de la carte viennent peut-être de changer : le cache de
    // normalisation de la recherche porte sur eux, il se périme ici.
    _cacheNormalisation.clear();
    // Sans canevas monté (module pas encore initialisé, ou bac à sable de
    // test), il n'y a rien à reconstruire — les DONNÉES restent la vérité,
    // le rendu suivra au montage.
    if (!coucheNoeuds) return;
    coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';

    // (L'objectif de leçon vit sur le nœud — `metadata.objectif` — depuis le
    // 6 août 2026 : plus aucune lecture de CLE_SEANCES n'est nécessaire ici.)

    // LE CANEVAS MONTRE TOUT (7 août 2026). Il portait jusqu'ici DEUX états
    // d'affichage, commandés par la même variable `sequenceActiveId` :
    //   • une vue « focalisée » sur une séquence, qui masquait tout le reste ;
    //   • une vue globale « compacte », où chaque séquence se réduisait à un
    //     bloc résumé et où ses leçons et activités disparaissaient.
    // La compaction n'existait que pour rendre lisible un global qu'on ne
    // pouvait pas focaliser : elle était le COMPAGNON du filtrage, pas une
    // fonction autonome. Le filtrage retiré, elle perd son objet — et la garder
    // aurait laissé l'enseignant devant des blocs résumés sans moyen de les
    // ouvrir. Un seul état d'affichage, donc : tout est rendu, tout le temps.
    // La navigation dans cette carte entière est le rôle du planificateur.

    for (var entry of etat.noeuds) {
        var n = entry[1];
        var config = TYPES[n.type];
        if (!config) continue;
        var estConteneur = config.conteneur === true;
        var el = document.createElement('div');
        el.className = (estConteneur ? 'planif-noeud planif-conteneur' : 'planif-noeud') + ' planif-type-' + n.type;
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

        el.innerHTML = contenuNoeudHTML(n);
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
        // Répartition automatique des conteneurs. (Plus aucun saut de nœud
        // masqué ou compact : tout ce qui est dans la carte est rendu.)
        for (var entry2 of etat.noeuds) {
            var n2 = entry2[1];
            if (TYPES[n2.type] && TYPES[n2.type].conteneur && n2.enfants && n2.enfants.length > 0 && !n2.parent) {
                reLayoutConteneur(n2.id);
            }
        }
        // Handle containers with no children
        for (var entry2b of etat.noeuds) {
            var n2b = entry2b[1];
            if (TYPES[n2b.type] && TYPES[n2b.type].conteneur && (!n2b.enfants || n2b.enfants.length === 0)) {
                mettreAJourZoneConteneur(n2b.id);
            }
        }
        // Liens : tous tracés, les deux extrémités étant toujours rendues.
        for (var entry3 of etat.liens) {
            dessinerLien(entry3[1]);
        }
        mettreAJourPlanificateur();
        // Les halos de recherche vivent sur des éléments que la boucle
        // ci-dessus vient de recréer : sans ce rappel, une recherche ouverte
        // s'éteindrait au premier déplacement de bloc. On RECALCULE plutôt
        // que de re-poser les anciens halos — un bloc supprimé entre-temps
        // resterait sinon listé comme trouvé.
        rafraichirRecherche();
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
// #982 : vrai pendant les écritures de la MACHINE au chargement d'une carte (migrations,
// réparation des liens) — elles préviennent le codex, sans « Enregistré » à l'écran.
var _ecritureMachine = false;

function sauvegarder() {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    var donnees = {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };
    window.planificationDonnees.sauvegarderCarte(index.active, donnees, { machine: _ecritureMachine });

    mettreAJourTousLesBadges();
    rafraichirDateInspecteur();
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
            // ⚠ ET LE LIEN DE CLONAGE — oublié jusqu'au 15 août 2026. Trouvé en
            // écrivant la sentinelle de la bascule de phase : le cas chargeait
            // une carte contenant un clone et l'assertion tombait sur un
            // `cloneSourceId` resté à l'ancien id.
            // ⮕ Conséquence sur une carte à l'ANCIEN format : le clone pointe
            // vers un id qui n'existe plus, `_reconstruireCloneIndex` l'indexe
            // sous cette clé morte, et `trouverClones` ne le retrouve jamais.
            // Les instances liées cessent alors de se propager — SANS message,
            // sans rien de cassé à l'écran. On ne s'en aperçoit qu'en modifiant
            // un bloc et en constatant que sa copie n'a pas suivi.
            if (n.cloneSourceId && !n.cloneSourceId.startsWith('planif-')) {
                n.cloneSourceId = 'planif-' + n.cloneSourceId;
            }
        }

        etat.noeuds.set(n.id, n);
    }
    _reconstruireCloneIndex();

    // Remap et charger les liens
    var liensListe = donnees.liens || [];
    var liensModifies = false;
    var reactives = [];
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

        /* ── BASCULE DES LIENS DÉJÀ ENREGISTRÉS (15 août 2026) ──────────
           Le verbe automatique ne joue qu'à la CRÉATION d'un lien. Sans ce
           passage, un lien posé avant aujourd'hui entre une connaissance et
           une Ouverture ou une Révision garderait « s'acquiert par », et la
           carte porterait deux verbes pour la même relation selon la date où
           chaque lien a été tracé. Demande explicite de Grégoire.

           ⚠ CE QUI EST TRANSFORMÉ, ET RIEN D'AUTRE : uniquement les liens qui
           portent AUJOURD'HUI « s'acquiert par » ET dont le couple résout
           MAINTENANT « se réactive dans ». Aucun autre verbe n'est touché.

           ⚠ ON NE TOUCHE PAS À LA DIRECTION, même quand la résolution la
           dirait inversée. Retourner une flèche qu'il a posée est une
           transformation d'un autre ordre que corriger un libellé : ce n'est
           pas ce qu'il a demandé, et ça se verrait moins.

           ▣ IDEMPOTENTE par construction : après passage le verbe n'est plus
           « s'acquiert par », donc la condition ne mord plus. Rejouer le
           chargement ne rebascule rien. */
        if (l.type === 's_acquiert_par') {
            var reso = resoudreVerbe(l.source, l.cible);
            if (reso && reso.verbe === 'se_reactive_dans') {
                l.type = 'se_reactive_dans';
                liensModifies = true;
                reactives.push(l);
            }
        }

        etat.liens.set(l.id, l);
    }

    // Bascule des objectifs de leçon vers le nœud (idempotente, avant le rendu
    // pour que la carte affiche déjà les objectifs migrés).
    _ecritureMachine = true;
    try {
        migrerObjectifsVersMetadata();
        // Ablation de l'ancrage porté par la séquence, avant le rendu pour que
        // l'étendue affichée soit déjà la dérivée et non l'ancienne valeur saisie.
        migrerAncrageTemporelVersLecon();

        reconstruireDOM();
        if (liensModifies) sauvegarder();
    } finally {
        _ecritureMachine = false;
    }

    /* ⚠ UNE TRANSFORMATION DE SES DONNÉES SE DIT. Elle est étroite et
       réversible d'un clic, mais elle reste une réécriture de ce qu'il a
       tracé : la faire en silence l'obligerait à découvrir le changement par
       hasard. Le détail va dans la console pour qu'il puisse auditer QUELS
       liens ont bougé, pas seulement combien. */
    if (reactives.length) {
        console.warn('[Planif-Carte] ' + reactives.length + ' lien(s) passés de'
            + ' « s\'acquiert par » à « se réactive dans » (Ouverture / Révision) :');
        reactives.forEach(function(l) {
            var a = etat.noeuds.get(l.source), b = etat.noeuds.get(l.cible);
            console.warn('   · ' + ((a && a.titre) || l.source) + '  →  ' + ((b && b.titre) || l.cible));
        });
        if (typeof afficherToastLien === 'function') {
            afficherToastLien(reactives.length + ' lien' + (reactives.length > 1 ? 's' : '')
                + ' mis à jour : « se réactive dans »');
        }
    }

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

/* =====================================================================
   AIMANTATION ET GUIDES D'ALIGNEMENT (11 août 2026, demande de Grégoire)

   « Quand je travaille ma carte et mes blocs, j'aurais besoin que les blocs
   puissent s'aligner les uns par rapport aux autres, comme c'est le cas dans
   Keynote. »

   Le principe : pendant qu'on glisse, on compare SIX repères du bloc déplacé
   (bord gauche, centre, bord droit — bord haut, milieu, bord bas) aux mêmes
   repères de tous les autres blocs. Sous un seuil, le bloc COLLE et une ligne
   montre pourquoi.

   ▣ UN SEUL AIMANT POUR QUATRE CHEMINS. Le canevas a quatre glissements
   distincts (groupe · feuille dans un conteneur · conteneur · feuille libre)
   et tous les quatre calculent la position de la même façon. Recopier
   l'aimantation dans chacun garantissait qu'elle divergerait au premier
   correctif — c'est exactement le motif que ce projet a payé plusieurs fois.
   D'où `preparerAimantation()` / `appliquerAimantation()`, appelés aux mêmes
   deux endroits dans les quatre.

   ⚠ LES CIBLES SONT CALCULÉES UNE FOIS, au début du geste. Les recalculer à
   chaque mouvement coûterait une lecture de mise en page par bloc et par
   image sur une carte de 150 blocs. Corollaire assumé : un bloc qui bouge
   n'est pas une cible pour lui-même, et les cibles ne changent pas en cours
   de geste — c'est ce qu'on veut, sinon les guides sauteraient.

   ⮕ Le seuil est en pixels D'ÉCRAN, divisé par le zoom : à 25 % l'aimant ne
   doit pas happer tout ce qui traîne à quatre écrans de distance.
   ===================================================================== */

const AIMANT_SEUIL = 6;   // px écran

let _aimantCiblesX = null;
let _aimantCiblesY = null;
let _coucheGuides = null;

/** Bornes d'un nœud en coordonnées de carte, mise en page comprise. */
function bornesNoeud(nd) {
    var el = document.getElementById(nd.id);
    var w = el ? (el.offsetWidth || 140) : 140;
    var h = el ? (el.offsetHeight || 50) : 50;
    return { gauche: nd.x, droite: nd.x + w, haut: nd.y, bas: nd.y + h };
}

/** Union des bornes d'un ensemble d'ids — la boîte d'un groupe déplacé. */
function bornesEnsemble(ids) {
    var b = null;
    for (var id of ids) {
        var nd = etat.noeuds.get(id);
        if (!nd) continue;
        var n = bornesNoeud(nd);
        if (!b) { b = n; continue; }
        if (n.gauche < b.gauche) b.gauche = n.gauche;
        if (n.droite > b.droite) b.droite = n.droite;
        if (n.haut < b.haut) b.haut = n.haut;
        if (n.bas > b.bas) b.bas = n.bas;
    }
    return b;
}

/**
 * Relève les repères de tous les blocs SAUF ceux qu'on déplace.
 * @param {Set<string>} idsExclus - les blocs en mouvement (et leurs enfants)
 */
function preparerAimantation(idsExclus) {
    _aimantCiblesX = [];
    _aimantCiblesY = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (idsExclus.has(nd.id)) continue;
        var b = bornesNoeud(nd);
        var cx = (b.gauche + b.droite) / 2;
        var cy = (b.haut + b.bas) / 2;
        // Chaque cible porte l'étendue PERPENDICULAIRE de son bloc source :
        // c'est ce qui permet de tracer un guide qui relie visiblement les
        // deux blocs, au lieu d'une ligne qui traverse toute la carte.
        _aimantCiblesX.push(
            { v: b.gauche, min: b.haut, max: b.bas },
            { v: cx, min: b.haut, max: b.bas },
            { v: b.droite, min: b.haut, max: b.bas }
        );
        _aimantCiblesY.push(
            { v: b.haut, min: b.gauche, max: b.droite },
            { v: cy, min: b.gauche, max: b.droite },
            { v: b.bas, min: b.gauche, max: b.droite }
        );
    }
}

function _meilleureCible(candidats, cibles, seuil) {
    var meilleur = null;
    for (var i = 0; i < candidats.length; i++) {
        for (var j = 0; j < cibles.length; j++) {
            var ecart = cibles[j].v - candidats[i];
            if (Math.abs(ecart) > seuil) continue;
            if (!meilleur || Math.abs(ecart) < Math.abs(meilleur.ecart)) {
                meilleur = { ecart: ecart, cible: cibles[j] };
            }
        }
    }
    return meilleur;
}

/**
 * Cherche un alignement pour la boîte donnée. Rend le décalage à appliquer
 * et les guides à tracer. Ne modifie rien : l'appelant décide.
 * @param {{gauche:number,droite:number,haut:number,bas:number}} b
 * @returns {{dx:number, dy:number, guides:Array}}
 */
function appliquerAimantation(b) {
    var res = { dx: 0, dy: 0, guides: [] };
    if (!_aimantCiblesX || !b) return res;
    var seuil = AIMANT_SEUIL / (etat.zoom || 1);

    var cx = (b.gauche + b.droite) / 2;
    var cy = (b.haut + b.bas) / 2;

    var mx = _meilleureCible([b.gauche, cx, b.droite], _aimantCiblesX, seuil);
    if (mx) {
        res.dx = mx.ecart;
        res.guides.push({
            axe: 'x', v: mx.cible.v,
            min: Math.min(mx.cible.min, b.haut),
            max: Math.max(mx.cible.max, b.bas)
        });
    }

    var my = _meilleureCible([b.haut, cy, b.bas], _aimantCiblesY, seuil);
    if (my) {
        res.dy = my.ecart;
        res.guides.push({
            axe: 'y', v: my.cible.v,
            min: Math.min(my.cible.min, b.gauche),
            max: Math.max(my.cible.max, b.droite)
        });
    }
    return res;
}

function _assurerCoucheGuides() {
    if (_coucheGuides && _coucheGuides.isConnected) return _coucheGuides;
    var offset = document.getElementById('planif-couche-svg-offset');
    if (!offset) return null;
    _coucheGuides = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    _coucheGuides.setAttribute('id', 'planif-couche-guides');
    offset.appendChild(_coucheGuides);
    return _coucheGuides;
}

function tracerGuides(guides) {
    var couche = _assurerCoucheGuides();
    if (!couche) return;
    couche.textContent = '';
    for (var i = 0; i < guides.length; i++) {
        var g = guides[i];
        var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        // Une marge de dépassement rend le guide lisible aux extrémités.
        var d = 12;
        if (g.axe === 'x') {
            l.setAttribute('x1', g.v); l.setAttribute('x2', g.v);
            l.setAttribute('y1', g.min - d); l.setAttribute('y2', g.max + d);
        } else {
            l.setAttribute('y1', g.v); l.setAttribute('y2', g.v);
            l.setAttribute('x1', g.min - d); l.setAttribute('x2', g.max + d);
        }
        l.setAttribute('class', 'planif-guide-alignement');
        couche.appendChild(l);
    }
}

function effacerGuides() {
    if (_coucheGuides) _coucheGuides.textContent = '';
    _aimantCiblesX = null;
    _aimantCiblesY = null;
}

/* =====================================================================
   ALIGNER LES OBJETS — six commandes (11 août 2026, demande de Grégoire)
   « À gauche, Au centre, À droite, En haut, Au milieu, En bas. »

   ⮕ On aligne sur l'EXTRÊME, comme Keynote : « À gauche » amène tout le
   monde sur le bloc le plus à gauche. C'est le seul repère que l'utilisateur
   peut prédire sans savoir dans quel ordre il a cliqué.
   ⚠ Un conteneur emporte ses descendants — même règle qu'au glisser de
   groupe. Sans ça, aligner une leçon la détacherait visuellement de ses
   activités, qui resteraient sur place.
   ===================================================================== */

const ALIGNEMENTS = {
    gauche: { axe: 'x', repere: 'min' },
    centre: { axe: 'x', repere: 'centre' },
    droite: { axe: 'x', repere: 'max' },
    haut: { axe: 'y', repere: 'min' },
    milieu: { axe: 'y', repere: 'centre' },
    bas: { axe: 'y', repere: 'max' }
};

/**
 * @param {string} mode - une clé de ALIGNEMENTS
 * @returns {number} nombre de blocs réellement déplacés
 */
function alignerSelection(mode) {
    var config = ALIGNEMENTS[mode];
    if (!config) return 0;

    var ids = Array.from(etat.multiSelection);
    if (ids.length < 2) return 0;

    // Comme pour la duplication : seules les RACINES bougent d'elles-mêmes.
    // Un descendant d'un conteneur sélectionné suit son conteneur — l'aligner
    // en plus le ferait sortir de son parent.
    var couverts = new Set();
    for (var i = 0; i < ids.length; i++) {
        var nd = etat.noeuds.get(ids[i]);
        if (!nd || !TYPES[nd.type] || !TYPES[nd.type].conteneur || !nd.enfants) continue;
        var desc = [];
        collecterDescendants(nd, nd, desc);
        for (var d = 0; d < desc.length; d++) couverts.add(desc[d].id);
    }
    var racines = ids.filter(function (id) { return !couverts.has(id); });
    if (racines.length < 2) return 0;

    var boites = racines.map(function (id) {
        return { id: id, b: bornesNoeud(etat.noeuds.get(id)) };
    });

    var cible;
    if (config.axe === 'x') {
        if (config.repere === 'min') cible = Math.min.apply(null, boites.map(function (o) { return o.b.gauche; }));
        else if (config.repere === 'max') cible = Math.max.apply(null, boites.map(function (o) { return o.b.droite; }));
        else {
            var gMin = Math.min.apply(null, boites.map(function (o) { return o.b.gauche; }));
            var gMax = Math.max.apply(null, boites.map(function (o) { return o.b.droite; }));
            cible = (gMin + gMax) / 2;
        }
    } else {
        if (config.repere === 'min') cible = Math.min.apply(null, boites.map(function (o) { return o.b.haut; }));
        else if (config.repere === 'max') cible = Math.max.apply(null, boites.map(function (o) { return o.b.bas; }));
        else {
            var hMin = Math.min.apply(null, boites.map(function (o) { return o.b.haut; }));
            var hMax = Math.max.apply(null, boites.map(function (o) { return o.b.bas; }));
            cible = (hMin + hMax) / 2;
        }
    }

    // Un seul instantané pour tout l'alignement : ⌘Z le défait d'un coup.
    // ⚠ PAS de `_undoBatch` ici, contrairement à `dupliquerSelection()` : ce
    // garde ne sert qu'à museler des `enregistrerPourUndo` IMBRIQUÉS, et
    // `deplacerNoeudEtDescendants` n'en fait aucun. Il était présent au
    // premier jet ; un break-test resté vert a montré qu'il ne protégeait
    // rien. Zéro-dette : on retire.
    enregistrerPourUndo();
    var deplaces = 0;
    {
        for (var k = 0; k < boites.length; k++) {
            var o = boites[k];
            var nd2 = etat.noeuds.get(o.id);
            if (!nd2) continue;
            var delta;
            if (config.axe === 'x') {
                if (config.repere === 'min') delta = cible - o.b.gauche;
                else if (config.repere === 'max') delta = cible - o.b.droite;
                else delta = cible - (o.b.gauche + o.b.droite) / 2;
            } else {
                if (config.repere === 'min') delta = cible - o.b.haut;
                else if (config.repere === 'max') delta = cible - o.b.bas;
                else delta = cible - (o.b.haut + o.b.bas) / 2;
            }
            if (Math.abs(delta) < 0.01) continue;
            deplacerNoeudEtDescendants(nd2, config.axe === 'x' ? delta : 0, config.axe === 'y' ? delta : 0);
            deplaces++;
        }
    }

    if (deplaces > 0) sauvegarder();
    return deplaces;
}

/* ── La barre flottante qui porte les six commandes ──────────────────────
   Elle apparaît au-dessus de la sélection dès que DEUX blocs sont allumés,
   et disparaît sinon.

   ⮕ POURQUOI PAS UN MENU CONTEXTUEL, alors que c'est la forme de Keynote :
   le clic droit n'existe pas au doigt, et remplacer par un appui long serait
   un geste caché — l'un des anti-patterns écrits noir sur blanc dans les
   règles d'interface du projet. Une commande qui se MONTRE quand elle
   devient possible n'a besoin d'aucune découverte.
   ─────────────────────────────────────────────────────────────────────── */

const BOUTONS_ALIGNEMENT = [
    { mode: 'gauche', libelle: 'Aligner à gauche' },
    { mode: 'centre', libelle: 'Aligner au centre' },
    { mode: 'droite', libelle: 'Aligner à droite' },
    { separateur: true },
    { mode: 'haut', libelle: 'Aligner en haut' },
    { mode: 'milieu', libelle: 'Aligner au milieu' },
    { mode: 'bas', libelle: 'Aligner en bas' }
];

let _barreAlignement = null;

function _assurerBarreAlignement() {
    if (_barreAlignement && _barreAlignement.isConnected) return _barreAlignement;
    var barre = document.createElement('div');
    barre.id = 'planif-barre-alignement';
    barre.setAttribute('role', 'toolbar');
    barre.setAttribute('aria-label', 'Aligner les objets');

    for (var i = 0; i < BOUTONS_ALIGNEMENT.length; i++) {
        var def = BOUTONS_ALIGNEMENT[i];
        if (def.separateur) {
            var sep = document.createElement('span');
            sep.className = 'planif-barre-separateur';
            sep.setAttribute('aria-hidden', 'true');
            barre.appendChild(sep);
            continue;
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'planif-btn-aligner';
        btn.title = def.libelle;
        btn.setAttribute('aria-label', def.libelle);
        btn.dataset.mode = def.mode;
        var glyphe = document.createElement('span');
        glyphe.className = 'planif-aligner-glyphe';
        glyphe.dataset.mode = def.mode;
        glyphe.setAttribute('aria-hidden', 'true');
        btn.appendChild(glyphe);
        barre.appendChild(btn);
    }

    // Délégation : un seul écouteur, et la barre survit à un re-rendu.
    barre.addEventListener('click', function (ev) {
        var cible = ev.target.closest ? ev.target.closest('.planif-btn-aligner') : null;
        if (!cible) return;
        ev.preventDefault();
        var n = alignerSelection(cible.dataset.mode);
        if (n > 0) majBarreAlignement();
    });
    // Le geste appartient à la barre : sans ça, sur iPad, toucher un bouton
    // commencerait aussi un glissement de la carte dessous.
    barre.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });

    document.body.appendChild(barre);
    _barreAlignement = barre;
    return barre;
}

/**
 * Montre, place ou cache la barre selon la sélection courante.
 * Appelée à chaque changement de sélection — c'est le seul point d'entrée.
 */
function majBarreAlignement() {
    var barre = _assurerBarreAlignement();
    if (!barre) return;

    if (etat.multiSelection.size < 2 || etat.loupeActive || !zoneTravail) {
        barre.classList.remove('planif-barre-visible');
        return;
    }

    var b = bornesEnsemble(etat.multiSelection);
    if (!b) {
        barre.classList.remove('planif-barre-visible');
        return;
    }

    barre.classList.add('planif-barre-visible');

    // Coordonnées de carte → écran.
    // ⚠ L'OFFSET DU CANEVAS EN FAIT PARTIE. Les x/y des nœuds sont relatifs à
    // l'origine de la carte, pas à celle de l'espace : la couche des blocs est
    // décalée de OFFSET_X / OFFSET_Y. L'oublier envoie la barre à des milliers
    // de pixels hors écran — trouvé au navigateur le 11 août, et c'est le même
    // oubli que celui qui décalait la loupe deux heures plus tôt.
    var r = zoneTravail.getBoundingClientRect();
    var versEcranX = function (mx) { return (mx + OFFSET_X) * etat.zoom - zoneTravail.scrollLeft + r.left; };
    var versEcranY = function (my) { return (my + OFFSET_Y) * etat.zoom - zoneTravail.scrollTop + r.top; };

    var lb = barre.offsetWidth || 320;
    var hb = barre.offsetHeight || 54;

    var x = versEcranX((b.gauche + b.droite) / 2) - lb / 2;
    var y = versEcranY(b.haut) - hb - 14;
    // Pas de place au-dessus (sélection collée en haut de l'écran) : on passe
    // sous la sélection.
    if (y < r.top + 8) y = versEcranY(b.bas) + 14;

    // ⚠ BORNAGE FINAL, sur les DEUX axes et APRÈS le repli. Une première
    // version bornait avant, puis le repli replaçait la barre hors écran sans
    // que rien ne le rattrape : la barre existait, était « visible », et
    // restait injoignable.
    x = Math.min(Math.max(8, x), Math.max(8, window.innerWidth - lb - 8));
    y = Math.min(Math.max(8, y), Math.max(8, window.innerHeight - hb - 8));

    barre.style.left = Math.round(x) + 'px';
    barre.style.top = Math.round(y) + 'px';
}

/** Déplace un nœud ET sa descendance du même vecteur, DOM compris. */
function deplacerNoeudEtDescendants(nd, dx, dy) {
    var liste = [{ id: nd.id }];
    if (TYPES[nd.type] && TYPES[nd.type].conteneur && nd.enfants) {
        var desc = [];
        collecterDescendants(nd, nd, desc);
        for (var i = 0; i < desc.length; i++) liste.push({ id: desc[i].id });
    }
    for (var j = 0; j < liste.length; j++) {
        var cible = etat.noeuds.get(liste[j].id);
        if (!cible) continue;
        cible.x += dx;
        cible.y += dy;
        var el = document.getElementById(cible.id);
        if (el) {
            el.style.left = cible.x + 'px';
            el.style.top = cible.y + 'px';
        }
        mettreAJourLiens(cible.id);
    }
}

// === ATTACHER ÉVÉNEMENTS D'UN NŒUD ===
function attacherEvenements(el, donnees) {
    var id = donnees.id;
    var config = TYPES[donnees.type];
    var estConteneur = config && config.conteneur === true;

    // #148 (8 août 2026) — Pointer Events : souris, doigt (iPad) et Pencil.
    // Même conversion que #144 (palettes, 11 juin) : le canevas était resté
    // souris-seulement — sur iPad AUCUN nœud ne se déplaçait. Nécessite
    // touch-action:none sur .planif-noeud (styles.css), sinon Safari cède le
    // geste au défilement natif et envoie pointercancel.
    el.addEventListener('pointerdown', function(e) {
        if (e.target.classList.contains('planif-noeud-port') || e.target.isContentEditable) return;
        if (!e.isPrimary || e.button > 0) return;
        e.preventDefault();
        var pid = e.pointerId;

        if (e.metaKey || e.ctrlKey) {
            toggleMultiSelection(id);
            return;
        }

        // ⌥ + glisser : dupliquer le bloc et glisser le doublon (4 août 2026,
        // exercice 601-101).
        // ⚠⚠ ⇧ COMMANDE LA NATURE DU DOUBLON (16 août 2026, décision de
        // Grégoire) : `⌥` seul rend une COPIE INDÉPENDANTE, `⇧⌥` un CLONE LIÉ.
        // Jusqu'ici, `⌥` sur une feuille rendait un clone — un geste qui laissait
        // croire à une copie, et rien ne le disait avant que le doublon ne se
        // mette à suivre son original. Un conteneur, lui, reste toujours une
        // copie indépendante en profondeur (le miroir n'a jamais existé pour eux).
        if (e.altKey) {
            var cloneId = dupliquerNoeud(id, false, e.shiftKey);
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
                    cloneEl.dispatchEvent(new PointerEvent('pointerdown', {
                        bubbles: true, cancelable: true,
                        clientX: e.clientX, clientY: e.clientY, button: 0,
                        pointerId: e.pointerId, isPrimary: true,
                        pointerType: e.pointerType || 'mouse'
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
            preparerAimantation(tousNoeuds);

            function onMoveGroupe(e2) {
                if (e2.pointerId !== pid) return;
                var dx2 = (e2.clientX - startMouseX) / etat.zoom;
                var dy2 = (e2.clientY - startMouseY) / etat.zoom;

                // Aimantation sur la BOÎTE du groupe, pas bloc par bloc : le
                // groupe garde sa forme interne, seul l'ensemble colle.
                var boiteG = null;
                for (var eG of positionsInitiales) {
                    var ndG = etat.noeuds.get(eG[0]);
                    if (!ndG) continue;
                    var elG = document.getElementById(eG[0]);
                    var wG = elG ? (elG.offsetWidth || 140) : 140;
                    var hG = elG ? (elG.offsetHeight || 50) : 50;
                    var gG = eG[1].x + dx2, hG2 = eG[1].y + dy2;
                    if (!boiteG) boiteG = { gauche: gG, droite: gG + wG, haut: hG2, bas: hG2 + hG };
                    else {
                        if (gG < boiteG.gauche) boiteG.gauche = gG;
                        if (gG + wG > boiteG.droite) boiteG.droite = gG + wG;
                        if (hG2 < boiteG.haut) boiteG.haut = hG2;
                        if (hG2 + hG > boiteG.bas) boiteG.bas = hG2 + hG;
                    }
                }
                var aimG = appliquerAimantation(boiteG);
                dx2 += aimG.dx;
                dy2 += aimG.dy;
                tracerGuides(aimG.guides);

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

            function onUpGroupe(e2) {
                if (e2 && e2.pointerId !== pid) return;
                el.classList.remove('planif-dragging');
                effacerGuides();
                majBarreAlignement();
                document.removeEventListener('pointermove', onMoveGroupeThrottled);
                document.removeEventListener('pointerup', onUpGroupe);
                document.removeEventListener('pointercancel', onUpGroupe);
                sauvegarder();
            }

            var onMoveGroupeThrottled = throttleRAF(onMoveGroupe);
            document.addEventListener('pointermove', onMoveGroupeThrottled);
            document.addEventListener('pointerup', onUpGroupe);
            document.addEventListener('pointercancel', onUpGroupe);
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
            preparerAimantation(new Set([id]));
            var parentId = donnees.parent;
            var parentData = etat.noeuds.get(parentId);
            var survolConteneurB = null;

            function onMoveB(e2) {
                if (e2.pointerId !== pid) return;
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                var aim = appliquerAimantation({
                    gauche: donnees.x, droite: donnees.x + (el.offsetWidth || 140),
                    haut: donnees.y, bas: donnees.y + (el.offsetHeight || 50)
                });
                donnees.x += aim.dx;
                donnees.y += aim.dy;
                tracerGuides(aim.guides);
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
                if (e2 && e2.pointerId !== pid) return;
                el.classList.remove('planif-dragging');
                effacerGuides();
                document.removeEventListener('pointermove', onMoveBThrottled);
                document.removeEventListener('pointerup', onUpB);
                document.removeEventListener('pointercancel', onUpB);
                document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                // #433 : relâché sur la corbeille = supprimé. Le retour est
                // ANTICIPÉ — sans lui, le rattachement ci-dessous s'exécuterait
                // sur un nœud qui n'existe plus.
                if (deposerDansCorbeille(e2, id)) return;

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
            document.addEventListener('pointermove', onMoveBThrottled);
            document.addEventListener('pointerup', onUpB);
            document.addEventListener('pointercancel', onUpB);
            return;
        }

        // CAS C: Conteneur → drag du groupe entier (+ hover-detection pour Leçon)
        if (estConteneur) {
            el.classList.add('planif-dragging');
            var descendantsInit = [];
            if (donnees.enfants) {
                collecterDescendants(donnees, donnees, descendantsInit);
            }
            // Un conteneur ne s'aimante pas sur SES PROPRES enfants : ils se
            // déplacent avec lui, l'écart ne change jamais, et le guide
            // resterait collé à l'écran sans rien vouloir dire.
            var exclusC = new Set([id]);
            for (var xC = 0; xC < descendantsInit.length; xC++) exclusC.add(descendantsInit[xC].id);
            preparerAimantation(exclusC);

            // Voie A (6 août 2026) : une séquence peut aussi être déposée dans
            // une séquence — même geste que pour une leçon.
            var peutEtreEnfant = donnees.type === 'lecon' || donnees.type === 'sequence';
            var survolConteneur = null;

            function onMoveC(e2) {
                if (e2.pointerId !== pid) return;
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                var aim = appliquerAimantation({
                    gauche: donnees.x, droite: donnees.x + (el.offsetWidth || 140),
                    haut: donnees.y, bas: donnees.y + (el.offsetHeight || 50)
                });
                donnees.x += aim.dx;
                donnees.y += aim.dy;
                tracerGuides(aim.guides);
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

            function onUpC(e2) {
                if (e2 && e2.pointerId !== pid) return;
                el.classList.remove('planif-dragging');
                effacerGuides();
                document.removeEventListener('pointermove', onMoveCThrottled);
                document.removeEventListener('pointerup', onUpC);
                document.removeEventListener('pointercancel', onUpC);

                document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                if (deposerDansCorbeille(e2, id)) return;   // #433

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
            document.addEventListener('pointermove', onMoveCThrottled);
            document.addEventListener('pointerup', onUpC);
            document.addEventListener('pointercancel', onUpC);
            return;
        }

        // CAS D: Noeud libre → drag simple + hover-detection conteneur
        el.classList.add('planif-dragging');
        preparerAimantation(new Set([id]));
        var survolConteneurD = null;

        function onMoveD(e2) {
            if (e2.pointerId !== pid) return;
            donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
            donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
            var aim = appliquerAimantation({
                gauche: donnees.x, droite: donnees.x + (el.offsetWidth || 140),
                haut: donnees.y, bas: donnees.y + (el.offsetHeight || 50)
            });
            donnees.x += aim.dx;
            donnees.y += aim.dy;
            tracerGuides(aim.guides);
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

        function onUpD(e2) {
            if (e2 && e2.pointerId !== pid) return;
            el.classList.remove('planif-dragging');
            effacerGuides();
            document.removeEventListener('pointermove', onMoveDThrottled);
            document.removeEventListener('pointerup', onUpD);
            document.removeEventListener('pointercancel', onUpD);

            document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
            document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

            if (deposerDansCorbeille(e2, id)) return;   // #433

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
        document.addEventListener('pointermove', onMoveDThrottled);
        document.addEventListener('pointerup', onUpD);
        document.addEventListener('pointercancel', onUpD);
    });

    // Double-clic: mode individuel pour enfants, panneau pour le reste
    el.addEventListener('dblclick', function(e) {
        if (e.target.isContentEditable) return;

        // (La branche « bloc compact → vue focalisée » est retirée avec la
        // compaction elle-même : une séquence n'a plus d'état replié.)

        // Enfant ou libre : même geste, l'inspecteur. (L'ancien « mode
        // individuel » de drag est retiré — inversion du 6 août.)
        selectionnerNoeud(id);
        ouvrirPanneau(id);
    });

    // #444 (10 août 2026) — DOUBLE-TAP : le même geste, au doigt.
    //
    // Réponse à la porte terrain restée ouverte depuis le 8 août : sur iPad,
    // le `dblclick` ci-dessus n'est JAMAIS émis (constat de Grégoire, 10 août).
    // Tout l'Inspecteur — durée, semaine, objectifs servis, et la rétroaction
    // formative de #424 Lot E — n'était donc atteignable qu'au bouton 🕵️…
    // lui-même coupé par la hauteur de la palette. Deux défauts qui se
    // verrouillaient l'un l'autre.
    //
    // Pourquoi un double-tap MANUEL plutôt qu'un tap long : le tap long se
    // déclencherait pendant un déplacement (le doigt reste posé pour glisser),
    // alors que deux appuis brefs ne peuvent pas se confondre avec un drag. La
    // fenêtre de 300 ms et la tolérance de 30 px sont celles des plateformes.
    //
    // ⚠ On écoute au `pointerdown` en phase de CAPTURE, sans consommer
    // l'événement : le drag de #148 doit continuer de recevoir le sien. Le
    // second appui n'annule donc rien — il ouvre simplement l'Inspecteur.
    var _dernierTap = 0;
    var _dernierTapX = 0;
    var _dernierTapY = 0;
    el.addEventListener('pointerdown', function(e) {
        if (e.pointerType === 'mouse') return;        // la souris a son dblclick
        if (e.target.isContentEditable) return;       // saisie en cours
        // Les commandes du bloc (ports, poignée, badges, boutons) gèrent leur
        // propre geste et arrêtent déjà la propagation ; ce garde-fou couvre
        // le cas d'un futur contrôle qui ne le ferait pas.
        if (e.target.closest('button, select, input, textarea, .planif-port, .planif-poignee')) return;

        var maintenant = e.timeStamp || Date.now();
        var proche = Math.abs(e.clientX - _dernierTapX) < 30 && Math.abs(e.clientY - _dernierTapY) < 30;
        if (maintenant - _dernierTap < 300 && proche) {
            _dernierTap = 0;                          // pas de triple-tap en cascade
            selectionnerNoeud(id);
            ouvrirPanneau(id);
            return;
        }
        _dernierTap = maintenant;
        _dernierTapX = e.clientX;
        _dernierTapY = e.clientY;
    }, true);

    var titreEl = el.querySelector('.planif-noeud-titre');
    collerEnTexteBrut(titreEl);
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
        // Le pointerdown du bloc démarre le déplacement (#148) : on
        // l'intercepte AVANT qu'il ne remonte (les ports font de même).
        badgeObjectif.addEventListener('pointerdown', function(e) {
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
        // Rend des { id, texte } et non des chaînes : la ligne d'accueil n'a pas
        // d'id (objectif neuf), les autres portent le leur. C'est ce qui rend
        // l'insertion et le retrait au milieu exacts pour les liens #403.
        var lireLignes = function() {
            var lues = [];
            zoneObjectifs.querySelectorAll('.planif-noeud-objectif').forEach(function(ligne) {
                lues.push({
                    id: ligne.getAttribute('data-obj-id') || null,
                    texte: ligne.textContent.trim()
                });
            });
            return lues;
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
            collerEnTexteBrut(ligne);
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
            btn.addEventListener('pointerdown', function(e) {
                // Sans quoi le pointerdown du bloc démarrerait un déplacement.
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
                var monte = btn.classList.contains('planif-obj-monter');
                if (monte || btn.classList.contains('planif-obj-descendre')) {
                    // Réordonner (9 août 2026, demande de Grégoire). Permuter
                    // les LIGNES LUES suffit : chacune porte son `id` depuis
                    // #403, et `appliquerObjectifs` résout par id AVANT le rang
                    // — les `objectifsServis` qui visent ces objectifs suivent
                    // donc le déplacement au lieu de glisser d'un cran.
                    var cible = rang + (monte ? -1 : 1);
                    if (cible < 0 || cible >= textes.length) return;
                    // Le bouton empêche le focus (preventDefault au
                    // pointerdown) : sans cet appel, aucun état n'est empilé et
                    // ⌘Z sauterait par-dessus le déplacement.
                    enregistrerPourUndo();
                    textes.splice(cible, 0, textes.splice(rang, 1)[0]);
                    _ajoutObjectif = null;
                    appliquerObjectifs(donnees, textes);
                    // Focalise la ligne à sa NOUVELLE place : ses commandes
                    // restent révélées (`:focus-within`), donc un second appui
                    // enchaîne sans avoir à retrouver la ligne des yeux.
                    rerendreEtFocaliser(cible);
                    return;
                }
                if (btn.classList.contains('planif-obj-ajouter')) {
                    var rangObjectif = textes.slice(0, rang + 1).filter(function(t) {
                        return t.texte !== '';
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
        port.addEventListener('pointerdown', function(e) {
            if (!e.isPrimary || e.button > 0) return;
            e.stopPropagation();
            e.preventDefault();
            demarrerLien(id, port.dataset.dir, e);
        });
    });

    // === SÉLECTEUR D'IDENTITÉ DE L'EN-TÊTE ===
    // Deux sélecteurs, deux portes d'écriture, un seul comportement d'interface :
    // le type (borné à la famille) et la visée d'une évaluation. Ils sont traités
    // ensemble parce que tout ce qui les distingue est la porte appelée.
    [
        ['.planif-noeud-type-select', definirTypeNoeud],
        ['.planif-noeud-visee', definirViseeEvaluation]
    ].forEach(function(paire) {
        var selecteur = el.querySelector(paire[0]);
        if (!selecteur) return;
        // Même précaution que les deux sélecteurs ci-dessous : sans elle,
        // toucher le sélecteur démarrerait le déplacement du bloc.
        // ⚠ Et c'est PRÉCISÉMENT ce que la poignée `.planif-noeud-prise`
        // compense : elle, on ne lui pose AUCUN écouteur, pour que le geste
        // remonte au bloc et déclenche le glisser. Ne pas « harmoniser » les
        // deux — leur asymétrie est le correctif.
        ['pointerdown', 'mousedown', 'click'].forEach(function(evt) {
            selecteur.addEventListener(evt, function(e) { e.stopPropagation(); });
        });
        selecteur.addEventListener('change', function() {
            var avant = etat.noeuds.get(id);
            var verbesAvant = avant ? releverVerbesDeNoeud(id) : [];
            if (!paire[1](id, selecteur.value)) return;
            // La couleur, la classe du bloc et le libellé dérivent tous du type :
            // on re-rend plutôt que de les retoucher un à un, comme la bascule
            // des objectifs. Le focus revient sur le sélecteur reconstruit —
            // sans quoi une correction en deux temps obligerait à le repointer.
            reconstruireDOM();
            mettreAJourTousLesBadges();
            signalerVerbesDevenusInexacts(id, verbesAvant);
            var frais = document.getElementById(id);
            var repose = frais && frais.querySelector(paire[0]);
            if (repose) repose.focus();
        });
    });

    // === SÉLECTEUR DE SEMAINE (leçons et séquences) ===
    var selSemaine = el.querySelector('.planif-noeud-semaine');
    if (selSemaine) {
        // `stopPropagation` sur la pression : sans lui, toucher le sélecteur
        // démarrerait le déplacement du bloc — le geste serait inutilisable au
        // doigt, où la pression et le glisser sont le même début de geste.
        ['pointerdown', 'mousedown', 'click'].forEach(function(evt) {
            selSemaine.addEventListener(evt, function(e) { e.stopPropagation(); });
        });
        ['pointerdown', 'focus'].forEach(function(evt) {
            selSemaine.addEventListener(evt, function() { peuplerSelecteurSemaine(selSemaine); });
        });
        selSemaine.addEventListener('change', function(e) {
            e.stopPropagation();
            var brut = selSemaine.value;
            var cible = brut === '' ? null : parseInt(brut, 10);
            if (brut !== '' && isNaN(cible)) return;
            // MÊME porte que le glisser dans la grille : sur une leçon elle
            // écrit, sur une séquence elle déplace tout le bloc. Les deux
            // gestes ne peuvent donc pas diverger.
            deposerDansGrille(donnees.type, id, cible);
            reconstruireDOM();
        });
    }

    // === SÉLECTEUR DE RANG DE SÉANCE (leçons seulement, #416 lot A) ===
    var selSeance = el.querySelector('.planif-noeud-seance');
    if (selSeance) {
        // Même précaution que la semaine : sans `stopPropagation`, toucher le
        // sélecteur démarrerait le déplacement du bloc — geste inutilisable au
        // doigt, où la pression et le glisser sont le même début de geste.
        ['pointerdown', 'mousedown', 'click'].forEach(function(evt) {
            selSeance.addEventListener(evt, function(e) { e.stopPropagation(); });
        });
        ['pointerdown', 'focus'].forEach(function(evt) {
            selSeance.addEventListener(evt, function() { peuplerSelecteurRangSeance(selSeance); });
        });
        selSeance.addEventListener('change', function(e) {
            e.stopPropagation();
            var brut = selSeance.value;
            var cible = brut === '' ? null : parseInt(brut, 10);
            if (brut !== '' && isNaN(cible)) return;
            // ⚠ PAS `deposerDansGrille` — la grille du planificateur est
            // organisée par SEMAINE, pas par séance. Le rang n'a pas de geste
            // de glisser équivalent : sa porte d'écriture unique est celle-ci.
            enregistrerPourUndo();
            definirRangSeance(id, cible);
            reconstruireDOM();
        });
    }

    // === DURÉE DANS L'EN-TÊTE (8 août 2026) ===
    var champDuree = el.querySelector('.planif-noeud-duree');
    if (champDuree) {
        // Même précaution que le sélecteur de semaine : sans `stopPropagation`,
        // toucher le champ démarrerait le déplacement du bloc.
        ['pointerdown', 'mousedown', 'click', 'dblclick'].forEach(function(evt) {
            champDuree.addEventListener(evt, function(e) { e.stopPropagation(); });
        });
        champDuree.addEventListener('focus', function() { enregistrerPourUndo(); });
        champDuree.addEventListener('input', function(e) {
            e.stopPropagation();
            var min = parseInt(champDuree.value, 10) || 0;
            if (!donnees.metadata) donnees.metadata = {};
            donnees.metadata.duree = min || null;
            // L'ancien couple périodes × min/pér PAR NŒUD faisait doublon avec
            // la durée de période du cadre : purgé à la première réédition.
            // (Comportement repris tel quel de l'Inspecteur, d'où ce champ
            // descend — le retirer laisserait des clés mortes se réveiller.)
            delete donnees.metadata.periodes;
            delete donnees.metadata.minutesParPeriode;
            // ⚠ La propagation aux clones VOYAGE avec le champ. Un nœud cloné
            // est une instance liée : sa durée est la même partout, sinon deux
            // instances du même bloc afficheraient des nombres différents.
            propagerModification(id, 'metadata', JSON.parse(JSON.stringify(donnees.metadata)));
            // On remonte la chaîne au lieu de reconstruire : reconstruire ferait
            // perdre le focus du champ qu'on est en train de remplir.
            rafraichirRollupsAncetres(id);
            sauvegarder();
            mettreAJourPlanificateur();
        });
    }

    // === POIGNÉE DE REDIMENSIONNEMENT (feuilles seulement) ===
    var poignee = el.querySelector('.planif-noeud-poignee');
    if (poignee) {
        // Pointer events, et non `mousedown` (7 août 2026) : au doigt et au
        // Pencil, la poignée ne répondait PAS — Safari ne synthétise pas de
        // `mousemove` pendant un glisser tactile. Agrandir la cible à 44 px
        // sans ce changement aurait produit une zone plus large et toujours
        // inerte : le défaut de 1.47.0, à l'identique.
        // Même idiome que la poignée de palette (capture du pointeur, filtre
        // sur `pointerId`, `pointercancel` traité comme un relâchement).
        poignee.addEventListener('pointerdown', function(e) {
            if (!e.isPrimary) return;
            e.stopPropagation();  // sinon le bloc partirait en déplacement
            e.preventDefault();
            enregistrerPourUndo();

            var pointerId = e.pointerId;
            var departX = e.clientX;
            var departY = e.clientY;
            var largeurDepart = el.offsetWidth;
            var hauteurDepart = el.offsetHeight;

            var surDeplacement = throttleRAF(function(ev) {
                if (ev.pointerId !== pointerId) return;
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

            var surRelachement = function(ev) {
                if (ev && ev.pointerId !== undefined && ev.pointerId !== pointerId) return;
                poignee.removeEventListener('pointermove', surDeplacement);
                poignee.removeEventListener('pointerup', surRelachement);
                poignee.removeEventListener('pointercancel', surRelachement);
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

            // Capture : le geste continue même si le doigt sort du carré de
            // 44 px, ce qui arrive dès les premiers pixels d'un agrandissement.
            poignee.setPointerCapture(pointerId);
            poignee.addEventListener('pointermove', surDeplacement);
            poignee.addEventListener('pointerup', surRelachement);
            poignee.addEventListener('pointercancel', surRelachement);
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


// === CORBEILLE DE LA PALETTE (#433, 8 août 2026) ===
//
// ⚠ POURQUOI ELLE EXISTE — constat terrain de Grégoire (« pas possible de
// supprimer sur iPad »), NUANCÉ par la vérification au code : la suppression
// EST atteignable au doigt, mais en TROIS gestes — sélectionner le nœud,
// ouvrir l'Inspecteur par le bouton 🕵️ du bas de la palette, puis
// « Supprimer ce nœud ». Les deux chemins directs, eux, sont hors d'atteinte :
// la touche Suppr suppose un clavier, et l'Inspecteur ne s'ouvre au canevas
// qu'au DOUBLE-CLIC.
// ⮕ Ce n'est donc pas une capacité manquante, c'est une friction : trois
// gestes derrière une icône dont le nom n'apparaît qu'au survol — inexistant
// au doigt. La corbeille ramène le geste à UN, et réutilise le seul mécanisme
// déjà prouvé fiable au doigt depuis #148 : le drag en Pointer Events.
//
// Le dépôt est résolu par GÉOMÉTRIE (rectangle de la corbeille contre le
// point de relâchement), jamais par la cible de l'événement : pendant un
// drag, l'élément sous le doigt est le nœud lui-même, pas ce qu'il survole.

// ---------------------------------------------------------------------------
// #444 — accordéons de la palette Nœuds (10 août 2026)
// ---------------------------------------------------------------------------

/** Les zones repliées, telles que la préférence les porte (toujours un tableau). */
function famillesRepliees() {
    var brut = typeof obtenirPreference === 'function'
        ? obtenirPreference('planifPaletteFamillesRepliees') : null;
    return Array.isArray(brut) ? brut.filter(function(z) { return typeof z === 'string'; }) : [];
}

/**
 * Applique l'état d'une famille au DOM et le persiste.
 * `aria-expanded` est la SEULE source d'affichage : le CSS masque le groupe
 * quand il vaut "false". Pas de classe parallèle qui pourrait diverger.
 */
function basculerFamillePalette(bouton, forcer) {
    var categorie = bouton.closest('.planif-palette-categorie');
    if (!categorie) return;
    var zone = categorie.getAttribute('data-zone');
    if (!zone) return;

    var ouvert = typeof forcer === 'boolean'
        ? forcer
        : bouton.getAttribute('aria-expanded') === 'false';
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');

    // ⚠ L'écrivain de préférence s'appelle `definirPreference` (preferences.js).
    // Premier jet : `sauvegarderPreference`, qui n'existe pas — et comme le
    // garde défensif sortait silencieusement, les familles se repliaient à
    // l'écran mais l'état n'était JAMAIS persisté. Trouvé par la vérification
    // navigateur, invisible autrement : un garde sur un nom inexistant ne
    // proteste pas, il avale.
    if (typeof definirPreference !== 'function') return;
    var repliees = famillesRepliees().filter(function(z) { return z !== zone; });
    if (!ouvert) repliees.push(zone);
    definirPreference('planifPaletteFamillesRepliees', repliees);
}

function initialiserAccordeonsPalette() {
    var boutons = document.querySelectorAll('.planif-palette-zone-label');
    if (!boutons.length) return;
    var repliees = famillesRepliees();
    boutons.forEach(function(bouton) {
        var categorie = bouton.closest('.planif-palette-categorie');
        var zone = categorie && categorie.getAttribute('data-zone');
        // Restauration : replié seulement si la préférence le dit.
        bouton.setAttribute('aria-expanded', zone && repliees.indexOf(zone) !== -1 ? 'false' : 'true');
        // Le bouton est DANS la palette, qui est déplaçable à la poignée ⠿ et
        // dont les pastilles sont `draggable` : on arrête la propagation pour
        // qu'un appui sur l'en-tête ne démarre pas un déplacement de palette.
        bouton.addEventListener('pointerdown', function(e) { e.stopPropagation(); });
        bouton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            basculerFamillePalette(bouton);
        });
    });
}

function elementCorbeille() {
    return document.getElementById('planif-corbeille');
}

/** Vrai si ce point (coordonnées client) tombe dans la corbeille. */
function pointSurCorbeille(x, y) {
    var el = elementCorbeille();
    if (!el || el.offsetParent === null) return false; // palette masquée
    var r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/**
 * Le nœud relâché sur la corbeille est-il supprimé ? Appelée EN TÊTE de
 * chaque `onUp` de drag, qui sort aussitôt : sans ce retour anticipé, le
 * rattachement au conteneur s'exécuterait sur un nœud déjà disparu.
 * @returns {boolean} true si la suppression a eu lieu
 */
function deposerDansCorbeille(e, id) {
    if (!e || !pointSurCorbeille(e.clientX, e.clientY)) return false;
    var nd = etat.noeuds.get(id);
    if (!nd) return false;
    var nom = nd.titre || obtenirLabelNoeud(nd);
    supprimerNoeud(id);   // enregistre l'undo lui-même
    fermerPanneau();
    majEtatCorbeille(false);
    // Le bouton « Annuler » de la barre d'outils est le filet au doigt :
    // ⌘Z n'existe pas sur iPad. On le dit, parce qu'une suppression sans
    // confirmation doit annoncer sa porte de sortie.
    afficherToastLien('« ' + nom + ' » supprimé — le bouton Annuler le ramène.');
    return true;
}

/** Armée pendant un drag, « ouverte » quand le doigt la survole. */
function majEtatCorbeille(survolee) {
    var el = elementCorbeille();
    if (!el) return;
    el.classList.toggle('planif-corbeille-survol', !!survolee);
}

function armerCorbeille(armee) {
    var el = elementCorbeille();
    if (!el) return;
    el.classList.toggle('planif-corbeille-armee', !!armee);
    if (!armee) el.classList.remove('planif-corbeille-survol');
}

// UN listener global plutôt qu'une retouche des trois `onMove` du drag :
// il sort immédiatement quand rien n'est en cours de déplacement.
document.addEventListener('pointermove', function(e) {
    var enDrag = document.querySelector('.planif-dragging');
    armerCorbeille(!!enDrag);
    if (enDrag) majEtatCorbeille(pointSurCorbeille(e.clientX, e.clientY));
});
document.addEventListener('pointerup', function() { armerCorbeille(false); });
document.addEventListener('pointercancel', function() { armerCorbeille(false); });

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

// === PRODUCTIONS (lues par l'Inspecteur et le générateur d'export) ===



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

        // ⚠⚠ LE FILTRE QUI VIDAIT TOUT (corrigé le 25 août 2026).
        // Cette ligne disait `p.estActive`. Or AUCUN module du projet n'écrit
        // jamais ce champ — ni la création d'une production, ni l'import, ni le
        // pack démo, ni le partage. Une recherche sur tout le dépôt ne le
        // trouvait qu'ICI, dans le filtre lui-même. `chargerProductions` rendait
        // donc `[]` en toutes circonstances, et le sélecteur « Production » de
        // l'Inspecteur n'a jamais pu proposer quoi que ce soit : le pont carte ↔
        // productions était coupé à sa source, pas à son extrémité.
        //
        // ⮕ C'est aussi ce qui a gardé deux autres défauts invisibles pendant des
        // mois — la liste de types amputée et le libellé `nom`/`titre` : on ne
        // voit pas les libellés cassés d'une liste qui reste vide.
        //
        // Le critère retenu est celui que Grégoire voit RÉELLEMENT dans sa liste
        // de Conception (`productions-liste.js`) : `dansBibliotheque !== false`,
        // puis le masquage des items de démonstration hors mode démo. Le
        // sélecteur de la carte offre exactement ce que la barre latérale montre
        // — deux écrans qui ne peuvent plus se contredire.
        var visibles = productions.filter(function(p) { return p && p.dansBibliotheque !== false; });
        if (window.BibliothequeUI && typeof window.BibliothequeUI.filtrerParModeDemo === 'function') {
            visibles = window.BibliothequeUI.filtrerParModeDemo(visibles);
        }

        return visibles.map(function(p) {
            // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
            var infoC = db.getSync('infoCours', null);
            var gcPlanif = obtenirIdContexteActif(infoC);
            var dateEch = (typeof obtenirEcheanceEffective === 'function')
                ? obtenirEcheanceEffective(p, gcPlanif).date : p.dateEcheance;
            // ⚠ `titre`, PAS `nom` (25 août 2026). Le modèle de production porte
            // `titre` — `nom` n'a jamais existé dessus. La projection rendait donc
            // `undefined` pour CHAQUE production, et ce `undefined` partait dans le
            // sélecteur de l'Inspecteur ET dans la colonne « Production » du plan de
            // cours exporté (`nomProduction`, cf. planification-export.js:444). Le
            // défaut ne s'était jamais vu parce que le même écran n'avait aucune
            // production à offrir : les deux se couvraient l'un l'autre.
            return { id: p.id, titre: p.titre, type: p.type || 'autre', ponderation: p.ponderation || 0, grilleId: p.grilleId, dateEcheance: dateEch };
        });
    } catch(e) { return []; }
}

/**
 * OÙ CETTE PRODUCTION EST-ELLE POSÉE DANS LES CARTES ? (25 août 2026)
 *
 * L'autre sens du pont. `metadata.productionId` dit, depuis un bloc Évaluation,
 * QUELLE production il évalue ; cette fonction répond à la question inverse —
 * à quelle semaine et à quelle séance cette production est-elle attendue ?
 * C'est ce qui permet à l'écran des échéances de proposer une date au lieu de
 * la demander.
 *
 * ⚠ QUELLES CARTES SONT FOUILLÉES, ET POURQUOI PAS TOUTES. Une carte porte un
 * `coursId` FACULTATIF. On fouille donc, dans l'ordre :
 *   1. les cartes du MÊME cours que la production — le cas normal ;
 *   2. à défaut, les cartes qui n'ont aucun cours — celle de l'enseignant qui
 *      n'a qu'une carte et ne l'a jamais rattachée.
 * Une carte rattachée à un AUTRE cours n'est jamais lue : proposer à un travail
 * de Littérature la date d'une leçon de Philosophie serait pire que ne rien
 * proposer du tout.
 *
 * ⚠ DEUX POSITIONS CONTRADICTOIRES ⇒ AUCUNE. Si la même production est posée à
 * deux endroits qui ne tombent pas sur la même séance (un clone déplacé, deux
 * cartes concurrentes), on ne tranche pas à sa place : on rend null, et le champ
 * reste manuel. Choisir « la première trouvée » écrirait une date d'échéance —
 * une date que ses étudiant·es liront — sur un tirage au sort.
 *
 * @param {string} productionId
 * @param {string|null} coursId - Cours de la production
 * @returns {Object|null} { semaine, rangSeance, carteId, noeudId } ou null
 */
function positionCarteDeLaProduction(productionId, coursId) {
    if (!productionId) return null;
    var pd = window.planificationDonnees;
    if (!pd || typeof pd.getIndex !== 'function' || typeof pd.chargerCarte !== 'function') return null;

    var aFouiller = idsCartesDuCours(pd, coursId);

    var trouvees = [];
    for (var i = 0; i < aFouiller.length; i++) {
        var pos = positionDansUneCarte(aFouiller[i], productionId, pd);
        if (pos) trouvees.push(pos);
    }
    if (trouvees.length === 0) return null;

    // Toutes d'accord ? Alors la réponse est celle-là. Sinon, silence.
    var premiere = trouvees[0];
    for (var t = 1; t < trouvees.length; t++) {
        if (trouvees[t].semaine !== premiere.semaine ||
            trouvees[t].rangSeance !== premiere.rangSeance) return null;
    }
    return premiere;
}

/**
 * La position de la production DANS une carte donnée, lue au stockage.
 * `sauvegarder()` écrit à chaque geste : le stockage ne retarde pas sur l'écran.
 * @returns {Object|null} { semaine, rangSeance, carteId, noeudId }
 */
function positionDansUneCarte(carteId, productionId, pd) {
    var donnees = pd.chargerCarte(carteId);
    if (!donnees || !Array.isArray(donnees.noeuds)) return null;

    var parId = {};
    for (var i = 0; i < donnees.noeuds.length; i++) {
        var n = donnees.noeuds[i];
        if (n && n.id) parId[n.id] = n;
    }

    for (var j = 0; j < donnees.noeuds.length; j++) {
        var noeud = donnees.noeuds[j];
        if (!noeud || noeud.type !== 'evaluation') continue;
        if (!noeud.metadata || noeud.metadata.productionId !== productionId) continue;

        var lecon = leconAncetreSerialisee(noeud, parId);
        if (!lecon || !lecon.metadata) continue;

        var semaine = parseInt(lecon.metadata.semaine, 10);
        var rang = parseInt(lecon.metadata.rangSeance, 10);
        // Une leçon sans semaine OU sans rang n'est pas située : rien à proposer.
        if (isNaN(semaine) || isNaN(rang) || semaine < 1 || rang < 1) continue;

        return { semaine: semaine, rangSeance: rang, carteId: carteId, noeudId: noeud.id };
    }
    return null;
}

/**
 * LES CARTES À LIRE POUR UN COURS — la règle, extraite de `positionCarteDeLaProduction`
 * (#942) pour que la date d'échéance proposée et la leçon manquée d'une absence
 * lisent les MÊMES cartes : celles rattachées au cours ; à défaut seulement, celles
 * rattachées à aucun cours. Jamais la carte d'un autre cours.
 * @returns {Array<string>} ids de cartes, [] si rien
 */
function idsCartesDuCours(pd, coursId) {
    var index = (pd && typeof pd.getIndex === 'function') ? pd.getIndex() : null;
    if (!index || !Array.isArray(index.cartes)) return [];

    var duCours = [], sansCours = [];
    for (var c = 0; c < index.cartes.length; c++) {
        var fiche = index.cartes[c];
        if (!fiche || !fiche.id) continue;
        var idCours = fiche.coursId || null;
        if (coursId && idCours === coursId) duCours.push(fiche.id);
        else if (!idCours) sansCours.push(fiche.id);
    }
    return duCours.length > 0 ? duCours : sansCours;
}

/**
 * Les leçons SITUÉES (semaine ET séance posées) des cartes d'un cours, lues au
 * stockage (#942). `sauvegarder()` écrit à chaque geste : le stockage ne retarde
 * pas sur l'écran. Même lecteurs que la carte (`semaineDeLecon`, `rangSeanceDeLecon`).
 * @returns {Array<{titre, semaine, rang}>}
 */
function leconsSitueesDuCours(coursId) {
    var pd = window.planificationDonnees;
    if (!pd || typeof pd.chargerCarte !== 'function') return [];
    var lecons = [];
    idsCartesDuCours(pd, coursId).forEach(function(carteId) {
        var donnees = pd.chargerCarte(carteId);
        if (!donnees || !Array.isArray(donnees.noeuds)) return;
        donnees.noeuds.forEach(function(n) {
            var s = semaineDeLecon(n), r = rangSeanceDeLecon(n);
            if (s !== null && r !== null) lecons.push({ titre: n.titre, semaine: s, rang: r });
        });
    });
    return lecons;
}

/**
 * La leçon qui contient ce nœud, en remontant les parents d'une carte
 * SÉRIALISÉE (`leconParenteDe` ne sait lire que la carte active en mémoire, et
 * ne monte que d'un cran).
 * La borne à 50 n'est pas de la prudence rituelle : une carte importée peut
 * porter un cycle de parents, et cette fonction tourne dans un écran de saisie.
 */
function leconAncetreSerialisee(noeud, parId) {
    var courant = noeud, sauts = 0;
    while (courant && courant.parent && sauts < 50) {
        courant = parId[courant.parent];
        if (courant && courant.type === 'lecon') return courant;
        sauts++;
    }
    return null;
}

/**
 * LES OPTIONS DU SÉLECTEUR « PRODUCTION » DE L'INSPECTEUR (25 août 2026).
 *
 * ⚠⚠ CE QUE CE CODE REMPLACE, ET POURQUOI ÇA COMPTAIT. L'ancienne construction
 * portait sa propre liste de types — `['travail','examen','projet','quiz','autre']`
 * — et n'itérait QUE sur elle. Les productions des sept autres types étaient
 * chargées, regroupées dans `parType`, puis abandonnées là : jamais rendues,
 * jamais signalées. Un artefact de portfolio ne pouvait donc PAS être rattaché
 * à un bloc Évaluation de la carte, alors que `metadata.productionId` est
 * précisément le pont prévu pour ça.
 *
 * ⮕ L'ordre et les groupes viennent maintenant de `TYPES_PRODUCTION`
 * (`productions.js`), la même table que le formulaire de Conception. Un type
 * ajouté là-bas apparaît ici sans qu'une ligne soit écrite ici.
 *
 * ▣ RIEN NE PEUT PLUS DISPARAÎTRE EN SILENCE — c'est la leçon du défaut qu'on
 * corrige. Une production dont le type n'est dans AUCUNE entrée de la table
 * (donnée ancienne, type retiré depuis) atterrit dans un dernier groupe
 * « Type non répertorié » plutôt que d'être escamotée. Le sélecteur montre
 * toujours TOUTES les productions actives, quoi qu'il arrive à la table.
 *
 * ⚠ `echapperHtml` sur le titre n'est pas décoratif : le titre est du texte
 * libre de Grégoire, et il entre ici dans un `innerHTML`. Il n'était pas
 * échappé avant — la faille dormait derrière le `undefined` que projetait
 * `chargerProductions`. Réparer le libellé sans échapper l'aurait réveillée.
 *
 * @param {Array} productions - Projection de `chargerProductions()`
 * @param {string} idChoisi - `metadata.productionId` du nœud, ou ''
 * @returns {string} HTML des <optgroup>/<option>, '' si aucune production
 */
function optionsProductionsHTML(productions, idChoisi) {
    if (!Array.isArray(productions) || productions.length === 0) return '';

    var parType = {};
    for (var i = 0; i < productions.length; i++) {
        var t = productions[i].type || 'autre';
        if (!parType[t]) parType[t] = [];
        parType[t].push(productions[i]);
    }

    var table = Array.isArray(window.TYPES_PRODUCTION) ? window.TYPES_PRODUCTION : [];
    if (table.length === 0) {
        console.warn('[carte] TYPES_PRODUCTION indisponible : sélecteur rendu à plat.');
    }

    var html = '';
    var groupeOuvert = null;
    for (var ti = 0; ti < table.length; ti++) {
        var entree = table[ti];
        var lot = parType[entree.id];
        if (!lot || lot.length === 0) continue;
        if (entree.groupe !== groupeOuvert) {
            if (groupeOuvert !== null) html += '</optgroup>';
            html += '<optgroup label="' + echapperHtml(entree.groupe) + '">';
            groupeOuvert = entree.groupe;
        }
        for (var li = 0; li < lot.length; li++) {
            html += optionProductionHTML(lot[li], idChoisi);
        }
        delete parType[entree.id];
    }
    if (groupeOuvert !== null) html += '</optgroup>';

    // Le filet : ce que la table ne connaît pas reste visible et choisissable.
    var orphelins = Object.keys(parType);
    if (orphelins.length > 0) {
        html += '<optgroup label="Type non répertorié">';
        for (var oi = 0; oi < orphelins.length; oi++) {
            var reste = parType[orphelins[oi]];
            for (var ri = 0; ri < reste.length; ri++) {
                html += optionProductionHTML(reste[ri], idChoisi);
            }
        }
        html += '</optgroup>';
    }
    return html;
}

/**
 * Une option du sélecteur.
 *
 * ⚠ La pondération n'est affichée que si le type en porte une qui lui soit
 * propre. Un artefact n'en a pas : c'est le portfolio conteneur qui définit la
 * pondération globale, et `getAvertissementsStructure` avertit explicitement
 * quand une pondération traîne sur un artefact (« sa pondération n'est pas
 * utilisée par le calcul »). Écrire « (0 %) » ou « (6,67 %) » derrière
 * « Artefact 1 » donnerait pour un chiffre de notation ce que le calcul ignore.
 */
function optionProductionHTML(prod, idChoisi) {
    var titre = (prod.titre && String(prod.titre).trim()) || 'Sans titre';
    var portePonderation = (typeof window.typePorteSaPonderation === 'function')
        ? window.typePorteSaPonderation(prod.type)
        : true;
    var suffixe = portePonderation ? ' (' + (prod.ponderation || 0) + ' %)' : '';
    return '<option value="' + echapperHtml(prod.id) + '"' +
        (idChoisi === prod.id ? ' selected' : '') + '>' +
        echapperHtml(titre) + suffixe + '</option>';
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
    var gcDetPlanif = obtenirIdContexteActif(infoCDet);
    var dateEchDet = (typeof obtenirEcheanceEffective === 'function')
        ? obtenirEcheanceEffective(prod, gcDetPlanif).date : (prod.dateEcheance || null);
    return { nomProduction: prod.titre, ponderation: prod.ponderation, nomGrille: nomGrille, nomEchelle: nomEchelle, dateEcheance: dateEchDet };
}




// === EXPORT DU PLAN DE COURS ===


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

    // Le cours rattaché s'affiche ICI, là où l'enseignant regarde déjà. Un champ
    // qui n'est visible que dans un panneau finit par ne pas être rempli — c'est
    // exactement ce qui est arrivé à la semaine des leçons (F1/F3, 6 août).
    // Résolu contre la collection vivante : un cours supprimé n'affiche rien
    // plutôt qu'un code fantôme.
    var coursParId = {};
    try {
        var listeCours = db.getSync('cours', []);
        if (Array.isArray(listeCours)) {
            listeCours.forEach(function(c) { if (c && c.id) coursParId[c.id] = c; });
        }
    } catch (e) { /* pas de cours lisible : les cartes s'affichent nues */ }

    for (var i = 0; i < index.cartes.length; i++) {
        var carte = index.cartes[i];
        var opt = document.createElement('option');
        opt.value = carte.id;
        var coursDeLaCarte = carte.coursId ? coursParId[carte.coursId] : null;
        var suffixe = coursDeLaCarte ? (coursDeLaCarte.code || coursDeLaCarte.nom || '') : '';
        opt.textContent = carte.nom + (suffixe ? ' · ' + suffixe : '');
        if (carte.id === index.active) opt.selected = true;
        select.appendChild(opt);
    }
}

function nouvelleCarte(nom) {
    var index = window.planificationDonnees.getIndex();
    if (!index) index = { active: null, compteurCartes: 0, cartes: [] };
    var id = 'carte_' + (++index.compteurCartes);
    index.cartes.push(window.planificationDonnees.creerEntreeIndex(id, nom));
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
            index.cartes.push(window.planificationDonnees.creerEntreeIndex(id, nom));
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

async function supprimerCarteActive() {
    var index = window.planificationDonnees.getIndex();
    if (!index || index.cartes.length <= 1) {
        console.warn('[Planification] Impossible de supprimer la dernière carte.');
        return;
    }
    var carte = index.cartes.find(function(c) { return c.id === index.active; });
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('carte'))) return;
    if (!confirm('Supprimer la carte « ' + (carte ? carte.nom : '') + ' » ?')) return;
    // #1007 : l'index est relu après l'attente de la fenêtre ; celui d'avant ne vaut plus rien.
    var idVise = carte ? carte.id : index.active;
    index = window.planificationDonnees.getIndex();
    if (!index || index.cartes.length <= 1 || index.active !== idVise) return;

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
    index.cartes.push(window.planificationDonnees.creerEntreeIndex(id, nom.trim() || nomOrigine + ' (copie)'));
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
    // Changer d'onglet de carte n'est pas un changement de données (lot F).
    window.planificationDonnees.sauvegarderIndex(index, { discret: true });
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

    if (!zoneTravail || !espace) {
        console.warn('[Planification] DOM non prêt.');
        return;
    }

    appliquerZoom();

    // Zoom molette
    var gestureEnCours = false;
    // La barre d'alignement flotte en coordonnées d'ÉCRAN au-dessus d'une
    // sélection qui vit en coordonnées de CARTE : tout défilement ou
    // redimensionnement la décroche. Passif — elle ne fait que suivre.
    zoneTravail.addEventListener('scroll', function () { majBarreAlignement(); }, { passive: true });
    window.addEventListener('resize', function () { majBarreAlignement(); }, { passive: true });

    // Le facteur suit l'AMPLITUDE du geste, pas la cadence des événements.
    // Un pas fixe de ±5 % fait courir le zoom plus vite que les doigts dès que
    // le trackpad émet dru — c'est le défaut corrigé sur la visionneuse en
    // #660, resté ici. `ZOOM_SENSIBILITE_MOLETTE` reprend sa valeur.
    zoneTravail.addEventListener('wheel', function(e) {
        if (e.ctrlKey && !gestureEnCours) {
            e.preventDefault();
            // Un deltaY nul est un événement neutre : le trackpad en émet, et
            // le versant « zoom avant » les avalait tous.
            if (!e.deltaY) return;
            zoomer(e.clientX, e.clientY, Math.exp(-e.deltaY * ZOOM_SENSIBILITE_MOLETTE));
        }
    }, { passive: false });

    // Pincement. ⚠ Les deux chemins — geste Safari et tactile générique —
    // étaient branchés EN MÊME TEMPS sur la même zone. Sur iPad, Safari émet
    // les deux familles pendant un seul pincement : chacun réécrivait
    // `etat.zoom` depuis sa propre base et recentrait sur son propre point (le
    // centre de la zone pour l'un, le milieu des doigts pour l'autre), soit
    // deux cycles de zoom contradictoires par image. D'où le `else` — la
    // visionneuse le fait depuis toujours.
    if ('GestureEvent' in window) {
        zoneTravail.addEventListener('gesturestart', function(e) {
            e.preventDefault();
            gestureEnCours = true;
            var p = pointClientDuGeste(e);
            demarrerApercuZoom(p.x, p.y);
        }, { passive: false });
        zoneTravail.addEventListener('gesturechange', function(e) {
            e.preventDefault();
            // `e.scale` est cumulatif depuis `gesturestart`.
            majApercuZoom(apercuZoom.zoomDepart * e.scale);
        }, { passive: false });
        zoneTravail.addEventListener('gestureend', function(e) {
            e.preventDefault();
            gestureEnCours = false;
            finirApercuZoom();
        }, { passive: false });
    } else {
        var touchStartDist = null;
        zoneTravail.addEventListener('touchstart', function(e) {
            if (e.touches.length !== 2) return;
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            demarrerApercuZoom(
                (e.touches[0].clientX + e.touches[1].clientX) / 2,
                (e.touches[0].clientY + e.touches[1].clientY) / 2
            );
        }, { passive: true });
        zoneTravail.addEventListener('touchmove', function(e) {
            if (e.touches.length !== 2 || !touchStartDist) return;
            var dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            majApercuZoom(apercuZoom.zoomDepart * (dist / touchStartDist));
        }, { passive: true });
        zoneTravail.addEventListener('touchend', function() {
            if (!touchStartDist) return;
            touchStartDist = null;
            finirApercuZoom();
        });
        zoneTravail.addEventListener('touchcancel', function() {
            if (!touchStartDist) return;
            touchStartDist = null;
            finirApercuZoom();
        });
    }

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
        // (Le bouton « replier » de la barre de palette est RETIRÉ le 7 août :
        // afficher ou masquer une palette se commande depuis la barre d'outils,
        // et un seul mécanisme vaut mieux que deux voisins. Disparaît avec lui
        // le piège `.planif-palette-toggle` / `.planif-palette-replier` — une
        // classe de STYLE partagée que `querySelector` confondait avec un
        // sélecteur d'identité, ce qui avait fait voler le comportement de repli
        // par le bouton de disposition.)

        // Poignée de redimensionnement — présente sur le planificateur seulement
        // (index.html). Ajoutée le 7 août : le côte à côte de 1.47.0 supposait
        // une palette redimensionnable qui N'EXISTAIT PAS — `rendrePaletteFlottante`
        // ne la rendait que déplaçable. Pointer events, donc souris, doigt et
        // Pencil ; le glisser de nœuds au tactile reste, lui, une porte ouverte.
        var paletteContenu = palette.querySelector('.planif-palette-contenu');
        var paletteHandle = palette.querySelector('.planif-palette-poignee');
        if (paletteHandle && paletteContenu) {
            // Bornes LUES dans le CSS plutôt que redéclarées ici : une seule
            // source de vérité, et la sentinelle géométrique vérifie que ces
            // bornes laissent réellement tenir deux blocs côte à côte.
            var bornesPalette = function() {
                var cs = window.getComputedStyle(palette);
                var min = parseFloat(cs.minWidth);
                var max = parseFloat(cs.maxWidth);
                return {
                    min: isNaN(min) ? 190 : min,
                    max: isNaN(max) ? 720 : max
                };
            };

            paletteHandle.addEventListener('pointerdown', function(e) {
                if (!e.isPrimary) return;
                e.preventDefault();
                e.stopPropagation(); // sinon la palette partirait en déplacement
                var pointerId = e.pointerId;
                var departX = e.clientX;
                var departY = e.clientY;
                var largeurDepart = palette.offsetWidth;
                var hauteurDepart = paletteContenu.clientHeight;
                var bornes = bornesPalette();

                // La palette est ancrée à DROITE par défaut, mais un déplacement
                // antérieur a pu la basculer sur `left` (cf. la barre de titre).
                // On refige le bord droit pour la durée du geste : sans ça, la
                // largeur pousserait le bloc au lieu de l'élargir sur place.
                var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
                var rect = palette.getBoundingClientRect();
                palette.style.right = (wrapperRect.right - rect.right) + 'px';
                palette.style.left = 'auto';

                // Plafond de hauteur : le bas de la fenêtre, marge gardée. Le
                // `max-height` CSS (min(720px, 70vh)) est un DÉFAUT, pas une
                // limite — la poignée existe pour en sortir.
                var hauteurMax = Math.max(120, window.innerHeight - rect.top - 24);

                function onMove(e2) {
                    if (e2.pointerId !== pointerId) return;
                    // Ancrée à droite : tirer vers la GAUCHE élargit.
                    var w = largeurDepart + (departX - e2.clientX);
                    var h = hauteurDepart + (e2.clientY - departY);
                    palette.style.width = Math.min(bornes.max, Math.max(bornes.min, w)) + 'px';
                    paletteContenu.style.maxHeight = Math.min(hauteurMax, Math.max(120, h)) + 'px';
                }
                function onUp(e2) {
                    if (e2.pointerId !== pointerId) return;
                    paletteHandle.removeEventListener('pointermove', onMove);
                    paletteHandle.removeEventListener('pointerup', onUp);
                    paletteHandle.removeEventListener('pointercancel', onUp);
                }
                paletteHandle.setPointerCapture(pointerId);
                paletteHandle.addEventListener('pointermove', onMove);
                paletteHandle.addEventListener('pointerup', onUp);
                paletteHandle.addEventListener('pointercancel', onUp);
            });

            // Double-clic : retour à la taille par défaut — même idiome que la
            // poignée des nœuds, où il rend la main à la disposition automatique.
            paletteHandle.addEventListener('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();
                palette.style.width = '';
                paletteContenu.style.maxHeight = '';
            });
        }
    }
    var palette = document.getElementById('planif-palette');
    rendrePaletteFlottante(palette);
    rendrePaletteFlottante(document.getElementById('planif-palette-nav'));
    initialiserDragGrille();

    // #444 — ACCORDÉONS DE LA PALETTE, par famille.
    //
    // Les 18 pastilles en 6 familles dépassent la hauteur de l'écran iPad :
    // la corbeille et les boutons du bas étaient purement et simplement coupés
    // (capture terrain du 10 août). Replier les familles dont on ne se sert pas
    // dans la séance ramène la palette à une taille utilisable.
    //
    // L'état vit dans la préférence `planifPaletteFamillesRepliees` (liste des
    // `data-zone` fermées) : il survit au rechargement, et le défaut — tableau
    // vide — est exactement le comportement d'avant.
    initialiserAccordeonsPalette();

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
        guideBarre.addEventListener('pointerdown', function(e) {
            if (e.target.closest('.planif-guide-panel-fermer') || e.target.closest('.planif-guide-panel-replier')) return;
            if (!e.isPrimary || e.button > 0) return;
            e.preventDefault();
            var pid = e.pointerId;
            var startX = e.clientX;
            var startY = e.clientY;
            var rect = guidePanel.getBoundingClientRect();
            var wrapperRect = document.getElementById('planif-zone-wrapper').getBoundingClientRect();
            var startLeft = rect.left - wrapperRect.left;
            var startTop = rect.top - wrapperRect.top;

            function onMove(e2) {
                if (e2.pointerId !== pid) return;
                guidePanel.style.left = (startLeft + e2.clientX - startX) + 'px';
                guidePanel.style.top = (startTop + e2.clientY - startY) + 'px';
                guidePanel.style.right = 'auto';
            }
            function onUp(e2) {
                if (e2 && e2.pointerId !== pid) return;
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                document.removeEventListener('pointercancel', onUp);
            }
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onUp);
        });
    }

    // Clic sur le guide flottant = premier plan
    var _zIndexPanneaux = 81;
    if (guidePanel) {
        guidePanel.addEventListener('pointerdown', function() {
            guidePanel.style.zIndex = ++_zIndexPanneaux;
        });
    }

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

    // Sélection par rectangle (lasso) — SOURIS SEULEMENT, à dessein (#148) :
    // au doigt, le même geste sur le fond doit rester le DÉFILEMENT natif du
    // canevas (zoneTravail est un conteneur à scroll). Le lasso au toucher
    // volerait la navigation ; Pointer Events quand même, pour que la garde
    // soit une DÉCISION lisible (pointerType) et non un oubli d'API.
    espace.addEventListener('pointerdown', function(e) {
        if (e.pointerType !== 'mouse') return;
        if (!e.isPrimary || e.button > 0) return;
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
            document.removeEventListener('pointermove', onMoveThrottled);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
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
        document.addEventListener('pointermove', onMoveThrottled);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
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
            fermerMenuVue(false);
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

    var btnCoursCarte = document.getElementById('planif-btn-cours-carte');
    var panneauCoursCarte = document.getElementById('planif-cours-carte-panel');
    if (btnCoursCarte && panneauCoursCarte) {
        btnCoursCarte.addEventListener('click', function(e) {
            e.stopPropagation();
            var dropdownActions = document.getElementById('planif-actions-dropdown');
            if (dropdownActions) dropdownActions.classList.remove('ouvert');
            rendrePanneauCoursCarte();
            panneauCoursCarte.classList.add('ouvert');
        });
        document.addEventListener('click', function() {
            panneauCoursCarte.classList.remove('ouvert');
        });
        panneauCoursCarte.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    Object.keys(PALETTES_FLOTTANTES).forEach(function(quoi) {
        var btn = document.getElementById(PALETTES_FLOTTANTES[quoi].bouton);
        if (!btn) return;
        btn.addEventListener('click', function() { basculerPalette(quoi); });
    });
    appliquerAffichagePalettes();

    brancherRecherche();

    // ── Décloner la sélection (16 août 2026 ; « Décloner » depuis le 3 sept.) ──
    // ⚠ C'est le SEUL item du menu Actions qui porte sur la SÉLECTION et non
    // sur la carte — et c'est pourquoi il RESTE alors que l'Inspecteur offre le
    // même geste : lui seul sert la MULTISÉLECTION, le déclonage en lot. Quand
    // rien de sélectionné n'est cloné, il le DIT — sans quoi le clic ne
    // produirait rien et Grégoire chercherait la panne du mauvais côté.
    var btnDetacher = document.getElementById('planif-btn-detacher-clone');
    if (btnDetacher) {
        btnDetacher.addEventListener('click', function() {
            var cibles = etat.multiSelection.size > 0
                ? Array.from(etat.multiSelection)
                : (etat.selection ? [etat.selection] : []);
            if (!cibles.length) {
                afficherToastLien('Sélectionne d’abord un bloc marqué 🧬 — lui seul se déclone.');
                return;
            }
            var n = detacherDeLaFamille(cibles);
            annoncerDeclonage(n);
        });
    }

    var btnContourner = document.getElementById('planif-btn-liens-contourner');
    if (btnContourner) {
        chargerPrefContournement();
        majItemContournement();
        btnContourner.addEventListener('click', function(e) {
            // ⚠ ON NE REFERME PAS LE MENU, contrairement à tous ses voisins.
            // Le panneau se referme au moindre clic à l'intérieur — parfait
            // pour une ACTION (« Dupliquer », « Exporter »), mauvais pour un
            // ÉTAT : la coche changerait et disparaîtrait dans le même geste,
            // et il faudrait rouvrir le menu pour savoir ce qu'on vient de
            // faire. Ici on la voit basculer, et les liens se retracent
            // derrière. Un clic ailleurs referme, comme d'habitude.
            e.stopPropagation();
            definirContournement(!_lienContourner);
        });
    }

    var btnNettoyage = document.getElementById('planif-btn-nettoyer-titres');
    var panneauNettoyage = document.getElementById('planif-nettoyage-titres-panel');
    if (btnNettoyage && panneauNettoyage) {
        btnNettoyage.addEventListener('click', function(e) {
            e.stopPropagation();
            var dropdownActions = document.getElementById('planif-actions-dropdown');
            if (dropdownActions) dropdownActions.classList.remove('ouvert');
            rendrePanneauNettoyageTitres();
            panneauNettoyage.classList.add('ouvert');
        });
        document.addEventListener('click', function() {
            panneauNettoyage.classList.remove('ouvert');
        });
        panneauNettoyage.addEventListener('click', function(e) { e.stopPropagation(); });
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

    // Export du plan \u2014 3 niveaux \u00D7 3 formats (portage #424). Remplace les
    // boutons Texte/TSV du panneau : un seul point d'entr\u00E9e, dans Actions,
    // \u00E0 c\u00F4t\u00E9 d'Exporter/Importer JSON. M\u00EAme patron de panneau que l'import
    // inter-trimestre.
    var btnExporterPlan = document.getElementById('planif-btn-exporter-plan');
    var panneauExportPlan = document.getElementById('planif-export-plan-panel');
    if (btnExporterPlan && panneauExportPlan) {
        btnExporterPlan.addEventListener('click', function(e) {
            e.stopPropagation();
            var dropdownActions = document.getElementById('planif-actions-dropdown');
            if (dropdownActions) dropdownActions.classList.remove('ouvert');
            rendrePanneauExportPlan();
            panneauExportPlan.classList.add('ouvert');
        });
        document.addEventListener('click', function() {
            panneauExportPlan.classList.remove('ouvert');
        });
        panneauExportPlan.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    // #963 — « Je fais relire ma carte par une IA ». Même patron que le
    // panneau de l'export du plan : Actions ▸ panneau ▸ Télécharger.
    var btnModeleIA = document.getElementById('planif-btn-modele-ia');
    var panneauModeleIA = document.getElementById('planif-modele-ia-panel');
    if (btnModeleIA && panneauModeleIA) {
        btnModeleIA.addEventListener('click', function(e) {
            e.stopPropagation();
            var dropdownActions = document.getElementById('planif-actions-dropdown');
            if (dropdownActions) dropdownActions.classList.remove('ouvert');
            rendrePanneauModeleIA();
            panneauModeleIA.classList.add('ouvert');
        });
        document.addEventListener('click', function() {
            panneauModeleIA.classList.remove('ouvert');
        });
        panneauModeleIA.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    // Modale de l'export personnalisé (#431) : fermeture par le bouton et
    // par un clic sur le voile.
    var modaleExportPerso = document.getElementById('modalExportPersonnalise');
    if (modaleExportPerso) {
        var btnFermerPerso = document.getElementById('export-perso-fermer');
        if (btnFermerPerso) btnFermerPerso.addEventListener('click', fermerModaleExportPerso);
        modaleExportPerso.addEventListener('click', function(e) {
            if (e.target === modaleExportPerso) fermerModaleExportPerso();
        });
    }

    // Boutons de zoom prédéfinis (100%, 75%, 50%, 25%)
    document.querySelectorAll('.planif-btn-zoom-preset').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var niveauZoom = parseFloat(btn.dataset.zoom);
            etat.zoom = niveauZoom;
            appliquerZoom();
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

    // SELECT compris (lot 1, 8 oct. 2026) : R et L, sans modificateur, ne
    // doivent pas agir sur la carte quand on choisit une carte au clavier.
    var pasDansChamp = !document.activeElement.isContentEditable
        && document.activeElement.tagName !== 'INPUT'
        && document.activeElement.tagName !== 'TEXTAREA'
        && document.activeElement.tagName !== 'SELECT';

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
        mettreAJourBoutonsZoomPreset();
        centrerVueSurContenu();
        return;
    }
    // L — bascule la loupe (11 août 2026). Verrou et non maintien : main
    // libre pour écrire après avoir atterri, c'est la demande de Grégoire.
    // ⚠ Sans modificateur : la garde `pasDansChamp` est donc essentielle,
    // sinon taper « leçon » dans un titre ouvrirait la loupe.
    if (!e.metaKey && !e.ctrlKey && !e.altKey && (e.key === 'l' || e.key === 'L') && pasDansChamp) {
        e.preventDefault();
        basculerLoupe();
        return;
    }

    // R — recentrer (lot 1, 8 oct. 2026). Remplace ⌘1, que Chrome et Safari
    // réservent au passage au premier onglet. Sans modificateur : ⌘R recharge
    // la page et doit rester au navigateur.
    if (!e.metaKey && !e.ctrlKey && !e.altKey && (e.key === 'r' || e.key === 'R') && pasDansChamp) {
        e.preventDefault();
        recentrerVue();
        return;
    }

    if ((e.metaKey || e.ctrlKey) && (e.key === 'd' || e.key === 'D') && pasDansChamp) {
        e.preventDefault();
        // Multi-sélection comprise (11 août 2026) — cf. dupliquerSelection().
        // Avant : `if (etat.selection) clonerNoeud(etat.selection)`, qui
        // ignorait en silence tous les autres blocs allumés.
        // ⚠ ⇧ commande la nature du doublon, MÊME RÈGLE que ⌥ + glisser
        // (16 août) : ⌘D rend des copies indépendantes, ⇧⌘D des clones liés.
        // ⚠ Et `e.key` devient 'D' majuscule quand ⇧ est enfoncée : sans le
        // second test, ⇧⌘D ne déclencherait RIEN — le raccourci de clonage
        // serait muet, ce qui est précisément le genre d'échec silencieux que
        // ce module a déjà payé.
        dupliquerSelection(e.shiftKey);
        return;
    }

    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z' && pasDansChamp) {
        e.preventDefault();
        annuler();
        return;
    }
    // ⇧⌘Z seul (lot 1) : ⌘Y, que rien n'annonçait, ouvre l'historique de Safari.
    // Les deux casses, comme ⇧⌘D : avec ⇧, `e.key` peut arriver en majuscule
    // selon le navigateur.
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        if (pasDansChamp) {
            e.preventDefault();
            retablir();
            return;
        }
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (pasDansChamp) {
            // ⚠ Sans lui, Retour arrière ramène WebKit à la page précédente
            // (vu au banc du menu « Vue », 8 oct. 2026).
            e.preventDefault();
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
        if (etat.loupeActive) { desactiverLoupe(); return; }
        deselectionner();
        fermerMenuLien();
    }
}

// Attacher/détacher le keydown global
document.addEventListener('keydown', gererKeydown);

// === EXPORT ===
/**
 * Injecte une liste de nœuds dans la carte active, reconstruit le DOM et sauvegarde.
 * Utilisé par les specs Playwright pour poser leurs fixtures.
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

// =========== PLANIFICATEUR (palette de navigation) ===========
// Remplace les carrousels séquences/leçons de la barre d'outils (4 août 2026,
// exercice 601-101) : la hiérarchie séquences › leçons est verticale par
// nature, le planificateur la montre d'un coup d'œil.
//
// Il NAVIGUE, il ne filtre plus (7 août 2026) : désigner une séquence ou une
// leçon ici la sélectionne et cadre la carte dessus. Le canevas montre toujours
// tout — c'est le retrait conjoint de la vue focalisée, de la compaction des
// séquences et du bouton « Vue globale », qui n'existaient qu'ensemble.

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
    return (typeof obtenirDureePeriode === 'function' && obtenirDureePeriode()) || (window.DUREE_PERIODE_DEFAUT || 50);
}

// Somme des durées (metadata.duree) des descendants non-conteneurs.
function dureeRollupNoeud(nd) {
    if (!nd) return 0;
    // ⚠ #416 lot B — le temps hors classe n'entre PAS dans le Σ d'une leçon.
    // Le compteur de l'en-tête et la jauge du planificateur disent du temps de
    // CLASSE ; y mêler du travail personnel donnerait un total faux là où on
    // s'en sert pour décider quoi couper.
    if (estHorsClasseNoeud(nd)) return 0;
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

// === DATES DU TRIMESTRE, À CÔTÉ DU TITRE « PLANIFICATEUR » (lot 2, 8 oct. 2026) ===
//
// Décisions de Grégoire : « Début du trimestre » et « Fin du trimestre » du
// Cadre (`dateDebut` et `finTrimestre` de `cadreCalendrier`), sous la forme
// « PLANIFICATEUR · du 25 août au 19 décembre 2026 » — l'année une seule fois
// quand les deux dates la partagent. Sans elles, une invitation menant au
// Cadre ; elle remplace l'avis « Semaines dérivées des leçons… (Réglages) »,
// qui renvoyait vers une section d'un autre nom.
//
// ▣ La présentation « réserve à gauche » est RETIRÉE par le même lot (on ne
// pouvait pas y glisser une leçon arrivant à la hauteur de la réserve). La
// préférence qu'elle écrivait, `planifReserveDisposition`, reste telle quelle
// dans `preferencesUtilisateur` : rien n'est effacé, plus rien ne la lit.
var MOIS_DATES_TRIMESTRE = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/**
 * « du 25 août au 19 décembre 2026 » ; « du 1er décembre 2026 au 8 janvier 2027 »
 * quand les années diffèrent. `null` si l'une des dates manque ou est mal formée.
 */
function formaterDatesTrimestre(debut, fin) {
    var re = /^(\d{4})-(\d{2})-(\d{2})$/;
    var d = re.exec(debut || ''), f = re.exec(fin || '');
    if (!d || !f) return null;
    function jourMois(m) {
        var jour = parseInt(m[3], 10);
        var mois = MOIS_DATES_TRIMESTRE[parseInt(m[2], 10) - 1];
        if (!mois || jour < 1 || jour > 31) return null;
        return (jour === 1 ? '1er' : String(jour)) + ' ' + mois;
    }
    var jd = jourMois(d), jf = jourMois(f);
    if (!jd || !jf) return null;
    return d[1] === f[1]
        ? 'du ' + jd + ' au ' + jf + ' ' + f[1]
        : 'du ' + jd + ' ' + d[1] + ' au ' + jf + ' ' + f[1];
}

/** Les dates du trimestre actif, formatées ; `null` si le Cadre ne les a pas. */
function datesTrimestreDuCadre() {
    var cadre = null;
    try { cadre = db.getSync(cle('cadreCalendrier'), null); } catch (e) { cadre = null; }
    if (!cadre || typeof cadre !== 'object') return null;
    // `debutTrimestre` : ancien nom du champ, que trimestre-v2.js lit encore.
    return formaterDatesTrimestre(cadre.dateDebut || cadre.debutTrimestre, cadre.finTrimestre);
}

function mettreAJourDatesPlanificateur() {
    var dates = datesTrimestreDuCadre();
    var span = document.getElementById('planif-dates-trimestre');
    var invitation = document.getElementById('planif-invitation-dates');
    if (span) span.textContent = dates ? ' · ' + dates : '';
    if (invitation) invitation.hidden = !!dates;
}

/** Le lien « Cadre › Trimestre » de l'invitation : même chemin que le bandeau d'archive. */
function ouvrirCadreTrimestre() {
    // En « Vue plein écran », la palette du planificateur reste visible : sans
    // ceci, le lien menait au Cadre en gardant en-tête et navigation masqués —
    // et sur l'iPad, sans Échap, plus aucun chemin pour en sortir (relecture de
    // Cowork, 8 oct. 2026, vérifiée au banc).
    if (_planifPleinEcran) togglePleinEcranCarte();
    if (typeof window.naviguerVersReglagesTrimestre === 'function') window.naviguerVersReglagesTrimestre();
    var champ = document.getElementById('v2-debutTrimestre');
    if (champ && champ.offsetParent !== null) champ.focus();
}

// =========== AFFICHAGE DES PALETTES FLOTTANTES (7 août 2026) ===========
// Les deux palettes — « Nœuds » et « Planificateur » — se commandent depuis la
// barre d'outils de la carte. Elles portaient auparavant chacune un bouton de
// « repli » qui n'escamotait que leur contenu, en laissant leur barre de titre
// sur le canevas. Un seul mécanisme les remplace : afficher ou masquer, pour de
// bon, et l'état survit au rechargement.
//
// Le registre associe l'identifiant DOM de la palette, sa préférence et le
// bouton qui la commande. Passer par une table plutôt que par deux blocs
// jumeaux garantit que les deux palettes se comportent exactement pareil — la
// symétrie est dans la donnée, pas dans une discipline de copie.
var PALETTES_FLOTTANTES = {
    noeuds: {
        palette: 'planif-palette',
        pref: 'planifPaletteNoeudsVisible',
        bouton: 'planif-btn-palette-noeuds',
        nom: 'Nœuds'
    },
    planificateur: {
        palette: 'planif-palette-nav',
        pref: 'planifPalettePlanificateurVisible',
        bouton: 'planif-btn-palette-planificateur',
        nom: 'Planificateur'
    }
};

/** Une palette est visible sauf si la préférence dit explicitement le contraire. */
function paletteVisible(quoi) {
    var def = PALETTES_FLOTTANTES[quoi];
    if (!def) return true;
    try {
        if (typeof obtenirPreference !== 'function') return true;
        return obtenirPreference(def.pref) !== false;
    } catch (e) {
        return true;
    }
}

function basculerPalette(quoi) {
    var def = PALETTES_FLOTTANTES[quoi];
    if (!def) return;
    var vers = !paletteVisible(quoi);
    try {
        if (typeof definirPreference === 'function') definirPreference(def.pref, vers);
    } catch (e) {
        console.warn('[Planification] Affichage de palette non enregistré :', e);
    }
    appliquerAffichagePalettes();
}

/** Applique l'état des deux palettes au DOM — au boot et après chaque bascule. */
function appliquerAffichagePalettes() {
    Object.keys(PALETTES_FLOTTANTES).forEach(function(quoi) {
        var def = PALETTES_FLOTTANTES[quoi];
        var visible = paletteVisible(quoi);
        var palette = document.getElementById(def.palette);
        if (palette) palette.classList.toggle('planif-palette-masquee', !visible);
        var btn = document.getElementById(def.bouton);
        if (!btn) return;
        // `aria-pressed` décrit l'état COURANT (la palette est-elle affichée ?),
        // le title dit ce que le clic produira — même partage que le bouton de
        // disposition juste en dessous.
        btn.setAttribute('aria-pressed', visible ? 'true' : 'false');
        btn.classList.toggle('actif', visible);
        btn.title = visible ? 'Masquer la palette « ' + def.nom + ' »'
                            : 'Afficher la palette « ' + def.nom + ' »';
        btn.setAttribute('aria-label', btn.title);
    });
}

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

/**
 * Le CADRE effectivement rendu : l'ensemble des numéros de semaine qui ont une
 * rangée dans la grille (7 août 2026).
 *
 * Sans lui, un ancrage hors cadre faisait DISPARAÎTRE la leçon : elle ne
 * correspondait à aucune rangée, et « Non planifié » n'attrapait que
 * `semaine === null`. Deux chemins y menaient — le champ « Semaine » de
 * l'inspecteur (aucun attribut `max`) et l'import Markdown (`val >= 1`, sans
 * borne haute) ; seul le glisser était protégé (calage sur `maxSemaine`).
 *
 * Le cadre n'est PAS l'intervalle [1..max] : les rangées dérivent du calendrier
 * et sont trouées (une semaine de planification ou d'examens n'a pas de numéro).
 * Une semaine 4 tombant dans ce trou était invisible au même titre qu'une
 * semaine 42 — d'où un Set, et non une borne haute.
 *
 * Décision Grégoire (7 août) : l'ancrage hors cadre RETOMBE dans « Non
 * planifié », il n'est pas refusé à la saisie. La valeur reste écrite dans
 * `metadata.semaine` — si le Cadre du trimestre s'étend plus tard, la leçon
 * reprend sa rangée d'elle-même.
 */
function cadreSemainesGrille(rangees) {
    var cadre = new Set();
    for (var i = 0; i < rangees.length; i++) {
        if (rangees[i].type === 'semaine') cadre.add(rangees[i].num);
    }
    return cadre;
}

/** Semaine d'accueil d'une leçon dans la grille, ou null si hors cadre. */
function semaineGrilleLecon(lec, cadre) {
    var s = semaineDeLecon(lec);
    return (s !== null && cadre.has(s)) ? s : null;
}

function itemSequenceGrille(seq, niveau) {
    var etendue = etendueTemporelle(seq);
    var libelle = niveau > 0 ? cheminSequence(seq) : (seq.titre || 'Sans titre');
    var dureeSeq = dureeRollupNoeud(seq);
    var pill = etendue && etendue.fin !== etendue.debut
        ? formaterEtendue(etendue)
        : (dureeSeq ? formaterPeriodes(dureeSeq) : compterLeconsDescendantes(seq) + ' leçon' + (compterLeconsDescendantes(seq) > 1 ? 's' : ''));
    // « Actif » suit désormais la SÉLECTION du canevas, et non un état de vue
    // propre au planificateur : il n'y a plus qu'une seule notion de « ce sur
    // quoi je travaille », partagée par la carte, l'Inspecteur et cette grille.
    return '<div class="planif-som-item planif-som-seq' + (seq.id === etat.selection ? ' actif' : '') + '"' +
           ' data-grille-type="sequence" data-grille-id="' + seq.id + '"' +
           ' data-action="planificationCarte.cadrerSurSequence"' +
           ' data-param="' + seq.id + '"' +
           ' title="' + echapperHtml(libelle) + '">' +
           '<span class="planif-som-nom">' + echapperHtml(libelle) + '</span>' +
           '<span class="planif-som-pill">' + echapperHtml(pill) + '</span>' +
           '</div>';
}

/**
 * @param {number|null} [semaineHorsCadre] Semaine ancrée mais sans rangée
 *   d'accueil. Affichée en pastille pour que « Non planifié » ne donne pas
 *   l'impression d'avoir effacé la saisie de l'enseignant.
 */
function itemLeconGrille(lec, avecContexte, semaineHorsCadre) {
    var duree = formaterPeriodes(dureeRollupNoeud(lec));
    var depliee = _leconsDepliees.has(lec.id);
    var enfants = (lec.enfants || []).map(function(eid) { return etat.noeuds.get(eid); }).filter(Boolean);
    var parent = lec.parent ? etat.noeuds.get(lec.parent) : null;
    var contexte = (avecContexte && parent && parent.type === 'sequence')
        ? '<span class="planif-grille-contexte">' + echapperHtml(parent.titre || 'Sans titre') + '</span>'
        : '';

    var html = '<div class="planif-som-item planif-som-lecon' + (lec.id === etat.selection ? ' actif' : '') + '"' +
        ' data-grille-type="lecon" data-grille-id="' + lec.id + '"' +
        ' data-action="planificationCarte.naviguerSommaireLecon"' +
        ' data-param="' + lec.id + '"' +
        ' title="' + echapperHtml(lec.titre || 'Sans titre') + '">' +
        (enfants.length > 0
            ? '<span class="planif-grille-chevron" data-action="planificationCarte.basculerDetailLecon" data-param="' + lec.id + '" title="' + (depliee ? 'Replier' : 'Déplier') + ' le déroulé">' + (depliee ? '▾' : '▸') + '</span>'
            : '<span class="planif-grille-chevron planif-grille-chevron--vide"></span>') +
        '<span class="planif-som-nom">' + echapperHtml(lec.titre || 'Sans titre') + contexte + '</span>' +
        (typeof semaineHorsCadre === 'number'
            ? '<span class="planif-som-pill" title="Le cadre du trimestre ne comporte pas de semaine ' + semaineHorsCadre +
              ' — glisse la leçon dans une rangée, ou étends le Cadre du trimestre.">Sem. ' + semaineHorsCadre + ' hors cadre</span>'
            : '') +
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

/**
 * Enveloppe d'un élément dans une rangée (7 août 2026).
 *
 * Les éléments d'une même semaine se lisaient EMPILÉS, une ligne chacun : une
 * semaine à trois leçons occupait trois rangs de hauteur et la grille défilait
 * pour rien. Ils passent côte à côte — c'est du RENDU pur, aucun type, aucune
 * migration (déblocage identifié au §5.3 du document de méthode).
 *
 * Ce n'est pas la « disposition à deux colonnes » écartée le 6 août : celle-là
 * était imposée et resserrait des titres déjà tronqués. Ici un élément seul
 * garde toute la largeur, et une largeur plancher fait PASSER À LA LIGNE plutôt
 * que de rétrécir. Une leçon dépliée reprend la pleine largeur : son déroulé se
 * lit en hauteur, le mettre en colonne étroite le rendrait illisible.
 *
 * L'enveloppe sert aussi à garder la leçon et son déroulé solidaires — sans
 * elle, le déroulé deviendrait un frère de la leçon dans le flux flex et
 * s'afficherait À CÔTÉ d'elle.
 */
function blocGrille(html, pleineLargeur) {
    return '<div class="planif-grille-bloc' +
           (pleineLargeur ? ' planif-grille-bloc--large' : '') + '">' + html + '</div>';
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

    // Auto-défilement au bord (6 août soir) : le contenu de la palette est
    // plafonné en hauteur, donc une rangée défilée hors de la fenêtre était
    // littéralement INATTEIGNABLE — rangeeSousPointeur ne voit que le visible.
    // Approcher un bord pendant le glisser fait défiler ; la vitesse croît
    // avec la profondeur d'approche (geste précis près du bord, rapide au
    // ras). Boucle rAF autonome : le défilement continue même pointeur
    // immobile, sinon il faudrait remuer la souris pour avancer.
    var ZONE_BORD = 44;
    var VITESSE_MAX = 14;
    var _rafDefilement = null;
    var _vitesseDefilement = 0;

    function zoneDefilable() {
        return conteneur.closest('.planif-nav-contenu') || conteneur.parentElement || conteneur;
    }

    function evaluerDefilement(y) {
        var zone = zoneDefilable();
        if (!zone) { _vitesseDefilement = 0; return; }
        var r = zone.getBoundingClientRect();
        if (y < r.top + ZONE_BORD) {
            _vitesseDefilement = -Math.ceil(VITESSE_MAX * Math.min(1, (r.top + ZONE_BORD - y) / ZONE_BORD));
        } else if (y > r.bottom - ZONE_BORD) {
            _vitesseDefilement = Math.ceil(VITESSE_MAX * Math.min(1, (y - (r.bottom - ZONE_BORD)) / ZONE_BORD));
        } else {
            _vitesseDefilement = 0;
        }
        if (_vitesseDefilement !== 0 && !_rafDefilement) boucleDefilement();
    }

    function boucleDefilement() {
        _rafDefilement = requestAnimationFrame(function() {
            _rafDefilement = null;
            if (!drag || !drag.demarre || _vitesseDefilement === 0) return;
            var zone = zoneDefilable();
            if (zone) zone.scrollTop += _vitesseDefilement;
            boucleDefilement();
        });
    }

    function arreterDefilement() {
        _vitesseDefilement = 0;
        if (_rafDefilement) { cancelAnimationFrame(_rafDefilement); _rafDefilement = null; }
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
        evaluerDefilement(e.clientY);
        var rangee = rangeeSousPointeur(e.clientX, e.clientY);
        if (rangee !== rangeeCible) {
            nettoyerCible();
            if (rangee) {
                rangeeCible = rangee;
                rangee.classList.add('planif-grille-rangee--cible');
            }
        }
    });

    // #148 : sans pointercancel, un drag de pastille interrompu (Safari
    // reprend le geste) laissait le style de drag collé et le défilement
    // automatique en marche. Trouvé par la sentinelle, préexistant.
    document.addEventListener('pointercancel', function() {
        if (!drag) return;
        var info = drag;
        drag = null;
        arreterDefilement();
        nettoyerCible();
        if (info.demarre) info.item.classList.remove('planif-grille-item-drag');
    });

    document.addEventListener('pointerup', function(e) {
        if (!drag) return;
        var info = drag;
        drag = null;
        arreterDefilement();
        nettoyerCible();
        if (!info.demarre) return; // simple clic : la navigation suit son cours
        info.item.classList.remove('planif-grille-item-drag');
        // Avaler le clic de navigation qui suit un vrai glisser.
        // #929 : ce clic n'existe PAS toujours. Relâché sur un autre élément
        // que celui saisi (une pastille changée de rangée), WebKit n'en émet
        // aucun : l'avaleur restait armé et mangeait le PROCHAIN clic de
        // l'écran — le premier clic sur le bouton de disposition ne faisait
        // rien (mesuré au banc, 20 sept. 2026). Le clic qui suit un pointerup
        // part dans la même tâche : au tour suivant, l'avaleur n'a plus d'objet.
        var avalerClic = function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        };
        document.addEventListener('click', avalerClic, { capture: true, once: true });
        setTimeout(function() {
            document.removeEventListener('click', avalerClic, { capture: true });
        }, 0);

        var rangee = rangeeSousPointeur(e.clientX, e.clientY);
        if (!rangee) return;
        var brut = rangee.getAttribute('data-grille-semaine');
        deposerDansGrille(info.type, info.id, brut === '' ? null : parseInt(brut, 10));
    });
}

function mettreAJourPlanificateur() {
    var conteneur = document.getElementById('planif-sommaire');
    if (!conteneur) return;
    mettreAJourDatesPlanificateur();

    var derive = deriverRangeesGrille();
    var cadre = cadreSemainesGrille(derive.rangees);
    var hierarchie = listerSequencesHierarchie('temporel');
    var toutesLecons = [];
    for (var entry of etat.noeuds) {
        if (entry[1].type === 'lecon') toutesLecons.push(entry[1]);
    }
    toutesLecons.sort(function(a, b) { return ((a.x || 0) - (b.x || 0)) || ((a.y || 0) - (b.y || 0)); });

    if (hierarchie.length === 0 && toutesLecons.length === 0) {
        conteneur.innerHTML = '<div class="planif-som-vide">Aucune séquence — glisse un nœud « Séquence » sur la carte pour planifier ici.</div>';
        ajouterOffreDeReprise(conteneur.querySelector('.planif-som-vide'));
        mettreAJourJaugeTemps([]);
        return;
    }

    // (Le bouton « Vue globale » est retiré : le canevas ne se filtre plus, il
    // n'y a donc plus de vue à quitter pour y revenir.)
    var html = '';

    // La grille se construit à part, puis se COMPOSE avec la réserve. Assembler
    // par concaténation dans l'ordre voulu évite de retoucher du HTML déjà bâti.
    var htmlGrille = '<div class="planif-grille">';
    for (var r = 0; r < derive.rangees.length; r++) {
        var rangee = derive.rangees[r];
        if (rangee.type !== 'semaine') {
            htmlGrille += '<div class="planif-grille-rangee planif-grille-rangee--speciale">' +
                    '<div class="planif-grille-num">—</div>' +
                    '<div class="planif-grille-cellule">' +
                    (rangee.type === 'planification' ? 'Semaine de planification' : "Semaine d'examens") +
                    '</div></div>';
            continue;
        }
        var num = rangee.num;
        var contenu = '';
        // Les séquences posées dans CETTE rangée. Sert à décider si une leçon a
        // besoin de son étiquette de contexte (7 août 2026) : sur la semaine 11,
        // le nom de la séquence apparaissait TROIS fois — une comme séquence, et
        // une sur chacune de ses deux leçons. L'étiquette existe pour la leçon
        // qui s'affiche LOIN de sa séquence ; quand la séquence est deux lignes
        // au-dessus, c'est du bruit.
        var seqDeLaRangee = new Set();
        for (var h = 0; h < hierarchie.length; h++) {
            var et = etendueTemporelle(hierarchie[h].seq);
            if (et && et.debut === num) {
                seqDeLaRangee.add(hierarchie[h].seq.id);
                contenu += blocGrille(itemSequenceGrille(hierarchie[h].seq, hierarchie[h].niveau), false);
            }
        }
        for (var l = 0; l < toutesLecons.length; l++) {
            if (semaineDeLecon(toutesLecons[l]) === num) {
                var besoinContexte = !(toutesLecons[l].parent && seqDeLaRangee.has(toutesLecons[l].parent));
                contenu += blocGrille(itemLeconGrille(toutesLecons[l], besoinContexte),
                                      _leconsDepliees.has(toutesLecons[l].id));
            }
        }
        htmlGrille += '<div class="planif-grille-rangee' + (contenu ? '' : ' planif-grille-rangee--vide') + '" data-grille-semaine="' + num + '">' +
                '<div class="planif-grille-num">' + num + '</div>' +
                '<div class="planif-grille-cellule">' + contenu + '</div>' +
                '</div>';
    }
    htmlGrille += '</div>';

    // Zone « Non planifié » (Q1/Q2) : séquences sans étendue + leçons sans
    // semaine. À la migration, TOUT part ici — c'est la liste de travail.
    // Elle recueille AUSSI ce qui est ancré hors cadre — sans quoi la leçon
    // (ou la séquence dont l'étendue commence hors cadre) n'apparaîtrait nulle
    // part : les rangées ci-dessus ne peuvent accueillir que leurs propres
    // numéros. Voir `cadreSemainesGrille()`.
    var nonPlanifie = '';
    for (var h2 = 0; h2 < hierarchie.length; h2++) {
        var et2 = etendueTemporelle(hierarchie[h2].seq);
        if (!et2 || !cadre.has(et2.debut)) {
            nonPlanifie += blocGrille(itemSequenceGrille(hierarchie[h2].seq, hierarchie[h2].niveau), false);
        }
    }
    for (var l2 = 0; l2 < toutesLecons.length; l2++) {
        if (semaineGrilleLecon(toutesLecons[l2], cadre) === null) {
            nonPlanifie += blocGrille(itemLeconGrille(toutesLecons[l2], true, semaineDeLecon(toutesLecons[l2])),
                                      _leconsDepliees.has(toutesLecons[l2].id));
        }
    }
    // Elle se rend en bloc après la grille (la colonne à gauche est retirée
    // depuis le lot 2 du 8 oct. 2026). `data-grille-semaine=""` porte la
    // sémantique « déposer ici = désancrer ».
    // #929 (tranché par Grégoire, 20 sept. 2026) : la zone se rend MÊME VIDE.
    // Elle est la seule cible de désancrage — absente, plus aucune leçon ne
    // pouvait quitter le calendrier par le glisser. Vide ou pleine, le
    // balisage de la cible est le même : le dépôt ne connaît pas l'état.
    var zoneReserve =
        '<div class="planif-grille-nonplanifie"' +
        ' data-grille-semaine="">' +
        '<div class="planif-grille-nonplanifie-titre">Non planifié</div>' +
        (nonPlanifie ||
            '<div class="planif-grille-nonplanifie-vide">Glisse ici une leçon pour la retirer du calendrier.</div>') +
        '</div>';

    html += htmlGrille + zoneReserve;

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
    // Les cartes du MÊME COURS remontent en tête (lot 2) : c'est le geste de
    // rentrée, et le fouiller dans la liste complète était justement la corvée
    // de #368. Elles restent listées à leur place ensuite — le groupe du haut
    // est un raccourci, pas un filtre qui cacherait le reste.
    var coursEnJeu = coursEnJeuPourReprise();
    var reprises = coursEnJeu ? window.planificationDonnees.listerReprisesPourCours(coursEnJeu) : [];

    var html = '';
    if (reprises.length) {
        html += '<div class="planif-import-tri-groupe">Même cours</div>';
        for (var r = 0; r < reprises.length; r++) {
            var rep = reprises[r];
            html += '<div class="planif-import-tri-ligne">' +
                    '<span class="planif-import-tri-nom" title="' + echapperHtml(rep.carte.nom) + '">' + echapperHtml(rep.carte.nom) + '</span>' +
                    '<span class="planif-import-tri-nb">' + echapperHtml(rep.trimestreNom) + '</span>' +
                    '<button type="button" class="planif-btn-carte planif-import-tri-btn" data-tid="' + echapperHtml(rep.trimestreId) + '" data-cid="' + echapperHtml(rep.carte.id) + '">Reprendre</button>' +
                    '</div>';
        }
    }

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

// === EXPORT DU PLAN — PANNEAU NIVEAU × FORMAT (portage #424, 8 août 2026) ===
//
// La mémoire du choix vit le temps de la session d'écran, pas en préférence :
// l'enseignant qui exporte trois niveaux d'affilée ne re-choisit que ce qui
// change. Défaut : « En classe » en texte — l'usage le plus fréquent (D4).
var exportPlanNiveau = 'deroulement';
var exportPlanFormat = 'texte';
// Le groupe-cours dont les dates alimentent la colonne Date (#416 lot C, D9).
// Il ne vit PAS dans le gabarit : un cours à trois groupes obligerait sinon à
// trois gabarits identiques. Il se choisit au moment de l'export.
var exportPlanGroupe = null;

/**
 * Les formats qu'un gabarit accepte.
 *
 * ⚠ Trois cas, et ils ne se devinent pas l'un l'autre :
 *   - un DOCUMENT générique (Plan de cours, En classe, Preuve d'alignement) rend
 *     les trois formats — c'est sa forme historique ;
 *   - le Calendrier déclare les siens (`formats`) : pas de Texte ;
 *   - un gabarit de l'UTILISATEUR ne rend que des tableaux (décision du
 *     12 août), donc jamais de Texte non plus.
 */
function formatsDuGabarit(exporteur, gabaritId) {
    var entree = exporteur.NIVEAUX.find(function(n) { return n.id === gabaritId; });
    if (!entree) {
        return exporteur.FORMATS.filter(function(f) { return f.id !== 'texte'; });
    }
    if (!Array.isArray(entree.formats)) return exporteur.FORMATS;
    return exporteur.FORMATS.filter(function(f) { return entree.formats.indexOf(f.id) !== -1; });
}

/** L'appel d'export des deux boutons — un seul endroit, pour qu'ils ne divergent pas. */
function optionsExport(exporteur) {
    var options = exportPlanGroupe ? { groupeCoursId: exportPlanGroupe } : undefined;
    // Un gabarit de l'utilisateur n'a pas d'entrée dans NIVEAUX : il se génère
    // par le magasin. Les documents génériques gardent leur chemin historique,
    // qui est ce que le golden master fige à l'octet près.
    var estDUsine = exporteur.NIVEAUX.some(function(n) { return n.id === exportPlanNiveau; });
    return estDUsine
        ? exporteur.genererExport(exportPlanNiveau, exportPlanFormat, null, options)
        : exporteur.genererDepuisGabarit(exportPlanNiveau, exportPlanFormat, options);
}

function rendrePanneauExportPlan() {
    var panneau = document.getElementById('planif-export-plan-panel');
    var exporteur = window.planificationExport;
    if (!panneau || !exporteur) return;

    function groupeRadios(titre, nomGroupe, options, valeurCourante) {
        var html = '<div class="planif-import-tri-groupe">' + titre + '</div>';
        options.forEach(function(opt) {
            var coche = opt.id === valeurCourante ? ' checked' : '';
            html += '<label class="planif-checkbox-label planif-export-plan-choix">' +
                '<input type="radio" name="' + nomGroupe + '" value="' + opt.id + '"' + coche + '> ' +
                echapperHtml(opt.label) +
                '</label>';
        });
        return html;
    }

    // Un gabarit peut refuser un format (le Calendrier n'a pas de sortie Texte
    // — un tableau en texte suivi n'est que le tableau en moins lisible). Si le
    // format retenu n'est plus offert, on bascule sur le premier accepté plutôt
    // que de laisser un choix qui produirait un document vide.
    var formatsOfferts = formatsDuGabarit(exporteur, exportPlanNiveau);
    if (!formatsOfferts.some(function(f) { return f.id === exportPlanFormat; })) {
        exportPlanFormat = formatsOfferts[0].id;
    }

    // ⚠ C'EST LA COLONNE DATE QUI POSE LA QUESTION DU GROUPE, pas l'ouverture
    // du panneau (D9). Un gabarit sans date ne la pose pas ; avec un seul
    // groupe, il est pris sans rien demander.
    var groupes = typeof exporteur.groupesCoursDeLaCarte === 'function'
        ? exporteur.groupesCoursDeLaCarte() : [];
    var demandeLeGroupe = exportPlanNiveau === 'calendrier' && groupes.length > 1;
    if (!demandeLeGroupe) exportPlanGroupe = null;

    var htmlGroupe = '';
    if (demandeLeGroupe) {
        if (!groupes.some(function(g) { return g.id === exportPlanGroupe; })) {
            exportPlanGroupe = groupes[0].id;
        }
        htmlGroupe = '<div class="planif-import-tri-groupe">Groupe</div>' +
            '<div class="planif-import-tri-ligne">' +
            '<select id="planif-export-plan-groupe" class="planif-select-carte"' +
            ' aria-label="Groupe dont les dates alimentent la colonne Date">' +
            groupes.map(function(g) {
                // ⚠ Le nom du groupe est une donnée saisie par l'utilisateur.
                return '<option value="' + echapperHtml(g.id) + '"' +
                    (g.id === exportPlanGroupe ? ' selected' : '') + '>' +
                    echapperHtml(g.nom) + '</option>';
            }).join('') +
            '</select></div>' +
            '<div class="planif-export-plan-note">Les dates changent d’un groupe à l’autre.</div>';
    }

    // Libellés statiques des constantes du module — echapperHtml par principe.
    // ⚠ La liste vient du MAGASIN, pas de NIVEAUX : sinon les gabarits créés
    // par l'utilisateur n'apparaîtraient que dans l'éditeur, et il faudrait
    // ouvrir une modale pour exporter ce qu'on vient d'y définir.
    var choix = exporteur.listerGabarits().map(function(g) { return { id: g.id, label: g.nom }; });
    if (!choix.some(function(c) { return c.id === exportPlanNiveau; })) {
        exportPlanNiveau = choix[0].id;
    }

    var html = groupeRadios('Gabarit', 'planif-export-niveau', choix, exportPlanNiveau) +
        '<div class="planif-import-tri-ligne planif-export-plan-actions">' +
        '<button type="button" class="planif-btn-carte" id="planif-export-plan-personnaliser">Gabarits d’export…</button>' +
        '</div>' +
        groupeRadios('Format', 'planif-export-format', formatsOfferts, exportPlanFormat) +
        htmlGroupe +
        '<div class="planif-import-tri-ligne planif-export-plan-actions">' +
        '<button type="button" class="planif-btn-carte" id="planif-export-plan-copier">Copier</button>' +
        '<button type="button" class="planif-btn-carte" id="planif-export-plan-telecharger">Télécharger</button>' +
        '</div>';
    panneau.innerHTML = html;

    panneau.querySelectorAll('input[name="planif-export-niveau"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            exportPlanNiveau = radio.value;
            // Le gabarit commande les formats offerts et la question du groupe :
            // le panneau se redessine plutôt que de garder un choix devenu faux.
            rendrePanneauExportPlan();
        });
    });
    var selGroupe = document.getElementById('planif-export-plan-groupe');
    if (selGroupe) {
        selGroupe.addEventListener('change', function() { exportPlanGroupe = selGroupe.value; });
    }
    var btnPersonnaliser = document.getElementById('planif-export-plan-personnaliser');
    if (btnPersonnaliser) {
        btnPersonnaliser.addEventListener('click', function() {
            // L'éditeur s'ouvre SUR le gabarit choisi dans le panneau : on ne
            // fait pas re-chercher à l'utilisateur ce qu'il vient de désigner.
            gabaritEnCours = exportPlanNiveau;
            panneau.classList.remove('ouvert');
            ouvrirModaleExportPerso();
        });
    }
    panneau.querySelectorAll('input[name="planif-export-format"]').forEach(function(radio) {
        radio.addEventListener('change', function() { exportPlanFormat = radio.value; });
    });

    document.getElementById('planif-export-plan-telecharger').addEventListener('click', function() {
        var doc = optionsExport(exporteur);
        if (!doc) { afficherToastLien("L'export a échoué — aucune carte active."); return; }
        var format = exporteur.FORMATS.find(function(f) { return f.id === exportPlanFormat; });
        telechargerFichier(doc, exporteur.nomFichierExport(exportPlanNiveau, exportPlanFormat), format.mime);
        panneau.classList.remove('ouvert');
    });

    document.getElementById('planif-export-plan-copier').addEventListener('click', function() {
        var doc = optionsExport(exporteur);
        if (!doc) { afficherToastLien("L'export a échoué — aucune carte active."); return; }
        function copieReussie() {
            afficherToastLien('Plan copié — colle-le où tu veux.');
            panneau.classList.remove('ouvert');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(doc).then(copieReussie).catch(function() {
                copierExportFallback(doc); copieReussie();
            });
        } else {
            copierExportFallback(doc); copieReussie();
        }
    });
}

// === MODÈLE « JE FAIS RELIRE MA CARTE PAR UNE IA » (#963, 27 sept. 2026) ===
//
// Le panneau ne fait que DEUX choix — l'étape et la semaine jusqu'où la carte
// est bâtie — puis télécharge. La composition vit dans planification-export.js
// (`genererModeleCarte`), qui ne lit que la carte et n'écrit rien.
// L'étape retenue survit à la fermeture du panneau (session seulement) ; la
// semaine, non : son défaut suit la carte, qui a pu grandir entre-temps.
var modeleIAEtape = 'construire';

function rendrePanneauModeleIA() {
    var panneau = document.getElementById('planif-modele-ia-panel');
    var exporteur = window.planificationExport;
    if (!panneau || !exporteur) return;

    var nbSemaines = exporteur.nombreSemainesTrimestre();
    var parDefaut = exporteur.semaineParDefautModele();
    var borne = Math.max(nbSemaines || 0, parDefaut || 0, 1);
    var semaine = parDefaut || borne;

    // Libellés statiques des constantes du module — echapperHtml par principe.
    var html = '<div class="planif-import-tri-groupe">Mon étape</div>';
    exporteur.ETAPES_MODELE.forEach(function(et) {
        html += '<label class="planif-checkbox-label planif-export-plan-choix">' +
            '<input type="radio" name="planif-modele-ia-etape" value="' + echapperHtml(et.id) + '"' +
            (et.id === modeleIAEtape ? ' checked' : '') + '> ' + echapperHtml(et.label) +
            '</label>';
    });
    html += '<div class="planif-import-tri-groupe">Carte bâtie jusqu’à la semaine</div>' +
        '<div class="planif-import-tri-ligne">' +
        '<select id="planif-modele-ia-semaine" class="planif-select-carte" aria-label="Carte bâtie jusqu’à la semaine">';
    for (var s = 1; s <= borne; s++) {
        html += '<option value="' + s + '"' + (s === semaine ? ' selected' : '') + '>Semaine ' + s + '</option>';
    }
    html += '</select></div>' +
        '<div class="planif-export-plan-note">Le fichier contient des consignes, puis ta carte telle qu’elle est. Colle-le dans l’IA de ton choix : ta carte n’est pas modifiée.</div>' +
        '<div class="planif-import-tri-ligne planif-export-plan-actions">' +
        '<button type="button" class="planif-btn-carte" id="planif-modele-ia-telecharger">Télécharger</button>' +
        '</div>';
    panneau.innerHTML = html;

    panneau.querySelectorAll('input[name="planif-modele-ia-etape"]').forEach(function(radio) {
        radio.addEventListener('change', function() { modeleIAEtape = radio.value; });
    });
    document.getElementById('planif-modele-ia-telecharger').addEventListener('click', function() {
        var sel = document.getElementById('planif-modele-ia-semaine');
        var doc = exporteur.genererModeleCarte({
            etape: modeleIAEtape,
            semaine: sel ? parseInt(sel.value, 10) : semaine,
            nbSemaines: nbSemaines
        });
        if (!doc) { afficherToastLien('Le modèle n’a pas pu être produit : aucune carte active.'); return; }
        telechargerFichier(doc, exporteur.nomFichierModele(), 'text/markdown');
        afficherToastLien('Modèle téléchargé : colle-le dans l’IA de ton choix.');
        panneau.classList.remove('ouvert');
    });
}

// === ÉDITEUR DE GABARITS — MODALE RÉGLAGES + APERÇU (#416 lot H) ===
//
// Cette modale était l'« Export personnalisé » de #431 (8 août). Elle édite
// maintenant des GABARITS nommés ; le réglage unique a migré en gabarit.
//
// La modale reste ASSUMÉE (décision du 8 août) : liste, colonnes et aperçu ne
// tiennent pas dans un panneau de 380 px — l'anti-pattern « pas de modale »
// vise les cas où un panneau suffit. Chaque changement est PERSISTÉ
// immédiatement dans le gabarit et l'aperçu re-rendu : le générateur est une
// fonction pure, le re-rendu est instantané.

// ⚠ Un gabarit ne rend que des tableaux : l'aperçu part en TSV, jamais en
// texte (décision du 12 août).
var exportPersoFormatApercu = 'tsv';

/**
 * Aperçu TSV mis en colonnes — AFFICHAGE SEULEMENT.
 *
 * Retour terrain du 15 août : « pourrais-tu espacer les colonnes de manière à
 * ce que leur contenu ne se chevauche pas avec celui des autres ? » Un TSV
 * sépare par UNE tabulation ; rendu dans un <pre>, les taquets tombent tous
 * les 8 caractères, donc une cellule un peu longue déborde sur le taquet
 * suivant et vient coller la colonne d'à côté. Ce n'est pas un défaut du
 * fichier, c'est un défaut de l'aperçu.
 *
 * ⚠⚠ NE JAMAIS APPLIQUER CECI AU DOCUMENT PRODUIT. Un TSV rembourré d'espaces
 * n'est plus un TSV : collé dans Numbers ou Excel, chaque cellule traînerait
 * son remplissage. Copier et Télécharger passent par `documentCourant()`,
 * c'est-à-dire par le générateur — cette fonction ne touche QUE le <pre>.
 * C'est la seule raison pour laquelle elle a le droit d'exister.
 *
 * Le calcul de largeur compte des UNITÉS DE CODE, pas des graphèmes : un
 * emoji ou un caractère accentué décomposé peut donc décaler d'une colonne.
 * Acceptable pour un aperçu en police à chasse fixe ; ça ne le serait pas
 * pour un document.
 */
function alignerApercuTSV(tsv) {
    var lignes = tsv.replace(/\n+$/, '').split('\n').map(function(l) { return l.split('\t'); });
    if (lignes.length === 0) return tsv;
    var nbColonnes = lignes.reduce(function(m, l) { return Math.max(m, l.length); }, 0);
    var largeurs = [];
    for (var c = 0; c < nbColonnes; c++) {
        largeurs[c] = lignes.reduce(function(m, l) {
            return Math.max(m, (l[c] || '').length);
        }, 0);
    }
    return lignes.map(function(l) {
        var rendu = [];
        for (var i = 0; i < nbColonnes; i++) {
            var cellule = l[i] || '';
            // La dernière colonne n'est pas rembourrée : sinon chaque ligne
            // traînerait des espaces jusqu'à la largeur de la plus longue, et
            // la barre de défilement horizontale irait toujours au maximum.
            rendu.push(i === nbColonnes - 1 ? cellule
                : cellule + Array(largeurs[i] - cellule.length + 1).join(' '));
        }
        return rendu.join('  ').replace(/\s+$/, '');
    }).join('\n');
}

function ouvrirModaleExportPerso() {
    var modale = document.getElementById('modalExportPersonnalise');
    var exporteur = window.planificationExport;
    if (!modale || !exporteur) return;
    remplirModaleExportPerso();
    modale.classList.add('actif');
    var contenu = modale.querySelector('.modal-contenu');
    if (contenu && contenu.focus) contenu.focus();
}

function fermerModaleExportPerso() {
    var modale = document.getElementById('modalExportPersonnalise');
    if (modale) modale.classList.remove('actif');
}

// ═══════════════════════════════════════════════════════════════════════════
// L'ÉDITEUR DE GABARITS (#416 lot H)
//
// Cette modale était l'« Export personnalisé » de #431 : cocher des contenus,
// ordonner des sections. Elle édite maintenant des GABARITS — un tableau, ses
// colonnes, leur ordre, leurs noms. Le réglage unique n'existe plus : il a
// migré en gabarit (voir `migrerPersonnaliseEnGabarit`).
//
// ⚠ Les gabarits GÉNÉRIQUES ne s'éditent pas sur place. Leurs contrôles sont
// désactivés, et « Dupliquer » est le geste qui ouvre la porte. Un utilisateur
// qui casserait « Plan de cours » n'aurait aucun moyen de le retrouver.
// ═══════════════════════════════════════════════════════════════════════════

var gabaritEnCours = 'calendrier';

function remplirModaleExportPerso() {
    var exporteur = window.planificationExport;

    var zoneListe = document.getElementById('export-perso-liste');
    var champNom = document.getElementById('export-perso-nom');
    var zoneGranularite = document.getElementById('export-perso-granularite');
    var zoneColonnes = document.getElementById('export-perso-colonnes');
    var zoneFormats = document.getElementById('export-perso-formats');
    var apercu = document.getElementById('export-perso-apercu');
    if (!zoneListe || !champNom || !zoneGranularite || !zoneColonnes || !zoneFormats || !apercu) return;

    // Un gabarit ne rend que des tableaux : le Texte n'est pas offert ici.
    if (exportPersoFormatApercu === 'texte') exportPersoFormatApercu = 'tsv';

    function gabaritCourant() {
        return exporteur.trouverGabarit(gabaritEnCours) || exporteur.listerGabarits()[0];
    }

    function rafraichirApercu() {
        // ⚠ textContent, jamais innerHTML : l'aperçu porte les TITRES saisis
        // par l'enseignant (règle sécurité — pas de HTML non échappé).
        var g = gabaritCourant();
        var doc = exporteur.genererDepuisGabarit(g.id, exportPersoFormatApercu,
            exportPlanGroupe ? { groupeCoursId: exportPlanGroupe } : undefined);
        if (!doc) { apercu.textContent = 'Aucune carte active.'; return; }
        apercu.textContent = exportPersoFormatApercu === 'tsv' ? alignerApercuTSV(doc) : doc;
    }

    /** Enregistre une modification — refusée d'office sur un gabarit générique. */
    function modifier(changements) {
        var g = gabaritCourant();
        if (g.generique) return;
        var enregistre = exporteur.enregistrerGabarit(Object.assign({}, g, changements));
        if (enregistre) gabaritEnCours = enregistre.id;
        rendreReglages();
        rafraichirApercu();
    }

    function rendreReglages() {
        var g = gabaritCourant();
        var tous = exporteur.listerGabarits();

        // --- La liste des gabarits ---------------------------------------
        var htmlListe = '';
        tous.forEach(function(x) {
            // ⚠ Le nom d'un gabarit est saisi par l'utilisateur.
            htmlListe += '<label class="planif-checkbox-label export-perso-gabarit-choix">' +
                '<input type="radio" name="export-perso-gabarit" value="' + echapperHtml(x.id) + '"' +
                (x.id === g.id ? ' checked' : '') + '> ' +
                echapperHtml(x.nom) +
                (x.generique ? ' <span class="export-perso-badge-generique">générique</span>' : '') +
                '</label>';
        });
        zoneListe.innerHTML = htmlListe;

        // --- Le nom -------------------------------------------------------
        champNom.value = g.nom;
        champNom.disabled = !!g.generique;

        // --- La granularité ----------------------------------------------
        var granularites = [
            { id: 'noeuds', label: 'Ligne par élément' },
            { id: 'seances', label: 'Ligne par séance' }
        ];
        var htmlGran = '';
        granularites.forEach(function(gr) {
            htmlGran += '<button type="button" class="planif-btn-carte export-perso-granularite' +
                (gr.id === g.granularite ? ' actif' : '') + '" data-granularite="' +
                echapperHtml(gr.id) + '"' + (g.generique ? ' disabled' : '') + '>' +
                echapperHtml(gr.label) + '</button>';
        });
        zoneGranularite.innerHTML = htmlGran;

        // --- Les colonnes : cochées et ordonnées d'abord, disponibles après
        //
        // ⚠ L'ordre des colonnes CHOISIES est une donnée du gabarit ; l'ordre
        // des colonnes disponibles est celui du catalogue. Les mélanger ferait
        // sauter une colonne de place quand on la coche.
        // ⚠ Une colonne qui ne peut RIEN porter dans la granularité choisie est
        // signalée sur place. Elle reste cochable — c'est le gabarit de
        // l'utilisateur, pas le mien — mais il voit pourquoi sa colonne sort
        // vide, au lieu de le découvrir dans Numbers (constat terrain, 12 août).
        var inutile = function(id) {
            return typeof exporteur.colonneUtileEn === 'function'
                && !exporteur.colonneUtileEn(id, g.granularite);
        };

        // Les deux familles sont ENVELOPPÉES, et pas seulement pour le style :
        // elles ne se disposent pas pareil. Les colonnes CHOISIES portent un
        // rang (donc une ligne par colonne, et des flèches), les DISPONIBLES
        // n'en ont pas — elles se rangent en blocs qui se serrent (« tétris »),
        // ce qui reprenait 320 px de haut à la modale (mesuré : 15 cases
        // empilées faisaient 480 px, soit 37 % de sa hauteur totale).
        var htmlCol = '<div class="export-perso-choisies">';
        g.colonnes.forEach(function(id, i) {
            var libelle = (g.renommages && g.renommages[id]) || '';
            htmlCol += '<div class="export-perso-colonne-ligne' +
                (inutile(id) ? ' export-perso-colonne-inerte' : '') +
                '" data-colonne="' + echapperHtml(id) + '">' +
                '<label class="planif-checkbox-label export-perso-colonne-case">' +
                '<input type="checkbox" data-decocher="' + echapperHtml(id) + '" checked' +
                (g.generique ? ' disabled' : '') + '> ' +
                echapperHtml(exporteur.libelleColonne(id, null)) +
                '</label>' +
                '<input type="text" class="export-perso-champ-renom" data-renom="' + echapperHtml(id) + '"' +
                ' value="' + echapperHtml(libelle) + '" placeholder="' +
                echapperHtml(exporteur.libelleColonne(id, null)) + '"' +
                ' aria-label="Nom de la colonne dans le tableau"' + (g.generique ? ' disabled' : '') + '>' +
                '<button type="button" class="planif-btn-carte export-perso-monter" data-i="' + i +
                '" aria-label="Monter"' + (g.generique || i === 0 ? ' disabled' : '') + '>↑</button>' +
                '<button type="button" class="planif-btn-carte export-perso-descendre" data-i="' + i +
                '" aria-label="Descendre"' + (g.generique || i === g.colonnes.length - 1 ? ' disabled' : '') +
                '>↓</button>' +
                '</div>' +
                (inutile(id)
                    ? '<div class="export-perso-note-inerte">Cette colonne agrège les éléments d’une séance : elle sortira vide tant que le gabarit est « Ligne par élément ».</div>'
                    : '');
        });

        htmlCol += '</div>';

        // ⚠ L'ordre reste celui du CATALOGUE, jamais l'alphabet (décision de
        // Grégoire, 15 août) : une case qui change de place entre deux rendus
        // se recherche à chaque fois. Position fixe = mémoire du geste.
        var disponibles = Object.keys(exporteur.CATALOGUE_COLONNES).filter(function(id) {
            return g.colonnes.indexOf(id) === -1;
        });
        if (disponibles.length > 0) {
            htmlCol += '<div class="export-perso-groupe export-perso-groupe-secondaire">À ajouter</div>' +
                '<div class="export-perso-tetris">';
            disponibles.forEach(function(id) {
                htmlCol += '<label class="planif-checkbox-label export-perso-colonne-case' +
                    (inutile(id) ? ' export-perso-colonne-inerte' : '') + '">' +
                    '<input type="checkbox" data-cocher="' + echapperHtml(id) + '"' +
                    (g.generique ? ' disabled' : '') + '> ' +
                    echapperHtml(exporteur.libelleColonne(id, null)) +
                    (inutile(id) ? ' <span class="export-perso-badge-generique">par séance</span>' : '') +
                    '</label>';
            });
            htmlCol += '</div>';
        }
        zoneColonnes.innerHTML = htmlCol;

        // --- Les formats d'aperçu (tableaux seulement) --------------------
        var htmlFormats = '';
        exporteur.FORMATS.filter(function(f) { return f.id !== 'texte'; }).forEach(function(f) {
            htmlFormats += '<button type="button" class="planif-btn-carte export-perso-format' +
                (f.id === exportPersoFormatApercu ? ' actif' : '') + '" data-format="' +
                echapperHtml(f.id) + '">' + echapperHtml(f.label) + '</button>';
        });
        zoneFormats.innerHTML = htmlFormats;

        var btnSupprimer = document.getElementById('export-perso-supprimer');
        if (btnSupprimer) btnSupprimer.disabled = !!g.generique;

        // Listeners posés APRÈS toutes les écritures innerHTML (contrainte
        // « Dans la leçon », Lot E) — chaque re-rendu les repose.
        zoneListe.querySelectorAll('input[name="export-perso-gabarit"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                gabaritEnCours = radio.value;
                rendreReglages();
                rafraichirApercu();
            });
        });
        zoneGranularite.querySelectorAll('.export-perso-granularite').forEach(function(btn) {
            btn.addEventListener('click', function() {
                modifier({ granularite: btn.dataset.granularite });
            });
        });
        zoneColonnes.querySelectorAll('input[data-decocher]').forEach(function(cb) {
            cb.addEventListener('change', function() {
                var restantes = gabaritCourant().colonnes.filter(function(c) {
                    return c !== cb.dataset.decocher;
                });
                // Un gabarit sans colonne ne serait plus un tableau : le
                // magasin l'écarterait à la relecture, et le gabarit
                // disparaîtrait sous les doigts de l'utilisateur.
                if (restantes.length === 0) {
                    afficherToastLien('Un gabarit garde au moins une colonne.');
                    rendreReglages();
                    return;
                }
                modifier({ colonnes: restantes });
            });
        });
        zoneColonnes.querySelectorAll('input[data-cocher]').forEach(function(cb) {
            cb.addEventListener('change', function() {
                modifier({ colonnes: gabaritCourant().colonnes.concat([cb.dataset.cocher]) });
            });
        });
        zoneColonnes.querySelectorAll('input[data-renom]').forEach(function(champ) {
            champ.addEventListener('change', function() {
                var g2 = gabaritCourant();
                var renommages = Object.assign({}, g2.renommages || {});
                var valeur = champ.value.trim();
                // Vider le champ REND son nom générique à la colonne : c'est le
                // seul geste d'annulation, il ne doit pas laisser de trace.
                if (valeur) renommages[champ.dataset.renom] = valeur;
                else delete renommages[champ.dataset.renom];
                modifier({ renommages: Object.keys(renommages).length ? renommages : null });
            });
        });
        zoneColonnes.querySelectorAll('.export-perso-monter, .export-perso-descendre').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var i = parseInt(btn.dataset.i, 10);
                var j = btn.classList.contains('export-perso-monter') ? i - 1 : i + 1;
                var colonnes = gabaritCourant().colonnes.slice();
                if (j < 0 || j >= colonnes.length) return;
                var tmp = colonnes[i];
                colonnes[i] = colonnes[j];
                colonnes[j] = tmp;
                modifier({ colonnes: colonnes });
            });
        });
        zoneFormats.querySelectorAll('.export-perso-format').forEach(function(btn) {
            btn.addEventListener('click', function() {
                exportPersoFormatApercu = btn.dataset.format;
                rendreReglages();
                rafraichirApercu();
            });
        });
    }

    champNom.onchange = function() {
        var nom = champNom.value.trim();
        if (!nom) { rendreReglages(); return; }
        modifier({ nom: nom });
    };

    rendreReglages();
    rafraichirApercu();

    var btnDupliquer = document.getElementById('export-perso-dupliquer');
    if (btnDupliquer) {
        btnDupliquer.onclick = function() {
            var copie = exporteur.dupliquerGabarit(gabaritCourant().id);
            if (!copie) return;
            gabaritEnCours = copie.id;
            rendreReglages();
            rafraichirApercu();
            afficherToastLien('Gabarit dupliqué — il est modifiable.');
        };
    }

    var btnSupprimer = document.getElementById('export-perso-supprimer');
    if (btnSupprimer) {
        btnSupprimer.onclick = function() {
            var g = gabaritCourant();
            if (g.generique) return;
            if (!exporteur.supprimerGabarit(g.id)) return;
            gabaritEnCours = exporteur.listerGabarits()[0].id;
            rendreReglages();
            rafraichirApercu();
            afficherToastLien('Gabarit supprimé.');
        };
    }

    function documentCourant() {
        return exporteur.genererDepuisGabarit(gabaritCourant().id, exportPersoFormatApercu,
            exportPlanGroupe ? { groupeCoursId: exportPlanGroupe } : undefined);
    }

    var btnCopier = document.getElementById('export-perso-copier');
    var btnTelecharger = document.getElementById('export-perso-telecharger');
    if (btnCopier) {
        btnCopier.onclick = function() {
            var doc = documentCourant();
            if (!doc) return;
            function fini() { afficherToastLien('Plan copié — colle-le où tu veux.'); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(doc).then(fini).catch(function() {
                    copierExportFallback(doc); fini();
                });
            } else {
                copierExportFallback(doc); fini();
            }
        };
    }
    if (btnTelecharger) {
        btnTelecharger.onclick = function() {
            var doc = documentCourant();
            if (!doc) return;
            var format = exporteur.FORMATS.find(function(f) { return f.id === exportPersoFormatApercu; });
            telechargerFichier(doc, exporteur.nomFichierExport(gabaritCourant().id, exportPersoFormatApercu), format.mime);
        };
    }
}

// Repli presse-papiers (Safari file:// sans clipboard API).
function copierExportFallback(texte) {
    var ta = document.createElement('textarea');
    ta.value = texte;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
}

// === REPRISE D'UN TRIMESTRE À L'AUTRE (lot 2, 7 août 2026) ===
//
// Ferme #368 : chaque rentrée, retrouver la carte du 601-101 de la session
// précédente était un geste manuel. Le `coursId` du lot 1 permet de la
// DÉSIGNER — l'offre apparaît dans l'ÉTAT VIDE du planificateur, c'est-à-dire
// exactement quand elle sert : carte neuve, rien à afficher, et une carte du
// même cours qui dort dans un autre trimestre.
//
// Elle ne s'importe JAMAIS toute seule. Une carte recopiée d'office serait
// indiscernable d'une carte voulue — même principe que la migration d'ancrage
// du 6 août, qui a refusé de deviner les semaines.

/** Le cours « en jeu » : celui de la carte active, à défaut le cours actif. */
function coursEnJeuPourReprise() {
    var index = window.planificationDonnees.getIndex();
    var carteId = index && index.active;
    var cid = carteId ? window.planificationDonnees.obtenirCoursDeCarte(carteId) : null;
    if (cid) return cid;
    try {
        return (typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null) || null;
    } catch (e) {
        return null;
    }
}

function reprisesDisponibles() {
    try {
        return window.planificationDonnees.listerReprisesPourCours(coursEnJeuPourReprise()) || [];
    } catch (e) {
        console.warn('[Planification] Recherche de reprise échouée :', e);
        return [];
    }
}

/**
 * Ajoute l'offre de reprise à l'état vide, s'il y a lieu.
 *
 * Construite en DOM plutôt qu'en chaîne HTML : le nom de la carte et celui du
 * trimestre sont des données saisies par l'enseignant, et `textContent` les
 * empêche d'être ANALYSÉS comme du balisage — ce qui est plus fort
 * qu'`echapperHtml()`, qui les laisse traverser le parseur après nettoyage.
 * Bénéfice joint : l'audit statique `audit-innerhtml.sh` ne voit plus ici de
 * concaténation à inspecter (le lint a signalé le premier jet, en chaînes).
 */
function ajouterOffreDeReprise(hote) {
    if (!hote) return;
    var reprises = reprisesDisponibles();
    if (!reprises.length) return;

    var zone = document.createElement('div');
    zone.className = 'planif-som-vide-action';

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'planif-btn-carte';

    // UN seul candidat : on le nomme, le geste est direct.
    // PLUSIEURS : on ouvre le choix plutôt que d'en élire un — l'ordre des
    // trimestres n'est pas chronologique (cf. listerReprisesPourCours), donc
    // « le plus récent » serait une devinette.
    if (reprises.length === 1) {
        var r = reprises[0];
        bouton.textContent = 'Reprendre « ' + r.carte.nom + ' » (' + r.trimestreNom + ')';
        bouton.addEventListener('click', function() {
            reprendreCarte(r.trimestreId, r.carte.id);
        });
    } else {
        bouton.textContent = 'Reprendre une carte de ce cours (' + reprises.length + ')…';
        bouton.addEventListener('click', function(e) {
            e.stopPropagation();
            var panneau = document.getElementById('planif-import-tri-panel');
            if (!panneau) return;
            rendrePanneauImportTrimestre();
            panneau.classList.add('ouvert');
        });
    }

    zone.appendChild(bouton);
    hote.appendChild(zone);
}

function reprendreCarte(trimestreId, carteId) {
    var nouvelId = window.planificationDonnees.importerCarteDepuisTrimestre(trimestreId, carteId);
    if (!nouvelId) {
        afficherToastLien("La reprise a échoué — rien n'a été modifié.");
        return;
    }
    mettreAJourListeCartes();
    chargerCarte(nouvelId);
    afficherToastLien('Carte reprise — copie indépendante, celle du trimestre d\'origine reste intacte.');
}

// === NETTOYAGE DES REPÈRES DE SEMAINE — panneau (7 août 2026) ===
//
// Le panneau PROPOSE : chaque ligne montre l'avant et l'après, et rien ne part
// sans un clic. Les catégories qu'on ne sait pas trancher (conflit, titre qui
// deviendrait vide) sont affichées SANS bouton — les cacher laisserait croire
// que le ménage est complet.
function rendrePanneauNettoyageTitres() {
    var panneau = document.getElementById('planif-nettoyage-titres-panel');
    if (!panneau) return;
    var inv = inventaireReperesTitres();
    var total = inv.pret.length + inv.ancrable.length + inv.conflit.length + inv.vide.length;

    if (total === 0) {
        panneau.innerHTML = '<div class="planif-import-tri-vide">Aucun repère de semaine dans les titres de cette carte.</div>';
        return;
    }

    var html = '';

    function ligne(a, action, libelleBouton) {
        return '<div class="planif-import-tri-ligne">' +
            '<span class="planif-import-tri-nom" title="' + echapperHtml(a.titre) + '">' +
                echapperHtml(a.titre) + ' → ' + echapperHtml(a.titreNettoye || '(vide)') +
            '</span>' +
            (action
                ? '<button type="button" class="planif-btn-carte planif-nettoyage-btn"' +
                  ' data-noeud="' + echapperHtml(a.id) + '" data-ancrer="' + (action === 'ancrer' ? '1' : '0') + '">' +
                  libelleBouton + '</button>'
                : '<span class="planif-import-tri-nb">' + libelleBouton + '</span>') +
            '</div>';
    }

    if (inv.pret.length) {
        html += '<div class="planif-import-tri-groupe">Repère redondant — la semaine est déjà posée</div>';
        inv.pret.forEach(function(a) { html += ligne(a, 'retirer', 'Retirer'); });
    }
    if (inv.ancrable.length) {
        html += '<div class="planif-import-tri-groupe">Non planifié — ancrer à la semaine du titre, puis retirer</div>';
        inv.ancrable.forEach(function(a) { html += ligne(a, 'ancrer', 'Ancrer S' + a.semaineTitre); });
    }
    if (inv.conflit.length) {
        html += '<div class="planif-import-tri-groupe">⚠ Le titre contredit la semaine posée — à trancher par toi</div>';
        inv.conflit.forEach(function(a) {
            html += ligne(a, null, 'titre S' + a.semaineTitre + ' / posée S' + a.semaineAncree);
        });
    }
    if (inv.vide.length) {
        html += '<div class="planif-import-tri-groupe">Le titre ne dirait plus rien — à réécrire à la main</div>';
        inv.vide.forEach(function(a) { html += ligne(a, null, 'titre vide'); });
    }

    var aSeance = [].concat(inv.pret, inv.ancrable, inv.conflit, inv.vide)
        .filter(function(a) { return a.aRepereSeance; }).length;
    if (aSeance) {
        html += '<div class="planif-import-tri-vide">' + aSeance + ' titre' + (aSeance > 1 ? 's portent' : ' porte') +
                ' aussi un repère de séance. Il n\'est PAS retiré : la séance n\'a pas encore sa place dans le modèle.</div>';
    }

    panneau.innerHTML = html;
    panneau.querySelectorAll('.planif-nettoyage-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            enregistrerPourUndo();
            var ok = retirerRepereTitre(btn.dataset.noeud, btn.dataset.ancrer === '1');
            if (!ok) { afficherToastLien('Ce titre n\'a pas pu être nettoyé — rien n\'a changé.'); return; }
            reconstruireDOM();
            mettreAJourPlanificateur();
            rendrePanneauNettoyageTitres(); // la liste rétrécit sous les yeux
        });
    });
}

// === COURS RATTACHÉ À LA CARTE — panneau (lot 1, 7 août 2026) ===
//
// Le rattachement se CHOISIT, il ne se devine pas. Même règle que la migration
// d'ancrage temporel du 6 août : on ne déduit rien du titre de la carte, parce
// qu'un rattachement faux serait indiscernable d'un vrai. Les cartes déjà
// existantes restent donc sans cours jusqu'à ce que l'enseignant en désigne un.
function rendrePanneauCoursCarte() {
    var panneau = document.getElementById('planif-cours-carte-panel');
    if (!panneau) return;
    var index = window.planificationDonnees.getIndex();
    var carteId = index && index.active;
    if (!carteId) {
        panneau.innerHTML = '<div class="planif-import-tri-vide">Aucune carte active.</div>';
        return;
    }

    var liste = [];
    try { liste = db.getSync('cours', []) || []; } catch (e) { liste = []; }
    if (!Array.isArray(liste)) liste = [];

    var actuel = window.planificationDonnees.obtenirCoursDeCarte(carteId);
    var orphelin = window.planificationDonnees.rattachementOrphelin(carteId);

    var html = '<div class="planif-import-tri-groupe">Cours de cette carte</div>';

    // Un rattachement orphelin se DIT — sinon le panneau afficherait « Aucun »
    // et l'enseignant croirait n'avoir jamais rien rattaché.
    if (orphelin) {
        html += '<div class="planif-import-tri-vide">Le cours rattaché n\'existe plus dans ce codex. ' +
                'La carte reste utilisable — choisis-en un autre, ou détache-la.</div>';
    }

    if (!liste.length) {
        html += '<div class="planif-import-tri-vide">Aucun cours dans ce codex. ' +
                'Crée-le dans Réglages, puis reviens ici.</div>';
    }

    for (var i = 0; i < liste.length; i++) {
        var c = liste[i];
        if (!c || !c.id) continue;
        var libelle = c.code ? (c.code + (c.nom ? ' — ' + c.nom : '')) : (c.nom || c.id);
        var estActuel = !orphelin && c.id === actuel;
        html += '<div class="planif-import-tri-ligne">' +
                '<span class="planif-import-tri-nom" title="' + echapperHtml(libelle) + '">' + echapperHtml(libelle) + '</span>' +
                (estActuel
                    ? '<span class="planif-import-tri-nb">rattachée</span>'
                    : '<button type="button" class="planif-btn-carte planif-cours-carte-btn" data-cours="' + echapperHtml(c.id) + '">Rattacher</button>') +
                '</div>';
    }

    if (actuel) {
        html += '<div class="planif-import-tri-ligne">' +
                '<span class="planif-import-tri-nom">Aucun cours</span>' +
                '<button type="button" class="planif-btn-carte planif-cours-carte-btn" data-cours="">Détacher</button>' +
                '</div>';
    }

    panneau.innerHTML = html;
    panneau.querySelectorAll('.planif-cours-carte-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            window.planificationDonnees.definirCoursDeCarte(carteId, btn.dataset.cours || null);
            panneau.classList.remove('ouvert');
            mettreAJourListeCartes();
            afficherToastLien(btn.dataset.cours
                ? 'Carte rattachée — elle suivra ce cours d\'un trimestre à l\'autre.'
                : 'Carte détachée de son cours.');
        });
    });
}

/**
 * Clic sur une leçon du planificateur : la carte se CADRE dessus (7 août 2026).
 *
 * Ce clic ouvrait auparavant une « vue leçon » de niveau micro qui remplaçait
 * le canevas par une lecture. Cette vue affichait STRICTEMENT MOINS que la
 * carte — le même objectif et les mêmes activités, mais sans les liens, sans
 * le sélecteur de semaine, et sans possibilité d'écrire. Elle est retirée : le
 * planificateur navigue, il ne redouble pas le canevas.
 */
function naviguerSommaireLecon(leconId) {
    if (!etat.noeuds.has(leconId)) return;
    naviguerVers(leconId);
    mettreAJourPlanificateur(); // rafraîchit le surlignage « actif » de la grille
}

/**
 * Clic sur une séquence du planificateur : la carte se cadre sur son ÉTENDUE.
 *
 * Pour une séquence, `naviguerVers` viserait le seul bloc conteneur ; c'est
 * l'ensemble « séquence + descendants » qu'on veut à l'écran, d'où le cadrage
 * sur la boîte englobante. La sélection, elle, suit le même geste que pour une
 * leçon : ce qu'on désigne dans le planificateur devient ce qu'édite
 * l'Inspecteur.
 */
function cadrerSurSequence(seqId) {
    if (!etat.noeuds.has(seqId)) return;
    deselectionnerTout();
    selectionnerNoeud(seqId);
    centrerVueSurSequence(seqId);
    mettreAJourPlanificateur();
}

// Recentrer la vue (menu « Vue » + touche R, qui remplace ⌘1 depuis le lot 1 du 8 oct. 2026). Le canevas n'a plus qu'un seul
// état d'affichage depuis le retrait du filtrage par séquence : recentrer, c'est
// donc toujours cadrer sur TOUT le contenu.
function recentrerVue() {
    centrerVueSurContenu();
}

/**
 * Encadrement réel de la carte, en coordonnées d'espace (OFFSET compris).
 *
 * ⚠ À ne pas confondre avec ce que faisait `centrerVueSurContenu` : celle-ci
 * moyennait les x/y des nœuds. Sur une carte déséquilibrée — une bande dense
 * de leçons en bas, quelques séquences isolées en haut à droite, exactement la
 * forme de la carte 601-101 — la moyenne est TIRÉE vers la masse, et le
 * « centre » obtenu n'est pas le centre de ce qu'on voit. La largeur des blocs
 * était ignorée aussi : le bord droit tombait toujours court.
 * @returns {{minX:number,minY:number,maxX:number,maxY:number}|null}
 */
function encadrementContenu() {
    if (etat.noeuds.size === 0) return null;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        var el = document.getElementById(nd.id);
        var w = el ? (el.offsetWidth || 140) : 140;
        var h = el ? (el.offsetHeight || 50) : 50;
        if (nd.x < minX) minX = nd.x;
        if (nd.y < minY) minY = nd.y;
        if (nd.x + w > maxX) maxX = nd.x + w;
        if (nd.y + h > maxY) maxY = nd.y + h;
    }
    if (minX === Infinity) return null;
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
}

/**
 * TOUT VOIR — ajuste le zoom pour que la carte ENTIÈRE tienne à l'écran, puis
 * centre dessus. Proposition de Grégoire (11 août 2026) : couplé à la loupe,
 * ça devient un outil de navigation — on prend du recul, on repère la zone, on
 * lit à la loupe, on clique pour y aller.
 *
 * ⚠ Ce n'est PAS ce que faisait « Recentrer » (alors ⌘1, R depuis le 8 oct. 2026), qui ne touchait jamais au
 * zoom : il défilait, à l'échelle courante. À 100 % sur une grande carte, il
 * déposait l'utilisateur au milieu du nuage sans rien lui montrer de plus.
 * Les deux commandes coexistent — recentrer sans changer d'échelle reste utile.
 */
function ajusterVueSurTout() {
    if (!zoneTravail) return;
    var box = encadrementContenu();
    if (!box) {
        etat.zoom = 1;
        appliquerZoom();
        majAffichageZoom();
        centrerVueSurContenu();
        return;
    }

    // ⚠ Zone non encore dimensionnée (section masquée, appel avant la mise en
    // page) : `clientWidth` vaut 0, et le calcul ci-dessous donnerait 0 — donc
    // le PLANCHER de zoom, en silence. L'utilisateur cliquerait « Tout voir »
    // et sa carte partirait à 10 % sans raison visible. Trouvé au navigateur
    // le 11 août, pas au raisonnement.
    if (zoneTravail.clientWidth === 0 || zoneTravail.clientHeight === 0) return;

    var MARGE = 48;
    var largeur = Math.max(1, box.maxX - box.minX);
    var hauteur = Math.max(1, box.maxY - box.minY);
    var dispoW = Math.max(1, zoneTravail.clientWidth - MARGE * 2);
    var dispoH = Math.max(1, zoneTravail.clientHeight - MARGE * 2);

    // Jamais AU-DELÀ de 100 % : une petite carte ne doit pas se retrouver
    // grossie au point qu'on ne sache plus où on est.
    etat.zoom = Math.max(ZOOM_MIN, Math.min(1, Math.min(dispoW / largeur, dispoH / hauteur)));
    appliquerZoom();
    majAffichageZoom();

    var cx = ((box.minX + box.maxX) / 2 + OFFSET_X) * etat.zoom;
    var cy = ((box.minY + box.maxY) / 2 + OFFSET_Y) * etat.zoom;
    zoneTravail.scrollLeft = cx - zoneTravail.clientWidth / 2;
    zoneTravail.scrollTop = cy - zoneTravail.clientHeight / 2;
}

/* =====================================================================
   LOUPE DE NAVIGATION (11 août 2026, demande de Grégoire)

   Le besoin, dans ses mots : « la vue complète de la carte de mon cours est
   à 25 %, c'est évidemment illisible à ce zoom ». Prendre du recul et lire
   sont deux exigences contradictoires — la loupe les réconcilie sans
   toucher au zoom de la carte.

   ▣ CE QUE C'EST, ET CE QUE CE N'EST PAS. C'est une VUE, pas une seconde
   carte vivante : on y lit, on n'y écrit pas. La copie est prise UNE fois
   à l'activation, puis on ne fait que la faire glisser — c'est ce qui
   permet de suivre le doigt sans ramer sur une carte de 150 blocs. Écrire
   dedans supposerait une seconde instance réellement vivante (ids propres,
   écritures qui retombent au bon endroit) : un chantier, pas un ajout.

   ⮕ D'où le clic qui ATTERRIT (arbitrage de Grégoire) : on lit dans la
   loupe, on clique, la carte s'y rend à l'échelle qu'on venait de lire, et
   la loupe s'éteint. On écrit ensuite normalement, clavier libre. Couplée
   au bouton « Tout voir », la loupe devient un moyen de sauter d'un bout
   à l'autre de la carte.

   ⚠ IPAD — deux différences, pas une. (1) Pas de clavier : le bouton de
   la barre est le chemin principal, la touche L n'est qu'un raccourci.
   (2) Pas de SURVOL : le doigt n'existe qu'au contact. La loupe suit donc
   le pointeur en survol à la souris, ET le doigt pendant qu'il glisse. Un
   doigt levé ne peut pas « cliquer dans la loupe » de façon fiable : la
   loupe porte donc un bouton « Aller ici » explicite, ≥44 px, qui sert
   aux deux. Même leçon que #148 et #444 : ce qui n'existe qu'au survol
   n'existe pas au doigt.
   ===================================================================== */

/**
 * Fabrique (ou refait) la copie de la carte affichée dans la loupe.
 *
 * ⚠ LES ids SONT RETIRÉS de la copie. Tout le module travaille par
 * `document.getElementById(id)` : deux éléments portant le même id feraient
 * répondre le mauvais, et les symptômes seraient tordus — un bloc qui ne se
 * sélectionne plus, un lien qui se redessine ailleurs. On ne laisse pas ce
 * piège traîner pour une vue en lecture seule.
 * Les `id` des `<defs>` SVG (marqueurs de flèche) sont conservés : ils sont
 * cités par `url(#…)` et l'original, plus haut dans le document, gagne.
 */
function _construireCopieLoupe() {
    if (!espace || !_loupeContenu) return;
    _loupeContenu.innerHTML = '';

    var copie = espace.cloneNode(true);
    copie.removeAttribute('id');
    var couche = copie.querySelector('#planif-couche-noeuds');
    if (couche) {
        var avecId = couche.querySelectorAll('[id]');
        for (var i = 0; i < avecId.length; i++) avecId[i].removeAttribute('id');
        // ⚠ La position de la couche vient d'une règle CSS keyée sur l'ID
        // (`#planif-couche-noeuds { transform: translate(5000px, 3000px) }`).
        // Retirer l'id la ferait donc SAUTER, et la loupe montrerait une zone
        // décalée de tout l'offset — mesuré au navigateur : 4999 px / 2996 px
        // hors cible, soit exactement OFFSET_X / OFFSET_Y. On fige la valeur
        // calculée en ligne AVANT de retirer l'id.
        var calc = window.getComputedStyle(coucheNoeuds || couche);
        couche.style.position = 'absolute';
        couche.style.top = '0';
        couche.style.left = '0';
        couche.style.width = '100%';
        couche.style.height = '100%';
        couche.style.transform = (calc && calc.transform && calc.transform !== 'none')
            ? calc.transform
            : 'translate(' + OFFSET_X + 'px, ' + OFFSET_Y + 'px)';
        couche.removeAttribute('id');
    }
    // La copie se montre à SON échelle, indépendamment du zoom de la carte.
    copie.style.transform = 'scale(' + LOUPE_ZOOM + ')';
    copie.style.transformOrigin = '0 0';
    copie.style.position = 'absolute';
    copie.style.left = '0';
    copie.style.top = '0';
    _loupeContenu.appendChild(copie);
    _loupeCopieValide = true;
}

/** Point d'ESPACE (OFFSET compris) sous un point d'écran. */
function _espaceDepuisEcran(clientX, clientY) {
    var r = zoneTravail.getBoundingClientRect();
    return {
        x: (clientX - r.left + zoneTravail.scrollLeft) / etat.zoom,
        y: (clientY - r.top + zoneTravail.scrollTop) / etat.zoom
    };
}

/** Place le cadre près du pointeur et cadre la copie sur le point visé. */
function _deplacerLoupe(clientX, clientY) {
    if (!_loupeEl || !zoneTravail) return;
    if (!_loupeCopieValide) _construireCopieLoupe();

    var p = _espaceDepuisEcran(clientX, clientY);
    _loupeDernierPoint = p;

    // Le cadre suit le pointeur mais reste entièrement à l'écran.
    var gauche = Math.min(Math.max(8, clientX - LOUPE_L / 2), window.innerWidth - LOUPE_L - 8);
    var haut = Math.min(Math.max(8, clientY - LOUPE_H - 24), window.innerHeight - LOUPE_H - 8);
    _loupeEl.style.left = gauche + 'px';
    _loupeEl.style.top = haut + 'px';

    // La copie glisse pour amener le point visé au centre du cadre.
    _loupeContenu.style.left = (-p.x * LOUPE_ZOOM + LOUPE_L / 2) + 'px';
    _loupeContenu.style.top = (-p.y * LOUPE_ZOOM + LOUPE_H / 2) + 'px';
}

/** Atterrir : la carte se rend au point lu, à l'échelle de la loupe. */
function atterrirDepuisLoupe() {
    var p = _loupeDernierPoint;
    desactiverLoupe();
    if (!p || !zoneTravail) return;
    etat.zoom = LOUPE_ZOOM;
    appliquerZoom();
    majAffichageZoom();
    zoneTravail.scrollLeft = p.x * etat.zoom - zoneTravail.clientWidth / 2;
    zoneTravail.scrollTop = p.y * etat.zoom - zoneTravail.clientHeight / 2;
}

function activerLoupe() {
    if (etat.loupeActive || !zoneTravail) return;
    etat.loupeActive = true;
    _loupeCopieValide = false;

    if (!_loupeEl) {
        _loupeEl = document.createElement('div');
        _loupeEl.id = 'planif-loupe';
        _loupeEl.setAttribute('aria-hidden', 'true');
        _loupeContenu = document.createElement('div');
        _loupeContenu.className = 'planif-loupe-contenu';
        _loupeEl.appendChild(_loupeContenu);

        var aller = document.createElement('button');
        aller.type = 'button';
        aller.className = 'planif-loupe-aller';
        aller.textContent = 'Aller ici';
        // Pas de gestionnaire propre : `_surClicLoupe` (document, capture) le
        // couvre puisqu'il est DANS le cadre. Deux chemins pour un même geste,
        // c'est une divergence en attente.
        _loupeEl.appendChild(aller);

        document.body.appendChild(_loupeEl);
    }

    _loupeEl.classList.add('planif-loupe-visible');
    zoneTravail.classList.add('planif-loupe-mode');
    majBarreAlignement();   // la barre s'efface : la loupe passe devant
    // ⚠ EN CAPTURE, SUR LE DOCUMENT — et non sur la zone de travail.
    // Trouvé au navigateur le 11 août : la grille du Planificateur
    // (`planif-grille-nonplanifie`) et les palettes flottantes RECOUVRENT le
    // canevas. Un écouteur posé sur `#planif-zone-travail` ne voyait pas le
    // pointeur sous ces zones-là — la loupe restait vide, exactement là où la
    // carte est la plus dense. Le symptôme n'aurait pas été « ça plante »,
    // mais « ça marche parfois », le pire à diagnostiquer.
    document.addEventListener('pointermove', _surPointeurLoupe, true);
    document.addEventListener('pointerdown', _surPointeurLoupe, true);
    // ⚠⚠ LE CLIC S'ÉCOUTE SUR LE CANEVAS, PAS SEULEMENT SUR LE CADRE.
    // Défaut rapporté par Grégoire le 11 août, capture à l'appui : « quand je
    // clique, il ne se passe rien ». Le premier jet n'attachait l'atterrissage
    // qu'au cadre de la loupe — or le cadre se place AU-DESSUS du pointeur, et
    // le geste naturel est de cliquer sur le bloc qu'on vise, dans la carte.
    // On regardait au bon endroit et on cliquait au bon endroit ; c'est le
    // code qui écoutait ailleurs.
    document.addEventListener('click', _surClicLoupe, true);
    majBoutonLoupe();
}

/**
 * Atterrir au clic — que le clic tombe dans la carte ou dans le cadre.
 * Hors des deux (barre d'outils, palettes), on laisse le clic vivre sa vie :
 * sinon le bouton qui ÉTEINT la loupe deviendrait inatteignable.
 */
function _surClicLoupe(e) {
    if (!etat.loupeActive || !zoneTravail) return;
    var dansCadre = _loupeEl && e.target && _loupeEl.contains(e.target);
    var r = zoneTravail.getBoundingClientRect();
    var dansCarte = e.clientX >= r.left && e.clientX <= r.right
                 && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!dansCadre && !dansCarte) return;
    e.preventDefault();
    e.stopPropagation();
    atterrirDepuisLoupe();
}

function desactiverLoupe() {
    if (!etat.loupeActive) return;
    etat.loupeActive = false;
    if (_loupeEl) _loupeEl.classList.remove('planif-loupe-visible');
    if (zoneTravail) zoneTravail.classList.remove('planif-loupe-mode');
    majBarreAlignement();
    document.removeEventListener('pointermove', _surPointeurLoupe, true);
    document.removeEventListener('pointerdown', _surPointeurLoupe, true);
    document.removeEventListener('click', _surClicLoupe, true);
    majBoutonLoupe();
}

function _surPointeurLoupe(e) {
    if (!etat.loupeActive || !zoneTravail) return;

    // Le cadre lui-même et son bouton « Aller ici » ne pilotent pas la loupe :
    // sinon, quand le cadre est ramené dans l'écran près d'un bord, il se
    // poursuivrait tout seul.
    if (_loupeEl && e.target && _loupeEl.contains(e.target)) return;

    // Hors de la zone de carte (barre d'outils, sélecteur, palettes hors
    // canevas) : on garde le mode loupe mais on n'affiche rien — montrer une
    // portion de carte qui ne correspond à rien serait pire que rien.
    var r = zoneTravail.getBoundingClientRect();
    var dedans = e.clientX >= r.left && e.clientX <= r.right
              && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!dedans) {
        if (_loupeEl) _loupeEl.classList.remove('planif-loupe-visible');
        return;
    }
    if (_loupeEl) _loupeEl.classList.add('planif-loupe-visible');

    // En mode loupe le canevas ne déplace ni ses blocs ni sa vue : le geste
    // appartient entièrement à la loupe. Sans ça, sur iPad, glisser le doigt
    // traînerait un bloc sous la loupe sans qu'on le voie.
    e.preventDefault();
    e.stopPropagation();
    _deplacerLoupe(e.clientX, e.clientY);
}

function basculerLoupe() {
    if (etat.loupeActive) desactiverLoupe(); else activerLoupe();
}

/** Le bouton dit s'il est enfoncé — sur iPad c'est le SEUL indicateur. */
function majBoutonLoupe() {
    var btn = document.getElementById('planif-btn-loupe');
    if (!btn) return;
    btn.setAttribute('aria-pressed', etat.loupeActive ? 'true' : 'false');
    btn.title = etat.loupeActive ? 'Quitter la loupe (L ou Échap)' : 'Loupe — lire sans changer le zoom (L)';
}

/** Les deux afficheurs de zoom + les boutons de préréglage, en un seul appel.
    Le pourcentage était réécrit ici ET dans `mettreAJourBoutonsZoomPreset()` :
    une seule des deux copies le fait désormais. */
function majAffichageZoom() {
    mettreAJourBoutonsZoomPreset();
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

/* =====================================================================
   RECHERCHE DANS LA CARTE (15 août 2026, demande de Grégoire)

   Le besoin, dans ses mots : « un champ de recherche dans la toolbar de la
   carte d'alignement afin de trouver des mots clés dans la carte ».

   ▣ CE QU'ELLE CHERCHE. Le titre du bloc, sa description (Inspecteur), les
   objectifs 🎯 des leçons, ET le libellé du type (« Leçon », « Exposé »,
   « Compétence »…). Le type est un choix explicite de Grégoire : il permet
   « montre-moi toutes les évaluations ». Il est bruyant par nature — un mot
   comme « leçon » allume alors des dizaines de blocs d'un coup — d'où la
   colonne « où » de chaque résultat : une correspondance de TYPE se lit
   comme telle et ne se confond pas avec une correspondance de contenu.

   ▣ CE QU'ELLE FAIT DU RÉSULTAT. Deux choses ensemble, et c'est le couple
   qui est utile : les blocs trouvés s'allument SUR le canevas (halo), et la
   liste sous le champ dit lesquels. À 25 % de zoom — la vue complète de sa
   carte 601-101 — les halos seuls ne se lisent pas ; la liste seule ne dit
   pas OÙ c'est. Même logique que « Tout voir » + la loupe du 11 août : on
   prend du recul, on repère, on atterrit.

   ⚠ ACCENTS ET CASSE. `normaliserRecherche` replie les deux, sinon
   « littérature » resterait introuvable en tapant « litterature ». Elle
   normalise CARACTÈRE PAR CARACTÈRE et non d'un bloc : un `normalize('NFD')`
   global change la LONGUEUR de la chaîne (é → e + accent combinant), et les
   index trouvés dans le texte normalisé ne désigneraient plus les mêmes
   lettres dans le texte d'origine — l'extrait affiché serait décalé d'autant
   de lettres accentuées que le texte en compte avant la trouvaille. En
   français, ce n'est pas un cas limite.
   ===================================================================== */

// Deux lettres au minimum. À une seule, et avec les libellés de type dans le
// corpus, la quasi-totalité de la carte s'allume : le résultat n'apprend
// rien et le surlignage devient du bruit. Le seuil est DIT à l'écran, jamais
// subi en silence.
var RECHERCHE_MIN = 2;

var etatRecherche = {
    terme: '',
    resultats: [],
    courant: -1   // -1 = aucun résultat visité ; sinon index dans `resultats`
};

// Normaliser coûte un passage par caractère, et la frappe le redemande à
// chaque lettre. Le cache porte sur les textes de la CARTE (titres,
// descriptions, objectifs), qui ne changent qu'à la reconstruction du DOM —
// c'est là qu'il est vidé.
var _cacheNormalisation = new Map();

/**
 * Replie casse et accents, ET garde la trace d'où vient chaque caractère.
 *
 * ⚠⚠ POURQUOI UNE TABLE D'INDEX ET NON UNE SIMPLE CHAÎNE. On cherche dans le
 * texte replié, mais on AFFICHE un extrait découpé dans le texte d'origine :
 * il faut donc savoir, pour chaque lettre repliée, d'où elle vient. Un
 * `normalize('NFD')` global ne le permet pas, parce qu'il ne conserve aucune
 * correspondance — et l'extrait sortirait décalé.
 *
 * ⚠ ET SURTOUT, LE CAS QUI COMMANDE CE CHOIX : un accent peut arriver DÉJÀ
 * SÉPARÉ de sa lettre (« e » + U+0301 au lieu de « é »). C'est la forme
 * décomposée que produit macOS — celle de Grégoire — et elle voyage par
 * copier-coller depuis le Finder, un PDF ou une note. Ces marques se replient
 * en RIEN : une lettre d'origine peut donc donner zéro ou plusieurs
 * caractères repliés, et aucune égalité de longueur ne tient. La table dit la
 * vérité dans tous les cas.
 *
 * @returns {{norme: string, index: number[]}} `index[k]` = position, dans le
 *          texte d'origine, du k-ième caractère de `norme`. La table porte un
 *          élément de plus (la longueur du texte), pour qu'une trouvaille qui
 *          finit en bout de chaîne ait toujours une borne de fin.
 */
function indexerPourRecherche(texte) {
    var s = String(texte === null || texte === undefined ? '' : texte);
    var norme = '';
    var index = [];
    for (var i = 0; i < s.length; i++) {
        var plie = s[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (var j = 0; j < plie.length; j++) {
            norme += plie[j];
            index.push(i);
        }
    }
    index.push(s.length);
    return { norme: norme, index: index };
}

/** Le texte replié seul — ce qu'il faut pour le TERME saisi. */
function normaliserRecherche(texte) {
    return indexerPourRecherche(texte).norme;
}

/** Même chose, mémoïsé — réservé aux textes de la carte, pas au terme saisi. */
function indexerTexteCarte(texte) {
    var brut = String(texte === null || texte === undefined ? '' : texte);
    var cache = _cacheNormalisation.get(brut);
    if (cache !== undefined) return cache;
    var indexe = indexerPourRecherche(brut);
    _cacheNormalisation.set(brut, indexe);
    return indexe;
}

/**
 * Les textes d'un nœud où la recherche a le droit de mordre, chacun étiqueté
 * par ce qu'il EST. C'est cette étiquette que le résultat affiche : savoir
 * que le mot a été trouvé dans une description et non dans un titre change
 * ce qu'on va faire du résultat.
 */
function champsCherchables(n) {
    var champs = [];
    if (n.titre) champs.push({ ou: 'titre', libelle: 'titre', texte: n.titre });
    if (n.description) champs.push({ ou: 'description', libelle: 'description', texte: n.description });
    var objs = objectifsDeLecon(n);
    for (var i = 0; i < objs.length; i++) {
        if (objs[i].texte) champs.push({ ou: 'objectif', libelle: 'objectif', texte: objs[i].texte });
    }
    // Le libellé du type vient EN DERNIER : quand un bloc correspond à la
    // fois par son contenu et par son type, c'est le contenu qui fournit
    // l'extrait affiché. Le type est le repli, pas la vedette.
    var label = obtenirLabelNoeud(n);
    if (label) champs.push({ ou: 'type', libelle: 'type de bloc', texte: label });
    return champs;
}

/**
 * Cherche `terme` dans toute la carte.
 * @returns {Array} résultats triés dans l'ordre de LECTURE de la carte
 *          (de haut en bas, puis de gauche à droite) — pas dans l'ordre de
 *          création, qui ne veut rien dire à l'œil. C'est cet ordre que
 *          suit « Entrée = résultat suivant ».
 */
function chercherDansCarte(terme) {
    var q = normaliserRecherche(String(terme || '').trim());
    if (q.length < RECHERCHE_MIN) return [];

    var trouves = [];
    for (var entry of etat.noeuds) {
        var n = entry[1];
        var champs = champsCherchables(n);
        var ou = [];
        var extrait = null;
        for (var i = 0; i < champs.length; i++) {
            var indexe = indexerTexteCarte(champs[i].texte);
            var pos = indexe.norme.indexOf(q);
            if (pos === -1) continue;
            if (ou.indexOf(champs[i].ou) === -1) ou.push(champs[i].ou);
            // L'extrait est resolu ICI, en morceaux prets a afficher : le
            // rendu n'a plus qu'a les echapper. Il ne peut donc pas se
            // tromper d'espace d'index, ce qui etait le seul moyen de le
            // decaler.
            if (!extrait) extrait = extraitAutour(champs[i], indexe, pos, q.length);
        }
        if (ou.length === 0) continue;
        trouves.push({
            id: n.id,
            type: n.type,
            titre: n.titre || '',
            label: obtenirLabelNoeud(n),
            couleur: obtenirCouleurNoeud(n),
            ou: ou,
            extrait: extrait,
            x: n.x,
            y: n.y
        });
    }
    trouves.sort(function(a, b) {
        if (a.y !== b.y) return a.y - b.y;
        if (a.x !== b.x) return a.x - b.x;
        return 0;
    });
    return trouves;
}

/**
 * Fenêtre de texte autour de la trouvaille, découpée dans le texte D'ORIGINE.
 *
 * `posNorme` et `longueurNorme` sont exprimés dans l'espace du texte REPLIÉ :
 * la table d'index les ramène aux positions réelles. C'est ce passage-là qui
 * fait que « société » s'affiche avec son accent, et que la fenêtre ne glisse
 * pas d'une lettre par accent rencontré avant elle.
 */
function extraitAutour(champ, indexe, posNorme, longueurNorme) {
    var texte = champ.texte;
    var debutMotif = indexe.index[posNorme];
    var finMotif = indexe.index[posNorme + longueurNorme];
    if (debutMotif === undefined) debutMotif = 0;
    if (finMotif === undefined) finMotif = texte.length;

    var AVANT = 26, APRES = 44;
    var debut = Math.max(0, debutMotif - AVANT);
    var fin = Math.min(texte.length, finMotif + APRES);
    return {
        libelle: champ.libelle,
        avant: (debut > 0 ? '…' : '') + texte.slice(debut, debutMotif),
        motif: texte.slice(debutMotif, finMotif),
        apres: texte.slice(finMotif, fin) + (fin < texte.length ? '…' : '')
    };
}

/**
 * Recalcule les résultats et remet l'affichage d'aplomb.
 *
 * Appelée à la frappe ET à la fin de `reconstruireDOM` : la carte peut
 * changer sous une recherche ouverte (annulation, import, changement de
 * carte). Recalculer plutôt que re-poser les anciens halos, sinon un bloc
 * supprimé resterait « trouvé » dans la liste.
 */
function rafraichirRecherche() {
    var champ = document.getElementById('planif-recherche-champ');
    if (!champ) return;   // module pas encore monté (chargement, bac à sable)

    etatRecherche.terme = champ.value || '';
    var ancienId = (etatRecherche.courant >= 0 && etatRecherche.resultats[etatRecherche.courant])
        ? etatRecherche.resultats[etatRecherche.courant].id
        : null;
    etatRecherche.resultats = chercherDansCarte(etatRecherche.terme);

    // Garder le résultat courant s'il survit au recalcul : sans ça, une
    // reconstruction du DOM (chaque déplacement de bloc en déclenche une)
    // renverrait l'utilisateur au début de sa liste.
    etatRecherche.courant = -1;
    if (ancienId) {
        for (var i = 0; i < etatRecherche.resultats.length; i++) {
            if (etatRecherche.resultats[i].id === ancienId) { etatRecherche.courant = i; break; }
        }
    }

    rendreResultatsRecherche();
    appliquerSurlignageRecherche();
}

/** Pose les halos sur le canevas — et périme la copie de la loupe. */
function appliquerSurlignageRecherche() {
    if (!coucheNoeuds) return;
    var anciens = coucheNoeuds.querySelectorAll('.planif-noeud--trouve, .planif-noeud--trouve-actif');
    for (var i = 0; i < anciens.length; i++) {
        anciens[i].classList.remove('planif-noeud--trouve');
        anciens[i].classList.remove('planif-noeud--trouve-actif');
    }
    for (var j = 0; j < etatRecherche.resultats.length; j++) {
        var el = document.getElementById(etatRecherche.resultats[j].id);
        if (!el) continue;
        el.classList.add('planif-noeud--trouve');
        if (j === etatRecherche.courant) el.classList.add('planif-noeud--trouve-actif');
    }
    // La loupe montre une COPIE de la carte, prise une fois. Sans cette
    // ligne elle afficherait la carte d'AVANT la recherche : les halos y
    // seraient absents alors que c'est justement là qu'on veut les lire.
    _loupeCopieValide = false;
}

/** Ce que la liste dit quand elle n'a pas de résultats à donner. */
function messageRecherche() {
    var terme = (etatRecherche.terme || '').trim();
    if (terme.length === 0) return null;
    if (terme.length < RECHERCHE_MIN) {
        return 'Encore une lettre — la recherche démarre à ' + RECHERCHE_MIN + ' caractères.';
    }
    return 'Aucun bloc ne contient « ' + terme + ' ».';
}

function rendreResultatsRecherche() {
    var panneau = document.getElementById('planif-recherche-resultats');
    var compteur = document.getElementById('planif-recherche-compteur');
    var effacer = document.getElementById('planif-recherche-effacer');
    if (!panneau) return;

    var aDuTexte = (etatRecherche.terme || '').trim().length > 0;
    if (effacer) effacer.hidden = !aDuTexte;

    var n = etatRecherche.resultats.length;
    if (compteur) {
        if (!aDuTexte || n === 0) compteur.textContent = '';
        else if (etatRecherche.courant >= 0) compteur.textContent = (etatRecherche.courant + 1) + '/' + n;
        else compteur.textContent = String(n);
    }

    if (!aDuTexte) {
        panneau.innerHTML = '';
        panneau.hidden = true;
        return;
    }

    if (n === 0) {
        panneau.innerHTML = '<p class="planif-recherche-vide">' + echapperHtml(messageRecherche()) + '</p>';
        panneau.hidden = false;
        return;
    }

    var html = '<p class="planif-recherche-entete">' + n + ' bloc' + (n > 1 ? 's' : '') +
               ' trouvé' + (n > 1 ? 's' : '') + '</p>';
    for (var i = 0; i < n; i++) {
        var r = etatRecherche.resultats[i];
        var titre = r.titre.trim() !== '' ? r.titre : '(bloc sans titre)';

        // Une correspondance qui ne tient QU'au libellé du type n'a pas
        // d'extrait à montrer : le libellé est déjà affiché à côté du titre,
        // le répéter en dessous ferait croire à une seconde trouvaille.
        var seulementType = (r.ou.length === 1 && r.ou[0] === 'type');
        var lignes = '';
        if (!seulementType && r.extrait) {
            var ex = r.extrait;
            lignes = '<span class="planif-recherche-extrait">' +
                     '<span class="planif-recherche-ou">' + echapperHtml(ex.libelle) + '</span>' +
                     echapperHtml(ex.avant) +
                     '<mark>' + echapperHtml(ex.motif) + '</mark>' +
                     echapperHtml(ex.apres) +
                     '</span>';
        } else if (seulementType) {
            lignes = '<span class="planif-recherche-extrait">' +
                     '<span class="planif-recherche-ou">type de bloc</span>' +
                     '</span>';
        }

        html += '<button type="button" class="planif-recherche-item' +
                (i === etatRecherche.courant ? ' planif-recherche-item--actif' : '') +
                '" data-index="' + i + '" data-id="' + echapperHtml(r.id) + '">' +
                    '<span class="planif-recherche-item-titre">' +
                        '<span class="planif-pastille" style="background:' + echapperHtml(r.couleur) + '"></span>' +
                        echapperHtml(titre) +
                        '<span class="planif-recherche-type">' + echapperHtml(r.label) + '</span>' +
                    '</span>' +
                    lignes +
                '</button>';
    }
    panneau.innerHTML = html;
    panneau.hidden = false;
}

/** Amène le résultat `index` à l'écran, le sélectionne, et suit dans la liste. */
function allerAuResultat(index) {
    var n = etatRecherche.resultats.length;
    if (n === 0) return;
    // Bouclage aux deux bouts : « suivant » depuis le dernier revient au
    // premier, et l'inverse. Sur une carte, l'ordre est circulaire par nature.
    etatRecherche.courant = ((index % n) + n) % n;
    var r = etatRecherche.resultats[etatRecherche.courant];
    naviguerVers(r.id);
    rendreResultatsRecherche();
    appliquerSurlignageRecherche();
    var actif = document.querySelector('.planif-recherche-item--actif');
    if (actif && actif.scrollIntoView) actif.scrollIntoView({ block: 'nearest' });
}

function resultatSuivant() { allerAuResultat(etatRecherche.courant + 1); }
function resultatPrecedent() {
    allerAuResultat(etatRecherche.courant < 0 ? -1 : etatRecherche.courant - 1);
}

/** Vide le champ, les halos et la liste. Le geste d'Échap et du bouton ✕. */
function effacerRecherche(garderFocus) {
    var champ = document.getElementById('planif-recherche-champ');
    if (champ) champ.value = '';
    etatRecherche.terme = '';
    etatRecherche.resultats = [];
    etatRecherche.courant = -1;
    rendreResultatsRecherche();
    appliquerSurlignageRecherche();
    if (garderFocus && champ) champ.focus();
}

function fermerListeRecherche() {
    var panneau = document.getElementById('planif-recherche-resultats');
    if (panneau) panneau.hidden = true;
}

/** Écouteurs du champ de recherche. Appelée une fois, depuis `initialiser`. */
function brancherRecherche() {
    var champ = document.getElementById('planif-recherche-champ');
    var panneau = document.getElementById('planif-recherche-resultats');
    var effacer = document.getElementById('planif-recherche-effacer');
    var zone = document.getElementById('planif-recherche-zone');
    if (!champ || !panneau || !zone) return;

    champ.addEventListener('input', function() {
        etatRecherche.courant = -1;
        rafraichirRecherche();
    });

    champ.addEventListener('keydown', function(e) {
        // Le champ est un INPUT : la garde `pasDansChamp` de `gererKeydown`
        // met déjà les raccourcis de la carte (L, ⌘D, Suppr…) hors jeu. On
        // arrête quand même la propagation des touches qu'on consomme, pour
        // qu'Échap ne ferme pas AUSSI la loupe ou un panneau derrière.
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (e.shiftKey) resultatPrecedent(); else resultatSuivant();
            return;
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); resultatSuivant(); return; }
        if (e.key === 'ArrowUp')   { e.preventDefault(); e.stopPropagation(); resultatPrecedent(); return; }
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            // Premier Échap : on ferme la liste mais on GARDE les halos —
            // ils servent à lire la carte, et on veut pouvoir y revenir.
            // Second Échap (liste déjà fermée) : on efface tout.
            if (!panneau.hidden) fermerListeRecherche();
            else effacerRecherche(true);
        }
    });

    champ.addEventListener('focus', function() {
        if ((etatRecherche.terme || '').trim().length > 0) rendreResultatsRecherche();
    });

    if (effacer) {
        effacer.addEventListener('click', function(e) {
            e.stopPropagation();
            effacerRecherche(true);
        });
    }

    // Délégation : la liste est reconstruite à chaque frappe, un écouteur par
    // bouton se réattacherait autant de fois.
    panneau.addEventListener('click', function(e) {
        var item = e.target.closest ? e.target.closest('.planif-recherche-item') : null;
        if (!item) return;
        e.stopPropagation();
        allerAuResultat(parseInt(item.getAttribute('data-index'), 10) || 0);
    });

    // Cliquer ailleurs referme la liste — mais laisse les halos allumés :
    // c'est le point de la fonction, on va cliquer DANS la carte ensuite.
    document.addEventListener('click', function(e) {
        if (zone.contains(e.target)) return;
        fermerListeRecherche();
    });
    zone.addEventListener('click', function(e) { e.stopPropagation(); });
}

// =========== FIN NAVIGATION ===========

window.planificationCarte = {
    initialiser: initialiser,
    activer: function() { planificationActive = true; },
    desactiver: function() { planificationActive = false; },
    centrerVueSurContenu: centrerVueSurContenu,
    // 7 sept. 2026 — exposées pour la sentinelle du pincement : le geste ne se
    // joue pas au banc (WebKit absent des conteneurs), son arithmétique si.
    decalageApercuZoom: decalageApercuZoom,
    defilementApresZoom: defilementApresZoom,
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
    optionsProductionsHTML: optionsProductionsHTML,                             // 25 août 2026 — exposée pour la sentinelle #492
    positionCarteDeLaProduction: positionCarteDeLaProduction,                   // 25 août 2026 — l'autre sens du pont (#493)
    leconsSitueesDuCours: leconsSitueesDuCours,                                 // #942 — la leçon manquée d'une absence (profil)
    afficherDetailsProduction: afficherDetailsProduction,
    naviguerVers: naviguerVers,
    CLE_SEANCES: CLE_SEANCES,
    cleNoteLecon: cleNoteLecon,
    SEPARATEUR_NOTE: SEPARATEUR_NOTE,
    migrerObjectifsVersMetadata: migrerObjectifsVersMetadata,
    objectifDeLecon: objectifDeLecon,
    objectifsDeLecon: objectifsDeLecon,
    appliquerObjectifs: appliquerObjectifs,
    objectifDeLeconParId: objectifDeLeconParId,
    objectifsDeLeconParId: objectifsDeLeconParId,
    definirObjectifsLecon: definirObjectifsLecon,
    // #403 — liens objectif → activité / évaluation
    TYPES_SERVANTS_OBJECTIF: TYPES_SERVANTS_OBJECTIF,
    leconParenteDe: leconParenteDe,
    objectifsServisPar: objectifsServisPar,
    // #964 — l'évaluation vérifie des objectifs, sa leçon ou une leçon avant.
    objectifsVerifiesPar: objectifsVerifiesPar,
    indexObjectifsCarte: indexObjectifsCarte,
    leconEstAvant: leconEstAvant,
    leconsProposeesAEvaluation: leconsProposeesAEvaluation,
    leconsInspecteurEvaluation: leconsInspecteurEvaluation,
    evaluerBadge: evaluerBadge,
    // #965 — la pastille d'une évaluation (lecture seule).
    evaluerPastilleEvaluation: evaluerPastilleEvaluation,
    // #966 — les pages du guide (lecture seule), pour la sentinelle des textes validés.
    GUIDE_PAGES: GUIDE_PAGES,
    SYMBOLES_PASTILLE_EVALUATION: SYMBOLES_PASTILLE_EVALUATION,
    LEGENDE_PASTILLES_EVALUATION: LEGENDE_PASTILLES_EVALUATION,
    afficherMenuLien: afficherMenuLien,
    definirObjectifsServis: definirObjectifsServis,
    evaluerObjectif: evaluerObjectif,
    // #445 — exposées pour la sentinelle, et pour la même raison que les
    // voisines : ce que fait un DÉPÔT se vérifie en le lui donnant, jamais en
    // relisant sa source. Un refus dit et un refus muet s'écrivent presque
    // pareil ; seule l'exécution les distingue. La légende suit : elle est la
    // source unique de trois surfaces, sa dérive ne se verrait pas au grep.
    deposerLienSurObjectif: deposerLienSurObjectif,
    legendePastillesObjectifHTML: legendePastillesObjectifHTML,
    LEGENDE_PASTILLES_OBJECTIF: LEGENDE_PASTILLES_OBJECTIF,
    SYMBOLES_PASTILLE_OBJECTIF: SYMBOLES_PASTILLE_OBJECTIF,
    // Ancrage temporel : la leçon écrit, tout le reste dérive (D3)
    migrerAncrageTemporelVersLecon: migrerAncrageTemporelVersLecon,
    semaineDeLecon: semaineDeLecon,
    etendueTemporelle: etendueTemporelle,
    etendueTemporelleParId: etendueTemporelleParId,
    formaterEtendue: formaterEtendue,
    rangTemporel: rangTemporel,
    definirSemaineLecon: definirSemaineLecon,
    // Exposés pour la sentinelle : ce que fait une bascule de phase se vérifie
    // en la DEMANDANT au module, jamais en relisant sa table de types.
    PHASES_EE: PHASES_EE,
    estPhaseEE: estPhaseEE,
    FAMILLES_PERMUTABLES: FAMILLES_PERMUTABLES,
    famillePermutableDe: famillePermutableDe,
    definirTypeNoeud: definirTypeNoeud,
    viseeChoisie: viseeChoisie,
    viseeEvaluation: viseeEvaluation,
    definirViseeEvaluation: definirViseeEvaluation,
    verbeEstSuggere: verbeEstSuggere,
    enTeteIdentiteHTML: enTeteIdentiteHTML,
    // Séquences de séquences (voie A) : lecture hiérarchique partagée
    listerSequencesHierarchie: listerSequencesHierarchie,
    cheminSequence: cheminSequence,
    compterLeconsDescendantes: compterLeconsDescendantes,
    peutContenir: peutContenir,
    // Exposés pour la sentinelle du graphe (8 août) : les invariants de LIEN et
    // de DURÉE se vérifient en exerçant le module, jamais en lisant sa source.
    // Exposée pour la sentinelle de coercition : l'invariant de sécurité se
    // vérifie en RENDANT le contrôle avec une valeur empoisonnée, pas en
    // relisant la source.
    dureeControleHTML: dureeControleHTML,
    compteurDureeHTML: compteurDureeHTML,
    // Exposée pour la sentinelle du rendu unique (#437) : la seule preuve
    // qui vaille est de RENDRE un nœud et d'y chercher ses contrôles. Vérifier
    // que les trois appelants « ont l'air d'appeler la même chose » relit la
    // source — c'est exactement ce qui n'a rien vu pendant quatre ajouts.
    contenuNoeudHTML: contenuNoeudHTML,
    objectifsLeconHTML: objectifsLeconHTML,
    // Exposée pour la sentinelle du collage (#437) : ce que fait un
    // gestionnaire de `paste` se vérifie en lui ENVOYANT un presse-papiers.
    collerEnTexteBrut: collerEnTexteBrut,
    rafraichirRollupsAncetres: rafraichirRollupsAncetres,
    TYPES_AVEC_DUREE: TYPES_AVEC_DUREE,
    resoudreVerbe: resoudreVerbe,
    dureeRollupNoeud: dureeRollupNoeud,
    // ⚠ Exposée pour UNE raison précise (8 août) : l'ordre « brut d'abord,
    // famille en secours » n'est pas observable sur la table actuelle, où
    // chaque paire brute porte le même verbe que son équivalent de famille.
    // La sentinelle y injecte donc un verbe distinctif le temps d'un test.
    // Le break-test l'a exigé : sans ça, inverser l'ordre passait inaperçu.
    VERBES_AUTO: VERBES_AUTO,
    TYPES_ACTIVITE: TYPES_ACTIVITE,
    RETROACTIONS: RETROACTIONS,
    // Exposée pour la sentinelle du panneau d'export (#424 Lot D) : le rendu
    // se vérifie en RENDANT le panneau, pas en relisant la source.
    rendrePanneauExportPlan: rendrePanneauExportPlan,
    rendrePanneauModeleIA: rendrePanneauModeleIA,
    // Exposées pour la sentinelle de la corbeille (#433) : le dépôt se
    // vérifie en l'EXERÇANT sur une géométrie connue, pas en lisant la source.
    pointSurCorbeille: pointSurCorbeille,
    deposerDansCorbeille: deposerDansCorbeille,
    // Exposées pour la sentinelle de la modale personnalisée (#431).
    remplirModaleExportPerso: remplirModaleExportPerso,
    ouvrirModaleExportPerso: ouvrirModaleExportPerso,
    // Exposée pour la sentinelle : ce que produit une mise en colonnes se
    // vérifie en la LUI FAISANT FAIRE, pas en relisant sa source.
    alignerApercuTSV: alignerApercuTSV,
    // Exposées pour la sentinelle de la rétroaction formative (#424 Lot E) :
    // les deux libellés se vérifient en RENDANT le sélecteur, l'écriture en
    // EXERÇANT la porte unique.
    selecteurRetroactionHTML: selecteurRetroactionHTML,
    appliquerRetroactionNoeud: appliquerRetroactionNoeud,
    normaliserType: normaliserType,
    trouverConteneurParRecouvrement: trouverConteneurParRecouvrement,
    recentrerVue: recentrerVue,
    injecterNoeuds: injecterNoeuds,
    nouvelleCarte: nouvelleCarte,
    ouvrirGuide: ouvrirGuide,
    // Planificateur (palette de navigation)
    cadrerSurSequence: cadrerSurSequence,
    naviguerSommaireLecon: naviguerSommaireLecon,
    mettreAJourPlanificateur: mettreAJourPlanificateur,
    basculerDetailLecon: basculerDetailLecon,
    // Lot 3 : déplacement dans la grille + annulation
    deposerDansGrille: deposerDansGrille,
    formaterDatesTrimestre: formaterDatesTrimestre,
    ouvrirCadreTrimestre: ouvrirCadreTrimestre,
    // Affichage des palettes flottantes (barre d'outils)
    PALETTES_FLOTTANTES: PALETTES_FLOTTANTES,
    paletteVisible: paletteVisible,
    basculerPalette: basculerPalette,
    appliquerAffichagePalettes: appliquerAffichagePalettes,
    analyserRepereTitre: analyserRepereTitre,
    inventaireReperesTitres: inventaireReperesTitres,
    retirerRepereTitre: retirerRepereTitre,
    selecteurSemaineHTML: selecteurSemaineHTML,
    peuplerSelecteurSemaine: peuplerSelecteurSemaine,
    RANG_SEANCE_MAX: RANG_SEANCE_MAX,
    lettreRangSeance: lettreRangSeance,
    rangSeanceDeLecon: rangSeanceDeLecon,
    estHorsClasseNoeud: estHorsClasseNoeud,
    definirHorsClasse: definirHorsClasse,
    TYPES_HORS_CLASSE: TYPES_HORS_CLASSE,
    TYPES_AVEC_NIVEAU_COGNITIF: TYPES_AVEC_NIVEAU_COGNITIF,
    // #963 — lectures du modèle « relire ma carte par une IA » (lecture seule).
    NIVEAUX_COGNITIFS: NIVEAUX_COGNITIFS,
    trouverClones: trouverClones,
    // R1 (28 sept.) — reconstruit l'index inverse des clones (idempotent) ; sert aux bancs.
    reconstruireIndexClones: _reconstruireCloneIndex,
    deriverRangeesGrille: deriverRangeesGrille,
    definirRangSeance: definirRangSeance,
    selecteurRangSeanceHTML: selecteurRangSeanceHTML,
    peuplerSelecteurRangSeance: peuplerSelecteurRangSeance,
    dupliquerConteneurEnProfondeur: dupliquerConteneurEnProfondeur,
    dupliquerSelection: dupliquerSelection,
    ajusterVueSurTout: ajusterVueSurTout,
    alignerSelection: alignerSelection,
    majBarreAlignement: majBarreAlignement,
    preparerAimantation: preparerAimantation,
    appliquerAimantation: appliquerAimantation,
    bornesNoeud: bornesNoeud,
    bornesEnsemble: bornesEnsemble,
    encadrementContenu: encadrementContenu,
    basculerLoupe: basculerLoupe,
    // Recherche dans la carte (15 août 2026). `chercherDansCarte` est le
    // moteur pur — pas de DOM, donc éprouvable en bac à sable ; les trois
    // autres sont exposées pour que la sentinelle observe l'état réel plutôt
    // que de le reconstituer.
    // Routage des liens (15 août 2026). `calculerTraceLien` est le point
    // d'entrée : il rend le chemin SVG, les extrémités, le point du libellé
    // et le NOMBRE de blocs encore traversés — c'est ce compte que la
    // sentinelle observe, plutôt que la forme du chemin.
    calculerTraceLien: calculerTraceLien,
    definirContournement: definirContournement,
    // Exposée pour la sentinelle : le défaut du STOCKAGE (aucune préférence
    // enregistrée → contourner) ne se voit qu'en appelant cette fonction. Sans
    // elle, un test qui lit la variable du module croit couvrir le défaut et
    // ne couvre rien — c'est le break-test du 15 août qui l'a dit.
    chargerPrefContournement: chargerPrefContournement,
    contournementActif: contournementActif,
    obstaclesPourLien: obstaclesPourLien,
    resoudreVerbe: resoudreVerbe,
    TYPES_REACTIVATION: TYPES_REACTIVATION,
    chercherDansCarte: chercherDansCarte,
    normaliserRecherche: normaliserRecherche,
    champsCherchables: champsCherchables,
    etatRecherche: etatRecherche,
    activerLoupe: activerLoupe,
    desactiverLoupe: desactiverLoupe,
    atterrirDepuisLoupe: atterrirDepuisLoupe,
    dupliquerNoeud: dupliquerNoeud,
    detacherDeLaFamille: detacherDeLaFamille,
    ouvrirPanneau: ouvrirPanneau, // sentinelle Décloner (3 sept. 2026) : l'Inspecteur s'ouvre en bac à sable
    deplacerSequenceVersSemaine: deplacerSequenceVersSemaine,
    annuler: annuler,
    retablir: retablir,
    // Plein écran
    togglePleinEcran: togglePleinEcranCarte
};

// === MENU « VUE » (lot 1 du chantier de la carte, 8 oct. 2026) ===
//
// Décisions de Grégoire : « Vue plein écran », « Recentrer la carte » et
// « Tout voir » en mots, la couleur du fond sous « Fond du canevas » (même
// modèle que le menu « Annoter » d'« Annoter et évaluer »), puis les
// raccourcis clavier en bas. Remplace trois icônes, la palette de fond et la
// palette flottante des raccourcis.
//
// ▣ RACCOURCIS_CARTE est la SOURCE UNIQUE de la liste affichée : le banc
// `planif-menu-vue.spec.js` exige un essai par `id`, et un essai qui
// manquerait pour une ligne ajoutée le fait échouer. Une ligne n'entre ici que
// si son geste est branché ET marche dans Chrome et Safari (demande de
// Grégoire : « chaque raccourci décrit doit fonctionner »).
//
// ⚠ ⌘1 n'y est plus : Chrome et Safari le réservent au passage au premier
// onglet. Recentrer passe à R, sans modificateur, comme L pour la loupe.
var RACCOURCIS_CARTE = [
    { id: 'recentrer',          mac: 'R',                    autre: 'R',                     libelle: 'Recentrer la carte' },
    { id: 'loupe',              mac: 'L',                    autre: 'L',                     libelle: 'Loupe : lire sans changer le zoom' },
    { id: 'zoom-avant-arriere', mac: '⌘+ / ⌘−',              autre: 'Ctrl++ / Ctrl+−',       libelle: 'Zoom avant / arrière' },
    { id: 'zoom-100',           mac: '⌘0',                   autre: 'Ctrl+0',                libelle: 'Zoom à 100 %, carte recentrée' },
    { id: 'zoom-molette',       mac: 'Pincer ou Ctrl+molette', autre: 'Ctrl+molette',        libelle: 'Zoom à la souris ou au trackpad' },
    { id: 'tout-selectionner',  mac: '⌘A',                   autre: 'Ctrl+A',                libelle: 'Tout sélectionner' },
    { id: 'multi-selection',    mac: '⌘+clic',               autre: 'Ctrl+clic',             libelle: 'Ajouter un bloc à la sélection, ou l’en retirer' },
    { id: 'selection-zone',     mac: 'Glisser sur le fond',  autre: 'Glisser sur le fond',   libelle: 'Sélectionner une zone (souris)' },
    { id: 'glisser',            mac: 'Glisser',              autre: 'Glisser',               libelle: 'Déplacer un bloc ; par le cadre d’une leçon ou d’une séquence, tout le groupe suit' },
    { id: 'dupliquer',          mac: '⌘D',                   autre: 'Ctrl+D',                libelle: 'Dupliquer la sélection (copie indépendante)' },
    { id: 'dupliquer-clone',    mac: '⇧⌘D',                  autre: 'Maj+Ctrl+D',            libelle: 'Dupliquer la sélection (clone lié)' },
    { id: 'alt-glisser',        mac: '⌥+glisser',            autre: 'Alt+glisser',           libelle: 'Dupliquer en déplaçant (copie indépendante)' },
    { id: 'alt-glisser-clone',  mac: '⇧⌥+glisser',           autre: 'Maj+Alt+glisser',       libelle: 'Dupliquer en déplaçant (clone lié)' },
    { id: 'supprimer',          mac: 'Suppr ou ⌫',           autre: 'Suppr ou Retour arrière', libelle: 'Supprimer la sélection' },
    { id: 'annuler',            mac: '⌘Z',                   autre: 'Ctrl+Z',                libelle: 'Annuler' },
    { id: 'retablir',           mac: '⇧⌘Z',                  autre: 'Maj+Ctrl+Z',            libelle: 'Rétablir' },
    { id: 'recherche-entree',   mac: 'Entrée / ⇧Entrée',     autre: 'Entrée / Maj+Entrée',   libelle: 'Recherche : résultat suivant / précédent' },
    { id: 'recherche-fleches',  mac: '↓ / ↑',                autre: '↓ / ↑',                 libelle: 'Recherche : résultat suivant / précédent' },
    { id: 'recherche-echap',    mac: 'Échap',                autre: 'Échap',                 libelle: 'Recherche : refermer la liste ; une seconde fois, tout effacer' },
    { id: 'echap',              mac: 'Échap',                autre: 'Échap',                 libelle: 'Fermer la loupe ou quitter le plein écran ; sinon, tout désélectionner' }
];

// Exposée ici et non dans l'objet `window.planificationCarte` plus haut : à ce
// moment-là, la `var` ci-dessus vaut encore `undefined`.
window.planificationCarte.RACCOURCIS_CARTE = RACCOURCIS_CARTE;

/** Le Mac et l'iPad affichent ⌘ ⌥ ⇧ ; Windows et les autres, Ctrl, Alt, Maj. */
function claviersMac() {
    var plateforme = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    return /Mac|iPhone|iPad|iPod/i.test(plateforme);
}

function toucheAffichee(raccourci) {
    return claviersMac() ? raccourci.mac : raccourci.autre;
}

/** Rend la liste des raccourcis en bas du menu « Vue » (createElement : aucun innerHTML). */
function rendreRaccourcisMenuVue() {
    var table = document.getElementById('planif-vue-raccourcis');
    if (!table) return;
    while (table.firstChild) table.removeChild(table.firstChild);
    RACCOURCIS_CARTE.forEach(function(r) {
        var tr = document.createElement('tr');
        tr.dataset.raccourci = r.id;
        var tdTouche = document.createElement('td');
        var kbd = document.createElement('kbd');
        kbd.textContent = toucheAffichee(r);
        tdTouche.appendChild(kbd);
        var tdLibelle = document.createElement('td');
        tdLibelle.textContent = r.libelle;
        tr.appendChild(tdTouche);
        tr.appendChild(tdLibelle);
        table.appendChild(tr);
    });
}

function menuVueOuvert() {
    var dd = document.getElementById('planif-vue-dropdown');
    return !!(dd && dd.classList.contains('ouvert'));
}

function ouvrirMenuVue(focusPremier) {
    var dd = document.getElementById('planif-vue-dropdown');
    var btn = document.getElementById('planif-btn-vue');
    if (!dd || !btn) return;
    var actions = document.getElementById('planif-actions-dropdown');
    if (actions) actions.classList.remove('ouvert');
    dd.classList.add('ouvert');
    btn.setAttribute('aria-expanded', 'true');
    if (focusPremier) {
        var premier = dd.querySelector('button');
        if (premier) premier.focus();
    }
}

function fermerMenuVue(rendreFocus) {
    var dd = document.getElementById('planif-vue-dropdown');
    var btn = document.getElementById('planif-btn-vue');
    if (!dd || !btn) return;
    dd.classList.remove('ouvert');
    btn.setAttribute('aria-expanded', 'false');
    if (rendreFocus) btn.focus();
}

/** Flèches ↑ / ↓ : passer d'une commande à l'autre, pastilles comprises. */
function deplacerFocusMenuVue(sens) {
    var dd = document.getElementById('planif-vue-dropdown');
    if (!dd) return;
    var boutons = Array.prototype.slice.call(dd.querySelectorAll('button'));
    if (boutons.length === 0) return;
    var i = boutons.indexOf(document.activeElement);
    var suivant = i === -1 ? (sens > 0 ? 0 : boutons.length - 1)
                           : (i + sens + boutons.length) % boutons.length;
    boutons[suivant].focus();
}

function initialiserMenuVue() {
    var menu = document.getElementById('planif-vue-menu');
    var btn = document.getElementById('planif-btn-vue');
    var dd = document.getElementById('planif-vue-dropdown');
    if (!menu || !btn || !dd) return;

    rendreRaccourcisMenuVue();

    // Le bouton « Annuler » disait « Ctrl+Z » sur un Mac (mesure du lot 0).
    var btnAnnuler = document.getElementById('planif-btn-annuler');
    if (btnAnnuler) btnAnnuler.title = 'Annuler (' + (claviersMac() ? '⌘Z' : 'Ctrl+Z') + ')';

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // `detail === 0` : clic produit par le clavier (Entrée, Espace) — on
        // entre alors dans le menu, comme le ferait un menu natif.
        if (menuVueOuvert()) fermerMenuVue(false);
        else ouvrirMenuVue(e.detail === 0);
    });

    // Une commande ou une pastille referme le menu ; un clic dans la liste
    // des raccourcis, qui se LIT, ne le referme pas.
    // ⚠ AUCUN stopPropagation ici : les trois commandes passent par le
    // répartiteur `data-action`, délégué au document (main.js). L'arrêter
    // rendait les commandes muettes — vu au banc le 8 oct.
    dd.addEventListener('click', function(e) {
        if (e.target.closest('button')) fermerMenuVue(false);
    });
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target)) fermerMenuVue(false);
    });

    // ⚠ stopPropagation sur Échap : sans lui, `gererKeydown` (document)
    // désélectionnerait aussi, et l'écouteur du plein écran le quitterait.
    menu.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuVueOuvert()) {
            e.preventDefault();
            e.stopPropagation();
            fermerMenuVue(true);
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!menuVueOuvert()) ouvrirMenuVue(false);
            deplacerFocusMenuVue(e.key === 'ArrowDown' ? 1 : -1);
        }
    });
    menu.addEventListener('focusout', function(e) {
        if (e.relatedTarget && !menu.contains(e.relatedTarget)) fermerMenuVue(false);
    });
}

// Câblé au CHARGEMENT, comme la couleur de fond ci-dessous, et non dans
// `initialiser()` : les trois commandes passent par `data-action` et marchaient
// avant que la carte soit initialisée — le menu qui les porte doit en faire
// autant (le spec du plein écran ne l'initialise pas : vu au banc, 8 oct.).
initialiserMenuVue();

// === COULEUR DE FOND CANEVAS (rubrique « Fond du canevas » du menu « Vue ») ===
// ⚠ Clé GLOBALE, à dessein : la couleur vaut pour toutes les cartes et tous
// les trimestres (registre : docs/DATA-OWNERSHIP.md). C'est pourquoi elle est
// dans « Vue » et non sous le nom d'une carte (décision de Grégoire, 8 oct.).
(function() {
    var pastilles = document.getElementById('planif-fond-swatches');
    if (!pastilles) return;

    pastilles.addEventListener('click', function(e) {
        var swatch = e.target.closest('[data-fond]');
        if (!swatch) return;
        var couleur = swatch.dataset.fond;
        var zone = document.getElementById('planif-zone-wrapper');
        if (zone) zone.style.background = couleur || '';
        db.setSync('planif-fond-canvas', couleur);
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
    // L'état se lit à la coche de « Vue plein écran » (menu « Vue »), pas à
    // une icône qui change : l'ancienne icône active était celle de « Tout voir ».
    var item = document.getElementById('planif-vue-plein-ecran');
    if (item) item.setAttribute('aria-pressed', _planifPleinEcran ? 'true' : 'false');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _planifPleinEcran) {
        togglePleinEcranCarte();
    }
});

})();
