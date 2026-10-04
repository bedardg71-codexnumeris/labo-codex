/* ===============================
   MODULE : ARCHIVES RÉGLAGES — Affichage du manifeste local
   Date : 2 mai 2026
   Backlog : #249 (dépend de #248)
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md

   Vocation
     Affiche dans Réglages > Données la liste des archives archivées
     (manifeste local maintenu par reserve.js #248) et le statut du
     dossier FSAPI lié.

   Dépendances
     - Reserve (window.Reserve) — lireManifesteLocal, statutHandle,
       supporteFSAPI, obtenirHandle, effacerLiaisonFSAPI,
       hydrateDepuisFSAPI, purgerEntreeManifeste
     - ReserveVerifier (window.ReserveVerifier) — lot A2 (30 sept. 2026) : l'état de
       vérification d'une archive et son bouton (leurs mots vivent là-bas, pas ici)
     - ReserveRevenir (window.ReserveRevenir) — lot A3 (4 oct. 2026) : le bouton « Faire
       revenir » d'une archive vérifiée (ses mots vivent là-bas)
     - echapperHtml (window.echapperHtml)
*/

(function() {
'use strict';

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
    if (!iso) return '—';
    try {
        var d = new Date(iso);
        return d.toLocaleString('fr-CA', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return iso;
    }
}

function _formaterTaille(octets) {
    if (!octets || octets <= 0) return '—';
    var ko = octets / 1024;
    if (ko < 1024) return Math.round(ko) + ' Ko';
    var mo = ko / 1024;
    if (mo < 1024) return mo.toFixed(1) + ' Mo';
    return (mo / 1024).toFixed(2) + ' Go';
}

/** Lot A2 : ce que la liste dit de la vérification d'une archive (mots dans ReserveVerifier.MOTS). */
function _badgeVerification(entree) {
    var RV = window.ReserveVerifier;
    if (!RV || typeof RV.etatVerification !== 'function') return '';
    var etat = RV.etatVerification(entree);
    return '<span class="' + (etat.verifiee ? 'badge-verif-ok' : 'badge-verif-non') + '">' +
        _echapper(etat.texte) + '</span>';
}

function _boutonVerifier(dossier) {
    var RV = window.ReserveVerifier;
    if (!RV || typeof RV.actionVerifier !== 'function') return '';
    return '<button class="btn btn-secondaire btn-compact" ' +
        'data-action="ReserveVerifier.actionVerifier" ' +
        'data-param="' + _echapper(dossier) + '" ' +
        'title="Relire cette archive, copie par copie">' +
        _echapper(RV.MOTS.bouton) +
    '</button> ';
}

/**
 * Lot A3 (#1000) : « Faire revenir », offert seulement pour une archive vérifiée dans ce
 * navigateur (la garde est aussi dans l'action). Mots dans ReserveRevenir.MOTS.
 */
function _boutonFaireRevenir(entree) {
    var RR = window.ReserveRevenir;
    var RV = window.ReserveVerifier;
    if (!RR || typeof RR.actionFaireRevenir !== 'function' || !RV || !RV.etatVerification(entree).verifiee) return '';
    return '<button class="btn btn-secondaire btn-compact" ' +
        'data-action="ReserveRevenir.actionFaireRevenir" ' +
        'data-param="' + _echapper(entree._dossier) + '" ' +
        'title="' + _echapper(RR.MOTS.infobulle) + '">' +
        _echapper(RR.MOTS.bouton) +
    '</button> ';
}

function _badgeMode(mode) {
    if (mode === 'fsapi') {
        return '<span class="badge-mode-fsapi">Disque (FSAPI)</span>';
    }
    if (mode === 'zip') {
        return '<span class="badge-mode-zip">ZIP</span>';
    }
    return '<span class="badge-mode-inconnu">' + _echapper(mode || '?') + '</span>';
}

/* ===============================
   RENDU DU BANDEAU DOSSIER FSAPI
   =============================== */

async function _rendreBandeauDossier() {
    var conteneur = document.getElementById('reserve-reglages-dossier-contenu');
    if (!conteneur) return;

    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.supporteFSAPI !== 'function') {
        conteneur.innerHTML = '<p class="text-muted u-texte-petit" style="margin: 0">Module Archives non chargé.</p>';
        return;
    }

    if (!Reserve.supporteFSAPI()) {
        conteneur.innerHTML =
            '<p class="u-mb-10" style="margin: 0 0 8px 0;">' +
                'Ton navigateur ne supporte pas l\'écriture directe sur disque. ' +
                'Les archives sont téléchargés sous forme de ZIP que tu déposes dans ' +
                '<code>~/Documents/Archives_LaboCodex/</code> manuellement.' +
            '</p>' +
            '<p class="text-muted u-texte-petit" style="margin: 0">' +
                'Disponible dans Chrome ou Edge sur Mac.' +
            '</p>';
        return;
    }

    var statut = null;
    try {
        statut = await Reserve.statutHandle();
    } catch (e) {
        console.warn('[ReserveReglages] statutHandle échoué', e.message || e);
    }

    if (!statut || !statut.handle) {
        conteneur.innerHTML =
            '<p class="u-mb-10" style="margin: 0 0 12px 0;">' +
                'Aucun dossier d’archives n\'est actuellement lié. ' +
                'Lie un dossier pour activer l\'écriture directe et la fusion automatique du manifeste.' +
            '</p>' +
            '<button class="btn btn-principal" data-action="ReserveReglages.actionLierDossier">' +
                'Lier un dossier…' +
            '</button>';
        return;
    }

    var nom = _echapper(statut.handle.name || 'Archives');
    var permTxt = '';
    var permClasse = '';
    if (statut.permission === 'granted') {
        permTxt = 'Permission accordée';
        permClasse = 'color: #2e7d32;';
    } else if (statut.permission === 'prompt') {
        permTxt = 'Permission à confirmer au prochain archivage';
        permClasse = 'color: #e65100;';
    } else {
        permTxt = 'Permission refusée';
        permClasse = 'color: #c62828;';
    }

    conteneur.innerHTML =
        '<p style="margin: 0 0 8px 0;">' +
            '<strong>Dossier lié :</strong> <code>' + nom + '</code>' +
        '</p>' +
        '<p class="u-texte-petit" style="margin: 0 0 12px 0; ' + permClasse + '">' +
            permTxt +
        '</p>' +
        '<div style="display: flex; gap: 10px; flex-wrap: wrap;">' +
            '<button class="btn btn-secondaire" data-action="ReserveReglages.actionVerifierDossier">' +
                'Vérifier le dossier' +
            '</button>' +
            '<button class="btn btn-secondaire" data-action="Reserve.actionChangerDossier">' +
                'Changer le dossier…' +
            '</button>' +
            '<button class="btn btn-secondaire" data-action="ReserveReglages.actionEffacerLiaison" ' +
                'data-confirm="Effacer la liaison vers ce dossier ? Les archives existantes ne sont pas supprimées.">' +
                'Effacer la liaison' +
            '</button>' +
        '</div>';
}

/* ===============================
   RENDU DU TABLEAU DES VERSEMENTS
   =============================== */

function _rendreTableau() {
    var conteneur = document.getElementById('reserve-reglages-table-conteneur');
    var resume = document.getElementById('reserve-reglages-resume');
    if (!conteneur) return;

    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.lireManifesteLocal !== 'function') {
        conteneur.innerHTML = '<p class="text-muted text-center" style="padding: 24px;">Module Archives non chargé.</p>';
        if (resume) resume.textContent = '';
        return;
    }

    var manifeste = Reserve.lireManifesteLocal();
    var entrees = Object.keys(manifeste.archives || {}).map(function(dossier) {
        var e = manifeste.archives[dossier] || {};
        return Object.assign({ _dossier: dossier }, e);
    });

    if (resume) {
        if (entrees.length === 0) {
            resume.textContent = '';
        } else {
            var maj = manifeste.derniere_mise_a_jour;
            resume.textContent = entrees.length + ' archive' + (entrees.length > 1 ? 's' : '') +
                (maj ? ' · liste mise à jour le ' + _formaterDate(maj) : '');
        }
    }

    if (entrees.length === 0) {
        conteneur.innerHTML =
            '<p class="text-muted text-center" style="padding: 24px;">' +
                'Aucune archive pour l’instant. Utilise <strong>Codex › Archiver…</strong> ' +
                'pour archiver un groupe-cours.' +
            '</p>';
        return;
    }

    // Tri : plus récent d'abord
    entrees.sort(function(a, b) {
        var da = a.date_archive || '';
        var db_ = b.date_archive || '';
        return da < db_ ? 1 : (da > db_ ? -1 : 0);
    });

    var lignes = entrees.map(function(e) {
        // E1 (#1022) : l'archive d'un trimestre entier n'a ni cours ni groupe.
        var estTrimestre = e.type_archive === 'trimestre';
        var libelleCours = estTrimestre && window.ReserveTrimestre
            ? _echapper(window.ReserveTrimestre.MOTS.liste.cours)
            : _echapper(e.cours || '—');
        if (e.nom_cours && e.nom_cours !== e.cours) {
            libelleCours += ' <span class="u-texte-gris u-texte-petit">' + _echapper(e.nom_cours) + '</span>';
        }
        var libelleGroupe = e.groupe ? 'gr' + _echapper(e.groupe) : '—';
        var libelleEtud = (e.nombre_etudiants != null) ? e.nombre_etudiants : '—';
        var libelleFich = (e.nombre_fichiers_travaux != null) ? e.nombre_fichiers_travaux : '—';
        var taille = _formaterTaille(e.taille_travaux_totale);

        return '' +
            '<tr>' +
                '<td>' + _echapper(e.trimestre || '—') + '</td>' +
                '<td>' + libelleCours + '</td>' +
                '<td>' + libelleGroupe + '</td>' +
                '<td>' + _formaterDate(e.date_archive) + '</td>' +
                '<td class="u-text-right">' + libelleEtud + '</td>' +
                '<td class="u-text-right">' + libelleFich + '</td>' +
                '<td class="u-text-right">' + _echapper(taille) + '</td>' +
                '<td>' + _badgeMode(e.mode_archive) + '</td>' +
                '<td>' + _badgeVerification(e) + '</td>' +
                '<td class="u-text-center">' +
                    _boutonVerifier(e._dossier) +
                    // E1 : « Faire revenir » ne connaît que l'archive d'un groupe ; le retour d'un trimestre sera E2.
                    (estTrimestre ? '' : _boutonFaireRevenir(e)) +
                    '<button class="btn btn-secondaire btn-compact" ' +
                        'data-action="ReserveReglages.actionPurgerEntree" ' +
                        'data-param="' + _echapper(e._dossier) + '" ' +
                        'data-confirm="Retirer cette entrée du manifeste local ? Les fichiers sur disque ne sont pas supprimés." ' +
                        'title="Retirer du manifeste local">' +
                        'Retirer' +
                    '</button>' +
                '</td>' +
            '</tr>';
    }).join('');

    conteneur.innerHTML =
        '<div style="overflow-x: auto;">' +
            '<table class="tableau">' +
                '<thead>' +
                    '<tr>' +
                        '<th>Trimestre</th>' +
                        '<th>Cours</th>' +
                        '<th>Groupe</th>' +
                        '<th>Date d’archivage</th>' +
                        '<th class="u-text-right">Étud.</th>' +
                        '<th class="u-text-right">Fich.</th>' +
                        '<th class="u-text-right">Taille</th>' +
                        '<th>Mode</th>' +
                        '<th>Vérification</th>' +
                        '<th class="u-text-center">Actions</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' + lignes + '</tbody>' +
            '</table>' +
        '</div>';
}

/* ===============================
   API PUBLIQUE — actions
   =============================== */

async function rafraichir() {
    try {
        await _rendreBandeauDossier();
    } catch (e) {
        console.warn('[ReserveReglages] rendu bandeau échoué', e.message || e);
    }
    try {
        _rendreTableau();
    } catch (e) {
        console.warn('[ReserveReglages] rendu tableau échoué', e.message || e);
    }
}

async function actionLierDossier() {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.obtenirHandle !== 'function') return;
    try {
        var handle = await Reserve.obtenirHandle({ forcer: true });
        if (handle) {
            notifications.succes('Dossier d’archives lié', handle.name || '');
        }
        if (handle && typeof Reserve.hydrateDepuisFSAPI === 'function') {
            try { await Reserve.hydrateDepuisFSAPI(handle); }
            catch (eHyd) { console.warn('[ReserveReglages] Hydratation post-liaison échouée', eHyd.message || eHyd); }
        }
    } catch (e) {
        console.warn('[ReserveReglages] Liaison dossier échouée', e.message || e);
    }
    rafraichir();
}

async function actionEffacerLiaison() {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.effacerLiaisonFSAPI !== 'function') return;
    try {
        await Reserve.effacerLiaisonFSAPI();
        notifications.succes('Liaison effacée', 'Le dossier d’archives n\'est plus lié.');
    } catch (e) {
        console.warn('[ReserveReglages] Effacement liaison échoué', e.message || e);
    }
    rafraichir();
}

async function actionVerifierDossier() {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.obtenirHandle !== 'function') return;
    try {
        var handle = await Reserve.obtenirHandle();
        if (!handle) {
            notifications.erreur('Aucun dossier lié', 'Lie d\'abord un dossier d’archives.');
            return;
        }
        var stats = await Reserve.hydrateDepuisFSAPI(handle);
        var msg = stats.total + ' archive(s) dans le manifeste FSAPI';
        if (stats.ajoutes) msg += ' · ' + stats.ajoutes + ' ajouté(s) localement';
        if (stats.mis_a_jour) msg += ' · ' + stats.mis_a_jour + ' mis à jour';
        notifications.succes('Dossier vérifié', msg);
    } catch (e) {
        console.warn('[ReserveReglages] Vérification dossier échouée', e.message || e);
        notifications.erreur('Vérification impossible', e.message || 'Erreur inconnue');
    }
    rafraichir();
}

function actionPurgerEntree(dossier) {
    var Reserve = window.Reserve;
    if (!Reserve || typeof Reserve.purgerEntreeManifeste !== 'function') return;
    if (!dossier) return;
    try {
        Reserve.purgerEntreeManifeste(dossier);
        notifications.succes('Entrée retirée', dossier);
    } catch (e) {
        console.warn('[ReserveReglages] Purge échouée', e.message || e);
    }
    rafraichir();
}

/* ===============================
   INIT
   =============================== */

function _init() {
    // Rendu initial différé pour laisser reserve.js terminer son hydratation auto.
    setTimeout(rafraichir, 250);

    // Re-rendu au clic sur l'accordéon (évite un état périmé après archivage)
    var accordeon = document.getElementById('accordeon-reserve');
    if (accordeon) {
        var header = accordeon.querySelector('.accordeon-header');
        if (header) {
            header.addEventListener('click', function() {
                // Petit délai pour laisser l'accordéon s'ouvrir avant rafraîchissement
                setTimeout(rafraichir, 50);
            });
        }
    }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    _init();
} else {
    document.addEventListener('DOMContentLoaded', _init);
}

window.ReserveReglages = {
    rafraichir: rafraichir,
    actionLierDossier: actionLierDossier,
    actionEffacerLiaison: actionEffacerLiaison,
    actionVerifierDossier: actionVerifierDossier,
    actionPurgerEntree: actionPurgerEntree
};

})();
