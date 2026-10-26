/* ===============================
   MODULE PALETTE-ALGO — Le critère algorithmique, étape 2b : la palette
   Date : 22 octobre 2026 (consigne `plans de travail/CONSIGNE-DU-JOUR.md` de 20 h 51, plan
   `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 2 ; textes provisoires :
   `TEXTES-2026-10-22-palette-critere-algorithmique.md`)

   Vocation
     UNE palette par critère algorithmique, sur le côté de son gabarit, sur le modèle de celle de
     la dissection (nom, aide, précision, groupe). Elle sert toutes les zones d'écriture du
     critère : les quatre énoncés, les deux zones de chaque palier et (lot 3b, 26 oct. 2026) le texte de
     chaque cas des tables de l'enseignant·e. Ce module dit QUOI montrer ;
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
function _T() { return _reg('tablesCasAlgo', './tables-cas-algo.js'); }

// Les textes de la palette — provisoires, réunis avec leur site dans
// `plans de travail/TEXTES-2026-10-22-palette-critere-algorithmique.md`. Cowork les tranche.
// ↻ #1150, lot 4 (24 oct. 2026) : l'en-tête, l'état sans cible et la cible — les mots de la maquette validée.
var TEXTES = {
    // ↻ Lot 3a de la table de cas (26 oct. 2026) : les mots de l'ébauche validée (« Blocs de textes »), au présent.
    titre: 'Blocs de textes',
    but: 'Ces blocs servent à composer les phrases que ce critère écrit seul sur chaque copie. Chaque bloc prend la valeur réelle de la copie évaluée.',
    gestes: ['Clique dans une zone violette.', 'Touche un bloc : il se pose au curseur.'],
    legende: 'Après la flèche : la valeur que le bloc prendrait sur la copie fictive.',
    groupes: {
        posee: 'Ce que tu écris dans la grille',
        remplie: 'Ce qui se remplit quand tu évalues la copie'
    },
    invitation: 'Aucune zone choisie.',
    astuce: 'Touche une zone violette : ses blocs paraissent ici.',
    inactif: 'Ce texte ne le remplit pas.',
    vide: 'vide',
    dans: function(zone) { return 'Zone choisie : ' + zone; },
    zonePalier: function(champ, nom) { return champ + ', palier ' + nom; },
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
    },
    // Lot 3a (ébauche du 26 oct.) : les blocs de la limite se disent sans « erreur » ni « mot » — la moyenne
    // dans les noms du critère, les autres dans les mots de l'ébauche.
    '{moyenne}': function(n) {
        return { nom: 'Moyenne de ' + n.mots.pluriel + ' par ' + n.erreurs.singulier,
                 aide: 'En moyenne, 1 à chaque N : c’est ce N. Vide sans occurrence.' };
    },
    '{seuil}': function() {
        return { nom: 'Tolérance', aide: 'Combien tu en tolères sur la longueur de référence.' };
    },
    '{longueur}': function() {
        return { nom: 'Longueur de référence', aide: 'La longueur sur laquelle tu fixes la limite.' };
    },
    '{service}': function() {
        return { nom: 'Nom du service', aide: 'Le nom du service d’aide. Vide : l’application retire ce qui le présente.' };
    },
    '{palier}': function() {
        return { nom: 'Palier atteint', aide: 'Le nom court du palier que la copie atteint.' };
    },
    // Absent de l'ébauche (elle ne le montre pas) ; ses mots d'hier nommaient les erreurs : dits sans discipline.
    '{projection}': function() {
        return { nom: 'Compte projeté', aide: 'Ce que la copie compterait sur la longueur de référence, au même rythme.' };
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

/** Le critère a-t-il des tables de cas (lot 3b) ? Leurs zones offrent les blocs des paliers. */
function _aDesTables(critere) {
    var T = _T();
    return !!(T && critere && T.aDesTables(critere));
}

/**
 * Les blocs de la palette d'un critère, dans l'ordre : le groupe `posee`, puis `remplie` ; dans
 * chaque groupe, ceux des énoncés puis ceux des paliers. Sans paliers ni table de cas, aucun bloc des paliers.
 * @returns {Array<{jeton, famille, groupe, nom, aide, precision, espaceDeTete}>}
 */
function blocs(critere) {
    var E = _E(), P = _P();
    var noms = _noms(critere);
    var sources = (E ? E.listerReperes() : []).concat((aDesPaliers(critere) || _aDesTables(critere)) && P ? P.listerReperes() : []);
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
 * Ce qu'une zone de table de cas offre (lot 3b, consigne § 2.4) : les blocs des paliers, plus la somme
 * pondérée ({points}, celle du décompte). Les repères bruts des deux registres, comme `listerReperes`.
 */
function reperesDesTables() {
    var E = _E(), P = _P();
    var points = (E ? E.listerReperes() : []).filter(function(r) { return r.jeton === '{points}'; });
    return (P ? P.listerReperes() : []).concat(points);
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
    else if (d.tableCas !== undefined) liste = reperesDesTables();
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
    if (d.palierIndex !== undefined) return _nomDeZonePalier(d, critere);
    if (d.tableCas !== undefined) return _nomDeZoneTable(d, critere);
    if (d.enonceCle === 'decompte') return 'Décompte des ' + _noms(critere).erreurs.pluriel;
    var E = _E();
    var cles = E ? E.listerCles() : [];
    for (var i = 0; i < cles.length; i++) if (cles[i].cle === d.enonceCle) return cles[i].libelle;
    return '';
}

/** Lot 3a : le palier se nomme par son nom court (« Verdict, palier Risqué »), sinon par son rang. */
function _nomDeZonePalier(d, critere) {
    var champ = TEXTES.champsPalier[d.champ] || TEXTES.champsPalier.texte;
    var P = _P();
    var pal = (P && critere) ? (P.normaliser(critere).paliers || [])[Number(d.palierIndex)] : null;
    var nom = pal ? String(pal.libelle || pal.cle || '').trim() : '';
    return TEXTES.zonePalier(champ, nom || String(Number(d.palierIndex) + 1));
}

/** Lot 3b — une zone de table de cas : « Table selon le compte des erreurs, cas jusqu’à 2 » (`tablesCasAlgo`). */
function _nomDeZoneTable(d, critere) {
    var T = _T();
    return (T && critere) ? T.nomDeZone(critere, d.tableCas, d.cas) : '';
}

var api = {
    TEXTES: TEXTES,
    aDesPaliers: aDesPaliers,
    blocs: blocs,
    reperesDeZone: reperesDeZone,
    reperesDesTables: reperesDesTables,
    nomDeZone: nomDeZone
};

if (typeof window !== 'undefined') window.paletteAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
