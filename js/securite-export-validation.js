/* ===============================
   📦 MODULE: WHITELIST DE STRUCTURE DES EXPORTS (Défense K)

   Vérifie que tout export (ZIP ou JSON) ne contient que des entrées /
   clés attendues. Empêche un payload qui aurait patché une fonction
   d'export d'y injecter un fichier ou un champ supplémentaire transportant
   des données identifiantes (cf. MODELE-MENACES.md §X-02).

   Référence : docs/securite/MODELE-MENACES.md §X-01, §X-02, §8.1 défense K.

   Comportement : la validation lève une exception en cas de violation.
   Le pipeline d'export attrape l'exception, alerte l'utilisateur et
   annule le téléchargement. C'est volontairement bruyant — un export qui
   sort une structure inattendue est suspect, on préfère bloquer plutôt
   qu'analyser.
   =============================== */

(function () {
    'use strict';

    /**
     * Whitelists par type d'export. Chaque entrée est une regex qui doit
     * matcher en entier (anchors ^ et $) le chemin de l'entrée ZIP, ou le
     * nom de la clé racine du JSON.
     */
    var WHITELISTS = {
        // Codex (ZIP) — cf. js/codex.js, fonction _genererZip
        codex: [
            /^donnees\.json$/,
            /^manifeste\.json$/,
            /^travaux\/[A-Za-z0-9_\-]+\.[A-Za-z0-9]+$/,
            /^travaux\/$/  // dossier seul, parfois listé selon JSZip
        ],
        // Réserve (ZIP) — cf. js/reserve.js, fonction verserGroupeCours
        reserve: [
            /^manifeste-archives\.json$/,
            /^trimestres\/$/,
            /^trimestres\/[A-Za-z0-9_\-]+\/$/,
            /^trimestres\/[A-Za-z0-9_\-]+\/donnees\.json$/,
            /^trimestres\/[A-Za-z0-9_\-]+\/meta\.json$/,
            /^trimestres\/[A-Za-z0-9_\-]+\/manifeste-archives-patch\.json$/,
            /^trimestres\/[A-Za-z0-9_\-]+\/travaux\/$/,
            /^trimestres\/[A-Za-z0-9_\-]+\/travaux\/[A-Za-z0-9_\-]+\.[A-Za-z0-9]+$/
        ],
        // Configuration complète (JSON) — cf. js/import-export.js,
        // fonction exporterConfigurationComplete
        configurationComplete: {
            racine: ['metadata', 'contenu'],
            metadata: ['type', 'nom', 'auteur', 'discipline', 'niveau', 'description',
                       'licence', 'licence_url', 'version', 'date_creation', 'date_export',
                       'application_version', 'email_auteur', 'site_auteur'],
            contenu: ['echelles', 'grilles', 'productions', 'cartouches', 'parametres']
        },
        // Bibliothèque tampons (JSON) — cf. js/tampons-bibliotheque.js,
        // fonction exporterBibliotheque
        tampons: {
            racine: ['type', 'version', 'dateExport', 'tampons', 'metadata_cc']
        }
    };

    /**
     * Valide les entrées d'un objet JSZip contre une liste de regex.
     * @param {JSZip} zip - instance JSZip pleine, prête pour generateAsync
     * @param {RegExp[]} regexWhitelist
     * @param {string} libelle - pour le message d'erreur
     * @throws {Error} si une entrée n'est dans aucun pattern
     */
    function validerStructureZip(zip, regexWhitelist, libelle) {
        if (!zip || typeof zip.forEach !== 'function') {
            throw new Error('[Sécurité K] validerStructureZip : argument zip invalide');
        }
        var entreesNonAutorisees = [];
        var totalEntrees = 0;
        zip.forEach(function (relativePath /*, file */) {
            totalEntrees++;
            var match = false;
            for (var i = 0; i < regexWhitelist.length; i++) {
                if (regexWhitelist[i].test(relativePath)) { match = true; break; }
            }
            if (!match) entreesNonAutorisees.push(relativePath);
        });
        if (entreesNonAutorisees.length > 0) {
            var msg = '[Sécurité K] Export ' + libelle + ' bloqué — ' +
                      entreesNonAutorisees.length + ' entrée(s) hors whitelist sur ' +
                      totalEntrees + ' au total :\n  • ' +
                      entreesNonAutorisees.slice(0, 10).join('\n  • ') +
                      (entreesNonAutorisees.length > 10 ? '\n  • ... (' + (entreesNonAutorisees.length - 10) + ' de plus)' : '');
            throw new Error(msg);
        }
    }

    /**
     * Valide les clés à la racine d'un objet JSON.
     * @param {Object} obj
     * @param {string[]} clesWhitelist
     * @param {string} libelle
     * @throws {Error}
     */
    function validerClesObjet(obj, clesWhitelist, libelle) {
        if (!obj || typeof obj !== 'object') {
            throw new Error('[Sécurité K] validerClesObjet (' + libelle + ') : objet invalide');
        }
        var allowed = {};
        for (var i = 0; i < clesWhitelist.length; i++) allowed[clesWhitelist[i]] = true;
        var hors = [];
        for (var k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k) && !allowed[k]) {
                hors.push(k);
            }
        }
        if (hors.length > 0) {
            throw new Error('[Sécurité K] Export ' + libelle + ' bloqué — clé(s) hors whitelist : ' + hors.join(', '));
        }
    }

    /**
     * Valide la structure d'un export configuration-complète.
     * @param {Object} configComplete - objet { metadata, contenu }
     * @throws {Error}
     */
    function validerExportConfigurationComplete(configComplete) {
        var w = WHITELISTS.configurationComplete;
        validerClesObjet(configComplete, w.racine, 'configuration complète (racine)');
        if (configComplete.metadata) {
            validerClesObjet(configComplete.metadata, w.metadata, 'configuration complète (metadata)');
        }
        if (configComplete.contenu) {
            validerClesObjet(configComplete.contenu, w.contenu, 'configuration complète (contenu)');
        }
    }

    /**
     * Valide la structure d'un export bibliothèque tampons.
     * @param {Object} payload - objet { type, version, dateExport, tampons, metadata_cc }
     * @throws {Error}
     */
    function validerExportTampons(payload) {
        validerClesObjet(payload, WHITELISTS.tampons.racine, 'bibliothèque tampons');
    }

    /**
     * Valide la structure d'un export codex (ZIP).
     * @param {JSZip} zip
     * @throws {Error}
     */
    function validerExportCodex(zip) {
        validerStructureZip(zip, WHITELISTS.codex, 'codex');
    }

    /**
     * Valide la structure d'un export réserve (ZIP).
     * @param {JSZip} zip
     * @throws {Error}
     */
    function validerExportReserve(zip) {
        validerStructureZip(zip, WHITELISTS.reserve, 'archive (réserve)');
    }

    // API publique
    window.SecuriteExportValidation = {
        validerStructureZip: validerStructureZip,
        validerClesObjet: validerClesObjet,
        validerExportConfigurationComplete: validerExportConfigurationComplete,
        validerExportTampons: validerExportTampons,
        validerExportCodex: validerExportCodex,
        validerExportReserve: validerExportReserve,
        WHITELISTS: WHITELISTS
    };

})();
