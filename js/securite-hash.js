/* ===============================
   📦 MODULE: SCEAU SHA-256 SUR LES OBJETS PARTAGEABLES (Défense H)

   Pose une empreinte SHA-256 sur chaque ressource partagée à l'export,
   et la vérifie à l'import. Détecte toute altération (même un caractère)
   du contenu pédagogique entre l'export et l'import.

   Référence : docs/securite/MODELE-MENACES.md §D-02 P1, §8.1 défense H.

   Limites importantes :
   - Le sceau est calculé par l'auteur et inclus dans le ZIP. Un attaquant
     qui modifie un objet peut recalculer le sceau et le réinjecter — la
     défense ne détecte que les altérations « innocentes » (corruption en
     transit, copie partielle) ou les tentatives d'altération sans
     re-scellage. La vraie protection contre la manipulation intentionnelle
     est la signature ECDSA (Défense F, Phase 2).
   - Sans une autorité tierce qui publie le sceau de référence, on ne sait
     pas distinguer une « v2 légitime de l'auteur » d'une « v1 modifiée
     par un attaquant qui a recalculé le sceau ». Le sceau prend tout son
     sens combiné à un annuaire signé (Défense F + Voûte).

   Champs exclus du calcul du sceau (volatiles, ajoutés par l'app à
   l'écriture) : `_hash_v1`, `dateImport`, `dateAjoutBiblio`,
   `dansBibliotheque`. Tout le reste est inclus.

   Format : sceau en hexadécimal (64 caractères pour SHA-256), stocké
   dans le champ `_hash_v1` de chaque objet.
   =============================== */

(function () {
    'use strict';

    var CHAMP_SCEAU = '_hash_v1';
    var CHAMPS_VOLATILES = [CHAMP_SCEAU, 'dateImport', 'dateAjoutBiblio', 'dansBibliotheque'];

    /**
     * Indique si Web Crypto SHA-256 est disponible. Doit l'être sur Safari
     * Mac M3 et iPad M1 même en file://, mais on garde un guard pour
     * dégrader gracieusement (les défenses dépendantes deviennent no-op).
     */
    function _disponible() {
        return typeof crypto !== 'undefined'
            && crypto.subtle
            && typeof crypto.subtle.digest === 'function';
    }

    /**
     * Sérialisation déterministe : tri récursif des clés des objets, et
     * exclusion des champs volatils. Sans ça, deux exports du même objet
     * peuvent produire des sceaux différents (ordre des clés non garanti
     * en JavaScript pour les objets construits dynamiquement).
     */
    function _canonicaliser(valeur) {
        if (valeur === null || valeur === undefined) return valeur;
        if (Array.isArray(valeur)) {
            return valeur.map(_canonicaliser);
        }
        if (typeof valeur === 'object') {
            var cles = Object.keys(valeur).filter(function (k) {
                return CHAMPS_VOLATILES.indexOf(k) === -1;
            }).sort();
            var resultat = {};
            for (var i = 0; i < cles.length; i++) {
                resultat[cles[i]] = _canonicaliser(valeur[cles[i]]);
            }
            return resultat;
        }
        return valeur;
    }

    /**
     * Convertit un ArrayBuffer en string hexadécimale.
     */
    function _bufferEnHex(buffer) {
        var bytes = new Uint8Array(buffer);
        var hex = '';
        for (var i = 0; i < bytes.length; i++) {
            var b = bytes[i].toString(16);
            hex += b.length === 1 ? '0' + b : b;
        }
        return hex;
    }

    /**
     * Calcule le SHA-256 hexadécimal de la canonicalisation d'un objet.
     * @param {Object} obj
     * @returns {Promise<string|null>} 64 caractères hex, ou null si Web
     *   Crypto indisponible.
     */
    async function calculerHash(obj) {
        if (!_disponible()) return null;
        var canonique = _canonicaliser(obj);
        var json = JSON.stringify(canonique);
        var encoded = new TextEncoder().encode(json);
        var buffer = await crypto.subtle.digest('SHA-256', encoded);
        return _bufferEnHex(buffer);
    }

    /**
     * Pose le sceau sur un objet : retourne une copie avec _hash_v1 calculé.
     * Si Web Crypto est indisponible, retourne l'objet tel quel (pas
     * d'erreur, juste pas de sceau).
     * @param {Object} obj
     * @returns {Promise<Object>}
     */
    async function sceller(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        var hash = await calculerHash(obj);
        if (!hash) {
            // Web Crypto indisponible : on retourne l'objet tel quel sans sceau.
            var copie = Object.assign({}, obj);
            delete copie[CHAMP_SCEAU];
            return copie;
        }
        var scelle = Object.assign({}, obj);
        scelle[CHAMP_SCEAU] = hash;
        return scelle;
    }

    /**
     * Pose le sceau sur chaque item d'un tableau. Préserve l'ordre.
     * @param {Array} items
     * @returns {Promise<Array>}
     */
    async function scellerLot(items) {
        if (!Array.isArray(items)) return items;
        var resultats = [];
        for (var i = 0; i < items.length; i++) {
            resultats.push(await sceller(items[i]));
        }
        return resultats;
    }

    /**
     * Vérifie le sceau d'un objet importé.
     * @param {Object} obj
     * @returns {Promise<{statut: 'valide'|'altere'|'sans-sceau'|'indisponible',
     *                    hashAttendu: string|null, hashCalcule: string|null}>}
     */
    async function verifier(obj) {
        if (!obj || typeof obj !== 'object') {
            return { statut: 'sans-sceau', hashAttendu: null, hashCalcule: null };
        }
        var hashAttendu = obj[CHAMP_SCEAU] || null;
        if (!hashAttendu) {
            return { statut: 'sans-sceau', hashAttendu: null, hashCalcule: null };
        }
        if (!_disponible()) {
            return { statut: 'indisponible', hashAttendu: hashAttendu, hashCalcule: null };
        }
        var hashCalcule = await calculerHash(obj);
        return {
            statut: hashCalcule === hashAttendu ? 'valide' : 'altere',
            hashAttendu: hashAttendu,
            hashCalcule: hashCalcule
        };
    }

    /**
     * Vérifie un lot d'objets et agrège les résultats.
     * @param {Array} items
     * @returns {Promise<{valide: number, altere: number, sansSceau: number,
     *                    indisponible: number, total: number,
     *                    alteres: Array<{index: number, hashAttendu: string, hashCalcule: string}>}>}
     */
    async function verifierLot(items) {
        var resume = { valide: 0, altere: 0, sansSceau: 0, indisponible: 0, total: 0, alteres: [] };
        if (!Array.isArray(items)) return resume;
        for (var i = 0; i < items.length; i++) {
            var v = await verifier(items[i]);
            resume.total++;
            if (v.statut === 'valide') resume.valide++;
            else if (v.statut === 'altere') {
                resume.altere++;
                resume.alteres.push({ index: i, hashAttendu: v.hashAttendu, hashCalcule: v.hashCalcule });
            }
            else if (v.statut === 'sans-sceau') resume.sansSceau++;
            else if (v.statut === 'indisponible') resume.indisponible++;
        }
        return resume;
    }

    /**
     * Construit un message lisible pour l'utilisateur à partir d'un résumé
     * `verifierLot`. Retourne null si tout est valide ou sans sceau (silence
     * confortable). Retourne une chaîne d'avertissement sinon.
     */
    function resumerPourUI(resume, libelle) {
        if (!resume || resume.total === 0) return null;
        if (resume.altere === 0 && resume.indisponible === 0) return null;
        var parts = [];
        if (resume.altere > 0) {
            parts.push(resume.altere + ' ' + libelle + ' avec sceau invalide (modifié·e après l\'export)');
        }
        if (resume.indisponible > 0) {
            parts.push(resume.indisponible + ' ' + libelle + ' non vérifiable·s (Web Crypto indisponible)');
        }
        return parts.join(' · ');
    }

    // API publique
    window.SecuriteHash = {
        calculerHash: calculerHash,
        sceller: sceller,
        scellerLot: scellerLot,
        verifier: verifier,
        verifierLot: verifierLot,
        resumerPourUI: resumerPourUI,
        disponible: _disponible,
        CHAMP_SCEAU: CHAMP_SCEAU,
        CHAMPS_VOLATILES: CHAMPS_VOLATILES.slice()
    };

})();
