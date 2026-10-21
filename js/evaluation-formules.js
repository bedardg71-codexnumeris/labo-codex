/* ===============================
   MODULE EVALUATION-FORMULES — Registre des modèles de formule algorithmique

   RAISON D'ÊTRE (#667, 2026-08-31)
   La formule d'un critère algorithmique était écrite en dur en QUATRE endroits
   de calcul indépendants et RÉÉCRITE À LA MAIN en trois endroits d'affichage :

     · js/evaluation-calcul.js:95   calculerNoteAlgorithmique (code mort)
     · js/evaluation-calcul.js:385  calculerNoteAlgorithmiqueSimple
     · js/evaluation-calcul.js:~250 _calculerScoreAlgoCategories
     · js/evaluation-retroaction.js:~764 _detecterAlgoA0Bilan (note estimée)
     · js/grilles.js:3335 et :3630  texte « Formule: ... » (chaîne littérale)
     · index.html:11120             texte d'aide (chaîne littérale)

   Sept lieux de vérité pour une seule règle : rien n'empêchait le texte affiché
   de mentir sur le calcul réellement appliqué. Ce module est désormais le SEUL.
   Le texte de la formule est ENGENDRÉ à partir du modèle et de ses paramètres :
   il ne peut plus diverger du calcul, parce qu'ils sortent de la même source.

   CE QUI EST À L'UTILISATEUR, CE QUI EST AU CODE
   L'utilisateur choisit un modèle dans le gabarit de la grille et en fixe les
   paramètres. Le code fournit la liste des modèles et exécute le calcul. Aucune
   expression n'est interprétée : pas d'eval, pas de new Function, pas de
   surface d'exécution nouvelle.

   MODÈLE DE DONNÉES SUR LE CRITÈRE
     critere.modeleFormule  : string — identifiant du modèle (SSOT)
     critere.paramsFormule  : objet  — paramètres du modèle (SSOT)
     critere.facteurNormalisation : number — MIROIR DE COMPATIBILITÉ, écrit en
       dérivé pour le seul modèle « penalite_normalisee ». Jamais lu quand
       paramsFormule existe. Conservé parce que le schéma d'import/export
       (import-export.js:593), le pack de démonstration et les grilles déjà
       en base le portent. Sentinelle : tests/unit/sentinelle-650-formule-*.

   MIGRATION À LA LECTURE (aucune écriture de masse)
   Un critère d'avant #667 n'a ni modeleFormule ni paramsFormule. `normaliser`
   le lit comme « penalite_normalisee » avec le facteur trouvé sur le critère.
   Le comportement d'avant est donc reproduit au bit près, sans toucher aux
   données existantes.

   ATTENTION — ne pas confondre avec `critere.formule` (chaîne décorative
   héritée, affichée dans la liste des critères, qui n'entre dans AUCUN calcul
   et dont le champ de saisie `critereFormule` n'existe plus dans index.html).

   Aucune dépendance : ni DOM, ni db, ni evaluationEnCours. Testable en Node.
   =============================== */

(function() {
'use strict';

// ---------------------------------------------------------------------
// Bornes communes à tous les modèles
// ---------------------------------------------------------------------
// Le pourcentage d'un critère algorithmique est borné à [0, 100] depuis
// l'origine. Ce bornage n'appartient pas à un modèle en particulier : c'est
// l'échelle qui l'impose, puisque le niveau se lit dans un intervalle de
// pourcentage. Il reste donc au-dessus des modèles.
var PCT_MIN = 0;
var PCT_MAX = 100;

/** Formate un nombre pour le libellé (pas de décimale inutile). */
function _nb(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) return '?';
    var arrondi = Math.round(valeur * 100) / 100;
    return String(arrondi);
}

// ---------------------------------------------------------------------
// LES MODÈLES
// ---------------------------------------------------------------------
// Chaque modèle déclare :
//   id           identifiant stable, écrit dans les données
//   nom          libellé affiché dans le gabarit
//   description  une phrase, affichée sous le sélecteur
//   utiliseMots  le modèle a-t-il besoin du nombre de mots ?
//   parametres   [{cle, libelle, aide, defaut, min, max}] — saisis par
//                l'utilisateur dans le gabarit de la grille
//   calculer({ponderation, erreurs, mots, params}) -> note brute (non bornée)
//   symbolique({ponderation, params}) -> texte de la formule, sans les données
//   chiffre({ponderation, erreurs, mots, params, note}) -> texte avec les données
//
// Les valeurs `defaut` sont des DÉFAUTS DÉCLARÉS, visibles et modifiables dans
// le gabarit — pas des constantes cachées au fond d'un calcul. Celui de
// « penalite_normalisee » vaut 500 pour reproduire l'existant.

var MODELES = [
    {
        id: 'penalite_normalisee',
        nom: 'Pénalité normalisée',
        description: 'La pénalité est proportionnelle au taux d’erreurs, ramené à une longueur de référence.',
        utiliseMots: true,
        parametres: [
            {
                cle: 'facteurNormalisation',
                libelle: 'Facteur de normalisation (nombre de mots)',
                aide: 'Longueur de référence. À 500, un texte de 500 mots perd un point par erreur.',
                defaut: 500,
                min: 1,
                max: 10000
            }
        ],
        calculer: function(ctx) {
            return ctx.ponderation - (ctx.erreurs / ctx.mots * ctx.params.facteurNormalisation);
        },
        symbolique: function(ctx) {
            return 'Note = Pondération − (Erreurs ÷ Mots × ' + _nb(ctx.params.facteurNormalisation) + ')';
        },
        chiffre: function(ctx) {
            return 'Note = ' + _nb(ctx.ponderation) + ' − (' + _nb(ctx.erreurs) + ' ÷ ' + _nb(ctx.mots)
                 + ' × ' + _nb(ctx.params.facteurNormalisation) + ') = ' + ctx.note.toFixed(2);
        }
    },
    {
        id: 'ratio_cible',
        nom: 'Ratio mots par erreur',
        description: 'La note est le rapport entre le ratio atteint (mots par erreur) et un ratio visé. Atteindre le ratio visé donne la pondération complète.',
        utiliseMots: true,
        parametres: [
            {
                cle: 'motsParErreurCible',
                libelle: 'Ratio visé (mots par erreur pour la note complète)',
                aide: 'Nombre de mots à écrire par erreur commise pour obtenir 100 %.',
                defaut: 60,
                min: 1,
                max: 10000
            }
        ],
        calculer: function(ctx) {
            // Aucune erreur : le ratio est infini, la note est complète.
            if (ctx.erreurs <= 0) return ctx.ponderation;
            var ratioAtteint = ctx.mots / ctx.erreurs;
            return ctx.ponderation * Math.min(1, ratioAtteint / ctx.params.motsParErreurCible);
        },
        symbolique: function(ctx) {
            return 'Note = Pondération × min(1 ; (Mots ÷ Erreurs) ÷ ' + _nb(ctx.params.motsParErreurCible) + ')';
        },
        chiffre: function(ctx) {
            if (ctx.erreurs <= 0) {
                return 'Note = ' + _nb(ctx.ponderation) + ' (aucune erreur) = ' + ctx.note.toFixed(2);
            }
            var ratio = ctx.mots / ctx.erreurs;
            return 'Note = ' + _nb(ctx.ponderation) + ' × min(1 ; ' + ratio.toFixed(1) + ' ÷ '
                 + _nb(ctx.params.motsParErreurCible) + ') = ' + ctx.note.toFixed(2);
        }
    },
    {
        id: 'penalite_par_erreur',
        nom: 'Pénalité fixe par erreur',
        description: 'Chaque erreur retire un nombre fixe de points, sans égard à la longueur du texte. Le nombre de mots reste saisi pour la rétroaction, mais n’entre pas dans la note.',
        utiliseMots: false,
        parametres: [
            {
                cle: 'pointsParErreur',
                libelle: 'Points retirés par erreur',
                aide: 'Retranché de la pondération pour chaque erreur relevée.',
                defaut: 1,
                min: 0,
                max: 100
            }
        ],
        calculer: function(ctx) {
            return ctx.ponderation - (ctx.erreurs * ctx.params.pointsParErreur);
        },
        symbolique: function(ctx) {
            return 'Note = Pondération − (Erreurs × ' + _nb(ctx.params.pointsParErreur) + ')';
        },
        chiffre: function(ctx) {
            return 'Note = ' + _nb(ctx.ponderation) + ' − (' + _nb(ctx.erreurs) + ' × '
                 + _nb(ctx.params.pointsParErreur) + ') = ' + ctx.note.toFixed(2);
        }
    }
];

var MODELE_PAR_DEFAUT = 'penalite_normalisee';

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------

/** Liste des modèles, pour peupler le sélecteur du gabarit. */
function listerModeles() {
    return MODELES.map(function(m) {
        return {
            id: m.id,
            nom: m.nom,
            description: m.description,
            utiliseMots: m.utiliseMots,
            parametres: m.parametres.map(function(p) { return Object.assign({}, p); })
        };
    });
}

/** Le modèle demandé, ou null. Jamais de repli silencieux ici. */
function obtenirModele(modeleId) {
    for (var i = 0; i < MODELES.length; i++) {
        if (MODELES[i].id === modeleId) return MODELES[i];
    }
    return null;
}

/**
 * Lit la formule d'un critère, en migrant à la lecture les critères d'avant
 * #667. Retourne toujours un modèle exploitable et des paramètres complets.
 *
 * @returns {{modeleId, modele, params, herite}} `herite` dit si la valeur a été
 *          reconstituée faute de champ `modeleFormule` — l'appelant peut le
 *          signaler sans avoir à redeviner.
 */
function normaliser(critere) {
    critere = critere || {};
    var declare = typeof critere.modeleFormule === 'string' ? critere.modeleFormule.trim() : '';
    var modele = declare ? obtenirModele(declare) : null;
    var herite = false;

    if (!modele) {
        // Soit le critère est d'avant #667, soit il porte un identifiant de
        // modèle inconnu (grille importée d'une version plus récente). Dans les
        // deux cas on retombe sur le modèle historique — et on le DIT.
        modele = obtenirModele(MODELE_PAR_DEFAUT);
        herite = true;
    }

    var params = {};
    var source = (critere.paramsFormule && typeof critere.paramsFormule === 'object')
        ? critere.paramsFormule : {};

    modele.parametres.forEach(function(p) {
        var brut = source[p.cle];

        // Compatibilité : avant #667, le seul paramètre existant vivait
        // directement sur le critère sous le nom `facteurNormalisation`.
        if ((brut === undefined || brut === null || brut === '')
            && p.cle === 'facteurNormalisation'
            && critere.facteurNormalisation !== undefined
            && critere.facteurNormalisation !== null
            && critere.facteurNormalisation !== '') {
            brut = critere.facteurNormalisation;
        }

        var valeur = (brut === undefined || brut === null || brut === '') ? p.defaut : Number(brut);
        if (isNaN(valeur)) valeur = p.defaut;
        if (p.min !== undefined && valeur < p.min) valeur = p.min;
        if (p.max !== undefined && valeur > p.max) valeur = p.max;
        params[p.cle] = valeur;
    });

    return { modeleId: modele.id, modele: modele, params: params, herite: herite };
}

/**
 * Calcule la note d'un critère algorithmique.
 *
 * @param {object} critere - le critère de grille (porte le modèle et ses params)
 * @param {object} donnees - {ponderation, erreurs, mots}
 * @returns {{applicable, raison, note, pourcentage, pctBorne, modeleId, params}}
 *          `applicable: false` quand la saisie ne permet pas de conclure — le
 *          code ne devine pas une note, il dit qu'il ne peut pas.
 */
function calculer(critere, donnees) {
    var f = normaliser(critere);
    var ponderation = Number(donnees && donnees.ponderation);
    var erreurs = Number(donnees && donnees.erreurs) || 0;
    var mots = Number(donnees && donnees.mots) || 0;

    if (!ponderation || isNaN(ponderation) || ponderation <= 0) {
        return { applicable: false, raison: 'ponderation-absente', modeleId: f.modeleId, params: f.params };
    }
    if (f.modele.utiliseMots && mots <= 0) {
        return { applicable: false, raison: 'mots-absents', modeleId: f.modeleId, params: f.params };
    }

    var note = f.modele.calculer({ ponderation: ponderation, erreurs: erreurs, mots: mots, params: f.params });
    var pourcentage = (note / ponderation) * 100;
    var pctBorne = Math.max(PCT_MIN, Math.min(PCT_MAX, pourcentage));

    return {
        applicable: true,
        raison: '',
        note: note,
        pourcentage: pourcentage,
        pctBorne: pctBorne,
        modeleId: f.modeleId,
        params: f.params
    };
}

/** Texte de la formule sans les données — pour le gabarit de la grille. */
function libelleSymbolique(critere) {
    var f = normaliser(critere);
    return f.modele.symbolique({ params: f.params });
}

/**
 * Texte de la formule avec les données de l'évaluation — pour le module
 * Évaluer. Retourne '' quand le calcul n'est pas applicable : mieux vaut pas
 * de ligne du tout qu'une ligne qui affiche des tirets là où l'enseignant·e
 * attend un raisonnement.
 */
function libelleChiffre(critere, donnees) {
    var res = calculer(critere, donnees);
    if (!res.applicable) return '';
    var f = normaliser(critere);
    return f.modele.chiffre({
        ponderation: Number(donnees.ponderation),
        erreurs: Number(donnees.erreurs) || 0,
        mots: Number(donnees.mots) || 0,
        params: f.params,
        note: res.note
    });
}

/**
 * Écrit le modèle et ses paramètres sur un critère. Passe aussi le miroir de
 * compatibilité `facteurNormalisation` quand le modèle le comporte, et le
 * RETIRE quand il ne le comporte pas — sans quoi une grille passée à un autre
 * modèle garderait un facteur périmé que l'import relirait comme la vérité.
 *
 * Mute et retourne le critère.
 */
function appliquerAuCritere(critere, modeleId, paramsBruts) {
    var modele = obtenirModele(modeleId) || obtenirModele(MODELE_PAR_DEFAUT);
    var params = {};

    modele.parametres.forEach(function(p) {
        var brut = paramsBruts ? paramsBruts[p.cle] : undefined;
        var valeur = (brut === undefined || brut === null || brut === '') ? p.defaut : Number(brut);
        if (isNaN(valeur)) valeur = p.defaut;
        if (p.min !== undefined && valeur < p.min) valeur = p.min;
        if (p.max !== undefined && valeur > p.max) valeur = p.max;
        params[p.cle] = valeur;
    });

    critere.modeleFormule = modele.id;
    critere.paramsFormule = params;

    if (Object.prototype.hasOwnProperty.call(params, 'facteurNormalisation')) {
        critere.facteurNormalisation = params.facteurNormalisation;
    } else {
        delete critere.facteurNormalisation;
    }

    return critere;
}

// ---------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------
var api = {
    MODELE_PAR_DEFAUT: MODELE_PAR_DEFAUT,
    listerModeles: listerModeles,
    obtenirModele: obtenirModele,
    normaliser: normaliser,
    calculer: calculer,
    libelleSymbolique: libelleSymbolique,
    libelleChiffre: libelleChiffre,
    appliquerAuCritere: appliquerAuCritere
};

if (typeof window !== 'undefined') window.formulesAlgo = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
