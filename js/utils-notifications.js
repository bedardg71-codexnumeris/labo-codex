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
// Accessibilité (Phase 5.5 axe-core, 22 mai 2026) :
// - succes/info : role="status" + aria-live="polite" — annoncé par VoiceOver
//   sans interrompre la lecture en cours.
// - erreur : role="alert" + aria-live="assertive" — interrompt VoiceOver pour
//   signaler immédiatement le problème.
// - aria-atomic="true" garantit que le message complet (titre + détails) est
//   lu d'un seul tenant.
//
// Design : classe CSS .notification-succes (cf. styles.css). Background
// surchargé pour erreur via var(--rouge-erreur). Animation slide-out 300ms.
// Durées : succes/info 3s, erreur 5s.
// ============================================================================

(function() {
    'use strict';

    function _construireNotif(message, details, couleurFond, role) {
        const notif = document.createElement('div');
        notif.className = 'notification-succes';
        notif.setAttribute('role', role);
        notif.setAttribute('aria-live', role === 'alert' ? 'assertive' : 'polite');
        notif.setAttribute('aria-atomic', 'true');

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
        _afficher(_construireNotif(message, details, null, 'status'), 3000);
    }

    function erreur(titre, details = '') {
        _afficher(_construireNotif(titre, details, 'var(--rouge-erreur)', 'alert'), 5000);
    }

    function info(message, details = '') {
        _afficher(_construireNotif(message, details, null, 'status'), 3000);
    }

    window.notifications = { succes, erreur, info };
})();
