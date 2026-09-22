/* ===============================
   MODULE: PLANIFICATION — EXPORT DU PLAN (Lot C du portage #424, 8 août 2026)

   UN générateur au lieu de six (décision D5, audit du 8 août §3bis) :
   - la carte est traversée UNE fois (construirePlan → structure intermédiaire) ;
   - la PROFONDEUR filtre (sommaire · deroulement · alignement — D4) ;
   - le FORMAT met en forme (texte · tsv · markdown).
   Neuf sorties pour un moteur. C'est ici que « SÉANCE » redevient « Leçon »
   (audit §1.4), que les durées passent par dureeRollupNoeud (§1.5, fin du
   double comptage) et que les objectifs sortent au pluriel (§1.6) — corrigés
   UNE fois, pas six.

   ⚠ RÉTROACTIONS — deux porteurs, priorité au nœud (contrainte D2). Depuis
   le Lot G, le porteur historique (planification_seances[...].activites)
   n'existe plus qu'au travers d'un backup Codex réimporté d'avant le
   portage, entre son import et le passage de la moissonneuse (main.js).
   Le repli de lecture ci-dessous couvre cette fenêtre ; il se retire AVEC
   la moissonneuse (BACKLOG #430, rentrée).

   Export: window.planificationExport
   =============================== */

(function() {
'use strict';

// Niveaux nommés par leur USAGE (D4) — l'id est technique, le label est l'UX.
// « Personnalisé » (#431) : cases + ordre réglés par l'utilisateur, mémorisés
// en préférence — pour se conformer aux gabarits départementaux.
var NIVEAUX = [
    { id: 'sommaire',    label: 'Plan de cours' },
    { id: 'deroulement', label: 'En classe' },
    { id: 'alignement',  label: 'Preuve d’alignement' },
    // ⚠ « Calendrier » N'EST PAS un quatrième niveau de profondeur (#416 lot I,
    // D4). Il vit dans cette liste parce que c'est là que l'utilisateur choisit
    // ce qu'il exporte, et que les gabarits nommés (lot H) n'existent pas
    // encore. Quand ils arriveront, cette liste DEVIENDRA la liste des
    // gabarits et « Personnalisé » y perdra sa place de niveau.
    { id: 'calendrier',  label: 'Calendrier', formats: ['tsv', 'markdown'] }
];
var FORMATS = [
    { id: 'texte',    label: 'Texte',    extension: '.txt', mime: 'text/plain' },
    { id: 'tsv',      label: 'Tableau (TSV)', extension: '.tsv', mime: 'text/tab-separated-values' },
    { id: 'markdown', label: 'Markdown', extension: '.md',  mime: 'text/markdown' }
];

function carte() { return window.planificationCarte; }

function labelNiveau(niveauId) {
    var n = NIVEAUX.find(function(x) { return x.id === niveauId; });
    return n ? n.label : niveauId;
}

// Ce que chaque niveau MONTRE (table D4 du plan de chantier). Les évaluations
// avec leur pondération sont à TOUS les niveaux — c'est le contrat du sommaire.
var INCLUSIONS = {
    sommaire:    { objectifs: false, activites: false, durees: false, retroactions: false, liens: false, connaissances: false, productionsDetail: false },
    deroulement: { objectifs: true,  activites: true,  durees: true,  retroactions: true,  liens: false, connaissances: false, productionsDetail: false },
    alignement:  { objectifs: true,  activites: true,  durees: true,  retroactions: true,  liens: true,  connaissances: true,  productionsDetail: true }
};

function formatDuree(min) {
    if (!min) return '';
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h > 0 ? h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '') : m + ' min';
}

// ---------------------------------------------------------------------------
// LE PORTEUR HISTORIQUE (repli, jusqu'au Lot F)
// ---------------------------------------------------------------------------

function activitesLegacyDeLecon(leconId) {
    var c = carte();
    if (!c || typeof db === 'undefined' || typeof window.cle !== 'function') return {};
    try {
        var cleNote = c.cleNoteLecon(leconId);
        if (!cleNote) return {};
        var seances = db.getSync(window.cle(c.CLE_SEANCES), {}) || {};
        return (seances[cleNote] && seances[cleNote].activites) || {};
    } catch (e) {
        return {};
    }
}

// ---------------------------------------------------------------------------
// CONSTRUCTION — la carte est traversée UNE fois, tout est collecté
// ---------------------------------------------------------------------------

function categorieDe(nd) {
    var c = carte();
    if (nd.type === 'evaluation') return 'evaluation';
    if (c.TYPES_ACTIVITE.indexOf(nd.type) !== -1) return 'activite';
    if (c.normaliserType(nd.type) === 'connaissance') return 'connaissance';
    return 'autre';
}

function liensDe(noeudId) {
    return carte().getLiensDeNoeud(noeudId).map(function(l) {
        return { direction: l.direction, label: l.lienLabel, titre: l.noeudTitre };
    });
}

/** Un enfant non-conteneur, avec tout ce qu'un niveau pourrait vouloir montrer. */
function construireElement(nd, contexte) {
    var c = carte();
    var el = {
        id: nd.id,
        type: nd.type,
        label: c.obtenirLabelNoeud(nd),
        titre: nd.titre || 'Sans titre',
        categorie: categorieDe(nd),
        duree: (nd.metadata && parseInt(nd.metadata.duree, 10)) || 0,
        horsClasse: !!(nd.metadata && nd.metadata.horsClasse === true),
        retroaction: null,        // formative (activité)
        retroactionRendu: null,   // sur le rendu (évaluation)
        production: null,
        objectifsServis: [],
        liens: liensDe(nd.id)
    };

    // Rétroaction formative — nœud d'abord, porteur historique en repli (D2).
    if (el.categorie === 'activite') {
        var duNoeud = nd.metadata && nd.metadata.retroaction;
        var legacy = contexte.activitesLegacy[nd.id];
        var valeur = duNoeud || (legacy && legacy.retroaction) || null;
        if (valeur && valeur !== 'aucune') el.retroaction = valeur;
        // Production rattachée par l'Organisateur à une ACTIVITÉ (porteur
        // historique uniquement — le nœud activité n'a jamais eu ce champ).
        if (legacy && legacy.productionId) {
            el.production = c.afficherDetailsProduction(legacy.productionId, contexte.productions);
        }
    }

    if (el.categorie === 'evaluation') {
        var retroRendu = nd.metadata && nd.metadata.retroaction;
        if (retroRendu && retroRendu !== 'aucune') el.retroactionRendu = retroRendu;
        if (nd.metadata && nd.metadata.productionId) {
            el.production = c.afficherDetailsProduction(nd.metadata.productionId, contexte.productions);
        }
    }

    // #403 — objectifs servis, résolus en TEXTES contre la leçon parente.
    var servis = c.objectifsServisPar(nd);
    if (servis.length > 0 && contexte.objectifsParId) {
        el.objectifsServis = servis
            .map(function(id) { return contexte.objectifsParId[id]; })
            .filter(Boolean);
    }
    return el;
}

// ---------------------------------------------------------------------------
// LA DATE, DÉRIVÉE ET JAMAIS STOCKÉE (#416 lot C)
//
// Une leçon ne porte pas de date. Elle porte une SEMAINE (#410) et un RANG dans
// cette semaine (#416 lot A) ; la date est ce que ces deux-là donnent quand on
// les confronte à l'horaire. Stocker la date figerait un calcul : déplacer une
// leçon d'une semaine, ou corriger un congé au calendrier, la rendrait fausse
// en silence. On la dérive à chaque export, ou on ne l'affiche pas.
//
// ⚠ LES SÉANCES VIVENT PAR GROUPE-COURS, PAS PAR COURS. La carte se rattache à
// un COURS (#407) ; les dates, elles, sont indexées `seancesCompletes_gc_<id>`.
// Un cours à plusieurs groupes est le cas fréquent — Grégoire en avait deux à
// l'hiver — et deux groupes du même cours n'ont ni le même horaire ni les mêmes
// dates. Le groupe est donc CHOISI au moment de l'export (D9), jamais deviné,
// jamais mémorisé dans un gabarit : trois groupes obligeraient sinon à trois
// gabarits identiques.
// ---------------------------------------------------------------------------

/** Groupes-cours rattachés à un cours, dans l'ordre du magasin. [] si aucun. */
function groupesCoursDuCours(coursId) {
    if (!coursId || typeof window.cle !== 'function' || !window.db) return [];
    var tous = window.db.getSync(window.cle('groupesCours'), []);
    if (!Array.isArray(tous)) return [];
    return tous
        .filter(function(g) { return g && g.coursId === coursId; })
        .map(function(g) { return { id: g.id, nom: g.nom || g.id, groupeNum: g.groupeNum || '' }; });
}

/** Le cours de la carte ACTIVE, ou null. N'atteste rien de son existence. */
function coursDeLaCarteActive() {
    var pd = window.planificationDonnees;
    if (!pd || typeof pd.obtenirCoursDeCarte !== 'function') return null;
    var index = pd.getIndex();
    if (!index || !index.active) return null;
    return pd.obtenirCoursDeCarte(index.active);
}

/** Les groupes entre lesquels l'export doit faire choisir. [] = pas de choix. */
function groupesCoursDeLaCarte() {
    return groupesCoursDuCours(coursDeLaCarteActive());
}

/**
 * Table `semaine -> [dates triées]` pour UN groupe-cours, lue une seule fois
 * par export. Null si le groupe n'est pas déterminé ou n'a aucune séance.
 *
 * ⚠ Le rang compte les RENCONTRES, pas les blocs horaires : deux périodes le
 * même jour font une seule séance. C'est le décompte de la source unique
 * `obtenirRangSeanceDansSemaine`, qui indexe des DATES — s'en écarter ferait
 * dire « B » ici et « 1re séance » ailleurs pour le même mardi.
 */
function construireHoraireDeLecons(groupeCoursId) {
    if (!groupeCoursId) return null;
    if (typeof window.obtenirSeancesCompletesDuGroupe !== 'function') return null;

    var parDate = window.obtenirSeancesCompletesDuGroupe(groupeCoursId);
    var datesParSemaine = {};

    Object.keys(parDate).forEach(function(date) {
        var seances = parDate[date];
        if (!Array.isArray(seances) || seances.length === 0) return;
        // Toutes les séances d'une date portent la même semaine ; la première suffit.
        var semaine = parseInt(seances[0].numeroSemaine, 10);
        if (isNaN(semaine)) return;
        if (!datesParSemaine[semaine]) datesParSemaine[semaine] = [];
        datesParSemaine[semaine].push(date);
    });

    var semaines = Object.keys(datesParSemaine);
    if (semaines.length === 0) return null;

    // Tri lexicographique = tri chronologique en AAAA-MM-JJ.
    semaines.forEach(function(s) { datesParSemaine[s].sort(); });

    return { groupeCoursId: groupeCoursId, datesParSemaine: datesParSemaine };
}

/**
 * La date d'une leçon, ou null. Fonction PURE : tout ce qu'elle lit lui est
 * passé.
 *
 * Trois états dégradés, tous silencieux et non bloquants — une carte reste
 * utilisable sans horaire, et une colonne vide n'est pas une erreur :
 *   1. pas d'horaire résolu (carte sans cours, ou groupe non choisi) ;
 *   2. la leçon n'a pas de semaine, ou pas de rang posé ;
 *   3. la semaine n'a pas de séance à ce rang (rang 3 sur une semaine à deux
 *      rencontres, ou semaine hors trimestre).
 */
function dateDeLecon(horaire, semaine, rangSeance) {
    if (!horaire || !horaire.datesParSemaine) return null;

    var s = parseInt(semaine, 10);
    var r = parseInt(rangSeance, 10);
    if (isNaN(s) || isNaN(r) || r < 1) return null;

    var dates = horaire.datesParSemaine[s];
    if (!Array.isArray(dates) || dates.length < r) return null;

    return dates[r - 1];
}

// ---------------------------------------------------------------------------
// LA DATE DANS L'INSPECTEUR (#695, élargie à l'évaluation le 22 sept. 2026)
//
// Même calcul que l'export, pas une copie : l'Inspecteur lit la date par
// `construireHoraireDeLecons` + `dateDeLecon`. Ce qui change, c'est qu'il ne
// CHOISIT pas de groupe (décision de Grégoire, 22 sept.) : il montre une ligne
// par groupe du cours, parce que deux groupes n'ont pas les mêmes jours.
//
// ⚠ Aucune date devinée : quand le rang n'existe pas cette semaine-là (congé,
// semaine à deux rencontres), la ligne le DIT. Sauter au jour suivant ferait
// une date fausse, et une date fausse dans un plan de cours se recopie.
// ---------------------------------------------------------------------------

var JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
var MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « 2026-09-30 » → « mercredi 30 septembre ». Null si la date est illisible. */
function formaterJourEtMois(ymd) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ''));
    if (!m) return null;
    var a = +m[1], mo = +m[2], j = +m[3];
    // UTC : le jour de la semaine ne doit pas dépendre du fuseau de l'appareil.
    var d = new Date(Date.UTC(a, mo - 1, j));
    if (d.getUTCMonth() !== mo - 1 || d.getUTCDate() !== j) return null;
    return JOURS_FR[d.getUTCDay()] + ' ' + j + ' ' + MOIS_FR[mo - 1];
}

/**
 * Les groupes du cours, chacun avec son horaire construit UNE fois. L'Inspecteur
 * l'appelle à l'ouverture, pas à chaque frappe de la semaine.
 * @returns {Array<{id, nom, groupeNum, horaire}>} [] si le cours n'a aucun groupe
 */
function horairesDesGroupesDuCours(coursId) {
    return groupesCoursDuCours(coursId).map(function(g) {
        return { id: g.id, nom: g.nom, groupeNum: g.groupeNum, horaire: construireHoraireDeLecons(g.id) };
    });
}

/**
 * Les lignes « Date » de l'Inspecteur. Fonction PURE : tout lui est passé.
 * @param {Object} ctx
 *   horsLecon {boolean} — évaluation posée hors de toute leçon
 *   coursId   {string|null} — cours de la carte
 *   groupes   {Array} — sortie de `horairesDesGroupesDuCours`
 *   semaine, rang {number|null} — le couple qui situe la leçon
 *   lettre    {string} — « B » pour le rang 2 (lettreRangSeance de la carte)
 * @returns {Array<string>} au moins une ligne, jamais vide
 */
function lignesDateDeLecon(ctx) {
    var c = ctx || {};
    if (c.horsLecon) return ['Hors leçon : pas de date'];
    if (c.semaine === null || c.semaine === undefined) return ['Leçon non planifiée'];
    if (c.rang === null || c.rang === undefined) return ['Semaine ' + c.semaine + ', séance non fixée'];
    if (!c.coursId) return ['Carte rattachée à aucun cours : pas de date'];

    var groupes = Array.isArray(c.groupes) ? c.groupes : [];
    if (!groupes.some(function(g) { return g && g.horaire; })) return ['Aucun horaire saisi pour ce cours'];

    var seance = 'séance ' + c.lettre;
    var manque = 'pas de ' + seance + ' en semaine ' + c.semaine;
    var dateDuGroupe = function(g) {
        if (!g.horaire) return 'aucun horaire saisi';
        var jour = formaterJourEtMois(dateDeLecon(g.horaire, c.semaine, c.rang));
        return jour || manque;
    };

    if (groupes.length === 1) {
        var seule = dateDuGroupe(groupes[0]);
        if (seule === manque) return ['Pas de ' + seance + ' en semaine ' + c.semaine];
        return [seule.charAt(0).toUpperCase() + seule.slice(1) + ' · ' + seance];
    }

    // Plusieurs groupes : « séance B » une fois, en tête, puis un groupe par ligne.
    return [seance.charAt(0).toUpperCase() + seance.slice(1)].concat(groupes.map(function(g) {
        var etiquette = g.groupeNum ? 'Gr. ' + g.groupeNum : g.nom;
        return etiquette + ' : ' + dateDuGroupe(g);
    }));
}

/**
 * Ordre de lecture des leçons dans un document : la SEMAINE, puis le rang de
 * séance, puis la position sur la carte.
 *
 * ⚠ CE TRI MANQUAIT, ET SON ABSENCE NE RESSEMBLAIT PAS À UN DÉFAUT DE TRI.
 * Retour terrain du 15 août : « la leçon 11 se range bizarrement après la
 * rangée 1 plutôt que 10 ». Les leçons sortaient dans l'ordre BRUT de
 * `seq.enfants` — c'est-à-dire l'ordre de CRÉATION. Ni temporel, ni spatial :
 * l'ordre dans lequel les blocs avaient été posés, des mois plus tôt.
 * Une seule leçon créée tôt et planifiée tard suffit à la faire surgir en
 * tête, ce qui se lit comme un tri alphabétique cassé (« 11 après 1 ») alors
 * qu'il n'y avait aucun tri du tout.
 *
 * Mesuré avant correction sur une carte d'essai : ["11","3","3","5","6","8"].
 *
 * ⮕ Les SÉQUENCES, elles, étaient déjà triées temporellement
 * (`listerSequencesHierarchie('temporel')`). Le document mélangeait donc deux
 * ordres selon le niveau — d'où une liste qui a l'air presque triée, ce qui
 * est plus déroutant qu'une liste franchement en désordre.
 *
 * Les leçons non planifiées vont EN FIN, jamais en tête : même règle que
 * `rangTemporel`, pour que l'absence de semaine ne se lise pas comme « semaine
 * zéro ».
 */
function trierLeconsTemporel(noeuds) {
    var c = carte();
    var loin = Number.MAX_SAFE_INTEGER;
    return noeuds.slice().sort(function(a, b) {
        var sa = c.semaineDeLecon(a), sb = c.semaineDeLecon(b);
        var ka = sa === null ? loin : sa, kb = sb === null ? loin : sb;
        if (ka !== kb) return ka - kb;
        var ra = c.rangSeanceDeLecon(a), rb = c.rangSeanceDeLecon(b);
        var qa = ra === null ? loin : ra, qb = rb === null ? loin : rb;
        if (qa !== qb) return qa - qb;
        // Départage : lecture de la carte, gauche → droite puis haut → bas.
        // Sans lui, deux leçons de même semaine ET même rang garderaient
        // l'ordre de création — le désordre qu'on vient de retirer.
        return ((a.x || 0) - (b.x || 0)) || ((a.y || 0) - (b.y || 0));
    });
}

function construireLecon(nd, horaire) {
    var c = carte();
    var objectifs = c.objectifsDeLeconParId(nd.id); // [{id, texte}]
    var objectifsParId = {};
    objectifs.forEach(function(o) { objectifsParId[o.id] = o.texte; });

    var contexte = {
        productions: chargerProductionsUneFois(),
        activitesLegacy: activitesLegacyDeLecon(nd.id),
        objectifsParId: objectifsParId
    };

    var semaine = c.semaineDeLecon(nd);
    var rangSeance = c.rangSeanceDeLecon(nd);

    var lecon = {
        id: nd.id,
        titre: nd.titre || 'Sans titre',
        semaine: semaine,
        rangSeance: rangSeance,
        // Dérivée à chaque export, jamais écrite dans le modèle (#416 lot C).
        date: dateDeLecon(horaire, semaine, rangSeance),
        dureeRollup: c.dureeRollupNoeud(nd),
        objectifs: objectifs.map(function(o) { return o.texte; }),
        objectifDerive: null,
        liens: liensDe(nd.id),
        elements: []
    };

    // Repli des anciens exports : sans objectif saisi, dériver des idées
    // maîtresses ancêtres — même formulation, pour que rien ne se perde.
    if (lecon.objectifs.length === 0) {
        var ideesM = c.trouverIdeesMaitressesAncetres(nd.id);
        if (ideesM.length > 0) {
            lecon.objectifDerive = ideesM.map(function(im) {
                var t = (im.titre || '...').toLowerCase();
                var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(t) ? 'd’' : 'de ';
                return 'Au terme de la leçon, l’étudiant·e sera capable ' + prefixe + t + '.';
            }).join('\n');
        }
    }

    var etat = c.etat;
    (nd.enfants || []).forEach(function(eid) {
        var enf = etat.noeuds.get(eid);
        if (!enf) return;
        lecon.elements.push(construireElement(enf, contexte));
    });
    return lecon;
}

var _productionsCache = null;
function chargerProductionsUneFois() {
    if (_productionsCache === null) _productionsCache = carte().chargerProductions();
    return _productionsCache;
}

/**
 * LA traversée unique. Rend la structure complète (niveau « alignement ») ;
 * les rendeurs FILTRENT, ils ne relisent jamais la carte.
 */
/**
 * @param {Object} [options]
 * @param {string} [options.groupeCoursId] - Groupe dont les dates servent à la
 *   colonne Date (D9). Absent : pris d'office s'il n'y en a qu'un, sinon aucune
 *   date — l'export ne devine pas lequel des groupes est le bon.
 */
function construirePlan(options) {
    var c = carte();
    if (!c || !c.etat) return null;
    _productionsCache = null;

    // Le groupe se résout UNE fois par export, pas une fois par leçon.
    var opts = options || {};
    var groupeCoursId = opts.groupeCoursId || null;
    if (!groupeCoursId) {
        var candidats = groupesCoursDeLaCarte();
        if (candidats.length === 1) groupeCoursId = candidats[0].id;
    }
    var horaire = construireHoraireDeLecons(groupeCoursId);

    var etat = c.etat;
    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var nomCarte = 'Sans titre';
    if (index && index.cartes) {
        var infos = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (infos) nomCarte = infos.nom;
    }

    // Ordre hiérarchique (voie A) : chaque sous-séquence a sa section, après
    // son parent — même lecture que les anciens générateurs.
    var hierarchie = c.listerSequencesHierarchie('temporel');
    var sequences = hierarchie.map(function(entry) {
        var seq = entry.seq;
        var s = {
            id: seq.id,
            titre: entry.niveau > 0 ? c.cheminSequence(seq) : (seq.titre || 'Sans titre'),
            niveau: entry.niveau,
            etendue: c.etendueTemporelle(seq),
            dureeRollup: c.dureeRollupNoeud(seq),
            liens: liensDe(seq.id),
            lecons: [],
            elements: []
        };
        var contexteSeq = {
            productions: chargerProductionsUneFois(),
            activitesLegacy: {},
            objectifsParId: null
        };
        // Les leçons sont collectées en NŒUDS puis triées, et pas construites
        // au passage : le tri a besoin de `x`/`y`, que l'objet construit ne
        // porte pas.
        var noeudsLecons = [];
        (seq.enfants || []).forEach(function(eid) {
            var enf = etat.noeuds.get(eid);
            if (!enf || enf.type === 'sequence') return; // sections propres plus bas
            if (enf.type === 'lecon') noeudsLecons.push(enf);
            else s.elements.push(construireElement(enf, contexteSeq));
        });
        s.lecons = trierLeconsTemporel(noeudsLecons).map(function(nd) {
            return construireLecon(nd, horaire);
        });
        return s;
    });

    // Hors séquence : l'itération de `etat.noeuds` rend l'ordre d'INSERTION,
    // encore moins signifiant qu'ailleurs. Même tri, même raison.
    var noeudsOrphelins = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) noeudsOrphelins.push(nd);
    }
    var leconsOrphelines = trierLeconsTemporel(noeudsOrphelins).map(function(n2) {
        return construireLecon(n2, horaire);
    });

    return { nomCarte: nomCarte, sequences: sequences, leconsOrphelines: leconsOrphelines };
}

// ---------------------------------------------------------------------------
// LIBELLÉS PARTAGÉS PAR LES TROIS FORMATS
// ---------------------------------------------------------------------------

function libelleRetroaction(valeur) {
    var options = carte().RETROACTIONS || [];
    var trouvee = options.find(function(o) { return o[0] === valeur; });
    return trouvee ? trouvee[1] : valeur;
}

function ligneProduction(prod, detail) {
    var s = prod.nomProduction + ' (' + (prod.ponderation || 0) + ' %)';
    if (prod.dateEcheance) s += ' — Échéance : ' + prod.dateEcheance;
    if (detail) s += ' — Grille : ' + prod.nomGrille + ' · Échelle : ' + prod.nomEchelle;
    return s;
}

function formaterLiens(liens) {
    return liens.map(function(l) {
        return (l.direction === 'sortant' ? '→' : '←') + ' ' + l.label + ' : ' + l.titre;
    });
}

/** Les éléments qu'un niveau montre, dans l'ordre de la carte. */
function elementsVisibles(elements, inc) {
    return elements.filter(function(el) {
        // Les presets ne définissent pas `evaluations` : elles sont toujours
        // montrées (contrat du sommaire). Le niveau Personnalisé (#431) pose
        // le drapeau explicitement.
        if (el.categorie === 'evaluation') return inc.evaluations !== false;
        if (el.categorie === 'activite') return inc.activites;
        if (el.categorie === 'connaissance') return inc.connaissances;
        return inc.connaissances; // « autre » (idée maîtresse posée là…) : niveau preuve
    });
}

// ---------------------------------------------------------------------------
// NIVEAU PERSONNALISÉ (#431) — quatre sections ordonnables, huit contenus
// ---------------------------------------------------------------------------
// L'ordre porte sur les CONTENUS d'une leçon (sections en texte/Markdown,
// groupes de colonnes en TSV), JAMAIS sur la structure séquences → leçons :
// la structure du document EST la carte (décision du 8 août, en conversation).

var SECTIONS_PLAN = [
    { id: 'objectifs',   label: 'Objectifs' },
    { id: 'deroulement', label: 'Déroulement (activités et évaluations)' },
    { id: 'productions', label: 'Productions rattachées' },
    { id: 'liens',       label: 'Liens et objectifs servis' }
];

var CONTENUS_PLAN = [
    { id: 'objectifs',        label: 'Objectifs des leçons' },
    { id: 'activites',        label: 'Activités et exposés' },
    { id: 'evaluations',      label: 'Évaluations' },
    { id: 'durees',           label: 'Durées (Σ compris)' },
    { id: 'retroactions',     label: 'Rétroactions' },
    { id: 'connaissances',    label: 'Connaissances' },
    { id: 'liens',            label: 'Liens et objectifs servis' },
    { id: 'productionsDetail', label: 'Détail des productions (grille, échelle)' }
];

var ORDRE_DEFAUT = SECTIONS_PLAN.map(function(s) { return s.id; });

/** Le point de départ d'une personnalisation : les cases d'un preset. */
function configDepuisPreset(presetId) {
    var inc = INCLUSIONS[presetId] || INCLUSIONS.deroulement;
    return {
        contenus: {
            objectifs: !!inc.objectifs,
            activites: !!inc.activites,
            evaluations: true,
            durees: !!inc.durees,
            retroactions: !!inc.retroactions,
            connaissances: !!inc.connaissances,
            liens: !!inc.liens,
            productionsDetail: !!inc.productionsDetail
        },
        ordre: ORDRE_DEFAUT.slice()
    };
}

/**
 * Normalise une config venue du stockage : ids de section inconnus retirés,
 * sections manquantes rajoutées en queue (une mise à jour qui ajoute une
 * section ne casse pas un réglage existant), drapeaux manquants pris du
 * preset « En classe ». Rend toujours une config complète et sûre.
 */
function normaliserConfigPersonnalisee(brute) {
    var base = configDepuisPreset('deroulement');
    if (!brute || typeof brute !== 'object') return base;
    var contenus = {};
    CONTENUS_PLAN.forEach(function(c) {
        var v = brute.contenus && brute.contenus[c.id];
        contenus[c.id] = typeof v === 'boolean' ? v : base.contenus[c.id];
    });
    var connus = {};
    var ordre = (Array.isArray(brute.ordre) ? brute.ordre : []).filter(function(id) {
        if (connus[id] || ORDRE_DEFAUT.indexOf(id) === -1) return false;
        connus[id] = true;
        return true;
    });
    ORDRE_DEFAUT.forEach(function(id) { if (!connus[id]) ordre.push(id); });
    return { contenus: contenus, ordre: ordre };
}

/** Les drapeaux de rendu dérivés d'une config personnalisée. */
function incDepuisConfig(cfg) {
    var c = cfg.contenus;
    return {
        objectifs: c.objectifs,
        activites: c.activites,
        evaluations: c.evaluations,
        durees: c.durees,
        retroactions: c.retroactions,
        liens: c.liens,
        connaissances: c.connaissances,
        productionsDetail: c.productionsDetail,
        // En mode sections, la production sort dans SA section, pas sous
        // chaque élément.
        productionsInline: false
    };
}

// ---------------------------------------------------------------------------
// FORMAT TEXTE
// ---------------------------------------------------------------------------

function rendreElementTexte(el, inc, indent) {
    var txt = '';
    var duree = inc.durees && el.duree ? ' (' + formatDuree(el.duree) + ')' : '';
    var marqueur = el.categorie === 'evaluation' ? '◆' : '•';
    txt += indent + marqueur + ' [' + el.label + '] ' + el.titre + duree + '\n';
    if (el.production && inc.productionsInline !== false) {
        txt += indent + '  Évaluation : ' + ligneProduction(el.production, inc.productionsDetail) + '\n';
    }
    if (inc.retroactions && el.retroaction) {
        txt += indent + '  Rétroaction : ' + libelleRetroaction(el.retroaction) + '\n';
    }
    if (inc.retroactions && el.retroactionRendu) {
        txt += indent + '  Rétroaction sur le rendu : ' + libelleRetroaction(el.retroactionRendu) + '\n';
    }
    if (el.objectifsServis.length > 0 && inc.liens) {
        txt += indent + '  Sert : ' + el.objectifsServis.join(' ; ') + '\n';
    }
    if (inc.liens) {
        formaterLiens(el.liens).forEach(function(l) { txt += indent + '  ' + l + '\n'; });
    }
    return txt;
}

// Ordre HISTORIQUE des presets texte (contrat du harnais 424) : liens,
// objectifs, éléments — la production reste alors SOUS son élément.
var ORDRE_TEXTE_PRESET = ['liens', 'objectifs', 'deroulement'];

function rendreLeconTexte(lecon, inc, ordre) {
    var duree = inc.durees && lecon.dureeRollup ? ' — Σ ' + formatDuree(lecon.dureeRollup) : '';
    var sem = lecon.semaine !== null ? ' (Sem. ' + lecon.semaine + ')' : '';
    var txt = '\n  ┌ LEÇON : ' + lecon.titre + sem + duree + '\n';

    var sections = {
        liens: function() {
            if (!inc.liens) return;
            formaterLiens(lecon.liens).forEach(function(l) { txt += '  │ ' + l + '\n'; });
        },
        objectifs: function() {
            if (!inc.objectifs) return;
            if (lecon.objectifs.length > 0) {
                txt += '  │ Objectifs :\n';
                lecon.objectifs.forEach(function(o) { txt += '  │   — ' + o + '\n'; });
            } else if (lecon.objectifDerive) {
                lecon.objectifDerive.split('\n').forEach(function(ligne) {
                    txt += '  │ Objectif : ' + ligne + '\n';
                });
            }
        },
        deroulement: function() {
            elementsVisibles(lecon.elements, inc).forEach(function(el) {
                txt += rendreElementTexte(el, inc, '  │ ');
            });
        },
        productions: function() {
            // Section propre du mode Personnalisé — la production est une
            // information de la LEÇON, montrée même si l'élément porteur est
            // masqué par les cases.
            lecon.elements.forEach(function(el) {
                if (!el.production) return;
                txt += '  │ Évaluation : ' + ligneProduction(el.production, inc.productionsDetail) + '\n';
            });
        }
    };

    (ordre || ORDRE_TEXTE_PRESET).forEach(function(id) {
        if (sections[id]) sections[id]();
    });
    txt += '  └─\n';
    return txt;
}

function rendreTexte(plan, niveauId, incPerso, ordrePerso) {
    var inc = incPerso || INCLUSIONS[niveauId];
    var ordre = ordrePerso || null;
    var txt = '═══════════════════════════════════════\n';
    txt += 'PLAN DE COURS — ' + plan.nomCarte + '\n';
    txt += 'Niveau : ' + labelNiveau(niveauId) + '\n';
    txt += 'Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n';
    txt += '═══════════════════════════════════════\n\n';

    plan.sequences.forEach(function(seq) {
        var etendue = carte().formaterEtendue(seq.etendue);
        var semTxt = etendue ? ' (' + etendue + ')' : '';
        var dureeSeq = inc.durees && seq.dureeRollup ? ' — Σ ' + formatDuree(seq.dureeRollup) : '';
        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉQUENCE : ' + seq.titre + semTxt + dureeSeq + '\n';
        txt += '───────────────────────────────────────\n';
        if (inc.liens) {
            formaterLiens(seq.liens).forEach(function(l) { txt += '  ' + l + '\n'; });
        }
        seq.lecons.forEach(function(lecon) {
            txt += rendreLeconTexte(lecon, inc, ordre);
        });
        elementsVisibles(seq.elements, inc).forEach(function(el) {
            txt += rendreElementTexte(el, inc, '  ');
        });
        if (inc.durees && seq.dureeRollup) {
            txt += '  Durée totale : ' + formatDuree(seq.dureeRollup) + '\n';
        }
        txt += '\n';
    });

    if (plan.leconsOrphelines.length > 0) {
        txt += '───────────────────────────────────────\n';
        txt += '▌ LEÇONS HORS SÉQUENCE\n';
        txt += '───────────────────────────────────────\n';
        plan.leconsOrphelines.forEach(function(lecon) {
            txt += rendreLeconTexte(lecon, inc, ordre);
        });
    }
    return txt;
}

// ---------------------------------------------------------------------------
// FORMAT TSV
// ---------------------------------------------------------------------------

function nettoyerTSV(str) {
    return String(str == null ? '' : str).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
}

// ═══════════════════════════════════════════════════════════════════════════
// LE CATALOGUE DE COLONNES (#416 lot G)
//
// Avant : deux rendeurs TSV côte à côte — un pour les préréglages (colonnes
// figées par niveau) et un pour le « Personnalisé » de #431 (groupes de
// colonnes ordonnés). Ils parcouraient la même structure et divergeaient sur
// les détails, ce qui est la définition d'une dette qui grossit.
//
// Maintenant : UN catalogue de colonnes, UN rendeur. Un gabarit n'est plus
// qu'une liste ordonnée d'identifiants de colonnes.
//
// ⚠ D8 — LE PRÉFIXE EST LIBÉRÉ. « Séquence | Leçon | Semaine » était fixe, en
// tête de toute sortie, au motif que « la structure EST la carte ». Ce motif
// vaut pour un export de CONCEPTION ; il ne vaut pas pour un tableau qu'un
// département impose. Séquence, Leçon et Semaine sont désormais des colonnes
// comme les autres : retirables, déplaçables, renommables.
//
// ⚠ CE QUI N'EST PAS ICI : quelles LIGNES sortent. Le catalogue dit ce que
// chaque cellule contient, jamais combien de lignes il y a. Le sommaire
// n'émet que les évaluations, les autres émettent la leçon puis ses éléments
// — c'est l'axe « granularité », séparé exprès.
//
// ⚠ UNE seule colonne « Semaine » (#152, capture Numbers de Grégoire) : la
// ligne de séquence y met son ÉTENDUE (« 3–5 »), la ligne de leçon son
// numéro. Deux colonnes disaient deux fois la même dérivation — illisible.
// ═══════════════════════════════════════════════════════════════════════════

function etendueTexteTSV(etendue) {
    if (!etendue) return '';
    return etendue.debut + (etendue.fin !== etendue.debut ? '–' + etendue.fin : '');
}

function retroTexte(el) {
    if (!el) return '';
    if (el.retroaction) return libelleRetroaction(el.retroaction);
    if (el.retroactionRendu) return 'Sur le rendu : ' + libelleRetroaction(el.retroactionRendu);
    return '';
}

/**
 * Ce que vaut chaque colonne, pour une ligne donnée.
 *
 * Le contexte d'une ligne : { seqTitre, lecon, el, estLecon, etendue }.
 *   - ligne de séquence VIDE : `etendue` est posé, ni `lecon` ni `el` ;
 *   - ligne de LEÇON        : `estLecon` vrai, `el` absent ;
 *   - ligne d'ÉLÉMENT       : `el` posé, `lecon` posé (ou null hors leçon).
 *
 * Règle qui traverse tout le catalogue : sur une ligne de leçon, ce qui
 * appartient à un élément est VIDE, et réciproquement. Une cellule qui
 * répéterait la valeur du parent ferait doubler les totaux à la lecture.
 */
var CATALOGUE_COLONNES = {
    sequence:    { libelle: 'Séquence',        valeur: function(c) { return c.seqTitre; } },
    lecon:       { libelle: 'Leçon',           valeur: function(c) { return c.lecon ? c.lecon.titre : ''; } },
    semaine:     { libelle: 'Semaine',         valeur: function(c) {
        if (c.etendue !== undefined) return etendueTexteTSV(c.etendue);
        return c.lecon && c.lecon.semaine !== null ? c.lecon.semaine : '';
    } },
    type:        { libelle: 'Type',            valeur: function(c) { return c.estLecon ? 'Leçon' : (c.el ? c.el.label : ''); } },
    titre:       { libelle: 'Titre',           valeur: function(c) { return c.estLecon ? c.lecon.titre : (c.el ? c.el.titre : ''); } },
    duree:       { libelle: 'Durée (min)',     valeur: function(c) {
        return c.estLecon ? (c.lecon.dureeRollup || '') : (c.el ? (c.el.duree || '') : '');
    } },
    retroaction: { libelle: 'Rétroaction',     valeur: function(c) { return c.estLecon ? '' : retroTexte(c.el); } },
    production:  { libelle: 'Production',      valeur: function(c) { return prodDe(c) ? prodDe(c).nomProduction : ''; } },
    ponderation: { libelle: 'Pondération (%)', valeur: function(c) { return prodDe(c) ? (prodDe(c).ponderation || 0) : ''; } },
    echeance:    { libelle: 'Échéance',        valeur: function(c) {
        var p = prodDe(c);
        return p && p.dateEcheance ? p.dateEcheance : '';
    } },
    objectifs:   { libelle: 'Objectifs',       valeur: function(c) {
        if (!c.estLecon) return '';
        return c.lecon.objectifs.length > 0
            ? c.lecon.objectifs.join(' ; ')
            : (c.lecon.objectifDerive || '');
    } },
    objectifsServis: { libelle: 'Objectifs servis', valeur: function(c) {
        return c.estLecon || !c.el ? '' : c.el.objectifsServis.join(' ; ');
    } },
    liens:       { libelle: 'Liens',           valeur: function(c) {
        if (c.estLecon) return formaterLiens(c.lecon.liens).join(' ; ');
        return c.el ? formaterLiens(c.el.liens).join(' ; ') : '';
    } },
    grille:      { libelle: 'Grille',          valeur: function(c) { return prodDe(c) ? prodDe(c).nomGrille : ''; } },
    echelle:     { libelle: 'Échelle',         valeur: function(c) { return prodDe(c) ? prodDe(c).nomEchelle : ''; } },
    // Propre au plan de cours : la production si elle existe, sinon le titre
    // de l'évaluation — c'est ce que le document doit annoncer à l'étudiant.
    evaluation:  { libelle: 'Évaluation',      valeur: function(c) {
        var p = prodDe(c);
        if (p) return p.nomProduction;
        return c.el ? c.el.titre : '';
    } },

    // --- Colonnes de la granularité « une ligne par séance » ---------------
    //
    // Elles n'ont de sens que sur une ligne de leçon qui AGRÈGE ses éléments :
    // en granularité « nœuds », chaque élément a déjà sa propre ligne, et
    // répéter ici la liste complète ferait dire deux fois la même chose.
    // D'où le vide hors du mode séance — ce n'est pas une valeur manquante,
    // c'est la même information rendue ailleurs.
    date:        { libelle: 'Date',            valeur: function(c) {
        return c.lecon && c.lecon.date ? c.lecon.date : '';
    } },
    rangSeance:  { libelle: 'Séance',          valeur: function(c) {
        if (!c.lecon || !c.lecon.rangSeance) return '';
        // La LETTRE à l'affichage, l'entier au stockage (#416 lot A, D1).
        return String.fromCharCode(64 + c.lecon.rangSeance);
    } },
    contenu:     { libelle: 'Contenu',         valeur: function(c) {
        return joindreTitres(elementsAgreges(c, 'activite'));
    } },
    evaluations: { libelle: 'Évaluations',     valeur: function(c) {
        return joindreEvaluations(elementsAgreges(c, 'evaluation'));
    } },
    // ⚠ SORT VIDE TANT QUE LE LOT B N'EST PAS LÀ, et c'est une décision, pas
    // un oubli. Rien dans le modèle ne dit encore « ce nœud se fait hors des
    // heures de classe » : `metadata.horsClasse` est le lot B. La colonne
    // existe quand même parce que le calendrier de Grégoire en a six, et
    // qu'une colonne absente se remarque moins qu'une colonne vide qu'il
    // remplira à la main en attendant. Compromis arbitré le 12 août.
    //
    // Le jour où le lot B arrive : filtrer ici sur `el.horsClasse`, et
    // RETIRER les nœuds ainsi marqués de `contenu` et `evaluations`, sinon
    // ils sortiront deux fois.
    travailPersonnel: { libelle: 'Travail personnel', valeur: function(c) {
        if (!c.agregeSaLecon || !c.lecon) return '';
        // ⚠ Cette colonne MÉLANGE les deux natures — une lecture à faire et un
        // artefact à remettre s'y côtoient. La règle de nommage s'applique donc
        // par ÉLÉMENT, pas en bloc : une activité sort par son titre (ce qu'on
        // fait), une évaluation par le nom de sa production (ce qu'on remet).
        return c.lecon.elements.filter(estHorsClasse).map(function(el) {
            return el.categorie === 'evaluation' && el.production
                ? el.production.nomProduction
                : el.titre;
        }).join(SEPARATEUR_AGREGE);
    } }
};

/**
 * Le nœud se fait-il hors des heures de classe ? (#416 lot B)
 *
 * La question était posée ici avant d'avoir une réponse — la colonne « Travail
 * personnel » sortait vide, et c'était dit. `metadata.horsClasse` existe
 * depuis le lot B : un seul endroit a changé.
 */
function estHorsClasse(el) {
    return !!(el && el.horsClasse);
}

// Le séparateur des cellules qui agrègent : lisible en tableur, sur une ligne.
var SEPARATEUR_AGREGE = ' · ';

/**
 * Ce qu'on FAIT pendant la rencontre : le titre de l'activité, toujours.
 *
 * ⚠ PAS le nom de sa production, même quand elle en porte une. Une activité
 * peut être rattachée à une production par l'Organisateur (porteur historique)
 * — « Pastiche descriptif » rattaché au « Quiz de lecture ». La colonne
 * Contenu doit dire ce qui se passe en classe, pas ce qui sera remis : sinon
 * le calendrier annonce un quiz là où l'étudiant vient écrire un pastiche.
 */
function joindreTitres(elements) {
    return elements.map(function(el) { return el.titre; }).join(SEPARATEUR_AGREGE);
}

/**
 * Ce qui est ÉVALUÉ : le nom de la production si elle existe, sinon le titre.
 *
 * L'inverse de la règle ci-dessus, et pour la même raison : c'est le nom de
 * la production que l'étudiant reconnaît dans son plan de cours.
 */
function joindreEvaluations(elements) {
    return elements.map(function(el) {
        return el.production ? el.production.nomProduction : el.titre;
    }).join(SEPARATEUR_AGREGE);
}

/**
 * Les éléments d'une catégorie, agrégés sur la ligne de leçon.
 *
 * ⚠ LE HORS-CLASSE EST EXCLU D'OFFICE (#416 lot B). Sans ça, une lecture
 * obligatoire marquée « hors classe » sortirait DEUX fois sur la même ligne :
 * dans Contenu parce que c'est une activité, et dans Travail personnel parce
 * qu'elle est hors classe. Un calendrier qui compte deux fois la même chose
 * est pire qu'un calendrier incomplet.
 */
function elementsAgreges(c, categorie) {
    if (!c.agregeSaLecon || !c.lecon) return [];
    return c.lecon.elements.filter(function(el) {
        return el.categorie === categorie && !estHorsClasse(el);
    });
}

function prodDe(c) {
    return (!c.estLecon && c.el && c.el.production) ? c.el.production : null;
}

// Les gabarits génériques, exprimés dans le catalogue. Ce sont EXACTEMENT les
// colonnes des trois préréglages historiques, dans le même ordre — c'est ce
// que le golden master vérifie à l'octet près.
// ⚠ « CALENDRIER » N'EST PAS UN QUATRIÈME NIVEAU. D4 le déconseille
// explicitement — « au-delà de trois, le choix devient lui-même une friction,
// et les niveaux intermédiaires se ressemblent ». Ce n'est pas une PROFONDEUR
// (il montre tout ce qui se passe en classe) mais une FORME : une ligne par
// rencontre, avec des cellules qui agrègent. C'est un GABARIT, et le premier
// à se servir des trois axes à la fois.
//
// Ses six colonnes viennent du déroulement que Grégoire tient déjà à la main.
// La sixième sort vide tant que le lot B n'est pas là — arbitré le 12 août
// pour livrer avant sa rentrée.
var GABARIT_CALENDRIER = {
    colonnes: ['semaine', 'rangSeance', 'date', 'contenu', 'evaluations', 'travailPersonnel'],
    granularite: 'seances',
    // ⚠ TSV et Markdown, PAS Texte : un calendrier en texte suivi n'est que
    // le tableau en moins lisible.
    formats: ['tsv', 'markdown']
};

var COLONNES_GENERIQUES = {
    sommaire:    ['sequence', 'lecon', 'semaine', 'evaluation', 'ponderation', 'echeance'],
    deroulement: ['sequence', 'lecon', 'semaine', 'type', 'titre', 'duree', 'retroaction',
                  'production', 'ponderation', 'echeance', 'objectifs'],
    alignement:  ['sequence', 'lecon', 'semaine', 'type', 'titre', 'duree', 'retroaction',
                  'production', 'ponderation', 'echeance', 'objectifs',
                  'objectifsServis', 'liens', 'grille', 'echelle']
};

/**
 * Les colonnes du gabarit « Personnalisé » (#431), déduites des inclusions et
 * de l'ordre des sections choisi par l'utilisateur.
 *
 * ⚠ Ce n'est PAS une quatrième table de colonnes : c'est une composition du
 * même catalogue. Le jour où les gabarits nommés arrivent (lot H), c'est
 * cette fonction qui disparaît — pas le catalogue.
 */
function colonnesPersonnalisees(inc, ordre) {
    var groupes = {
        objectifs: inc.objectifs ? ['objectifs'] : [],
        deroulement: (function() {
            if (!inc.activites && !inc.evaluations && !inc.connaissances) return [];
            var c = ['type', 'titre'];
            if (inc.durees) c.push('duree');
            if (inc.retroactions) c.push('retroaction');
            return c;
        })(),
        productions: (function() {
            var c = ['production', 'ponderation', 'echeance'];
            if (inc.productionsDetail) c.push('grille', 'echelle');
            return c;
        })(),
        liens: inc.liens ? ['objectifsServis', 'liens'] : []
    };
    var colonnes = ['sequence', 'lecon', 'semaine'];
    (ordre || []).forEach(function(id) { colonnes = colonnes.concat(groupes[id] || []); });
    return colonnes;
}

/**
 * Les colonnes qui n'ont de valeur QUE sur une ligne de séance (#416 lot G).
 *
 * ⚠ POURQUOI CETTE LISTE EXISTE, et ce qu'elle a coûté de ne pas exister.
 * `contenu`, `evaluations` et `travailPersonnel` AGRÈGENT les éléments d'une
 * leçon : en granularité « ligne par élément », chaque élément a déjà sa
 * propre ligne, et ces cellules sortent VIDES par conception.
 *
 * Le code le disait ; l'interface, non. Le 12 août, Grégoire a coché ces trois
 * colonnes sur un gabarit en « ligne par élément » et a obtenu un tableau dont
 * la moitié des colonnes étaient vides — sans que rien ne l'avertisse. Un
 * réglage qui ne peut RIEN produire ne doit pas être offert en silence.
 */
var COLONNES_PAR_SEANCE = ['contenu', 'evaluations', 'travailPersonnel'];

/** Cette colonne peut-elle porter une valeur dans cette granularité ? */
function colonneUtileEn(idColonne, granularite) {
    if (granularite === 'seances') return true;
    return COLONNES_PAR_SEANCE.indexOf(idColonne) === -1;
}

/** Le libellé affiché d'une colonne — renommable par gabarit (D8). */
function libelleColonne(id, renommages) {
    if (renommages && renommages[id]) return renommages[id];
    return CATALOGUE_COLONNES[id] ? CATALOGUE_COLONNES[id].libelle : id;
}

function cellulesDeLigne(colonnes, ctx) {
    return colonnes.map(function(id) {
        var col = CATALOGUE_COLONNES[id];
        return nettoyerTSV(col ? col.valeur(ctx) : '');
    });
}

// ---------------------------------------------------------------------------
// LE RENDEUR TABULAIRE UNIQUE
// ---------------------------------------------------------------------------

/**
 * @param {Object} plan     - structure rendue par construirePlan
 * @param {Object} gabarit  - { colonnes: [ids], inclusions, evaluationsSeulement, renommages }
 */
function construireMatrice(plan, gabarit) {
    var colonnes = gabarit.colonnes;
    var inc = gabarit.inclusions;
    var entetes = colonnes.map(function(id) {
        return nettoyerTSV(libelleColonne(id, gabarit.renommages));
    });
    var lignes = [];

    function pousser(ctx) {
        lignes.push(cellulesDeLigne(colonnes, ctx));
    }

    function pousserLecon(seqTitre, lecon) {
        // Granularité « une ligne par séance » : la leçon EST la ligne, et ses
        // éléments sont agrégés dans les cellules au lieu d'avoir chacun la
        // sienne. C'est une autre forme de document, pas une autre profondeur
        // — un calendrier de cours, pas un déroulement.
        if (gabarit.granularite === 'seances') {
            pousser({ seqTitre: seqTitre, lecon: lecon, estLecon: true, agregeSaLecon: true });
            return;
        }

        // Plan de cours : la leçon ne sort que par ses évaluations. Sans
        // évaluation, elle sort quand même — une semaine sans évaluation est
        // une information, pas un vide.
        if (gabarit.evaluationsSeulement) {
            var evals = lecon.elements.filter(function(el) { return el.categorie === 'evaluation'; });
            if (evals.length === 0) {
                pousser({ seqTitre: seqTitre, lecon: lecon, estLecon: false });
                return;
            }
            evals.forEach(function(el) {
                pousser({ seqTitre: seqTitre, lecon: lecon, el: el, estLecon: false });
            });
            return;
        }
        pousser({ seqTitre: seqTitre, lecon: lecon, estLecon: true });
        elementsVisibles(lecon.elements, inc).forEach(function(el) {
            pousser({ seqTitre: seqTitre, lecon: lecon, el: el, estLecon: false });
        });
    }

    // ⚠ En granularité « séance », une ligne EST une rencontre. Ce qui n'est
    // pas une rencontre n'a pas de ligne : ni la séquence sans contenu, ni les
    // éléments posés hors leçon. Les faire sortir quand même produirait des
    // lignes sans date ni séance au milieu d'un calendrier — précisément ce
    // que ce gabarit sert à éviter.
    var parSeance = gabarit.granularite === 'seances';

    plan.sequences.forEach(function(seq) {
        if (seq.lecons.length === 0 && seq.elements.length === 0) {
            if (parSeance) return;
            // `etendue` posé : la colonne Semaine rend l'étendue au lieu d'un
            // numéro. C'est le seul endroit où une ligne n'a ni leçon ni élément.
            pousser({ seqTitre: seq.titre, lecon: null, estLecon: false, etendue: seq.etendue });
            return;
        }
        seq.lecons.forEach(function(lecon) { pousserLecon(seq.titre, lecon); });
        if (!gabarit.evaluationsSeulement && !parSeance) {
            elementsVisibles(seq.elements, inc).forEach(function(el) {
                pousser({ seqTitre: seq.titre, lecon: null, el: el, estLecon: false });
            });
        }
    });

    plan.leconsOrphelines.forEach(function(lecon) { pousserLecon('(Hors séquence)', lecon); });

    // ⚠ UNE LIGNE ENTIÈREMENT VIDE N'EST PAS UNE INFORMATION, c'est un
    // artefact. Elle apparaît quand une leçon n'a AUCUNE des colonnes que ce
    // gabarit-là demande : une leçon sans semaine, sans rang et sans contenu
    // sort, dans un calendrier à six colonnes, comme six cellules vides.
    //
    // Le retrait ne vaut QUE pour ce cas-là. Une leçon qui n'a que sa semaine
    // garde sa ligne : « semaine 5, rien de prévu » se lit, et c'est
    // exactement ce qu'un enseignant veut voir dans son calendrier. Retirer
    // plus large masquerait du travail non planifié — l'inverse du service.
    var nonVides = lignes.filter(function(l) {
        return l.some(function(cellule) { return String(cellule) !== ''; });
    });

    return { entetes: entetes, lignes: nonVides, lignesRetirees: lignes.length - nonVides.length };
}

// ---------------------------------------------------------------------------
// LES DEUX MISES EN FORME TABULAIRES
// ---------------------------------------------------------------------------
//
// La matrice ci-dessus ne sait rien du format : elle dit quelles lignes, avec
// quelles cellules. Ce qui suit ne sait rien du contenu. C'est ce qui permet
// au gabarit Calendrier de sortir en TSV pour le tableur ET en Markdown pour
// un document, sans deux parcours de la carte.

function formaterTSV(matrice) {
    return [matrice.entetes].concat(matrice.lignes).map(function(l) {
        return l.join('\t');
    }).join('\n') + '\n';
}

/**
 * Markdown en SECTIONS — le format qui se colle utilement dans Pages ou Word.
 *
 * ⚠ CE RENDEUR A REMPLACÉ UN TABLEAU MARKDOWN, et le motif vaut d'être gardé.
 * Le lot I produisait `| Semaine | Séance | … |`. Verdict terrain du 12 août :
 * « le tableau md n'est pas vraiment utilisable puisque les caractères | ne
 * sont pas alignés ». Le vrai problème était en dessous : **Pages
 * n'interprète pas le Markdown**. Aligner les barres aurait rendu le texte
 * brut plus joli sans jamais produire un tableau à l'arrivée. Pour un vrai
 * tableau, il y a le TSV et le tableur ; pour un document, il y a ceci.
 *
 * ⚠ LA PREMIÈRE COLONNE TITRE LA SECTION. C'est une règle, pas une devinette :
 * l'utilisateur ordonne ses colonnes (D8), donc il choisit ce qui titre. Les
 * autres colonnes deviennent des champs, et **les cellules vides sont
 * omises** — un document n'a pas de colonnes à respecter.
 */
function formaterMarkdownSections(matrice) {
    var morceaux = [];

    matrice.lignes.forEach(function(cellules) {
        var titre = String(cellules[0] == null ? '' : cellules[0]).trim();
        var enTete = matrice.entetes[0] || '';
        morceaux.push('### ' + (titre ? enTete + ' ' + titre : enTete + ' —'));
        morceaux.push('');

        var champs = [];
        for (var i = 1; i < cellules.length; i++) {
            var v = String(cellules[i] == null ? '' : cellules[i]).trim();
            if (!v) continue;
            champs.push('- **' + matrice.entetes[i] + '** : ' + v);
        }
        if (champs.length === 0) champs.push('- *(rien de prévu)*');

        morceaux = morceaux.concat(champs);
        morceaux.push('');
    });

    return morceaux.join('\n');
}

function rendreTableau(plan, gabarit) {
    return formaterTSV(construireMatrice(plan, gabarit));
}

/** Gabarit générique d'un niveau historique. */
function gabaritDUsine(niveauId) {
    return {
        colonnes: COLONNES_GENERIQUES[niveauId],
        inclusions: INCLUSIONS[niveauId],
        granularite: 'noeuds',
        evaluationsSeulement: niveauId === 'sommaire',
        renommages: null
    };
}

/**
 * Complète un gabarit partiel. Les défauts sont ceux du document le plus
 * riche — un gabarit qui ne dit rien montre tout, plutôt que de masquer en
 * silence ce qu'on a oublié de demander.
 */
function normaliserGabarit(gabarit) {
    var g = gabarit || {};
    var colonnes = Array.isArray(g.colonnes) ? g.colonnes.filter(function(id) {
        return !!CATALOGUE_COLONNES[id];
    }) : [];
    return {
        colonnes: colonnes.length > 0 ? colonnes : COLONNES_GENERIQUES.alignement,
        inclusions: g.inclusions || INCLUSIONS.alignement,
        granularite: g.granularite === 'seances' ? 'seances' : 'noeuds',
        evaluationsSeulement: !!g.evaluationsSeulement,
        renommages: g.renommages || null
    };
}

/**
 * LA porte des formats tabulaires (#416 lot G). Un gabarit est une liste
 * ordonnée de colonnes, une granularité, et des libellés renommables.
 *
 * @param {Object} gabarit - { colonnes, granularite, inclusions, renommages }
 * @param {Object} [options] - passées à construirePlan (dont `groupeCoursId`,
 *   qui commande la colonne Date — D9)
 */
function genererTableau(gabarit, options) {
    var plan = construirePlan(options);
    if (!plan) return null;
    return rendreTableau(plan, normaliserGabarit(gabarit));
}

function rendreTSV(plan, niveauId) {
    return rendreTableau(plan, gabaritDUsine(niveauId));
}

// ---------------------------------------------------------------------------
// FORMAT MARKDOWN
// ---------------------------------------------------------------------------

// Ordre HISTORIQUE des presets Markdown (contrat du harnais 424) : objectifs,
// **Évaluation** (productions), **Déroulement**, **Liens**.
var ORDRE_MD_PRESET = ['objectifs', 'productions', 'deroulement', 'liens'];

function rendreLeconMD(lecon, inc, ordre) {
    var champs = [];
    if (lecon.semaine !== null) champs.push('Sem. ' + lecon.semaine);
    if (inc.durees && lecon.dureeRollup) champs.push('Σ ' + formatDuree(lecon.dureeRollup));
    var marqueur = champs.length ? ' [Leçon | ' + champs.join(' | ') + ']' : ' [Leçon]';
    var md = '### ' + lecon.titre + marqueur + '\n\n';

    var sections = {
        objectifs: function() {
            if (!inc.objectifs) return;
            if (lecon.objectifs.length > 0) {
                md += '**Objectifs** :\n';
                lecon.objectifs.forEach(function(o) { md += '- ' + o + '\n'; });
                md += '\n';
            } else if (lecon.objectifDerive) {
                md += '**Objectif** : ' + lecon.objectifDerive.split('\n').join(' ') + '\n\n';
            }
        },
        productions: function() {
            // Les productions rattachées de la leçon — le contrat du sommaire.
            var partiesEval = [];
            lecon.elements.forEach(function(el) {
                if (el.production) partiesEval.push(ligneProduction(el.production, inc.productionsDetail));
            });
            if (partiesEval.length > 0) {
                md += '**Évaluation** : ' + partiesEval.join(' ; ') + '\n\n';
            }
        },
        deroulement: function() {
            var visibles = elementsVisibles(lecon.elements, inc);
            if (visibles.length === 0 || !niveauMontreDesLignes(visibles, inc)) return;
            md += '**Déroulement** :\n';
            visibles.forEach(function(el) {
                if (el.categorie === 'evaluation' && !evalDansDeroulement(inc)) return; // déjà en Évaluation
                var duree = inc.durees && el.duree ? ' (' + formatDuree(el.duree) + ')' : '';
                md += '- [' + el.label + '] ' + el.titre + duree;
                var details = [];
                if (inc.retroactions && el.retroaction) details.push('Rétroaction : ' + libelleRetroaction(el.retroaction));
                if (inc.retroactions && el.retroactionRendu) details.push('Rétroaction sur le rendu : ' + libelleRetroaction(el.retroactionRendu));
                if (details.length) md += ' — ' + details.join(' · ');
                md += '\n';
                if (inc.liens && el.objectifsServis.length > 0) {
                    md += '    - sert : ' + el.objectifsServis.join(' ; ') + '\n';
                }
                if (inc.liens) {
                    formaterLiens(el.liens).forEach(function(l) { md += '    - ' + l + '\n'; });
                }
            });
            md += '\n';
        },
        liens: function() {
            if (!inc.liens || lecon.liens.length === 0) return;
            md += '**Liens** :\n';
            formaterLiens(lecon.liens).forEach(function(l) { md += '- ' + l + '\n'; });
            md += '\n';
        }
    };

    (ordre || ORDRE_MD_PRESET).forEach(function(id) {
        if (sections[id]) sections[id]();
    });
    md += '---\n\n';
    return md;
}

// Les presets ne posent pas `evaluations` : les lignes ◆ du Déroulement
// suivent alors `activites` (comportement historique — au sommaire, l'éval ne
// sort que par la ligne **Évaluation**). Le Personnalisé pose le drapeau.
function evalDansDeroulement(inc) {
    return inc.evaluations !== undefined ? inc.evaluations : inc.activites;
}

function niveauMontreDesLignes(visibles, inc) {
    return visibles.some(function(el) {
        return el.categorie !== 'evaluation' || evalDansDeroulement(inc);
    });
}

function rendreMarkdown(plan, niveauId, incPerso, ordrePerso) {
    var inc = incPerso || INCLUSIONS[niveauId];
    var ordre = ordrePerso || null;
    var md = '# Plan de cours — ' + plan.nomCarte + '\n';
    md += '> Niveau : ' + labelNiveau(niveauId) + ' · Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n\n---\n\n';

    plan.sequences.forEach(function(seq) {
        var etendue = carte().formaterEtendue(seq.etendue);
        var champs = [];
        if (etendue) champs.push(etendue);
        if (inc.durees && seq.dureeRollup) champs.push('Σ ' + formatDuree(seq.dureeRollup));
        var marqueur = champs.length ? ' [Séquence | ' + champs.join(' | ') + ']' : ' [Séquence]';
        md += '## ' + seq.titre + marqueur + '\n\n';
        if (inc.liens && seq.liens.length > 0) {
            formaterLiens(seq.liens).forEach(function(l) { md += '- ' + l + '\n'; });
            md += '\n';
        }
        seq.lecons.forEach(function(lecon) { md += rendreLeconMD(lecon, inc, ordre); });
        var horsLecon = elementsVisibles(seq.elements, inc);
        if (horsLecon.length > 0) {
            md += '**Hors leçon** :\n';
            horsLecon.forEach(function(el) {
                var duree = inc.durees && el.duree ? ' (' + formatDuree(el.duree) + ')' : '';
                md += '- [' + el.label + '] ' + el.titre + duree;
                if (el.production) md += ' — ' + ligneProduction(el.production, inc.productionsDetail);
                md += '\n';
            });
            md += '\n';
        }
    });

    if (plan.leconsOrphelines.length > 0) {
        md += '## Leçons hors séquence\n\n';
        plan.leconsOrphelines.forEach(function(lecon) { md += rendreLeconMD(lecon, inc, ordre); });
    }
    return md;
}

// ---------------------------------------------------------------------------
// PORTE PUBLIQUE
// ---------------------------------------------------------------------------

/**
 * LE générateur (D5) : un plan, une profondeur, un format.
 * @param {string} niveauId  sommaire | deroulement | alignement | personnalise
 * @param {string} formatId  texte | tsv | markdown
 * @param {Object} [configEssai]  #431 — config non normalisée à ESSAYER
 *   (aperçu de la modale) au lieu de la préférence mémorisée
 * @returns {string|null} le document, ou null sans carte
 */
function genererExport(niveauId, formatId, configEssai, options) {
    var plan;

    // ⚠ LE NIVEAU « PERSONNALISÉ » DE #431 N'EXISTE PLUS (#416 lot H). Pas
    // d'alias, pas de repli : son réglage unique a MIGRÉ en gabarit nommé, et
    // les gabarits se génèrent par `genererDepuisGabarit`. Sans ce retrait,
    // l'application porterait deux mécanismes de configuration d'export —
    // l'empilement exact que D5 refuse.
    if (niveauId === 'calendrier') {
        // Le format Texte n'est pas proposé pour ce gabarit ; le demander
        // quand même rend null plutôt qu'un document dégradé silencieux.
        if (GABARIT_CALENDRIER.formats.indexOf(formatId) === -1) return null;
        plan = construirePlan(options);
        if (!plan) return null;
        var matrice = construireMatrice(plan, normaliserGabarit(GABARIT_CALENDRIER));
        return formatId === 'markdown' ? formaterMarkdownSections(matrice) : formaterTSV(matrice);
    }

    if (!INCLUSIONS[niveauId]) return null;
    plan = construirePlan();
    if (!plan) return null;
    if (formatId === 'texte') return rendreTexte(plan, niveauId);
    if (formatId === 'tsv') return rendreTSV(plan, niveauId);
    if (formatId === 'markdown') return rendreMarkdown(plan, niveauId);
    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// LES GABARITS NOMMÉS (#416 lot H)
//
// L'hypothèse posée par Grégoire lui-même le 8 août au journal
// `USAGE-FORMATS.md` — « un seul réglage suffit-il, ou faudra-t-il des
// gabarits nommés ? » — a été levée par son usage le 12 août : il compose
// avec des exigences départementales et des habitudes de présentation qui ne
// sont pas les siennes. Un réglage unique ne couvre pas ça.
//
// ⚠ UN GABARIT EST UN TABLEAU (décision du 12 août). Colonnes ordonnées,
// granularité, libellés renommables — pour TSV et Markdown-tableau. Les trois
// documents en prose (Plan de cours, En classe, Preuve d'alignement) ne se
// configurent pas : ils ont leur forme, et c'est elle qu'on choisit.
//
// ⚠ ZÉRO-DETTE : le « Personnalisé » de #431 ne cohabite pas, il MIGRE. Sans
// ça l'application porterait deux mécanismes de configuration d'export —
// l'empilement exact que D5 refuse.
// ═══════════════════════════════════════════════════════════════════════════

var CLE_GABARITS = 'exportGabarits';
var CLE_PERSONNALISE_HERITE = 'exportPlanPersonnalise';

/** Les gabarits génériques : dans le CODE, jamais persistés — on n'édite pas ce
 *  qu'on ne modifie pas. Ils se DUPLIQUENT pour devenir modifiables. */
function gabaritsGeneriques() {
    return [
        { id: 'sommaire', nom: 'Plan de cours', generique: true,
          granularite: 'noeuds', colonnes: COLONNES_GENERIQUES.sommaire.slice(), renommages: null },
        { id: 'deroulement', nom: 'En classe', generique: true,
          granularite: 'noeuds', colonnes: COLONNES_GENERIQUES.deroulement.slice(), renommages: null },
        { id: 'alignement', nom: 'Preuve d’alignement', generique: true,
          granularite: 'noeuds', colonnes: COLONNES_GENERIQUES.alignement.slice(), renommages: null },
        { id: 'calendrier', nom: 'Calendrier', generique: true,
          granularite: 'seances', colonnes: GABARIT_CALENDRIER.colonnes.slice(), renommages: null }
    ];
}

function lirePreference(cle, defaut) {
    try {
        if (typeof window.obtenirPreference !== 'function') return defaut;
        var v = window.obtenirPreference(cle);
        return v === undefined || v === null ? defaut : v;
    } catch (e) { return defaut; }
}

function ecrirePreference(cle, valeur) {
    try {
        if (typeof window.definirPreference === 'function') window.definirPreference(cle, valeur);
    } catch (e) { /* une préférence non écrite ne doit jamais bloquer un export */ }
}

/**
 * Remet un gabarit venu du stockage en état d'être utilisé.
 *
 * ⚠ Tout ce qui vient du stockage est SUSPECT : un codex réimporté, un
 * gabarit écrit par une version antérieure, une clé bricolée à la main. On ne
 * fait pas confiance, on normalise — et un gabarit qui n'a plus aucune colonne
 * connue est écarté plutôt que rendu vide.
 */
function normaliserGabaritNomme(brut) {
    if (!brut || typeof brut !== 'object') return null;
    var id = typeof brut.id === 'string' && brut.id ? brut.id : null;
    if (!id) return null;

    var colonnes = (Array.isArray(brut.colonnes) ? brut.colonnes : []).filter(function(c) {
        return !!CATALOGUE_COLONNES[c];
    });
    if (colonnes.length === 0) return null;

    var renommages = null;
    if (brut.renommages && typeof brut.renommages === 'object') {
        renommages = {};
        Object.keys(brut.renommages).forEach(function(k) {
            // Un renommage ne vaut que pour une colonne qui existe ET qui est
            // dans ce gabarit : sinon il survit à la colonne qu'il nommait.
            if (colonnes.indexOf(k) !== -1 && typeof brut.renommages[k] === 'string') {
                renommages[k] = brut.renommages[k];
            }
        });
        if (Object.keys(renommages).length === 0) renommages = null;
    }

    return {
        id: id,
        nom: typeof brut.nom === 'string' && brut.nom.trim() ? brut.nom.trim() : 'Gabarit sans nom',
        generique: false,
        granularite: brut.granularite === 'seances' ? 'seances' : 'noeuds',
        colonnes: colonnes,
        renommages: renommages
    };
}

/**
 * LA MIGRATION du réglage unique de #431 vers un gabarit nommé.
 *
 * ⚠ IDEMPOTENTE ET NON DESTRUCTIVE DANS CET ORDRE : on crée le gabarit
 * d'abord, on efface l'ancienne préférence ensuite. Si l'écriture du gabarit
 * échoue, l'ancienne survit et la migration se rejouera. L'inverse perdrait
 * le réglage de Grégoire pour un export raté.
 *
 * ⚠ Elle ne s'exécute qu'UNE fois : l'ancienne clé est remise à null, donc
 * relire ne recrée rien. Un utilisateur qui supprime ensuite le gabarit migré
 * a supprimé son gabarit — on ne le lui réimpose pas au prochain démarrage.
 *
 * Fidélité : la config #431 décrit des contenus et un ordre de sections ;
 * `colonnesPersonnalisees` est exactement la fonction qui en déduisait déjà
 * les colonnes du TSV. La migration réutilise cette traduction plutôt que
 * d'en inventer une seconde.
 */
function migrerPersonnaliseEnGabarit(gabaritsExistants) {
    var herite = lirePreference(CLE_PERSONNALISE_HERITE, null);
    if (!herite || typeof herite !== 'object') return gabaritsExistants;

    var cfg = normaliserConfigPersonnalisee(herite);
    var colonnes = colonnesPersonnalisees(incDepuisConfig(cfg), cfg.ordre);

    var migre = {
        id: 'gab-migre-431',
        nom: 'Mon export personnalisé',
        generique: false,
        granularite: 'noeuds',
        colonnes: colonnes,
        renommages: null
    };

    // Une deuxième migration ne doit pas produire un doublon : si le gabarit
    // issu de #431 est déjà là, on efface simplement l'ancienne clé.
    var deja = gabaritsExistants.some(function(g) { return g.id === migre.id; });
    var suite = deja ? gabaritsExistants : gabaritsExistants.concat([migre]);

    ecrirePreference(CLE_GABARITS, suite.map(serialiserGabarit));
    ecrirePreference(CLE_PERSONNALISE_HERITE, null);   // l'ancien ne cohabite pas

    return suite;
}

function serialiserGabarit(g) {
    return {
        id: g.id, nom: g.nom, granularite: g.granularite,
        colonnes: g.colonnes.slice(), renommages: g.renommages
    };
}

/** Les gabarits de l'utilisateur, migration comprise. Jamais les génériques. */
function lireGabaritsUtilisateur() {
    var bruts = lirePreference(CLE_GABARITS, []);
    var gabarits = (Array.isArray(bruts) ? bruts : [])
        .map(normaliserGabaritNomme)
        .filter(Boolean);
    return migrerPersonnaliseEnGabarit(gabarits);
}

/** Tous les gabarits offerts : génériques d'abord, puis ceux de l'utilisateur. */
function listerGabarits() {
    return gabaritsGeneriques().concat(lireGabaritsUtilisateur());
}

function trouverGabarit(id) {
    return listerGabarits().find(function(g) { return g.id === id; }) || null;
}

function ecrireGabaritsUtilisateur(gabarits) {
    ecrirePreference(CLE_GABARITS, gabarits.map(serialiserGabarit));
    return gabarits;
}

/** Un identifiant qui ne dépend ni de l'horloge ni du hasard : le magasin suffit. */
function prochainIdGabarit(existants) {
    var n = 1;
    var pris = {};
    existants.forEach(function(g) { pris[g.id] = true; });
    while (pris['gab-' + n]) n++;
    return 'gab-' + n;
}

/**
 * Duplique un gabarit — le SEUL chemin pour en obtenir un modifiable.
 *
 * ⚠ Les gabarits génériques ne se modifient pas sur place : ce sont les
 * documents que l'application promet, et un utilisateur qui casse « Plan de
 * cours » n'a aucun moyen de le retrouver. Dupliquer coûte un clic et rend
 * l'original intouchable.
 */
function dupliquerGabarit(idSource, nomVoulu) {
    var source = trouverGabarit(idSource);
    if (!source) return null;

    var utilisateur = lireGabaritsUtilisateur();
    var copie = {
        id: prochainIdGabarit(listerGabarits()),
        nom: (nomVoulu && String(nomVoulu).trim()) || (source.nom + ' (copie)'),
        generique: false,
        granularite: source.granularite,
        colonnes: source.colonnes.slice(),
        renommages: source.renommages ? Object.assign({}, source.renommages) : null
    };
    ecrireGabaritsUtilisateur(utilisateur.concat([copie]));
    return copie;
}

/** Enregistre les modifications d'un gabarit de l'utilisateur. */
function enregistrerGabarit(gabarit) {
    var propre = normaliserGabaritNomme(gabarit);
    if (!propre) return null;
    // ⚠ Un gabarit générique ne s'écrase pas, même si l'appelant insiste.
    if (gabaritsGeneriques().some(function(g) { return g.id === propre.id; })) return null;

    var utilisateur = lireGabaritsUtilisateur();
    var i = utilisateur.findIndex(function(g) { return g.id === propre.id; });
    if (i === -1) utilisateur.push(propre);
    else utilisateur[i] = propre;
    ecrireGabaritsUtilisateur(utilisateur);
    return propre;
}

function renommerGabarit(id, nom) {
    var g = lireGabaritsUtilisateur().find(function(x) { return x.id === id; });
    if (!g) return null;
    return enregistrerGabarit(Object.assign({}, g, { nom: nom }));
}

function supprimerGabarit(id) {
    var utilisateur = lireGabaritsUtilisateur();
    var reste = utilisateur.filter(function(g) { return g.id !== id; });
    if (reste.length === utilisateur.length) return false;
    ecrireGabaritsUtilisateur(reste);
    return true;
}

/**
 * Le document d'un gabarit, dans le format demandé.
 *
 * ⚠ Un gabarit ne produit QUE des tableaux (décision du 12 août). Demander du
 * Texte rend null plutôt qu'un document dégradé — c'est la même règle que
 * pour le Calendrier, et pour la même raison.
 */
function genererDepuisGabarit(idGabarit, formatId, options) {
    var gabarit = trouverGabarit(idGabarit);
    if (!gabarit) return null;
    if (formatId !== 'tsv' && formatId !== 'markdown') return null;

    var plan = construirePlan(options);
    if (!plan) return null;

    var matrice = construireMatrice(plan, normaliserGabarit({
        colonnes: gabarit.colonnes,
        granularite: gabarit.granularite,
        renommages: gabarit.renommages,
        inclusions: INCLUSIONS[gabarit.id] || INCLUSIONS.alignement,
        evaluationsSeulement: gabarit.id === 'sommaire'
    }));
    return formatId === 'markdown' ? formaterMarkdownSections(matrice) : formaterTSV(matrice);
}

/** Nom de fichier proposé — « <carte>-<niveau><ext> », caractères sûrs. */
function nomFichierExport(niveauId, formatId) {
    var plan = { nomCarte: 'alignement' };
    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    if (index && index.cartes) {
        var infos = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (infos && infos.nom) plan.nomCarte = infos.nom;
    }
    var format = FORMATS.find(function(f) { return f.id === formatId; });
    var propre = plan.nomCarte.replace(/[^a-zA-Z0-9À-ſ _-]/g, '');
    return propre + '-' + niveauId + (format ? format.extension : '.txt');
}

window.planificationExport = {
    NIVEAUX: NIVEAUX,
    FORMATS: FORMATS,
    INCLUSIONS: INCLUSIONS,
    construirePlan: construirePlan,
    genererExport: genererExport,
    nomFichierExport: nomFichierExport,
    // #416 lot C — la date dérivée. `groupesCoursDeLaCarte` sert à POSER la
    // question du groupe quand il y en a plusieurs ; c'est la présence d'une
    // colonne Date qui la déclenche, pas l'ouverture du panneau (D9).
    groupesCoursDeLaCarte: groupesCoursDeLaCarte,
    construireHoraireDeLecons: construireHoraireDeLecons,
    dateDeLecon: dateDeLecon,
    // #695 — la date dans l'Inspecteur : une ligne par groupe du cours.
    coursDeLaCarteActive: coursDeLaCarteActive,
    horairesDesGroupesDuCours: horairesDesGroupesDuCours,
    lignesDateDeLecon: lignesDateDeLecon,
    // #416 lot G — le générateur à trois axes : granularité × colonnes × format.
    CATALOGUE_COLONNES: CATALOGUE_COLONNES,
    COLONNES_PAR_SEANCE: COLONNES_PAR_SEANCE,
    colonneUtileEn: colonneUtileEn,
    COLONNES_GENERIQUES: COLONNES_GENERIQUES,
    genererTableau: genererTableau,
    libelleColonne: libelleColonne,
    // #416 lot I — le gabarit générique « Calendrier ».
    GABARIT_CALENDRIER: GABARIT_CALENDRIER,
    formaterMarkdownSections: formaterMarkdownSections,
    construireMatrice: construireMatrice,
    // #416 lot H — les gabarits nommés.
    listerGabarits: listerGabarits,
    trouverGabarit: trouverGabarit,
    dupliquerGabarit: dupliquerGabarit,
    enregistrerGabarit: enregistrerGabarit,
    renommerGabarit: renommerGabarit,
    supprimerGabarit: supprimerGabarit,
    genererDepuisGabarit: genererDepuisGabarit,
    // #431 — niveau Personnalisé : constantes et portes de la modale.
    // ⚠ Ce qui reste de #431 sert UNIQUEMENT à la migration : traduire une
    // config héritée en colonnes. Plus rien n'en dépend à l'écran.
    normaliserConfigPersonnalisee: normaliserConfigPersonnalisee
};

})();
