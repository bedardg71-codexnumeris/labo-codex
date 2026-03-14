/* ===============================
   OVERLAY DE PROGRESSION — Utilitaire global (#229)

   API publique :
     window.afficherProgression(titre)
     window.majProgression(pourcentage, detail, stats?)
     window.masquerProgression()

   CSS requis : classes .progression-* dans styles.css
   =============================== */

(function() {
'use strict';

/** @type {HTMLElement|null} */
var _overlay = null;

/**
 * Affiche un overlay de progression plein ecran.
 * @param {string} titre - Ex: "Generation du classeur", "Export backup"
 */
window.afficherProgression = function(titre) {
    window.masquerProgression();

    var overlay = document.createElement('div');
    overlay.id = 'progression-overlay';
    overlay.className = 'progression-overlay';

    var boite = document.createElement('div');
    boite.className = 'progression-boite';

    boite.innerHTML =
        '<div class="progression-titre" id="progression-titre">' + titre + '</div>' +
        '<div class="progression-detail" id="progression-detail">Preparation...</div>' +
        '<div class="progression-piste">' +
            '<div class="progression-barre" id="progression-barre"></div>' +
        '</div>' +
        '<div class="progression-stats" id="progression-stats"></div>';

    overlay.appendChild(boite);
    document.body.appendChild(overlay);
    _overlay = overlay;
};

/**
 * Met a jour la progression.
 * @param {number} pourcentage - 0 a 100
 * @param {string} detail - Message de detail
 * @param {string} [stats] - Stats supplementaires (ex: "42/117 fichiers")
 */
window.majProgression = function(pourcentage, detail, stats) {
    var barre = document.getElementById('progression-barre');
    var detailEl = document.getElementById('progression-detail');
    var statsEl = document.getElementById('progression-stats');
    if (barre) barre.style.width = Math.min(100, Math.max(0, pourcentage)) + '%';
    if (detailEl) detailEl.textContent = detail;
    if (statsEl && stats) statsEl.textContent = stats;
};

/**
 * Masque l'overlay de progression.
 */
window.masquerProgression = function() {
    if (_overlay) {
        _overlay.remove();
        _overlay = null;
    }
    var ancien = document.getElementById('progression-overlay');
    if (ancien) ancien.remove();
};

})();
