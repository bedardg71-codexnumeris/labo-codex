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

        // Mettre à jour le bandeau d'archivage après changement
        mettreAJourBandeauArchive();

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

        // Mettre à jour l'affichage du bandeau d'archivage
        mettreAJourBandeauArchive();
    }

    /* ===============================
       BANDEAU VISUEL ARCHIVAGE
       =============================== */

    /**
     * Met à jour l'affichage du bandeau et le mode lecture seule
     * Appelée au chargement et lors du changement de trimestre
     */
    function mettreAJourBandeauArchive() {
        const bandeau = document.getElementById('bandeau-archive');
        const isArchive = estTrimestreArchive();

        if (bandeau) {
            bandeau.style.display = isArchive ? 'block' : 'none';
        }

        // Ajouter/retirer la classe mode-archive sur le body
        if (isArchive) {
            document.body.classList.add('mode-archive');
            console.log('[Trimestres] Mode archivé activé - Lecture seule');
        } else {
            document.body.classList.remove('mode-archive');
        }

        // Mettre à jour le texte du bandeau avec le nom du trimestre
        if (isArchive && bandeau) {
            const actif = obtenirTrimestreActif();
            const texteElement = bandeau.querySelector('.bandeau-archive-texte');
            if (texteElement && actif) {
                texteElement.innerHTML = `<strong>TRIMESTRE ARCHIVÉ</strong> — ${actif.nom} (lecture seule)`;
            }
        }
    }

    /* ===============================
       EXPORT FORMAT RECHERCHE
       =============================== */

    /**
     * Génère une clé d'anonymisation aléatoire
     * @returns {string} Clé de 32 caractères
     */
    function genererCleAnonymisation() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let cle = '';
        for (let i = 0; i < 32; i++) {
            cle += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return cle;
    }

    /**
     * Anonymise un DA avec une clé secrète (hash SHA-256 tronqué)
     * @param {string} da - Le DA à anonymiser
     * @param {string} cleSecrete - La clé secrète
     * @returns {Promise<string>} ID anonyme (8 caractères hex)
     */
    async function anonymiserDA(da, cleSecrete) {
        const donnee = da + ':' + cleSecrete;
        const encoder = new TextEncoder();
        const data = encoder.encode(donnee);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Exporte les données au format recherche (anonymisé)
     * Produit deux fichiers : données anonymisées + table de correspondance
     *
     * @param {Object} options - Options d'export
     * @returns {Promise<Object>} Résultat de l'export
     */
    async function exporterFormatRecherche(options = {}) {
        console.log('[Export Recherche] Démarrage export format recherche...');

        try {
            // 1. Obtenir ou générer la clé d'anonymisation
            let cleSecrete = options.cleSecrete;
            if (!cleSecrete) {
                cleSecrete = genererCleAnonymisation();
                console.log('[Export Recherche] Nouvelle clé générée');
            }

            // 2. Obtenir le trimestre actif
            const trimestre = obtenirTrimestreActif();
            if (!trimestre) {
                return { success: false, error: 'Aucun trimestre actif' };
            }

            // 3. Collecter les données sources
            const etudiants = db.getSync('groupeEtudiants', []);
            // IMPORTANT: Inclure TOUS les étudiants pour l'anonymisation
            const tousLesEtudiants = etudiants;
            const etudiantsActifs = etudiants.filter(e =>
                e.statut !== 'abandon' && e.statut !== 'décrochage'
            );
            const productions = db.getSync('productions', []);
            const evaluations = db.getSync('evaluationsSauvegardees', []);
            const presences = db.getSync('presences', []);
            const snapshotsRaw = db.getSync('snapshots', []);
            // S'assurer que snapshots est un tableau
            const snapshots = Array.isArray(snapshotsRaw) ? snapshotsRaw : Object.values(snapshotsRaw || {});
            const grilles = db.getSync('grillesTemplates', []);
            const echelles = db.getSync('echellesTemplates', []);
            const modalites = db.getSync('modalitesEvaluation', {});
            const cadreCalendrier = db.getSync(cle('cadreCalendrier'), {});
            const indicesCP = db.getSync('indicesCP', {});
            const cours = db.getSync('listeCours', []);
            const coursActif = cours.find(c => c.actif);

            // 4. Créer la table de correspondance et anonymiser TOUS les étudiants
            const tableCorrespondance = {};
            const daVersAnonyme = {};

            // Anonymiser tous les étudiants (actifs ET inactifs)
            for (const etudiant of tousLesEtudiants) {
                const idAnonyme = await anonymiserDA(etudiant.da, cleSecrete);
                tableCorrespondance[idAnonyme] = etudiant.da;
                daVersAnonyme[etudiant.da] = idAnonyme;
            }

            // Aussi anonymiser les DA présents dans les données mais pas dans la liste
            const dasPresences = [...new Set(presences.map(p => p.da).filter(Boolean))];
            const dasEvaluations = [...new Set(evaluations.map(e => e.etudiantDA).filter(Boolean))];
            const dasSnapshots = [...new Set(snapshots.flatMap(s => (s.etudiants || []).map(e => e.da)).filter(Boolean))];
            const tousLesDAs = [...new Set([...dasPresences, ...dasEvaluations, ...dasSnapshots])];

            for (const da of tousLesDAs) {
                if (!daVersAnonyme[da]) {
                    const idAnonyme = await anonymiserDA(da, cleSecrete);
                    tableCorrespondance[idAnonyme] = da;
                    daVersAnonyme[da] = idAnonyme;
                }
            }

            // 5. Obtenir la grille de référence pour SOLO
            const grilleRefId = modalites.grilleReferenceDepistage;
            const grilleRef = grilles.find(g => g.id === grilleRefId) || grilles[0];

            // 6. Construire le JSON selon les spécifications
            const exportData = {
                meta: {
                    version_monitorage: '6.0.0-beta95',
                    version_format: '1.0',
                    date_export: new Date().toISOString(),
                    trimestre: {
                        id: trimestre.id,
                        nom: trimestre.nom,
                        session: trimestre.session,
                        annee: trimestre.annee
                    },
                    anonymisation: {
                        methode: 'SHA-256 tronqué (8 caractères)',
                        cle_hash: cleSecrete.substring(0, 4) + '****'
                    }
                },

                contexte: {
                    cours: coursActif ? {
                        code: coursActif.sigle || coursActif.id,
                        titre: coursActif.titre || coursActif.nom,
                        groupe: coursActif.groupe
                    } : {},
                    grille_evaluation: grilleRef ? {
                        id: grilleRef.id,
                        nom: grilleRef.nom,
                        echelle: ['I', 'D', 'M', 'E'],
                        seuil_reussite: 'M',
                        criteres: (grilleRef.criteres || []).map(c => ({
                            code: c.id,
                            nom: c.nom,
                            ponderation: c.ponderation,
                            niveau_solo: obtenirNiveauSOLO(c.nom),
                            type: obtenirTypeCritere(c.nom)
                        }))
                    } : {},
                    calendrier: {
                        date_debut: cadreCalendrier.dateDebut || '',
                        date_fin: cadreCalendrier.dateFin || '',
                        session: cadreCalendrier.session || trimestre.session,
                        annee: cadreCalendrier.annee || trimestre.annee
                    },
                    artefacts: productions.filter(p => p.type === 'artefact-portfolio').map(p => ({
                        id: p.id,
                        titre: p.titre || p.nom,
                        type: p.type,
                        date_echeance: p.dateEcheance,
                        semaine: calculerSemaine(p.dateEcheance, cadreCalendrier.dateDebut)
                    }))
                },

                observations: {
                    etudiants: etudiantsActifs.map(e => ({
                        id_anonyme: daVersAnonyme[e.da],
                        statut: e.statut || 'actif',
                        profil: {
                            programme: e.programme || '',
                            services_adaptes: e.servicesAdaptes || false
                        }
                    })),

                    presences: presences
                        .filter(p => daVersAnonyme[p.da]) // Exclure si DA non anonymisable
                        .map(p => ({
                            id_etudiant: daVersAnonyme[p.da],
                            date: p.date,
                            statut: p.statut,
                            duree_cours: p.heures || p.duree || 3,
                            justifie: p.justifie || false,
                            facultatif: p.facultatif || false
                        })),

                    evaluations: evaluations
                        .filter(e => daVersAnonyme[e.etudiantDA]) // Exclure si DA non anonymisable
                        .map(e => ({
                            id_etudiant: daVersAnonyme[e.etudiantDA],
                            id_artefact: e.productionId,
                            date_echeance: obtenirDateEcheance(e.productionId, productions),
                            statut_remise: e.statutRemise,
                            criteres: (e.criteres || []).reduce((acc, c) => {
                                acc[normaliserNomCritere(c.critereNom)] = c.niveauSelectionne;
                                return acc;
                            }, {}),
                            note_finale: e.noteFinale,
                            niveau_final: e.niveauFinal,
                            reprise_de: e.repriseDeId || null,
                            jeton_delai: e.jetonDelaiApplique || false,
                            jeton_reprise: e.jetonRepriseCibleeApplique || false
                        }))
                },

                calculs: {
                    description: 'Indices calculés selon formules Monitorage v6',
                    formules: {
                        indice_A: 'Heures présentes / Heures offertes (cumulatif)',
                        indice_C: '% artefacts évalués >= Maîtrisé (M)',
                        indice_P: 'Moyenne pondérée des N meilleurs artefacts (IDME → %)',
                        engagement: 'A × C × P / 10000'
                    },

                    snapshots_hebdomadaires: snapshots.map(s => ({
                        semaine: s.numSemaine,
                        date: s.dateSeance,
                        indices_par_etudiant: (s.etudiants || [])
                            .filter(e => daVersAnonyme[e.da]) // Exclure si DA non anonymisable
                            .map(e => ({
                                id_etudiant: daVersAnonyme[e.da],
                                A: e.A_cumulatif || e.A,
                                C: e.C,
                                P: e.P,
                                pattern: e.pattern,
                                rai: e.rai
                            }))
                    })),

                    indices_finaux: etudiantsActifs.map(e => {
                        const indices = indicesCP[e.da];
                        const actuel = indices?.actuel?.PAN || indices?.actuel?.SOM || {};
                        return {
                            id_etudiant: daVersAnonyme[e.da],
                            A_final: actuel.A || 0,
                            C_final: actuel.C || 0,
                            P_final: actuel.P || 0,
                            engagement: Math.round((actuel.A || 0) * (actuel.C || 0) * (actuel.P || 0) / 10000)
                        };
                    }),

                    performance_par_critere: calculerPerformanceParCritere(etudiantsActifs, evaluations, daVersAnonyme, grilleRef)
                }
            };

            // 7. Générer et télécharger le fichier anonymisé
            const jsonAnonyme = JSON.stringify(exportData, null, 2);
            const blobAnonyme = new Blob([jsonAnonyme], { type: 'application/json' });
            const urlAnonyme = URL.createObjectURL(blobAnonyme);

            const dateStr = new Date().toISOString().split('T')[0];
            const lienAnonyme = document.createElement('a');
            lienAnonyme.href = urlAnonyme;
            lienAnonyme.download = `monitorage_${trimestre.id}_anonyme_${dateStr}.json`;
            lienAnonyme.click();
            URL.revokeObjectURL(urlAnonyme);

            // 8. Sauvegarder la table de correspondance localement (PRIVÉ)
            const tablePrivee = {
                cle_secrete: cleSecrete,
                date_generation: new Date().toISOString(),
                trimestre: trimestre.id,
                correspondances: tableCorrespondance
            };
            db.setSync(`tableCorrespondance_${trimestre.id}`, tablePrivee);

            // 9. Télécharger aussi la table de correspondance (fichier séparé)
            const jsonTable = JSON.stringify(tablePrivee, null, 2);
            const blobTable = new Blob([jsonTable], { type: 'application/json' });
            const urlTable = URL.createObjectURL(blobTable);

            const lienTable = document.createElement('a');
            lienTable.href = urlTable;
            lienTable.download = `table_correspondance_${trimestre.id}_PRIVE_${dateStr}.json`;

            // Délai pour que le premier téléchargement se lance
            setTimeout(() => {
                lienTable.click();
                URL.revokeObjectURL(urlTable);
            }, 500);

            console.log('[Export Recherche] Export terminé avec succès');
            console.log(`[Export Recherche] ${etudiantsActifs.length} étudiants anonymisés`);
            console.log(`[Export Recherche] ${evaluations.length} évaluations exportées`);
            console.log(`[Export Recherche] ${presences.length} présences exportées`);
            console.log(`[Export Recherche] ${snapshots.length} snapshots exportés`);

            return {
                success: true,
                nbEtudiants: etudiantsActifs.length,
                nbEvaluations: evaluations.length,
                nbPresences: presences.length,
                nbSnapshots: snapshots.length
            };

        } catch (error) {
            console.error('[Export Recherche] Erreur:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtient le niveau SOLO associé à un critère
     * @param {string} nomCritere - Nom du critère
     * @returns {string} Niveau SOLO
     */
    function obtenirNiveauSOLO(nomCritere) {
        const nom = nomCritere.toLowerCase();
        // Critères fondamentaux (multistructurel)
        if (nom.includes('structure') || nom.includes('rigueur') || nom.includes('français')) {
            return 'multistructural';
        }
        // Critère transitionnel (relationnel)
        if (nom.includes('plausibilité') || nom.includes('plausibilite')) {
            return 'relational';
        }
        // Critère complexe (abstrait étendu)
        if (nom.includes('nuance')) {
            return 'extended_abstract';
        }
        return 'multistructural'; // Par défaut
    }

    /**
     * Obtient le type d'un critère (fondamental, transitionnel, complexe)
     * @param {string} nomCritere - Nom du critère
     * @returns {string} Type du critère
     */
    function obtenirTypeCritere(nomCritere) {
        const nom = nomCritere.toLowerCase();
        if (nom.includes('structure') || nom.includes('rigueur') || nom.includes('français')) {
            return 'fondamental';
        }
        if (nom.includes('plausibilité') || nom.includes('plausibilite')) {
            return 'transitionnel';
        }
        if (nom.includes('nuance')) {
            return 'complexe';
        }
        return 'fondamental';
    }

    /**
     * Calcule le numéro de semaine à partir d'une date
     * @param {string} dateStr - Date au format YYYY-MM-DD
     * @param {string} dateDebut - Date de début du trimestre
     * @returns {number} Numéro de semaine
     */
    function calculerSemaine(dateStr, dateDebut) {
        if (!dateStr || !dateDebut) return 0;
        const date = new Date(dateStr);
        const debut = new Date(dateDebut);
        const diff = date - debut;
        return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    }

    /**
     * Obtient la date d'échéance d'une production
     * @param {string} productionId - ID de la production
     * @param {Array} productions - Liste des productions
     * @returns {string} Date d'échéance
     */
    function obtenirDateEcheance(productionId, productions) {
        const prod = productions.find(p => p.id === productionId);
        return prod ? prod.dateEcheance : null;
    }

    /**
     * Normalise le nom d'un critère (minuscules, sans accents)
     * @param {string} nom - Nom du critère
     * @returns {string} Nom normalisé
     */
    function normaliserNomCritere(nom) {
        if (!nom) return '';
        return nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');
    }

    /**
     * Calcule la performance agrégée par critère pour chaque étudiant
     * @param {Array} etudiants - Liste des étudiants
     * @param {Array} evaluations - Liste des évaluations
     * @param {Object} daVersAnonyme - Table de correspondance DA → ID anonyme
     * @param {Object} grilleRef - Grille de référence
     * @returns {Array} Performance par critère par étudiant
     */
    function calculerPerformanceParCritere(etudiants, evaluations, daVersAnonyme, grilleRef) {
        const niveauVersScore = { 'I': 0, 'D': 1, 'M': 2, 'E': 3 };

        return etudiants.map(etudiant => {
            const evalEtudiant = evaluations.filter(e => e.etudiantDA === etudiant.da);
            const perfCriteres = {};

            if (grilleRef && grilleRef.criteres) {
                grilleRef.criteres.forEach(critere => {
                    const nomNorm = normaliserNomCritere(critere.nom);
                    const evaluationsCritere = [];

                    evalEtudiant.forEach(ev => {
                        const c = (ev.criteres || []).find(c =>
                            normaliserNomCritere(c.critereNom) === nomNorm
                        );
                        if (c && c.niveauSelectionne) {
                            evaluationsCritere.push(c.niveauSelectionne);
                        }
                    });

                    if (evaluationsCritere.length > 0) {
                        const nbI = evaluationsCritere.filter(n => n === 'I').length;
                        const nbD = evaluationsCritere.filter(n => n === 'D').length;
                        const nbM = evaluationsCritere.filter(n => n === 'M').length;
                        const nbE = evaluationsCritere.filter(n => n === 'E').length;
                        const total = evaluationsCritere.length;

                        perfCriteres[nomNorm] = {
                            nb_evaluations: total,
                            nb_I: nbI,
                            nb_D: nbD,
                            nb_M: nbM,
                            nb_E: nbE,
                            taux_maitrise: Math.round((nbM + nbE) / total * 100) / 100
                        };
                    }
                });
            }

            return {
                id_etudiant: daVersAnonyme[etudiant.da],
                ...perfCriteres
            };
        }).filter(p => p.id_etudiant);
    }

    /**
     * Lance l'export recherche depuis l'interface utilisateur
     * Affiche le résultat dans la zone dédiée
     */
    async function lancerExportRecherche() {
        const resultatDiv = document.getElementById('resultat-export-recherche');
        if (resultatDiv) {
            resultatDiv.style.display = 'block';
            resultatDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
                    <p>Génération de l'export en cours...</p>
                </div>
            `;
        }

        try {
            const result = await exporterFormatRecherche();

            if (result.success) {
                if (resultatDiv) {
                    resultatDiv.innerHTML = `
                        <div class="alerte-succes" style="text-align: left;">
                            <strong>Export généré avec succès</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>${result.nbEtudiants} étudiants anonymisés</li>
                                <li>${result.nbEvaluations} évaluations exportées</li>
                                <li>${result.nbPresences} présences exportées</li>
                                <li>${result.nbSnapshots} snapshots exportés</li>
                            </ul>
                            <p style="margin-top: 15px; font-size: 0.85rem; color: var(--gris-moyen);">
                                Deux fichiers ont été téléchargés. Conservez la table de correspondance en lieu sûr.
                            </p>
                        </div>
                    `;
                }
            } else {
                if (resultatDiv) {
                    resultatDiv.innerHTML = `
                        <div class="alerte-erreur">
                            <strong>Erreur lors de l'export</strong><br>
                            ${result.error || 'Une erreur inattendue s\'est produite.'}
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('[Export Recherche] Erreur:', error);
            if (resultatDiv) {
                resultatDiv.innerHTML = `
                    <div class="alerte-erreur">
                        <strong>Erreur lors de l'export</strong><br>
                        ${error.message}
                    </div>
                `;
            }
        }
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
    window.mettreAJourBandeauArchive = mettreAJourBandeauArchive;

    // Fonctions d'export recherche
    window.exporterFormatRecherche = exporterFormatRecherche;
    window.genererCleAnonymisation = genererCleAnonymisation;
    window.lancerExportRecherche = lancerExportRecherche;

    // Constantes exportées pour debug
    window.CLES_NAMESPACEES = CLES_NAMESPACEES;
    window.CLES_GLOBALES = CLES_GLOBALES;

})();
