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
var listeNonAssignees;
var btnExport, modaleExport;

// === NOMS DES ÉTAPES EE ===
var NOMS_ETAPES = ['ouverture', 'modelisation', 'pratiqueGuidee', 'pratiqueAutonome', 'cloture'];

// ============================================================
//  INITIALISATION
// ============================================================

function initialiserModuleOrganisateur() {

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
        btnExport = document.getElementById('org-btn-export');
        modaleExport = document.getElementById('org-modale-export');

        brancherEvenements();
        initialise = true;
    }

    // Rafraîchir les données
    peuplerSelecteurCartes();

    // Restaurer les sélections persistées
    var selections = chargerSelectionsOrg();
    if (selections) {
        if (selections.carte && selectCarte) {
            selectCarte.value = selections.carte;
            // Ne changer la carte QUE si elle diffère de l'active
            // (sinon reconstruireDOM s'exécute pendant display:none → layout cassé)
            var carteModule = window.planificationCarte;
            var indexActuel = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
            if (carteModule && carteModule.changerCarte && indexActuel && indexActuel.active !== selections.carte) {
                carteModule.changerCarte(selections.carte);
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
            var kA = cleNote(leconId);
            if (!kA) return;
            if (!seances[kA]) seances[kA] = {};
            if (!seances[kA].etapes) seances[kA].etapes = creerEtapesVides();
            seances[kA].etapes[etape].active = cb.checked;
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
            var kC = cleNote(leconId);
            if (!kC) return;
            if (!seances[kC]) seances[kC] = {};
            if (!seances[kC].etapes) seances[kC].etapes = creerEtapesVides();
            seances[kC].etapes[etape].contenu = ta.value;
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
            // L'objectif vit sur le nœud (metadata.objectif) depuis le 6 août
            // 2026 : une seule vérité, partagée avec la carte mentale.
            if (window.planificationCarte && window.planificationCarte.definirObjectifsLecon) {
                // Une ligne = un objectif (une leçon en a toujours plusieurs).
                window.planificationCarte.definirObjectifsLecon(leconId, texte ? texte.split('\n') : []);
            }
            if (btnReinitObjectif) btnReinitObjectif.style.display = texte ? '' : 'none';
        });
    }
    if (btnReinitObjectif) {
        btnReinitObjectif.addEventListener('click', function() {
            var leconId = selectLecon ? selectLecon.value : '';
            if (!leconId) return;
            if (window.planificationCarte && window.planificationCarte.definirObjectifsLecon) {
                window.planificationCarte.definirObjectifsLecon(leconId, []);
            }
            btnReinitObjectif.style.display = 'none';
            afficherObjectif(leconId);
        });
    }

    // Guide (partagé avec la carte mentale)
    var btnGuide = document.getElementById('org-btn-guide');
    if (btnGuide) btnGuide.addEventListener('click', function() {
        if (window.planificationCarte && window.planificationCarte.ouvrirGuide) {
            window.planificationCarte.ouvrirGuide();
        }
    });

    // Export
    if (btnExport) btnExport.addEventListener('click', ouvrirModaleExport);
    var btnFermer = document.getElementById('org-modale-fermer');
    var btnAnnuler = document.getElementById('org-modale-annuler');
    var btnTelecharger = document.getElementById('org-modale-telecharger');
    if (btnFermer) btnFermer.addEventListener('click', fermerModaleExport);
    if (btnAnnuler) btnAnnuler.addEventListener('click', fermerModaleExport);
    if (btnTelecharger) btnTelecharger.addEventListener('click', lancerExport);
    var btnTelechargerMD = document.getElementById('org-modale-telecharger-md');
    var btnCopierMD = document.getElementById('org-modale-copier-md');
    if (btnTelechargerMD) btnTelechargerMD.addEventListener('click', lancerExportMD);
    if (btnCopierMD) btnCopierMD.addEventListener('click', copierExportMD);

    // Onglets export/import
    var onglets = document.querySelectorAll('.org-onglet');
    for (var oi = 0; oi < onglets.length; oi++) {
        onglets[oi].addEventListener('click', basculerOnglet);
    }

    // Import MD — délégation sur le panneau import
    var panneauImport = document.getElementById('org-panneau-import');
    if (panneauImport) {
        panneauImport.addEventListener('click', function(e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            if (btn.id === 'org-import-previsualiser') previsualiserImportMD();
            else if (btn.id === 'org-import-confirmer') confirmerImportMD();
            else if (btn.id === 'org-import-annuler') fermerModaleExport();
        });
    }

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
    } catch(e) { console.warn('[Organisateur] localStorage save selections skipped:', e.message || e); }
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

/**
 * Ancrage temporel d'une leçon, pour la résolution des dates réelles.
 *
 * Depuis le 6 août 2026, la semaine est portée par la LEÇON (D3 du plan du
 * planificateur en grille) et non plus par sa séquence parente : la carte
 * n'expose plus que la dérivation.
 *
 * Le rang retourné est celui de la leçon PARMI CELLES DE LA MÊME SEMAINE —
 * c'est lui qui choisit la nième séance dans l'horaire du groupe. Sous
 * l'ancien modèle, toutes les leçons d'une séquence partageaient la semaine de
 * celle-ci, donc « rang dans la séquence » valait « rang dans la semaine » ;
 * ce n'est plus vrai dès qu'une séquence s'étale sur plusieurs semaines.
 *
 * @returns {{ semaine: number|null, rang: number }} semaine null = non planifiée
 */
function ancrageLeconPourDates(carte, leconId) {
    var vide = { semaine: null, rang: 0 };
    if (!carte || !carte.etat || typeof carte.semaineDeLecon !== 'function') return vide;

    var lecon = carte.etat.noeuds.get(leconId);
    if (!lecon) return vide;

    var semaine = carte.semaineDeLecon(lecon);
    if (semaine === null) return vide;

    var memeSemaine = [];
    for (var entry of carte.etat.noeuds) {
        var n = entry[1];
        if (n.type === 'lecon' && carte.semaineDeLecon(n) === semaine) memeSemaine.push(n);
    }
    // Ordre de lecture de la carte (gauche → droite, puis haut → bas), comme
    // partout ailleurs dans le module.
    memeSemaine.sort(function(a, b) { return ((a.x || 0) - (b.x || 0)) || ((a.y || 0) - (b.y || 0)); });

    for (var r = 0; r < memeSemaine.length; r++) {
        if (memeSemaine[r].id === leconId) return { semaine: semaine, rang: r };
    }
    return { semaine: semaine, rang: 0 };
}

/** Tri temporel des séquences : étendue dérivée, non planifiées en fin. */
function trierSequencesParEtendue(carte, sequences) {
    sequences.sort(function(a, b) {
        var ra = carte.rangTemporel(a), rb = carte.rangTemporel(b);
        if (ra !== rb) return ra - rb;
        return (a.x || 0) - (b.x || 0);
    });
    return sequences;
}

function peuplerSelecteursOrganisateur() {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return;
    var etat = carte.etat;

    // Collecter séquences
    var sequences = [];
    for (var entry of etat.noeuds) {
        if (entry[1].type === 'sequence') sequences.push(entry[1]);
    }
    trierSequencesParEtendue(carte, sequences);

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

    // (Plus aucune lecture de la clé des séances ici : l'objectif est porté par
    // le nœud depuis le 6 août 2026.)

    // Vérifier si un objectif a été saisi (porté par le nœud)
    var objectifSaisi = carte.objectifDeLeconParId ? carte.objectifDeLeconParId(leconId) : '';
    if (objectifSaisi) {
        objectifContenu.textContent = objectifSaisi;
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
        objectifContenu.textContent = 'Au terme de la leçon, l\u2019étudiant·e sera capable ' + prefixe + titre + '.';
        objectifContenu.classList.remove('org-placeholder');
    } else {
        var html = 'Au terme de la leçon, l\u2019étudiant·e sera capable\u00a0:<br>';
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

        // 1-2. Semaine de la leçon + son rang dans cette semaine
        var ancrage = ancrageLeconPourDates(carte, leconId);
        var numSemaine = ancrage.semaine;
        var rangLecon = ancrage.rang;

        // 3. Charger données
        var groupes = db.getSync(window.cle('groupesCours'), null) || [];
        var horaires = db.getSync(window.cle('horaires'), null) || [];
        var calendrier = db.getSync(window.cle('calendrierComplet'), null) || {};
        var cours = db.getSync('cours', []);

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
            var groupe = gc.groupeNum || '';
            var label = sigle ? sigle + ' gr.' + groupe : 'Groupe ' + groupe;

            // Séances du groupe (triées par ordre de semaine)
            var hor = gc.horaireId ? horaires.find(function(h) { return h.id === gc.horaireId; }) : null;
            var seances = (hor && hor.seances) ? hor.seances : [];
            // Semaine du dimanche au samedi (format direction des études,
            // 6 août 2026). L'ancien ordre omettait « dimanche » : indexOf -1
            // l'aurait trié en tête par accident, pas par convention.
            var ordreJours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
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
    var donnees = seances[cleNote(leconId)] || {};
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
    var donnees = seances[cleNote(leconId)] || {};

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
        h += '<button class="org-ee-retirer" data-noeud="' + noeud.id + '" data-etape="' + etape + '" title="Retirer de cette étape"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>';
    }
    h += '</div>';
    return h;
}

// ============================================================
//  DRAG & DROP (ACTIVITÉS → ÉTAPES EE)
// ============================================================

function configurerDragDrop() {
    var conteneur = document.getElementById('conception-organisateur');
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
        var kR = cleNote(leconId);
        if (!kR || !seances[kR] || !seances[kR].etapes) return;
        var actsEtape = seances[kR].etapes[etape].activites;
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
        var kD = cleNote(leconId);
        if (!kD) return;
        if (!seances[kD]) seances[kD] = {};
        if (!seances[kD].etapes) seances[kD].etapes = creerEtapesVides();

        if (zone.classList.contains('org-ee-zone-depot')) {
            // Ajouter à l'étape cible (sans retirer des autres)
            var etapeCible = zone.dataset.etape;
            if (etapeCible && seances[kD].etapes[etapeCible]) {
                var actsTarget = seances[kD].etapes[etapeCible].activites;
                if (actsTarget.indexOf(noeudId) === -1) {
                    actsTarget.push(noeudId);
                }
            }
        } else {
            // Drop dans non-assignées → retirer de toutes les étapes
            for (var i = 0; i < NOMS_ETAPES.length; i++) {
                var actsEtape = seances[kD].etapes[NOMS_ETAPES[i]].activites;
                var idx = actsEtape.indexOf(noeudId);
                if (idx !== -1) actsEtape.splice(idx, 1);
            }
        }

        sauvegarderSeances(seances);
        afficherCoeurLecon(leconId);
    });
}

// ============================================================
//  (La « Vue calendrier » — rendu de la carte recyclé puis rogné en
//  post-traitement DOM — est RETIRÉE au lot 2 du planificateur en grille,
//  6 août 2026. La grille de la palette la remplace ; l'Organisateur, lui,
//  garde l'en-tête de dates réelles via ancrageLeconPourDates.)

// ============================================================
//  PHASE 5 : EXPORTS
// ============================================================

function ouvrirModaleExport() {
    if (!modaleExport) return;
    // Mettre à jour le résumé avec les statistiques
    var resume = document.getElementById('org-export-resume');
    if (resume) {
        var stats = compterElementsExport();
        resume.textContent = 'Exporte ' + stats.sequences + ' séquence' + (stats.sequences > 1 ? 's' : '') +
            ', ' + stats.lecons + ' leçon' + (stats.lecons > 1 ? 's' : '') +
            ' et ' + stats.noeuds + ' nœud' + (stats.noeuds > 1 ? 's' : '') +
            ' d\u2019alignement dans un fichier JSON réimportable via l\u2019alignement pédagogique.';
    }
    // Réinitialiser sur l'onglet Export
    var panneauExport = document.getElementById('org-panneau-export');
    var panneauImport = document.getElementById('org-panneau-import');
    if (panneauExport) panneauExport.style.display = '';
    if (panneauImport) panneauImport.style.display = 'none';
    var onglets = document.querySelectorAll('.org-onglet');
    for (var i = 0; i < onglets.length; i++) {
        var estExport = onglets[i].getAttribute('data-onglet') === 'export';
        onglets[i].classList.toggle('actif', estExport);
        onglets[i].style.borderBottomColor = estExport ? 'var(--accent)' : 'transparent';
        onglets[i].style.color = estExport ? 'var(--texte)' : 'var(--texte-secondaire)';
    }
    reinitialiserImport();
    modaleExport.classList.add('actif');
}

function fermerModaleExport() {
    if (modaleExport) modaleExport.classList.remove('actif');
}

function compterElementsExport() {
    var carte = window.planificationCarte;
    var stats = { sequences: 0, lecons: 0, noeuds: 0 };
    if (!carte || !carte.etat) return stats;
    for (var entry of carte.etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') stats.sequences++;
        else if (nd.type === 'lecon') stats.lecons++;
        stats.noeuds++;
    }
    return stats;
}

function lancerExport() {
    var json = genererExportJSON();
    if (!json) return;

    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var nomCarte = 'alignement';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + '.json';
    telechargerFichier(JSON.stringify(json, null, 2), nomFichier, 'application/json');
    fermerModaleExport();
}

function lancerExportMD() {
    var md = genererExportMD(false);
    if (!md) return;

    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var nomCarte = 'alignement';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === index.active; });
        if (c) nomCarte = c.nom;
    }

    var nomFichier = nomCarte.replace(/[^a-zA-Z0-9\u00C0-\u017F _-]/g, '') + '.md';
    telechargerFichier(md, nomFichier, 'text/markdown');
    fermerModaleExport();
}

function copierExportMD() {
    var md = genererExportMD(false);
    if (!md) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(function() {
            notifications.succes('Plan copié dans le presse-papiers');
            fermerModaleExport();
        }).catch(function() {
            // Fallback : sélection textarea
            copierMDFallback(md);
        });
    } else {
        copierMDFallback(md);
    }
}

function copierMDFallback(md) {
    var ta = document.createElement('textarea');
    ta.value = md;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    notifications.succes('Plan copié dans le presse-papiers');
    fermerModaleExport();
}

// ---- Onglets export/import ----

function basculerOnglet(e) {
    var cible = e.currentTarget.getAttribute('data-onglet');
    var onglets = document.querySelectorAll('.org-onglet');
    for (var i = 0; i < onglets.length; i++) {
        var estActif = onglets[i].getAttribute('data-onglet') === cible;
        onglets[i].classList.toggle('actif', estActif);
        onglets[i].style.borderBottomColor = estActif ? 'var(--accent)' : 'transparent';
        onglets[i].style.color = estActif ? 'var(--texte)' : 'var(--texte-secondaire)';
    }
    var panneauExport = document.getElementById('org-panneau-export');
    var panneauImport = document.getElementById('org-panneau-import');
    if (panneauExport) panneauExport.style.display = cible === 'export' ? '' : 'none';
    if (panneauImport) panneauImport.style.display = cible === 'import' ? '' : 'none';
}

function previsualiserImportMD() {
    var textarea = document.getElementById('org-import-md-texte');
    var resume = document.getElementById('org-import-resume');
    var btnConfirmer = document.getElementById('org-import-confirmer');
    if (!textarea || !resume || !btnConfirmer) return;

    var texte = textarea.value.trim();
    if (!texte) {
        resume.style.display = 'block';
        resume.innerHTML = '<span style="color: var(--danger)">Aucun texte à analyser.</span>';
        btnConfirmer.disabled = true;
        return;
    }

    var parsed = parserPlanMD(texte);
    var nbSeq = parsed.sequences.length;
    var nbLecons = 0;
    for (var s = 0; s < parsed.sequences.length; s++) {
        nbLecons += parsed.sequences[s].lecons.length;
    }
    nbLecons += parsed.orphelines.length;

    if (nbSeq === 0 && nbLecons === 0) {
        resume.style.display = 'block';
        resume.innerHTML = '<span style="color: var(--danger)">Aucune séquence ou leçon détectée. Vérifie le format des marqueurs [Séquence] et [Leçon].</span>';
        btnConfirmer.disabled = true;
        return;
    }

    var html = '<strong>' + nbSeq + ' séquence' + (nbSeq > 1 ? 's' : '') + '</strong>';
    html += ' et <strong>' + nbLecons + ' leçon' + (nbLecons > 1 ? 's' : '') + '</strong> détectées.';
    if (parsed.orphelines.length > 0) {
        html += '<br><span style="color: var(--texte-secondaire)">' + parsed.orphelines.length + ' leçon' + (parsed.orphelines.length > 1 ? 's' : '') + ' hors séquence.</span>';
    }

    // Détail par séquence
    html += '<ul style="margin: 0.5rem 0 0; padding-left: 1.2rem; font-size: 0.8rem; color: var(--texte-secondaire)">';
    for (var i = 0; i < parsed.sequences.length; i++) {
        var sq = parsed.sequences[i];
        html += '<li>' + echapperHtml(sq.titre);
        // Étendue prévisualisée : dérivée des semaines lues sur les LEÇONS.
        var semaines = sq.lecons
            .map(function(l) { return l.semaine; })
            .filter(function(s) { return typeof s === 'number'; });
        if (semaines.length > 0) {
            var minSem = Math.min.apply(null, semaines);
            var maxSem = Math.max.apply(null, semaines);
            html += ' <span style="opacity:0.6">(Sem. ' + minSem + (maxSem !== minSem ? '–' + maxSem : '') + ')</span>';
        }
        html += ' — ' + sq.lecons.length + ' leçon' + (sq.lecons.length > 1 ? 's' : '') + '</li>';
    }
    html += '</ul>';

    resume.style.display = 'block';
    resume.innerHTML = html;
    btnConfirmer.disabled = false;
}

function confirmerImportMD() {
    var textarea = document.getElementById('org-import-md-texte');
    if (!textarea) return;

    var texte = textarea.value.trim();
    if (!texte) return;

    var radioNouvelle = document.querySelector('input[name="org-import-cible"][value="nouvelle"]');
    var nouvelleCarteMode = radioNouvelle ? radioNouvelle.checked : true;

    var resultat = importerPlanDepuisMD(texte, nouvelleCarteMode);

    fermerModaleExport();
    reinitialiserImport();

    notifications.succes(
        resultat.sequences + ' séquence' + (resultat.sequences > 1 ? 's' : '') +
        ' et ' + resultat.lecons + ' leçon' + (resultat.lecons > 1 ? 's' : '') +
        ' importées'
    );
}

function reinitialiserImport() {
    var textarea = document.getElementById('org-import-md-texte');
    var resume = document.getElementById('org-import-resume');
    var btnConfirmer = document.getElementById('org-import-confirmer');
    if (textarea) textarea.value = '';
    if (resume) { resume.style.display = 'none'; resume.innerHTML = ''; }
    if (btnConfirmer) btnConfirmer.disabled = true;
}

function genererExportJSON() {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) return null;
    var etat = carte.etat;

    var index = window.planificationDonnees ? window.planificationDonnees.getIndex() : null;
    var carteId = index ? index.active : null;
    var nomCarte = 'Sans titre';
    if (index && index.cartes) {
        var c = index.cartes.find(function(cc) { return cc.id === carteId; });
        if (c) nomCarte = c.nom;
    }

    // Données de la carte (noeuds + liens)
    var donneesCarteBrutes = carteId && window.planificationDonnees
        ? window.planificationDonnees.chargerCarte(carteId)
        : null;

    var donneesCarteExport = donneesCarteBrutes || {
        compteur: etat.compteur,
        compteurLiens: etat.compteurLiens,
        noeuds: Array.from(etat.noeuds.values()),
        liens: Array.from(etat.liens.values())
    };

    // Données des séances (plan de leçon)
    var seances = chargerSeances();

    return {
        version: '1.0',
        type: 'monitorage-alignement',
        exportDate: new Date().toISOString(),
        carte: {
            id: carteId,
            nom: nomCarte,
            donnees: donneesCarteExport
        },
        seances: seances
    };
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

    // Ordre hiérarchique (voie A, 6 août 2026) : chaque sous-séquence a sa
    // propre section, une seule fois, juste après son parent. Un scan plat
    // dupliquerait les sous-séquences (racine + sous le parent).
    var leconsOrphelines = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }
    var sequences = carte.listerSequencesHierarchie('temporel').map(function(e) { return e.seq; });

    var txt = '═══════════════════════════════════════\n';
    txt += 'PLAN DE COURS — ' + nomCarte + '\n';
    txt += (estEleve ? 'Document contractuel (étudiant·e)' : 'Document pédagogique (enseignant·e)') + '\n';
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
    var etendue = carte.formaterEtendue(carte.etendueTemporelle(seq));
    var semTxt = etendue ? ' (' + etendue + ')' : '';

    // cheminSequence(racine) = son titre seul ; pour une sous-séquence,
    // « Parent › Enfant » — le document plat garde la hiérarchie lisible.
    var txt = '───────────────────────────────────────\n';
    txt += '▌ SÉQUENCE : ' + carte.cheminSequence(seq) + semTxt + '\n';
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

    var donnees = seances[cleNote(lecon.id)] || {};

    // Objectif (tous publics) — porté par le nœud depuis le 6 août 2026 ;
    // à défaut, dérivé des idées maîtresses ancêtres (ci-dessous).
    var objectif = carte.objectifDeLeconParId ? carte.objectifDeLeconParId(lecon.id) : '';
    if (!objectif) {
        var ideesM = carte.trouverIdeesMaitressesAncetres(lecon.id);
        if (ideesM.length === 1) {
            var titre = (ideesM[0].titre || '...').toLowerCase();
            var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
            objectif = 'Au terme de la leçon, l\u2019étudiant·e sera capable ' + prefixe + titre + '.';
        } else if (ideesM.length > 1) {
            objectif = 'Au terme de la leçon, l\u2019étudiant·e sera capable :\n';
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

    // Ordre hiérarchique (voie A, 6 août 2026) : chaque sous-séquence a sa
    // propre section, une seule fois, juste après son parent. Un scan plat
    // dupliquerait les sous-séquences (racine + sous le parent).
    var leconsOrphelines = [];
    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }
    var sequences = carte.listerSequencesHierarchie('temporel').map(function(e) { return e.seq; });

    var md = '# Plan de cours — ' + nomCarte + '\n';
    md += '> Exporté le ' + new Date().toLocaleDateString('fr-CA') + '\n\n---\n\n';

    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        md += genererSequenceMD(seq, etat, seances, carte, estEleve);
    }

    if (leconsOrphelines.length > 0) {
        md += '## Séances hors séquence [Orphelines]\n\n';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            md += genererLeconMD(leconsOrphelines[p], etat, seances, carte, estEleve);
        }
    }

    return md;
}

// L'ancrage temporel du format Markdown a suivi le modèle (6 août 2026) : il
// est porté par la LEÇON, pas par la séquence. Le marqueur de séquence garde
// une étendue « Sem. 3–5 » parce qu'elle se lit bien dans un plan de cours,
// mais elle est DÉRIVÉE et purement informative — l'import ne la relit pas.
// Sans quoi un aller-retour pourrait réécrire dans la carte une étendue de
// séquence que le modèle ne sait plus stocker.
function genererSequenceMD(seq, etat, seances, carte, estEleve) {
    var etendue = carte.formaterEtendue(carte.etendueTemporelle(seq));
    var marqueur = etendue ? ' [Séquence | ' + etendue + ']' : ' [Séquence]';

    var md = '## ' + (seq.titre || 'Sans titre') + marqueur + '\n\n';

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
    // Marqueur : [Leçon], [Leçon | 2 pér.], [Leçon | Sem. 3], [Leçon | 2 pér. | Sem. 3]
    // La semaine est ici la donnée qui FAIT FOI — c'est celle que l'import relit.
    var champs = [];
    if (lecon.metadata && lecon.metadata.duree) champs.push(formatDuree(lecon.metadata.duree));
    var semLecon = carte.semaineDeLecon(lecon);
    if (semLecon !== null) champs.push('Sem. ' + semLecon);
    var marqueurLecon = champs.length ? ' [Leçon | ' + champs.join(' | ') + ']' : ' [Leçon]';
    var md = '### ' + (lecon.titre || 'Sans titre') + marqueurLecon + '\n\n';

    var donnees = seances[cleNote(lecon.id)] || {};

    // Objectif — porté par le nœud depuis le 6 août 2026 ; à défaut,
    // dérivé des idées maîtresses ancêtres (ci-dessous).
    var objectif = carte.objectifDeLeconParId ? carte.objectifDeLeconParId(lecon.id) : '';
    if (!objectif) {
        var ideesM = carte.trouverIdeesMaitressesAncetres(lecon.id);
        if (ideesM.length === 1) {
            var titre = (ideesM[0].titre || '...').toLowerCase();
            var prefixe = /^[aeiouyàâéèêëïîôùûüæœh]/i.test(titre) ? "d'" : 'de ';
            objectif = 'Au terme de la leçon, l\u2019étudiant·e sera capable ' + prefixe + titre + '.';
        } else if (ideesM.length > 1) {
            objectif = 'Au terme de la leçon, l\u2019étudiant·e sera capable :\n';
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
    var partiesEval = [];
    for (var actId in activitesData) {
        if (activitesData[actId].productionId && !prodsVus[activitesData[actId].productionId]) {
            prodsVus[activitesData[actId].productionId] = true;
            var detP = carte.afficherDetailsProduction(activitesData[actId].productionId, productions);
            if (detP) {
                var txt = detP.nomProduction + ' (' + detP.ponderation + ' %)';
                if (detP.dateEcheance) txt += ' — Échéance : ' + detP.dateEcheance;
                partiesEval.push(txt);
            }
        }
    }
    if (partiesEval.length > 0) md += '**Évaluation** : ' + partiesEval.join(' ; ') + '\n\n';

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
//  PARSER MD (import aller-retour)
// ============================================================

/**
 * Convertit "50 min", "1h15", "1h", "90 min" → nombre de minutes
 */
function parserDuree(texte) {
    var matchHM = texte.match(/(\d+)\s*h\s*(\d*)/);
    if (matchHM) return parseInt(matchHM[1]) * 60 + (matchHM[2] ? parseInt(matchHM[2]) : 0);
    var matchMin = texte.match(/(\d+)\s*min/);
    if (matchMin) return parseInt(matchMin[1]);
    return 0;
}

/**
 * Parse un plan de cours en Markdown et retourne une structure
 * { sequences: [], orphelines: [] }
 *
 * Chaque séquence : { titre, lecons: [] }
 * Chaque leçon : { titre, dureeMin, semaine, objectif, evaluation }
 *
 * L'ancrage temporel est lu sur la LEÇON (`[Leçon | 2 pér. | Sem. 3]`), jamais
 * sur la séquence : depuis le 6 août 2026 la séquence n'a plus d'étendue
 * propre, elle la dérive de ses leçons. Un « Sem. X » resté sur une ligne de
 * séquence (fichier exporté avant ce jour) est toléré par la regex pour ne pas
 * casser le parsing, mais sa valeur est IGNORÉE — la reporter sur les leçons
 * reviendrait à inventer une répartition que l'enseignant n'a pas écrite.
 */
function parserPlanMD(texte) {
    var resultat = { sequences: [], orphelines: [] };
    if (!texte || !texte.trim()) return resultat;

    var sequenceCourante = null;
    var leconCourante = null;
    var champCourant = null;

    var lignes = texte.split('\n');

    for (var i = 0; i < lignes.length; i++) {
        var ligne = lignes[i];

        // Séquence : ## Titre [Séquence | Sem. X–Y]  ou  ## Titre [Séquence]
        // L'étendue est tolérée à la lecture mais non capturée : elle est dérivée.
        var matchSeq = ligne.match(/^##\s+(.+?)\s*\[Séquence(?:\s*\|\s*Sem\.\s*\d+(?:\s*[–-]\s*\d+)?)?\]/);
        if (matchSeq) {
            sequenceCourante = {
                titre: matchSeq[1].trim(),
                lecons: []
            };
            resultat.sequences.push(sequenceCourante);
            leconCourante = null;
            champCourant = null;
            continue;
        }

        // Orphelines : ## ... [Orphelines]
        if (/^##\s+.*\[Orphelines\]/.test(ligne)) {
            sequenceCourante = null;
            leconCourante = null;
            champCourant = null;
            continue;
        }

        // Leçon : ### Titre [Leçon | durée | Sem. N] — les deux champs sont
        // optionnels et leur ordre est indifférent ; « Sem. N » est reconnu au
        // motif, le reste est lu comme une durée.
        var matchLecon = ligne.match(/^###\s+(.+?)\s*\[Leçon(?:\s*\|\s*(.+?))?\]/);
        if (matchLecon) {
            var dureeMin = 0;
            var semaineLecon = null;
            if (matchLecon[2]) {
                var champs = matchLecon[2].split('|');
                for (var c = 0; c < champs.length; c++) {
                    var champ = champs[c].trim();
                    if (!champ) continue;
                    var mSem = champ.match(/^Sem\.\s*(\d+)$/);
                    if (mSem) {
                        var val = parseInt(mSem[1], 10);
                        if (val >= 1) semaineLecon = val;
                    } else if (!dureeMin) {
                        dureeMin = parserDuree(champ);
                    }
                }
            }
            leconCourante = {
                titre: matchLecon[1].trim(),
                dureeMin: dureeMin,
                semaine: semaineLecon,
                objectif: '',
                evaluation: ''
            };
            if (sequenceCourante) {
                sequenceCourante.lecons.push(leconCourante);
            } else {
                resultat.orphelines.push(leconCourante);
            }
            champCourant = null;
            continue;
        }

        // Champs de leçon (uniquement si on est dans une leçon)
        if (leconCourante) {
            var matchObj = ligne.match(/^\*\*Objectif\*\*\s*:\s*(.*)/);
            if (matchObj) { leconCourante.objectif = matchObj[1].trim(); champCourant = 'objectif'; continue; }

            var matchEval = ligne.match(/^\*\*Évaluation\*\*\s*:\s*(.*)/);
            if (matchEval) { leconCourante.evaluation = matchEval[1].trim(); champCourant = 'evaluation'; continue; }

            // Continuation multi-ligne : texte qui n'est pas un nouveau marqueur
            if (champCourant && ligne.trim() && !(/^#{1,3}\s/.test(ligne)) && !(/^\*\*\w/.test(ligne))) {
                leconCourante[champCourant] += '\n' + ligne.trim();
            } else if (!ligne.trim() || /^---/.test(ligne)) {
                // Ligne vide ou séparateur : fin du champ courant
                champCourant = null;
            }
        }
    }

    return resultat;
}

// ============================================================
//  IMPORT MD → NŒUDS CARTE
// ============================================================

/**
 * Importe un plan MD dans la carte mentale.
 * @param {string} texte - Plan en Markdown avec marqueurs [Séquence] [Leçon]
 * @param {boolean} nouvelleCarteMode - true = créer une nouvelle carte, false = ajouter à l'active
 * @returns {{ sequences: number, lecons: number }} Compteurs d'éléments créés
 */
function importerPlanDepuisMD(texte, nouvelleCarteMode) {
    var carte = window.planificationCarte;
    if (!carte || !carte.etat) {
        console.error('importerPlanDepuisMD : carte mentale non initialisée');
        return { sequences: 0, lecons: 0 };
    }

    var parsed = parserPlanMD(texte);
    var nbSeq = parsed.sequences.length;
    var nbLecons = 0;
    for (var s = 0; s < parsed.sequences.length; s++) {
        nbLecons += parsed.sequences[s].lecons.length;
    }
    nbLecons += parsed.orphelines.length;

    if (nbSeq === 0 && nbLecons === 0) return { sequences: 0, lecons: 0 };

    // Créer nouvelle carte ou calculer l'offset vertical pour l'ajout
    var offsetY = 0;
    if (nouvelleCarteMode) {
        carte.nouvelleCarte('Import MD');
    } else {
        // Trouver le max Y pour placer les nouveaux nœuds en dessous
        for (var entry of carte.etat.noeuds) {
            var nd = entry[1];
            if (nd.y > offsetY) offsetY = nd.y;
        }
        if (offsetY > 0) offsetY += 300;
    }

    var noeuds = [];
    var compteur = carte.etat.compteur;
    var LAYOUT_X_START = 200;
    var LAYOUT_X_GAP = 350;
    var LAYOUT_COLS = 4;
    var LAYOUT_ROW_GAP = 180;
    var LAYOUT_Y_BASE = 80;
    var LAYOUT_Y_PADDING = 120;
    var ySeq = offsetY + 100;

    // Créer les séquences et leurs leçons
    for (var si = 0; si < parsed.sequences.length; si++) {
        var seq = parsed.sequences[si];
        var seqId = 'planif-noeud_' + (++compteur);
        var seqNoeud = {
            id: seqId,
            type: 'sequence',
            titre: seq.titre,
            x: LAYOUT_X_START,
            y: ySeq,
            parent: null,
            enfants: [],
            metadata: {},
            cloneSourceId: null
        };
        // Rien d'ancré sur la séquence : son étendue se dérive de ses leçons.

        // Leçons : grille (4 colonnes max) quand 5+ leçons, ligne sinon
        for (var li = 0; li < seq.lecons.length; li++) {
            var lecon = seq.lecons[li];
            var leconId = 'planif-noeud_' + (++compteur);
            var col = seq.lecons.length >= 5 ? (li % LAYOUT_COLS) : li;
            var row = seq.lecons.length >= 5 ? Math.floor(li / LAYOUT_COLS) : 0;
            var leconNoeud = {
                id: leconId,
                type: 'lecon',
                titre: lecon.titre,
                x: LAYOUT_X_START + 60 + (col * LAYOUT_X_GAP),
                y: ySeq + LAYOUT_Y_BASE + (row * LAYOUT_ROW_GAP),
                parent: seqId,
                enfants: [],
                metadata: {},
                cloneSourceId: null
            };
            if (lecon.dureeMin > 0) leconNoeud.metadata.duree = lecon.dureeMin;
            if (lecon.semaine != null) leconNoeud.metadata.semaine = lecon.semaine;
            seqNoeud.enfants.push(leconId);
            noeuds.push(leconNoeud);

            // L'objectif est une propriété du nœud (une seule vérité,
            // suit la leçon aux copies et imports inter-trimestre).
            if (lecon.objectif) leconNoeud.metadata.objectif = lecon.objectif;
        }

        noeuds.push(seqNoeud);
        var nbRows = seq.lecons.length >= 5 ? Math.ceil(seq.lecons.length / LAYOUT_COLS) : 1;
        ySeq += LAYOUT_Y_BASE + (nbRows * LAYOUT_ROW_GAP) + LAYOUT_Y_PADDING;
    }

    // Leçons orphelines (même grille si 5+)
    var nbOrph = parsed.orphelines.length;
    for (var oi = 0; oi < nbOrph; oi++) {
        var orp = parsed.orphelines[oi];
        var orpId = 'planif-noeud_' + (++compteur);
        var oCol = nbOrph >= 5 ? (oi % LAYOUT_COLS) : oi;
        var oRow = nbOrph >= 5 ? Math.floor(oi / LAYOUT_COLS) : 0;
        var orpNoeud = {
            id: orpId,
            type: 'lecon',
            titre: orp.titre,
            x: LAYOUT_X_START + (oCol * LAYOUT_X_GAP),
            y: ySeq + LAYOUT_Y_BASE + (oRow * LAYOUT_ROW_GAP),
            parent: null,
            enfants: [],
            metadata: {},
            cloneSourceId: null
        };
        if (orp.dureeMin > 0) orpNoeud.metadata.duree = orp.dureeMin;
        if (orp.semaine != null) orpNoeud.metadata.semaine = orp.semaine;
        noeuds.push(orpNoeud);

        if (orp.objectif) orpNoeud.metadata.objectif = orp.objectif;
    }

    // Mettre à jour le compteur et injecter
    carte.etat.compteur = compteur;
    carte.injecterNoeuds(noeuds);

    // (Plus rien à écrire dans la clé des séances : l'objectif voyage sur le
    // nœud et les notes de leçon ont été retirées.)

    return { sequences: nbSeq, lecons: nbLecons };
}

// ============================================================
//  PERSISTANCE
// ============================================================

/**
 * Clé composite d'une note de leçon (#367, 7 août 2026) — déléguée à la porte
 * unique de `planification-carte.js`. Rend null si aucune carte n'est
 * identifiable : l'appelant s'abstient alors, plutôt que d'écrire sous une clé
 * nue qui recréerait l'aliasing entre cartes que ce chantier retire.
 */
function cleNote(leconId) {
    if (window.planificationCarte && typeof window.planificationCarte.cleNoteLecon === 'function') {
        return window.planificationCarte.cleNoteLecon(leconId);
    }
    return null;
}

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
    } catch(e) { console.warn('[Organisateur] sauvegarderSeances skipped:', e.message || e); }
}

function sauvegarderDonneeLecon(leconId, cle, valeur) {
    var seances = chargerSeances();
    var kS = cleNote(leconId);
    if (!kS) return;
    if (!seances[kS]) seances[kS] = {};
    seances[kS][cle] = valeur;
    sauvegarderSeances(seances);
}

function sauvegarderChoixActivite(leconId, activiteId, retroaction, productionId) {
    var seances = chargerSeances();
    var kAc = cleNote(leconId);
    if (!kAc) return;
    if (!seances[kAc]) seances[kAc] = {};
    if (!seances[kAc].activites) seances[kAc].activites = {};
    seances[kAc].activites[activiteId] = { retroaction: retroaction, productionId: productionId || null };
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
    // BOM uniquement pour les fichiers texte (pas JSON)
    var prefixe = type.indexOf('json') === -1 ? '\uFEFF' : '';
    var blob = new Blob([prefixe + contenu], { type: type + ';charset=utf-8' });
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
        afficherSousSection('conception-organisateur');
        // Mettre à jour le bouton actif
        var boutons = document.querySelectorAll('.sous-navigation button');
        boutons.forEach(function(btn) {
            btn.classList.toggle('actif', btn.getAttribute('data-sous-onglet') === 'conception-organisateur');
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
    naviguerVersLecon: naviguerVersLecon,
    // Fonctions pures exposées pour la vérification automatisée : le
    // découpage des marqueurs `[Leçon | 2 pér. | Sem. 3]` est la logique la
    // plus facile à casser sans que rien ne le signale à l'écran.
    parserPlanMD: parserPlanMD,
    ancrageLeconPourDates: ancrageLeconPourDates
};

})();
