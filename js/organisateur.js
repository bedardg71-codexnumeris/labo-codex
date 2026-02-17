/* ===============================
   MODULE: ORGANISATEUR
   Sous-onglet indépendant de Planification.
   Planification de leçon, ancrage calendrier,
   aide-mémoire, enseignement explicite (5 étapes),
   exports élève/enseignant (TXT/MD).

   Export: window.initialiserModuleOrganisateur
   =============================== */

(function() {
'use strict';

// === ÉTAT ===
var initialise = false;
var leconActiveId = null;

// === RÉFÉRENCES DOM (initialisées dans initialiser) ===
var selectCarte, selectSequence, selectLecon;
var contenuLecon, enteteCalendrier, enteteCalendrierContenu;
var objectifContenu, btnReinitObjectif;
var prerequisContenu, productionsContenu;
var eeCheckbox, coeurBrut, coeurContenu, eeEtapes;
var listeNonAssignees, calendrierContenu;
var btnExport, modaleExport;

// === NOMS DES ÉTAPES EE ===
var NOMS_ETAPES = ['ouverture', 'modelisation', 'pratiqueGuidee', 'pratiqueAutonome', 'cloture'];

// ============================================================
//  INITIALISATION
// ============================================================

function initialiserModuleOrganisateur() {
    console.log('📋 Initialisation du module Organisateur...');

    // S'assurer que la carte est initialisée (pour accéder aux données)
    if (window.planificationCarte && !window.planificationCarte.etat.initialise) {
        window.planificationCarte.initialiser();
    }

    if (!initialise) {
        // Références DOM
        selectCarte = document.getElementById('org-select-carte');
        selectSequence = document.getElementById('org-select-sequence');
        selectLecon = document.getElementById('org-select-lecon');
        contenuLecon = document.getElementById('org-contenu-lecon');
        enteteCalendrier = document.getElementById('org-entete-calendrier');
        enteteCalendrierContenu = document.getElementById('org-entete-calendrier-contenu');
        objectifContenu = document.getElementById('org-objectif-contenu');
        btnReinitObjectif = document.getElementById('org-btn-reinit-objectif');
        prerequisContenu = document.getElementById('org-prerequis-contenu');
        productionsContenu = document.getElementById('org-productions-contenu');
        eeCheckbox = document.getElementById('org-ee-checkbox');
        coeurBrut = document.getElementById('org-coeur-brut');
        coeurContenu = document.getElementById('org-coeur-contenu');
        eeEtapes = document.getElementById('org-ee-etapes');
        listeNonAssignees = document.getElementById('org-ee-liste-non-assignees');
        calendrierContenu = document.getElementById('org-calendrier-contenu');
        btnExport = document.getElementById('org-btn-export');
        modaleExport = document.getElementById('org-modale-export');

        brancherEvenements();
        initialise = true;
        console.log('   ✅ Module Organisateur initialisé');
    }

    // Rafraîchir les données
    peuplerSelecteurCartes();

    // Restaurer les sélections persistées
    var selections = chargerSelectionsOrg();
    if (selections) {
        if (selections.carte && selectCarte) {
            selectCarte.value = selections.carte;
            var carte = window.planificationCarte;
            if (carte && carte.changerCarte && selections.carte) {
                carte.changerCarte(selections.carte);
            }
        }
    }

    peuplerSelecteursOrganisateur();

    if (selections) {
        if (selections.sequence && selectSequence) selectSequence.value = selections.sequence;
        peuplerSelecteurLecons();
        if (selections.lecon && selectLecon) {
            selectLecon.value = selections.lecon;
            leconActiveId = selectLecon.value || null;
            afficherLecon();
        }
    }

    rafraichirCalendrier();
}

// ============================================================
//  ÉVÉNEMENTS
// ============================================================

function brancherEvenements() {
    if (selectCarte) selectCarte.addEventListener('change', function() {
        var carteId = selectCarte.value;
        if (!carteId) return;
        var carte = window.planificationCarte;
        if (carte && carte.changerCarte) {
            carte.changerCarte(carteId);
        }
        sauvegarderSelectionsOrg();
        peuplerSelecteursOrganisateur();
        rafraichirCalendrier();
    });

    if (selectSequence) selectSequence.addEventListener('change', function() {
        sauvegarderSelectionsOrg();
        peuplerSelecteurLecons();
    });
    if (selectLecon) selectLecon.addEventListener('change', function() {
        leconActiveId = selectLecon.value || null;
        sauvegarderSelectionsOrg();
        afficherLecon();
    });

    // Enseignement explicite — toggle
    if (eeCheckbox) eeCheckbox.addEventListener('change', function() {
        var leconId = selectLecon ? selectLecon.value : '';
        if (!leconId) return;
        sauvegarderDonneeLecon(leconId, 'enseignementExplicite', eeCheckbox.checked);
        basculerEE(eeCheckbox.checked);
    });

    // Checkboxes des étapes EE
    document.querySelectorAll('.org-ee-etape-check').forEach(function(cb) {
        cb.addEventListener('change', function() {
            var leconId = selectLecon ? selectLecon.value : '';
            if (!leconId) return;
            var etape = cb.dataset.etape;
            var seances = chargerSeances();
            if (!seances[leconId]) seances[leconId] = {};
            if (!seances[leconId].etapes) seances[leconId].etapes = creerEtapesVides();
            seances[leconId].etapes[etape].active = cb.checked;
            sauvegarderSeances(seances);
            var corps = cb.closest('.org-ee-etape').querySelector('.org-ee-etape-corps');
            if (corps) corps.style.display = cb.checked ? '' : 'none';
        });
    });

    // Notes des étapes EE
    document.querySelectorAll('.org-ee-notes').forEach(function(ta) {
        ta.addEventListener('input', debounce(function() {
            var leconId = selectLecon ? selectLecon.value : '';
            if (!leconId) return;
            var etape = ta.dataset.etape;
            var seances = chargerSeances();
            if (!seances[leconId]) seances[leconId] = {};
            if (!seances[leconId].etapes) seances[leconId].etapes = creerEtapesVides();
            seances[leconId].etapes[etape].contenu = ta.value;
            sauvegarderSeances(seances);
        }, 500));
    });

    // Objectif éditable
    if (objectifContenu) {
        objectifContenu.addEventListener('focus', function() {
            if (objectifContenu.dataset.autoDerive === 'true') {
                objectifContenu.dataset.autoDerive = 'false';
            }
        });
        objectifContenu.addEventListener('blur', function() {
            var leconId = selectLecon ? selectLecon.value : '';
            if (!leconId) return;
            var texte = objectifContenu.textContent.trim();
            sauvegarderDonneeLecon(leconId, 'objectifPersonnalise', texte || null);
            if (btnReinitObjectif) btnReinitObjectif.style.display = texte ? '' : 'none';
        });
    }
    if (btnReinitObjectif) {
        btnReinitObjectif.addEventListener('click', function() {
            var leconId = selectLecon ? selectLecon.value : '';
            if (!leconId) return;
            sauvegarderDonneeLecon(leconId, 'objectifPersonnalise', null);
            btnReinitObjectif.style.display = 'none';
            afficherObjectif(leconId);
        });
    }

    // Export
    if (btnExport) btnExport.addEventListener('click', ouvrirModaleExport);
    var btnFermer = document.getElementById('org-modale-fermer');
    var btnAnnuler = document.getElementById('org-modale-annuler');
    var btnTelecharger = document.getElementById('org-modale-telecharger');
    if (btnFermer) btnFermer.addEventListener('click', fermerModaleExport);
    if (btnAnnuler) btnAnnuler.addEventListener('click', fermerModaleExport);
    if (btnTelecharger) btnTelecharger.addEventListener('click', lancerExport);

    // Drag & drop pour les activités dans les étapes EE
    configurerDragDrop();
}

// ============================================================
//  SÉLECTEUR DE CARTE
// ============================================================

function peuplerSelecteurCartes() {
    if (!selectCarte) return;
    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    if (!index || !index.cartes) return;

    var valActuelle = selectCarte.value || index.active;
    selectCarte.innerHTML = '';
    for (var i = 0; i < index.cartes.length; i++) {
        var c = index.cartes[i];
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nom;
        selectCarte.appendChild(opt);
    }
    selectCarte.value = valActuelle;
}

// ============================================================
//  PERSISTANCE DES SÉLECTIONS
// ============================================================

var CLE_SELECTIONS_ORG = 'org_selections';

function sauvegarderSelectionsOrg() {
    try {
        localStorage.setItem(CLE_SELECTIONS_ORG, JSON.stringify({
            carte: selectCarte ? selectCarte.value : '',
            sequence: selectSequence ? selectSequence.value : '',
            lecon: selectLecon ? selectLecon.value : ''
        }));
    } catch(e) {}
}

function chargerSelectionsOrg() {
    try {
        var data = localStorage.getItem(CLE_SELECTIONS_ORG);
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
}

// ============================================================
//  SÉLECTEURS SÉQUENCE / LEÇON
// ============================================================

function peuplerSelecteursOrganisateur() {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return;
    var etat = carte.etat;

    // Collecter séquences
    var sequences = [];
    for (var entry of etat.noeuds) {
        if (entry[1].type === 'sequence') sequences.push(entry[1]);
    }
    sequences.sort(function(a, b) {
        var sa = (a.metadata && a.metadata.semaineDebut) || 0;
        var sb = (b.metadata && b.metadata.semaineDebut) || 0;
        if (sa !== sb) return sa - sb;
        return (a.x || 0) - (b.x || 0);
    });

    var valActuelle = selectSequence.value;
    selectSequence.innerHTML = '<option value="">— Séquence —</option>';
    for (var i = 0; i < sequences.length; i++) {
        var opt = document.createElement('option');
        opt.value = sequences[i].id;
        opt.textContent = sequences[i].titre || 'Séquence ' + (i + 1);
        selectSequence.appendChild(opt);
    }
    selectSequence.value = valActuelle;

    peuplerSelecteurLecons();
}

function peuplerSelecteurLecons() {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return;
    var etat = carte.etat;

    var seqId = selectSequence.value;
    var lecons = [];

    if (seqId) {
        var seq = etat.noeuds.get(seqId);
        if (seq && seq.enfants) {
            for (var i = 0; i < seq.enfants.length; i++) {
                var e = etat.noeuds.get(seq.enfants[i]);
                if (e && e.type === 'lecon') lecons.push(e);
            }
        }
    } else {
        for (var entry of etat.noeuds) {
            if (entry[1].type === 'lecon') lecons.push(entry[1]);
        }
    }
    lecons.sort(function(a, b) { return (a.x || 0) - (b.x || 0); });

    var valActuelle = selectLecon.value;
    selectLecon.innerHTML = '<option value="">— Leçon —</option>';
    for (var j = 0; j < lecons.length; j++) {
        var opt = document.createElement('option');
        opt.value = lecons[j].id;
        opt.textContent = lecons[j].titre || 'Leçon ' + (j + 1);
        selectLecon.appendChild(opt);
    }
    selectLecon.value = valActuelle;

    leconActiveId = selectLecon.value || null;
    afficherLecon();
}

// ============================================================
//  AFFICHAGE LEÇON
// ============================================================

function afficherLecon() {
    var leconId = selectLecon ? selectLecon.value : '';
    if (!leconId) {
        if (contenuLecon) contenuLecon.style.display = 'none';
        if (enteteCalendrier) enteteCalendrier.style.display = 'none';
        return;
    }
    if (contenuLecon) contenuLecon.style.display = '';

    afficherEnteteCalendrier(leconId);
    afficherObjectif(leconId);
    afficherPrerequis(leconId);
    afficherProductions(leconId);
    afficherCoeurLecon(leconId);
}

// ============================================================
//  PHASE 2 : OBJECTIF DE LA LEÇON
// ============================================================

function afficherObjectif(leconId) {
    var carte = window.planificationCarte;
    if (!carte) return;

    var seances = chargerSeances();
    var donnees = seances[leconId] || {};

    // Vérifier si un objectif personnalisé existe
    if (donnees.objectifPersonnalise) {
        objectifContenu.textContent = donnees.objectifPersonnalise;
        objectifContenu.contentEditable = 'true';
        objectifContenu.classList.remove('org-placeholder');
        objectifContenu.dataset.autoDerive = 'false';
        if (btnReinitObjectif) btnReinitObjectif.style.display = '';
        return;
    }

    // Auto-dérivé : remonter les branches via les idées maîtresses
    if (btnReinitObjectif) btnReinitObjectif.style.display = 'none';
    var ideesM = carte.trouverIdeesMaitressesAncetres(leconId);
    objectifContenu.contentEditable = 'true';
    objectifContenu.dataset.autoDerive = 'true';

    if (ideesM.length === 0) {
        objectifContenu.textContent = 'Aucune idée maîtresse associée. Reliez la branche à une idée maîtresse.';
        objectifContenu.classList.add('org-placeholder');
    } else if (ideesM.length === 1) {
        var titre = (ideesM[0].titre || '...').toLowerCase();
        var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
        objectifContenu.textContent = 'Au terme de la leçon, l\u2019élève sera capable ' + prefixe + titre + '.';
        objectifContenu.classList.remove('org-placeholder');
    } else {
        var html = 'Au terme de la leçon, l\u2019élève sera capable\u00a0:<br>';
        for (var k = 0; k < ideesM.length; k++) {
            var t = (ideesM[k].titre || '...').toLowerCase();
            var p = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(t) ? "d'" : 'de ';
            html += '\u00a0\u00a0— ' + p + t + (k < ideesM.length - 1 ? '\u00a0;' : '.') + '<br>';
        }
        objectifContenu.innerHTML = html;
        objectifContenu.classList.remove('org-placeholder');
    }
}

// ============================================================
//  PHASE 2 : EN-TÊTE AUTOMATIQUE (DATE, HEURE, LOCAL)
// ============================================================

function afficherEnteteCalendrier(leconId) {
    if (!enteteCalendrier || !enteteCalendrierContenu) return;
    if (typeof db === 'undefined' || typeof window.cle !== 'function') {
        enteteCalendrier.style.display = 'none';
        return;
    }

    try {
        var carte = window.planificationCarte;
        if (!carte || !carte.etat) { enteteCalendrier.style.display = 'none'; return; }

        var lecon = carte.etat.noeuds.get(leconId);
        if (!lecon) { enteteCalendrier.style.display = 'none'; return; }

        // 1. Trouver la séquence parente → numéro de semaine
        var seq = lecon.parent ? carte.etat.noeuds.get(lecon.parent) : null;
        var numSemaine = (seq && seq.metadata) ? seq.metadata.semaineDebut : null;

        // 2. Rang de la leçon dans la séquence (triée par X, comme la vue calendrier)
        var rangLecon = 0;
        if (seq && seq.enfants) {
            var leconsSeq = seq.enfants.filter(function(eid) {
                var n = carte.etat.noeuds.get(eid);
                return n && n.type === 'lecon';
            });
            leconsSeq.sort(function(a, b) {
                var na = carte.etat.noeuds.get(a), nb = carte.etat.noeuds.get(b);
                return ((na && na.x) || 0) - ((nb && nb.x) || 0);
            });
            for (var r = 0; r < leconsSeq.length; r++) {
                if (leconsSeq[r] === leconId) { rangLecon = r; break; }
            }
        }

        // 3. Charger données
        var groupes = db.getSync(window.cle('groupesCours'), null) || [];
        var horaires = db.getSync(window.cle('horaires'), null) || [];
        var calendrier = db.getSync(window.cle('calendrierComplet'), null) || {};
        var cours = db.getSync('cours', []);
        var listeCours = db.getSync('listeCours', []);

        // Filtrer groupes du même cours
        var gcActif = db.getSync('groupeCoursActif', null);
        var coursIdActif = gcActif ? gcActif.coursId : null;
        if (coursIdActif) {
            groupes = groupes.filter(function(g) { return g.coursId === coursIdActif; });
        }

        if (groupes.length === 0) { enteteCalendrier.style.display = 'none'; return; }

        // 4. Construire un index : dates du calendrier pour la semaine N, par jour
        var datesSemaine = {}; // { "lundi": "2025-09-08", "jeudi": "2025-09-11", ... }
        if (numSemaine && calendrier) {
            for (var dateStr in calendrier) {
                var info = calendrier[dateStr];
                if (info && info.numeroSemaine === numSemaine && (info.statut === 'cours' || info.statut === 'reprise')) {
                    var jourCal = (info.jourRemplace || info.jourSemaine || '').toLowerCase();
                    if (jourCal) datesSemaine[jourCal] = dateStr;
                }
            }
        }

        // Helper : formater une date "2025-09-08" → "lundi 8 sept."
        var MOIS_COURTS = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
        function formaterDate(ds) {
            if (!ds) return '';
            var p = ds.split('-');
            var d = parseInt(p[2], 10);
            var m = parseInt(p[1], 10) - 1;
            var jourSem = calendrier[ds] ? calendrier[ds].jourSemaine : '';
            return (jourSem ? jourSem + ' ' : '') + d + ' ' + MOIS_COURTS[m];
        }

        // 5. Pour chaque groupe, résoudre la séance exacte
        var html = '';
        for (var i = 0; i < groupes.length; i++) {
            var gc = groupes[i];

            // Nom lisible
            var coursInfo = cours.find(function(c) { return c.id === gc.coursId; });
            if (!coursInfo) coursInfo = listeCours.find(function(c) { return c.id === gc.coursId || c.sigle === gc.coursId; });
            var sigle = coursInfo ? (coursInfo.codeCours || coursInfo.code || coursInfo.sigle || '') : '';
            var groupe = gc.groupeNum || gc.groupe || '';
            var label = sigle ? sigle + ' gr.' + groupe : 'Groupe ' + groupe;

            // Séances du groupe (triées par ordre de semaine)
            var hor = gc.horaireId ? horaires.find(function(h) { return h.id === gc.horaireId; }) : null;
            var seances = (hor && hor.seances) ? hor.seances : [];
            var ordreJours = ['lundi','mardi','mercredi','jeudi','vendredi','samedi'];
            seances = seances.slice().sort(function(a, b) {
                return ordreJours.indexOf((a.jour || '').toLowerCase()) - ordreJours.indexOf((b.jour || '').toLowerCase());
            });

            // La séance correspondant au rang de la leçon
            var seance = seances[rangLecon] || seances[0] || null;
            var detail = '';

            if (seance && numSemaine) {
                var jourSeance = (seance.jour || '').toLowerCase();
                var dateSeance = datesSemaine[jourSeance] || '';
                if (dateSeance) {
                    detail = formaterDate(dateSeance);
                } else {
                    // Pas de date trouvée, afficher le jour seul
                    detail = seance.jour ? (seance.jour.charAt(0).toUpperCase() + seance.jour.slice(1)) : '';
                }
                if (seance.heureDebut) detail += ' ' + seance.heureDebut + '–' + (seance.heureFin || '');
                if (seance.local) detail += ' (local ' + seance.local + ')';
            } else if (seance) {
                detail = seance.jour ? (seance.jour.charAt(0).toUpperCase() + seance.jour.slice(1)) : '';
                if (seance.heureDebut) detail += ' ' + seance.heureDebut + '–' + (seance.heureFin || '');
                if (seance.local) detail += ' (local ' + seance.local + ')';
            }

            html += '<div class="org-seance-badge">';
            html += '<div class="org-seance-badge-groupe">' + label + '</div>';
            if (detail) html += '<div class="org-seance-badge-detail">' + detail + '</div>';
            html += '</div>';
        }

        if (html) {
            enteteCalendrier.style.display = '';
            enteteCalendrierContenu.innerHTML = html;
        } else {
            enteteCalendrier.style.display = 'none';
        }
    } catch(e) {
        enteteCalendrier.style.display = 'none';
    }
}

// ============================================================
//  PHASE 2 : PRÉREQUIS
// ============================================================

function afficherPrerequis(leconId) {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat || !prerequisContenu) return;

    var etat = carte.etat;
    var lecon = etat.noeuds.get(leconId);
    if (!lecon) return;

    // Collecter les connaissances (enfants de la leçon)
    var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var connaissances = [];
    for (var i = 0; i < enfants.length; i++) {
        var e = etat.noeuds.get(enfants[i]);
        if (e && (e.type === 'factuelle' || e.type === 'conceptuelle' || e.type === 'procedurale' || e.type === 'metacognitive')) {
            connaissances.push(e);
        }
    }

    // Chercher les liens prérequis (s'appuie_sur, prerequis_de)
    var prerequis = [];
    var vus = {};
    for (var j = 0; j < connaissances.length; j++) {
        var liens = carte.getLiensDeNoeud(connaissances[j].id);
        for (var k = 0; k < liens.length; k++) {
            var l = liens[k];
            var cible = etat.noeuds.get(l.noeudId);
            if (cible && cible.metadata && cible.metadata.prealable && !vus[cible.id]) {
                vus[cible.id] = true;
                prerequis.push({
                    nom: cible.titre || carte.obtenirLabelNoeud(cible),
                    type: carte.obtenirLabelNoeud(cible),
                    requis: connaissances[j].titre || carte.obtenirLabelNoeud(connaissances[j])
                });
            }
        }
    }

    // Aussi vérifier les nœuds qui sont directement marqués préalables dans les enfants
    for (var m = 0; m < enfants.length; m++) {
        var enf = etat.noeuds.get(enfants[m]);
        if (enf && enf.metadata && enf.metadata.prealable && !vus[enf.id]) {
            vus[enf.id] = true;
            prerequis.push({
                nom: enf.titre || carte.obtenirLabelNoeud(enf),
                type: carte.obtenirLabelNoeud(enf),
                requis: null
            });
        }
    }

    if (prerequis.length === 0) {
        prerequisContenu.innerHTML = '<span class="org-placeholder">Aucun prérequis détecté. Marquez des connaissances comme « préalables » dans la carte.</span>';
    } else {
        var html = '';
        for (var n = 0; n < prerequis.length; n++) {
            var pr = prerequis[n];
            html += '<div class="org-prerequis-item">';
            html += '<span class="org-prerequis-nom">' + escHtml(pr.nom) + '</span>';
            html += ' <span class="org-prerequis-type">(' + escHtml(pr.type) + ')</span>';
            if (pr.requis) {
                html += ' <span class="org-prerequis-fleche">→ requis pour : </span>';
                html += '<span class="org-prerequis-cible">' + escHtml(pr.requis) + '</span>';
            }
            html += '</div>';
        }
        prerequisContenu.innerHTML = html;
    }
}

// ============================================================
//  PHASE 2 : PRODUCTIONS ASSOCIÉES
// ============================================================

function afficherProductions(leconId) {
    var carte = window.planificationCarte;
    if (!carte || !productionsContenu) return;

    var productions = carte.chargerProductions();
    var seances = chargerSeances();
    var donnees = seances[leconId] || {};
    var activites = donnees.activites || {};

    // Collecter les productions associées aux activités de cette leçon
    var prodsAssociees = [];
    var vus = {};
    for (var actId in activites) {
        if (activites[actId].productionId && !vus[activites[actId].productionId]) {
            vus[activites[actId].productionId] = true;
            var details = carte.afficherDetailsProduction(activites[actId].productionId, productions);
            if (details) {
                prodsAssociees.push(details);
            }
        }
    }

    if (prodsAssociees.length === 0) {
        productionsContenu.innerHTML = '<span class="org-placeholder">Aucune production associée. Associez des productions aux activités ci-dessous.</span>';
    } else {
        var html = '';
        for (var i = 0; i < prodsAssociees.length; i++) {
            var d = prodsAssociees[i];
            html += '<div class="org-production-item">';
            html += '<strong>' + escHtml(d.nomProduction) + '</strong>';
            html += ' <span class="org-production-pond">(' + d.ponderation + ' %)</span>';
            html += '<br><span class="org-production-detail">Grille\u00a0: ' + escHtml(d.nomGrille) + ' · Échelle\u00a0: ' + escHtml(d.nomEchelle) + '</span>';
            if (d.dateEcheance) {
                html += '<br><span class="org-production-detail">Échéance\u00a0: ' + escHtml(d.dateEcheance) + '</span>';
            }
            html += '</div>';
        }
        productionsContenu.innerHTML = html;
    }
}

// ============================================================
//  PHASE 3 : CŒUR DE LA LEÇON / ENSEIGNEMENT EXPLICITE
// ============================================================

function afficherCoeurLecon(leconId) {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return;
    var etat = carte.etat;

    var lecon = etat.noeuds.get(leconId);
    if (!lecon) return;

    var seances = chargerSeances();
    var donnees = seances[leconId] || {};

    // Checkbox EE
    var eeActif = !!donnees.enseignementExplicite;
    if (eeCheckbox) eeCheckbox.checked = eeActif;
    basculerEE(eeActif);

    // Collecter les enfants de la leçon (activités + types de connaissances)
    var TYPES_CONTENEURS = { 'sequence': true, 'lecon': true };
    var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var activites = enfants.filter(function(eid) {
        var e = etat.noeuds.get(eid);
        return e && !TYPES_CONTENEURS[e.type] && e.type !== 'evaluation';
    });

    // Évaluations pour avertissement
    var evalsLecon = enfants.filter(function(eid) {
        var e = etat.noeuds.get(eid);
        return e && e.type === 'evaluation';
    });

    var productions = carte.chargerProductions();
    var activitesData = donnees.activites || {};

    // === Cœur brut (quand EE décoché) ===
    afficherCoeurBrut(leconId, activites, evalsLecon, productions, activitesData);

    // === Étapes EE (quand EE coché) ===
    if (eeActif) {
        afficherEtapesEE(leconId, activites, donnees);
    }
}

function afficherCoeurBrut(leconId, activites, evalsLecon, productions, activitesData) {
    var carte = window.planificationCarte;
    if (!carte || !coeurContenu) return;
    var etat = carte.etat;

    if (activites.length === 0) {
        coeurContenu.innerHTML = '<div class="org-placeholder">Aucune activité dans cette leçon.</div>';
        return;
    }

    // Vérifier cohérence évaluation
    var aucuneProd = activites.every(function(eid) {
        var choix = activitesData[eid] || {};
        return !choix.productionId;
    });

    var h = '';
    if (evalsLecon.length > 0 && aucuneProd) {
        h += '<div class="org-avertissement">\u26A0 ' + evalsLecon.length + ' évaluation' + (evalsLecon.length > 1 ? 's' : '') + ' dans la carte ' + (evalsLecon.length > 1 ? 'ne sont reliées' : "n'est reliée") + ' à aucune activité ci-dessous.</div>';
    }

    for (var j = 0; j < activites.length; j++) {
        var enf = etat.noeuds.get(activites[j]);
        if (!enf) continue;
        var choixAct = activitesData[enf.id] || { retroaction: 'aucune', productionId: null };

        h += '<div class="org-activite" data-noeud="' + enf.id + '" draggable="true">';
        h += '<div class="org-activite-entete">';
        h += '<span class="org-pastille" style="background: ' + carte.obtenirCouleurNoeud(enf) + '"></span>';
        h += '<span class="org-activite-titre">' + escHtml(enf.titre || carte.obtenirLabelNoeud(enf)) + '</span>';
        h += '<span class="org-activite-type">' + carte.obtenirLabelNoeud(enf).toUpperCase() + '</span>';
        if (enf.metadata && enf.metadata.duree) {
            h += ' <span class="org-duree">' + enf.metadata.duree + ' min</span>';
        }
        h += '</div>';

        // Rétroaction
        h += '<div class="org-activite-detail">';
        h += '<label>Rétroaction\u00a0:</label>';
        h += '<select class="org-select-retro" data-activite="' + enf.id + '" data-lecon="' + leconId + '">';
        var retros = [['aucune', 'Aucune'], ['orale', 'Orale'], ['ecrite', 'Écrite'], ['pairs', 'Par les pairs']];
        for (var r = 0; r < retros.length; r++) {
            h += '<option value="' + retros[r][0] + '"' + (choixAct.retroaction === retros[r][0] ? ' selected' : '') + '>' + retros[r][1] + '</option>';
        }
        h += '</select>';
        h += '</div>';

        // Production
        h += '<div class="org-activite-detail">';
        h += '<label>Production\u00a0:</label>';
        h += genererSelectProduction(enf.id, leconId, productions, choixAct.productionId);
        h += '</div>';

        // Détails production
        if (choixAct.productionId) {
            var details = carte.afficherDetailsProduction(choixAct.productionId, productions);
            if (details) {
                h += '<div class="org-prod-details">';
                h += 'Grille\u00a0: ' + escHtml(details.nomGrille) + ' · Échelle\u00a0: ' + escHtml(details.nomEchelle);
                if (details.dateEcheance) h += '<br>Échéance\u00a0: ' + escHtml(details.dateEcheance);
                h += '</div>';
            }
        }

        h += '</div>';
    }
    coeurContenu.innerHTML = h;

    // Brancher event listeners
    brancherSelecteursActivites(coeurContenu, leconId);
}

function genererSelectProduction(activiteId, leconId, productions, prodSelectionnee) {
    var h = '<select class="org-select-prod" data-activite="' + activiteId + '" data-lecon="' + leconId + '">';
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
                var selected = prodSelectionnee === grp[pi].id ? ' selected' : '';
                h += '<option value="' + grp[pi].id + '"' + selected + '>' + escHtml(grp[pi].nom) + ' (' + (grp[pi].ponderation || 0) + ' %)</option>';
            }
            h += '</optgroup>';
        }
    }
    h += '</select>';
    return h;
}

function brancherSelecteursActivites(conteneur, leconId) {
    conteneur.querySelectorAll('.org-select-retro').forEach(function(sel) {
        sel.addEventListener('change', function() {
            sauvegarderChoixActivite(sel.dataset.lecon, sel.dataset.activite, sel.value, null);
        });
    });
    conteneur.querySelectorAll('.org-select-prod').forEach(function(sel) {
        sel.addEventListener('change', function() {
            var retro = sel.closest('.org-activite').querySelector('.org-select-retro');
            sauvegarderChoixActivite(sel.dataset.lecon, sel.dataset.activite, retro ? retro.value : 'aucune', sel.value || null);
            // Refresh pour montrer détails production + refresh section Productions
            afficherLecon();
        });
    });
}

// ============================================================
//  PHASE 3 : ENSEIGNEMENT EXPLICITE (5 ÉTAPES)
// ============================================================

function basculerEE(actif) {
    if (coeurBrut) coeurBrut.style.display = actif ? 'none' : '';
    if (eeEtapes) eeEtapes.style.display = actif ? '' : 'none';

    var ouvertureContainer = document.getElementById('org-ee-ouverture-sections');
    var clotureContainer = document.getElementById('org-ee-cloture-sections');
    var objectifSection = document.getElementById('org-objectif');
    var prerequisSection = document.getElementById('org-prerequis');
    var contenuLecon = document.getElementById('org-contenu-lecon');

    if (actif) {
        // Déplacer Objectif et Prérequis dans l'Ouverture
        if (ouvertureContainer && objectifSection) ouvertureContainer.appendChild(objectifSection);
        if (ouvertureContainer && prerequisSection) ouvertureContainer.appendChild(prerequisSection);

        // Générer le rappel des compétences dans la Clôture
        if (clotureContainer) {
            var objectifTexte = objectifContenu ? objectifContenu.textContent.trim() : '';
            clotureContainer.innerHTML = '';
            if (objectifTexte) {
                var div = document.createElement('div');
                div.className = 'org-section org-ee-cloture-rappel';
                var titre = document.createElement('div');
                titre.className = 'org-section-titre';
                titre.textContent = 'Compétences développées';
                var contenu = document.createElement('div');
                contenu.className = 'org-section-contenu';
                contenu.textContent = objectifTexte;
                div.appendChild(titre);
                div.appendChild(contenu);
                clotureContainer.appendChild(div);
            }
        }
    } else {
        // Remettre Objectif et Prérequis dans le contenu leçon (avant Productions)
        var productionsSection = document.getElementById('org-productions');
        if (contenuLecon && objectifSection) contenuLecon.insertBefore(objectifSection, productionsSection);
        if (contenuLecon && prerequisSection) contenuLecon.insertBefore(prerequisSection, productionsSection);

        // Vider le rappel Clôture
        if (clotureContainer) clotureContainer.innerHTML = '';
    }
}

function afficherEtapesEE(leconId, activites, donnees) {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return;
    var etat = carte.etat;

    var etapesData = donnees.etapes || creerEtapesVides();
    var activitesAssignees = {}; // actId → true si dans au moins une étape

    // Index d'ordre selon la position dans la carte (enfants de la leçon)
    var lecon = etat.noeuds.get(leconId);
    var ordreCarteIndex = {};
    if (lecon && lecon.enfants) {
        for (var o = 0; o < lecon.enfants.length; o++) {
            ordreCarteIndex[lecon.enfants[o]] = o;
        }
    }

    // Pré-calculer quelles activités sont assignées à au moins une étape
    for (var p = 0; p < NOMS_ETAPES.length; p++) {
        var acts = (etapesData[NOMS_ETAPES[p]] || {}).activites || [];
        for (var q = 0; q < acts.length; q++) {
            activitesAssignees[acts[q]] = true;
        }
    }

    // Remplir chaque étape
    for (var i = 0; i < NOMS_ETAPES.length; i++) {
        var nomEtape = NOMS_ETAPES[i];
        var etapeData = etapesData[nomEtape] || { active: true, contenu: '', activites: [] };

        // Mettre à jour checkbox et corps
        var checkEl = document.querySelector('.org-ee-etape-check[data-etape="' + nomEtape + '"]');
        if (checkEl) checkEl.checked = etapeData.active;
        var corpsEl = document.querySelector('.org-ee-etape[data-etape="' + nomEtape + '"] .org-ee-etape-corps');
        if (corpsEl) corpsEl.style.display = etapeData.active ? '' : 'none';

        // Remplir les notes
        var notesEl = document.querySelector('.org-ee-notes[data-etape="' + nomEtape + '"]');
        if (notesEl) notesEl.value = etapeData.contenu || '';

        // Remplir la zone de dépôt avec les activités assignées (triées selon l'ordre de la carte)
        var zoneDepot = document.querySelector('.org-ee-zone-depot[data-etape="' + nomEtape + '"]');
        if (zoneDepot) {
            var htmlZone = '';
            var actsEtape = (etapeData.activites || []).slice().sort(function(a, b) {
                return (ordreCarteIndex[a] || 0) - (ordreCarteIndex[b] || 0);
            });
            for (var a = 0; a < actsEtape.length; a++) {
                var actId = actsEtape[a];
                var noeud = etat.noeuds.get(actId);
                if (noeud) {
                    htmlZone += genererActiviteMiniHTML(noeud, carte, nomEtape);
                }
            }
            zoneDepot.innerHTML = htmlZone || '<span class="org-placeholder">Glisser des activités ici</span>';
        }
    }

    // Activités non assignées (dans aucune étape)
    if (listeNonAssignees) {
        var htmlNon = '';
        for (var j = 0; j < activites.length; j++) {
            var actNoeud = etat.noeuds.get(activites[j]);
            if (actNoeud && !activitesAssignees[actNoeud.id]) {
                htmlNon += genererActiviteMiniHTML(actNoeud, carte, null);
            }
        }
        listeNonAssignees.innerHTML = htmlNon || '<span class="org-placeholder">Toutes les activités sont assignées.</span>';

        // Montrer/masquer la section non-assignées
        var sectionNonAssignees = document.getElementById('org-ee-non-assignees');
        if (sectionNonAssignees) {
            sectionNonAssignees.style.display = htmlNon ? '' : 'none';
        }
    }
}

function genererActiviteMiniHTML(noeud, carte, etape) {
    var couleur = carte.obtenirCouleurNoeud(noeud);
    var label = carte.obtenirLabelNoeud(noeud);
    var h = '<div class="org-ee-activite-mini" data-noeud="' + noeud.id + '" draggable="true">';
    h += '<span class="org-pastille" style="background: ' + couleur + '"></span>';
    h += '<span class="org-ee-activite-titre">' + escHtml(noeud.titre || label) + '</span>';
    h += '<span class="org-ee-activite-type">' + label.toUpperCase() + '</span>';
    if (noeud.metadata && noeud.metadata.duree) {
        h += '<span class="org-duree">' + noeud.metadata.duree + ' min</span>';
    }
    if (etape) {
        h += '<button class="org-ee-retirer" data-noeud="' + noeud.id + '" data-etape="' + etape + '" title="Retirer de cette étape">&times;</button>';
    }
    h += '</div>';
    return h;
}

// ============================================================
//  DRAG & DROP (ACTIVITÉS → ÉTAPES EE)
// ============================================================

function configurerDragDrop() {
    var conteneur = document.getElementById('planification-organisateur');
    if (!conteneur) return;

    // Retirer une activité d'une étape spécifique (bouton ×)
    conteneur.addEventListener('click', function(e) {
        var btn = e.target.closest('.org-ee-retirer');
        if (!btn) return;
        e.preventDefault();
        var noeudId = btn.dataset.noeud;
        var etape = btn.dataset.etape;
        var leconId = selectLecon ? selectLecon.value : '';
        if (!leconId || !noeudId || !etape) return;

        var seances = chargerSeances();
        if (!seances[leconId] || !seances[leconId].etapes) return;
        var actsEtape = seances[leconId].etapes[etape].activites;
        var idx = actsEtape.indexOf(noeudId);
        if (idx !== -1) actsEtape.splice(idx, 1);
        sauvegarderSeances(seances);
        afficherCoeurLecon(leconId);
    });

    conteneur.addEventListener('dragstart', function(e) {
        var activiteEl = e.target.closest('.org-ee-activite-mini, .org-activite');
        if (!activiteEl) return;
        e.dataTransfer.setData('text/plain', activiteEl.dataset.noeud);
        e.dataTransfer.effectAllowed = 'move';
        activiteEl.classList.add('org-drag-en-cours');
    });

    conteneur.addEventListener('dragend', function(e) {
        var activiteEl = e.target.closest('.org-ee-activite-mini, .org-activite');
        if (activiteEl) activiteEl.classList.remove('org-drag-en-cours');
        conteneur.querySelectorAll('.org-ee-zone-depot').forEach(function(z) {
            z.classList.remove('org-depot-survol');
        });
    });

    conteneur.addEventListener('dragover', function(e) {
        var zone = e.target.closest('.org-ee-zone-depot, .org-ee-liste');
        if (zone) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (zone.classList.contains('org-ee-zone-depot')) {
                zone.classList.add('org-depot-survol');
            }
        }
    });

    conteneur.addEventListener('dragleave', function(e) {
        var zone = e.target.closest('.org-ee-zone-depot');
        if (zone) zone.classList.remove('org-depot-survol');
    });

    conteneur.addEventListener('drop', function(e) {
        var zone = e.target.closest('.org-ee-zone-depot, .org-ee-liste');
        if (!zone) return;
        e.preventDefault();
        var noeudId = e.dataTransfer.getData('text/plain');
        if (!noeudId) return;

        zone.classList.remove('org-depot-survol');

        var leconId = selectLecon ? selectLecon.value : '';
        if (!leconId) return;

        var seances = chargerSeances();
        if (!seances[leconId]) seances[leconId] = {};
        if (!seances[leconId].etapes) seances[leconId].etapes = creerEtapesVides();

        if (zone.classList.contains('org-ee-zone-depot')) {
            // Ajouter à l'étape cible (sans retirer des autres)
            var etapeCible = zone.dataset.etape;
            if (etapeCible && seances[leconId].etapes[etapeCible]) {
                var actsTarget = seances[leconId].etapes[etapeCible].activites;
                if (actsTarget.indexOf(noeudId) === -1) {
                    actsTarget.push(noeudId);
                }
            }
        } else {
            // Drop dans non-assignées → retirer de toutes les étapes
            for (var i = 0; i < NOMS_ETAPES.length; i++) {
                var actsEtape = seances[leconId].etapes[NOMS_ETAPES[i]].activites;
                var idx = actsEtape.indexOf(noeudId);
                if (idx !== -1) actsEtape.splice(idx, 1);
            }
        }

        sauvegarderSeances(seances);
        afficherCoeurLecon(leconId);
    });
}

// ============================================================
//  PHASE 4 : VUE CALENDRIER
// ============================================================

function rafraichirCalendrier() {
    var carte = window.planificationCarte;
    if (!calendrierContenu || !carte) return;

    // Utiliser la fonction existante de la carte si disponible
    if (typeof carte.genererSeancesHTML === 'function') {
        var html = carte.genererSeancesHTML();
        calendrierContenu.innerHTML = html;

        // Post-traitement : supprimer les liens d'alignement (flèches → ←)
        calendrierContenu.querySelectorAll('.planif-cal-lien-item').forEach(function(el) {
            el.remove();
        });
        // Supprimer les conteneurs de liens maintenant vides
        calendrierContenu.querySelectorAll('.planif-cal-liens').forEach(function(el) {
            if (el.children.length === 0) el.remove();
        });

        // Post-traitement : ajouter les dates aux leçons
        ajouterDatesAuxLecons();

        // Post-traitement : ajouter boutons Copier sur séquences et leçons
        ajouterBoutonsCopier();

        // Ajouter listeners de navigation
        calendrierContenu.querySelectorAll('[data-noeud]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var noeudId = el.dataset.noeud;
                if (noeudId) {
                    var carte2 = window.planificationCarte;
                    if (carte2 && carte2.etat) {
                        var noeud = carte2.etat.noeuds.get(noeudId);
                        if (noeud) {
                            if (noeud.type === 'lecon') {
                                if (noeud.parent) {
                                    selectSequence.value = noeud.parent;
                                    sauvegarderSelectionsOrg();
                                    peuplerSelecteurLecons();
                                }
                                selectLecon.value = noeudId;
                                leconActiveId = noeudId;
                                sauvegarderSelectionsOrg();
                                afficherLecon();
                            } else if (noeud.type === 'sequence') {
                                selectSequence.value = noeudId;
                                sauvegarderSelectionsOrg();
                                peuplerSelecteurLecons();
                            }
                        }
                    }
                }
            });
        });
    }
}

/**
 * Ajoute les dates exactes des séances à côté de chaque leçon dans la vue calendrier.
 * Réutilise la même logique de résolution que afficherEnteteCalendrier.
 */
function ajouterDatesAuxLecons() {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return;
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return;

    try {
        var groupes = db.getSync(window.cle('groupesCours'), null) || [];
        var horaires = db.getSync(window.cle('horaires'), null) || [];
        var calendrier = db.getSync(window.cle('calendrierComplet'), null) || {};
        var cours = db.getSync('cours', []);
        var gcActif = db.getSync('groupeCoursActif', null);
        var coursIdActif = gcActif ? gcActif.coursId : null;
        if (coursIdActif) {
            groupes = groupes.filter(function(g) { return g.coursId === coursIdActif; });
        }
        if (groupes.length === 0) return;

        var JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
        var MOIS_COURTS = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];

        function formaterDateCourte(ds) {
            if (!ds) return '';
            var p = ds.split('-');
            var d = parseInt(p[2], 10);
            var m = parseInt(p[1], 10) - 1;
            var dateObj = new Date(parseInt(p[0], 10), m, d);
            var jour = JOURS[dateObj.getDay()];
            return jour + ' ' + d + ' ' + MOIS_COURTS[m];
        }

        // Pour chaque leçon dans la vue calendrier
        calendrierContenu.querySelectorAll('.planif-cal-lecon-header[data-noeud]').forEach(function(headerEl) {
            var leconId = headerEl.dataset.noeud;
            var lecon = carte.etat.noeuds.get(leconId);
            if (!lecon) return;

            var seq = lecon.parent ? carte.etat.noeuds.get(lecon.parent) : null;
            var numSemaine = (seq && seq.metadata) ? seq.metadata.semaineDebut : null;

            // Rang de la leçon dans la séquence
            var rangLecon = 0;
            if (seq && seq.enfants) {
                var leconsSeq = seq.enfants.filter(function(eid) {
                    var n = carte.etat.noeuds.get(eid);
                    return n && n.type === 'lecon';
                });
                leconsSeq.sort(function(a, b) {
                    var na = carte.etat.noeuds.get(a), nb = carte.etat.noeuds.get(b);
                    return ((na && na.x) || 0) - ((nb && nb.x) || 0);
                });
                for (var r = 0; r < leconsSeq.length; r++) {
                    if (leconsSeq[r] === leconId) { rangLecon = r; break; }
                }
            }

            // Résoudre les dates
            var datesSemaine = {};
            if (numSemaine && calendrier) {
                for (var dateStr in calendrier) {
                    var info = calendrier[dateStr];
                    if (info && info.numeroSemaine === numSemaine && (info.statut === 'cours' || info.statut === 'reprise')) {
                        var jourCal = (info.jourRemplace || info.jourSemaine || '').toLowerCase();
                        if (jourCal) datesSemaine[jourCal] = dateStr;
                    }
                }
            }

            var dates = [];
            for (var i = 0; i < groupes.length; i++) {
                var gc = groupes[i];
                var horaireGC = horaires.filter(function(h) { return h.groupeCoursId === gc.id; });
                horaireGC.sort(function(a, b) { return (a.jour || '').localeCompare(b.jour || '') || (a.heureDebut || '').localeCompare(b.heureDebut || ''); });
                var seanceIdx = 0;
                for (var s = 0; s < horaireGC.length; s++) {
                    if (seanceIdx === rangLecon) {
                        var jourH = (horaireGC[s].jour || '').toLowerCase();
                        var dateExacte = datesSemaine[jourH] || '';
                        if (dateExacte) {
                            dates.push(formaterDateCourte(dateExacte));
                        }
                        break;
                    }
                    seanceIdx++;
                }
            }

            if (dates.length > 0) {
                var uniqueDates = dates.filter(function(d, idx, arr) { return arr.indexOf(d) === idx; });
                var span = document.createElement('span');
                span.className = 'org-cal-date-lecon';
                span.textContent = uniqueDates.join(' / ');
                headerEl.appendChild(span);
            }
        });
    } catch(e) {
        console.warn('Dates leçons calendrier:', e);
    }
}

/**
 * Copie le contenu de la vue calendrier en texte indenté pour traitement de texte.
 */
/**
 * Ajoute des boutons « Copier » sur chaque en-tête de séquence et de leçon.
 */
function ajouterBoutonsCopier() {
    if (!calendrierContenu) return;

    // Boutons sur les séquences
    calendrierContenu.querySelectorAll('.planif-cal-sequence-header').forEach(function(header) {
        var btn = document.createElement('button');
        btn.className = 'org-cal-btn-copier';
        btn.textContent = 'Copier';
        btn.title = 'Copier la séquence';
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var seqEl = header.closest('.planif-cal-sequence');
            if (seqEl) {
                var texte = extraireTexteSequence(seqEl);
                copierDansPressePapiers(texte, btn);
            }
        });
        header.appendChild(btn);
    });

    // Boutons sur les leçons
    calendrierContenu.querySelectorAll('.planif-cal-lecon-header').forEach(function(header) {
        var btn = document.createElement('button');
        btn.className = 'org-cal-btn-copier';
        btn.textContent = 'Copier';
        btn.title = 'Copier la leçon';
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var leconEl = header.closest('.planif-cal-lecon');
            if (leconEl) {
                var texte = extraireTexteLecon(leconEl, '');
                copierDansPressePapiers(texte, btn);
            }
        });
        header.appendChild(btn);
    });
}

/**
 * Extrait le texte d'une leçon depuis le DOM du calendrier.
 */
function extraireTexteLecon(leconEl, indent) {
    var lignes = [];
    var header = leconEl.querySelector('.planif-cal-lecon-header');
    var titreLecon = header ? header.querySelector('.planif-cal-titre') : null;
    var dateLecon = header ? header.querySelector('.org-cal-date-lecon') : null;
    var dureeLecon = header ? header.querySelector('.planif-cal-duree') : null;

    var l = indent + (titreLecon ? titreLecon.textContent.trim() : 'Leçon');
    if (dateLecon) l += '  —  ' + dateLecon.textContent.trim();
    if (dureeLecon) l += '  (' + dureeLecon.textContent.trim() + ')';
    lignes.push(l);

    // Enfants (connaissances/activités)
    leconEl.querySelectorAll('.planif-cal-item').forEach(function(itemEl) {
        var titreItem = itemEl.querySelector('.planif-cal-item-titre');
        var dureeItem = itemEl.querySelector('.planif-cal-duree');
        var txt = indent + '    ' + (titreItem ? titreItem.textContent.trim() : '');
        if (dureeItem) txt += '  (' + dureeItem.textContent.trim() + ')';
        lignes.push(txt);
    });

    var total = leconEl.querySelector('.planif-cal-total');
    if (total) lignes.push(indent + '    ' + total.textContent.trim());

    return lignes.join('\n');
}

/**
 * Extrait le texte d'une séquence complète (titre + toutes ses leçons).
 */
function extraireTexteSequence(seqEl) {
    var lignes = [];
    var titreSeq = seqEl.querySelector('.planif-cal-titre');
    var semaines = seqEl.querySelector('.planif-cal-semaines');

    if (titreSeq) {
        lignes.push(titreSeq.textContent.trim() + (semaines ? '  (' + semaines.textContent.trim() + ')' : ''));
    }

    seqEl.querySelectorAll('.planif-cal-lecon').forEach(function(leconEl) {
        lignes.push(extraireTexteLecon(leconEl, '    '));
    });

    var totalSeq = seqEl.querySelector(':scope > .planif-cal-total');
    if (totalSeq) lignes.push('    ' + totalSeq.textContent.trim());

    return lignes.join('\n');
}

/**
 * Copie du texte dans le presse-papiers et montre un feedback visuel.
 */
function copierDansPressePapiers(texte, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(function() {
            if (btn) {
                btn.textContent = 'Copié ✓';
                setTimeout(function() { btn.textContent = 'Copier'; }, 1500);
            }
        });
    }
}

// ============================================================
//  PHASE 5 : EXPORTS
// ============================================================

function ouvrirModaleExport() {
    if (modaleExport) modaleExport.style.display = 'flex';
}

function fermerModaleExport() {
    if (modaleExport) modaleExport.style.display = 'none';
}

function lancerExport() {
    var audience = document.querySelector('input[name="org-export-audience"]:checked');
    var format = document.querySelector('input[name="org-export-format"]:checked');
    if (!audience || !format) return;

    var estEleve = audience.value === 'eleve';
    var estMD = format.value === 'md';

    var contenu = estMD ? genererExportMD(estEleve) : genererExportTXT(estEleve);

    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var nomCarte = 'plan';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    var suffixe = estEleve ? '_eleve' : '_enseignant';
    var ext = estMD ? '.md' : '.txt';
    var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + suffixe + ext;
    var typeF = estMD ? 'text/markdown' : 'text/plain';

    telechargerFichier(contenu, nomFichier, typeF);
    fermerModaleExport();
}

function genererExportTXT(estEleve) {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return '';
    var etat = carte.etat;
    var seances = chargerSeances();

    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var nomCarte = 'Sans titre';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    var sequences = [];
    var leconsOrphelines = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }
    sequences.sort(function(a, b) { return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999); });

    var txt = '═══════════════════════════════════════\n';
    txt += 'PLAN DE COURS — ' + nomCarte + '\n';
    txt += (estEleve ? 'Document contractuel (élève)' : 'Document pédagogique (enseignant)') + '\n';
    txt += 'Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n';
    txt += '═══════════════════════════════════════\n\n';

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        txt += genererSequenceTXT(seq, etat, seances, carte, estEleve);
    }

    if (leconsOrphelines.length > 0) {
        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉANCES HORS SÉQUENCE\n';
        txt += '───────────────────────────────────────\n';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            txt += genererLeconTXT(leconsOrphelines[p], etat, seances, carte, estEleve);
        }
    }

    return txt;
}

function genererSequenceTXT(seq, etat, seances, carte, estEleve) {
    var semTxt = '';
    if (seq.metadata && seq.metadata.semaineDebut) {
        semTxt = ' (Sem. ' + seq.metadata.semaineDebut;
        if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
            semTxt += '–' + seq.metadata.semaineFin;
        }
        semTxt += ')';
    }

    var txt = '───────────────────────────────────────\n';
    txt += '▌ SÉQUENCE : ' + (seq.titre || 'Sans titre') + semTxt + '\n';
    txt += '───────────────────────────────────────\n';

    var enfants = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    for (var j = 0; j < enfants.length; j++) {
        var ed = etat.noeuds.get(enfants[j]);
        if (!ed) continue;
        if (ed.type === 'lecon') {
            txt += genererLeconTXT(ed, etat, seances, carte, estEleve);
        }
    }
    txt += '\n';
    return txt;
}

function genererLeconTXT(lecon, etat, seances, carte, estEleve) {
    var dureeLecon = lecon.metadata && lecon.metadata.duree ? ' — ' + formatDuree(lecon.metadata.duree) : '';
    var txt = '\n  ┌ SÉANCE : ' + (lecon.titre || 'Sans titre') + dureeLecon + '\n';

    var donnees = seances[lecon.id] || {};

    // Objectif (tous publics)
    var objectif = donnees.objectifPersonnalise;
    if (!objectif) {
        var ideesM = carte.trouverIdeesMaitressesAncetres(lecon.id);
        if (ideesM.length === 1) {
            var titre = (ideesM[0].titre || '...').toLowerCase();
            var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
            objectif = 'Au terme de la leçon, l\u2019élève sera capable ' + prefixe + titre + '.';
        } else if (ideesM.length > 1) {
            objectif = 'Au terme de la leçon, l\u2019élève sera capable :\n';
            for (var k = 0; k < ideesM.length; k++) {
                var t = (ideesM[k].titre || '...').toLowerCase();
                var p = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(t) ? "d'" : 'de ';
                objectif += '    — ' + p + t + (k < ideesM.length - 1 ? ' ;' : '.') + '\n';
            }
        }
    }
    if (objectif) txt += '  │ Objectif : ' + objectif + '\n';

    // Productions associées (élève : dates évaluations + pondérations)
    var productions = carte.chargerProductions();
    var activitesData = donnees.activites || {};
    var prodsVus = {};
    for (var actId in activitesData) {
        if (activitesData[actId].productionId && !prodsVus[activitesData[actId].productionId]) {
            prodsVus[activitesData[actId].productionId] = true;
            var detP = carte.afficherDetailsProduction(activitesData[actId].productionId, productions);
            if (detP) {
                txt += '  │ Évaluation : ' + detP.nomProduction + ' (' + detP.ponderation + ' %)';
                if (detP.dateEcheance) txt += ' — Échéance : ' + detP.dateEcheance;
                txt += '\n';
            }
        }
    }

    if (!estEleve) {
        // Enseignant : détails pédagogiques
        if (donnees.enseignementExplicite && donnees.etapes) {
            var labelsEtapes = {
                ouverture: 'Ouverture',
                modelisation: 'Modélisation',
                pratiqueGuidee: 'Pratique guidée',
                pratiqueAutonome: 'Pratique autonome',
                cloture: 'Clôture'
            };
            for (var ei = 0; ei < NOMS_ETAPES.length; ei++) {
                var ne = NOMS_ETAPES[ei];
                var etapeD = donnees.etapes[ne];
                if (!etapeD || !etapeD.active) continue;
                txt += '  │ [' + labelsEtapes[ne] + ']\n';
                if (etapeD.contenu) {
                    var lignes = etapeD.contenu.split('\n');
                    for (var li = 0; li < lignes.length; li++) {
                        txt += '  │   ' + lignes[li] + '\n';
                    }
                }
                if (etapeD.activites && etapeD.activites.length > 0) {
                    for (var ai = 0; ai < etapeD.activites.length; ai++) {
                        var actNoeud = etat.noeuds.get(etapeD.activites[ai]);
                        if (actNoeud) {
                            txt += '  │   • ' + (actNoeud.titre || carte.obtenirLabelNoeud(actNoeud));
                            if (actNoeud.metadata && actNoeud.metadata.duree) txt += ' (' + formatDuree(actNoeud.metadata.duree) + ')';
                            txt += '\n';
                        }
                    }
                }
            }
        } else {
            // Pas d'EE — lister les activités
            var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
            for (var j = 0; j < enfants.length; j++) {
                var enf = etat.noeuds.get(enfants[j]);
                if (!enf) continue;
                var dureeAct = enf.metadata && enf.metadata.duree ? ' (' + formatDuree(enf.metadata.duree) + ')' : '';
                txt += '  │ • [' + carte.obtenirLabelNoeud(enf) + '] ' + (enf.titre || 'Sans titre') + dureeAct + '\n';
            }
        }
    }

    txt += '  └─\n';
    return txt;
}

function genererExportMD(estEleve) {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return '';
    var etat = carte.etat;
    var seances = chargerSeances();

    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var nomCarte = 'Sans titre';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    var sequences = [];
    var leconsOrphelines = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }
    sequences.sort(function(a, b) { return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999); });

    var md = '# Plan de cours — ' + nomCarte + '\n\n';
    md += '*' + (estEleve ? 'Document contractuel (élève)' : 'Document pédagogique (enseignant)') + '*  \n';
    md += 'Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n\n---\n\n';

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        md += genererSequenceMD(seq, etat, seances, carte, estEleve);
    }

    if (leconsOrphelines.length > 0) {
        md += '## Séances hors séquence\n\n';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            md += genererLeconMD(leconsOrphelines[p], etat, seances, carte, estEleve);
        }
    }

    return md;
}

function genererSequenceMD(seq, etat, seances, carte, estEleve) {
    var semTxt = '';
    if (seq.metadata && seq.metadata.semaineDebut) {
        semTxt = ' (Sem. ' + seq.metadata.semaineDebut;
        if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
            semTxt += '–' + seq.metadata.semaineFin;
        }
        semTxt += ')';
    }

    var md = '## ' + (seq.titre || 'Sans titre') + semTxt + '\n\n';

    var enfants = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    for (var j = 0; j < enfants.length; j++) {
        var ed = etat.noeuds.get(enfants[j]);
        if (!ed) continue;
        if (ed.type === 'lecon') {
            md += genererLeconMD(ed, etat, seances, carte, estEleve);
        }
    }
    return md;
}

function genererLeconMD(lecon, etat, seances, carte, estEleve) {
    var dureeLecon = lecon.metadata && lecon.metadata.duree ? ' — ' + formatDuree(lecon.metadata.duree) : '';
    var md = '### ' + (lecon.titre || 'Sans titre') + dureeLecon + '\n\n';

    var donnees = seances[lecon.id] || {};

    // Objectif
    var objectif = donnees.objectifPersonnalise;
    if (!objectif) {
        var ideesM = carte.trouverIdeesMaitressesAncetres(lecon.id);
        if (ideesM.length === 1) {
            var titre = (ideesM[0].titre || '...').toLowerCase();
            var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
            objectif = 'Au terme de la leçon, l\u2019élève sera capable ' + prefixe + titre + '.';
        } else if (ideesM.length > 1) {
            objectif = 'Au terme de la leçon, l\u2019élève sera capable :\n';
            for (var k = 0; k < ideesM.length; k++) {
                var t = (ideesM[k].titre || '...').toLowerCase();
                var p = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(t) ? "d'" : 'de ';
                objectif += '- ' + p + t + (k < ideesM.length - 1 ? ' ;' : '.') + '\n';
            }
        }
    }
    if (objectif) md += '**Objectif** : ' + objectif + '\n\n';

    // Productions / évaluations
    var productions = carte.chargerProductions();
    var activitesData = donnees.activites || {};
    var prodsVus = {};
    var hasProd = false;
    for (var actId in activitesData) {
        if (activitesData[actId].productionId && !prodsVus[activitesData[actId].productionId]) {
            prodsVus[activitesData[actId].productionId] = true;
            var detP = carte.afficherDetailsProduction(activitesData[actId].productionId, productions);
            if (detP) {
                if (!hasProd) { md += '**Évaluations** :\n'; hasProd = true; }
                md += '- ' + detP.nomProduction + ' (' + detP.ponderation + ' %)';
                if (detP.dateEcheance) md += ' — Échéance : ' + detP.dateEcheance;
                md += '\n';
            }
        }
    }
    if (hasProd) md += '\n';

    if (!estEleve) {
        // Enseignant : étapes EE ou activités brutes
        if (donnees.enseignementExplicite && donnees.etapes) {
            var labelsEtapes = {
                ouverture: 'Ouverture',
                modelisation: 'Modélisation',
                pratiqueGuidee: 'Pratique guidée',
                pratiqueAutonome: 'Pratique autonome',
                cloture: 'Clôture'
            };
            for (var ei = 0; ei < NOMS_ETAPES.length; ei++) {
                var ne = NOMS_ETAPES[ei];
                var etapeD = donnees.etapes[ne];
                if (!etapeD || !etapeD.active) continue;
                md += '#### ' + labelsEtapes[ne] + '\n\n';
                if (etapeD.contenu) md += etapeD.contenu + '\n\n';
                if (etapeD.activites && etapeD.activites.length > 0) {
                    for (var ai = 0; ai < etapeD.activites.length; ai++) {
                        var actNoeud = etat.noeuds.get(etapeD.activites[ai]);
                        if (actNoeud) {
                            md += '- **' + (actNoeud.titre || carte.obtenirLabelNoeud(actNoeud)) + '**';
                            if (actNoeud.metadata && actNoeud.metadata.duree) md += ' (' + formatDuree(actNoeud.metadata.duree) + ')';
                            md += '\n';
                        }
                    }
                    md += '\n';
                }
            }
        } else {
            var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
            if (enfants.length > 0) {
                md += '**Activités** :\n';
                for (var j = 0; j < enfants.length; j++) {
                    var enf = etat.noeuds.get(enfants[j]);
                    if (!enf) continue;
                    var dureeAct = enf.metadata && enf.metadata.duree ? ' (' + formatDuree(enf.metadata.duree) + ')' : '';
                    md += '- [' + carte.obtenirLabelNoeud(enf) + '] ' + (enf.titre || 'Sans titre') + dureeAct + '\n';
                }
                md += '\n';
            }
        }
    }

    md += '---\n\n';
    return md;
}

// ============================================================
//  PERSISTANCE
// ============================================================

function chargerSeances() {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return {};
    try {
        var cleSeances = window.planificationCarte ? window.planificationCarte.CLE_SEANCES : 'planification_seances';
        return db.getSync(window.cle(cleSeances), {});
    } catch(e) { return {}; }
}

function sauvegarderSeances(seances) {
    if (typeof db === 'undefined' || typeof window.cle !== 'function') return;
    try {
        var cleSeances = window.planificationCarte ? window.planificationCarte.CLE_SEANCES : 'planification_seances';
        db.setSync(window.cle(cleSeances), seances);
    } catch(e) {}
}

function sauvegarderDonneeLecon(leconId, cle, valeur) {
    var seances = chargerSeances();
    if (!seances[leconId]) seances[leconId] = {};
    seances[leconId][cle] = valeur;
    sauvegarderSeances(seances);
}

function sauvegarderChoixActivite(leconId, activiteId, retroaction, productionId) {
    var seances = chargerSeances();
    if (!seances[leconId]) seances[leconId] = {};
    if (!seances[leconId].activites) seances[leconId].activites = {};
    seances[leconId].activites[activiteId] = { retroaction: retroaction, productionId: productionId || null };
    sauvegarderSeances(seances);
}

function creerEtapesVides() {
    var etapes = {};
    for (var i = 0; i < NOMS_ETAPES.length; i++) {
        etapes[NOMS_ETAPES[i]] = { active: true, contenu: '', activites: [] };
    }
    return etapes;
}

// ============================================================
//  UTILITAIRES
// ============================================================

function formatDuree(min) {
    if (!min) return '';
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h > 0 ? h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '') : m + ' min';
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

function escHtml(texte) {
    if (!texte) return '';
    var div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
}

function debounce(fn, delai) {
    var timer;
    return function() {
        var ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() { fn.apply(ctx, args); }, delai);
    };
}

// ============================================================
//  ACCÈS DEPUIS LA CARTE (pré-sélection)
// ============================================================

/**
 * Permet à la carte de naviguer vers l'Organisateur avec une leçon pré-sélectionnée.
 * Usage : window.organisateur.naviguerVersLecon(leconId)
 */
function naviguerVersLecon(leconId) {
    // Naviguer vers le sous-onglet Organisateur
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('planification-organisateur');
        // Mettre à jour le bouton actif
        var boutons = document.querySelectorAll('.sous-navigation button');
        boutons.forEach(function(btn) {
            btn.classList.toggle('actif', btn.getAttribute('data-sous-onglet') === 'planification-organisateur');
        });
    }

    // Attendre l'initialisation puis pré-sélectionner
    setTimeout(function() {
        if (!initialise) initialiserModuleOrganisateur();

        var carte = window.planificationCarte;
        if (carte && carte.etat && leconId) {
            var lecon = carte.etat.noeuds.get(leconId);
            if (lecon) {
                // Sélectionner la séquence parente si applicable
                if (lecon.parent && selectSequence) {
                    selectSequence.value = lecon.parent;
                    peuplerSelecteurLecons();
                }
                if (selectLecon) {
                    selectLecon.value = leconId;
                    leconActiveId = leconId;
                    afficherLecon();
                }
            }
        }
    }, 200);
}

// ============================================================
//  EXPORT GLOBAL
// ============================================================

window.initialiserModuleOrganisateur = initialiserModuleOrganisateur;
window.organisateur = {
    naviguerVersLecon: naviguerVersLecon
};

})();
