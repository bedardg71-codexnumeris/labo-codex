// ============================================================================
// utils-notifications.js — Module utilitaire de notifications toast
// ----------------------------------------------------------------------------
// Source unique de vérité pour les notifications UI du projet. Consolide les
// 3 implémentations historiques (evaluation.js, groupe.js, trimestre.js) et
// les 23+ wrappers défensifs disséminés dans les sous-modules.
//
// API publique : window.notifications.{ succes, erreur, info }
//
// Sécurité : utilise textContent (pas innerHTML), donc immunisé contre XSS
// sans dépendance à echapperHtml. Aucune contrainte d'ordre de chargement
// pour la sanitisation.
//
// Design : classe CSS .notification-succes (cf. styles.css). Background
// surchargé pour erreur via var(--rouge-erreur). Animation slide-out 300ms.
// Durées : succes/info 3s, erreur 5s.
// ============================================================================

(function() {
    'use strict';

    function _construireNotif(message, details, couleurFond) {
        const notif = document.createElement('div');
        notif.className = 'notification-succes';

        if (couleurFond) {
            notif.style.background = couleurFond;
        }

        if (details) {
            const ligneMsg = document.createElement('div');
            ligneMsg.style.cssText = 'font-weight:600;margin-bottom:5px';
            ligneMsg.textContent = String(message);
            notif.appendChild(ligneMsg);

            const ligneDetails = document.createElement('div');
            ligneDetails.className = 'notification-details';
            ligneDetails.textContent = String(details);
            notif.appendChild(ligneDetails);
        } else {
            notif.textContent = String(message);
        }

        return notif;
    }

    function _afficher(notif, dureeMs) {
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(400px)';
            setTimeout(() => notif.remove(), 300);
        }, dureeMs);
    }

    function succes(message, details = '') {
        _afficher(_construireNotif(message, details, null), 3000);
    }

    function erreur(titre, details = '') {
        _afficher(_construireNotif(titre, details, 'var(--rouge-erreur)'), 5000);
    }

    function info(message, details = '') {
        _afficher(_construireNotif(message, details, null), 3000);
    }

    window.notifications = { succes, erreur, info };
})();
