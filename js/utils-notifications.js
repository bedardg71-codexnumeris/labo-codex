// ============================================================================
// utils-notifications.js — Module utilitaire de notifications toast
// ----------------------------------------------------------------------------
// Source unique de vérité pour les notifications UI du projet. Consolide les
// 3 implémentations historiques (evaluation.js, groupe.js, trimestre.js) et
// les 23+ wrappers défensifs disséminés dans les sous-modules.
//
// API publique : window.notifications.{ succes, erreur, warning, info }
//
// Signatures :
//   notifications.succes (message, details = '', options = {})
//   notifications.erreur (titre,   details = '', options = {})
//   notifications.warning(message, details = '', options = {})
//   notifications.info   (message, details = '', options = {})
//
// options.icone (info uniquement) : 'lightbulb' → bascule l'icône info vers
//   icons8-bulb.svg (sémantique « conseil »). Cf. Lot C #286 (29 sites 💡).
//
// Icône SVG injectée automatiquement selon le type — les callers ne mettent
// plus d'emoji dans le message. Mapping :
//   succes  → icons/icons8-check.svg
//   erreur  → icons/icon-cancel.svg
//   warning → icons/icons8-warning.svg
//   info    → icons/icons8-info.svg  (ou icons8-bulb.svg si options.icone)
//
// Sécurité : icône via document.createElement('img') + img.src ; texte via
// textContent (jamais innerHTML). Immunisé contre XSS sans dépendance à
// echapperHtml. Aucune contrainte d'ordre de chargement.
//
// Accessibilité (Phase 5.5 axe-core, 22 mai 2026) :
// - succes/info  : role="status" + aria-live="polite" — annoncé par VoiceOver
//   sans interrompre la lecture en cours.
// - erreur/warning : role="alert" + aria-live="assertive" — interrompt
//   VoiceOver pour signaler immédiatement le problème.
// - aria-atomic="true" garantit que le message complet (titre + détails) est
//   lu d'un seul tenant.
// - L'icône <img> porte aria-hidden="true" (décor — la sémantique est portée
//   par le texte et le rôle ARIA du conteneur).
//
// Design : classe CSS .notification-succes (cf. styles.css) + classe modale
// .notification-{type} pour la couleur de fond et .notification-avec-icone
// pour le layout flex. Durées : succes/info 3s, warning 4s, erreur 5s.
// ============================================================================

(function() {
    'use strict';

    const CONFIG = {
        succes:  { fond: null,                                role: 'status', duree: 3000, icone: 'icons/icons8-check.svg',   alt: 'Succès' },
        erreur:  { fond: 'var(--rouge-erreur)',               role: 'alert',  duree: 5000, icone: 'icons/icon-cancel.svg',    alt: 'Erreur' },
        warning: { fond: 'var(--orange-attention, #e8a838)',  role: 'alert',  duree: 4000, icone: 'icons/icons8-warning.svg', alt: 'Avertissement' },
        info:    { fond: null,                                role: 'status', duree: 3000, icone: 'icons/icons8-info.svg',    alt: 'Information' }
    };

    const ICONE_LIGHTBULB = { src: 'icons/icons8-bulb.svg', alt: 'Conseil' };

    function _construireNotif(type, message, details, options) {
        const conf = CONFIG[type];
        const notif = document.createElement('div');
        notif.className = 'notification-succes notification-' + type + ' notification-avec-icone';
        notif.setAttribute('role', conf.role);
        notif.setAttribute('aria-live', conf.role === 'alert' ? 'assertive' : 'polite');
        notif.setAttribute('aria-atomic', 'true');

        if (conf.fond) {
            notif.style.background = conf.fond;
        }

        const icone = (type === 'info' && options && options.icone === 'lightbulb')
            ? ICONE_LIGHTBULB
            : { src: conf.icone, alt: conf.alt };
        const img = document.createElement('img');
        img.className = 'notification-icone';
        img.src = icone.src;
        img.alt = icone.alt;
        img.setAttribute('aria-hidden', 'true');
        notif.appendChild(img);

        const zoneTexte = document.createElement('div');
        zoneTexte.className = 'notification-texte';

        if (details) {
            const ligneMsg = document.createElement('div');
            ligneMsg.style.cssText = 'font-weight:600;margin-bottom:5px';
            ligneMsg.textContent = String(message);
            zoneTexte.appendChild(ligneMsg);

            const ligneDetails = document.createElement('div');
            ligneDetails.className = 'notification-details';
            ligneDetails.textContent = String(details);
            zoneTexte.appendChild(ligneDetails);
        } else {
            zoneTexte.textContent = String(message);
        }
        notif.appendChild(zoneTexte);

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

    function _emettre(type, message, details, options) {
        _afficher(_construireNotif(type, message, details, options), CONFIG[type].duree);
    }

    function succes(message, details = '', options = {})  { _emettre('succes',  message, details, options); }
    function erreur(titre,   details = '', options = {})  { _emettre('erreur',  titre,   details, options); }
    function warning(message, details = '', options = {}) { _emettre('warning', message, details, options); }
    function info(message,   details = '', options = {})  { _emettre('info',    message, details, options); }

    window.notifications = { succes, erreur, warning, info };
})();
