/* ===============================
   MODULE: EXPORT DES RÉSULTATS FINAUX (#333)
   Lot 2 — Synthèse CSV (archives personnelles de l'enseignant)

   Module DÉDIÉ (pas import-export.js — coordination #329 Voûte).
   Lecture seule : ne modifie jamais les données du trimestre.
   Données nominatives qui restent sur la machine (SKILL_Securite_donnees §9).

   Source de la note : simulerIndices(da, pratiqueId) — API unifiée toutes
   familles (Lot 1 re-scopé : on consomme simulerIndices, pas une nouvelle API
   moteur). La distinction « vrai 0 » vs « non constructible » suit #326.

   PÉRIMÈTRE LOT 2 : fichier de SYNTHÈSE (1 ligne/étudiant). Le « Détail » par
   production (1 ligne/étudiant×production avec rôle+pondération) exige une
   décomposition structurée par famille qui n'existe pas uniformément
   (simulerIndices fournit la note + un récit narratif, pas des lignes
   structurées) — à traiter quand cette décomposition existera.
   =============================== */

(function() {
'use strict';

// =========================================================================
// SÉCURITÉ CSV : RFC 4180 + protection contre l'injection de formules
// =========================================================================

/**
 * Échappe une cellule pour un CSV ouvert dans Excel/Numbers.
 * - Injection de formules : préfixe une apostrophe si la valeur commence par
 *   =, +, -, @ ou un caractère de contrôle (tab/CR) — sinon le tableur peut
 *   l'interpréter comme une formule exécutable.
 * - RFC 4180 : entoure de guillemets si la valeur contient « , » « " » ou un
 *   saut de ligne ; double les guillemets internes.
 * @param {*} valeur
 * @returns {string}
 */
function echapperCelluleCSV(valeur) {
    var s = (valeur === null || valeur === undefined) ? '' : String(valeur);
    if (/^[=+\-@\t\r]/.test(s)) {
        s = "'" + s;
    }
    if (/[",\r\n]/.test(s)) {
        s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

/**
 * Assemble un CSV (BOM UTF-8 pour Excel, fins de ligne CRLF) à partir d'un
 * tableau d'en-têtes et de lignes (tableaux de cellules).
 * @param {Array<string>} entetes
 * @param {Array<Array<*>>} lignes
 * @returns {string}
 */
function construireCSV(entetes, lignes) {
    var BOM = String.fromCharCode(0xFEFF);
    var toutes = [entetes].concat(lignes || []);
    return BOM + toutes.map(function(row) {
        return row.map(echapperCelluleCSV).join(',');
    }).join('\r\n') + '\r\n';
}

// =========================================================================
// CONSTRUCTION DES LIGNES (PUR — données et simulation injectées)
// =========================================================================

// #706 — la dernière colonne dit combien d'évaluations de l'élève ont été écartées de la note
// (brouillons non verrouillés, portée nulle), sur le modèle « 2 évaluations en brouillon,
// non comptées » du profil ; vide quand la simulation ne le sait pas.
// #723 (21 sept. 2026, tranché par Grégoire) : ce fichier sert à reporter les notes dans Léa —
// il garde la note ARRONDIE À L'ENTIER (l'indice P de simulerIndices), et l'en-tête le dit, pour
// qu'un 88 ici à côté d'un 87,6 au profil ne passe plus pour une erreur.
var ENTETES_SYNTHESE = [
    'DA', 'Nom', 'Prénom', 'Groupe', 'Cours', 'Trimestre',
    'Pratique (code)', 'Pratique (nom)', 'Note finale (arrondie à l\'entier)', 'Statut', 'Non comptées'
];

/**
 * Construit les lignes de synthèse (1 par étudiant). Fonction PURE : aucune
 * lecture du stockage ni du DOM — les étudiants, le contexte et la fonction de
 * simulation sont fournis par l'appelant (testable en isolation).
 *
 * @param {Array<{da, nom, prenom}>} etudiants
 * @param {{groupe, cours, trimestre, pratiqueId, pratiqueCode, pratiqueNom}} contexte
 * @param {function(da, pratiqueId): ({P, noteFinale, noteConstructible, details, ecartees}|null)} simuler
 * @returns {Array<Array<*>>}
 */
function construireLignesSynthese(etudiants, contexte, simuler) {
    var ctx = contexte || {};
    return (etudiants || []).map(function(e) {
        var r = (typeof simuler === 'function') ? simuler(e.da, ctx.pratiqueId) : null;
        var note, statut;
        if (!r || r.noteConstructible === false || r.P === null || r.P === undefined) {
            // Cohérent avec #326 : on n'écrit pas un 0 trompeur quand la note
            // ne se construit pas (DEN sans saisie, config incompatible…).
            note = '';
            statut = 'non constructible';
        } else {
            note = r.P;
            statut = (r.details && r.details.estProvisoire) ? 'provisoire' : 'final';
        }
        // #706 : le compte des écartées (brouillons + portée nulle), ou vide si inconnu.
        var nonComptees = (r && r.ecartees && typeof r.ecartees.total === 'number') ? r.ecartees.total : '';
        return [
            e.da, e.nom, e.prenom,
            ctx.groupe || '', ctx.cours || '', ctx.trimestre || '',
            ctx.pratiqueCode || '', ctx.pratiqueNom || '',
            note, statut, nonComptees
        ];
    });
}

/**
 * Génère le CSV de synthèse complet (en-têtes + lignes).
 * @returns {string}
 */
function genererCSVSynthese(etudiants, contexte, simuler) {
    return construireCSV(ENTETES_SYNTHESE, construireLignesSynthese(etudiants, contexte, simuler));
}

// =========================================================================
// ORCHESTRATION : collecte du contexte réel + téléchargement
// =========================================================================

/**
 * Collecte le contexte du groupe-cours actif (lecture seule).
 * @returns {{etudiants, contexte}|null}
 */
function _collecterContexteActif() {
    var etudiants = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif() : [];
    if (!etudiants || etudiants.length === 0) return null;

    var pratiqueId = (typeof obtenirIdPratiqueActive === 'function')
        ? obtenirIdPratiqueActive() : null;
    var pratique = (pratiqueId && typeof obtenirPratiqueParId === 'function')
        ? obtenirPratiqueParId(pratiqueId) : null;
    var infoCours = (typeof db !== 'undefined' && db.getSync) ? db.getSync('infoCours', {}) : {};

    var trimestre = '';
    if (typeof obtenirNomTrimestreActif === 'function') trimestre = obtenirNomTrimestreActif();
    else if (typeof obtenirTrimestreId === 'function') trimestre = obtenirTrimestreId();

    return {
        etudiants: etudiants,
        contexte: {
            cours: infoCours.nom || infoCours.titre || infoCours.cours || '',
            groupe: infoCours.groupe || infoCours.numeroGroupe || infoCours.numGroupe || '',
            trimestre: trimestre,
            pratiqueId: pratiqueId,
            pratiqueCode: (pratique && pratique.obtenirCode) ? pratique.obtenirCode() : '',
            pratiqueNom: (pratique && pratique.obtenirNom) ? pratique.obtenirNom() : ''
        }
    };
}

function _telechargerCSV(csv, nomBase) {
    var nom = (typeof genererNomFichierExport === 'function')
        ? genererNomFichierExport(nomBase, { extension: '.csv', precisionDate: 'minute' })
        : (nomBase + '.csv');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', nom);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Point d'entrée UI (data-action) : exporte la synthèse des résultats finaux
 * du groupe-cours actif en CSV.
 */
function exporterSyntheseResultatsCSV() {
    var ctx = _collecterContexteActif();
    if (!ctx) {
        if (typeof notifications !== 'undefined' && notifications.info) {
            notifications.info('Aucun résultat', 'Le groupe-cours actif ne contient aucun étudiant à exporter.');
        }
        return;
    }
    var simuler = (typeof simulerIndices === 'function') ? simulerIndices : null;
    var csv = genererCSVSynthese(ctx.etudiants, ctx.contexte, simuler);
    _telechargerCSV(csv, 'resultats-finaux-synthese');
    if (typeof notifications !== 'undefined' && notifications.succes) {
        notifications.succes('Export réussi', 'Synthèse des résultats finaux exportée en CSV.');
    }
}

// =========================================================================
// EXPORTS
// =========================================================================

window.exporterSyntheseResultatsCSV = exporterSyntheseResultatsCSV;
// Exposés pour les tests (fonctions pures, contenu déterministe)
window._exportResultats = {
    echapperCelluleCSV: echapperCelluleCSV,
    construireCSV: construireCSV,
    construireLignesSynthese: construireLignesSynthese,
    genererCSVSynthese: genererCSVSynthese,
    ENTETES_SYNTHESE: ENTETES_SYNTHESE
};

})();
