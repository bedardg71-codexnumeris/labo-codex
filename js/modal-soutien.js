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
        return `
        <div id="modalSoutien" class="modal-overlay actif" style="z-index: 10000;" data-close-on-bg="fermerModalSoutien">
            <div class="modal-contenu modal-soutien" role="dialog" aria-modal="true" aria-labelledby="modalSoutien-titre">
                <button class="modal-fermer" data-action="fermerModalSoutien" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                <h3 class="modal-titre" id="modalSoutien-titre">Soutenir Labo Codex</h3>

                <div class="modal-section">
                    <p class="soutien-intro">Voici plusieurs façons de contribuer, selon ton temps, ta voix et tes moyens.</p>

                    <h4 class="soutien-groupe-titre">S'impliquer dans la communauté</h4>
                    <ul class="soutien-liste">
                        <li>
                            <a class="soutien-lien" href="https://www.aqpc.qc.ca/fr/cop-labocodex" target="_blank" rel="noopener noreferrer">Rejoindre la Communauté de pratique (CoP) de l'AQPC.</a>
                            Développer tes connaissances et soutenir les autres, participer au développement, expérimenter les nouvelles fonctions, signaler des bugs, proposer des idées pour le bien commun des utilisateur·rices (et bientôt, contribuer à la Voûte, la bibliothèque partagée, prévue cet automne).
                        </li>
                        <li>
                            <strong>Expérimenter l'application et en parler à tes collègues.</strong>
                            Les accompagner dans leurs propres essais.
                        </li>
                        <li>
                            <strong>Devenir un point de relais (ou ambassadeur·rice) dans ton institution.</strong>
                            Faire connaître le projet dans d'autres départements ou établissements.
                        </li>
                    </ul>

                    <h4 class="soutien-groupe-titre">Suivre le projet</h4>
                    <ul class="soutien-liste">
                        <li>
                            <a class="soutien-lien" href="https://codexnumeris.org/#/portal/signup/free" target="_blank" rel="noopener noreferrer">T'abonner gratuitement à Codex Numeris</a>, le blogue du développeur.
                        </li>
                    </ul>

                    <h4 class="soutien-groupe-titre">Soutenir financièrement</h4>
                    <ul class="soutien-liste">
                        <li><a class="soutien-lien" href="https://codexnumeris.org/#/portal/signup/68d7cf7691267900011c2b4c/yearly" target="_blank" rel="noopener noreferrer">Souscrire un abonnement de soutien à Codex Numeris</a> (24 $ par année).</li>
                        <li><a class="soutien-lien" href="https://codexnumeris.org/#/portal/gift" target="_blank" rel="noopener noreferrer">Offrir un abonnement de soutien</a> à un·e collègue.</li>
                        <li><a class="soutien-lien" href="https://codexnumeris.org/#/portal/support" target="_blank" rel="noopener noreferrer">Faire un don à Codex Numeris.</a></li>
                    </ul>
                </div>
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
