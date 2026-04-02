/* ===============================
   MODULE: TRIMESTRES (Beta 95)
   Gestion multi-trimestres avec namespacing

   Ce module gère le registre des trimestres et le namespacing
   des clés localStorage/IndexedDB pour isoler les données
   de chaque trimestre (A2025, H2026, etc.)

   ÉCRITURES pratiquesConfigurables : copie namespacée lors de l'archivage de trimestre

   IMPORTANT: Ce module NE REMPLACE PAS trimestre.js ni trimestre-v2.js
   Il s'ajoute PAR-DESSUS pour permettre la gestion de plusieurs trimestres.
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    // Clés qui doivent être namespacées par trimestre
    // ✅ CORRECTION (31 déc 2025): Ajouter groupeEtudiants, productions, presences, evaluationsSauvegardees
    // pour que le mode démo fonctionne correctement (données isolées par trimestre)
    const CLES_NAMESPACEES = [
        'calendrierComplet',
        'cadreCalendrier',
        'evenementsPrevus',
        'evenementsImprevus',
        'seancesCompletes',
        'horaireHebdo',
        'interventions',
        'indicesAssiduite',
        'indicesCP',
        'snapshots',
        // ✅ Clés liées aux données étudiants (critiques pour le mode démo)
        'groupeEtudiants',
        'productions',
        'presences',
        'evaluationsSauvegardees',
        // ✅ FIX (21 jan 2026) : Ajouter groupesCours et horaires pour cohérence
        // Ces clés étaient utilisées avec namespacing direct (${trimestre}_xxx)
        // mais cle() ne les reconnaissait pas, causant le bug A2025/Démo
        'groupesCours',
        'horaires',
        // 🆕 BETA 96.3 : Module Travaux
        'fichiersTravaux',
        'annotationsTravaux',
        'archivesBundles',
        // 🆕 FIX #69 (6 fév 2026) : Clés manquantes identifiées par audit
        'portfoliosEleves',
        'indicesEvaluation',
        'indicesPatternsRaI',
        'horaireSelectionne',
        'seancesHoraire',
        // 🆕 FIX (17 fév 2026) : Carte mentale doit être namespacée pour le mode démo
        'planification_mindmap',
        // 🆕 Corbeille fichiers travaux (4 mars 2026)
        'corbeilleFichiers'
    ];

    // Clés globales (partagées entre trimestres)
    // Ces clés ne sont JAMAIS préfixées (sauf si archivées)
    const CLES_GLOBALES = [
        'trimestres',
        'grillesTemplates',
        'echellesTemplates',
        'pratiquesConfigurables',
        'modalitesEvaluation',
        'modeApplication',
        'etatsAccordeonsV2',
        'cours',       // Bibliothèque de cours partagée (clé canonique, remplace listeCours)
        'listeCours'   // Legacy — migré vers 'cours' au chargement, conservé pour rétrocompatibilité
    ];

    // ✅ AJOUT (28 janvier 2026) : Templates à copier lors de l'archivage
    // Ces templates globaux sont copiés vers des clés namespacées pour isoler les archives
    const CLES_TEMPLATES_ARCHIVES = [
        'grillesTemplates',
        'echellesTemplates',
        'pratiquesConfigurables'
    ];

    /* ===============================
       REGISTRE DES TRIMESTRES
       =============================== */

    /**
     * Obtient la liste de tous les trimestres
     * 🆕 FIX (23 jan 2026): Nettoie automatiquement les doublons
     * @returns {Array} Liste des trimestres (sans doublons)
     */
    function obtenirTrimestres() {
        let trimestres = db.getSync('trimestres', []);

        // 🆕 FIX (23 jan 2026): Détecter et corriger les doublons
        const idsVus = new Set();
        const nomsVus = new Set();
        let aDesDoublons = false;

        trimestres.forEach(t => {
            if (idsVus.has(t.id) || (t.nom && nomsVus.has(t.nom))) {
                aDesDoublons = true;
            }
            idsVus.add(t.id);
            if (t.nom) nomsVus.add(t.nom);
        });

        if (aDesDoublons) {
            console.warn('[Trimestres] ⚠️ Doublons détectés, nettoyage...');
            // Garder le premier de chaque ID (priorité à l'ID)
            const trimestresUniques = [];
            const idsGardes = new Set();

            trimestres.forEach(t => {
                if (!idsGardes.has(t.id)) {
                    idsGardes.add(t.id);
                    trimestresUniques.push(t);
                } else {
                }
            });

            // Sauvegarder la liste nettoyée
            db.setSync('trimestres', trimestresUniques);

            return trimestresUniques;
        }

        return trimestres;
    }

    /**
     * Obtient le trimestre actuellement actif
     * @returns {Object|null} Le trimestre actif ou null
     */
    function obtenirTrimestreActif() {
        const trimestres = obtenirTrimestres();
        const actifs = trimestres.filter(t => t.actif === true);

        // 🆕 FIX (9 jan 2026): Si plusieurs trimestres sont actifs, corriger
        if (actifs.length > 1) {
            console.warn(`[Trimestres] ⚠️ ${actifs.length} trimestres actifs détectés, correction...`);
            corrigerTrimestresMultiplesActifs(trimestres);
            // Relire après correction
            return trimestres.find(t => t.actif === true) || null;
        }

        return actifs[0] || null;
    }

    /**
     * Corrige les données quand plusieurs trimestres ont actif=true
     * Garde le trimestre le plus approprié selon la date actuelle
     * 🆕 FIX (9 jan 2026)
     */
    function corrigerTrimestresMultiplesActifs(trimestres) {
        const maintenant = new Date();
        const moisActuel = maintenant.getMonth() + 1; // 1-12
        const anneeActuelle = maintenant.getFullYear();

        // Déterminer quel trimestre devrait être actif
        // Hiver (H) = janvier-juin, Automne (A) = août-décembre
        const sessionAttendue = (moisActuel >= 1 && moisActuel <= 6) ? 'H' : 'A';
        const idAttendu = `${sessionAttendue.toLowerCase()}${anneeActuelle}`;

        // Chercher ce trimestre
        let trimestreAGarder = trimestres.find(t => t.id === idAttendu);

        // Si pas trouvé, prendre le plus récent (par année puis session H > A)
        if (!trimestreAGarder) {
            const tries = trimestres
                .filter(t => t.id !== 'demo')
                .sort((a, b) => {
                    // Trier par année décroissante, puis H avant A
                    if (b.annee !== a.annee) return b.annee - a.annee;
                    return (b.session === 'H' ? 1 : 0) - (a.session === 'H' ? 1 : 0);
                });
            trimestreAGarder = tries[0];
        }

        if (trimestreAGarder) {
            // Désactiver tous, activer le bon
            trimestres.forEach(t => t.actif = false);
            trimestreAGarder.actif = true;
            db.setSync('trimestres', trimestres);
        }
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
        // Obtenir l'ID du trimestre actif
        const trimestreId = obtenirTrimestreId();

        // ✅ AJOUT (28 janvier 2026) : Si trimestre archivé et template global,
        // utiliser la copie archivée si elle existe
        if (trimestreId && estTrimestreArchive()) {
            // Cas 1: Template global (grilles, échelles, pratiques)
            if (CLES_TEMPLATES_ARCHIVES.includes(nomCle)) {
                const cleArchivee = `${trimestreId}_${nomCle}`;
                // Vérifier si la copie archivée existe
                if (db.getSync(cleArchivee, null) !== null) {
                    return cleArchivee;
                }
                // Fallback vers la clé globale si pas de copie (rétrocompatibilité)
            }

            // Cas 2: Cartouches (format cartouches_{grilleId})
            if (nomCle.startsWith('cartouches_')) {
                const cleArchivee = `${trimestreId}_${nomCle}`;
                if (db.getSync(cleArchivee, null) !== null) {
                    return cleArchivee;
                }
                // Fallback vers la clé globale
            }
        }

        // Vérifier si c'est une clé globale (jamais namespacée sauf archive)
        if (CLES_GLOBALES.includes(nomCle) || nomCle.startsWith('cartouches_')) {
            return nomCle;
        }

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

        // 🆕 FIX (21 jan 2026): Mettre à jour window.trimestreActif
        // Corrige le bug où les données A2025/Démo n'étaient pas accessibles
        // car les modules lisaient l'ancienne valeur de window.trimestreActif
        window.trimestreActif = id;

        // Réinitialiser le cours actif — chargerDropdownCoursV2() re-sélectionnera le premier cours
        db.setSync('infoCours', null);
        db.setSync('groupeCoursActif', null);

        // 🆕 FIX (21 jan 2026): Créer groupe-cours demo si nécessaire
        // Corrige le bug où les données demo n'étaient pas affichables
        // car le groupe-cours n'existait pas (données chargées avant la correction)
        if (id === 'demo') {
            creerGroupeCoursDemoSiNecessaire();
        }

        // Mettre à jour le bandeau d'archivage après changement
        mettreAJourBandeauArchive();

        // Régénérer le calendrier complet pour le nouveau trimestre
        if (typeof genererCalendrierComplet === 'function') {
            try {
                genererCalendrierComplet();
            } catch (e) {
                console.warn('[Trimestres] Erreur régénération calendrier:', e);
            }
        }

        return true;
    }

    /**
     * Crée le groupe-cours demo si nécessaire
     * 🆕 FIX (21 jan 2026) : Appelée quand on change vers le trimestre demo
     * Corrige le bug où les données demo n'avaient pas de groupe-cours
     */
    function creerGroupeCoursDemoSiNecessaire() {

        // Vérifier si le groupe-cours demo existe
        const cleGC = cle('groupesCours');
        let groupesCours = db.getSync(cleGC, []);
        const gcDemo = groupesCours.find(gc => gc.id === 'GC_DEMO');

        if (gcDemo) {
            return;
        }

        // Créer l'horaire demo si nécessaire
        const cleHoraires = cle('horaires');
        let horaires = db.getSync(cleHoraires, []);
        if (!horaires.find(h => h.id === 'HOR_DEMO')) {
            const nouvelHoraire = {
                id: 'HOR_DEMO',
                nom: 'Lun-AM / Mer-PM',
                periodesParSeance: 2,
                seances: [
                    { jour: 'lundi', periode: 'AM' },
                    { jour: 'mercredi', periode: 'PM' }
                ],
                isDemo: true,
                dateCreation: new Date().toISOString()
            };
            horaires.push(nouvelHoraire);
            db.setSync(cleHoraires, horaires);
        }

        // Récupérer le cours demo depuis listeCours
        const listeCours = db.getSync('listeCours', []);
        const coursDemo = listeCours.find(c => c.isDemo || c.id?.includes('9999'));
        const coursId = coursDemo?.id || '601-101-h2026-9999';
        const groupeNum = coursDemo?.groupe || '9999';
        const sigle = coursDemo?.sigle || '601-101';

        // Créer le groupe-cours demo
        const nouveauGC = {
            id: 'GC_DEMO',
            nom: `DEMO-${sigle}-MQ-${String(groupeNum).padStart(5, '0')} (Lun-AM / Mer-PM)`,
            trimestreId: 'demo',
            coursId: coursId,
            groupeNum: groupeNum,
            horaireId: 'HOR_DEMO',
            enseignantId: 'profil',
            pratiqueId: null,
            dateCreation: new Date().toISOString(),
            actif: true,
            isDemo: true
        };
        groupesCours.push(nouveauGC);
        db.setSync(cleGC, groupesCours);
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

        // 🆕 BETA 96: Créer des snapshots des ressources
        const snapshotResult = creerSnapshotRessources(id);

        // Marquer comme archivé
        trimestre.archive = true;
        trimestre.dateFin = new Date().toISOString().split('T')[0];
        trimestre.statistiquesFinales = stats;
        trimestre.snapshotRessources = snapshotResult.success ? snapshotResult.cleSnapshot : null;

        db.setSync('trimestres', trimestres);

        // Générer export automatique
        const exportResult = exporterTrimestreArchive(id);

        return {
            success: true,
            trimestre: trimestre,
            statistiques: stats,
            snapshotRessources: snapshotResult,
            exportGenere: exportResult.success
        };
    }

    /**
     * ✅ AJOUT (28 janvier 2026) : Identifie les templates utilisés par un trimestre
     * Analyse les productions pour trouver les grilles, échelles et pratiques référencées
     *
     * @param {string} trimestreId - ID du trimestre
     * @returns {Object} IDs des templates utilisés {grilleIds, echelleIds, pratiqueIds}
     */
    function identifierTemplatesUtilises(trimestreId) {
        // Récupérer les productions du trimestre
        const productions = db.getSync(`${trimestreId}_productions`, [])
            || db.getSync(`${trimestreId}_productionsPedagogiques`, [])
            || [];

        // Collecter les IDs des grilles utilisées
        const grilleIds = new Set();
        productions.forEach(p => {
            if (p.grilleId) grilleIds.add(p.grilleId);
        });

        // Collecter les IDs des échelles utilisées (via les grilles ou directement)
        const echelleIds = new Set();
        const grilles = db.getSync('grillesTemplates', []);
        grilles.forEach(g => {
            if (grilleIds.has(g.id) && g.echelleId) {
                echelleIds.add(g.echelleId);
            }
        });
        productions.forEach(p => {
            if (p.echelleId) echelleIds.add(p.echelleId);
        });

        // Collecter les IDs des pratiques utilisées
        const pratiqueIds = new Set();
        productions.forEach(p => {
            if (p.pratiqueId) pratiqueIds.add(p.pratiqueId);
        });

        // Récupérer aussi les modalités d'évaluation du trimestre
        const modalites = db.getSync(`${trimestreId}_modalitesEvaluation`, null)
            || db.getSync('modalitesEvaluation', null);
        if (modalites && modalites.pratiqueId) {
            pratiqueIds.add(modalites.pratiqueId);
        }

        return { grilleIds, echelleIds, pratiqueIds };
    }

    /**
     * Crée un snapshot (copie) des ressources pédagogiques pour un trimestre
     * 🆕 BETA 96 - Modifié (28 jan 2026) pour copier vers des clés namespacées
     *
     * Cette fonction copie les templates UTILISÉS vers des clés namespacées
     * pour isoler les archives du trimestre actif.
     *
     * @param {string} trimestreId - ID du trimestre
     * @returns {Object} Résultat avec cleSnapshot si succès
     */
    function creerSnapshotRessources(trimestreId) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const cleSnapshot = `snapshot_${trimestreId}_${timestamp}`;

            // ✅ AJOUT (28 jan 2026) : Identifier les templates utilisés
            const { grilleIds, echelleIds, pratiqueIds } = identifierTemplatesUtilises(trimestreId);

            // Récupérer tous les templates globaux
            const toutesGrilles = db.getSync('grillesTemplates', []);
            const toutesEchelles = db.getSync('echellesTemplates', []);
            const toutesPratiques = db.getSync('pratiquesConfigurables', []);

            // Filtrer pour ne garder que les utilisés
            const grillesUtilisees = toutesGrilles.filter(g => grilleIds.has(g.id));
            const echellesUtilisees = toutesEchelles.filter(e => echelleIds.has(e.id));
            const pratiquesUtilisees = toutesPratiques.filter(p => pratiqueIds.has(p.id));

            // ✅ AJOUT (28 jan 2026) : Copier vers des clés namespacées pour l'archivage
            // Ces copies seront utilisées quand le trimestre est en mode archive
            db.setSync(`${trimestreId}_grillesTemplates`, grillesUtilisees);
            db.setSync(`${trimestreId}_echellesTemplates`, echellesUtilisees);
            db.setSync(`${trimestreId}_pratiquesConfigurables`, pratiquesUtilisees);

            // ✅ AJOUT (28 jan 2026) : Copier les cartouches des grilles utilisées
            let nbCartouchesCopies = 0;
            grilleIds.forEach(grilleId => {
                const cartouches = db.getSync(`cartouches_${grilleId}`, []);
                if (cartouches.length > 0) {
                    db.setSync(`${trimestreId}_cartouches_${grilleId}`, cartouches);
                    nbCartouchesCopies += cartouches.length;
                }
            });

            // Ressources pour le snapshot (backup complet)
            const ressources = {
                productions: db.getSync(`${trimestreId}_productions`) || db.getSync('productions', []),
                grilles: grillesUtilisees,
                echelles: echellesUtilisees,
                pratiques: pratiquesUtilisees,
                cartouches: nbCartouchesCopies,
                _meta: {
                    trimestreId: trimestreId,
                    dateCreation: new Date().toISOString(),
                    version: 'Beta 96',
                    isolationArchive: true
                }
            };

            // Sauvegarder le snapshot (backup)
            db.setSync(cleSnapshot, ressources);

            return {
                success: true,
                cleSnapshot: cleSnapshot,
                resume: {
                    productions: ressources.productions.length,
                    grilles: grillesUtilisees.length,
                    echelles: echellesUtilisees.length,
                    pratiques: pratiquesUtilisees.length,
                    cartouches: nbCartouchesCopies
                }
            };
        } catch (error) {
            console.error('[Trimestres] Erreur création snapshot:', error);
            return { success: false, error: error.message };
        }
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

            // Statistiques globales - lire directement depuis le trimestre ciblé
            const etudiants = db.getSync(`${trimestreId}_groupeEtudiants`, []);
            const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));

            // Indices d'engagement - lire depuis le trimestre ciblé
            const indicesCP = db.getSync(`${trimestreId}_indicesCP`, {});
            let totalEngagement = 0;
            let nbAvecIndices = 0;

            etudiantsActifs.forEach(e => {
                const indices = indicesCP[e.da];
                if (indices && indices.actuel) {
                    const a = indices.actuel.A || 0;
                    const c = indices.actuel.C || 0;
                    const p = indices.actuel.P || 0;
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

            // ✅ NAMESPACING (Beta 95.5) - obtenirDonneesSelonMode filtre deja par coursId
            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
            exportData.donnees.etudiants = etudiants.filter(e => coursIds.includes(e.coursId));

            const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
            exportData.donnees.evaluations = evaluations.filter(e => coursIds.includes(e.coursId));

            const presences = obtenirDonneesSelonMode('presences');
            exportData.donnees.presences = presences.filter(p => coursIds.includes(p.coursId));

            const snapshots = db.getSync(cle('snapshots'), { hebdomadaires: [], interventions: [] });
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

        let clesMigrees = 0;
        CLES_NAMESPACEES.forEach(nomCle => {
            const valeur = db.getSync(nomCle, null);
            if (valeur !== null) {
                const nouvelleCle = `${trimestreId}_${nomCle}`;
                db.setSync(nouvelleCle, valeur);
                db.removeSync(nomCle);
                clesMigrees++;
            }
        });

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
                    return forcerMigration(actif.id);
                }
            }
            return { success: true, alreadyMigrated: true };
        }

        // Vérifier si des données anciennes existent
        const cadreCalendrier = db.getSync('cadreCalendrier', null);
        if (!cadreCalendrier) {
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
            }
        });

        return {
            success: true,
            trimestreId: trimestreId,
            nom: nomTrimestre,
            clesMigrees: clesMigrees
        };
    }

    /**
     * Migration ponctuelle : clés non namespacées vers A2025
     * Les anciennes données non namespacées datent de A2025
     */
    function migrerClesVersA2025() {
        // Liste des clés à migrer vers a2025_*
        // ✅ CORRECTION (31 déc 2025): Ajouter TOUTES les clés namespacées manquantes
        const clesAMigrer = [
            // Données étudiants et évaluations (critiques!)
            'groupeEtudiants',
            'productions',
            'presences',
            'evaluationsSauvegardees',
            // Calendrier et horaire
            'calendrierComplet',
            'cadreCalendrier',
            'horaireHebdo',
            'seancesCompletes',
            'evenementsPrevus',
            'evenementsImprevus',
            // Indices et snapshots (existants)
            'interventions',
            'indicesAssiduite',
            'indicesCP',
            'snapshots'
        ];
        let clesMigrees = 0;

        clesAMigrer.forEach(nomCle => {
            const donneesAnciennes = db.getSync(nomCle, null);

            // Si des données existent dans l'ancienne clé
            if (donneesAnciennes !== null) {
                // Vérifier que ce n'est pas vide
                const estVide = Array.isArray(donneesAnciennes)
                    ? donneesAnciennes.length === 0
                    : (typeof donneesAnciennes === 'object' && Object.keys(donneesAnciennes).length === 0);

                if (!estVide) {
                    const cleA2025 = `a2025_${nomCle}`;
                    const existantes = db.getSync(cleA2025, null);

                    // Ne migrer que si la clé a2025_* n'existe pas déjà
                    if (existantes === null) {
                        db.setSync(cleA2025, donneesAnciennes);
                        clesMigrees++;
                    }

                    // ⚠️ NE PAS supprimer l'ancienne clé pour l'instant
                    // Les modules qui lisent directement sans cle() en ont besoin
                    // db.removeSync(nomCle);
                }
            }
        });

        if (clesMigrees > 0) {
        }
    }

    /**
     * Migre les horaires et groupesCours vers le trimestre actif
     * 🆕 FIX (21 jan 2026) : Ces clés ont été ajoutées à CLES_NAMESPACEES
     * mais les données existantes étaient stockées sans préfixe
     */
    function migrerHorairesEtGroupesCours() {
        const trimestreActif = obtenirTrimestreActif();
        if (!trimestreActif) return;

        const prefixe = trimestreActif.id + '_';
        const clesAMigrer = ['horaires', 'groupesCours'];
        let clesMigrees = 0;

        clesAMigrer.forEach(nomCle => {
            const donneesAnciennes = db.getSync(nomCle, null);

            // Si des données existent dans l'ancienne clé (sans préfixe)
            if (donneesAnciennes !== null && Array.isArray(donneesAnciennes) && donneesAnciennes.length > 0) {
                const cleNouvelle = prefixe + nomCle;
                const existantes = db.getSync(cleNouvelle, null);

                // Ne migrer que si la clé namespacée n'existe pas ou est vide
                if (existantes === null || (Array.isArray(existantes) && existantes.length === 0)) {
                    db.setSync(cleNouvelle, donneesAnciennes);
                    clesMigrees++;
                }
            }
        });

        if (clesMigrees > 0) {
        }
    }

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserModuleTrimestres() {

        // Exécuter la migration si nécessaire
        const resultatMigration = migrerVersMultiTrimestres();

        // Migration ponctuelle des clés vers A2025
        migrerClesVersA2025();

        // 🆕 FIX (21 jan 2026) : Migration horaires et groupesCours vers trimestre actif
        migrerHorairesEtGroupesCours();

        if (resultatMigration.success) {
            const actif = obtenirTrimestreActif();
            if (actif) {
            }
        }

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
            toggleDisplay(bandeau, isArchive);
            // Restaurer la couleur par défaut
            bandeau.style.background = 'var(--bleu-clair, #065dbb)';
        }

        // Réinitialiser le mode écriture temporaire
        document.body.classList.remove('mode-ecriture-temp');
        const checkboxEcriture = document.getElementById('checkbox-ecriture-temp');
        if (checkboxEcriture) {
            checkboxEcriture.checked = false;
        }

        // ✅ CORRIGÉ (29 déc 2025): Par défaut = mode normal (vrais noms visibles)
        // L'utilisateur peut activer l'anonymisation au besoin via la checkbox
        const checkboxAnonyme = document.getElementById('checkbox-anonymiser-archive');
        const modeActuel = db.getSync('modeApplication', 'normal');

        // Toujours décocher la checkbox par défaut
        if (checkboxAnonyme) {
            checkboxAnonyme.checked = false;
        }

        // Si on était en mode anonymisation, revenir en mode normal
        if (modeActuel === 'anonymisation' && typeof window.changerMode === 'function') {
            window.changerMode('normal');
        }

        // Ajouter/retirer la classe mode-archive sur le body
        if (isArchive) {
            document.body.classList.add('mode-archive');
            // Masquer le bandeau-mode car on a déjà le bandeau archive
            const bandeauMode = document.getElementById('bandeau-mode');
            if (bandeauMode) {
                bandeauMode.classList.add('u-hide');
            }
        } else {
            document.body.classList.remove('mode-archive');
        }

        // Mettre à jour le texte du bandeau avec le nom du trimestre
        if (isArchive && bandeau) {
            const actif = obtenirTrimestreActif();
            const texteElement = bandeau.querySelector('.bandeau-archive-texte');
            if (texteElement && actif) {
                texteElement.innerHTML = `<strong>LECTURE SEULE</strong> — ${echapperHtml(actif.nom)}`;
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
        const valeurs = new Uint32Array(32);
        crypto.getRandomValues(valeurs);
        let cle = '';
        for (let i = 0; i < 32; i++) {
            cle += caracteres.charAt(valeurs[i] % caracteres.length);
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

        try {
            // 1. Obtenir ou générer la clé d'anonymisation
            let cleSecrete = options.cleSecrete;
            if (!cleSecrete) {
                cleSecrete = genererCleAnonymisation();
            }

            // 2. Collecter les données sources
            // ✅ NAMESPACING (Beta 95.5)
            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
            // IMPORTANT: Inclure TOUS les étudiants pour l'anonymisation (du trimestre actif)
            const tousLesEtudiants = etudiants;
            const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));
            const productions = obtenirDonneesSelonMode('productions');
            const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
            const presences = obtenirDonneesSelonMode('presences');
            const snapshotsRaw = db.getSync(cle('snapshots'), { hebdomadaires: [], interventions: [] });
            // Les snapshots sont stockés comme { hebdomadaires: [...], interventions: [...], metadata: {...} }
            // On exporte les snapshots hebdomadaires
            const snapshots = snapshotsRaw.hebdomadaires || [];
            const grilles = db.getSync('grillesTemplates', []);
            const echelles = db.getSync('echellesTemplates', []);
            const modalites = db.getSync('modalitesEvaluation', {});
            const indicesCP = db.getSync(cle('indicesCP'), {});
            const cours = db.getSync('listeCours', []);
            const coursActif = cours.find(c => c.actif);

            // 3. Déterminer le trimestre à partir du cours actif (où sont les données)
            // Plutôt que d'utiliser le trimestre marqué "actif", on utilise celui du cours
            const trimestres = db.getSync('trimestres', []);
            let trimestre = null;

            if (coursActif && coursActif.trimestreId) {
                // Utiliser le trimestre du cours actif
                trimestre = trimestres.find(t => t.id === coursActif.trimestreId);
            }

            if (!trimestre) {
                // Fallback : utiliser le trimestre marqué actif
                trimestre = trimestres.find(t => t.actif);
            }

            if (!trimestre && trimestres.length > 0) {
                // Dernier fallback : premier trimestre disponible
                trimestre = trimestres[0];
            }

            if (!trimestre) {
                return { success: false, error: 'Aucun trimestre trouvé' };
            }

            // Obtenir le cadreCalendrier du bon trimestre
            const cadreCalendrier = db.getSync(trimestre.id + '_cadreCalendrier', {})
                                 || db.getSync('cadreCalendrier', {});

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
                    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
                    artefacts: productions.filter(p => p.type === 'artefact-portfolio').map(p => {
                        const dateEchTrim = (typeof obtenirEcheanceEffective === 'function')
                            ? obtenirEcheanceEffective(p, null).date : p.dateEcheance;
                        return {
                            id: p.id,
                            titre: p.titre || p.nom,
                            type: p.type,
                            date_echeance: dateEchTrim,
                            semaine: calculerSemaine(dateEchTrim, cadreCalendrier.dateDebut)
                        };
                    })
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
        if (!prod) return null;
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
        if (typeof obtenirEcheanceEffective === 'function') {
            const infoC = db.getSync('infoCours', null);
            const gcId = infoC ? (infoC._groupeCoursId || infoC.id || null) : null;
            return obtenirEcheanceEffective(prod, gcId).date;
        }
        return prod.dateEcheance || null;
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
     * Affiche le résultat dans un modal
     */
    async function lancerExportRecherche() {
        // Afficher modal de chargement
        afficherModalExportRecherche('loading');

        try {
            const result = await exporterFormatRecherche();

            if (result.success) {
                afficherModalExportRecherche('success', result);
            } else {
                afficherModalExportRecherche('error', { message: result.error || 'Une erreur inattendue s\'est produite.' });
            }
        } catch (error) {
            console.error('[Export Recherche] Erreur:', error);
            afficherModalExportRecherche('error', { message: error.message });
        }
    }

    /**
     * Affiche le modal de résultat d'export recherche
     * @param {string} etat - 'loading', 'success', 'error'
     * @param {Object} data - Données à afficher
     */
    function afficherModalExportRecherche(etat, data = {}) {
        // Supprimer modal existant si présent
        const existant = document.getElementById('modal-export-recherche');
        if (existant) existant.remove();

        let contenu = '';

        if (etat === 'loading') {
            contenu = `
                <div class="modal-contenu modal-compact">
                    <h2 class="modal-titre">Export en cours...</h2>
                    <div class="texte-centre">
                        <p>Génération de l'export anonymisé.</p>
                        <p class="texte-muted">Veuillez patienter quelques instants.</p>
                    </div>
                </div>
            `;
        } else if (etat === 'success') {
            contenu = `
                <div class="modal-contenu modal-compact">
                    <button class="modal-fermer" data-action="fermerModalExportRecherche">&times;</button>
                    <h2 class="modal-titre">Export généré avec succès</h2>

                    <div class="alerte alerte-succes">
                        <strong>Deux fichiers ont été téléchargés</strong>
                    </div>

                    <div class="liste-statistiques">
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbEtudiants || 0}</span>
                            <span class="statistique-label">étudiants anonymisés</span>
                        </div>
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbEvaluations || 0}</span>
                            <span class="statistique-label">évaluations</span>
                        </div>
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbPresences || 0}</span>
                            <span class="statistique-label">présences</span>
                        </div>
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbSnapshots || 0}</span>
                            <span class="statistique-label">snapshots</span>
                        </div>
                    </div>

                    <div class="alerte alerte-attention">
                        <strong>Important</strong><br>
                        Conserve la table de correspondance (<code>*_PRIVE_*.json</code>) en lieu sûr.
                        Elle te permettra de retrouver les correspondances DA si nécessaire.
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-principal" data-action="fermerModalExportRecherche">Fermer</button>
                    </div>
                </div>
            `;
        } else if (etat === 'error') {
            contenu = `
                <div class="modal-contenu modal-compact">
                    <button class="modal-fermer" data-action="fermerModalExportRecherche">&times;</button>
                    <h2 class="modal-titre">Erreur lors de l'export</h2>

                    <div class="alerte alerte-erreur">
                        <strong>L'export a échoué</strong><br>
                        ${data.message || 'Une erreur inattendue s\'est produite.'}
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-principal" data-action="fermerModalExportRecherche">Fermer</button>
                    </div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.id = 'modal-export-recherche';
        modal.className = 'modal-overlay actif';
        modal.innerHTML = contenu;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fermerModalExportRecherche();
        });

        document.body.appendChild(modal);
    }

    /**
     * Ferme le modal d'export recherche
     */
    function fermerModalExportRecherche() {
        const modal = document.getElementById('modal-export-recherche');
        if (modal) modal.remove();
    }

    /**
     * Affiche le trimestre qui sera ciblé par l'export anonymisé
     * Basé sur le cours actif (qui contient les données)
     */
    function afficherTrimestreCibleExport() {
        const container = document.getElementById('export-trimestre-info');
        if (!container) return;

        // Déterminer le trimestre du cours actif (comme dans exporterFormatRecherche)
        const cours = db.getSync('listeCours', []);
        const coursActif = cours.find(c => c.actif);
        const trimestres = db.getSync('trimestres', []);

        let trimestre = null;
        let source = '';

        if (coursActif && coursActif.trimestreId) {
            trimestre = trimestres.find(t => t.id === coursActif.trimestreId);
            source = 'cours actif';
        }

        if (!trimestre) {
            trimestre = trimestres.find(t => t.actif);
            source = 'trimestre actif';
        }

        if (!trimestre && trimestres.length > 0) {
            trimestre = trimestres[0];
            source = 'premier trimestre';
        }

        if (trimestre) {
            // Compter les données disponibles
            // ✅ NAMESPACING (Beta 95.5)
            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
            const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
            const nbEtudiants = etudiants.filter(e => !estEtudiantExclu(e)).length;
            const nbEvaluations = evaluations.length;

            container.innerHTML = `
                <span>Trimestre ciblé :</span>
                <strong>${trimestre.nom}</strong>
                <span class="texte-muted">(${nbEtudiants} étudiants, ${nbEvaluations} évaluations)</span>
            `;
        } else {
            container.innerHTML = `
                <span class="texte-muted">Aucun trimestre avec données disponible pour l'export.</span>
            `;
        }
    }

    /* ===============================
       MODE ÉCRITURE TEMPORAIRE
       =============================== */

    /**
     * Bascule le mode écriture temporaire pour les trimestres archivés
     * Permet de faire des corrections ponctuelles (absences, jetons, etc.)
     * @param {boolean} activer - true pour activer le mode correction
     */
    function basculerModeEcritureTemp(activer) {
        if (typeof activer === 'object' && activer !== null) activer = activer.checked;
        if (activer) {
            document.body.classList.add('mode-ecriture-temp');
        } else {
            document.body.classList.remove('mode-ecriture-temp');
        }
    }

    /**
     * Bascule le mode anonymisation depuis le bandeau lecture seule
     * Permet de faire des captures d'écran sans afficher les identités réelles
     * @param {boolean} activer - true pour anonymiser
     */
    async function basculerAnonymisationArchive(activer) {
        if (typeof activer === 'object' && activer !== null) activer = activer.checked;
        if (activer) {
            // Activer le mode anonymisation
            await changerMode('anonymisation');
            // Masquer le bandeau-mode car on a déjà le bandeau archive
            const bandeauMode = document.getElementById('bandeau-mode');
            if (bandeauMode) {
                bandeauMode.classList.add('u-hide');
            }
            // Changer la couleur du bandeau archive pour indiquer l'anonymisation
            const bandeauArchive = document.getElementById('bandeau-archive');
            if (bandeauArchive) {
                bandeauArchive.style.background = 'var(--bleu-fonce)'; // Bleu très foncé (anonymisation)
            }
        } else {
            // Retour au mode normal
            await changerMode('normal');
            // Masquer le bandeau-mode car on a déjà le bandeau archive
            const bandeauMode = document.getElementById('bandeau-mode');
            if (bandeauMode) {
                bandeauMode.classList.add('u-hide');
            }
            // Restaurer la couleur du bandeau archive
            const bandeauArchive = document.getElementById('bandeau-archive');
            if (bandeauArchive) {
                bandeauArchive.style.background = 'var(--bleu-clair, #065dbb)';
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
    window.basculerModeEcritureTemp = basculerModeEcritureTemp;
    window.basculerAnonymisationArchive = basculerAnonymisationArchive;

    // Fonctions d'export recherche
    window.exporterFormatRecherche = exporterFormatRecherche;
    window.genererCleAnonymisation = genererCleAnonymisation;
    window.lancerExportRecherche = lancerExportRecherche;
    window.fermerModalExportRecherche = fermerModalExportRecherche;
    window.afficherTrimestreCibleExport = afficherTrimestreCibleExport;

    // Purge des trimestres orphelins (5.5.4)
    function listerTrimestresOrphelins() {
        const trimestres = obtenirTrimestres();
        const actif = obtenirTrimestreActif();
        const prefixeActif = actif ? actif.id + '_' : null;

        // Scanner toutes les clés localStorage pour détecter les préfixes de trimestre
        const prefixesTrouves = new Map();
        for (let i = 0; i < localStorage.length; i++) {
            const cle = localStorage.key(i);
            const match = cle.match(/^([a-z]\d{4})_/);
            if (match) {
                const prefixe = match[1];
                if (!prefixesTrouves.has(prefixe)) {
                    prefixesTrouves.set(prefixe, { cles: 0, taille: 0 });
                }
                const info = prefixesTrouves.get(prefixe);
                info.cles++;
                info.taille += (localStorage.getItem(cle) || '').length * 2;
            }
        }

        // Identifier les orphelins (pas le trimestre actif, pas 'demo')
        const orphelins = [];
        prefixesTrouves.forEach((info, prefixe) => {
            const estActif = prefixeActif && prefixeActif.startsWith(prefixe);
            const estDemo = prefixe === 'demo';
            const estDansTrimestres = trimestres.some(t => t.id === prefixe);
            if (!estActif && !estDemo) {
                orphelins.push({
                    prefixe,
                    cles: info.cles,
                    tailleMo: (info.taille / 1024 / 1024).toFixed(2),
                    dansTrimestres: estDansTrimestres
                });
            }
        });

        return orphelins;
    }

    function purgerTrimestresOrphelins(prefixes) {
        let clesSupprimees = 0;
        prefixes.forEach(prefixe => {
            const aSupprimer = [];
            for (let i = 0; i < localStorage.length; i++) {
                const cle = localStorage.key(i);
                if (cle.startsWith(prefixe + '_')) {
                    aSupprimer.push(cle);
                }
            }
            aSupprimer.forEach(cle => {
                localStorage.removeItem(cle);
                clesSupprimees++;
            });
        });
        return clesSupprimees;
    }

    window.listerTrimestresOrphelins = listerTrimestresOrphelins;
    window.purgerTrimestresOrphelins = purgerTrimestresOrphelins;

    // Constantes exportées pour debug
    window.CLES_NAMESPACEES = CLES_NAMESPACEES;
    window.CLES_GLOBALES = CLES_GLOBALES;

})();
