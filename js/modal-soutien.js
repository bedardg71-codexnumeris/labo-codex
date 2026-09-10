/**
 * modal-soutien.js — Modale « Soutenir Labo Codex »
 *
 * Ouverte depuis le bouton cœur de l'entête (et l'item du popover mobile) via
 * data-action="ouvrirModalSoutien". Décrit les façons de contribuer au projet.
 *
 * Accessibilité : focus déplacé dans la modale à l'ouverture, restauré à la
 * fermeture ; fermeture à Échap et au clic sur l'arrière-plan (data-close-on-bg) ;
 * focus piégé (Tab/Shift+Tab cyclent dans la modale). CSP : zéro handler inline,
 * data-action uniquement. Aucune couleur en dur (classes/variables du design system).
 *
 * Liens externes en target="_blank" rel="noopener noreferrer".
 */
(function () {
    'use strict';

    let _elementFocusAvant = null;
    let _gestionnaireClavier = null;

    function _contenuHTML() {
        // Contenu statique (aucune donnée utilisateur → pas d'échappement requis).
        // Liens financiers : portail Codex Numeris (page durable /#/portal/support pour
        // le don ; signup yearly pour l'abonnement ; gift pour l'offrir).
        // CoP : la « CoP » du projet est un LIEN EXTERNE AQPC (pas une section interne),
        // donc l'item pointe directement vers l'inscription AQPC — destination réelle de
        // l'onglet CoP. Décision Grégoire (8 juin) : on garde ce lien tel quel ; pas de
        // bouton réciproque, faute de section CoP interne (§4 clos ainsi).
        //
        // ORDRE DE LA COLONNE DROITE ET MOT « BLOGUE » (10 sept. 2026, rapport de Grégoire).
        // « Suivre le projet » passe AVANT « Avec tes moyens », et les trois libellés
        // d'abonnement nomment le blogue. Motif, dans ses mots : « on dirait ici que c'est
        // un abonnement à Labo Codex ». Les deux abonnements (gratuit et de soutien) sont
        // en effet DEUX NIVEAUX DU MÊME abonnement au blogue Codex Numeris — les trois
        // liens pointent vers son portail — et rien ne le disait. Présenter le blogue en
        // premier donne au bloc suivant l'objet auquel se rattacher.
        return `
        <div id="modalSoutien" class="modal-overlay actif" style="z-index: 10000;" data-close-on-bg="fermerModalSoutien">
            <div class="modal-contenu modal-soutien" role="dialog" aria-modal="true" aria-labelledby="modalSoutien-titre">
                <button class="modal-fermer" data-action="fermerModalSoutien" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                <h3 class="modal-titre" id="modalSoutien-titre">Soutenir Labo Codex</h3>

                <p class="soutien-intro">Voici plusieurs façons de contribuer, selon ton temps, ta voix et tes moyens.</p>

                <div class="soutien-colonnes">
                    <div class="soutien-colonne">
                        <section class="soutien-bloc">
                            <h4 class="soutien-bloc-titre">Avec ton temps</h4>
                            <ul class="soutien-liste">
                                <li>
                                    <a class="soutien-action" href="https://www.aqpc.qc.ca/fr/cop-labocodex" target="_blank" rel="noopener noreferrer">Rejoindre la Communauté de pratique de l'AQPC</a>
                                    <span class="soutien-detail">Développer tes connaissances, soutenir les autres, expérimenter les nouvelles fonctions, signaler des bugs et proposer des idées.</span>
                                </li>
                                <li>
                                    <span class="soutien-action">Expérimenter l'application et en parler à tes collègues</span>
                                    <span class="soutien-detail">Les accompagner dans leurs propres essais.</span>
                                </li>
                                <li>
                                    <span class="soutien-action">Devenir un point de relais dans ton institution</span>
                                    <span class="soutien-detail">Faire connaître le projet dans d'autres départements ou établissements.</span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    <div class="soutien-colonne">
                        <section class="soutien-bloc">
                            <h4 class="soutien-bloc-titre">Suivre le projet</h4>
                            <ul class="soutien-liste">
                                <li>
                                    <a class="soutien-action" href="https://codexnumeris.org/#/portal/signup/free" target="_blank" rel="noopener noreferrer">T'abonner gratuitement au blogue Codex Numeris</a>
                                    <span class="soutien-detail">Le blogue du développeur&nbsp;: procédures, trucs et astuces de Labo Codex, et des analyses critiques sur la technologie, la pédagogie et l'éducation.</span>
                                </li>
                            </ul>
                        </section>

                        <section class="soutien-bloc">
                            <h4 class="soutien-bloc-titre">Avec tes moyens</h4>
                            <ul class="soutien-liste">
                                <li>
                                    <a class="soutien-action" href="https://codexnumeris.org/#/portal/signup/68d7cf7691267900011c2b4c/yearly" target="_blank" rel="noopener noreferrer">Souscrire un abonnement de soutien au blogue</a>
                                    <span class="soutien-detail">24 $ par année. C'est cet abonnement qui finance Labo Codex.</span>
                                </li>
                                <li>
                                    <a class="soutien-action" href="https://codexnumeris.org/#/portal/gift" target="_blank" rel="noopener noreferrer">Offrir un abonnement de soutien au blogue</a>
                                    <span class="soutien-detail">À un·e collègue.</span>
                                </li>
                                <li>
                                    <a class="soutien-action" href="https://codexnumeris.org/#/portal/support" target="_blank" rel="noopener noreferrer">Faire un don</a>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                <p class="soutien-pied">Un commentaire, une question, ou une demande de présentation de l'application&nbsp;? Écris-nous à <a href="mailto:labo@codexnumeris.org">labo@codexnumeris.org</a>.</p>
            </div>
        </div>`;
    }

    function ouvrirModalSoutien() {
        if (document.getElementById('modalSoutien')) return; // déjà ouverte
        // (Le popover mobile se referme seul au clic sur un item — chrome-unifie.js.)

        _elementFocusAvant = document.activeElement;

        const container = document.createElement('div');
        container.innerHTML = _contenuHTML();
        document.body.appendChild(container);

        const overlay = document.getElementById('modalSoutien');
        if (!overlay) return;

        // Échap + piège du focus (Tab/Shift+Tab cyclent dans la modale).
        _gestionnaireClavier = function (event) {
            if (event.key === 'Escape') { fermerModalSoutien(); return; }
            if (event.key === 'Tab') {
                const focusables = overlay.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
                if (focusables.length === 0) return;
                const premier = focusables[0];
                const dernier = focusables[focusables.length - 1];
                if (event.shiftKey && document.activeElement === premier) {
                    event.preventDefault();
                    dernier.focus();
                } else if (!event.shiftKey && document.activeElement === dernier) {
                    event.preventDefault();
                    premier.focus();
                }
            }
        };
        document.addEventListener('keydown', _gestionnaireClavier);

        // Focus initial : le bouton de fermeture (premier élément focalisable).
        const fermer = overlay.querySelector('.modal-fermer');
        if (fermer) fermer.focus();
    }

    function fermerModalSoutien() {
        const overlay = document.getElementById('modalSoutien');
        if (overlay && overlay.parentElement) {
            overlay.parentElement.remove();
        }
        if (_gestionnaireClavier) {
            document.removeEventListener('keydown', _gestionnaireClavier);
            _gestionnaireClavier = null;
        }
        if (_elementFocusAvant && typeof _elementFocusAvant.focus === 'function') {
            _elementFocusAvant.focus();
        }
        _elementFocusAvant = null;
    }

    window.ouvrirModalSoutien = ouvrirModalSoutien;
    window.fermerModalSoutien = fermerModalSoutien;
})();
