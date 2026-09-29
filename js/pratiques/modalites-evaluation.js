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
 * Lot 2 (a/b1/b2) : les champs miroirs `pratique`, `pratiqueId` et
 * `approcheEvaluation` sont MORTS — dérivés de la SSOT
 * `groupesCours[].pratiqueId` via obtenirTypePratiqueActive /
 * obtenirPratiqueActiveGroupeCours. Lot 2-c : `configPAN.jetons` purgé aussi —
 * la config des jetons est dérivée de la pratique active (obtenirConfigJetons).
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
     * Lot F (D4) : les gestes (objectifs, grille de conversion, types de travaux) écrivent
     * ici, hors du témoin commun ; ce point le dit au codex. La migration, l'ouverture et
     * le mode démo passent `{ discret: true }`.
     * @param {object} modalites
     * @param {{discret?: boolean}} [options]
     */
    function _ecrire(modalites, options) {
        db.setSync(cle('modalitesEvaluation'), modalites);
        if (!(options && options.discret) && window.signalerEcritureUsager) {
            window.signalerEcritureUsager(cle('modalitesEvaluation'));
        }
    }

    /**
     * Modifie les modalités par mutation contrôlée (read-modify-write
     * centralisé). Le mutateur reçoit l'objet courant et le modifie en place
     * (affectations, `delete`, sections imbriquées) ; l'objet est ensuite
     * réécrit d'un bloc.
     * @param {function(object): void} mutateur
     * @param {{discret?: boolean}} [options] - voir _ecrire
     * @returns {object} l'objet modalités après écriture
     */
    function modifier(mutateur, options) {
        const modalites = lire();
        if (typeof mutateur === 'function') mutateur(modalites);
        _ecrire(modalites, options);
        return modalites;
    }

    /**
     * Remplace l'objet modalités en entier (import de configuration,
     * bascule/restauration du mode démo). Refuse les valeurs non-objet
     * pour ne jamais stocker null/undefined à la place de la config.
     * @param {object} objet
     * @param {{discret?: boolean}} [options] - voir _ecrire
     * @returns {boolean} vrai si écrit
     */
    function remplacer(objet, options) {
        if (!objet || typeof objet !== 'object') return false;
        _ecrire(objet, options);
        return true;
    }

    // Champs miroirs SANS rapatriement, purgés tels quels (#328 L2-a/L2-b2) :
    // `pratiqueId` (SSOT = groupesCours[].pratiqueId), `approcheEvaluation`
    // (vit dans pratique.configuration) et `pratique` (type — dérivé via
    // obtenirTypePratiqueActive depuis L2-b2) n'ont plus AUCUN lecteur.
    const CHAMPS_MIROIRS_MORTS = ['pratiqueId', 'approcheEvaluation', 'pratique'];
    // #353 (10 août 2026, décision Grégoire du 9 août) — `configPAN` ENTIER
    // rejoint les miroirs morts. #328 L2-c n'en avait retiré que `jetons` parce
    // que `configPAN.portfolio` avait encore des lecteurs ; **G2-b (#436, 9 août)
    // a retiré les derniers**. Vérifié au code le 10 août : zéro lecteur, zéro
    // écrivain hors commentaires dans tout `js/` — la seule occurrence restante
    // est la donnée du pack démo.
    // ⚠ Accès DYNAMIQUE (comme CHAMPS_MIROIRS_MORTS) pour rester invisible au
    // ratchet statique qui greppe les écritures de la clé.
    const CHAMP_CONFIGPAN_MORT = 'configPAN';

    /**
     * Purge les champs legacy des modalités de CHAQUE trimestre :
     *  - `dureePeriodeMinutes` (Lot 3) — valeur rapatriée dans la clé
     *    `dureePeriode` (domaine horaire, SSOT Lot 0) si elle n'y est pas
     *    déjà ; la clé existante a toujours priorité, jamais d'écrasement ;
     *  - `pratiqueId` / `approcheEvaluation` (Lot 2-a) et `pratique`
     *    (Lot 2-b2) — miroirs morts, supprimés sans rapatriement (leur SSOT
     *    vit ailleurs) ;
     *  - `configPAN` en ENTIER (#353, 10 août 2026) — miroir mort. #328 L2-c
     *    n'en retirait que `jetons` parce que `portfolio` avait encore des
     *    lecteurs ; G2-b (#436, 9 août) a retiré les derniers. Aucun
     *    rapatriement : la configuration vit sur la pratique active.
     *    ⚠ Gain de budget NÉGLIGEABLE (~285 caractères par trimestre, mesuré
     *    sur le pack démo) — c'est de l'hygiène zéro-dette, pas une réponse à
     *    la saturation. Le dire évite de croire le problème traité.
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
            if (!m || typeof m !== 'object') continue;

            let modifie = false;
            if ('dureePeriodeMinutes' in m) {
                const cleDuree = t.id + '_dureePeriode';
                if (db.getSync(cleDuree, null) === null) {
                    const duree = parseInt(m.dureePeriodeMinutes);
                    if (duree) db.setSync(cleDuree, duree);
                }
                delete m.dureePeriodeMinutes;
                modifie = true;
            }
            for (const champ of CHAMPS_MIROIRS_MORTS) {
                if (champ in m) {
                    delete m[champ];
                    modifie = true;
                }
            }
            // #353 : le miroir `configPAN` ENTIER est retiré (voir la constante).
            // #328 L2-c n'en ôtait que `jetons` ; `portfolio` a perdu ses derniers
            // lecteurs avec G2-b (#436). Aucun rapatriement : la configuration vit
            // sur la pratique active (`pratiquesConfigurables`), qui est la SSOT.
            if (CHAMP_CONFIGPAN_MORT in m) {
                delete m[CHAMP_CONFIGPAN_MORT];
                modifie = true;
            }

            if (modifie) {
                db.setSync(cleTrimestre, m);
                nettoyes++;
            }
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
