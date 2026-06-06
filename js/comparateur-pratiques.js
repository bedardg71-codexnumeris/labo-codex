/* ============================================================
   COMPARATEUR DE PRATIQUES — lot C1-a (squelette + garde démo)
   ------------------------------------------------------------
   Vue d'aide au choix d'une pratique de notation. Montre, sur des
   profils-types contrastés, la maîtrise en regard de chaque note —
   pour sortir du paradigme du cumul (la note = reflet de la maîtrise
   en fin de parcours, pas un score additionné).

   Spec : plans de travail/SPEC_comparateur_pratiques.md (§3.1 matrice,
          §1 bis finalité, §3.4 garde démo)
   Conception C1 : plans de travail/NOTE-CONCEPTION-C1-comparateur.md
                   (design validé avec Grégoire le 6 juin 2026)

   PÉRIMÈTRE DE CE LOT (C1-a) : squelette du module, conteneur,
   ouverture/fermeture (focus SPA, Échap, clic extérieur) et la
   GARDE DÉMO. La matrice elle-même (4 profils, colonnes, colonne
   « Niveau atteint », deltas, en-têtes E1) arrive en C1-b.

   API publique (dispatcher data-action de main.js) :
   - ouvrirComparateurPratiques()
   - fermerComparateurPratiques()

   Panneau : #comparateur-pratiques-panel (index.html), construit
   dynamiquement à l'ouverture, vidé à la fermeture.

   Sécurité : contenu 100 % statique défini dans ce fichier — aucune
   donnée utilisateur injectée (même statut que guides-pedagogiques.js).
   Lecture seule absolue côté moteur : ce module n'écrit jamais de
   données (ni clés réelles, ni demo_*).
   ============================================================ */

(function() {

    /* ── État interne ─────────────────────────────────────── */
    var _focusAvantOuverture = null;
    var _ouvert = false;

    function estEnDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    /* ── Ouverture ────────────────────────────────────────── */
    function ouvrirComparateurPratiques() {
        var panel = document.getElementById('comparateur-pratiques-panel');
        if (!panel) {
            console.error('[comparateur-pratiques] Panneau #comparateur-pratiques-panel introuvable');
            return;
        }

        // Si déjà ouvert, refermer proprement d'abord (réentrance : la garde
        // démo réutilise ce chemin pour basculer invitation → vue).
        if (_ouvert) fermerComparateurPratiques();

        _focusAvantOuverture = document.activeElement;
        _ouvert = true;

        // GARDE DÉMO : le comparateur s'appuie sur les profils-types de la
        // démonstration. Hors démo, on invite à l'activer plutôt que d'afficher
        // une vue vide (§3.4 de la spec).
        if (estEnDemo()) {
            construireVue(panel);
        } else {
            construireInvitation(panel);
        }
        panel.style.display = '';

        // Accessibilité SPA : déplacer le focus vers le titre du panneau.
        var titre = panel.querySelector('.comparateur-titre');
        if (titre) titre.focus();

        document.addEventListener('keydown', _surClavier);
        // Différer pour ne pas capter le clic d'ouverture lui-même.
        setTimeout(function() {
            document.addEventListener('mousedown', _surClicExterieur);
        }, 0);
    }

    /* ── En-tête commun (titre + bouton fermer) ───────────── */
    function entete(titre) {
        return '<div class="comparateur-header">' +
                    '<div>' +
                        '<div class="comparateur-surtitre">Aide au choix d’une pratique</div>' +
                        '<h3 class="comparateur-titre" id="comparateur-titre-texte" tabindex="-1">' + titre + '</h3>' +
                    '</div>' +
                    '<button class="comparateur-fermer" title="Fermer le comparateur" aria-label="Fermer le comparateur">' +
                        '<img src="icons/icon-close-window.svg" alt="" class="modal-close-icon">' +
                    '</button>' +
                '</div>';
    }

    /* ── Garde démo : invitation à activer la démonstration ── */
    function construireInvitation(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu" role="dialog" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p>Le comparateur s’appuie sur des <strong>profils-types contrastés</strong> ' +
                    'pour montrer comment une même trajectoire d’apprentissage se traduit en notes ' +
                    'selon la pratique choisie. Ces profils vivent dans le <strong>mode démonstration</strong>.</p>' +
                    '<p>Active la démonstration pour explorer le comparateur sans toucher à tes données réelles.</p>' +
                    '<button class="btn btn-principal comparateur-activer-demo" type="button">Activer le mode démonstration</button>' +
                '</div>' +
            '</div>';
        attacherFermeture(panel);
        var btn = panel.querySelector('.comparateur-activer-demo');
        if (btn) btn.addEventListener('click', activerDemoEtOuvrir);
    }

    /* ── Vue comparateur (squelette C1-a ; matrice en C1-b) ── */
    function construireVue(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu" role="dialog" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p class="comparateur-finalite">Des pratiques différentes mesurent des choses ' +
                    'différentes — un écart n’est ni un bonus ni une erreur. Le comparateur ' +
                    'montre la <strong>maîtrise atteinte en regard de chaque note</strong>.</p>' +
                    '<div class="comparateur-matrice" id="comparateur-matrice" data-etat="squelette">' +
                        '<p class="comparateur-placeholder">La matrice de comparaison (profils-types, ' +
                        'colonne « Niveau atteint », pratiques en regard) sera affichée ici — lot C1-b.</p>' +
                    '</div>' +
                '</div>' +
            '</div>';
        attacherFermeture(panel);
    }

    function attacherFermeture(panel) {
        var f = panel.querySelector('.comparateur-fermer');
        if (f) f.addEventListener('click', fermerComparateurPratiques);
    }

    /* ── Garde démo : activer puis basculer sur la vue ──────── */
    function activerDemoEtOuvrir() {
        if (typeof activerModeDemo !== 'function') {
            console.warn('[comparateur-pratiques] activerModeDemo absent — impossible d’activer la démo');
            return;
        }
        // activerModeDemo est asynchrone (seed démo). On ré-ouvre ensuite pour
        // que la garde rebascule sur la vue (estEnDemo() devient vrai).
        Promise.resolve(activerModeDemo()).then(function() {
            ouvrirComparateurPratiques();
        }).catch(function(e) {
            console.error('[comparateur-pratiques] échec activation démo', e);
        });
    }

    /* ── Fermeture ────────────────────────────────────────── */
    function fermerComparateurPratiques() {
        var panel = document.getElementById('comparateur-pratiques-panel');
        if (!panel) return;

        document.removeEventListener('keydown', _surClavier);
        document.removeEventListener('mousedown', _surClicExterieur);

        panel.innerHTML = '';
        panel.style.display = 'none';
        _ouvert = false;

        // Restaurer le focus sur l'élément déclencheur.
        if (_focusAvantOuverture && typeof _focusAvantOuverture.focus === 'function'
            && document.contains(_focusAvantOuverture)) {
            _focusAvantOuverture.focus();
        }
        _focusAvantOuverture = null;
    }

    /* ── Écouteurs globaux (actifs seulement panneau ouvert) ─ */
    function _surClavier(e) {
        // Auto-désattachement défensif si l'overlay est fermé (cf. pattern
        // listeners globaux du projet) — ne pas compter sur le couple ouvrir/fermer.
        if (!_ouvert) {
            document.removeEventListener('keydown', _surClavier);
            return;
        }
        if (e.key === 'Escape') fermerComparateurPratiques();
    }

    function _surClicExterieur(e) {
        var panel = document.getElementById('comparateur-pratiques-panel');
        if (!panel || !_ouvert) {
            document.removeEventListener('mousedown', _surClicExterieur);
            return;
        }
        if (panel.contains(e.target)) return;
        // Laisser le dispatcher gérer un clic sur un autre bouton d'ouverture.
        if (e.target.closest && e.target.closest('[data-action="ouvrirComparateurPratiques"]')) return;
        fermerComparateurPratiques();
    }

    /* ── API publique (dispatcher data-action de main.js) ─── */
    window.ouvrirComparateurPratiques = ouvrirComparateurPratiques;
    window.fermerComparateurPratiques = fermerComparateurPratiques;

})();
