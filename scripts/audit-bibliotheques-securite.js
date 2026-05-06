/*
 * Audit a priori des bibliothèques partagées — recherche de payloads.
 *
 * USAGE — Safari (Mac ou iPad) :
 *   1. Ouvrir Labo Codex normalement.
 *   2. Develop > Show JavaScript Console (Cmd+Opt+C). iPad : connecter
 *      à Safari Mac via câble Lightning et utiliser la console à distance.
 *   3. Copier-coller TOUT ce fichier dans la console et appuyer Entrée.
 *   4. Lire le résumé final. Si "0 trouvaille" → bibliothèques saines à
 *      l'instant T. Sinon : chaque match indique clé, chemin, motif, extrait.
 *
 * Référence : MODELE-MENACES.md §8.4 étape 1 (audit a priori) + §A.1.
 *
 * Le script est en lecture seule — il ne modifie aucune donnée.
 */

(function () {
    'use strict';

    var CLES_BIBLIOTHEQUES = [
        'bibliothequeGrilles',
        'bibliothequeEchelles',
        'bibliothequeCartouches',
        'bibliothequePratiques',
        'bibliothequeProductions',
        'bibliothequeTampons'
    ];

    var PATTERNS = [
        { nom: 'balise <script>', regex: /<script\b/i },
        { nom: 'balise <iframe>', regex: /<iframe\b/i },
        { nom: 'balise <embed>',  regex: /<embed\b/i },
        { nom: 'balise <object>', regex: /<object\b/i },
        { nom: 'balise <base>',   regex: /<base\b/i },
        { nom: 'balise <svg> avec handler', regex: /<svg\b[^>]*\bon[a-z]+\s*=/i },
        { nom: 'balise <img> avec handler', regex: /<img\b[^>]*\bon[a-z]+\s*=/i },
        { nom: 'handler d\'événement inline (on...=)', regex: /\bon(error|load|click|mouseover|mouseout|focus|blur|input|change|submit|toggle)\s*=\s*["'`]/i },
        { nom: 'URI javascript:', regex: /javascript\s*:/i },
        { nom: 'URI data:text/html', regex: /data\s*:\s*text\/html/i },
        { nom: 'CSS expression()', regex: /expression\s*\(/i },
        { nom: 'URI vbscript:', regex: /vbscript\s*:/i },
        { nom: 'srcdoc=', regex: /\bsrcdoc\s*=/i }
    ];

    // Champs ignorés : on ne scanne pas les blobs base64 d'image (false positifs
    // en masse). Le risque "PNG polyglotte avec script caché" est traité par
    // Défense O (re-encodage) et non par ce scan textuel.
    var CHAMPS_IGNORES = ['imageBase64', 'thumbnail', 'thumb', 'blob', 'fichierBase64'];

    var trouvailles = [];
    var clesScannees = [];
    var clesAbsentes = [];

    function scannerChaine(s, cle, chemin) {
        if (typeof s !== 'string' || s.length === 0) return;
        for (var i = 0; i < PATTERNS.length; i++) {
            var p = PATTERNS[i];
            var m = s.match(p.regex);
            if (m) {
                var index = s.search(p.regex);
                var debut = Math.max(0, index - 20);
                var fin = Math.min(s.length, index + m[0].length + 60);
                var extrait = s.substring(debut, fin);
                trouvailles.push({
                    cle: cle,
                    chemin: chemin,
                    motif: p.nom,
                    extrait: (debut > 0 ? '...' : '') + extrait + (fin < s.length ? '...' : ''),
                    longueurChamp: s.length
                });
            }
        }
    }

    function parcourir(valeur, cle, chemin) {
        if (valeur === null || valeur === undefined) return;
        var type = typeof valeur;
        if (type === 'string') {
            scannerChaine(valeur, cle, chemin);
            return;
        }
        if (type === 'number' || type === 'boolean') return;
        if (Array.isArray(valeur)) {
            for (var i = 0; i < valeur.length; i++) {
                parcourir(valeur[i], cle, chemin + '[' + i + ']');
            }
            return;
        }
        if (type === 'object') {
            for (var k in valeur) {
                if (Object.prototype.hasOwnProperty.call(valeur, k)) {
                    if (CHAMPS_IGNORES.indexOf(k) !== -1) continue;
                    parcourir(valeur[k], cle, chemin + '.' + k);
                }
            }
        }
    }

    async function lireValeur(cle) {
        if (typeof window.db !== 'undefined' && typeof window.db.get === 'function') {
            try {
                var v = await window.db.get(cle);
                if (v !== null && v !== undefined) return v;
            } catch (e) {
                console.warn('[audit] db.get a échoué pour', cle, e);
            }
        }
        var raw = localStorage.getItem(cle);
        if (raw === null) return null;
        try { return JSON.parse(raw); } catch (e) { return raw; }
    }

    async function listerCartouchesParGrille() {
        // Les `cartouches_<grilleId>` sont les cartouches PAR grille — clés
        // séparées de la bibliothèque partagée. À scanner aussi.
        var cles = [];
        if (typeof window.db !== 'undefined' && typeof window.db.keys === 'function') {
            try {
                var toutes = await window.db.keys();
                for (var i = 0; i < toutes.length; i++) {
                    if (toutes[i].indexOf('cartouches_') === 0) cles.push(toutes[i]);
                }
            } catch (e) {
                console.warn('[audit] db.keys() a échoué, fallback localStorage', e);
            }
        }
        if (cles.length === 0) {
            for (var k = 0; k < localStorage.length; k++) {
                var n = localStorage.key(k);
                if (n && n.indexOf('cartouches_') === 0) cles.push(n);
            }
        }
        return cles;
    }

    async function executer() {
        console.group('%c=== Audit a priori des bibliothèques partagées ===', 'font-weight:bold; font-size:14px; color:#4a9eff');
        console.log('Référence : MODELE-MENACES.md §8.4 étape 1');
        console.log('Patterns testés : ' + PATTERNS.length);
        console.log('Champs ignorés (blobs base64) : ' + CHAMPS_IGNORES.join(', '));

        var cartouchesParGrille = await listerCartouchesParGrille();
        var aScanner = CLES_BIBLIOTHEQUES.concat(cartouchesParGrille);
        console.log('Clés à scanner : ' + aScanner.length + ' (dont ' + cartouchesParGrille.length + ' cartouches_<grilleId>)');

        for (var i = 0; i < aScanner.length; i++) {
            var cle = aScanner[i];
            var v = await lireValeur(cle);
            if (v === null) {
                clesAbsentes.push(cle);
                continue;
            }
            clesScannees.push(cle);
            parcourir(v, cle, '');
        }

        console.log('Clés scannées : ' + clesScannees.length);
        console.log('Clés absentes (rien à scanner) : ' + clesAbsentes.length);
        if (clesAbsentes.length > 0) {
            console.log('  → ' + clesAbsentes.join(', '));
        }

        if (trouvailles.length === 0) {
            console.log('%c✓ Aucun pattern suspect trouvé.', 'color:#3ab06b; font-weight:bold');
            console.log('Les bibliothèques partagées sont saines à l\'instant T pour les patterns testés.');
        } else {
            console.warn('⚠ ' + trouvailles.length + ' trouvaille(s) — inspection manuelle requise :');
            console.table(trouvailles);
            console.log('Pour obtenir le détail d\'une trouvaille : window.__auditTrouvailles[<index>]');
            window.__auditTrouvailles = trouvailles;
        }

        console.groupEnd();
        return {
            trouvailles: trouvailles.length,
            clesScannees: clesScannees,
            clesAbsentes: clesAbsentes
        };
    }

    executer().then(function (resume) {
        window.__auditResume = resume;
    }).catch(function (e) {
        console.error('[audit] Erreur fatale :', e);
    });
})();
