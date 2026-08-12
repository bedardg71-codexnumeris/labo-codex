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
    { id: 'personnalise', label: 'Personnalisé' }
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
        .map(function(g) { return { id: g.id, nom: g.nom || g.id }; });
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
        (seq.enfants || []).forEach(function(eid) {
            var enf = etat.noeuds.get(eid);
            if (!enf || enf.type === 'sequence') return; // sections propres plus bas
            if (enf.type === 'lecon') s.lecons.push(construireLecon(enf, horaire));
            else s.elements.push(construireElement(enf, contexteSeq));
        });
        return s;
    });

    var leconsOrphelines = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(construireLecon(nd, horaire));
    }

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

/** La config mémorisée (préférence), normalisée — ou le départ « En classe ». */
function lireConfigPersonnalisee() {
    var brute = null;
    try {
        if (typeof window.obtenirPreference === 'function') {
            brute = window.obtenirPreference('exportPlanPersonnalise');
        }
    } catch (e) { brute = null; }
    return normaliserConfigPersonnalisee(brute);
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

// ⚠ UNE seule colonne « Semaine » (#152, capture Numbers de Grégoire) : la
// ligne de séquence y met son ÉTENDUE (« 3–5 »), la ligne de leçon son numéro.
// Deux colonnes disaient deux fois la même dérivation — illisible en tableau.
var COLONNES_TSV = {
    sommaire: ['Séquence', 'Leçon', 'Semaine', 'Évaluation', 'Pondération (%)', 'Échéance'],
    deroulement: ['Séquence', 'Leçon', 'Semaine', 'Type', 'Titre', 'Durée (min)', 'Rétroaction', 'Production', 'Pondération (%)', 'Échéance', 'Objectifs'],
    alignement: ['Séquence', 'Leçon', 'Semaine', 'Type', 'Titre', 'Durée (min)', 'Rétroaction', 'Production', 'Pondération (%)', 'Échéance', 'Objectifs', 'Objectifs servis', 'Liens', 'Grille', 'Échelle']
};

function etendueTexteTSV(etendue) {
    if (!etendue) return '';
    return etendue.debut + (etendue.fin !== etendue.debut ? '–' + etendue.fin : '');
}

function rendreTSV(plan, niveauId) {
    var inc = INCLUSIONS[niveauId];
    var lignes = [COLONNES_TSV[niveauId].join('\t')];

    function pousser(cellules) {
        lignes.push(cellules.map(nettoyerTSV).join('\t'));
    }

    function baseSeq(seq) {
        return [seq.titre];
    }

    function ligneElement(base, lecon, el) {
        var prod = el.production;
        if (niveauId === 'sommaire') {
            if (el.categorie !== 'evaluation') return;
            pousser(base.concat([
                lecon ? lecon.titre : '',
                lecon && lecon.semaine !== null ? lecon.semaine : '',
                prod ? prod.nomProduction : el.titre,
                prod ? (prod.ponderation || 0) : '',
                prod && prod.dateEcheance ? prod.dateEcheance : ''
            ]));
            return;
        }
        var retro = el.retroaction
            ? libelleRetroaction(el.retroaction)
            : (el.retroactionRendu ? 'Sur le rendu : ' + libelleRetroaction(el.retroactionRendu) : '');
        var cellules = base.concat([
            lecon ? lecon.titre : '',
            lecon && lecon.semaine !== null ? lecon.semaine : '',
            el.label,
            el.titre,
            el.duree || '',
            inc.retroactions ? retro : '',
            prod ? prod.nomProduction : '',
            prod ? (prod.ponderation || 0) : '',
            prod && prod.dateEcheance ? prod.dateEcheance : '',
            '' // Objectifs — portés par la ligne Leçon
        ]);
        if (niveauId === 'alignement') {
            cellules = cellules.concat([
                el.objectifsServis.join(' ; '),
                formaterLiens(el.liens).join(' ; '),
                prod ? prod.nomGrille : '',
                prod ? prod.nomEchelle : ''
            ]);
        }
        pousser(cellules);
    }

    function ligneLecon(base, lecon) {
        if (niveauId === 'sommaire') {
            var evals = lecon.elements.filter(function(el) { return el.categorie === 'evaluation'; });
            if (evals.length === 0) {
                pousser(base.concat([lecon.titre, lecon.semaine !== null ? lecon.semaine : '', '', '', '']));
            } else {
                evals.forEach(function(el) { ligneElement(base, lecon, el); });
            }
            return;
        }
        var objectifs = lecon.objectifs.length > 0
            ? lecon.objectifs.join(' ; ')
            : (lecon.objectifDerive || '');
        var cellules = base.concat([
            lecon.titre,
            lecon.semaine !== null ? lecon.semaine : '',
            'Leçon',
            lecon.titre,
            lecon.dureeRollup || '',
            '',
            '', '', '',
            inc.objectifs ? objectifs : ''
        ]);
        if (niveauId === 'alignement') {
            cellules = cellules.concat(['', formaterLiens(lecon.liens).join(' ; '), '', '']);
        }
        pousser(cellules);
        elementsVisibles(lecon.elements, inc).forEach(function(el) {
            ligneElement(base, lecon, el);
        });
    }

    plan.sequences.forEach(function(seq) {
        var base = baseSeq(seq);
        var aucunContenu = seq.lecons.length === 0 && seq.elements.length === 0;
        if (aucunContenu) {
            // #152 : l'étendue de la séquence vit dans LA colonne Semaine.
            var vide = COLONNES_TSV[niveauId].length - 3;
            pousser(base.concat(['', etendueTexteTSV(seq.etendue)]).concat(new Array(vide).fill('')));
            return;
        }
        seq.lecons.forEach(function(lecon) { ligneLecon(base, lecon); });
        elementsVisibles(seq.elements, inc).forEach(function(el) { ligneElement(base, null, el); });
    });

    plan.leconsOrphelines.forEach(function(lecon) {
        ligneLecon(['(Hors séquence)'], lecon);
    });

    return lignes.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// FORMAT TSV — PERSONNALISÉ (#431) : colonnes dynamiques par groupes ordonnés
// ---------------------------------------------------------------------------
// Préfixe FIXE (Séquence | Leçon | Semaine — la structure est la carte), puis
// les groupes de colonnes suivent l'ordre des sections de la config.

function groupesColonnesTSV(inc) {
    return {
        objectifs: inc.objectifs ? ['Objectifs'] : [],
        deroulement: (function() {
            if (!inc.activites && !inc.evaluations && !inc.connaissances) return [];
            var c = ['Type', 'Titre'];
            if (inc.durees) c.push('Durée (min)');
            if (inc.retroactions) c.push('Rétroaction');
            return c;
        })(),
        productions: (function() {
            var c = ['Production', 'Pondération (%)', 'Échéance'];
            if (inc.productionsDetail) c.push('Grille', 'Échelle');
            return c;
        })(),
        liens: inc.liens ? ['Objectifs servis', 'Liens'] : []
    };
}

function rendreTSVPersonnalise(plan, inc, ordre) {
    var groupes = groupesColonnesTSV(inc);
    var colonnes = ['Séquence', 'Leçon', 'Semaine'];
    ordre.forEach(function(id) { colonnes = colonnes.concat(groupes[id] || []); });
    var lignes = [colonnes.join('\t')];

    function cellulesDe(ctx) {
        // ctx : { seqTitre, lecon, el, estLecon }
        var valeurs = {
            objectifs: function() {
                if (!ctx.estLecon) return [''];
                return [ctx.lecon.objectifs.length > 0
                    ? ctx.lecon.objectifs.join(' ; ')
                    : (ctx.lecon.objectifDerive || '')];
            },
            deroulement: function() {
                var c;
                if (ctx.estLecon) c = ['Leçon', ctx.lecon.titre];
                else c = [ctx.el.label, ctx.el.titre];
                if (inc.durees) c.push(ctx.estLecon ? (ctx.lecon.dureeRollup || '') : (ctx.el.duree || ''));
                if (inc.retroactions) {
                    var retro = '';
                    if (!ctx.estLecon) {
                        if (ctx.el.retroaction) retro = libelleRetroaction(ctx.el.retroaction);
                        else if (ctx.el.retroactionRendu) retro = 'Sur le rendu : ' + libelleRetroaction(ctx.el.retroactionRendu);
                    }
                    c.push(retro);
                }
                return c;
            },
            productions: function() {
                var prod = !ctx.estLecon && ctx.el.production;
                var c = [
                    prod ? prod.nomProduction : '',
                    prod ? (prod.ponderation || 0) : '',
                    prod && prod.dateEcheance ? prod.dateEcheance : ''
                ];
                if (inc.productionsDetail) c.push(prod ? prod.nomGrille : '', prod ? prod.nomEchelle : '');
                return c;
            },
            liens: function() {
                if (ctx.estLecon) return ['', formaterLiens(ctx.lecon.liens).join(' ; ')];
                return [ctx.el.objectifsServis.join(' ; '), formaterLiens(ctx.el.liens).join(' ; ')];
            }
        };
        var cellules = [
            ctx.seqTitre,
            ctx.lecon ? ctx.lecon.titre : '',
            ctx.lecon && ctx.lecon.semaine !== null ? ctx.lecon.semaine : ''
        ];
        ordre.forEach(function(id) {
            if ((groupes[id] || []).length > 0) cellules = cellules.concat(valeurs[id]());
        });
        lignes.push(cellules.map(nettoyerTSV).join('\t'));
    }

    function pousserLecon(seqTitre, lecon) {
        cellulesDe({ seqTitre: seqTitre, lecon: lecon, estLecon: true });
        elementsVisibles(lecon.elements, inc).forEach(function(el) {
            cellulesDe({ seqTitre: seqTitre, lecon: lecon, el: el, estLecon: false });
        });
    }

    plan.sequences.forEach(function(seq) {
        if (seq.lecons.length === 0 && seq.elements.length === 0) {
            var vides = colonnes.length - 3;
            lignes.push([nettoyerTSV(seq.titre), '', etendueTexteTSV(seq.etendue)]
                .concat(new Array(vides).fill('')).join('\t'));
            return;
        }
        seq.lecons.forEach(function(lecon) { pousserLecon(seq.titre, lecon); });
        elementsVisibles(seq.elements, inc).forEach(function(el) {
            cellulesDe({ seqTitre: seq.titre, lecon: null, el: el, estLecon: false });
        });
    });
    plan.leconsOrphelines.forEach(function(lecon) { pousserLecon('(Hors séquence)', lecon); });

    return lignes.join('\n') + '\n';
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
function genererExport(niveauId, formatId, configEssai) {
    var plan;
    if (niveauId === 'personnalise') {
        var cfg = configEssai ? normaliserConfigPersonnalisee(configEssai) : lireConfigPersonnalisee();
        var inc = incDepuisConfig(cfg);
        plan = construirePlan();
        if (!plan) return null;
        if (formatId === 'texte') return rendreTexte(plan, niveauId, inc, cfg.ordre);
        if (formatId === 'tsv') return rendreTSVPersonnalise(plan, inc, cfg.ordre);
        if (formatId === 'markdown') return rendreMarkdown(plan, niveauId, inc, cfg.ordre);
        return null;
    }
    if (!INCLUSIONS[niveauId]) return null;
    plan = construirePlan();
    if (!plan) return null;
    if (formatId === 'texte') return rendreTexte(plan, niveauId);
    if (formatId === 'tsv') return rendreTSV(plan, niveauId);
    if (formatId === 'markdown') return rendreMarkdown(plan, niveauId);
    return null;
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
    // #431 — niveau Personnalisé : constantes et portes de la modale.
    SECTIONS_PLAN: SECTIONS_PLAN,
    CONTENUS_PLAN: CONTENUS_PLAN,
    configDepuisPreset: configDepuisPreset,
    normaliserConfigPersonnalisee: normaliserConfigPersonnalisee,
    lireConfigPersonnalisee: lireConfigPersonnalisee
};

})();
