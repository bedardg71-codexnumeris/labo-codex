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
        const fichiers = obtenirDonneesSelonMode(cle('fichiersTravaux')) || [];
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        const corbeille = obtenirDonneesSelonMode(cle('corbeilleFichiers')) || [];

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

        console.log('%cFichiers', 'font-weight:bold; font-size:12px');
        console.table({
            'Total': { valeur: rapport.fichiers.total },
            'Actifs (avec productionId)': { valeur: rapport.fichiers.actifs },
            'Orphelins (sans productionId)': { valeur: rapport.fichiers.orphelins },
            'Sans champ statut': { valeur: rapport.fichiers.sansStatut }
        });

        console.log('%cÉvaluations', 'font-weight:bold; font-size:12px');
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
            console.log('%c✓ Aucun doublon fichier', 'color:green');
        }

        if (doublonsEvals.length > 0) {
            console.warn(`%c⚠ ${doublonsEvals.length} groupe(s) de doublons évaluations`, 'color:orange; font-weight:bold');
            doublonsEvals.forEach(d => {
                console.table(d.evaluations);
            });
        } else {
            console.log('%c✓ Aucun doublon évaluation', 'color:green');
        }

        if (incoherences.length > 0) {
            console.warn(`%c⚠ ${incoherences.length} incohérence(s) fichierId↔productionId`, 'color:red; font-weight:bold');
            console.table(incoherences);
        } else {
            console.log('%c✓ Aucune incohérence fichierId↔productionId', 'color:green');
        }

        console.log(`Corbeille : ${rapport.corbeille.total} fichier(s)`);
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
            console.log('[Migration] Snapshot déjà existant — aucune action.');
            return false;
        }

        const fichiers = obtenirDonneesSelonMode(cle('fichiersTravaux')) || [];
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        const corbeille = obtenirDonneesSelonMode(cle('corbeilleFichiers')) || [];

        db.setSync(cle('fichiersTravaux_backup_v1'), JSON.parse(JSON.stringify(fichiers)));
        db.setSync(cle('evaluationsSauvegardees_backup_v1'), JSON.parse(JSON.stringify(evaluations)));
        db.setSync(cle('corbeilleFichiers_backup_v1'), JSON.parse(JSON.stringify(corbeille)));
        db.setSync(flag, new Date().toISOString());

        console.log(`%c[Migration] Snapshot créé`, 'color:green; font-weight:bold');
        console.log(`  Fichiers : ${fichiers.length}`);
        console.log(`  Évaluations : ${evaluations.length}`);
        console.log(`  Corbeille : ${corbeille.length}`);
        console.log(`  Date : ${new Date().toISOString()}`);

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

        sauvegarderDonneesSelonMode('fichiersTravaux', fichiers);
        sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
        sauvegarderDonneesSelonMode('corbeilleFichiers', corbeille || []);

        console.log('%c[Migration] Restauration terminée. Rechargez la page.', 'color:green; font-weight:bold');
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
            console.log('[Migration] Migration fichierId déjà effectuée.');
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
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
        }
        db.setSync(flagMigration, new Date().toISOString());

        const rapport = { nbMigres, nbIncoherents, incoherents };

        console.group('%c[Migration] Suppression fichierId', 'font-weight:bold; font-size:14px; color:#2196F3');
        console.log(`Migrés (fichierId effacé) : ${nbMigres}`);
        if (nbIncoherents > 0) {
            console.warn(`Incohérents (NON migrés) : ${nbIncoherents}`);
            console.table(incoherents);
        } else {
            console.log('%c✓ Aucune incohérence', 'color:green');
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
        const fichiers = obtenirDonneesSelonMode(cle('fichiersTravaux')) || [];
        let nbMigres = 0;

        fichiers.forEach(f => {
            if (f.statut) return;
            f.statut = f.productionId ? 'actif' : 'orphelin';
            nbMigres++;
        });

        if (nbMigres > 0) {
            sauvegarderDonneesSelonMode('fichiersTravaux', fichiers);
            console.log(`[Migration] Statut ajouté à ${nbMigres} fichier(s)`);
        } else {
            console.log('[Migration] Tous les fichiers ont déjà un statut.');
        }

        return nbMigres;
    }

    // =========================================================================
    //  AUTO-DIAGNOSTIC AU CHARGEMENT
    // =========================================================================

    // Log léger au chargement (pas de console.table pour ne pas polluer)
    try {
        const fichiers = obtenirDonneesSelonMode(cle('fichiersTravaux')) || [];
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        const evalsAvecFichierId = evaluations.filter(e => e.fichierId && !e.remplaceeParId);
        if (fichiers.length > 0 || evaluations.length > 0) {
            console.log(`[Migration] État : ${fichiers.length} fichiers, ${evaluations.length} évaluations, ${evalsAvecFichierId.length} avec fichierId`);
        }
    } catch (e) {
        // Silencieux si les fonctions de storage ne sont pas encore disponibles
    }

    // =========================================================================
    //  API PUBLIQUE
    // =========================================================================

    window.migrationDiagnostic = migrationDiagnostic;
    window.migrationSnapshot = migrationSnapshot;
    window.migrationRestaurer = migrationRestaurer;
    window.migrationSupprimerFichierId = migrationSupprimerFichierId;
    window.migrationAjouterStatut = migrationAjouterStatut;

})();
