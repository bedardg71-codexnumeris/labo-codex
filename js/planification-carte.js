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
    initialise: false,
    modeIndividuel: null
};

// === FLAG D'ACTIVATION ===
let planificationActive = false;

// === UNDO / REDO ===
const UNDO_MAX = 50;
let pileUndo = [];
let pileRedo = [];
let _undoBatch = false;

// === CONFIGURATION DES TYPES ===
const TYPES = {
    // Objectifs
    'competence':     { label: 'Compétence',       couleur: 'var(--planif-couleur-competence)' },
    'idee-maitresse': { label: 'Idée maîtresse',   couleur: 'var(--planif-couleur-idee-maitresse)' },
    // Connaissances
    'connaissance':   { label: 'Information',       couleur: 'var(--planif-couleur-connaissance)' },
    'strategie':      { label: 'Stratégie',         couleur: 'var(--planif-couleur-strategie)' },
    'condition':      { label: 'Condition',          couleur: 'var(--planif-couleur-condition)' },
    'prerequis':      { label: 'Préalable',         couleur: 'var(--planif-couleur-prerequis)' },
    // Conteneurs
    'sequence':       { label: 'Séquence',          couleur: 'var(--planif-couleur-sequence)',  conteneur: true },
    'lecon':          { label: 'Leçon',             couleur: 'var(--planif-couleur-lecon)',     conteneur: true },
    // Activités
    'activite':       { label: 'Apprentissage',     couleur: 'var(--planif-couleur-activite)' },
    'soutien':        { label: 'Soutien',           couleur: 'var(--planif-couleur-soutien)' },
    'revision':       { label: 'Révision',          couleur: 'var(--planif-couleur-revision)' }
};

const TYPES_LIENS = [
    { id: 'vise',           label: 'vise' },
    { id: 'mobilise',       label: 'mobilise' },
    { id: 'prerequis_de',   label: 'prérequis de' },
    { id: 'evalue_par',     label: 'évalué par' },
    { id: 'soutenu_par',    label: 'soutenu par' },
    { id: 'revise_dans',    label: 'révisé dans' },
    { id: 'sequence_avant', label: 'séquencé avant' }
];

// === CONSTANTES ===
const OFFSET_X = 5000;
const OFFSET_Y = 3000;
const ESPACE_W = 10000;
const ESPACE_H = 6000;

// === RÉFÉRENCES DOM (initialisées dans initialiser()) ===
let zoneTravail, espace, espaceWrapper, coucheNoeuds, coucheLiens, canvas, lienTemp;
let panneau, menuLien, rectSelection;
let panneauSeances, panneauSeancesContenu, btnSeances;
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
        metadata: {}
    };
    etat.noeuds.set(id, donnees);

    const estConteneur = config.conteneur === true;

    const el = document.createElement('div');
    el.className = (estConteneur ? 'planif-noeud planif-conteneur' : 'planif-noeud') + ' planif-type-' + type;
    el.id = id;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.borderColor = config.couleur;

    if (estConteneur) {
        el.innerHTML =
            '<div class="planif-noeud-entete">' +
                '<span class="planif-noeud-pastille" style="background: ' + config.couleur + '"></span>' +
                '<span class="planif-noeud-type">' + config.label + '</span>' +
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
                '<span class="planif-noeud-pastille" style="background: ' + config.couleur + '"></span>' +
                '<span class="planif-noeud-type">' + config.label + '</span>' +
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
    // Reset mode individuel
    if (etat.modeIndividuel) {
        var mEl = document.getElementById(etat.modeIndividuel);
        if (mEl) mEl.classList.remove('planif-mode-individuel');
        etat.modeIndividuel = null;
    }
}

// === PANNEAU LATÉRAL ===
function ouvrirPanneau(id) {
    const donnees = etat.noeuds.get(id);
    if (!donnees) return;
    const config = TYPES[donnees.type];

    document.getElementById('planif-panneau-pastille').style.background = config.couleur;
    document.getElementById('planif-panneau-type').textContent = config.label;
    document.getElementById('planif-panneau-titre').value = donnees.titre;
    document.getElementById('planif-panneau-description').value = donnees.description || '';

    // Champs extra selon le type
    const extra = document.getElementById('planif-panneau-extra');
    extra.innerHTML = '';

    if (donnees.type === 'activite' || donnees.type === 'lecon') {
        extra.innerHTML +=
            '<label for="planif-panneau-duree">Durée (minutes)</label>' +
            '<input type="number" id="planif-panneau-duree" value="' + (donnees.metadata.duree || '') + '" min="1" max="180" placeholder="50">';
        var dureeInput = extra.querySelector('#planif-panneau-duree');
        dureeInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        dureeInput.addEventListener('input', function(e) {
            donnees.metadata.duree = parseInt(e.target.value) || null;
            sauvegarder();
        });
    }

    if (donnees.type === 'sequence') {
        extra.innerHTML +=
            '<label for="planif-panneau-sem-debut">Semaine début</label>' +
            '<input type="number" id="planif-panneau-sem-debut" value="' + (donnees.metadata.semaineDebut || '') + '" min="1" max="15" placeholder="1">' +
            '<label for="planif-panneau-sem-fin">Semaine fin</label>' +
            '<input type="number" id="planif-panneau-sem-fin" value="' + (donnees.metadata.semaineFin || '') + '" min="1" max="15" placeholder="5">';
        var semDebutInput = extra.querySelector('#planif-panneau-sem-debut');
        semDebutInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        semDebutInput.addEventListener('input', function(e) {
            donnees.metadata.semaineDebut = parseInt(e.target.value) || null;
            sauvegarder();
        });
        var semFinInput = extra.querySelector('#planif-panneau-sem-fin');
        semFinInput.addEventListener('focus', function() { enregistrerPourUndo(); });
        semFinInput.addEventListener('input', function(e) {
            donnees.metadata.semaineFin = parseInt(e.target.value) || null;
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
    };

    document.getElementById('planif-panneau-description').onfocus = function() {
        enregistrerPourUndo();
    };
    document.getElementById('planif-panneau-description').oninput = function(e) {
        donnees.description = e.target.value;
        sauvegarder();
    };

    document.getElementById('planif-btn-supprimer').onclick = function() {
        supprimerNoeud(id);
        fermerPanneau();
    };

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

    if (donnees && donnees.enfants) {
        for (const eid of [].concat(donnees.enfants)) {
            detacherDuConteneur(eid);
        }
    }

    if (donnees && donnees.parent) {
        detacherDuConteneur(id);
    }

    for (const [lienId, lien] of etat.liens) {
        if (lien.source === id || lien.cible === id) {
            supprimerLien(lienId);
        }
    }
    etat.noeuds.delete(id);
    const el = document.getElementById(id);
    if (el) el.remove();
    if (etat.selection === id) etat.selection = null;
    sauvegarder();
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
        if (elSous && elSous.classList.contains('planif-noeud-port')) {
            var noeudCibleEl = elSous.closest('.planif-noeud');
            if (noeudCibleEl && noeudCibleEl.id !== noeudId) {
                afficherMenuLien(e2.clientX, e2.clientY, noeudId, noeudCibleEl.id);
            }
        }
        etat.lienEnCours = null;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

function creerLien(sourceId, cibleId, typeLien) {
    enregistrerPourUndo();
    var id = 'planif-lien_' + (++etat.compteurLiens);
    var donnees = { id: id, source: sourceId, cible: cibleId, type: typeLien };
    etat.liens.set(id, donnees);
    dessinerLien(donnees);
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
    var tension = Math.min(Math.abs(dx), Math.abs(dy), 80);
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
    path.setAttribute('marker-end', 'url(#planif-fleche)');

    var sourceData = etat.noeuds.get(donnees.source);
    if (sourceData) {
        var couleur = TYPES[sourceData.type] ? TYPES[sourceData.type].couleur : 'var(--planif-couleur-lien)';
        path.style.stroke = couleur;
    }

    path.addEventListener('click', function(e) {
        e.stopPropagation();
        afficherMenuLienExistant(e.clientX, e.clientY, donnees.id);
    });

    groupe.appendChild(path);

    var typeLienConfig = TYPES_LIENS.find(function(t) { return t.id === donnees.type; });
    if (typeLienConfig) {
        var mx = (p1.x + p2.x) / 2;
        var my = (p1.y + p2.y) / 2;
        var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.id = donnees.id + '-label';
        label.setAttribute('x', mx);
        label.setAttribute('y', my - 6);
        label.setAttribute('class', 'planif-lien-label');
        label.textContent = typeLienConfig.label;
        groupe.appendChild(label);
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
    menuLien.innerHTML = '';
    TYPES_LIENS.forEach(function(tl) {
        var btn = document.createElement('button');
        btn.textContent = tl.label;
        btn.addEventListener('click', function() {
            creerLien(sourceId, cibleId, tl.id);
            fermerMenuLien();
        });
        menuLien.appendChild(btn);
    });

    var posMenu = clientVersEspace(x, y);
    menuLien.style.left = posMenu.x + 'px';
    menuLien.style.top = posMenu.y + 'px';
    menuLien.style.display = 'block';
}

function afficherMenuLienExistant(x, y, lienId) {
    var lien = etat.liens.get(lienId);
    if (!lien) return;

    menuLien.innerHTML = '';
    TYPES_LIENS.forEach(function(tl) {
        var btn = document.createElement('button');
        btn.textContent = tl.label;
        if (tl.id === lien.type) btn.classList.add('actif');
        btn.addEventListener('click', function() {
            enregistrerPourUndo();
            lien.type = tl.id;
            dessinerLien(lien);
            fermerMenuLien();
            sauvegarder();
        });
        menuLien.appendChild(btn);
    });

    var sep = document.createElement('hr');
    sep.style.cssText = 'border: none; border-top: 1px solid #e2e8f0; margin: 4px 0;';
    menuLien.appendChild(sep);

    var btnSuppr = document.createElement('button');
    btnSuppr.textContent = 'Supprimer ce lien';
    btnSuppr.style.color = '#dc2626';
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
function trouverConteneurRacine(noeudId) {
    var n = etat.noeuds.get(noeudId);
    if (!n || !n.parent) return noeudId;
    return trouverConteneurRacine(n.parent);
}

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
    if (conteneurType === 'sequence') return enfantType === 'lecon';
    if (conteneurType === 'lecon') return enfantType === 'activite' || enfantType === 'soutien' || enfantType === 'revision';
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

function estDescendantDe(candidatId, noeudId) {
    var noeud = etat.noeuds.get(noeudId);
    if (!noeud || !noeud.enfants) return false;
    for (var i = 0; i < noeud.enfants.length; i++) {
        if (noeud.enfants[i] === candidatId) return true;
        if (estDescendantDe(candidatId, noeud.enfants[i])) return true;
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
    reLayoutConteneur(conteneurId);
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

function reLayoutConteneur(conteneurId) {
    var conteneur = etat.noeuds.get(conteneurId);
    if (!conteneur) return;
    var config = TYPES[conteneur.type];
    if (!config || !config.conteneur) return;

    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    if (enfants.length === 0) {
        mettreAJourZoneConteneur(conteneurId);
        return;
    }

    // Recursively layout nested containers first
    for (var i = 0; i < enfants.length; i++) {
        var ed = etat.noeuds.get(enfants[i]);
        if (ed && TYPES[ed.type] && TYPES[ed.type].conteneur && ed.enfants && ed.enfants.length > 0) {
            reLayoutConteneur(enfants[i]);
        }
    }

    // Sort children by Y position
    enfants.sort(function(a, b) {
        var da = etat.noeuds.get(a);
        var db = etat.noeuds.get(b);
        return (da ? da.y : 0) - (db ? db.y : 0);
    });
    conteneur.enfants = enfants;

    var GAP = 12;
    var PADDING = 30;
    var HEADER_H = 45;

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
        cel.classList.add('planif-a-enfants');
        var zone = cel.querySelector('.planif-noeud-zone');
        if (zone) zone.classList.remove('planif-vide');
    }

    conteneur.x = conteneur.x;
    conteneur.y = conteneur.y;
    mettreAJourLiens(conteneurId);

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

    var GAP = 12;
    var PADDING = 30;
    var HEADER_H = 45;

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

    var newW = maxW + PADDING * 2;
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
    var conteneur = etat.noeuds.get(conteneurId);
    var el = document.getElementById(conteneurId);
    if (!conteneur || !el) return;

    var enfants = (conteneur.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
    var zone = el.querySelector('.planif-noeud-zone');

    if (enfants.length === 0) {
        el.classList.remove('planif-a-enfants');
        el.style.width = '';
        el.style.height = '';
        if (zone) { zone.classList.add('planif-vide'); zone.textContent = ''; }
        return;
    }

    el.classList.add('planif-a-enfants');

    var PADDING = 30;
    var HEADER_H = 45;

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
    var newW = (maxX - minX) + PADDING * 2;
    var newH = (maxY - minY) + PADDING * 2 + HEADER_H;

    conteneur.x = newX;
    conteneur.y = newY;
    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';

    mettreAJourLiens(conteneurId);

    if (conteneur.parent) {
        mettreAJourZoneConteneur(conteneur.parent);
    }
}

// === GUIDE CANEVAS ===
function mettreAJourGuidesZone() {
    var aDesNoeuds = etat.noeuds.size > 0;
    var guide = document.getElementById('planif-zone-guide');
    if (guide) guide.classList.toggle('planif-masque', aDesNoeuds);
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
                metadata: JSON.parse(JSON.stringify(n.metadata || {}))
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

function reconstruireDOM() {
    if (coucheNoeuds) coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';

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
        el.style.borderColor = config.couleur;

        if (estConteneur) {
            var nbEnfants = (n.enfants || []).length;
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-pastille" style="background: ' + config.couleur + '"></span>' +
                    '<span class="planif-noeud-type">' + config.label + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre" contenteditable="true">' + (n.titre || '') + '</div>' +
                '<div class="planif-noeud-zone ' + (nbEnfants === 0 ? 'planif-vide' : '') + '">' +
                    (nbEnfants > 0 ? nbEnfants + ' \u00e9l\u00e9ment' + (nbEnfants > 1 ? 's' : '') : '') +
                '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
        } else {
            el.innerHTML =
                '<div class="planif-noeud-entete">' +
                    '<span class="planif-noeud-pastille" style="background: ' + config.couleur + '"></span>' +
                    '<span class="planif-noeud-type">' + config.label + '</span>' +
                '</div>' +
                '<div class="planif-noeud-titre" contenteditable="true">' + (n.titre || '') + '</div>' +
                '<div class="planif-noeud-port planif-port-droite" data-dir="droite"></div>' +
                '<div class="planif-noeud-port planif-port-gauche" data-dir="gauche"></div>' +
                '<div class="planif-noeud-port planif-port-bas" data-dir="bas"></div>' +
                '<div class="planif-noeud-port planif-port-haut" data-dir="haut"></div>';
        }
        attacherEvenements(el, n);
        coucheNoeuds.appendChild(el);
    }

    requestAnimationFrame(function() {
        // Layout root containers only (non-nested ones); nested ones are handled recursively
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
        for (var entry3 of etat.liens) {
            dessinerLien(entry3[1]);
        }
        mettreAJourGuidesZone();
    });
}

function restaurerSnapshot(snapshot) {
    etat.noeuds.clear();
    etat.liens.clear();
    etat.compteur = snapshot.compteur;
    etat.compteurLiens = snapshot.compteurLiens;

    for (var i = 0; i < snapshot.noeuds.length; i++) {
        var n = snapshot.noeuds[i];
        var clone = {
            id: n.id, type: n.type, titre: n.titre, description: n.description,
            x: n.x, y: n.y, parent: n.parent,
            enfants: n.enfants ? n.enfants.slice() : [],
            metadata: JSON.parse(JSON.stringify(n.metadata || {}))
        };
        etat.noeuds.set(clone.id, clone);
    }
    for (var j = 0; j < snapshot.liens.length; j++) {
        var l = snapshot.liens[j];
        etat.liens.set(l.id, { id: l.id, source: l.source, cible: l.cible, type: l.type });
    }

    reconstruireDOM();
    etat.selection = null;
    etat.multiSelection.clear();
    etat.modeIndividuel = null;
    fermerPanneau();
    fermerMenuLien();
    sauvegarder();
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
    mettreAJourGuidesZone();
}

function viderCanvas() {
    if (coucheNoeuds) coucheNoeuds.innerHTML = '';
    if (coucheLiens) coucheLiens.innerHTML = '';
    etat.noeuds.clear();
    etat.liens.clear();
    etat.compteur = 0;
    etat.compteurLiens = 0;
    etat.selection = null;
    etat.multiSelection.clear();
    pileUndo = [];
    pileRedo = [];
    fermerPanneau();
    fermerMenuLien();
    mettreAJourGuidesZone();
}

function chargerCarte(carteId) {
    viderCanvas();
    var donnees = window.planificationDonnees.chargerCarte(carteId);
    if (!donnees) { centrerVueSurContenu(); return; }

    etat.compteur = donnees.compteur || 0;
    etat.compteurLiens = donnees.compteurLiens || 0;

    var noeudsListe = donnees.noeuds || [];
    for (var i = 0; i < noeudsListe.length; i++) {
        var n = noeudsListe[i];
        var config = TYPES[n.type];
        if (!config) continue;
        if (n.enfants === undefined) n.enfants = [];
        if (n.parent === undefined) n.parent = null;

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

    // Remap et charger les liens
    var liensListe = donnees.liens || [];
    for (var m = 0; m < liensListe.length; m++) {
        var l = liensListe[m];
        if (!l.id.startsWith('planif-')) l.id = 'planif-' + l.id;
        if (!l.source.startsWith('planif-')) l.source = 'planif-' + l.source;
        if (!l.cible.startsWith('planif-')) l.cible = 'planif-' + l.cible;
        etat.liens.set(l.id, l);
    }

    reconstruireDOM();

    requestAnimationFrame(function() {
        centrerVueSurContenu();
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
                document.removeEventListener('mousemove', onMoveGroupe);
                document.removeEventListener('mouseup', onUpGroupe);
                sauvegarder();
            }

            document.addEventListener('mousemove', onMoveGroupe);
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

        // CAS A: Enfant en mode normal → drag du groupe entier (remonte au conteneur racine)
        if (donnees.parent && etat.modeIndividuel !== id) {
            var racineId = trouverConteneurRacine(id);
            var racine = etat.noeuds.get(racineId);
            if (!racine) return;

            var racineStartX = racine.x;
            var racineStartY = racine.y;
            var descendantsGrp = [];
            collecterDescendants(racine, racine, descendantsGrp);

            var racineEl = document.getElementById(racineId);
            if (racineEl) racineEl.classList.add('planif-dragging');

            var peutDropRacine = racine.type === 'lecon';
            var survolConteneurGrp = null;

            function onMoveA(e2) {
                var dx = (e2.clientX - startMouseX2) / etat.zoom;
                var dy = (e2.clientY - startMouseY2) / etat.zoom;

                racine.x = racineStartX + dx;
                racine.y = racineStartY + dy;
                if (racineEl) {
                    racineEl.style.left = racine.x + 'px';
                    racineEl.style.top = racine.y + 'px';
                }
                mettreAJourLiens(racineId);

                for (var j = 0; j < descendantsGrp.length; j++) {
                    var di = descendantsGrp[j];
                    var dd = etat.noeuds.get(di.id);
                    if (!dd) continue;
                    dd.x = racine.x + di.dx;
                    dd.y = racine.y + di.dy;
                    var del2 = document.getElementById(di.id);
                    if (del2) { del2.style.left = dd.x + 'px'; del2.style.top = dd.y + 'px'; }
                    mettreAJourLiens(di.id);
                }

                if (peutDropRacine) {
                    var ancienSurvol = survolConteneurGrp;
                    survolConteneurGrp = trouverConteneurPour(e2.clientX, e2.clientY, racineId, racine.type);
                    if (ancienSurvol !== survolConteneurGrp) {
                        if (ancienSurvol) {
                            var aEl = document.getElementById(ancienSurvol);
                            if (aEl) aEl.classList.remove('planif-conteneur-survol');
                        }
                        if (survolConteneurGrp) {
                            var sEl = document.getElementById(survolConteneurGrp);
                            if (sEl) sEl.classList.add('planif-conteneur-survol');
                        }
                    }
                }
            }

            function onUpA() {
                if (racineEl) racineEl.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveA);
                document.removeEventListener('mouseup', onUpA);
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                if (peutDropRacine) {
                    if (survolConteneurGrp && survolConteneurGrp !== racine.parent) {
                        rattacherAuConteneur(racineId, survolConteneurGrp);
                    } else if (!survolConteneurGrp && racine.parent) {
                        detacherDuConteneur(racineId);
                    }
                }

                sauvegarder();
            }

            document.addEventListener('mousemove', onMoveA);
            document.addEventListener('mouseup', onUpA);
            return;
        }

        // CAS B: Enfant en mode individuel → drag individuel + réordonnancement + détachement
        if (donnees.parent && etat.modeIndividuel === id) {
            el.classList.add('planif-dragging');
            var parentId = donnees.parent;
            var parentData = etat.noeuds.get(parentId);

            function onMoveB(e2) {
                donnees.x = startDataX + (e2.clientX - startMouseX2) / etat.zoom;
                donnees.y = startDataY + (e2.clientY - startMouseY2) / etat.zoom;
                el.style.left = donnees.x + 'px';
                el.style.top = donnees.y + 'px';
                mettreAJourLiens(id);

                // Check if dragged out of parent bounds
                if (parentData) {
                    var cel = document.getElementById(parentId);
                    if (cel) {
                        var cw = parseFloat(cel.style.width) || cel.offsetWidth || 200;
                        var ch = parseFloat(cel.style.height) || cel.offsetHeight || 80;
                        var outOfBounds = donnees.x + (el.offsetWidth || 140) < parentData.x ||
                                          donnees.x > parentData.x + cw ||
                                          donnees.y + (el.offsetHeight || 50) < parentData.y ||
                                          donnees.y > parentData.y + ch;
                        if (outOfBounds) {
                            // Will detach on mouseup
                            return;
                        }
                    }

                    // Reorder: compare midY with siblings
                    var midY = donnees.y + (el.offsetHeight || 50) / 2;
                    var enfants = parentData.enfants || [];
                    var myIdx = enfants.indexOf(id);
                    if (myIdx !== -1) {
                        for (var si = 0; si < enfants.length; si++) {
                            if (si === myIdx) continue;
                            var sib = etat.noeuds.get(enfants[si]);
                            if (!sib) continue;
                            var sibEl = document.getElementById(enfants[si]);
                            var sibMidY = sib.y + ((sibEl ? sibEl.offsetHeight : 50) || 50) / 2;
                            if (myIdx < si && midY > sibMidY) {
                                enfants.splice(myIdx, 1);
                                enfants.splice(si, 0, id);
                                parentData.enfants = enfants;
                                reLayoutConteneurSaufDragged(parentId, id);
                                break;
                            } else if (myIdx > si && midY < sibMidY) {
                                enfants.splice(myIdx, 1);
                                enfants.splice(si, 0, id);
                                parentData.enfants = enfants;
                                reLayoutConteneurSaufDragged(parentId, id);
                                break;
                            }
                        }
                    }
                }
            }

            function onUpB() {
                el.classList.remove('planif-dragging');
                document.removeEventListener('mousemove', onMoveB);
                document.removeEventListener('mouseup', onUpB);

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
                            etat.modeIndividuel = null;
                            el.classList.remove('planif-mode-individuel');
                            detacherDuConteneur(id);
                            sauvegarder();
                            return;
                        }
                    }
                }

                // Snap back with layout
                if (donnees.parent) {
                    reLayoutConteneur(donnees.parent);
                }
                sauvegarder();
            }

            document.addEventListener('mousemove', onMoveB);
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

            var peutEtreEnfant = donnees.type === 'lecon';
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

                if (donnees.parent) {
                    mettreAJourZoneConteneur(donnees.parent);
                }

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
                document.removeEventListener('mousemove', onMoveC);
                document.removeEventListener('mouseup', onUpC);

                document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
                document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

                if (peutEtreEnfant) {
                    if (survolConteneur && survolConteneur !== donnees.parent) {
                        rattacherAuConteneur(id, survolConteneur);
                    } else if (!survolConteneur && donnees.parent) {
                        detacherDuConteneur(id);
                    }
                }

                sauvegarder();
            }

            document.addEventListener('mousemove', onMoveC);
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
            document.removeEventListener('mousemove', onMoveD);
            document.removeEventListener('mouseup', onUpD);

            document.querySelectorAll('.planif-noeud-zone.planif-survol').forEach(function(z) { z.classList.remove('planif-survol'); });
            document.querySelectorAll('.planif-conteneur-survol').forEach(function(c) { c.classList.remove('planif-conteneur-survol'); });

            if (survolConteneurD && survolConteneurD !== donnees.parent) {
                rattacherAuConteneur(id, survolConteneurD);
            } else if (!survolConteneurD && donnees.parent) {
                detacherDuConteneur(id);
            }

            sauvegarder();
        }

        document.addEventListener('mousemove', onMoveD);
        document.addEventListener('mouseup', onUpD);
    });

    // Double-clic: mode individuel pour enfants, panneau pour le reste
    el.addEventListener('dblclick', function(e) {
        if (e.target.isContentEditable) return;

        if (donnees.parent) {
            // Enfant → active mode individuel
            etat.modeIndividuel = id;
            document.querySelectorAll('.planif-mode-individuel').forEach(function(mel) { mel.classList.remove('planif-mode-individuel'); });
            el.classList.add('planif-mode-individuel');
            selectionnerNoeud(id);
            ouvrirPanneau(id);
        } else {
            selectionnerNoeud(id);
            ouvrirPanneau(id);
        }
    });

    var titreEl = el.querySelector('.planif-noeud-titre');
    titreEl.addEventListener('focus', function() {
        enregistrerPourUndo();
    });
    titreEl.addEventListener('input', function() {
        donnees.titre = titreEl.textContent;
        sauvegarder();
    });
    titreEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); titreEl.blur(); }
    });

    el.querySelectorAll('.planif-noeud-port').forEach(function(port) {
        port.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            demarrerLien(id, port.dataset.dir, e);
        });
    });

    el.addEventListener('click', function(e) {
        if (e.target.classList.contains('planif-noeud-port')) return;
        if (e.metaKey || e.ctrlKey) return;
        if (etat.multiSelection.size === 0) {
            selectionnerNoeud(id);
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
            var typeLienConfig = TYPES_LIENS.find(function(t) { return t.id === lien.type; });
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

function genererSeancesHTML() {
    var sequences = [];
    var leconsOrphelines = [];

    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }

    if (sequences.length === 0 && leconsOrphelines.length === 0) {
        return '<div class="planif-cal-vide">Aucune séquence ou leçon pour le moment.<br>Ajoute des éléments à la carte.</div>';
    }

    sequences.sort(function(a, b) {
        return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999);
    });

    var html = '';

    function genererEnfant(enfantId) {
        var enfant = etat.noeuds.get(enfantId);
        if (!enfant) return '';
        var config = TYPES[enfant.type];
        if (!config) return '';

        if (enfant.type === 'lecon') return genererLeconBloc(enfant);

        var itemHtml = '<div class="planif-cal-item" data-noeud="' + enfantId + '">';
        itemHtml += '<span class="planif-cal-pastille-mini" style="background: ' + config.couleur + '"></span>';
        itemHtml += '<div>';
        itemHtml += '<span class="planif-cal-item-titre">' + (enfant.titre || config.label) + '</span>';

        if (enfant.metadata && enfant.metadata.duree) {
            itemHtml += ' <span class="planif-cal-duree">' + enfant.metadata.duree + ' min</span>';
        }

        var liens = getLiensDeNoeud(enfantId);
        if (liens.length > 0) {
            itemHtml += '<div class="planif-cal-liens">';
            for (var j = 0; j < liens.length; j++) {
                var l = liens[j];
                var lConfig = TYPES[l.noeudType];
                var couleur = lConfig ? lConfig.couleur : '#94a3b8';
                var fleche = l.direction === 'sortant' ? '→' : '←';
                itemHtml += '<div class="planif-cal-lien-item" data-noeud="' + l.noeudId + '">';
                itemHtml += '<span class="planif-cal-lien-pastille" style="background: ' + couleur + '"></span>';
                itemHtml += fleche + ' ' + l.lienLabel + ' : ' + l.noeudTitre;
                itemHtml += '</div>';
            }
            itemHtml += '</div>';
        }

        itemHtml += '</div></div>';
        return itemHtml;
    }

    function genererLeconBloc(lecon) {
        var config = TYPES['lecon'];
        var dureeTotal = 0;
        var bloc = '<div class="planif-cal-lecon">';
        bloc += '<div class="planif-cal-lecon-header" data-noeud="' + lecon.id + '">';
        bloc += '<span class="planif-cal-pastille" style="background: ' + config.couleur + '"></span>';
        bloc += '<span class="planif-cal-titre">' + (lecon.titre || 'Leçon') + '</span>';
        if (lecon.metadata && lecon.metadata.duree) {
            bloc += '<span class="planif-cal-duree">' + lecon.metadata.duree + ' min</span>';
            dureeTotal += lecon.metadata.duree;
        }
        bloc += '</div>';

        var enfants = (lecon.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
        if (enfants.length > 0) {
            bloc += '<div class="planif-cal-enfants">';
            for (var j = 0; j < enfants.length; j++) {
                var ed = etat.noeuds.get(enfants[j]);
                if (ed && ed.metadata && ed.metadata.duree) dureeTotal += ed.metadata.duree;
                bloc += genererEnfant(enfants[j]);
            }
            bloc += '</div>';
        }

        var liensLecon = getLiensDeNoeud(lecon.id);
        if (liensLecon.length > 0) {
            bloc += '<div class="planif-cal-enfants">';
            for (var k = 0; k < liensLecon.length; k++) {
                var ll = liensLecon[k];
                var lConfig2 = TYPES[ll.noeudType];
                var couleur2 = lConfig2 ? lConfig2.couleur : '#94a3b8';
                var fleche2 = ll.direction === 'sortant' ? '→' : '←';
                bloc += '<div class="planif-cal-lien-item" data-noeud="' + ll.noeudId + '">';
                bloc += '<span class="planif-cal-lien-pastille" style="background: ' + couleur2 + '"></span>';
                bloc += fleche2 + ' ' + ll.lienLabel + ' : ' + ll.noeudTitre;
                bloc += '</div>';
            }
            bloc += '</div>';
        }

        if (dureeTotal > 0) {
            var h = Math.floor(dureeTotal / 60);
            var m = dureeTotal % 60;
            var tempsStr = h > 0 ? h + 'h' + (m > 0 ? String(m).padStart(2, '0') : '') : m + ' min';
            bloc += '<div class="planif-cal-total">Total : <strong>' + tempsStr + '</strong></div>';
        }

        bloc += '</div>';
        return bloc;
    }

    // Séquences
    for (var i = 0; i < sequences.length; i++) {
        var seq = sequences[i];
        var configSeq = TYPES['sequence'];
        html += '<div class="planif-cal-sequence">';
        html += '<div class="planif-cal-sequence-header" data-noeud="' + seq.id + '">';
        html += '<span class="planif-cal-pastille" style="background: ' + configSeq.couleur + '"></span>';
        html += '<span class="planif-cal-titre">' + (seq.titre || 'Séquence') + '</span>';

        if (seq.metadata && seq.metadata.semaineDebut) {
            var semTxt = 'Sem. ' + seq.metadata.semaineDebut;
            if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
                semTxt += '–' + seq.metadata.semaineFin;
            }
            html += '<span class="planif-cal-semaines">' + semTxt + '</span>';
        }
        html += '</div>';

        var enfSeq = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
        var dureeSeq = 0;

        for (var j = 0; j < enfSeq.length; j++) {
            var ed = etat.noeuds.get(enfSeq[j]);
            if (!ed) continue;

            if (ed.type === 'lecon') {
                html += genererLeconBloc(ed);
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;
                for (var k = 0; k < (ed.enfants || []).length; k++) {
                    var cd = etat.noeuds.get(ed.enfants[k]);
                    if (cd && cd.metadata && cd.metadata.duree) dureeSeq += cd.metadata.duree;
                }
            } else {
                html += '<div class="planif-cal-enfants">' + genererEnfant(enfSeq[j]) + '</div>';
                if (ed.metadata && ed.metadata.duree) dureeSeq += ed.metadata.duree;
            }
        }

        var liensSeq = getLiensDeNoeud(seq.id);
        if (liensSeq.length > 0) {
            html += '<div class="planif-cal-enfants">';
            for (var m = 0; m < liensSeq.length; m++) {
                var ls = liensSeq[m];
                var lConfig3 = TYPES[ls.noeudType];
                var couleur3 = lConfig3 ? lConfig3.couleur : '#94a3b8';
                var fleche3 = ls.direction === 'sortant' ? '→' : '←';
                html += '<div class="planif-cal-lien-item" data-noeud="' + ls.noeudId + '">';
                html += '<span class="planif-cal-lien-pastille" style="background: ' + couleur3 + '"></span>';
                html += fleche3 + ' ' + ls.lienLabel + ' : ' + ls.noeudTitre;
                html += '</div>';
            }
            html += '</div>';
        }

        if (dureeSeq > 0) {
            var hSeq = Math.floor(dureeSeq / 60);
            var mSeq = dureeSeq % 60;
            var tempsSeq = hSeq > 0 ? hSeq + 'h' + (mSeq > 0 ? String(mSeq).padStart(2, '0') : '') : mSeq + ' min';
            html += '<div class="planif-cal-total">Durée totale : <strong>' + tempsSeq + '</strong></div>';
        }

        html += '</div>';
    }

    // Leçons orphelines
    if (leconsOrphelines.length > 0) {
        html += '<div class="planif-cal-orphelines">';
        html += '<div class="planif-cal-orphelines-titre">Leçons hors séquence</div>';
        for (var p = 0; p < leconsOrphelines.length; p++) {
            html += genererLeconBloc(leconsOrphelines[p]);
        }
        html += '</div>';
    }

    return html;
}

function rafraichirSeances() {
    if (!seancesOuvert || !panneauSeancesContenu) return;
    panneauSeancesContenu.innerHTML = genererSeancesHTML();

    panneauSeancesContenu.querySelectorAll('[data-noeud]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var noeudId = el.dataset.noeud;
            if (noeudId) naviguerVers(noeudId);
        });
    });
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

    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }

    sequences.sort(function(a, b) { return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999); });

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
        var semTxt = '';
        if (seq.metadata && seq.metadata.semaineDebut) {
            semTxt = ' (Sem. ' + seq.metadata.semaineDebut;
            if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
                semTxt += '–' + seq.metadata.semaineFin;
            }
            semTxt += ')';
        }

        txt += '───────────────────────────────────────\n';
        txt += '▌ SÉQUENCE : ' + (seq.titre || 'Sans titre') + semTxt + '\n';
        txt += '───────────────────────────────────────\n';
        txt += liensTexte(seq.id, '  ');

        var enfants = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });
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
                    var cfgAct = TYPES[cd.type];
                    var dureeAct = cd.metadata && cd.metadata.duree ? ' (' + formatDuree(cd.metadata.duree) + ')' : '';
                    txt += '  │ • [' + (cfgAct ? cfgAct.label : cd.type) + '] ' + (cd.titre || 'Sans titre') + dureeAct + '\n';
                    txt += liensTexte(enfantsLecon[k], '  │   ');
                    if (cd.metadata && cd.metadata.duree) dureeSeq += cd.metadata.duree;
                }
                txt += '  └─\n';
            } else {
                var cfgEd = TYPES[ed.type];
                var dureeEd = ed.metadata && ed.metadata.duree ? ' (' + formatDuree(ed.metadata.duree) + ')' : '';
                txt += '  • [' + (cfgEd ? cfgEd.label : ed.type) + '] ' + (ed.titre || 'Sans titre') + dureeEd + '\n';
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
                var cfgOrph = TYPES[cdOrph.type];
                var dureeOrph = cdOrph.metadata && cdOrph.metadata.duree ? ' (' + formatDuree(cdOrph.metadata.duree) + ')' : '';
                txt += '  │ • [' + (cfgOrph ? cfgOrph.label : cdOrph.type) + '] ' + (cdOrph.titre || 'Sans titre') + dureeOrph + '\n';
                txt += liensTexte(enfOrph[q], '  │   ');
            }
            txt += '  └─\n';
        }
    }

    return txt;
}

function genererPlanTSV() {
    var sequences = [];
    var leconsOrphelines = [];

    for (var entry of etat.noeuds) {
        var nd = entry[1];
        if (nd.type === 'sequence') sequences.push(nd);
        else if (nd.type === 'lecon' && !nd.parent) leconsOrphelines.push(nd);
    }

    sequences.sort(function(a, b) { return (a.metadata && a.metadata.semaineDebut || 999) - (b.metadata && b.metadata.semaineDebut || 999); });

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
        var semTxt = '';
        if (seq.metadata && seq.metadata.semaineDebut) {
            semTxt = seq.metadata.semaineDebut.toString();
            if (seq.metadata.semaineFin && seq.metadata.semaineFin !== seq.metadata.semaineDebut) {
                semTxt += '–' + seq.metadata.semaineFin;
            }
        }
        var seqLiens = liensCompacts(seq.id);
        var seqNom = escape(seq.titre || 'Sans titre');
        var enfants = (seq.enfants || []).filter(function(eid) { return etat.noeuds.has(eid); });

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
                    var cfgCd = TYPES[cd.type];
                    var actLiens = liensCompacts(enfantsLecon[k]);
                    tsv += seqNom + '\t' + semTxt + '\t' + leconNom + '\t' + leconDuree + '\t' + escape(cfgCd ? cfgCd.label : cd.type) + '\t' + escape(cd.titre || 'Sans titre') + '\t' + (cd.metadata && cd.metadata.duree || '') + '\t' + escape(actLiens) + '\n';
                }
            } else {
                var cfgEd = TYPES[ed.type];
                var actLiens2 = liensCompacts(enfants[j]);
                tsv += seqNom + '\t' + semTxt + '\t\t\t' + escape(cfgEd ? cfgEd.label : ed.type) + '\t' + escape(ed.titre || 'Sans titre') + '\t' + (ed.metadata && ed.metadata.duree || '') + '\t' + escape(actLiens2) + '\n';
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
            var cfgOrph = TYPES[cdOrph.type];
            var actLiens3 = liensCompacts(enfOrph[q]);
            tsv += '(Hors séquence)\t\t' + leconNom2 + '\t' + leconDuree2 + '\t' + escape(cfgOrph ? cfgOrph.label : cdOrph.type) + '\t' + escape(cdOrph.titre || 'Sans titre') + '\t' + (cdOrph.metadata && cdOrph.metadata.duree || '') + '\t' + escape(actLiens3) + '\n';
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
        if (carte.id === index.active) {
            opt.selected = true;
            var titreCarte = document.getElementById('planif-titre-carte');
            if (titreCarte) titreCarte.value = carte.nom;
        }
        select.appendChild(opt);
    }
}

function nouvelleCarte(nom) {
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

function changerCarte(carteId) {
    var index = window.planificationDonnees.getIndex();
    if (!index) return;
    sauvegarder();
    index.active = carteId;
    window.planificationDonnees.sauvegarderIndex(index);
    chargerCarte(carteId);
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
        }
    }, { passive: true });
    zoneTravail.addEventListener('touchend', function() {
        touchStartDist = null;
        touchStartZoom = null;
    });

    // Palette drag & drop
    document.querySelectorAll('#planif-palette .planif-palette-btn').forEach(function(btn) {
        btn.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('planif-type', btn.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
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

    zoneTravail.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    zoneTravail.addEventListener('drop', function(e) {
        e.preventDefault();
        var type = e.dataTransfer.getData('planif-type');
        if (!type || !TYPES[type]) return;
        var pos = clientVersData(e.clientX, e.clientY);
        creerNoeud(type, pos.x - 70, pos.y - 20);
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
            document.removeEventListener('mousemove', onMove);
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

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    // Événements multi-cartes
    var listeCartes = document.getElementById('planif-liste-cartes');
    if (listeCartes) {
        listeCartes.addEventListener('change', function(e) { changerCarte(e.target.value); });
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

    var btnExporterCarte = document.getElementById('planif-btn-exporter-carte');
    if (btnExporterCarte) btnExporterCarte.addEventListener('click', exporterCarte);

    var btnImporterCarte = document.getElementById('planif-btn-importer-carte');
    if (btnImporterCarte) {
        btnImporterCarte.addEventListener('click', function() {
            document.getElementById('planif-fichier-import').click();
        });
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

    // Titre carte éditable
    var titreCarte = document.getElementById('planif-titre-carte');
    if (titreCarte) {
        titreCarte.addEventListener('input', function() {
            renommerCarteActive(titreCarte.value.trim());
        });
        titreCarte.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); titreCarte.blur(); }
        });
    }

    // Fermer panneau
    var btnFermerPanneau = document.getElementById('planif-btn-fermer-panneau');
    if (btnFermerPanneau) btnFermerPanneau.addEventListener('click', fermerPanneau);

    // Séances
    if (btnSeances) btnSeances.addEventListener('click', toggleSeances);
    var btnFermerCal = document.getElementById('planif-btn-fermer-seances');
    if (btnFermerCal) btnFermerCal.addEventListener('click', toggleSeances);

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

    // Vérifier qu'on est bien dans la section planification
    var sectionPlanif = document.getElementById('section-planification');
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
        centrerVueSurContenu();
        return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '1' && pasDansChamp) {
        e.preventDefault();
        centrerVueSurContenu();
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
window.planificationCarte = {
    initialiser: initialiser,
    activer: function() { planificationActive = true; },
    desactiver: function() { planificationActive = false; },
    centrerVueSurContenu: centrerVueSurContenu,
    mettreAJourListeCartes: mettreAJourListeCartes,
    chargerCarte: chargerCarte,
    etat: etat
};

})();
