/* ===============================
   MODULE : TAILLE D'UN FICHIER
   Date : 15 octobre 2026 (#993, lot « Ton codex dit vrai »)

   Vocation
     La seule façon dont l'application dit une taille de fichier à l'usager.
     Décision de Grégoire (15 oct. 2026, 9 h 22) : l'application compte comme le
     système de la personne, base 1000 sur Mac et iPad (Finder, iPadOS), base 1024
     sous Windows (Explorateur). Unités « Ko », « Mo », « Go » partout. Tout système
     qui n'est pas Windows compte en base 1000 (décision de Cowork).
     Les limites gardent leur valeur en octets ; seul leur affichage passe ici.

   Détection du système : `navigator.userAgentData.platform` quand le navigateur
     le donne (Chrome, Edge), sinon « Windows » dans `navigator.userAgent`. Safari
     sur iPad se déclare « Macintosh » : base 1000, comme l'iPad lui-même.

   Dépendances : `window.formaterNombre` (js/note-pourcentage.js, chargé avant ; #1137) ; lit `navigator`.

   API : window.TailleFichier
     - dire(octets, options) → string  (« 255 Mo », « 1,08 Go », « environ 1,0 Go »)
     - base() → 1000 | 1024
   =============================== */

(function() {
'use strict';

var UNITES = ['Ko', 'Mo', 'Go'];
var DECIMALES_PAR_DEFAUT = { Ko: 1, Mo: 1, Go: 2 };
// La taille annoncée d'un fichier qui sort (codex, archive) : « environ 255 Mo », « environ 1,3 Go ».
var DECIMALES_ENVIRON = { Ko: 0, Mo: 0, Go: 1 };

/** 1024 sous Windows, 1000 ailleurs. */
function base() {
    var nav = (typeof window !== 'undefined' && window.navigator) ||
              (typeof navigator !== 'undefined' ? navigator : null);
    if (!nav) return 1000;
    var plateforme = nav.userAgentData && nav.userAgentData.platform;
    if (typeof plateforme === 'string' && plateforme) return /windows/i.test(plateforme) ? 1024 : 1000;
    return /windows/i.test(String(nav.userAgent || '')) ? 1024 : 1000;
}

/**
 * La taille dite à l'usager. Virgule décimale (décision de Grégoire du 5 oct. 2026).
 * Sous la base : en octets (« 512 o »). Une valeur qui s'arrondirait à la base passe à
 * l'unité suivante (jamais « 1000 Mo »).
 * @param {number} octets
 * @param {Object} [options]
 * @param {number|{Ko?: number, Mo?: number, Go?: number}} [options.decimales] - la précision
 *   de l'écran ; un nombre vaut pour les trois unités (défaut : Ko 1, Mo 1, Go 2 ; avec
 *   `environ` : Ko 0, Mo 0, Go 1)
 * @param {boolean} [options.environ] - préfixe « environ »
 * @returns {string}
 */
function dire(octets, options) {
    options = options || {};
    var dec = {};
    var defaut = options.environ ? DECIMALES_ENVIRON : DECIMALES_PAR_DEFAUT;
    for (var u = 0; u < UNITES.length; u++) {
        var d = options.decimales;
        dec[UNITES[u]] = typeof d === 'number' ? d
            : (d && typeof d[UNITES[u]] === 'number' ? d[UNITES[u]] : defaut[UNITES[u]]);
    }
    var b = base();
    var n = Math.max(0, Number(octets) || 0);
    var texte;
    if (n < b) {
        texte = Math.round(n) + ' o';
    } else {
        var i = 0, valeur = n / b;
        while (i < UNITES.length - 1 && Number(valeur.toFixed(dec[UNITES[i]])) >= b) {
            i++;
            valeur = valeur / b;
        }
        texte = window.formaterNombre(valeur, dec[UNITES[i]]) + ' ' + UNITES[i];   // #1137 : la virgule, du module des nombres
    }
    return options.environ ? 'environ ' + texte : texte;
}

window.TailleFichier = { dire: dire, base: base };

})();
