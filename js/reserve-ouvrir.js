/* ===============================
   MODULE : RÉSERVE OUVRIR — Réimport sélectif d'un versement
   Date : 28 avril 2026
   Backlog : #254
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md (voie de retour)

   Vocation
     Lit un fichier .reserve.zip exporté par le module Reserve, en
     extrait les ressources réutilisables (grilles, échelles, tampons
     personnalisés) et permet à l'utilisateur d'en réimporter une
     sélection vers ses bibliothèques actives.

   Scope v1 (28 avril 2026)
     - Lecture : input file (Safari + Chrome)
     - Réimport : grilles, échelles, tampons personnalisés
     - Mode doublon : ignore par défaut, toggle global « copie en double »
     - Hors scope v1 : productions, cartouches, pratiques (références
       croisées à remapper) ; données pédagogiques (étudiants, présences,
       évaluations, travaux) ; mode consultation namespace temporaire.

   Dépendances
     - JSZip (libs/jszip.min.js)
     - validerZipSecurite (window.validerZipSecurite, depuis import-export.js)
     - importerGrillesExternes, importerEchellesExternes (window.*)
     - genererIdUnique (window.genererIdUnique, depuis main.js)
     - db (window.db)
     - echapperHtml (window.echapperHtml)
*/

(function() {
'use strict';

/* ===============================
   ÉTAT INTERNE
   =============================== */

// Payload du versement courant (source pour appliquerReimport)
var _payloadCourant = null;

// Mode navigation FSAPI : liste des versements détectés + handle racine
var _versementsListes = null;
var _handleReserveCourant = null;

/* ===============================
   UTILITAIRES
   =============================== */

function _echapper(s) {
    if (typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function _formaterDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return iso;
    }
}

/* ===============================
   LECTURE DU ZIP
   =============================== */

/**
 * Lit un fichier .reserve.zip et en extrait les ressources réimportables.
 *
 * @param {File} file - Fichier .zip sélectionné par l'utilisateur
 * @returns {Promise<{dossier, meta, donnees, ressources}>}
 */
async function chargerDepuisFichier(file) {
    if (!file) throw new Error('Aucun fichier fourni.');
    if (typeof JSZip === 'undefined') {
        throw new Error('Bibliothèque de compression non chargée.');
    }

    var zip;
    try {
        zip = await JSZip.loadAsync(file);
    } catch (e) {
        throw new Error('Le fichier choisi n\'est pas un ZIP valide.');
    }

    if (typeof window.validerZipSecurite === 'function') {
        var validation = window.validerZipSecurite(zip);
        if (!validation.valide) {
            throw new Error('Validation sécurité : ' + validation.erreur);
        }
    }

    // Localiser le dossier de versement (premier trimestres/{dossier}/donnees.json)
    var fichierDonnees = null;
    var fichierMeta = null;
    var dossierVersement = null;

    Object.keys(zip.files).forEach(function(chemin) {
        var m = chemin.match(/^trimestres\/([^\/]+)\/(donnees|meta)\.json$/);
        if (!m) return;
        if (m[2] === 'donnees' && !fichierDonnees) {
            fichierDonnees = zip.files[chemin];
            dossierVersement = m[1];
        } else if (m[2] === 'meta' && !fichierMeta) {
            fichierMeta = zip.files[chemin];
        }
    });

    if (!fichierDonnees) {
        throw new Error('Le ZIP ne contient pas de versement reconnaissable (trimestres/.../donnees.json absent).');
    }

    var donnees, meta = null;
    try {
        donnees = JSON.parse(await fichierDonnees.async('text'));
    } catch (e) {
        throw new Error('Échec de lecture de donnees.json : ' + (e.message || e));
    }

    if (fichierMeta) {
        try {
            meta = JSON.parse(await fichierMeta.async('text'));
        } catch (e) {
            console.warn('[ReserveOuvrir] meta.json invalide, ignoré', e.message || e);
        }
    }

    var ressources = _extraireRessources(donnees);

    return {
        dossier: dossierVersement,
        meta: meta,
        donnees: donnees,
        ressources: ressources
    };
}

/**
 * Extrait les ressources réimportables et marque les doublons par ID.
 * Les bibliothèques actives sont lues depuis db.getSync.
 */
function _extraireRessources(donnees) {
    var grillesActives = (window.db && db.getSync('grillesTemplates', [])) || [];
    var echellesActives = (window.db && db.getSync('echellesTemplates', [])) || [];
    var tamponsActifs = (window.db && db.getSync('tamponsPersonnalises', [])) || [];

    var idsGrillesActives = new Set(grillesActives.map(function(g) { return g.id; }));
    var idsEchellesActives = new Set(echellesActives.map(function(e) { return e.id; }));
    var idsTamponsActifs = new Set(tamponsActifs.map(function(t) { return t.id; }));

    var grilles = (Array.isArray(donnees.grillesTemplates) ? donnees.grillesTemplates : [])
        .filter(function(g) { return g && g.id && g.nom; })
        .map(function(g) { return Object.assign({}, g, { _doublon: idsGrillesActives.has(g.id) }); });

    var echelles = (Array.isArray(donnees.echellesTemplates) ? donnees.echellesTemplates : [])
        .filter(function(e) { return e && e.id && e.nom; })
        .map(function(e) { return Object.assign({}, e, { _doublon: idsEchellesActives.has(e.id) }); });

    var tampons = (Array.isArray(donnees.tamponsPersonnalises) ? donnees.tamponsPersonnalises : [])
        .filter(function(t) { return t && t.id; })
        .map(function(t) { return Object.assign({}, t, { _doublon: idsTamponsActifs.has(t.id) }); });

    return { grilles: grilles, echelles: echelles, tampons: tampons };
}

/* ===============================
   ACTIONS UTILISATEUR — modale
   =============================== */

async function actionOuvrir() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) {
        console.error('[ReserveOuvrir] Modale #modalOuvrirVersement introuvable dans le DOM');
        return;
    }

    _payloadCourant = null;
    _versementsListes = null;
    _handleReserveCourant = null;

    var etapeFichier = document.getElementById('reserve-ouvrir-etape-fichier');
    var etapeSelection = document.getElementById('reserve-ouvrir-etape-selection');
    var bouton = document.getElementById('reserve-ouvrir-bouton-reimporter');
    if (etapeFichier) etapeFichier.style.display = '';
    if (etapeSelection) etapeSelection.style.display = 'none';
    if (bouton) bouton.style.display = 'none';

    var toggle = document.getElementById('reserve-ouvrir-toggle-copie');
    if (toggle) toggle.checked = false;

    // Fermer le menu codex si ouvert
    var menu = document.getElementById('codex-menu');
    if (menu && !menu.classList.contains('u-hide') &&
        window.Codex && typeof window.Codex.toggleMenu === 'function') {
        window.Codex.toggleMenu();
    }

    modal.classList.add('actif');

    // Détection du mode et routage de l'étape 1
    var statut = (window.Reserve && typeof Reserve.statutHandle === 'function')
        ? await Reserve.statutHandle()
        : { supporte: false, persiste: false, nom: '', permission: 'inconnu' };

    if (statut.supporte && statut.persiste &&
        (statut.permission === 'granted' || statut.permission === 'prompt')) {
        await _afficherListeVersements();
    } else if (statut.supporte) {
        _afficherChoixDossier();
    } else {
        _afficherChoixFichier();
    }
}

function fermerDialogue() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (modal) modal.classList.remove('actif');
    _payloadCourant = null;
    _versementsListes = null;
    _handleReserveCourant = null;
}

function declencherInput() {
    var input = document.getElementById('reserve-ouvrir-input');
    if (input) input.click();
}

async function onFichierChoisi(el) {
    var file = el && el.files && el.files[0];
    if (!file) return;

    try {
        _payloadCourant = await chargerDepuisFichier(file);
        _afficherEtapeSelection(_payloadCourant);
    } catch (e) {
        console.error('[ReserveOuvrir] Chargement échoué', e);
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Lecture impossible', e.message || String(e));
        }
        if (el) el.value = '';
    }
}

/* ===============================
   VUES ÉTAPE 1 — adaptées au navigateur
   =============================== */

function _afficherChoixFichier() {
    var elEtape = document.getElementById('reserve-ouvrir-etape-fichier');
    if (!elEtape) return;
    elEtape.innerHTML =
        '<input type="file" id="reserve-ouvrir-input" accept=".zip,.reserve.zip" ' +
        'style="display: none" data-on-change="ReserveOuvrir.onFichierChoisi">' +
        '<div style="text-align: center; padding: 24px 16px;">' +
        '<button data-action="ReserveOuvrir.declencherInput" class="btn btn-confirmer">' +
        '<img src="icons/icon-import.svg" alt="" class="btn-inline-icon">' +
        'Choisir un fichier .reserve.zip&hellip;</button>' +
        '<p style="margin-top: 14px; font-size: 0.82rem; color: var(--texte-secondaire); line-height: 1.5;">' +
        'Si tu viens de verser depuis Safari, ton fichier ZIP est dans ton dossier ' +
        '<strong>T&eacute;l&eacute;chargements</strong> (<code>~/Downloads/</code>).' +
        '</p>' +
        '</div>';
}

function _afficherChoixDossier() {
    var elEtape = document.getElementById('reserve-ouvrir-etape-fichier');
    if (!elEtape) return;
    elEtape.innerHTML =
        '<input type="file" id="reserve-ouvrir-input" accept=".zip,.reserve.zip" ' +
        'style="display: none" data-on-change="ReserveOuvrir.onFichierChoisi">' +
        '<div style="text-align: center; padding: 24px 16px;">' +
        '<button data-action="ReserveOuvrir.actionChoisirDossier" class="btn btn-confirmer">' +
        '<img src="icons/icon-filing-cabinet.svg" alt="" class="btn-inline-icon">' +
        'Choisir le dossier de ma r&eacute;serve&hellip;</button>' +
        '<p style="margin-top: 12px; font-size: 0.82rem; color: var(--texte-secondaire); line-height: 1.5;">' +
        'Pas encore de dossier configur&eacute; sur ce navigateur.' +
        '</p>' +
        '<div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--bordure-douce);">' +
        '<button data-action="ReserveOuvrir.declencherInput" class="btn btn-secondaire u-texte-petit">' +
        'ou choisir un fichier ZIP&hellip;</button>' +
        '</div>' +
        '</div>';
}

async function _afficherListeVersements() {
    var elEtape = document.getElementById('reserve-ouvrir-etape-fichier');
    if (!elEtape) return;

    elEtape.innerHTML = '<div style="text-align: center; padding: 24px;"><em>Chargement de la r&eacute;serve&hellip;</em></div>';

    var handle = null;
    try {
        handle = await Reserve.obtenirHandle();
    } catch (e) {
        console.warn('[ReserveOuvrir] obtenirHandle échoué', e.message || e);
    }

    if (!handle) {
        // Permission refusée → fallback file picker
        _afficherChoixFichier();
        return;
    }
    _handleReserveCourant = handle;

    var versements;
    try {
        versements = await _listerVersementsDansHandle(handle);
    } catch (e) {
        console.error('[ReserveOuvrir] Listage versements échoué', e);
        versements = [];
    }
    _versementsListes = versements;

    var html = '<div style="padding: 0 0 4px;">';
    html += '<div style="font-size: 0.82rem; color: var(--texte-secondaire); margin-bottom: 8px;">' +
        'Dossier r&eacute;serve&nbsp;: <code>' + _echapper(handle.name) + '</code></div>';

    if (versements.length === 0) {
        html += '<div style="padding: 12px 14px; background: var(--surface-carte); border-radius: var(--radius-moyen); font-size: 0.85rem; color: var(--texte-secondaire);">' +
            'Aucun versement d&eacute;tect&eacute; dans ce dossier.<br>' +
            '<span style="font-size: 0.78rem;">(<code>manifeste-reserve.json</code> absent ou vide)</span>' +
            '</div>';
    } else {
        html += '<ul style="list-style: none; padding: 0; margin: 0; max-height: 320px; overflow-y: auto;">';
        versements.forEach(function(v, idx) {
            var p = v.patch || {};
            html += '<li class="reserve-ouvrir-versement-item" ' +
                'data-action="ReserveOuvrir.onChoisirVersement" data-param="' + idx + '" ' +
                'style="padding: 8px 10px; border: 1px solid var(--bordure-douce); border-radius: var(--radius-moyen); margin-bottom: 6px; cursor: pointer; font-size: 0.85rem;">' +
                '<strong>' + _echapper(v.dossier) + '</strong>';
            var details = [];
            if (p.date_versement) details.push(_echapper(_formaterDate(p.date_versement)));
            if (p.nombre_etudiants) details.push(p.nombre_etudiants + ' &eacute;tudiant(s)');
            if (p.mode_versement === 'fsapi') details.push('FSAPI');
            else if (p.mode_versement === 'zip') details.push('ZIP');
            if (details.length > 0) {
                html += '<div style="margin-top: 2px; color: var(--texte-secondaire); font-size: 0.78rem;">' +
                    details.join(' &middot; ') + '</div>';
            }
            html += '</li>';
        });
        html += '</ul>';
    }

    html += '<input type="file" id="reserve-ouvrir-input" accept=".zip,.reserve.zip" ' +
        'style="display: none" data-on-change="ReserveOuvrir.onFichierChoisi">';
    html += '<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--bordure-douce); text-align: center;">' +
        '<button data-action="ReserveOuvrir.declencherInput" class="btn btn-secondaire u-texte-petit">' +
        'Choisir un fichier ZIP&hellip;</button>' +
        ' <button data-action="ReserveOuvrir.actionChoisirDossier" class="btn btn-secondaire u-texte-petit" style="margin-left: 6px;">' +
        'Changer de dossier&hellip;</button>' +
        '</div>';
    html += '</div>';

    elEtape.innerHTML = html;
}

async function _listerVersementsDansHandle(handle) {
    try {
        var fhManif = await handle.getFileHandle('manifeste-reserve.json');
        var f = await fhManif.getFile();
        var manif = JSON.parse(await f.text());
        if (!manif || !manif.versements) return [];
        return Object.keys(manif.versements).map(function(d) {
            return { dossier: d, patch: manif.versements[d] };
        }).sort(function(a, b) {
            var da = (a.patch && a.patch.date_versement) || '';
            var dbDate = (b.patch && b.patch.date_versement) || '';
            return dbDate.localeCompare(da);
        });
    } catch (e) {
        if (e.name === 'NotFoundError') return [];
        console.warn('[ReserveOuvrir] Lecture manifeste-reserve.json échouée', e.message || e);
        return [];
    }
}

async function _chargerVersementDirect(handleRacine, dossier) {
    var dossierTrim = await handleRacine.getDirectoryHandle('trimestres');
    var dossierVersement = await dossierTrim.getDirectoryHandle(dossier);

    var meta = null;
    try {
        var fhMeta = await dossierVersement.getFileHandle('meta.json');
        var fileMeta = await fhMeta.getFile();
        meta = JSON.parse(await fileMeta.text());
    } catch (e) {
        if (e.name !== 'NotFoundError') {
            console.warn('[ReserveOuvrir] meta.json invalide', e.message || e);
        }
    }

    var fhDonnees = await dossierVersement.getFileHandle('donnees.json');
    var fileDonnees = await fhDonnees.getFile();
    var donnees = JSON.parse(await fileDonnees.text());

    return {
        dossier: dossier,
        meta: meta,
        donnees: donnees,
        ressources: _extraireRessources(donnees)
    };
}

async function actionChoisirDossier() {
    if (!window.Reserve || typeof Reserve.obtenirHandle !== 'function') return;
    try {
        var handle = await Reserve.obtenirHandle({ forcer: true });
        if (handle) {
            await _afficherListeVersements();
        }
    } catch (e) {
        console.warn('[ReserveOuvrir] Choix dossier échoué', e.message || e);
    }
}

async function onChoisirVersement(idx) {
    var i = parseInt(idx, 10);
    if (isNaN(i) || !_versementsListes || !_versementsListes[i]) return;

    var versement = _versementsListes[i];
    if (!_handleReserveCourant) {
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Erreur', 'Dossier réserve non disponible.');
        }
        return;
    }

    try {
        var payload = await _chargerVersementDirect(_handleReserveCourant, versement.dossier);
        _payloadCourant = payload;
        _afficherEtapeSelection(payload);
    } catch (e) {
        console.error('[ReserveOuvrir] Chargement versement échoué', e);
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Lecture impossible', e.message || String(e));
        }
    }
}

/* ===============================
   RENDU UI
   =============================== */

function _afficherEtapeSelection(payload) {
    var etapeFichier = document.getElementById('reserve-ouvrir-etape-fichier');
    var etapeSelection = document.getElementById('reserve-ouvrir-etape-selection');
    var bouton = document.getElementById('reserve-ouvrir-bouton-reimporter');
    if (etapeFichier) etapeFichier.style.display = 'none';
    if (etapeSelection) etapeSelection.style.display = '';
    if (bouton) bouton.style.display = '';

    var elMeta = document.getElementById('reserve-ouvrir-meta');
    if (elMeta) {
        var m = payload.meta || {};
        var htmlMeta = '<strong>Versement</strong> : <code>' + _echapper(payload.dossier) + '</code>';
        if (m.uuid) htmlMeta += '<br><strong>UUID</strong> : <code style="font-size: 0.78rem;">' + _echapper(m.uuid) + '</code>';
        if (m.date_versement) htmlMeta += '<br><strong>Date</strong> : ' + _echapper(_formaterDate(m.date_versement));
        if (m.appareil) htmlMeta += ' &middot; <strong>Appareil</strong> : ' + _echapper(m.appareil);
        if (m.application_version) htmlMeta += ' &middot; Beta ' + _echapper(m.application_version);
        elMeta.innerHTML = htmlMeta;
    }

    var elSections = document.getElementById('reserve-ouvrir-sections');
    if (elSections) {
        var htmlSec = '';
        htmlSec += _construireSection('grilles', 'Grilles d\'évaluation', payload.ressources.grilles);
        htmlSec += _construireSection('echelles', 'Échelles de performance', payload.ressources.echelles);
        htmlSec += _construireSection('tampons', 'Tampons personnalisés', payload.ressources.tampons);
        elSections.innerHTML = htmlSec;
    }

    _majCompteur();
}

function _construireSection(typeRessource, libelle, items) {
    if (!Array.isArray(items) || items.length === 0) {
        return '<div class="u-mb-10" style="padding: 8px 10px; background: var(--surface-carte); border-radius: var(--radius-moyen); font-size: 0.82rem; color: var(--texte-secondaire);"><strong>' + _echapper(libelle) + '</strong> &mdash; <em>aucun</em></div>';
    }

    var nbDoublons = items.filter(function(it) { return it._doublon; }).length;

    var html = '<div class="u-mb-10" style="border: 1px solid var(--bordure-douce); border-radius: var(--radius-moyen); overflow: hidden;">';
    html += '<div style="background: var(--surface-carte); padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.85rem;">';
    html += '<strong>' + _echapper(libelle) + '</strong>';
    html += '<span style="color: var(--texte-secondaire); font-size: 0.78rem;">' + items.length + ' &eacute;l&eacute;ment(s)';
    if (nbDoublons > 0) html += ' &middot; ' + nbDoublons + ' d&eacute;j&agrave; pr&eacute;sent(s)';
    html += '</span>';
    html += '<span class="u-flex-gap-4">';
    html += '<button class="btn btn-secondaire u-texte-petit" data-action="ReserveOuvrir.onCheckTout" data-param="' + typeRessource + ':1" style="padding: 2px 6px;">Tout</button>';
    html += '<button class="btn btn-secondaire u-texte-petit" data-action="ReserveOuvrir.onCheckTout" data-param="' + typeRessource + ':0" style="padding: 2px 6px;">Aucun</button>';
    html += '</span>';
    html += '</div>';

    html += '<ul style="margin: 0; padding: 6px 10px; list-style: none; max-height: 180px; overflow-y: auto;">';
    items.forEach(function(item, idx) {
        var doublon = !!item._doublon;
        html += '<li style="padding: 3px 0; font-size: 0.85rem; ' + (doublon ? 'opacity: 0.55;' : '') + '">';
        html += '<label class="reserve-ouvrir-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;" data-type="' + typeRessource + '" data-idx="' + idx + '" data-doublon="' + (doublon ? '1' : '0') + '">';
        html += '<input type="checkbox" class="reserve-ouvrir-checkbox" data-on-change="ReserveOuvrir.onChangerSelection"' + (doublon ? ' disabled' : '') + '>';
        html += '<span>' + _echapper(item.nom || item.id) + '</span>';
        if (doublon) html += '<span style="font-size: 0.72rem; color: var(--texte-secondaire); margin-left: auto;">d&eacute;j&agrave; pr&eacute;sent</span>';
        html += '</label>';
        html += '</li>';
    });
    html += '</ul>';
    html += '</div>';
    return html;
}

function _majCompteur() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    var n = modal.querySelectorAll('.reserve-ouvrir-checkbox:checked').length;
    var span = document.getElementById('reserve-ouvrir-compteur');
    if (span) span.textContent = String(n);
    var bouton = document.getElementById('reserve-ouvrir-bouton-reimporter');
    if (bouton) bouton.disabled = (n === 0);
}

function onChangerSelection() {
    _majCompteur();
}

function onCheckTout(param) {
    var parts = String(param || '').split(':');
    if (parts.length !== 2) return;
    var type = parts[0];
    var etat = parts[1] === '1';
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    modal.querySelectorAll('label.reserve-ouvrir-item[data-type="' + type + '"]').forEach(function(label) {
        var input = label.querySelector('input.reserve-ouvrir-checkbox');
        if (input && !input.disabled) input.checked = etat;
    });
    _majCompteur();
}

function onChangerToggleCopie(el) {
    var copieEnDouble = !!(el && el.checked);
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal) return;
    modal.querySelectorAll('label.reserve-ouvrir-item[data-doublon="1"]').forEach(function(label) {
        var input = label.querySelector('input.reserve-ouvrir-checkbox');
        if (!input) return;
        input.disabled = !copieEnDouble;
        if (!copieEnDouble) input.checked = false;
        label.style.opacity = copieEnDouble ? '1' : '0.55';
    });
    _majCompteur();
}

/* ===============================
   APPLICATION DU RÉIMPORT
   =============================== */

function _nettoyerMarqueurs(item) {
    var clone = JSON.parse(JSON.stringify(item));
    delete clone._doublon;
    return clone;
}

function _faireCopie(item, prefixId) {
    var copie = _nettoyerMarqueurs(item);
    if (typeof window.genererIdUnique === 'function') {
        copie.id = window.genererIdUnique(prefixId);
    } else {
        copie.id = prefixId + '_' + Date.now() + '_' + Math.floor(Math.random() * 1e6).toString(16);
    }
    if (copie.nom) copie.nom = copie.nom + ' — copie';
    var maintenant = new Date().toISOString();
    copie.dateCreation = maintenant;
    copie.dateModification = maintenant;
    return copie;
}

function _collecterSelection() {
    var modal = document.getElementById('modalOuvrirVersement');
    if (!modal || !_payloadCourant) return null;

    var sel = { grilles: [], echelles: [], tampons: [] };
    var ressources = _payloadCourant.ressources;

    modal.querySelectorAll('label.reserve-ouvrir-item').forEach(function(label) {
        var input = label.querySelector('input.reserve-ouvrir-checkbox');
        if (!input || !input.checked) return;
        var type = label.getAttribute('data-type');
        var idx = parseInt(label.getAttribute('data-idx'), 10);
        var item = (ressources[type] || [])[idx];
        if (item) sel[type].push(item);
    });

    return sel;
}

async function appliquerReimport() {
    var selection = _collecterSelection();
    if (!selection) {
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Erreur', 'Aucune sélection trouvée.');
        }
        return;
    }

    var total = selection.grilles.length + selection.echelles.length + selection.tampons.length;
    if (total === 0) return;

    var toggleCopie = document.getElementById('reserve-ouvrir-toggle-copie');
    var copieEnDouble = !!(toggleCopie && toggleCopie.checked);

    var rapport = { grilles: 0, echelles: 0, tampons: 0, copies: 0 };

    try {
        // Grilles
        if (selection.grilles.length > 0 && typeof window.importerGrillesExternes === 'function') {
            var grillesAImporter = selection.grilles.map(function(g) {
                if (copieEnDouble && g._doublon) {
                    rapport.copies++;
                    return _faireCopie(g, 'GRILLE');
                }
                return _nettoyerMarqueurs(g);
            });
            rapport.grilles = window.importerGrillesExternes(grillesAImporter, { remplacer: false }) || 0;
        }

        // Échelles
        if (selection.echelles.length > 0 && typeof window.importerEchellesExternes === 'function') {
            var echellesAImporter = selection.echelles.map(function(e) {
                if (copieEnDouble && e._doublon) {
                    rapport.copies++;
                    return _faireCopie(e, 'ECH');
                }
                return _nettoyerMarqueurs(e);
            });
            rapport.echelles = window.importerEchellesExternes(echellesAImporter, { remplacer: false }) || 0;
        }

        // Tampons : fusion manuelle (pas d'API publique dédiée)
        if (selection.tampons.length > 0 && window.db) {
            var actuels = db.getSync('tamponsPersonnalises', []) || [];
            if (!Array.isArray(actuels)) actuels = [];
            var idsActuels = new Set(actuels.map(function(t) { return t.id; }));
            for (var i = 0; i < selection.tampons.length; i++) {
                var src = selection.tampons[i];
                var item;
                if (copieEnDouble && src._doublon) {
                    item = _faireCopie(src, 'TAMPON');
                    rapport.copies++;
                } else {
                    item = _nettoyerMarqueurs(src);
                    if (idsActuels.has(item.id)) continue;
                }
                actuels.push(item);
                idsActuels.add(item.id);
                rapport.tampons++;
            }
            await db.set('tamponsPersonnalises', actuels);
        }

        var totalAjoutes = rapport.grilles + rapport.echelles + rapport.tampons;
        var details = [];
        if (rapport.grilles > 0) details.push(rapport.grilles + ' grille(s)');
        if (rapport.echelles > 0) details.push(rapport.echelles + ' échelle(s)');
        if (rapport.tampons > 0) details.push(rapport.tampons + ' tampon(s)');
        var detailStr = details.join(', ') || 'rien à importer (tout existait déjà)';
        if (rapport.copies > 0) detailStr += ' · ' + rapport.copies + ' copie(s) en double';

        if (typeof window.afficherNotificationSucces === 'function') {
            window.afficherNotificationSucces(
                totalAjoutes > 0 ? 'Réimport terminé' : 'Aucun réimport',
                detailStr
            );
        }

        fermerDialogue();
    } catch (e) {
        console.error('[ReserveOuvrir] Réimport échoué', e);
        if (typeof window.afficherNotificationErreur === 'function') {
            window.afficherNotificationErreur('Erreur de réimport', e.message || String(e));
        }
    }
}

/* ===============================
   EXPORTS
   =============================== */

window.ReserveOuvrir = {
    chargerDepuisFichier: chargerDepuisFichier,
    actionOuvrir: actionOuvrir,
    fermerDialogue: fermerDialogue,
    declencherInput: declencherInput,
    onFichierChoisi: onFichierChoisi,
    onChangerSelection: onChangerSelection,
    onCheckTout: onCheckTout,
    onChangerToggleCopie: onChangerToggleCopie,
    appliquerReimport: appliquerReimport,
    actionChoisirDossier: actionChoisirDossier,
    onChoisirVersement: onChoisirVersement
};

})();
