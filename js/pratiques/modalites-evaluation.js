/**
 * MODALITÉS D'ÉVALUATION — module PROPRIÉTAIRE (SSOT, #328 Lot 1).
 *
 * Seul point d'écriture autorisé de la clé namespacée `modalitesEvaluation`
 * (voir docs/DATA-OWNERSHIP.md et l'audit
 * `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`).
 * La sentinelle `tests/unit/sentinelle-ssot-modalites-ecrivains-L0.test.js`
 * verrouille la liste des écrivains : tout `db.set` direct hors de ce module
 * (et des migrations bornées documentées) fait échouer la suite.
 *
 * Périmètre Lot 1 : CENTRALISER les écritures sans en changer la sémantique.
 * Les champs miroirs (`pratique`, `pratiqueId`, `approcheEvaluation`,
 * `configPAN.jetons`) restent écrits à la main par les appelants — leur
 * dérivation depuis la pratique active est le Lot 2. La purge du fallback
 * non namespacé et des champs legacy est le Lot 3.
 *
 * @module modalites-evaluation
 */
(function () {
    'use strict';

    // Clé de stockage (namespacée par trimestre via window.cle).
    const CLE = 'modalitesEvaluation';

    /**
     * Lit l'objet modalités courant.
     * Conserve le fallback de lecture sur la clé NON namespacée (données
     * antérieures au namespacing du 24 mai 2026) — retrait prévu au Lot 3.
     * @returns {object} l'objet modalités (jamais null)
     */
    function lire() {
        return db.getSync(cle(CLE), null) || db.getSync(CLE, null) || {};
    }

    /**
     * Écriture interne unique. Tout chemin d'écriture du module passe ici.
     * Clé en littéral (pas via CLE) : la sentinelle SSOT greppe le littéral
     * pour repérer les écrivains — celui-ci doit être le seul visible.
     * @param {object} modalites
     */
    function _ecrire(modalites) {
        db.setSync(cle('modalitesEvaluation'), modalites);
    }

    /**
     * Modifie les modalités par mutation contrôlée (read-modify-write
     * centralisé). Le mutateur reçoit l'objet courant et le modifie en place
     * (affectations, `delete`, sections imbriquées) ; l'objet est ensuite
     * réécrit d'un bloc.
     * @param {function(object): void} mutateur
     * @returns {object} l'objet modalités après écriture
     */
    function modifier(mutateur) {
        const modalites = lire();
        if (typeof mutateur === 'function') mutateur(modalites);
        _ecrire(modalites);
        return modalites;
    }

    /**
     * Remplace l'objet modalités en entier (import de configuration,
     * bascule/restauration du mode démo). Refuse les valeurs non-objet
     * pour ne jamais stocker null/undefined à la place de la config.
     * @param {object} objet
     * @returns {boolean} vrai si écrit
     */
    function remplacer(objet) {
        if (!objet || typeof objet !== 'object') return false;
        _ecrire(objet);
        return true;
    }

    // Export public (SSOT de modalitesEvaluation).
    window.modalitesEvaluation = {
        CLE: CLE,
        lire: lire,
        modifier: modifier,
        remplacer: remplacer
    };
})();
