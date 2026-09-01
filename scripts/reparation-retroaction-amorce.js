/**
 * reparation-retroaction-amorce.js
 *
 * ────────────────────────────────────────────────────────────────────────────
 * LE DÉFAUT
 * ────────────────────────────────────────────────────────────────────────────
 * Dans le PDF de rétroaction, un critère algorithmique affiche « Saisissez les
 * erreurs et le nombre de mots » à la place de la phrase engendrée — alors que
 * les nombres et les catégories, eux, sont justes.
 *
 * MÉCANISME, VÉRIFIÉ AU CODE (1er septembre 2026) :
 *   1. `evaluation-chargement.js:1014` et `:1180` rendent le bloc
 *      `<div id="comm_<critereId>">` avec un texte D'AMORCE pour contenu.
 *   2. La sauvegarde ET l'autosave persistent le CONTENU DE CE DIV dans
 *      `criteres[].retroaction` — `evaluation-sauvegarde.js:189` et
 *      `evaluation-chargement.js:1361`, tous deux
 *      `retroaction: commDiv ? commDiv.textContent : ''`.
 *      ⮕ Si l'un des deux s'exécute AVANT que le calcul n'ait écrit la vraie
 *        phrase dans le div, c'est l'amorce qui est persistée. Telle quelle.
 *   3. `synthese-retroaction-data.js:389` place `c.retroaction` en TÊTE de sa
 *      cascade : `c.retroaction || retroAlgo || commentaire de cartouche`.
 *      ⮕ L'amorce évince donc la rétroaction engendrée — phrase EUF et
 *        paragraphe de catégorie dominante compris.
 *
 * ⚠ CE DÉFAUT EST ANTÉRIEUR au chantier #668 du 1er septembre. Les trois
 * fichiers de la chaîne sont INTACTS depuis (vérifié par `git diff --name-only`),
 * et la persistance de `textContent` date des extractions du 18 mai 2026.
 * Famille #645.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CE QUE CE SCRIPT FAIT, ET RIEN D'AUTRE
 * ────────────────────────────────────────────────────────────────────────────
 * Il EFFACE `criteres[].retroaction` quand son contenu est EXACTEMENT un texte
 * d'amorce. C'est tout.
 *
 * Il ne RÉGÉNÈRE rien : le texte engendré vit déjà dans
 * `donneesAlgorithmiques[critereId].retroaction`, et la cascade le reprendra
 * d'elle-même dès que l'amorce ne lui barre plus le passage. Régénérer serait
 * réécrire un texte que personne n'a demandé de réécrire.
 *
 * ⚠ IL REFUSE D'EFFACER quand le repli serait VIDE. Effacer une amorce sans
 * repli ne réparerait rien : ça remplacerait un texte faux par un blanc, et sur
 * un critère à cartouche ça laisserait remonter un descripteur qui n'a pas été
 * choisi. Ces cas sont COMPTÉS et LISTÉS dans le preview, jamais touchés.
 *
 * ⚠ COMPARAISON SUR LE TEXTE COUPÉ, PAS SUR LA CHAÎNE BRUTE. Le div est rendu
 * dans un gabarit indenté : son `textContent` porte le saut de ligne et les
 * espaces du source. Une égalité stricte avec « Saisissez les erreurs et le
 * nombre de mots » trouverait ZÉRO évaluation et se dirait réussie. On compare
 * donc `.trim()` — l'exigence d'exactitude porte sur le CONTENU, pas sur
 * l'indentation d'un gabarit.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * USAGE — DEUX TEMPS
 * ────────────────────────────────────────────────────────────────────────────
 *   1. Coller ce fichier en entier dans la console de l'application.
 *      → mode PREVIEW : RIEN n'est écrit.
 *   2. Lire le tableau. Il dit combien d'évaluations sont touchées, sur quelle
 *      production, et ce qui remplacera l'amorce.
 *   3. Pour appliquer : await window.__amorces.appliquer()
 *      ⚠ `appliquer` est ASYNCHRONE et attend le drainage de l'écriture IndexedDB.
 *      Ne recharge la page QU'APRÈS avoir vu « ÉCRITURE DRAINÉE » dans la console.
 */
(function() {
    'use strict';

    // Les textes d'amorce, relevés dans le code le 1er septembre 2026.
    // Chacun porte son site : si l'un change, la liste doit changer avec lui.
    var AMORCES = [
        { texte: 'Saisissez les erreurs et le nombre de mots',
          site: 'evaluation-chargement.js:1014 et :1180 (critère algorithmique)' },
        { texte: 'Sélectionne un niveau',
          site: 'evaluation-chargement.js:1014 et :1180 (critère non algorithmique)' },
        { texte: 'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)',
          site: 'evaluation-calcul.js:474 (mode catégories, aucun code dominant)' }
    ];

    function amorceDe(valeur) {
        if (typeof valeur !== 'string') return null;
        var coupe = valeur.trim();
        if (!coupe) return null;
        for (var i = 0; i < AMORCES.length; i++) {
            if (coupe === AMORCES[i].texte) return AMORCES[i];
        }
        return null;
    }

    /**
     * Ce que la cascade du PDF rendra une fois l'amorce retirée.
     *
     * ⚠ CE PRÉDICAT DOIT REFLÉTER LE PDF, PAS LE RESSEMBLER. Un preview qui
     * annonce un repli que le PDF n'emploierait pas est pire qu'un preview
     * absent : Grégoire appliquerait sur la foi d'une prédiction fausse.
     * Deux règles recopiées de `synthese-retroaction-data.js` :
     *   · la rétroaction engendrée n'est lue que si le critère est
     *     ALGORITHMIQUE DANS LA GRILLE (`data.js:378`), pas dans l'évaluation ;
     *   · la cartouche se lit UNIQUEMENT sous la clé namespacée du trimestre
     *     (`data.js:1229`), sans repli sur la clé nue.
     */
    function repliApresEffacement(ev, critere, cartouche, grille) {
        var def = (grille && Array.isArray(grille.criteres))
            ? grille.criteres.find(function(gc) {
                return gc.id === critere.critereId || gc.nom === critere.critereNom;
              })
            : null;
        var estAlgorithmique = !!(def && def.type === 'algorithmique');

        var da = ev.donneesAlgorithmiques && ev.donneesAlgorithmiques[critere.critereId];
        var retroAlgo = (estAlgorithmique && da && typeof da.retroaction === 'string')
            ? da.retroaction.trim() : '';
        if (retroAlgo) return { source: 'rétroaction engendrée', texte: retroAlgo };

        var cleCart = critere.critereId && critere.niveauSelectionne
            ? critere.critereId + '_' + critere.niveauSelectionne : null;
        var comm = (cartouche && cleCart && cartouche.commentaires) ? cartouche.commentaires[cleCart] : '';
        if (comm && String(comm).trim()) return { source: 'commentaire de cartouche', texte: String(comm).trim() };

        return { source: null, texte: '' };
    }

    /** Recopie fidèle de `lireCartouche` (synthese-retroaction-data.js:1227). */
    function cartouchePourEvaluation(ev) {
        if (!ev.cartoucheId || !ev.grilleId) return null;
        try {
            var lot = db.getSync(cle('cartouches_' + ev.grilleId), []);
            if (lot && !Array.isArray(lot)) lot = [lot];
            return (lot || []).find(function(c) { return c.id === ev.cartoucheId; }) || null;
        } catch (e) {
            console.warn('[amorces] cartouches illisibles pour', ev.id, e);
            return null;
        }
    }

    function calculer() {
        var cleEvals = cle('evaluationsSauvegardees');
        var evaluations = db.getSync(cleEvals, []) || [];
        // Même lecture que le PDF (`synthese-retroaction-data.js:1223`) : la clé
        // namespacée du trimestre, sans repli sur la clé nue.
        var grilles = db.getSync(cle('grillesTemplates'), []) || [];

        var aEffacer = [];   // amorce ET repli disponible
        var refuses = [];    // amorce MAIS aucun repli — on n'y touche pas

        evaluations.forEach(function(ev) {
            if (ev.remplaceeParId) return;
            if (!Array.isArray(ev.criteres)) return;
            var cartouche = cartouchePourEvaluation(ev);
            var grille = grilles.find(function(g) { return g.id === ev.grilleId; }) || null;

            ev.criteres.forEach(function(critere, index) {
                var amorce = amorceDe(critere.retroaction);
                if (!amorce) return;

                var repli = repliApresEffacement(ev, critere, cartouche, grille);
                var ligne = {
                    evalId: ev.id,
                    critereIndex: index,
                    critereId: critere.critereId,
                    critereNom: critere.critereNom || critere.critereId,
                    etudiant: ev.etudiantNom || ev.etudiantDA || '(sans nom)',
                    productionId: ev.productionId || '',
                    productionNom: ev.productionNom || '(production sans nom)',
                    amorce: amorce.texte,
                    site: amorce.site,
                    brut: JSON.stringify(critere.retroaction),
                    repliSource: repli.source,
                    repli: repli.texte
                };
                if (repli.source) aEffacer.push(ligne);
                else refuses.push(ligne);
            });
        });

        return { cleEvals: cleEvals, evaluations: evaluations, aEffacer: aEffacer, refuses: refuses };
    }

    /**
     * ⚠ DÉFAUT TROUVÉ EN PRODUCTION LE 1er SEPTEMBRE 2026, APRÈS APPLICATION.
     *
     * `db.setSync` sur une valeur volumineuse bascule en IDB-FIRST
     * (`db.js:1536-1541`) : il RETIRE la copie localStorage, met la valeur dans
     * `memoryCache` — volatile — et lance l'écriture IndexedDB EN ARRIÈRE-PLAN,
     * suivie dans `_pendingWrites`.
     *
     * La version précédente de ce script imprimait « N effacées » puis invitait
     * à recharger IMMÉDIATEMENT. Ce compteur attestait le CALCUL, pas
     * l'ÉCRITURE : rien ne garantissait que l'écriture IDB avait atterri, et le
     * cache mémoire, lui, meurt au rechargement.
     *
     * `appliquer` est donc ASYNCHRONE et attend `db.flush()`. Le message de fin
     * n'est imprimé qu'APRÈS le drainage — un compteur ne se dit qu'une fois ce
     * qu'il compte réellement fait.
     */
    async function appliquer() {
        var etat = calculer();
        if (!etat.aEffacer.length) {
            console.warn('[amorces] Rien à effacer — aucune écriture.');
            return { efface: 0, evaluations: 0 };
        }

        var parId = {};
        etat.evaluations.forEach(function(ev, i) { parId[ev.id] = i; });

        var n = 0;
        var touchees = {};
        var maintenant = new Date().toISOString();

        etat.aEffacer.forEach(function(l) {
            var ev = etat.evaluations[parId[l.evalId]];
            if (!ev || !ev.criteres || !ev.criteres[l.critereIndex]) return;
            var critere = ev.criteres[l.critereIndex];
            // ⚠ RELIRE AVANT D'ÉCRIRE. Le preview a pu être calculé il y a
            // plusieurs minutes ; si la valeur n'est plus une amorce, on
            // n'écrase pas ce qui a été écrit entre-temps.
            if (!amorceDe(critere.retroaction)) return;
            critere.retroaction = '';
            ev.dateModification = maintenant;
            touchees[ev.id] = true;
            n++;
        });

        db.setSync(etat.cleEvals, etat.evaluations);

        // ⚠ ATTENDRE QUE L'ÉCRITURE ATTERRISSE AVANT DE DIRE QU'ELLE EST FAITE.
        if (typeof db.flush === 'function') {
            await db.flush();
        } else {
            console.warn('[amorces] db.flush() absent : NE PAS recharger tout de suite, '
                + 'l\'écriture IndexedDB peut être encore en vol.');
        }
        var restantes = (db._pendingWrites && db._pendingWrites.size) || 0;
        if (restantes) {
            console.warn('[amorces] ' + restantes + ' écriture(s) encore en attente après flush — '
                + 'attendre quelques secondes avant de recharger.');
        }

        console.log('[amorces] ' + n + ' rétroaction(s) d\'amorce effacée(s) sur '
            + Object.keys(touchees).length + ' évaluation(s), ÉCRITURE DRAINÉE.');
        console.log('[amorces] Tu peux recharger la page, puis réexporter le PDF.');
        return { efface: n, evaluations: Object.keys(touchees).length, ecrituresEnAttente: restantes };
    }

    // ===================== MODE PREVIEW (par défaut) =====================
    var apercu = calculer();
    var evalsTouchees = {};
    apercu.aEffacer.forEach(function(l) { evalsTouchees[l.evalId] = true; });
    var parProduction = {};
    apercu.aEffacer.forEach(function(l) {
        parProduction[l.productionNom] = (parProduction[l.productionNom] || 0) + 1;
    });

    console.group('[Amorces] Mode PREVIEW — RIEN n\'est écrit');
    console.log('Clé lue :', apercu.cleEvals);
    console.log('À effacer :', apercu.aEffacer.length, 'rétroaction(s) sur',
                Object.keys(evalsTouchees).length, 'évaluation(s)');
    console.log('Par production :', parProduction);

    if (apercu.aEffacer.length) {
        console.table(apercu.aEffacer.map(function(l) {
            return {
                etudiant: l.etudiant,
                production: l.productionNom,
                critere: l.critereNom,
                amorce_effacee: l.amorce,
                remplacee_par: l.repliSource,
                apercu: l.repli.slice(0, 90) + (l.repli.length > 90 ? '…' : '')
            };
        }));
    }

    if (apercu.refuses.length) {
        console.warn('⚠ ' + apercu.refuses.length + ' cas portent une amorce MAIS aucun repli : '
            + 'ni rétroaction engendrée, ni commentaire de cartouche. Ils ne seront PAS touchés — '
            + 'effacer y remplacerait un texte faux par un blanc.');
        console.table(apercu.refuses.map(function(l) {
            return { etudiant: l.etudiant, production: l.productionNom, critere: l.critereNom, amorce: l.amorce };
        }));
    }

    if (!apercu.aEffacer.length && !apercu.refuses.length) {
        console.log('Aucune amorce persistée trouvée sous cette clé. Si le PDF montre pourtant '
            + 'le texte d\'amorce, la cause est AILLEURS que dans criteres[].retroaction — '
            + 'ne rien appliquer, et le dire.');
    }

    console.log('Pour appliquer : await window.__amorces.appliquer()  — attendre « ÉCRITURE DRAINÉE »');
    console.groupEnd();

    window.__amorces = {
        aEffacer: apercu.aEffacer,
        refuses: apercu.refuses,
        appliquer: appliquer,
        recalculer: calculer,
        AMORCES: AMORCES
    };
    return window.__amorces;
})();
