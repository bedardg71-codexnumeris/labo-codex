/**
 * DÉNOTATION (DEN) — couche 2 : modèle de données du jugement saisi (#318, lot DEN-0).
 *
 * Module PROPRIÉTAIRE (SSOT, voir docs/DATA-OWNERSHIP.md) de la collection
 * `jugementsDenotation`. Une pratique DEN ne CALCULE pas la note depuis les
 * artefacts : l'enseignant la SAISIT (jugement certificatif), elle est GARDÉE
 * par la confirmation que chaque cible d'apprentissage est atteinte (garde-fou
 * d'équité Dyer, natif), et ANCRÉE par une suggestion holistique optionnelle.
 *
 * Périmètre de CE lot (DEN-0, données) :
 *  - reconnaissance d'une pratique DEN + validation du schéma de config « éliminée » ;
 *  - lecture namespacée (window.cle) de la saisie d'un jugement.
 * L'ÉCRITURE de la saisie est le geste de l'UI de profil (lot DEN-2) ; le CALCUL
 * (lot DEN-1) ne fait que LIRE cette collection.
 *
 * Garde-fous (cf. NOTE-COWORK-modele-DEN.md / SPEC_DEN_couche2.md) :
 *  - RREC : DEN abandonne la fonction de TRI mais garde la CERTIFICATION — le
 *    moteur produit TOUJOURS un chiffre (59 ou la note saisie), jamais « pas de note ».
 *  - SSOT / namespacing : `jugementsDenotation` est namespacée par trimestre
 *    (`window.cle`) ; aucune autre source de la note DEN.
 *  - Taxonomie : badge « PAN » conservé en UI, mais DEN = PRÉN académiquement.
 *
 * @module denotation-jugements
 */
(function () {
    'use strict';

    // Clé de stockage (namespacée par trimestre via window.cle).
    const CLE_JUGEMENTS = 'jugementsDenotation';

    // Méthodes de suggestion holistique réutilisées de STD (mode/médiane/moyenne).
    const METHODES_SUGGESTION = ['mode', 'mediane', 'moyenne'];

    // Seul mode offert au premier lot ; 'reduite' viendra plus tard (décision DEN-A).
    const MODE_PREMIER_LOT = 'eliminee';

    /**
     * Reconnaît une config de pratique DEN (couche 2).
     * Accepte aussi bien une config normalisée (`construireConfigComplete` :
     * `type` + `calcul_note.methode`) qu'une config brute (`configuration.type`).
     *
     * @param {object} config - config de pratique (normalisée ou brute)
     * @returns {boolean} vrai si la pratique relève de la Dénotation
     */
    function estPratiqueDenotation(config) {
        if (!config) return false;
        const type = config.type || (config.configuration && config.configuration.type);
        const methode = config.calcul_note && config.calcul_note.methode;
        return type === 'denotation' || methode === 'jugement_global';
    }

    /**
     * Valide le schéma d'une config DEN « éliminée » (premier lot).
     * Exigences : type 'denotation', modeDEN 'eliminee', au moins une cible
     * (objectif) nommée — la trace explicite EXIGÉE par Dyer (jamais de « note
     * nue ») — et une méthode de suggestion connue.
     *
     * @param {object} config - config de pratique (normalisée ou brute)
     * @returns {boolean}
     */
    function estConfigDenotationValide(config) {
        if (!config) return false;
        const conf = config.configuration || config;
        if (conf.type !== 'denotation') return false;
        if (conf.modeDEN !== MODE_PREMIER_LOT) return false;
        if (!Array.isArray(conf.objectifs) || conf.objectifs.length === 0) return false;
        const suggestion = conf.suggestion || {};
        if (METHODES_SUGGESTION.indexOf(suggestion.methode) === -1) return false;
        return true;
    }

    /**
     * Lit la collection complète des jugements DEN du trimestre actif.
     * Lecture seule, namespacée.
     * @returns {object} `{ [pratiqueId]: { [da]: saisie } }` (objet vide si rien)
     */
    function lireTousLesJugements() {
        return db.getSync(cle(CLE_JUGEMENTS), {}) || {};
    }

    /**
     * Lit le jugement saisi pour un couple (pratique, étudiant). Lecture seule.
     *
     * @param {string} pratiqueId - identifiant de la pratique DEN
     * @param {string} da - DA de l'étudiant
     * @returns {object|null} `{ ciblesAtteintes, noteFinale, justification, date }`
     *   ou `null` si aucune saisie (→ le moteur DEN-1 traitera ce cas en « non
     *   encore jugé », pas en zéro)
     */
    function lireJugementDenotation(pratiqueId, da) {
        if (!pratiqueId || !da) return null;
        const parPratique = lireTousLesJugements()[pratiqueId];
        if (!parPratique) return null;
        return parPratique[da] || null;
    }

    // Export public (SSOT de jugementsDenotation).
    window.denotationJugements = {
        CLE: CLE_JUGEMENTS,
        METHODES_SUGGESTION: METHODES_SUGGESTION,
        estPratiqueDenotation: estPratiqueDenotation,
        estConfigDenotationValide: estConfigDenotationValide,
        lireTousLesJugements: lireTousLesJugements,
        lireJugementDenotation: lireJugementDenotation
    };
})();
