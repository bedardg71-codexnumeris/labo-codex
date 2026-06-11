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
 * dérivation depuis la pratique active est le Lot 2.
 *
 * Lot 3 (11 juin 2026) : le fallback de lecture sur la clé NON namespacée est
 * retiré (la migration namespacing de main.js, bornée, reste le seul lecteur
 * de la clé nue) ; `purgerLegacy()` retire le champ `dureePeriodeMinutes` des
 * données de chaque trimestre (valeur rapatriée dans la clé `dureePeriode`,
 * domaine horaire, si elle n'y est pas déjà).
 *
 * @module modalites-evaluation
 */
(function () {
    'use strict';

    // Clé de stockage (namespacée par trimestre via window.cle).
    const CLE = 'modalitesEvaluation';

    /**
     * Lit l'objet modalités courant (clé namespacée uniquement — le fallback
     * clé nue a été retiré au Lot 3, la migration namespacing de main.js
     * ayant peuplé les clés par trimestre depuis le 24 mai 2026).
     * @returns {object} l'objet modalités (jamais null)
     */
    function lire() {
        return db.getSync(cle(CLE), null) || {};
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

    /**
     * Purge le champ legacy `dureePeriodeMinutes` des modalités de CHAQUE
     * trimestre (Lot 3). La valeur est rapatriée dans la clé `dureePeriode`
     * (domaine horaire, SSOT depuis le Lot 0) si elle n'y est pas déjà — la
     * clé existante a toujours priorité, jamais d'écrasement.
     *
     * Appelée à chaque démarrage (main.js, séquence db-ready) : idempotente
     * et robuste face aux réintroductions par import de données anciennes
     * (même patron que nettoyerLegacy de preferences.js).
     * @returns {number} nombre de trimestres nettoyés
     */
    function purgerLegacy() {
        if (typeof window.enumererTrimestres !== 'function') return 0;
        let nettoyes = 0;
        for (const t of window.enumererTrimestres()) {
            const cleTrimestre = t.id + '_modalitesEvaluation';
            const m = db.getSync(cleTrimestre, null);
            if (!m || typeof m !== 'object' || !('dureePeriodeMinutes' in m)) continue;
            const cleDuree = t.id + '_dureePeriode';
            if (db.getSync(cleDuree, null) === null) {
                const duree = parseInt(m.dureePeriodeMinutes);
                if (duree) db.setSync(cleDuree, duree);
            }
            delete m.dureePeriodeMinutes;
            db.setSync(cleTrimestre, m);
            nettoyes++;
        }
        return nettoyes;
    }

    // Export public (SSOT de modalitesEvaluation).
    window.modalitesEvaluation = {
        CLE: CLE,
        lire: lire,
        modifier: modifier,
        remplacer: remplacer,
        purgerLegacy: purgerLegacy
    };
})();
