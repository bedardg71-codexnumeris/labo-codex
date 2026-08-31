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
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ⚠ RÉGIME DES CLÉS DEPUIS S5/#623 (voir le patron commenté en tête de
 * scripts/diagnostic-cartouches-non-persistees.js).
 *   R1 · LIRE   = balayer TOUS les trimestres, et dire lequel.
 *   R2 · ÉCRIRE = trimestre EXPLICITE, refuser sans lui. (Sans objet ici :
 *                 ce script est en lecture seule.)
 *   R3 · Une source DATÉE garde ses clés d'époque.
 * ⮕ « Survivre au grep » ≠ « juste après S5 » : un prédicat ancré
 *   (`indexOf(…)===0`) MENT PAR ZÉRO, un prédicat lâche (`!== -1`) MENT PAR
 *   INFLATION. Ici la lecture veut TOUTES les copies, donc le prédicat large
 *   est le bon — mais le compte doit dire sur combien de clés il porte.
 *
 * ⚠ LE POINT nº 4 DE L'USAGE CI-DESSUS EST UN PIÈGE À LUI SEUL : « 0
 * trouvaille → bibliothèques saines » n'est vrai QUE si l'audit a
 * effectivement scanné quelque chose. C'est pourquoi le script imprime
 * désormais le nombre de clés examinées à côté de chaque zéro.
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
        // CONSTAT NON CORRIGÉ (31 août 2026, hors #636 — antérieur à S5 et
        // indépendant de lui ; inscrit ici plutôt qu'au backlog).
        // Ce repli sur localStorage confond deux états quand `db.get` LÈVE :
        // une valeur trop grosse vit en IndexedDB et n'est pas dans
        // localStorage, donc `getItem` rend null et la clé part en
        // `clesAbsentes` — l'audit dit « absente » là où il faudrait lire
        // « présente mais ILLISIBLE ». Même famille de défaut que celui traité
        // par #636 quelques lignes plus bas : un vide dont on tait la cause.
        // Portée réelle limitée : `db.get` est essayé EN PREMIER et réussit dans
        // le cas courant. À mesurer avant d'y toucher.
        var raw = localStorage.getItem(cle);
        if (raw === null) return null;
        try { return JSON.parse(raw); } catch (e) { return raw; }
    }

    /**
     * Vrai si `k` est une clé de la famille des cartouches PAR GRILLE, dans l'UN
     * OU L'AUTRE régime : `cartouches_<grilleId>` (nu, pré-S5) ou
     * `<trimestreId>_cartouches_<grilleId>` (S5/#623, régime courant).
     *
     * ⚠ NE PAS REVENIR À `indexOf('cartouches_') === 0`. Cet ancrage était juste
     * tant que la clé était globale ; depuis S5/#623 le magasin vit sous le
     * préfixe du trimestre, et l'ancrage ne trouve plus RIEN. Dans un audit de
     * sécurité, ce zéro-là est le pire des résultats : il se lit « bibliothèques
     * saines » (en-tête §USAGE, point 4) alors qu'il signifie « je n'ai rien
     * regardé ». Mesuré le 31 août 2026 : 2 clés trouvées avant S5, 0 après.
     */
    function estCleCartouches(k) {
        if (typeof k !== 'string') return false;
        var i = k.indexOf('cartouches_');
        if (i === 0) return true;                       // clé nue (résidu pré-S5)
        // Le préfixe doit être un ID DE TRIMESTRE, pas n'importe quoi suivi d'un
        // `_`. Sans cette garde, le motif happe `migration_cartouches_namespacees_done`
        // — le drapeau posé par la migration S5 elle-même (js/main.js:735), qui
        // vaut un booléen. Ici la conséquence serait plus sournoise qu'un
        // plantage : un drapeau booléen entrerait dans la liste des clés
        // « scannées », gonflant le compte d'un audit de sécurité avec une clé
        // qui n'a rien à scanner. Défaut mesuré le 31 août 2026 (#636).
        // `[ahe]` couvre les trois sessions acceptées par `creerTrimestre`.
        return i > 0 && k[i - 1] === '_' && /^([ahe]\d{4}|demo)$/.test(k.slice(0, i - 1));
    }

    async function listerCartouchesParGrille() {
        // Les cartouches PAR grille — clés séparées de la bibliothèque partagée
        // `bibliothequeCartouches`, qui elle reste GLOBALE par conception
        // (js/cartouches-bibliotheque.js:11-20) et figure déjà plus haut.
        //
        // R1 (S5/#623) : on BALAIE tous les trimestres. Ce n'est pas une
        // précaution — la migration au boot a copié le lot dans CHAQUE trimestre
        // (js/trimestres.js:1044), et un payload injecté dans une copie doit être
        // trouvé quel que soit le trimestre actif au moment de l'audit.
        //
        // ⚠ DEUX CAUSES DE VIDE, À NE PAS CONFONDRE. Ce repli existait pour
        // « db.keys() a ÉCHOUÉ » et se déclenchait sur `cles.length === 0`. Depuis
        // S5 ce test se déclenche aussi pour « db.keys() a RÉUSSI et rendu zéro »
        // — donc le repli masquait la raison du vide au lieu de la dire. On sépare
        // l'échec (drapeau explicite) du résultat vide (fait mesuré).
        var cles = [];
        var enumerationDb = false;   // db.keys() a-t-il ABOUTI ?
        var vuesDb = 0;              // combien de clés a-t-il rendues ?
        if (typeof window.db !== 'undefined' && typeof window.db.keys === 'function') {
            try {
                var toutes = await window.db.keys();
                enumerationDb = true;
                vuesDb = toutes.length;
                for (var i = 0; i < toutes.length; i++) {
                    if (estCleCartouches(toutes[i])) cles.push(toutes[i]);
                }
            } catch (e) {
                console.warn('[audit] db.keys() a échoué, repli sur localStorage', e);
            }
        }
        var vuesLs = 0;
        if (!enumerationDb) {
            for (var k = 0; k < localStorage.length; k++) {
                var n = localStorage.key(k);
                vuesLs++;
                if (estCleCartouches(n)) cles.push(n);
            }
        }
        return {
            cles: cles,
            // Le TÉMOIN du zéro : « 0 sur 400 clés examinées » est un fait,
            // « 0 sur 0 » est un aveu. Les deux s'écrivaient pareil avant.
            examinees: enumerationDb ? vuesDb : vuesLs,
            source: enumerationDb ? 'db.keys()' : 'localStorage (repli : db.keys() a échoué)',
            enumerationDb: enumerationDb
        };
    }

    async function executer() {
        console.group('%c=== Audit a priori des bibliothèques partagées ===', 'font-weight:bold; font-size:14px; color:#4a9eff');
        console.log('Référence : MODELE-MENACES.md §8.4 étape 1');
        console.log('Patterns testés : ' + PATTERNS.length);
        console.log('Champs ignorés (blobs base64) : ' + CHAMPS_IGNORES.join(', '));

        var releve = await listerCartouchesParGrille();
        var cartouchesParGrille = releve.cles;
        var aScanner = CLES_BIBLIOTHEQUES.concat(cartouchesParGrille);
        console.log('Clés à scanner : ' + aScanner.length + ' (dont ' + cartouchesParGrille.length
            + ' magasin(s) de cartouches par grille, tous trimestres)');
        console.log('Énumération du stockage : ' + releve.source + ' — '
            + releve.examinees + ' clé(s) examinée(s)');
        // Le zéro ne parle QUE s'il porte son témoin. Sans cette ligne, « 0
        // magasin » couvre indifféremment « il n'y en a pas » et « je n'ai pas
        // su regarder » — et l'en-tête du script invite à lire « 0 » comme sain.
        if (cartouchesParGrille.length === 0) {
            console.warn(releve.examinees === 0
                ? '[audit] ⛔ AUCUNE CLÉ EXAMINÉE — l\'énumération du stockage n\'a rien rendu. '
                  + 'Les cartouches par grille n\'ont PAS été auditées. Ce n\'est pas un résultat sain.'
                : '[audit] 0 magasin de cartouches par grille sur ' + releve.examinees
                  + ' clé(s) examinée(s) — résultat mesuré, pas un défaut d\'énumération.');
        }

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
