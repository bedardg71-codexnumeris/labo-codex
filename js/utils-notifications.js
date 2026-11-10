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
// pour le layout flex.
//
// Durée et empilement (#1224, décision de Grégoire du 3 nov. 2026) :
// - succes/info partent seuls après 3 s ;
// - erreur/warning RESTENT jusqu'au bouton « OK » : le 3 nov., un vert
//   « 13 fichier(s) importé(s) » s'est posé sur un rouge qu'il n'a pas eu le
//   temps de lire ;
// - les messages s'EMPILENT dans .notifications-pile (en haut à droite), au
//   lieu de se recouvrir au même endroit ;
// - un message identique déjà affiché n'est pas répété : un rouge resté là
//   n'en appelle pas un second à fermer (une validation qui se redéclenche à
//   chaque frappe empilerait sinon autant de « OK ») ; un vert identique
//   remplace le précédent, qui repart pour 3 s.
// ============================================================================

(function() {
    'use strict';

    const CONFIG = {
        // duree: null = reste jusqu'à « OK » (#1224).
        succes:  { fond: null,                                role: 'status', duree: 3000, icone: 'icons/icons8-check.svg',   alt: 'Succès' },
        erreur:  { fond: 'var(--rouge-erreur)',               role: 'alert',  duree: null, icone: 'icons/icon-cancel.svg',    alt: 'Erreur' },
        warning: { fond: 'var(--orange-attention, #e8a838)',  role: 'alert',  duree: null, icone: 'icons/icons8-warning.svg', alt: 'Avertissement' },
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

    const ID_PILE = 'notifications-pile';
    const CLASSE_SORTIE = 'notification-sortie';

    function _pile() {
        let pile = document.getElementById(ID_PILE);
        if (!pile) {
            pile = document.createElement('div');
            pile.id = ID_PILE;
            pile.className = 'notifications-pile';
            document.body.appendChild(pile);
        }
        return pile;
    }

    function _retirer(notif) {
        if (notif.classList.contains(CLASSE_SORTIE)) return;
        notif.classList.add(CLASSE_SORTIE);
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(400px)';
        setTimeout(() => notif.remove(), 300);
    }

    function _ajouterBoutonOk(notif) {
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'notification-ok';
        bouton.textContent = 'OK';
        bouton.addEventListener('click', () => _retirer(notif));
        notif.appendChild(bouton);
    }

    function _emettre(type, message, details, options) {
        const conf = CONFIG[type];
        const signature = type + '\u0000' + String(message) + '\u0000' + String(details || '');
        const pile = _pile();
        const deja = Array.from(pile.children || []).find(n =>
            n.getAttribute('data-signature') === signature && !n.classList.contains(CLASSE_SORTIE));
        if (deja && conf.duree === null) return;
        if (deja) _retirer(deja);

        const notif = _construireNotif(type, message, details, options);
        notif.setAttribute('data-signature', signature);
        if (conf.duree === null) _ajouterBoutonOk(notif);
        pile.appendChild(notif);
        if (conf.duree !== null) setTimeout(() => _retirer(notif), conf.duree);
        _placerLaPile();
    }

    // ------------------------------------------------------------------------
    // Pendant un parcours, un avis ne couvre plus la bulle (corrections du huitième parcours, 9 nov. 2026,
    // décision de Cowork). Constat : à 820 px, l'orange « Grille enregistrée : ses critères totalisent… »,
    // resté de l'étape 7 jusqu'à son « OK » (#1224), couvrait la bulle de l'étape 9 ; un vert aussi.
    // Choix : c'est la PILE qui cède, pas la bulle et pas l'avis. Fermer un orange au changement de section
    // reviendrait sur #1224 ; faire éviter la pile par la bulle demanderait la règle à chaque parcours (le moteur
    // n'en a pas). Tant qu'un parcours joue et qu'un avis est affiché :
    //   1. la pile prend, parmi les quatre coins, le premier qui ne couvre pas la bulle (et, autant que possible,
    //      ni le contour de ce qu'il faut toucher) ;
    //   2. si aucun coin ne laisse la bulle libre (à 1180 × 820, une bulle centrée et une pile de 444 px ne tiennent
    //      pas côte à côte, relecture du 9 nov.), elle garde le coin qui la couvre le moins et passe SOUS la bulle.
    // Hors parcours, elle reste en haut à droite, à sa hauteur. La sonde tourne tant que la pile n'est pas vide :
    // un avis affiché avant le lancement d'un parcours cède aussi. Elle ne recalcule que si la bulle, le contour,
    // la pile ou la fenêtre ont bougé. Même lecture que le rappel du codex au sixième parcours :
    // `ParcoursMoteur.actif()`.
    // ------------------------------------------------------------------------
    const COINS_DE_LA_PILE = [
        { top: '', bottom: '', left: '', right: '', alignItems: '' },                             // en haut à droite (CSS)
        { top: 'auto', bottom: '12px', left: 'auto', right: '12px', alignItems: 'flex-end' },     // en bas à droite
        { top: 'auto', bottom: '12px', left: '12px', right: 'auto', alignItems: 'flex-start' },   // en bas à gauche
        { top: '12px', bottom: 'auto', left: '12px', right: 'auto', alignItems: 'flex-start' }    // en haut à gauche
    ];
    const SONDE_PILE_MS = 200;
    let _sondePile = null;
    let _dernierEtatPile = null;

    function _parcoursActif() {
        return !!(window.ParcoursMoteur && typeof window.ParcoursMoteur.actif === 'function' && window.ParcoursMoteur.actif());
    }

    function _poserCoin(pile, coin) {
        Object.keys(coin).forEach((k) => { pile.style[k] = coin[k]; });
    }

    function _aire(a, b) {
        if (!a || !b) return 0;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        return w > 0 && h > 0 ? w * h : 0;
    }

    function _rectVisible(el) {
        if (!el || el.hidden) return null;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? r : null;
    }

    function _remettreLaPile(pile) {
        _poserCoin(pile, COINS_DE_LA_PILE[0]);
        pile.style.zIndex = '';
    }

    /** La place de la pile : celle du CSS hors parcours ; pendant un parcours, celle qui laisse la bulle libre. */
    function _placerLaPile() {
        const pile = document.getElementById(ID_PILE);
        if (!pile || !pile.children.length) {
            if (pile) _remettreLaPile(pile);
            if (_sondePile) { clearInterval(_sondePile); _sondePile = null; }
            _dernierEtatPile = null;
            return;
        }
        if (!_sondePile) _sondePile = setInterval(_placerLaPile, SONDE_PILE_MS);
        if (!_parcoursActif()) {
            if (_dernierEtatPile !== 'hors parcours') _remettreLaPile(pile);
            _dernierEtatPile = 'hors parcours';
            return;
        }
        const elBulle = document.getElementById('parcours-bulle');
        const bulle = _rectVisible(elBulle);
        const contour = _rectVisible(document.getElementById('parcours-contour'));
        const cleRect = (r) => (r ? [r.left, r.top, r.width, r.height].map(Math.round).join(',') : '-');
        const etat = [cleRect(bulle), cleRect(contour), pile.children.length, pile.scrollHeight, window.innerWidth, window.innerHeight].join('|');
        if (etat === _dernierEtatPile) return;
        _dernierEtatPile = etat;
        pile.style.zIndex = '';
        let meilleur = null;
        COINS_DE_LA_PILE.forEach((coin, i) => {
            _poserCoin(pile, coin);
            const r = pile.getBoundingClientRect();
            const surBulle = _aire(r, bulle);
            // Couvrir la bulle coûte bien plus que couvrir le contour ; à égalité, le coin d'abord essayé.
            const cout = surBulle * 10000 + _aire(r, contour);
            if (!meilleur || cout < meilleur.cout) meilleur = { i, cout, surBulle };
        });
        _poserCoin(pile, COINS_DE_LA_PILE[meilleur.i]);
        if (meilleur.surBulle > 0 && elBulle) {
            const z = parseInt(getComputedStyle(elBulle).zIndex, 10);
            if (!isNaN(z)) pile.style.zIndex = String(z - 1);
        }
    }

    function succes(message, details = '', options = {})  { _emettre('succes',  message, details, options); }
    function erreur(titre,   details = '', options = {})  { _emettre('erreur',  titre,   details, options); }
    function warning(message, details = '', options = {}) { _emettre('warning', message, details, options); }
    function info(message,   details = '', options = {})  { _emettre('info',    message, details, options); }

    window.notifications = { succes, erreur, warning, info };
})();
