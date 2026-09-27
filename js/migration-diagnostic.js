(function() {
    'use strict';

    /**
     * Module de diagnostic et migration pour la refactorisation
     * du pipeline Import / Fichiers / Évaluations.
     *
     * Fournit :
     * - migrationDiagnostic()   → rapport complet de l'état des données
     * - migrationSnapshot()     → sauvegarde pré-migration (one-time)
     * - migrationRestaurer()    → restauration depuis le snapshot
     *
     * Phase 0 du plan de refactorisation (filet de sécurité).
     */

    // =========================================================================
    //  DIAGNOSTIC
    // =========================================================================

    /**
     * Analyse complète de l'état des fichiers et évaluations.
     * Appelable depuis la console : migrationDiagnostic()
     * @returns {Object} Rapport structuré
     */
    function migrationDiagnostic() {
        const fichiers = obtenirDonneesSelonMode('fichiersTravaux') || [];
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const corbeille = obtenirDonneesSelonMode('corbeilleFichiers') || [];

        // --- Fichiers ---
        const fichiersOrphelins = fichiers.filter(f => !f.productionId);
        const fichiersActifs = fichiers.filter(f => f.productionId);

        // --- Évaluations ---
        const evalsActives = evaluations.filter(e => !e.remplaceeParId);
        const evalsAvecFichierId = evalsActives.filter(e => e.fichierId);
        const evalsSansFichierId = evalsActives.filter(e => !e.fichierId);

        // --- Doublons fichiers (mêmes DA + productionId) ---
        const groupesFichiers = {};
        fichiersActifs.forEach(f => {
            const cle_composite = `${f.etudiantDA}|${f.productionId}`;
            if (!groupesFichiers[cle_composite]) groupesFichiers[cle_composite] = [];
            groupesFichiers[cle_composite].push(f);
        });
        const doublonsFichiers = Object.entries(groupesFichiers)
            .filter(([, groupe]) => groupe.length > 1)
            .map(([cle_composite, groupe]) => ({
                cle: cle_composite,
                da: groupe[0].etudiantDA,
                productionId: groupe[0].productionId,
                fichiers: groupe.map(f => ({ id: f.id, nom: f.nomFichier, date: f.dateImport }))
            }));

        // --- Doublons évaluations (mêmes DA + productionId, actives) ---
        const groupesEvals = {};
        evalsActives.forEach(e => {
            if (!e.etudiantDA || !e.productionId) return;
            const cle_composite = `${e.etudiantDA}|${e.productionId}`;
            if (!groupesEvals[cle_composite]) groupesEvals[cle_composite] = [];
            groupesEvals[cle_composite].push(e);
        });
        const doublonsEvals = Object.entries(groupesEvals)
            .filter(([, groupe]) => groupe.length > 1)
            .map(([cle_composite, groupe]) => ({
                cle: cle_composite,
                da: groupe[0].etudiantDA,
                productionId: groupe[0].productionId,
                evaluations: groupe.map(e => ({ id: e.id, date: e.dateEvaluation }))
            }));

        // --- Incohérences (fichierId pointe vers un fichier avec productionId différent) ---
        const incoherences = [];
        evalsAvecFichierId.forEach(e => {
            if (typeof travauxStockage === 'undefined') return;
            const fichier = travauxStockage.obtenirFichierParId(e.fichierId);
            if (fichier && fichier.productionId && e.productionId && fichier.productionId !== e.productionId) {
                incoherences.push({
                    evaluationId: e.id,
                    fichierId: e.fichierId,
                    evalProductionId: e.productionId,
                    fichierProductionId: fichier.productionId
                });
            }
        });

        // --- Fichiers sans statut (pour Phase 6) ---
        const fichiersSansStatut = fichiers.filter(f => !f.statut);

        // --- Rapport ---
        const rapport = {
            date: new Date().toISOString(),
            fichiers: {
                total: fichiers.length,
                actifs: fichiersActifs.length,
                orphelins: fichiersOrphelins.length,
                sansStatut: fichiersSansStatut.length,
                doublons: doublonsFichiers
            },
            evaluations: {
                total: evaluations.length,
                actives: evalsActives.length,
                avecFichierId: evalsAvecFichierId.length,
                sansFichierId: evalsSansFichierId.length,
                doublons: doublonsEvals
            },
            incoherences: incoherences,
            corbeille: {
                total: corbeille.length
            }
        };

        // --- Affichage console ---
        console.group('%c[Migration] Diagnostic complet', 'font-weight:bold; font-size:14px; color:#4CAF50');

        console.table({
            'Total': { valeur: rapport.fichiers.total },
            'Actifs (avec productionId)': { valeur: rapport.fichiers.actifs },
            'Orphelins (sans productionId)': { valeur: rapport.fichiers.orphelins },
            'Sans champ statut': { valeur: rapport.fichiers.sansStatut }
        });

        console.table({
            'Total': { valeur: rapport.evaluations.total },
            'Actives': { valeur: rapport.evaluations.actives },
            'Avec fichierId (à migrer Phase 3)': { valeur: rapport.evaluations.avecFichierId },
            'Sans fichierId (clé composite)': { valeur: rapport.evaluations.sansFichierId }
        });

        if (doublonsFichiers.length > 0) {
            console.warn(`%c⚠ ${doublonsFichiers.length} groupe(s) de doublons fichiers`, 'color:orange; font-weight:bold');
            doublonsFichiers.forEach(d => {
                console.table(d.fichiers);
            });
        } else {
        }

        if (doublonsEvals.length > 0) {
            console.warn(`%c⚠ ${doublonsEvals.length} groupe(s) de doublons évaluations`, 'color:orange; font-weight:bold');
            doublonsEvals.forEach(d => {
                console.table(d.evaluations);
            });
        } else {
        }

        if (incoherences.length > 0) {
            console.warn(`%c⚠ ${incoherences.length} incohérence(s) fichierId↔productionId`, 'color:red; font-weight:bold');
            console.table(incoherences);
        } else {
        }

        console.groupEnd();

        return rapport;
    }

    // =========================================================================
    //  SNAPSHOT PRÉ-MIGRATION
    // =========================================================================

    /**
     * Crée un snapshot des données avant migration.
     * Ne s'exécute qu'une fois (flag migration_snapshot_v1).
     * @returns {boolean} true si snapshot créé, false si déjà existant
     */
    function migrationSnapshot() {
        const flag = cle('migration_snapshot_v1');
        if (db.getSync(flag)) {
            return false;
        }

        const fichiers = obtenirDonneesSelonMode('fichiersTravaux') || [];
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const corbeille = obtenirDonneesSelonMode('corbeilleFichiers') || [];

        db.setSync(cle('fichiersTravaux_backup_v1'), JSON.parse(JSON.stringify(fichiers)));
        db.setSync(cle('evaluationsSauvegardees_backup_v1'), JSON.parse(JSON.stringify(evaluations)));
        db.setSync(cle('corbeilleFichiers_backup_v1'), JSON.parse(JSON.stringify(corbeille)));
        db.setSync(flag, new Date().toISOString());


        return true;
    }

    /**
     * Restaure les données depuis le snapshot pré-migration.
     * Usage d'urgence uniquement.
     * @returns {boolean} true si restauré
     */
    function migrationRestaurer() {
        const flag = cle('migration_snapshot_v1');
        const dateSnapshot = db.getSync(flag);
        if (!dateSnapshot) {
            console.error('[Migration] Aucun snapshot trouvé — restauration impossible.');
            return false;
        }

        const fichiers = db.getSync(cle('fichiersTravaux_backup_v1'));
        const evaluations = db.getSync(cle('evaluationsSauvegardees_backup_v1'));
        const corbeille = db.getSync(cle('corbeilleFichiers_backup_v1'));

        if (!fichiers || !evaluations) {
            console.error('[Migration] Données de snapshot incomplètes — restauration impossible.');
            return false;
        }

        // Confirmer avant d'écraser
        console.warn(`%c[Migration] RESTAURATION depuis le snapshot du ${dateSnapshot}`, 'color:red; font-weight:bold');
        console.warn(`  Fichiers : ${fichiers.length} (remplaceront les données actuelles)`);
        console.warn(`  Évaluations : ${evaluations.length}`);
        console.warn(`  Corbeille : ${(corbeille || []).length}`);

        sauvegarderDonneesSelonMode('fichiersTravaux', fichiers, { discret: true });
        sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations, { discret: true });
        sauvegarderDonneesSelonMode('corbeilleFichiers', corbeille || [], { discret: true });

        return true;
    }

    // =========================================================================
    //  MIGRATION PHASE 3a — Suppression du fichierId des évaluations
    // =========================================================================

    /**
     * Migre les évaluations : supprime fichierId quand la résolution par
     * clé composite (DA, productionId) retourne le même fichier.
     * @returns {Object} Rapport de migration
     */
    function migrationSupprimerFichierId() {
        const flagSnapshot = cle('migration_snapshot_v1');
        if (!db.getSync(flagSnapshot)) {
            console.error('[Migration] Exécutez migrationSnapshot() d\'abord.');
            return null;
        }

        const flagMigration = cle('migration_fichierId_supprime_v1');
        if (db.getSync(flagMigration)) {
            return null;
        }

        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
        let nbMigres = 0;
        let nbIncoherents = 0;
        const incoherents = [];

        evaluations.forEach(e => {
            if (!e.fichierId) return;
            if (e.remplaceeParId) return;

            // Résolution par clé composite
            if (!e.etudiantDA || !e.productionId) {
                incoherents.push({ id: e.id, raison: 'DA ou productionId manquant', fichierId: e.fichierId });
                nbIncoherents++;
                return;
            }

            if (typeof travauxStockage === 'undefined') return;
            const fichiers = travauxStockage.obtenirFichiersEtudiant(e.etudiantDA)
                .filter(f => f.productionId === e.productionId);

            if (fichiers.length === 1 && fichiers[0].id === e.fichierId) {
                // Résolution composite = même résultat → safe pour migrer
                e.fichierId = '';
                nbMigres++;
            } else if (fichiers.some(f => f.id === e.fichierId)) {
                // Le fichier est dans les candidats mais pas le seul → ambiguïté
                incoherents.push({ id: e.id, raison: 'Multiples fichiers pour cette clé composite', fichierId: e.fichierId, nbCandidats: fichiers.length });
                nbIncoherents++;
            } else {
                // Le fichier pointé n'est pas dans les candidats composites
                incoherents.push({ id: e.id, raison: 'fichierId introuvable via clé composite', fichierId: e.fichierId });
                nbIncoherents++;
            }
        });

        if (nbMigres > 0) {
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations, { discret: true });
        }
        db.setSync(flagMigration, new Date().toISOString());

        const rapport = { nbMigres, nbIncoherents, incoherents };

        console.group('%c[Migration] Suppression fichierId', 'font-weight:bold; font-size:14px; color:#2196F3');
        if (nbIncoherents > 0) {
            console.warn(`Incohérents (NON migrés) : ${nbIncoherents}`);
            console.table(incoherents);
        } else {
        }
        console.groupEnd();

        return rapport;
    }

    // =========================================================================
    //  MIGRATION PHASE 6 — Ajout du champ statut
    // =========================================================================

    /**
     * Ajoute le champ `statut` à tous les fichiers qui ne l'ont pas.
     * @returns {number} Nombre de fichiers migrés
     */
    function migrationAjouterStatut() {
        const fichiers = obtenirDonneesSelonMode('fichiersTravaux') || [];
        let nbMigres = 0;

        fichiers.forEach(f => {
            if (f.statut) return;
            f.statut = f.productionId ? 'actif' : 'orphelin';
            nbMigres++;
        });

        if (nbMigres > 0) {
            sauvegarderDonneesSelonMode('fichiersTravaux', fichiers, { discret: true });
        } else {
        }

        return nbMigres;
    }

    // =========================================================================
    //  AUTO-DIAGNOSTIC AU CHARGEMENT
    // =========================================================================

    // Log léger au chargement (pas de console.table pour ne pas polluer)
    try {
        const fichiers = obtenirDonneesSelonMode('fichiersTravaux') || [];
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const evalsAvecFichierId = evaluations.filter(e => e.fichierId && !e.remplaceeParId);
        if (fichiers.length > 0 || evaluations.length > 0) {
        }
    } catch (e) {
        // Silencieux si les fonctions de storage ne sont pas encore disponibles
    }

    // =========================================================================
    //  RÉPARATION RÉFÉRENCES PRODUCTIONS — Brique D hygiène, Bloc 2 (juin 2026)
    // =========================================================================
    /**
     * Répare les références de production PÉRIMÉES ou VIDES sur la donnée LIVE :
     * production.grilleId/echelleId → id UNANIME des évaluations de la production
     * (les évals ont réellement noté les élèves ⇒ source de vérité). Conservateur :
     * remap UNIQUEMENT si des évals existent ET s'accordent sur un id ≠ du champ.
     * N'écrit QUE le champ de la production — NI les notes NI les fichiers.
     *
     * Cartouches orphelines (gabarit supprimé) : SIGNALÉES avec { cartouches: true }
     * mais JAMAIS réécrites — neutraliser une cartoucheId imposerait de réécrire une
     * évaluation, or elles sont verrouillées (notes figées, invariant #350) ; la
     * rétroaction est de toute façon conservée en clair sur l'évaluation.
     *
     * ALGORITHME MIROIR de scripts/reparer-references-productions.mjs::calculerReparations
     * (logique testée : tests/unit/sentinelle-reparer-references-productions-briqueD).
     * Si l'un change, ALIGNER l'autre. Ici la donnée est lue/écrite LIVE via
     * cleSource() + db (clés <trimestre>_productions / <trimestre>_evaluationsSauvegardees).
     *
     * Appel console (TOUJOURS `await`) :
     *   await reparerReferencesProductions()                      → DRY-RUN (défaut), rapport seul
     *   await reparerReferencesProductions({ cartouches: true })  → dry-run + signalement cartouches
     *   await reparerReferencesProductions({ dryRun: false })     → ÉCRIT les remaps — BACKUP CODEX AVANT
     *
     * @param {{dryRun?:boolean, cartouches?:boolean}} [options]
     * @returns {Promise<{remaps:Array, cartouches:Array, ecrit:boolean}|null>}
     */
    async function reparerReferencesProductions(options) {
        options = options || {};
        const dryRun = options.dryRun !== false;        // dry-run PAR DÉFAUT
        const avecCartouches = options.cartouches === true;

        if (typeof db === 'undefined' || typeof cleSource !== 'function' || typeof obtenirTrimestres !== 'function') {
            console.error('[Réparation] dépendances absentes (db / cleSource / obtenirTrimestres). Recharge la page.');
            return null;
        }

        const trimestres = (obtenirTrimestres() || []).map(function (t) { return t && t.id; }).filter(Boolean);

        function unanime(evals, champ) {
            const vus = new Set();
            for (const e of evals) vus.add((e && e[champ]) || '');
            return vus.size === 1 ? Array.from(vus)[0] : null;
        }

        // Catalogue des cartouches existantes (toutes clés cartouches_*) — si demandé.
        let cartouchesConnues = null;
        if (avecCartouches) {
            cartouchesConnues = new Set();
            const toutesCles = await db.keys();
            for (const k of toutesCles) {
                if (/(^|_)cartouches_/.test(k)) {
                    const liste = await db.get(k, []);
                    if (Array.isArray(liste)) for (const c of liste) if (c && c.id) cartouchesConnues.add(c.id);
                }
            }
        }

        const remaps = [];
        const cartouches = [];
        const aEcrire = [];   // { cle, valeur }

        for (const t of trimestres) {
            const kProd = cleSource('productions', t);
            const kEval = cleSource('evaluationsSauvegardees', t);
            const productions = (await db.get(kProd, [])) || [];
            const evals = (await db.get(kEval, [])) || [];

            // 1) Remap des références de production.
            let prodModifie = false;
            for (const prod of productions) {
                if (!prod || !prod.id) continue;
                const liees = evals.filter(function (e) {
                    return e && !e.remplaceeParId && e.productionId === prod.id && e.grilleId;
                });
                if (!liees.length) continue;
                ['grilleId', 'echelleId'].forEach(function (champ) {
                    if (!(champ in prod)) return;
                    const cible = unanime(liees, champ);
                    if (cible === null) return;                 // évals divergentes ⇒ on ne tranche pas
                    if ((prod[champ] || '') === cible) return;  // déjà aligné
                    remaps.push({ trimestre: t, productionId: prod.id, titre: prod.titre || prod.nom || '', champ: champ, de: prod[champ] || '', vers: cible, nbEvals: liees.length });
                    if (!dryRun) { prod[champ] = cible; prodModifie = true; }
                });
            }
            if (prodModifie) aEcrire.push({ cle: kProd, valeur: productions });

            // 2) Cartouches orphelines (SIGNALÉES seulement, jamais réécrites).
            if (avecCartouches) {
                const parCartouche = {};
                for (const e of evals) {
                    if (!e || e.remplaceeParId) continue;
                    const cid = e.cartoucheId;
                    if (cid && !cartouchesConnues.has(cid)) {
                        const r = parCartouche[cid] || (parCartouche[cid] = { nbEvals: 0, nbVerrouillees: 0 });
                        r.nbEvals++;
                        if (e.verrouillee === true) r.nbVerrouillees++;
                    }
                }
                Object.keys(parCartouche).forEach(function (cid) {
                    cartouches.push({ trimestre: t, cartoucheId: cid, nbEvals: parCartouche[cid].nbEvals, nbVerrouillees: parCartouche[cid].nbVerrouillees });
                });
            }
        }

        // ── Rapport (console.warn : style du module ; pas de console.log de debug). ──
        console.warn('═══ RÉPARATION RÉFÉRENCES PRODUCTIONS — ' + (dryRun ? 'DRY-RUN (aucune écriture)' : 'ÉCRITURE LIVE') + ' ═══');
        console.warn('Trimestres : ' + (trimestres.join(', ') || '(aucun)'));
        console.warn('Productions à remapper : ' + remaps.length);
        remaps.forEach(function (r) {
            console.warn('  [' + r.trimestre + '] ' + r.productionId + (r.titre ? ' « ' + r.titre + ' »' : '') +
                '  ' + r.champ + ' : ' + (r.de || '∅') + ' → ' + r.vers + '  (' + r.nbEvals + ' éval. unanimes)');
        });
        if (avecCartouches) {
            console.warn('Cartouches orphelines (SIGNALÉES, non réécrites) : ' + cartouches.length);
            cartouches.forEach(function (c) {
                console.warn('  [' + c.trimestre + '] ' + c.cartoucheId + ' — ' + c.nbEvals + ' éval. (' + c.nbVerrouillees + ' verrouillée(s)) · rétroaction conservée · laissée telle quelle');
            });
        } else {
            console.warn('(cartouches orphelines non examinées — passer { cartouches: true } pour les signaler)');
        }

        let ecrit = false;
        if (dryRun) {
            console.warn('DRY-RUN — RIEN n\'a été modifié. Pour APPLIQUER les remaps : await reparerReferencesProductions({ dryRun: false })');
            console.warn('⚠ FAIRE UN BACKUP CODEX AVANT. (Notes et fichiers NON touchés ; on écrit seulement le champ grille/échelle des productions.)');
        } else if (!aEcrire.length) {
            console.warn('Rien à écrire : les références de production sont déjà propres.');
        } else {
            for (const w of aEcrire) {
                await db.set(w.cle, w.valeur);
                console.warn('ÉCRIT : ' + w.cle + ' (' + w.valeur.length + ' productions)');
            }
            ecrit = true;
            console.warn('✅ APPLIQUÉ. Recharge la page pour voir l\'effet. Idempotent : un 2e appel ne trouvera plus rien à remapper.');
        }
        return { remaps: remaps, cartouches: cartouches, ecrit: ecrit };
    }

    /**
     * Réaligne production.coursId sur l'id de cours UNANIME des évaluations de la
     * production. Sibling coursId de reparerReferencesProductions : MÊME logique
     * conservatrice. Le coursId périmé d'une production (ancien id avant namespacing,
     * famille #346) la fait écarter par le filtre coursId d'obtenirDonneesSelonMode
     * → portfolio vide, note à 0. On le réaligne sur l'id que portent ses évals.
     *
     * CONSERVATEUR : remap UNIQUEMENT si des évals existent, DÉCLARENT un coursId, et
     * s'accordent sur un id ≠ du champ production. AUTO-LIMITÉ : un trimestre cohérent
     * (ancien id légitime partagé par productions ET évals — cas A24/A25) ne produit
     * AUCUN remap. Productions SANS éval (conteneur « Portfolio ») : NON touchées.
     * N'écrit QUE <trimestre>_productions — NI les notes NI les fichiers NI A24/A25.
     *
     * ALGORITHME MIROIR de scripts/reparer-coursid-productions.mjs::calculerRemapsCoursId
     * (logique testée : tests/unit/sentinelle-reparer-coursid-productions.test.js).
     * Si l'un change, ALIGNER l'autre.
     *
     * Appel console (TOUJOURS `await`) :
     *   await reparerCoursIdProductions()                   → DRY-RUN (défaut), rapport seul
     *   await reparerCoursIdProductions({ dryRun: false })   → ÉCRIT les remaps — BACKUP CODEX AVANT
     *
     * @param {{dryRun?:boolean}} [options]
     * @returns {Promise<{remaps:Array, ecrit:boolean}|null>}
     */
    async function reparerCoursIdProductions(options) {
        options = options || {};
        const dryRun = options.dryRun !== false;        // dry-run PAR DÉFAUT

        if (typeof db === 'undefined' || typeof cleSource !== 'function' || typeof obtenirTrimestres !== 'function') {
            console.error('[Réparation coursId] dépendances absentes (db / cleSource / obtenirTrimestres). Recharge la page.');
            return null;
        }

        const trimestres = (obtenirTrimestres() || []).map(function (t) { return t && t.id; }).filter(Boolean);

        function unanime(evals, champ) {
            const vus = new Set();
            for (const e of evals) vus.add((e && e[champ]) || '');
            return vus.size === 1 ? Array.from(vus)[0] : null;
        }

        const remaps = [];
        const aEcrire = [];   // { cle, valeur }

        for (const t of trimestres) {
            const kProd = cleSource('productions', t);
            const kEval = cleSource('evaluationsSauvegardees', t);
            const productions = (await db.get(kProd, [])) || [];
            const evals = (await db.get(kEval, [])) || [];

            let prodModifie = false;
            for (const prod of productions) {
                if (!prod || !prod.id) continue;
                // Seules les évals ACTIVES qui DÉCLARENT un coursId « votent ».
                const liees = evals.filter(function (e) {
                    return e && !e.remplaceeParId && e.productionId === prod.id && e.coursId;
                });
                if (!liees.length) continue;                   // aucune éval votante (ex. conteneur) ⇒ on ne touche pas
                const cible = unanime(liees, 'coursId');
                if (cible === null) continue;                  // évals divergentes ⇒ on ne tranche pas
                if ((prod.coursId || '') === cible) continue;  // déjà aligné (cas A24/A25 cohérent)
                remaps.push({ trimestre: t, productionId: prod.id, titre: prod.titre || prod.nom || '', champ: 'coursId', de: prod.coursId || '', vers: cible, nbEvals: liees.length });
                if (!dryRun) { prod.coursId = cible; prodModifie = true; }
            }
            if (prodModifie) aEcrire.push({ cle: kProd, valeur: productions });
        }

        // ── Rapport (console.warn : style du module ; pas de console.log de debug). ──
        console.warn('═══ RÉPARATION coursId PRODUCTIONS — ' + (dryRun ? 'DRY-RUN (aucune écriture)' : 'ÉCRITURE LIVE') + ' ═══');
        console.warn('Trimestres : ' + (trimestres.join(', ') || '(aucun)'));
        console.warn('Productions à remapper : ' + remaps.length);
        remaps.forEach(function (r) {
            console.warn('  [' + r.trimestre + '] ' + r.productionId + (r.titre ? ' « ' + r.titre + ' »' : '') +
                '  coursId : ' + (r.de || '∅') + ' → ' + r.vers + '  (' + r.nbEvals + ' éval. unanimes)');
        });
        // Transparence (parité avec le script offline) : clés qui SERAIENT écrites, AVANT décision.
        const clesTouchees = Array.from(new Set(remaps.map(function (r) { return r.trimestre + '_productions'; }))).sort();
        console.warn('Clés qui seraient écrites : ' + (clesTouchees.join(', ') || '(aucune)') + ' — notes, fichiers et autres trimestres NON touchés.');

        let ecrit = false;
        if (dryRun) {
            console.warn('DRY-RUN — RIEN n\'a été modifié. Pour APPLIQUER les remaps : await reparerCoursIdProductions({ dryRun: false })');
            console.warn('⚠ FAIRE UN BACKUP CODEX AVANT. (Notes, fichiers et autres trimestres NON touchés ; on écrit seulement le coursId des productions.)');
        } else if (!aEcrire.length) {
            console.warn('Rien à écrire : les coursId de production sont déjà propres.');
        } else {
            for (const w of aEcrire) {
                await db.set(w.cle, w.valeur);
                console.warn('ÉCRIT : ' + w.cle + ' (' + w.valeur.length + ' productions)');
            }
            ecrit = true;
            console.warn('✅ APPLIQUÉ. Recharge la page pour voir l\'effet (portfolio recalculé). Idempotent : un 2e appel ne trouvera plus rien à remapper.');
        }
        return { remaps: remaps, ecrit: ecrit };
    }

    // =========================================================================
    //  API PUBLIQUE
    // =========================================================================

    window.migrationDiagnostic = migrationDiagnostic;
    window.migrationSnapshot = migrationSnapshot;
    window.migrationRestaurer = migrationRestaurer;
    window.migrationSupprimerFichierId = migrationSupprimerFichierId;
    window.migrationAjouterStatut = migrationAjouterStatut;
    window.reparerReferencesProductions = reparerReferencesProductions;
    window.reparerCoursIdProductions = reparerCoursIdProductions;

})();
