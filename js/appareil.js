/* ===============================
   MODULE : APPAREIL — UNE SEULE LECTURE DE L'APPAREIL, DU NAVIGATEUR ET DU SYSTÈME
   Date : 29 octobre 2026 (#1186)
   Consigne : plans de travail/CONSIGNE-LOT-2026-10-29-fenetre-de-fusion.md (Cowork, 29 oct., 20 h 59)

   Vocation
     Il y en avait quatre (codex.js ×2, rapport-bug.js, reserve.js). Celle du codex et des
     archives écrivait « Mac — Chrome » pour tout Chrome qui n'est pas un iPad, Windows compris ;
     celle du rapport de bug lisait Edge comme Chrome et Android comme Linux. Celle-ci sert le
     rapport de bug, le manifeste du codex, celui des archives et la fenêtre de fusion.

   La lecture (`lire`, fonction pure)
     - l'appareil : iPad, iPhone, Mac, PC Windows, PC Linux, Chromebook, Android ;
     - le navigateur : Edge avant Chrome (Edge porte « Chrome »), les navigateurs d'iOS (CriOS,
       EdgiOS, FxiOS : du WebKit sous un autre nom), Safari en dernier (tous portent « Safari ») ;
     - le système. Depuis iPadOS 13, l'iPad se dit « Macintosh » : il se reconnaît à l'écran
       tactile (`maxTouchPoints` > 1 ; un Mac en a 0).

   Les manifestes (codex, archives) gardent leur forme : `appareil` « Mac — Chrome »,
   `navigateur` « Chrome 156 / macOS ». Un codex ancien peut porter un `appareil` faux ; son
   `navigateur` porte le bon système : `libelleDuManifeste` le lit d'abord. Aucun manifeste
   existant n'est réécrit.
   =============================== */

(function() {
'use strict';

/** Le navigateur et sa version. */
function _navigateur(ua) {
    var regles = [
        ['Edge', /EdgiOS\/(\d+)/], ['Chrome', /CriOS\/(\d+)/], ['Firefox', /FxiOS\/(\d+)/],
        ['Edge', /Edg[A]?\/(\d+)/], ['Firefox', /Firefox\/(\d+)/], ['Chrome', /Chrome\/(\d+)/],
        ['Safari', /Version\/(\d+(?:\.\d+)?).*Safari/]
    ];
    for (var i = 0; i < regles.length; i++) {
        var m = ua.match(regles[i][1]);
        if (m) return { nom: regles[i][0], version: m[1] };
    }
    return { nom: 'Inconnu', version: '' };
}

/** L'appareil, son système et la version du système quand elle se lit. */
function _appareil(ua, pointsTactiles) {
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && pointsTactiles > 1)) return { appareil: 'iPad', systeme: 'iPadOS', versionSysteme: '' };
    if (/iPhone|iPod/.test(ua)) return { appareil: 'iPhone', systeme: 'iOS', versionSysteme: '' };
    if (/CrOS/.test(ua)) return { appareil: 'Chromebook', systeme: 'ChromeOS', versionSysteme: '' };
    var android = ua.match(/Android\s*([\d.]*)/);
    if (android) return { appareil: 'Android', systeme: 'Android', versionSysteme: android[1] || '' };
    var mac = ua.match(/Mac OS X\s*(\d+[._]\d+(?:[._]\d+)?)?/);
    if (mac || /Macintosh/.test(ua)) return { appareil: 'Mac', systeme: 'macOS', versionSysteme: mac && mac[1] ? mac[1].replace(/_/g, '.') : '' };
    if (/Windows/.test(ua)) return { appareil: 'PC Windows', systeme: 'Windows', versionSysteme: '' };
    if (/Linux/.test(ua)) return { appareil: 'PC Linux', systeme: 'Linux', versionSysteme: '' };
    return { appareil: 'Inconnu', systeme: 'Inconnu', versionSysteme: '' };
}

/**
 * Lit une chaîne d'agent (fonction pure).
 * @param {string} ua - navigator.userAgent
 * @param {number} [pointsTactiles] - navigator.maxTouchPoints
 * @returns {{appareil: string, navigateur: string, version: string, systeme: string, versionSysteme: string}}
 */
function lire(ua, pointsTactiles) {
    var a = _appareil(String(ua || ''), Number(pointsTactiles) || 0);
    var n = _navigateur(String(ua || ''));
    return { appareil: a.appareil, navigateur: n.nom, version: n.version, systeme: a.systeme, versionSysteme: a.versionSysteme };
}

/** Cet appareil-ci. */
function ici() {
    var nav = typeof navigator !== 'undefined' ? navigator : {};
    return lire(nav.userAgent, nav.maxTouchPoints);
}

/** « Mac, Chrome », « PC Windows, Edge » : ce que dit une colonne. */
function libelle(info) {
    return info.appareil + ', ' + info.navigateur;
}

/** Les deux champs des manifestes, dans leur forme d'avant : « Mac — Chrome », « Chrome 156 / macOS ». */
function pourLeManifeste(info) {
    var i = info || ici();
    return {
        appareil: i.appareil + ' — ' + i.navigateur,
        navigateur: (i.version ? i.navigateur + ' ' + i.version : i.navigateur) + ' / ' + i.systeme
    };
}

// Le système écrit dans `navigateur` → l'appareil (un iPhone et un iPod se disent tous deux iOS).
var APPAREIL_DU_SYSTEME = {
    iPadOS: 'iPad', iOS: 'iPhone', macOS: 'Mac', Windows: 'PC Windows', Linux: 'PC Linux',
    Android: 'Android', ChromeOS: 'Chromebook'
};

/**
 * L'appareil d'un codex, lu dans son manifeste : `navigateur` d'abord (« Chrome 156 / Windows »
 * porte le bon système, même quand un codex ancien écrivait « Mac — Chrome » sous Windows),
 * sinon `appareil` ; '' si rien ne se lit.
 */
function libelleDuManifeste(manifeste) {
    var m = manifeste || {};
    var nav = typeof m.navigateur === 'string' ? m.navigateur.match(/^(\S+)(?:\s+\S+)?\s*\/\s*(\S+)\s*$/) : null;
    if (nav && nav[1] !== 'Inconnu' && APPAREIL_DU_SYSTEME[nav[2]]) return APPAREIL_DU_SYSTEME[nav[2]] + ', ' + nav[1];
    var app = typeof m.appareil === 'string' ? m.appareil.split(/\s+—\s+/) : [];
    if (app.length === 2 && app[0] && app[1]) return app[0] + ', ' + app[1];
    return '';
}

window.Appareil = {
    lire: lire,
    ici: ici,
    libelle: libelle,
    pourLeManifeste: pourLeManifeste,
    libelleDuManifeste: libelleDuManifeste
};

})();
