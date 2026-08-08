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

   ⚠ RÉTROACTIONS — deux porteurs, priorité au nœud (contrainte D2) : tant que
   la migration du Lot F n'a pas eu lieu, la rétroaction FORMATIVE d'une
   activité vit dans planification_seances[<carte>::<lecon>].activites ; le
   générateur lit d'abord metadata.retroaction du nœud, puis ce porteur
   historique. Le Lot F devient ainsi un basculement sans retouche ici.

   Export: window.planificationExport
   =============================== */

(function() {
'use strict';

// Niveaux nommés par leur USAGE (D4) — l'id est technique, le label est l'UX.
var NIVEAUX = [
    { id: 'sommaire',    label: 'Plan de cours' },
    { id: 'deroulement', label: 'En classe' },
    { id: 'alignement',  label: 'Preuve d’alignement' }
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

function construireLecon(nd) {
    var c = carte();
    var objectifs = c.objectifsDeLeconParId(nd.id); // [{id, texte}]
    var objectifsParId = {};
    objectifs.forEach(function(o) { objectifsParId[o.id] = o.texte; });

    var contexte = {
        productions: chargerProductionsUneFois(),
        activitesLegacy: activitesLegacyDeLecon(nd.id),
        objectifsParId: objectifsParId
    };

    var lecon = {
        id: nd.id,
        titre: nd.titre || 'Sans titre',
        semaine: c.semaineDeLecon(nd),
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
function construirePlan() {
    var c = carte();
    if (!c || !c.etat) return null;
    _productionsCache = null;

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
            if (enf.type === 'lecon') s.lecons.push(construireLecon(enf));
            else s.elements.push(construireElement(enf, contexteSeq));
        });
        return s;
    });

    var leconsOrphelines = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(construireLecon(nd));
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
        if (el.categorie === 'evaluation') return true;
        if (el.categorie === 'activite') return inc.activites;
        if (el.categorie === 'connaissance') return inc.connaissances;
        return inc.connaissances; // « autre » (idée maîtresse posée là…) : niveau preuve
    });
}

// ---------------------------------------------------------------------------
// FORMAT TEXTE
// ---------------------------------------------------------------------------

function rendreElementTexte(el, inc, indent) {
    var txt = '';
    var duree = inc.durees && el.duree ? ' (' + formatDuree(el.duree) + ')' : '';
    var marqueur = el.categorie === 'evaluation' ? '◆' : '•';
    txt += indent + marqueur + ' [' + el.label + '] ' + el.titre + duree + '\n';
    if (el.production) {
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

function rendreLeconTexte(lecon, inc) {
    var duree = inc.durees && lecon.dureeRollup ? ' — Σ ' + formatDuree(lecon.dureeRollup) : '';
    var sem = lecon.semaine !== null ? ' (Sem. ' + lecon.semaine + ')' : '';
    var txt = '\n  ┌ LEÇON : ' + lecon.titre + sem + duree + '\n';
    if (inc.liens) {
        formaterLiens(lecon.liens).forEach(function(l) { txt += '  │ ' + l + '\n'; });
    }
    if (inc.objectifs) {
        if (lecon.objectifs.length > 0) {
            txt += '  │ Objectifs :\n';
            lecon.objectifs.forEach(function(o) { txt += '  │   — ' + o + '\n'; });
        } else if (lecon.objectifDerive) {
            lecon.objectifDerive.split('\n').forEach(function(ligne) {
                txt += '  │ Objectif : ' + ligne + '\n';
            });
        }
    }
    elementsVisibles(lecon.elements, inc).forEach(function(el) {
        txt += rendreElementTexte(el, inc, '  │ ');
    });
    txt += '  └─\n';
    return txt;
}

function rendreTexte(plan, niveauId) {
    var inc = INCLUSIONS[niveauId];
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
            txt += rendreLeconTexte(lecon, inc);
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
            txt += rendreLeconTexte(lecon, inc);
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

var COLONNES_TSV = {
    sommaire: ['Séquence', 'Semaines', 'Leçon', 'Semaine', 'Évaluation', 'Pondération (%)', 'Échéance'],
    deroulement: ['Séquence', 'Semaines', 'Leçon', 'Semaine', 'Type', 'Titre', 'Durée (min)', 'Rétroaction', 'Production', 'Pondération (%)', 'Échéance', 'Objectifs'],
    alignement: ['Séquence', 'Semaines', 'Leçon', 'Semaine', 'Type', 'Titre', 'Durée (min)', 'Rétroaction', 'Production', 'Pondération (%)', 'Échéance', 'Objectifs', 'Objectifs servis', 'Liens', 'Grille', 'Échelle']
};

function rendreTSV(plan, niveauId) {
    var inc = INCLUSIONS[niveauId];
    var lignes = [COLONNES_TSV[niveauId].join('\t')];

    function pousser(cellules) {
        lignes.push(cellules.map(nettoyerTSV).join('\t'));
    }

    function baseSeq(seq) {
        var etendue = seq.etendue
            ? seq.etendue.debut + (seq.etendue.fin !== seq.etendue.debut ? '–' + seq.etendue.fin : '')
            : '';
        return [seq.titre, etendue];
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
            var vide = COLONNES_TSV[niveauId].length - 2;
            pousser(base.concat(new Array(vide).fill('')));
            return;
        }
        seq.lecons.forEach(function(lecon) { ligneLecon(base, lecon); });
        elementsVisibles(seq.elements, inc).forEach(function(el) { ligneElement(base, null, el); });
    });

    plan.leconsOrphelines.forEach(function(lecon) {
        ligneLecon(['(Hors séquence)', ''], lecon);
    });

    return lignes.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// FORMAT MARKDOWN
// ---------------------------------------------------------------------------

function rendreLeconMD(lecon, inc) {
    var champs = [];
    if (lecon.semaine !== null) champs.push('Sem. ' + lecon.semaine);
    if (inc.durees && lecon.dureeRollup) champs.push('Σ ' + formatDuree(lecon.dureeRollup));
    var marqueur = champs.length ? ' [Leçon | ' + champs.join(' | ') + ']' : ' [Leçon]';
    var md = '### ' + lecon.titre + marqueur + '\n\n';

    if (inc.objectifs) {
        if (lecon.objectifs.length > 0) {
            md += '**Objectifs** :\n';
            lecon.objectifs.forEach(function(o) { md += '- ' + o + '\n'; });
            md += '\n';
        } else if (lecon.objectifDerive) {
            md += '**Objectif** : ' + lecon.objectifDerive.split('\n').join(' ') + '\n\n';
        }
    }

    // Les productions rattachées de la leçon — le contrat du sommaire.
    var partiesEval = [];
    lecon.elements.forEach(function(el) {
        if (el.production) partiesEval.push(ligneProduction(el.production, inc.productionsDetail));
    });
    if (partiesEval.length > 0) {
        md += '**Évaluation** : ' + partiesEval.join(' ; ') + '\n\n';
    }

    var visibles = elementsVisibles(lecon.elements, inc);
    if (visibles.length > 0 && niveauMontreDesLignes(visibles, inc)) {
        md += '**Déroulement** :\n';
        visibles.forEach(function(el) {
            if (el.categorie === 'evaluation' && !inc.activites) return; // déjà en Évaluation
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
    }

    if (inc.liens && lecon.liens.length > 0) {
        md += '**Liens** :\n';
        formaterLiens(lecon.liens).forEach(function(l) { md += '- ' + l + '\n'; });
        md += '\n';
    }

    md += '---\n\n';
    return md;
}

function niveauMontreDesLignes(visibles, inc) {
    return visibles.some(function(el) {
        return el.categorie !== 'evaluation' || inc.activites;
    });
}

function rendreMarkdown(plan, niveauId) {
    var inc = INCLUSIONS[niveauId];
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
        seq.lecons.forEach(function(lecon) { md += rendreLeconMD(lecon, inc); });
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
        plan.leconsOrphelines.forEach(function(lecon) { md += rendreLeconMD(lecon, inc); });
    }
    return md;
}

// ---------------------------------------------------------------------------
// PORTE PUBLIQUE
// ---------------------------------------------------------------------------

/**
 * LE générateur (D5) : un plan, une profondeur, un format.
 * @param {string} niveauId  sommaire | deroulement | alignement
 * @param {string} formatId  texte | tsv | markdown
 * @returns {string|null} le document, ou null sans carte
 */
function genererExport(niveauId, formatId) {
    if (!INCLUSIONS[niveauId]) return null;
    var plan = construirePlan();
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
    nomFichierExport: nomFichierExport
};

})();
