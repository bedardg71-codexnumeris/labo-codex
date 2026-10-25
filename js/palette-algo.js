/* ===============================
   MODULE PALETTE-ALGO — Le critère algorithmique, étape 2b : la palette
   Date : 22 octobre 2026 (consigne `plans de travail/CONSIGNE-DU-JOUR.md` de 20 h 51, plan
   `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 2 ; textes provisoires :
   `TEXTES-2026-10-22-palette-critere-algorithmique.md`)

   Vocation
     UNE palette par critère algorithmique, sur le côté de son gabarit, sur le modèle de celle de
     la dissection (nom, aide, précision, groupe). Elle sert toutes les zones d'écriture du
     critère : les quatre énoncés et les deux zones de chaque palier. Ce module dit QUOI montrer ;
     `grilles.js` le rend et pose le bloc au curseur.

   LES BLOCS — les repères des deux registres, réunis
     Un bloc par jeton : ceux des énoncés (`enoncesAlgo.listerReperes`) et, quand le critère
     projette, ceux des paliers (`projectionAlgo.listerReperes`). {erreurs} et {mots}, partagés,
     ne font qu'un bloc. ⚠ LE JETON NE CHANGE PAS : c'est lui que la zone reçoit et que le moteur
     lit. Seul ce qu'on MONTRE change : un nom en mots, jamais le nom de code.
     Deux groupes, les deux familles des registres : `posee` (écrit dans la grille), `remplie`
     (rempli à la correction). Leurs titres remplacent le paragraphe qui expliquait les couleurs.

   LES NOMS
     Ce qui parle de ce qu'on compte porte les noms du critère (`enoncesAlgo.noms`) : {erreurs},
     {mots}, {nomErreurs}, {nomMots}. ⚠ L'ÉLISION : jamais « de » devant un nom de l'enseignant·e
     (« Compte de unités » est faux, « Compte d'unités » ne se fabrique pas sans risque) ; « des »
     ne s'élide jamais : « Compte des unités manquantes ». Les autres blocs gardent le libellé de
     leur registre, avec sa majuscule ; ceux des paliers, l'étape 3 les reprend.

   LES ZONES
     Une zone n'offre que ce qu'un appel remplit (règle du 3 sept.) : `reperesDeCle` pour un énoncé,
     `listerReperes` de la projection pour un palier. Un bloc qu'elle n'offre pas est inactif, et le dit.

   Du texte brut partout : l'appelant échappe. Lecture seule : rien n'est écrit dans le critère.
   Dépendances (lues à l'appel, sur `window` ou par `require`) : enoncesAlgo, projectionAlgo.
   =============================== */

(function() {
'use strict';

function _reg(nom, fichier) {
    if (typeof window !== 'undefined' && window[nom]) return window[nom];
    if (typeof require === 'function') {
        try { return require(fichier); } catch (err) { return null; }
    }
    return null;
}
function _E() { return _reg('enoncesAlgo', './evaluation-enonces.js'); }
function _P() { return _reg('projectionAlgo', './evaluation-projection.js'); }

// Les textes de la palette — provisoires, réunis avec leur site dans
// `plans de travail/TEXTES-2026-10-22-palette-critere-algorithmique.md`. Cowork les tranche.
// ↻ #1150, lot 4 (24 oct. 2026) : l'en-tête, l'état sans cible et la cible — les mots de la maquette validée.
var TEXTES = {
    titre: 'Blocs du critère algorithmique',
    but: 'Ils servent à écrire les phrases que ce critère rédige seul, copie par copie. Chaque bloc prend la valeur de la copie corrigée.',
    gestes: ['Clique dans une zone violette.', 'Touche un bloc : il se pose au curseur.'],
    groupes: {
        posee: 'Ce que tu écris dans la grille',
        remplie: 'Ce qui se remplit à la correction'
    },
    invitation: 'Aucune zone choisie.',
    astuce: 'Clique dans une zone violette : les blocs qu\'elle accepte paraîtront ici.',
    inactif: 'Ce texte ne le remplit pas.',
    dans: function(zone) { return 'Tu écris dans : « ' + zone + ' »'; },
    zonePalier: function(champ, rang) { return champ + ', palier ' + rang; },
    champsPalier: { texte: 'Verdict', texteAide: 'Recommandation' }
};

// Les blocs qui portent les noms du critère. `n` : `enoncesAlgo.noms(critere)`.
var NOMMES = {
    '{erreurs}': function(n) {
        return { nom: 'Compte des ' + n.erreurs.pluriel,
                 aide: 'Le nombre compté sur la copie, à la correction : les codes posés dans Annoter, ou le nombre tapé.' };
    },
    '{mots}': function(n) {
        return { nom: 'Compte des ' + n.mots.pluriel,
                 aide: 'Le nombre saisi à la correction, copie par copie.' };
    },
    '{nomErreurs}': function(n) {
        return { nom: '« ' + n.erreurs.pluriel + ' »',
                 aide: 'Le nom de ce que tu comptes, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2.' };
    },
    '{nomMots}': function(n) {
        return { nom: '« ' + n.mots.pluriel + ' »',
                 aide: 'Le nom de ce à quoi tu rapportes le compte, écrit sous le critère : au singulier sous 2, au pluriel à partir de 2.' };
    }
};

// Une précision là où elle aide : ce que l'aide du registre ne peut pas dire en une phrase.
var PRECISIONS = {
    '{points}': 'Place-le juste après le compte. Une phrase sans lui ne montre que le compte, mais la ligne du calcul, dans le PDF, montre la parenthèse.'
};
// L'aide de {points}, sans ce que la précision dit déjà.
var AIDES = {
    '{points}': 'Entre parenthèses, le compte après pondération : « (5 après pondération) ». Il ne paraît que si un sous-critère ne pèse pas 1.'
};

function _majuscule(t) {
    var s = String(t || '');
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Un repère d'un registre, nommé pour CE critère. Garde le jeton, la famille et l'espace de tête. */
function _nommer(r, noms) {
    var nomme = NOMMES[r.jeton] ? NOMMES[r.jeton](noms) : null;
    return {
        jeton: r.jeton,
        famille: r.famille === 'posee' ? 'posee' : 'remplie',
        espaceDeTete: !!r.espaceDeTete,
        nom: nomme ? nomme.nom : _majuscule(r.libelle),
        // `libelle` : ce que le composeur montre dans la phrase — le même nom.
        libelle: nomme ? nomme.nom : _majuscule(r.libelle),
        aide: nomme ? nomme.aide : (AIDES[r.jeton] || r.aide || ''),
        precision: PRECISIONS[r.jeton] || ''
    };
}

function _noms(critere) {
    var E = _E();
    return E ? E.noms(critere)
        : { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
}

/** Le critère a-t-il des paliers (des zones de palier) ? Seulement s'il projette. */
function aDesPaliers(critere) {
    var P = _P();
    if (!P || typeof P.normaliser !== 'function') return false;
    var p = P.normaliser(critere);
    return !!(p && p.modele && p.modele.projette);
}

/**
 * Les blocs de la palette d'un critère, dans l'ordre : le groupe `posee`, puis `remplie` ; dans
 * chaque groupe, ceux des énoncés puis ceux des paliers. Sans paliers, aucun bloc des paliers.
 * @returns {Array<{jeton, famille, groupe, nom, aide, precision, espaceDeTete}>}
 */
function blocs(critere) {
    var E = _E(), P = _P();
    var noms = _noms(critere);
    var sources = (E ? E.listerReperes() : []).concat(aDesPaliers(critere) && P ? P.listerReperes() : []);
    var vus = {};
    var tous = [];
    sources.forEach(function(r) {
        if (!r || vus[r.jeton]) return;
        vus[r.jeton] = true;
        var b = _nommer(r, noms);
        b.groupe = TEXTES.groupes[b.famille];
        tous.push(b);
    });
    return tous.filter(function(b) { return b.famille === 'posee'; })
        .concat(tous.filter(function(b) { return b.famille === 'remplie'; }));
}

/**
 * Les repères qu'une zone OFFRE, nommés pour ce critère — ce que la palette active, ce que le
 * composeur montre dans la phrase, ce que la pose accepte. `zone` : le `dataset` d'une zone
 * (`enonceCle`, ou `palierIndex`). Une zone inconnue n'offre rien.
 */
function reperesDeZone(critere, zone) {
    var E = _E(), P = _P();
    var d = zone || {};
    var liste = [];
    if (d.palierIndex !== undefined) liste = P ? P.listerReperes() : [];
    else if (d.enonceCle !== undefined) liste = E ? E.reperesDeCle(d.enonceCle) : [];
    var noms = _noms(critere);
    return liste.map(function(r) { return _nommer(r, noms); });
}

/**
 * Le nom d'une zone, tel que la palette le dit (« Défi prioritaire », « Verdict, palier 2 ») et
 * que l'étiquette au-dessus d'un énoncé le montre. Le décompte porte le nom de ce que le critère
 * compte (« Décompte des unités manquantes ») : celui d'un critère sans noms reste « Décompte des
 * erreurs », le libellé d'hier.
 */
function nomDeZone(zone, critere) {
    var d = zone || {};
    if (d.palierIndex !== undefined) {
        var champ = TEXTES.champsPalier[d.champ] || TEXTES.champsPalier.texte;
        return TEXTES.zonePalier(champ, Number(d.palierIndex) + 1);
    }
    if (d.enonceCle === 'decompte') return 'Décompte des ' + _noms(critere).erreurs.pluriel;
    var E = _E();
    var cles = E ? E.listerCles() : [];
    for (var i = 0; i < cles.length; i++) if (cles[i].cle === d.enonceCle) return cles[i].libelle;
    return '';
}

var api = {
    TEXTES: TEXTES,
    aDesPaliers: aDesPaliers,
    blocs: blocs,
    reperesDeZone: reperesDeZone,
    nomDeZone: nomDeZone
};

if (typeof window !== 'undefined') window.paletteAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
