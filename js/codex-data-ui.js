/* ===============================
   MODULE : CODEX DATA UI — Modale d'extraction
   Date : 6 mai 2026
   Backlog : #251

   Vocation
     UI de la carte « Codex data » dans Réglages > Données. Modale d'extraction
     qui détecte automatiquement le mode (FSAPI ou ZIP) et propose la liste
     des archives ou un input file selon le navigateur.

   Dépendances
     - CodexData (window.CodexData) — module métier (codex-data.js)
     - Reserve (window.Reserve) — supporteFSAPI, lireManifesteLocal,
       obtenirHandle (utilisé indirectement via CodexData)
     - echapperHtml (window.echapperHtml)
     - window.notifications (utils-notifications.js)
*/

(function() {
'use strict';

/* ===============================
   ÉTAT INTERNE
   =============================== */

// Mode actif dans la modale ouverte : 'fsapi' | 'zip' | null
var _modeCourant = null;

// Sous-source en mode 'zip' : 'dossier' (sélection de dossier webkitdirectory)
// ou 'zips' (fichiers ZIP individuels) ou null
var _sourceZip = null;

// UUIDs cochés en mode FSAPI
var _uuidsSelectionnes = new Set();

// FileList sélectionnés en mode 'zip' / 'zips' (fichiers ZIP individuels)
var _filesSelectionnes = null;

// Archives détectées en mode 'zip' / 'dossier' (sortie de listerArchivesDansDossier)
var _archivesDuDossier = [];

// UUIDs cochés en mode 'zip' / 'dossier'
var _uuidsDuDossierSelectionnes = new Set();

// Cache de la liste des archives au moment de l'ouverture (mode FSAPI)
var _archivesDisponibles = [];

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
        return new Date(iso).toLocaleString('fr-CA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return iso;
    }
}

/** La taille d'un fichier choisi (taille-fichier.js, #993), à la précision de cet écran ; vide si inconnue. */
function _formaterTaille(octets) {
    if (!octets || octets <= 0) return '';
    return window.TailleFichier.dire(octets, { decimales: { Ko: 0, Mo: 1, Go: 2 } });
}

function _toggleHide(el, masque) {
    if (!el) return;
    el.classList.toggle('u-hide', !!masque);
}

function _notifSucces(titre, msg) {
    notifications.succes(titre, msg);
}

function _notifErreur(titre, msg) {
    notifications.erreur(titre, msg);
}

/* ===============================
   STATS DE LA CARTE 3 (Réglages > Données)
   =============================== */

/**
 * Met à jour le résumé sous le titre de la carte (« N archives disponibles »).
 * Appelé au boot et après chaque archivage.
 */
function rafraichirStatsCarte() {
    var el = document.getElementById('codex-data-stats');
    if (!el) return;

    var liste = window.CodexData ? window.CodexData.listerArchivesDisponibles() : [];
    var n = liste.length;

    if (n === 0) {
        el.innerHTML = '<em>Aucune archive disponible. Archive d\'abord un groupe-cours via le menu Codex &gt; Archiver.</em>';
        return;
    }

    var versions = (n === 1) ? '1 archive disponible' : n + ' archives disponibles';
    el.textContent = versions + ' dans le manifeste local.';
}

/* ===============================
   OUVERTURE / FERMETURE DE LA MODALE
   =============================== */

function actionOuvrirExtraction() {
    if (!window.CodexData) {
        _notifErreur('Erreur', 'Module Codex Data non chargé.');
        return;
    }

    _reinitialiserEtat();
    _archivesDisponibles = window.CodexData.listerArchivesDisponibles();

    // Détecter le mode initial
    var Reserve = window.Reserve;
    var supporte = Reserve && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI();
    var aManifeste = _archivesDisponibles.length > 0;

    if (supporte && aManifeste) {
        _activerMode('fsapi');
    } else {
        _activerMode('zip');
    }

    // Afficher la modale
    var modale = document.getElementById('modalCodexData');
    if (modale) modale.classList.add('actif');
}

function fermerDialogue() {
    var modale = document.getElementById('modalCodexData');
    if (modale) modale.classList.remove('actif');
    _reinitialiserEtat();
}

function _reinitialiserEtat() {
    _modeCourant = null;
    _sourceZip = null;
    _uuidsSelectionnes = new Set();
    _filesSelectionnes = null;
    _archivesDuDossier = [];
    _uuidsDuDossierSelectionnes = new Set();

    // Réinitialiser les champs UI
    var desc = document.getElementById('codex-data-description');
    if (desc) desc.value = '';

    var inputZip = document.getElementById('codex-data-input-zip');
    if (inputZip) inputZip.value = '';

    var inputDossier = document.getElementById('codex-data-input-dossier');
    if (inputDossier) inputDossier.value = '';

    var resume = document.getElementById('codex-data-source-resume');
    if (resume) resume.textContent = '';

    var listeDoss = document.getElementById('codex-data-liste-archives-dossier');
    if (listeDoss) listeDoss.innerHTML = '';
}

/* ===============================
   GESTION DES MODES
   =============================== */

function _activerMode(mode) {
    _modeCourant = mode;

    var blocFsapi = document.getElementById('codex-data-source-fsapi');
    var blocZip = document.getElementById('codex-data-source-zip');
    var elMode = document.getElementById('codex-data-mode');
    var btnBasculer = document.getElementById('codex-data-btn-bascule-mode');

    _toggleHide(blocFsapi, mode !== 'fsapi');
    _toggleHide(blocZip, mode !== 'zip');

    if (mode === 'fsapi') {
        if (elMode) {
            elMode.innerHTML =
                '<strong>Mode automatique</strong> — extraction directe depuis le dossier ' +
                '<code>~/Documents/Archives_LaboCodex/</code> li&eacute; dans tes R&eacute;glages.';
        }
        if (btnBasculer) {
            btnBasculer.classList.remove('u-hide');
            btnBasculer.textContent = 'Utiliser des fichiers d’archive à la place';
        }
        _rendreListeArchives();
    } else {
        if (elMode) {
            elMode.innerHTML =
                '<strong>Mode fichiers</strong> — choisis manuellement les fichiers d&rsquo;archive &agrave; combiner.';
        }
        // Mode ZIP : bouton basculer visible seulement si FSAPI est supporté ET manifeste a des entrées
        var Reserve = window.Reserve;
        var peutFSAPI = Reserve && typeof Reserve.supporteFSAPI === 'function' && Reserve.supporteFSAPI()
                        && _archivesDisponibles.length > 0;
        if (btnBasculer) {
            if (peutFSAPI) {
                btnBasculer.classList.remove('u-hide');
                btnBasculer.textContent = 'Utiliser la liste du manifeste à la place';
            } else {
                btnBasculer.classList.add('u-hide');
            }
        }
    }

    _majBoutonExtraire();
}

function basculerMode() {
    if (_modeCourant === 'fsapi') _activerMode('zip');
    else _activerMode('fsapi');
}

/* ===============================
   RENDU DE LA LISTE D'ARCHIVES (mode FSAPI)
   =============================== */

function _rendreListeArchives() {
    var conteneur = document.getElementById('codex-data-liste-archives');
    if (!conteneur) return;

    if (_archivesDisponibles.length === 0) {
        conteneur.innerHTML =
            '<p class="text-muted u-texte-petit" style="margin: 0">' +
                'Aucune archive dans le manifeste local. Archive d\'abord un groupe-cours.' +
            '</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < _archivesDisponibles.length; i++) {
        var a = _archivesDisponibles[i];
        var coche = _uuidsSelectionnes.has(a.uuid) ? 'checked' : '';
        var nbEt = (a.nombre_etudiants != null) ? (a.nombre_etudiants + ' &eacute;l.') : '';
        var dateAff = _formaterDate(a.date_archive);
        var nomCours = _echapper(a.nom_cours || '');
        var dossier = _echapper(a.dossier);
        var trimestre = _echapper(a.trimestre || '');
        var groupe = _echapper(a.groupe || '');
        var modeBadge = a.mode_archive === 'fsapi' ? 'Disque' : (a.mode_archive === 'zip' ? 'ZIP' : '');

        var metaParts = [];
        if (dateAff) metaParts.push(_echapper(dateAff));
        if (nbEt) metaParts.push(nbEt);
        if (modeBadge) metaParts.push(_echapper(modeBadge));
        var metaTxt = metaParts.length ? '<span class="text-muted u-texte-petit" style="margin-left: 8px; font-weight: normal;">' + metaParts.join(' &middot; ') + '</span>' : '';

        html += '<label class="codex-data-archive-item" ' +
                       'style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; ' +
                       'margin-bottom: 3px; background: var(--surface-carte); border-radius: var(--radius-moyen); cursor: pointer; font-size: 0.85rem;">' +
                    '<input type="checkbox" data-on-change="CodexDataUI.onChangerCochage" ' +
                           'data-uuid="' + _echapper(a.uuid) + '" ' + coche + ' ' +
                           'style="flex-shrink: 0;">' +
                    '<div style="flex: 1; min-width: 0;">' +
                        '<span style="font-weight: 500;">' + dossier + '</span>' +
                        (nomCours ? ' <span class="text-muted u-texte-09">&mdash; ' + nomCours + '</span>' : '') +
                        metaTxt +
                    '</div>' +
                '</label>';
    }

    conteneur.innerHTML = html;
}

function onChangerCochage(el) {
    if (!el || !el.dataset || !el.dataset.uuid) return;
    var uuid = el.dataset.uuid;
    if (el.checked) {
        _uuidsSelectionnes.add(uuid);
    } else {
        _uuidsSelectionnes.delete(uuid);
    }
    _majBoutonExtraire();
}

/* ===============================
   GESTION DES SOURCES (mode 'zip')
   =============================== */

/**
 * Clic sur le bouton « Sélectionner le dossier » : déclenche l'input file
 * (avec attribut webkitdirectory).
 */
function declencherSelectionDossier() {
    var input = document.getElementById('codex-data-input-dossier');
    if (input) {
        input.value = '';
        input.click();
    }
}

/**
 * data-on-change de l'input dossier : parcourt les fichiers et liste les archives.
 */
async function onChangerDossier(el) {
    if (!el || !el.files || el.files.length === 0) return;

    // Sélection dossier prend le pas sur la sélection ZIP individuels
    _sourceZip = 'dossier';
    _filesSelectionnes = null;

    // Vider l'input ZIP individuels pour cohérence visuelle
    var inputZip = document.getElementById('codex-data-input-zip');
    if (inputZip) inputZip.value = '';

    var resume = document.getElementById('codex-data-source-resume');
    var liste = document.getElementById('codex-data-liste-archives-dossier');

    if (resume) resume.innerHTML = '<em>Lecture du dossier&hellip;</em>';
    if (liste) liste.innerHTML = '';

    try {
        _archivesDuDossier = await window.CodexData.listerArchivesDansDossier(el.files);
    } catch (err) {
        console.error('[CodexDataUI] Lecture du dossier échouée :', err);
        if (resume) resume.textContent = 'Erreur de lecture : ' + (err.message || err);
        _archivesDuDossier = [];
        _majBoutonExtraire();
        return;
    }

    if (_archivesDuDossier.length === 0) {
        if (resume) {
            resume.innerHTML = 'Aucune archive trouv&eacute;e dans ce dossier. ' +
                'V&eacute;rifie que tu as bien s&eacute;lectionn&eacute; <code>Archives_LaboCodex/</code> ' +
                'ou un dossier qui contient un sous-dossier <code>trimestres/</code>.';
        }
        _majBoutonExtraire();
        return;
    }

    // Pré-cocher toutes les archives par défaut
    _uuidsDuDossierSelectionnes = new Set();
    _archivesDuDossier.forEach(function(a) {
        if (a.uuid) _uuidsDuDossierSelectionnes.add(a.uuid);
    });

    if (resume) {
        resume.innerHTML = '<strong>' + _archivesDuDossier.length + ' archive(s) d&eacute;tect&eacute;e(s)</strong> ' +
            '&mdash; d&eacute;coche celles que tu ne veux pas inclure.';
    }
    _rendreListeArchivesDuDossier();
    _majBoutonExtraire();
}

function _rendreListeArchivesDuDossier() {
    var conteneur = document.getElementById('codex-data-liste-archives-dossier');
    if (!conteneur) return;

    if (_archivesDuDossier.length === 0) {
        conteneur.innerHTML = '';
        return;
    }

    var html = '';
    for (var i = 0; i < _archivesDuDossier.length; i++) {
        var a = _archivesDuDossier[i];
        var coche = a.uuid && _uuidsDuDossierSelectionnes.has(a.uuid) ? 'checked' : '';
        var nbEt = (a.nombre_etudiants != null) ? (a.nombre_etudiants + ' &eacute;l.') : '';
        var dateAff = _formaterDate(a.date_archive);
        var dossier = _echapper(a.dossier);

        var metaPartsD = [];
        if (dateAff) metaPartsD.push(_echapper(dateAff));
        if (nbEt) metaPartsD.push(nbEt);
        var metaTxtD = metaPartsD.length ? '<span class="text-muted u-texte-petit" style="margin-left: 8px; font-weight: normal;">' + metaPartsD.join(' &middot; ') + '</span>' : '';

        html += '<label class="codex-data-archive-item" ' +
                       'style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; ' +
                       'margin-bottom: 3px; background: var(--surface-carte); border-radius: var(--radius-moyen); cursor: pointer; font-size: 0.85rem;">' +
                    '<input type="checkbox" data-on-change="CodexDataUI.onChangerCochageDossier" ' +
                           'data-uuid="' + _echapper(a.uuid || '') + '" ' + coche + ' ' +
                           'style="flex-shrink: 0;">' +
                    '<div style="flex: 1; min-width: 0;">' +
                        '<span style="font-weight: 500;">' + dossier + '</span>' +
                        metaTxtD +
                    '</div>' +
                '</label>';
    }

    conteneur.innerHTML = html;
}

function onChangerCochageDossier(el) {
    if (!el || !el.dataset || !el.dataset.uuid) return;
    var uuid = el.dataset.uuid;
    if (el.checked) {
        _uuidsDuDossierSelectionnes.add(uuid);
    } else {
        _uuidsDuDossierSelectionnes.delete(uuid);
    }
    _majBoutonExtraire();
}

/**
 * data-on-change de l'input fichiers ZIP individuels.
 */
function onChangerFichiersZIP(el) {
    if (!el || !el.files || el.files.length === 0) return;

    // Sélection ZIPs prend le pas sur la sélection dossier
    _sourceZip = 'zips';
    _filesSelectionnes = el.files;
    _archivesDuDossier = [];
    _uuidsDuDossierSelectionnes = new Set();

    // Vider l'input dossier + sa liste pour cohérence visuelle
    var inputDossier = document.getElementById('codex-data-input-dossier');
    if (inputDossier) inputDossier.value = '';
    var listeDoss = document.getElementById('codex-data-liste-archives-dossier');
    if (listeDoss) listeDoss.innerHTML = '';

    var resume = document.getElementById('codex-data-source-resume');
    if (resume) {
        if (_filesSelectionnes.length === 1) {
            var taille = _formaterTaille(_filesSelectionnes[0].size);
            resume.textContent = '1 fichier ZIP sélectionné' + (taille ? ' (' + taille + ')' : '') + '.';
        } else {
            var totalOctets = 0;
            for (var i = 0; i < _filesSelectionnes.length; i++) {
                totalOctets += _filesSelectionnes[i].size || 0;
            }
            resume.textContent = _filesSelectionnes.length + ' fichiers ZIP sélectionnés' +
                (totalOctets > 0 ? ' (' + _formaterTaille(totalOctets) + ' au total)' : '') + '.';
        }
    }
    _majBoutonExtraire();
}

/* ===============================
   ACTIVATION DU BOUTON EXTRAIRE
   =============================== */

function _majBoutonExtraire() {
    var btn = document.getElementById('codex-data-btn-extraire');
    if (!btn) return;

    var pret = false;
    if (_modeCourant === 'fsapi') {
        pret = _uuidsSelectionnes.size > 0;
    } else if (_modeCourant === 'zip') {
        if (_sourceZip === 'dossier') {
            pret = _uuidsDuDossierSelectionnes.size > 0;
        } else if (_sourceZip === 'zips') {
            pret = !!(_filesSelectionnes && _filesSelectionnes.length > 0);
        }
    }

    btn.disabled = !pret;
}

/* ===============================
   EXTRACTION
   =============================== */

async function lancerExtraction() {
    if (!window.CodexData) {
        _notifErreur('Erreur', 'Module Codex Data non charg&eacute;.');
        return;
    }

    var btn = document.getElementById('codex-data-btn-extraire');
    if (btn) btn.disabled = true;

    var desc = document.getElementById('codex-data-description');
    var description = (desc && desc.value) ? desc.value.trim() : '';

    try {
        var codexData = null;
        var opts = description ? { description: description } : null;

        if (_modeCourant === 'fsapi') {
            var uuids = Array.from(_uuidsSelectionnes);
            if (uuids.length === 0) throw new Error('Aucune archive sélectionnée');
            codexData = await window.CodexData.extraireDepuisArchivesFSAPI(uuids, opts);
        } else if (_modeCourant === 'zip' && _sourceZip === 'dossier') {
            // Filtrer les archives détectées dans le dossier selon les UUIDs cochés
            var archivesAExtraire = _archivesDuDossier.filter(function(a) {
                return a.uuid && _uuidsDuDossierSelectionnes.has(a.uuid);
            });
            if (archivesAExtraire.length === 0) throw new Error('Aucune archive cochée');
            codexData = await window.CodexData.extraireDepuisDossier(archivesAExtraire, opts);
        } else if (_modeCourant === 'zip' && _sourceZip === 'zips') {
            if (!_filesSelectionnes || _filesSelectionnes.length === 0) {
                throw new Error('Aucun fichier sélectionné');
            }
            codexData = await window.CodexData.extraireDepuisFichiersZIP(_filesSelectionnes, opts);
        } else {
            throw new Error('Aucune source sélectionnée — choisis un dossier ou des fichiers ZIP.');
        }

        window.CodexData.telecharger(codexData);

        var nb = (codexData.metadata && codexData.metadata.archives) ?
                  codexData.metadata.archives.length : 0;
        _notifSucces(
            'Codex data extrait',
            nb + ' archive(s) combinée(s). Le fichier est téléchargé dans ton dossier de téléchargements.'
        );

        fermerDialogue();
    } catch (err) {
        console.error('[CodexDataUI] Extraction échouée :', err);
        _notifErreur(
            'Extraction impossible',
            err && err.message ? err.message : String(err)
        );
        if (btn) btn.disabled = false;
    }
}

/* ===============================
   INITIALISATION
   =============================== */

function _initAuBoot() {
    rafraichirStatsCarte();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initAuBoot);
} else {
    setTimeout(_initAuBoot, 0);
}

// Rafraîchir si le manifeste change (notif depuis reserve.js)
if (typeof window !== 'undefined') {
    window.addEventListener('codex-data-manifeste-change', rafraichirStatsCarte);
}

/* ===============================
   API PUBLIQUE
   =============================== */

window.CodexDataUI = {
    actionOuvrirExtraction: actionOuvrirExtraction,
    fermerDialogue: fermerDialogue,
    basculerMode: basculerMode,
    onChangerCochage: onChangerCochage,
    declencherSelectionDossier: declencherSelectionDossier,
    onChangerDossier: onChangerDossier,
    onChangerCochageDossier: onChangerCochageDossier,
    onChangerFichiersZIP: onChangerFichiersZIP,
    lancerExtraction: lancerExtraction,
    rafraichirStatsCarte: rafraichirStatsCarte
};

})();
