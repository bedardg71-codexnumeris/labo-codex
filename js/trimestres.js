/* ===============================
   MODULE: TRIMESTRES (Beta 95)
   Gestion multi-trimestres avec namespacing

   Ce module gère le registre des trimestres et le namespacing
   des clés localStorage/IndexedDB pour isoler les données
   de chaque trimestre (A2025, H2026, etc.)

   IMPORTANT: Ce module NE REMPLACE PAS trimestre.js ni trimestre-v2.js
   Il s'ajoute PAR-DESSUS pour permettre la gestion de plusieurs trimestres.
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    // Clés qui doivent être namespacées par trimestre
    const CLES_NAMESPACEES = [
        'calendrierComplet',
        'cadreCalendrier',
        'evenementsPrevus',
        'evenementsImprevus',
        'seancesCompletes',
        'horaireHebdo'
    ];

    // Clés globales (partagées entre trimestres)
    // Ces clés ne sont JAMAIS préfixées
    const CLES_GLOBALES = [
        'trimestres',
        'grillesTemplates',
        'echellesTemplates',
        'pratiquesConfigurables',
        'modalitesEvaluation',
        'modeApplication',
        'etatsAccordeonsV2'
    ];

    /* ===============================
       REGISTRE DES TRIMESTRES
       =============================== */

    /**
     * Obtient la liste de tous les trimestres
     * @returns {Array} Liste des trimestres
     */
    function obtenirTrimestres() {
        return db.getSync('trimestres', []);
    }

    /**
     * Obtient le trimestre actuellement actif
     * @returns {Object|null} Le trimestre actif ou null
     */
    function obtenirTrimestreActif() {
        const trimestres = obtenirTrimestres();
        return trimestres.find(t => t.actif === true) || null;
    }

    /**
     * Obtient l'ID du trimestre actif (ex: "a2025", "h2026")
     * @returns {string} L'ID du trimestre actif, ou chaîne vide si aucun
     */
    function obtenirTrimestreId() {
        const actif = obtenirTrimestreActif();
        return actif ? actif.id : '';
    }

    /* ===============================
       NAMESPACING DES CLÉS
       =============================== */

    /**
     * Retourne la clé namespacée pour le trimestre actif
     *
     * @param {string} nomCle - Nom de la clé (ex: 'calendrierComplet')
     * @returns {string} Clé namespacée (ex: 'a2025_calendrierComplet')
     *
     * IMPORTANT: Si aucun trimestre n'est actif, retourne la clé originale
     * pour assurer la rétrocompatibilité avec l'ancien format.
     */
    function cle(nomCle) {
        // Vérifier si c'est une clé globale (jamais namespacée)
        if (CLES_GLOBALES.includes(nomCle) || nomCle.startsWith('cartouches_')) {
            return nomCle;
        }

        // Obtenir l'ID du trimestre actif
        const trimestreId = obtenirTrimestreId();

        // Si pas de trimestre actif, retourner la clé originale (rétrocompatibilité)
        if (!trimestreId) {
            return nomCle;
        }

        // Vérifier si c'est une clé à namespacer
        if (CLES_NAMESPACEES.includes(nomCle)) {
            return `${trimestreId}_${nomCle}`;
        }

        // Clé non reconnue, retourner telle quelle
        return nomCle;
    }

    /* ===============================
       GESTION DES TRIMESTRES
       =============================== */

    /**
     * Crée un nouveau trimestre
     *
     * @param {string} session - 'A' (Automne) ou 'H' (Hiver)
     * @param {string} annee - Année (ex: '2025', '2026')
     * @param {boolean} activerImmediatement - Si true, active ce trimestre
     * @returns {Object} Le trimestre créé
     */
    function creerTrimestre(session, annee, activerImmediatement = false) {
        const id = `${session.toLowerCase()}${annee}`;
        const nom = `${session === 'H' ? 'Hiver' : 'Automne'} ${annee}`;

        const trimestres = obtenirTrimestres();

        // Vérifier si ce trimestre existe déjà
        if (trimestres.find(t => t.id === id)) {
            console.warn(`[Trimestres] Le trimestre ${id} existe déjà`);
            return null;
        }

        // Si on active ce trimestre, désactiver les autres
        if (activerImmediatement) {
            trimestres.forEach(t => t.actif = false);
        }

        const nouveauTrimestre = {
            id: id,
            nom: nom,
            session: session.toUpperCase(),
            annee: annee,
            dateCreation: new Date().toISOString().split('T')[0],
            actif: activerImmediatement
        };

        trimestres.push(nouveauTrimestre);
        db.setSync('trimestres', trimestres);

        console.log(`[Trimestres] Trimestre créé: ${nom} (${id})`);
        return nouveauTrimestre;
    }

    /**
     * Change le trimestre actif
     *
     * @param {string} id - ID du trimestre à activer (ex: 'a2025')
     * @returns {boolean} true si le changement a réussi
     */
    function changerTrimestreActif(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            console.error(`[Trimestres] Trimestre non trouvé: ${id}`);
            return false;
        }

        // Désactiver tous les trimestres
        trimestres.forEach(t => t.actif = false);

        // Activer le trimestre demandé
        trimestre.actif = true;

        db.setSync('trimestres', trimestres);

        console.log(`[Trimestres] Trimestre actif changé: ${trimestre.nom}`);
        return true;
    }

    /* ===============================
       ARCHIVAGE DES TRIMESTRES
       =============================== */

    /**
     * Archive un trimestre (fin de session)
     *
     * Un trimestre archivé est en lecture seule et ne peut plus être modifié
     * sans désarchivage explicite.
     *
     * @param {string} id - ID du trimestre à archiver (ex: 'a2025')
     * @returns {Object} Résultat de l'archivage
     */
    function archiverTrimestre(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            console.error(`[Trimestres] Trimestre non trouvé: ${id}`);
            return { success: false, error: 'Trimestre non trouvé' };
        }

        if (trimestre.archive) {
            console.warn(`[Trimestres] Trimestre déjà archivé: ${id}`);
            return { success: false, error: 'Trimestre déjà archivé' };
        }

        if (trimestre.actif) {
            console.error(`[Trimestres] Impossible d'archiver le trimestre actif`);
            return { success: false, error: 'Impossible d\'archiver le trimestre actif. Changez de trimestre d\'abord.' };
        }

        // Calculer les statistiques finales
        const stats = calculerStatistiquesFinales(id);

        // Marquer comme archivé
        trimestre.archive = true;
        trimestre.dateFin = new Date().toISOString().split('T')[0];
        trimestre.statistiquesFinales = stats;

        db.setSync('trimestres', trimestres);

        console.log(`[Trimestres] Trimestre archivé: ${trimestre.nom}`);

        // Générer export automatique
        const exportResult = exporterTrimestreArchive(id);

        return {
            success: true,
            trimestre: trimestre,
            statistiques: stats,
            exportGenere: exportResult.success
        };
    }

    /**
     * Désarchive un trimestre (permet modifications à nouveau)
     *
     * @param {string} id - ID du trimestre à désarchiver
     * @returns {Object} Résultat du désarchivage
     */
    function desarchiverTrimestre(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            console.error(`[Trimestres] Trimestre non trouvé: ${id}`);
            return { success: false, error: 'Trimestre non trouvé' };
        }

        if (!trimestre.archive) {
            console.warn(`[Trimestres] Trimestre pas archivé: ${id}`);
            return { success: false, error: 'Trimestre non archivé' };
        }

        // Retirer le flag archivé
        trimestre.archive = false;
        delete trimestre.dateFin;
        // Conserver statistiquesFinales comme référence historique

        db.setSync('trimestres', trimestres);

        console.log(`[Trimestres] Trimestre désarchivé: ${trimestre.nom}`);

        return { success: true, trimestre: trimestre };
    }

    /**
     * Vérifie si le trimestre actif est archivé (mode lecture seule)
     * @returns {boolean} true si le trimestre actif est archivé
     */
    function estTrimestreArchive() {
        const actif = obtenirTrimestreActif();
        return actif ? actif.archive === true : false;
    }

    /**
     * Calcule les statistiques finales d'un trimestre pour l'archivage
     *
     * @param {string} trimestreId - ID du trimestre
     * @returns {Object} Statistiques calculées
     */
    function calculerStatistiquesFinales(trimestreId) {
        try {
            // Obtenir les cours liés à ce trimestre
            const listeCours = db.getSync('listeCours', []);
            const coursTrimestr = listeCours.filter(c => c.trimestreId === trimestreId);

            if (coursTrimestr.length === 0) {
                return { nbEtudiants: 0, nbCours: 0, message: 'Aucun cours trouvé' };
            }

            // Statistiques globales
            const etudiants = db.getSync('groupeEtudiants', []);
            const etudiantsActifs = etudiants.filter(e =>
                e.statut !== 'abandon' && e.statut !== 'décrochage'
            );

            // Indices d'engagement
            const indicesCP = db.getSync('indicesCP', {});
            let totalEngagement = 0;
            let nbAvecIndices = 0;

            etudiantsActifs.forEach(e => {
                const indices = indicesCP[e.da];
                if (indices && indices.actuel) {
                    const pan = indices.actuel.PAN || indices.actuel.SOM || {};
                    const a = pan.A || 0;
                    const c = pan.C || 0;
                    const p = pan.P || 0;
                    const engagement = (a * c * p) / 10000; // Normaliser
                    totalEngagement += engagement;
                    nbAvecIndices++;
                }
            });

            const moyenneEngagement = nbAvecIndices > 0
                ? Math.round((totalEngagement / nbAvecIndices) * 100)
                : 0;

            return {
                nbEtudiants: etudiantsActifs.length,
                nbCours: coursTrimestr.length,
                moyenneEngagement: moyenneEngagement,
                dateCalcul: new Date().toISOString().split('T')[0]
            };
        } catch (error) {
            console.error('[Trimestres] Erreur calcul statistiques:', error);
            return { error: error.message };
        }
    }

    /**
     * Exporte les données complètes d'un trimestre archivé
     *
     * @param {string} id - ID du trimestre à exporter
     * @returns {Object} Résultat de l'export
     */
    function exporterTrimestreArchive(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            return { success: false, error: 'Trimestre non trouvé' };
        }

        try {
            // Collecter toutes les données du trimestre
            const exportData = {
                meta: {
                    type: 'archive-trimestre',
                    trimestreId: id,
                    trimestreNom: trimestre.nom,
                    dateExport: new Date().toISOString(),
                    version: 'Beta 95'
                },
                trimestre: trimestre,
                donnees: {}
            };

            // Données namespacées du trimestre
            CLES_NAMESPACEES.forEach(nomCle => {
                const cleComplete = `${id}_${nomCle}`;
                const valeur = db.getSync(cleComplete, null);
                if (valeur !== null) {
                    exportData.donnees[nomCle] = valeur;
                }
            });

            // Cours liés au trimestre
            const listeCours = db.getSync('listeCours', []);
            exportData.donnees.cours = listeCours.filter(c => c.trimestreId === id);

            // Étudiants, évaluations, présences liés aux cours du trimestre
            const coursIds = exportData.donnees.cours.map(c => c.id);

            const etudiants = db.getSync('groupeEtudiants', []);
            exportData.donnees.etudiants = etudiants.filter(e => coursIds.includes(e.coursId));

            const evaluations = db.getSync('evaluationsSauvegardees', []);
            exportData.donnees.evaluations = evaluations.filter(e => coursIds.includes(e.coursId));

            const presences = db.getSync('presences', []);
            exportData.donnees.presences = presences.filter(p => coursIds.includes(p.coursId));

            const snapshots = db.getSync('snapshots', { hebdomadaires: [], interventions: [] });
            exportData.donnees.snapshots = snapshots;

            // Déclencher le téléchargement
            const nomFichier = `trimestre-${id}-archive-${new Date().toISOString().split('T')[0]}.json`;
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = nomFichier;
            a.click();

            URL.revokeObjectURL(url);

            console.log(`[Trimestres] Export généré: ${nomFichier}`);
            return { success: true, nomFichier: nomFichier };

        } catch (error) {
            console.error('[Trimestres] Erreur export:', error);
            return { success: false, error: error.message };
        }
    }

    /* ===============================
       MIGRATION DES DONNÉES EXISTANTES
       =============================== */

    /**
     * Force la migration des clés vers le format namespacé
     * Utilisé quand le registre existe mais les clés ne sont pas renommées
     *
     * @param {string} trimestreId - ID du trimestre cible (ex: 'a2025')
     * @returns {Object} Résultat de la migration
     */
    function forcerMigration(trimestreId) {
        console.log(`[Trimestres] Migration forcée vers: ${trimestreId}`);

        let clesMigrees = 0;
        CLES_NAMESPACEES.forEach(nomCle => {
            const valeur = db.getSync(nomCle, null);
            if (valeur !== null) {
                const nouvelleCle = `${trimestreId}_${nomCle}`;
                db.setSync(nouvelleCle, valeur);
                db.removeSync(nomCle);
                clesMigrees++;
                console.log(`  → ${nomCle} → ${nouvelleCle}`);
            }
        });

        console.log(`[Trimestres] Migration forcée terminée: ${clesMigrees} clés migrées`);
        return { success: true, clesMigrees: clesMigrees };
    }

    /**
     * Migre les données existantes vers le format multi-trimestres
     *
     * Cette fonction:
     * 1. Détecte si l'ancien format existe (clés sans préfixe)
     * 2. Lit cadreCalendrier pour déterminer le trimestre
     * 3. Crée l'entrée dans le registre des trimestres
     * 4. Renomme les clés avec le préfixe approprié
     *
     * @returns {Object} Résultat de la migration
     */
    function migrerVersMultiTrimestres() {
        console.log('[Trimestres] Vérification migration multi-trimestres...');

        // Vérifier si des clés non-namespacées existent encore
        const calendrierNonNamespace = db.getSync('calendrierComplet', null);

        // Vérifier si la migration a déjà été effectuée
        const trimestres = obtenirTrimestres();
        if (trimestres.length > 0) {
            // Le registre existe - vérifier si les clés sont migrées
            if (calendrierNonNamespace !== null) {
                // Les clés ne sont pas encore migrées, forcer la migration
                const actif = obtenirTrimestreActif();
                if (actif) {
                    console.log('[Trimestres] Clés non migrées détectées, migration forcée...');
                    return forcerMigration(actif.id);
                }
            }
            console.log('[Trimestres] Migration déjà effectuée');
            return { success: true, alreadyMigrated: true };
        }

        // Vérifier si des données anciennes existent
        const cadreCalendrier = db.getSync('cadreCalendrier', null);
        if (!cadreCalendrier) {
            console.log('[Trimestres] Pas de données à migrer');
            return { success: true, noData: true };
        }

        // Déterminer le trimestre depuis le cadre calendrier
        let session = cadreCalendrier.session || '';
        let annee = cadreCalendrier.annee || '';

        // Si session/année non définies, les déduire de dateDebut
        if (!session || !annee) {
            const dateDebut = cadreCalendrier.dateDebut;
            if (dateDebut) {
                const date = new Date(dateDebut);
                annee = date.getFullYear().toString();
                const mois = date.getMonth() + 1; // 1-12
                session = (mois >= 1 && mois <= 6) ? 'H' : 'A';
            }
        }

        if (!session || !annee) {
            console.error('[Trimestres] Impossible de déterminer le trimestre');
            return { success: false, error: 'Session/année non déterminées' };
        }

        const trimestreId = `${session.toLowerCase()}${annee}`;
        const nomTrimestre = `${session === 'H' ? 'Hiver' : 'Automne'} ${annee}`;

        console.log(`[Trimestres] Migration vers: ${nomTrimestre} (${trimestreId})`);

        // Créer l'entrée dans le registre
        const nouveauTrimestre = {
            id: trimestreId,
            nom: nomTrimestre,
            session: session.toUpperCase(),
            annee: annee,
            dateCreation: new Date().toISOString().split('T')[0],
            actif: true
        };

        db.setSync('trimestres', [nouveauTrimestre]);

        // Renommer les clés existantes avec le préfixe
        let clesMigrees = 0;
        CLES_NAMESPACEES.forEach(nomCle => {
            const valeur = db.getSync(nomCle, null);
            if (valeur !== null) {
                const nouvelleCle = `${trimestreId}_${nomCle}`;
                db.setSync(nouvelleCle, valeur);
                db.removeSync(nomCle);
                clesMigrees++;
                console.log(`  → ${nomCle} → ${nouvelleCle}`);
            }
        });

        console.log(`[Trimestres] Migration terminée: ${clesMigrees} clés migrées`);

        return {
            success: true,
            trimestreId: trimestreId,
            nom: nomTrimestre,
            clesMigrees: clesMigrees
        };
    }

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserModuleTrimestres() {
        console.log('[Trimestres] Initialisation du module multi-trimestres...');

        // Exécuter la migration si nécessaire
        const resultatMigration = migrerVersMultiTrimestres();

        if (resultatMigration.success) {
            const actif = obtenirTrimestreActif();
            if (actif) {
                console.log(`[Trimestres] Trimestre actif: ${actif.nom} (${actif.id})`);
            }
        }

        console.log('[Trimestres] Module initialisé');
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    // Fonctions publiques
    window.obtenirTrimestres = obtenirTrimestres;
    window.obtenirTrimestreActif = obtenirTrimestreActif;
    window.obtenirTrimestreId = obtenirTrimestreId;
    window.cle = cle;
    window.creerTrimestre = creerTrimestre;
    window.changerTrimestreActif = changerTrimestreActif;
    window.forcerMigration = forcerMigration;
    window.migrerVersMultiTrimestres = migrerVersMultiTrimestres;
    window.initialiserModuleTrimestres = initialiserModuleTrimestres;

    // Fonctions d'archivage
    window.archiverTrimestre = archiverTrimestre;
    window.desarchiverTrimestre = desarchiverTrimestre;
    window.estTrimestreArchive = estTrimestreArchive;
    window.exporterTrimestreArchive = exporterTrimestreArchive;
    window.calculerStatistiquesFinales = calculerStatistiquesFinales;

    // Constantes exportées pour debug
    window.CLES_NAMESPACEES = CLES_NAMESPACEES;
    window.CLES_GLOBALES = CLES_GLOBALES;

})();
