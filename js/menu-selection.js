/* ===============================
   MODULE MENU-SELECTION — La sélection d'une bibliothèque, en menu déroulant
   Date : 24 octobre 2026 (#1147 ; consigne `plans de travail/CONSIGNE-LOT-2026-10-24-bibliotheques-menu-conception.md`,
   plan `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 1)

   Vocation
     Ce que la barre latérale des cinq écrans de la Conception montrait (« ta sélection » : les objets
     que la bibliothèque a mis à portée de main), un menu déroulant le montre, au-dessus de la fiche, entre
     « Consulter la bibliothèque » et « + Nouvelle … » (la rangée `.rangee-selection` d'index.html).
     Un seul composant pour les cinq écrans ; le Cadre (lot 2) le réemploiera.

   CE QUE L'ÉCRAN LUI DONNE
     La liste (déjà filtrée par l'écran : `dansBibliotheque`, mode démo), l'objet ouvert, les libellés
     et la fonction d'ouverture, celle qu'appelait le clic sur une carte de la barre.
     Le menu montre le NOM SEUL, sans badge (décision de Grégoire, 24 oct. : « misons sur la sobriété ») ;
     un `suffixe` dit un ÉTAT (« (active) », la pratique du groupe-cours actif), jamais une caractéristique.

   LE MENU DIT CE QUE LA FICHE MONTRE
     La première option, « Aucune … ouverte », ne se choisit pas : elle dit qu'aucune fiche n'est ouverte.
     L'écran appelle `marquer` partout où il marquait la carte active (ouverture, création, fermeture).
     Après un choix, le menu se recale sur le dernier objet marqué : si l'écran refuse d'ouvrir (une
     création en cours qu'on garde), le menu revient à la fiche d'avant au lieu de mentir.

   Sécurité : les noms et les identifiants passent par `echapperHtml` (règle 1) ; le choix passe par `data-on-change`
   (dispatcher de main.js), aucun gestionnaire en ligne (règle 2).
   =============================== */

(function () {
'use strict';

// idMenu → { ouvrir, ids } : l'ouverture de l'écran, et l'identifiant d'origine de chaque option
// (la valeur d'une option est une chaîne ; l'écran compare avec l'identifiant tel qu'il est rangé).
var menus = {};

/**
 * Dessine le menu (ou, sélection vide, la phrase de l'écran) dans son emplacement.
 * @param {HTMLElement} emplacement - l'emplacement réservé dans la rangée
 * @param {Object} o
 * @param {string} o.idMenu - l'identifiant du `<select>`
 * @param {Array<{id, nom: string, suffixe?: string}>} o.elements - la sélection, dans l'ordre de l'écran
 * @param {*} [o.idOuvert] - l'objet dont la fiche est ouverte (rien : aucune)
 * @param {string} o.libelleAucun - « Aucune grille ouverte »
 * @param {string} o.libelleMenu - le nom du menu pour le lecteur d'écran : « Grille ouverte »
 * @param {string} o.phraseVide - ce que l'écran dit quand la sélection est vide
 * @param {function} o.ouvrir - l'ouverture de l'écran, reçoit l'identifiant
 */
function rendre(emplacement, o) {
    if (!emplacement) return;
    var elements = o.elements || [];

    if (elements.length === 0) {
        delete menus[o.idMenu];
        emplacement.innerHTML = '<p class="rangee-selection-vide">' + echapperHtml(o.phraseVide) + '</p>';
        return;
    }

    var ouverte = (o.idOuvert === null || o.idOuvert === undefined) ? '' : String(o.idOuvert);
    var trouvee = false;
    var ids = {};
    var options = elements.map(function (el) {
        var valeur = String(el.id);
        ids[valeur] = el.id;
        var choisie = !trouvee && ouverte !== '' && valeur === ouverte;
        if (choisie) trouvee = true;
        var texte = (el.nom || 'Sans titre') + (el.suffixe ? ' ' + el.suffixe : '');
        return '<option value="' + echapperHtml(valeur) + '"' + (choisie ? ' selected' : '') + '>'
            + echapperHtml(texte) + '</option>';
    }).join('');

    menus[o.idMenu] = { ouvrir: o.ouvrir, ids: ids };
    emplacement.innerHTML =
        '<label class="u-lecteur-ecran" for="' + echapperHtml(o.idMenu) + '">' + echapperHtml(o.libelleMenu) + '</label>'
        + '<select id="' + echapperHtml(o.idMenu) + '" class="controle-form rangee-selection-menu"'
        + ' data-on-change="MenuSelection.choisir" data-ouvert="' + echapperHtml(trouvee ? ouverte : '') + '">'
        + '<option value="" disabled' + (trouvee ? '' : ' selected') + '>' + echapperHtml(o.libelleAucun) + '</option>'
        + options + '</select>';
}

function marquerMenu(menu, id) {
    if (!menu || !menu.options || !menu.dataset) return;
    var valeur = (id === null || id === undefined) ? '' : String(id);
    var index = 0;
    for (var i = 1; i < menu.options.length; i++) {
        if (menu.options[i].value === valeur) { index = i; break; }
    }
    // `selectedIndex` et non `value` : il choisit aussi l'option « Aucune … », désactivée.
    menu.selectedIndex = index;
    menu.dataset.ouvert = index === 0 ? '' : valeur;
}

/**
 * Le menu montre l'objet ouvert ; rien (ou un objet absent de la sélection) : « Aucune … ouverte ».
 * @param {string} idMenu
 * @param {*} id
 */
function marquer(idMenu, id) {
    var menu = document.getElementById(idMenu);
    if (menu) marquerMenu(menu, id);
}

/** Le choix dans le menu (`data-on-change`) : ouvre la fiche comme le clic sur une carte. */
async function choisir(menu) {
    var idMenu = menu.id;
    var m = menus[idMenu];
    var valeur = menu.value;
    if (m && valeur && typeof m.ouvrir === 'function') {
        await m.ouvrir(Object.prototype.hasOwnProperty.call(m.ids, valeur) ? m.ids[valeur] : valeur);
    }
    // L'ouverture a pu redessiner le menu : on relit le menu en place, pas l'ancien.
    var actuel = document.getElementById(idMenu);
    if (actuel) marquerMenu(actuel, actuel.dataset.ouvert || null);
}

var api = { rendre: rendre, marquer: marquer, choisir: choisir };

if (typeof window !== 'undefined') window.MenuSelection = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
