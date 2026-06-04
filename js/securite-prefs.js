/* ===============================
   📦 MODULE: PRÉFÉRENCES SÉCURITÉ (Défense D)

   Réglages de comportement liés à la sécurité — actuellement : persistance
   des handles FSAPI (Travaux + Réserve) entre sessions.

   Référence : docs/securite/MODELE-MENACES.md §D-03 et §8.1 défense D.

   Les helpers d'écriture/lecture de la préférence vivent dans db.js
   (`getFSAPIPersistance`, `setFSAPIPersistance`). Ce module se charge
   uniquement de :
     1. La migration silencieuse au premier démarrage avec la nouvelle
        version (pref non définie → on l'écrit à `false` et on purge les
        handles dormants).
     2. L'hydratation du toggle UI dans Réglages > Préférences > Sécurité.
     3. Le câblage du dispatcher data-on-change.
   =============================== */

(function () {
    'use strict';

    var CLE_PREF = 'fsapi_persistance_handles';
    var CLE_MIGRATION = 'fsapi_persistance_migration_v1';

    /**
     * Migration silencieuse au boot. Idempotent.
     *
     * Au premier passage avec la version qui implémente Défense D :
     *  - La clé `fsapi_persistance_handles` n'existe pas en localStorage.
     *  - Des handles peuvent dormir dans IndexedDB (Travaux + Réserve).
     * On écrit la pref à `false` (secure-by-default) et on purge les handles.
     *
     * Aux passages suivants, la clé existe → la fonction sort tôt.
     */
    async function _migrer() {
        if (localStorage.getItem(CLE_MIGRATION) === 'done') return;

        var prefExistante = localStorage.getItem(CLE_PREF);
        if (prefExistante === null) {
            // Premier boot avec Défense D : pref jamais définie.
            localStorage.setItem(CLE_PREF, 'false');
            // Purge des handles dormants pour ne laisser aucune dette.
            try {
                if (window.db && typeof window.db.removeFSAPIHandle === 'function') {
                    await window.db.removeFSAPIHandle();
                }
            } catch (e) { /* silent */ }
            try {
                if (window.Reserve && typeof window.Reserve.effacerLiaisonFSAPI === 'function') {
                    await window.Reserve.effacerLiaisonFSAPI();
                }
            } catch (e) { /* silent */ }
            console.warn('[Sécurité] Première activation Défense D : persistance FSAPI désactivée par défaut. ' +
                         'Tu peux la réactiver dans Réglages > Préférences > Sécurité.');
        }

        localStorage.setItem(CLE_MIGRATION, 'done');
    }

    /**
     * Hydrate l'état du checkbox UI à l'ouverture de Réglages > Préférences.
     * Appelé sur tab-show ou par hydratation initiale.
     */
    function _hydraterToggle() {
        var checkbox = document.getElementById('pref-fsapi-persistance');
        if (!checkbox) return;
        checkbox.checked = (localStorage.getItem(CLE_PREF) === 'true');
    }

    /**
     * Handler du toggle UI. Branché via data-on-change="togglerPersistanceFSAPI".
     * @param {HTMLInputElement} el - le checkbox
     */
    async function togglerPersistanceFSAPI(el) {
        if (!el) return;
        var actif = !!el.checked;
        if (window.db && typeof window.db.setFSAPIPersistance === 'function') {
            await window.db.setFSAPIPersistance(actif);
        } else {
            localStorage.setItem(CLE_PREF, actif ? 'true' : 'false');
        }
        notifications.succes(
            actif
                ? 'Mémorisation du dossier activée – les dossiers Travaux et Archives seront retenus entre les sessions.'
                : 'Mémorisation désactivée – tu redemanderas le dossier à chaque démarrage.'
        );
    }

    // Boot : migration différée pour ne pas bloquer le démarrage initial,
    // puis hydratation du toggle (idempotente — sûre si rappelée).
    async function _init() {
        await _migrer();
        _hydraterToggle();
        // Retry court au cas où la section Préférences n'est rendue qu'après
        // notre boot initial (tabs rendues à la demande). Idempotent.
        setTimeout(_hydraterToggle, 500);
        setTimeout(_hydraterToggle, 2000);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(_init, 50);
    } else {
        window.addEventListener('DOMContentLoaded', function () { setTimeout(_init, 50); });
    }

    // API publique
    window.SecuritePrefs = {
        togglerPersistanceFSAPI: togglerPersistanceFSAPI,
        hydraterToggle: _hydraterToggle
    };

    // Exposition directe pour le dispatcher data-on-change
    window.togglerPersistanceFSAPI = togglerPersistanceFSAPI;

})();
