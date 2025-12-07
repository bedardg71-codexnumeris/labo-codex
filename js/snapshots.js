/**
 * MODULE SNAPSHOTS - Capture longitudinale progression étudiants (Beta 93)
 *
 * Fonctionnalités :
 * 1. Snapshots hebdomadaires : Portrait complet du groupe chaque semaine
 * 2. Snapshots interventions : Capture avant/après interventions RàI
 * 3. Reconstruction rétroactive : Recalcul des semaines passées
 * 4. Export/Import : Sauvegarde et restauration des snapshots
 *
 * Structure de données :
 * localStorage.snapshots = {
 *   hebdomadaires: [
 *     {
 *       id: "2025-S01",
 *       numSemaine: 1,
 *       dateDebut: "2025-01-06",
 *       dateFin: "2025-01-12",
 *       timestamp: "2025-01-12T23:59:59Z",
 *       etudiants: [
 *         { da: "1234567", A: 85, C: 90, P: 75, E: 0.82, pattern: "Stable", rai: "Niveau 1" }
 *       ],
 *       groupe: {
 *         moyenneA: 82, moyenneC: 88, moyenneP: 71, moyenneE: 0.77,
 *         nbEtudiants: 30, dispersionA: 15.2, dispersionC: 12.5, dispersionP: 18.3
 *       }
 *     }
 *   ],
 *   interventions: [
 *     {
 *       id: "rai-123",
 *       date: "2025-01-15",
 *       type: "niveau2",
 *       titre: "Soutien Structure",
 *       etudiantsDA: ["1234567", "2345678"],
 *       avant: { "1234567": { A: 75, C: 60, P: 65, E: 0.66 } },
 *       apres: null  // Sera rempli 2-3 semaines plus tard
 *     }
 *   ]
 * }
 *
 * @author Grégoire Bédard
 * @date 3 décembre 2025
 * @version 1.0.0
 */

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise le module snapshots au chargement
 */
function initialiserModuleSnapshots() {
    console.log('🔄 Initialisation module snapshots...');

    // Créer structure si première utilisation
    const snapshots = db.getSync('snapshots', null);
    if (!snapshots) {
        const structure = {
            hebdomadaires: [],
            interventions: [],
            metadata: {
                version: '1.0.0',
                dateCreation: new Date().toISOString(),
                dernierSnapshotHebdo: null,
                dernierSnapshotIntervention: null
            }
        };
        db.setSync('snapshots', structure);
        console.log('✅ Structure snapshots créée');
    }

    // Vérifier si nouveau snapshot hebdomadaire nécessaire
    verifierEtCapturerSnapshotHebdomadaire();

    console.log('✅ Module snapshots initialisé');
}

/* ===============================
   CALCUL HISTORIQUE DES INDICES
   =============================== */

// Cache global pour optimiser les performances
let _cacheEvaluations = null;

/**
 * ✨ NOUVEAU (Beta 93) : Calcule les indices A-C-P-E jusqu'à une date limite
 * Permet la reconstruction rétroactive fidèle à l'historique
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} dateLimite - Date limite au format 'YYYY-MM-DD' (incluse)
 * @param {Array} evaluationsCache - Cache optionnel des évaluations (pour performance)
 * @param {boolean} usePonctualA - Si true, utilise assiduité ponctuelle de la séance au lieu de cumulative
 * @returns {Object} - {A: number, C: number, P: number, E: number}
 */
function calculerIndicesHistoriques(da, dateLimite, evaluationsCache = null, usePonctualA = false) {
    // 🐛 DEBUG - Désactivé pour performance (30 snapshots × 30 étudiants = 900 appels)
    // console.log(`[calculerIndicesHistoriques] DA: ${da}, Date: ${dateLimite}, Cache: ${evaluationsCache ? evaluationsCache.length : 'null'}, Ponctuel: ${usePonctualA}`);

    // Assiduité (A) : Ponctuelle (séance uniquement) OU cumulative (depuis le début)
    let indiceA = 100;

    if (usePonctualA && typeof calculerAssiduiteSeance === 'function') {
        // ✨ NOUVEAU (Beta 93) : Assiduité PONCTUELLE pour cette séance uniquement
        const resultA = calculerAssiduiteSeance(da, dateLimite);
        indiceA = Math.round(resultA.indice * 100);
        // console.log(`[calculerIndicesHistoriques] A ponctuel (séance ${dateLimite}): ${indiceA}%`);
    } else if (typeof calculerAssiduiteJusquADate === 'function') {
        // Assiduité CUMULATIVE jusqu'à cette date
        const resultA = calculerAssiduiteJusquADate(da, dateLimite);
        indiceA = Math.round(resultA.indice * 100);
        // console.log(`[calculerIndicesHistoriques] A cumulatif (jusqu'à ${dateLimite}): ${indiceA}%`);
    }

    // Complétion (C) et Performance (P) : Filtrer les évaluations jusqu'à dateLimite
    let indiceC = 100;

    // ⚡ OPTIMISATION : Utiliser le cache si fourni
    // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
    const evaluations = evaluationsCache || obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    // ✅ CORRECTION (7 déc 2025): Propriété correcte 'etudiantDA' au lieu de 'da'
    const evaluationsEtudiant = evaluations.filter(e => e.etudiantDA === da);
    // console.log(`[DEBUG] DA=${da}, evaluations=${evaluations.length}, pour cet étud=${evaluationsEtudiant.length}`);

    // Filtrer seulement les évaluations JUSQU'À la date limite
    const evaluationsFiltrees = evaluationsEtudiant.filter(e => {
        if (!e.dateEvaluation) return false;
        return e.dateEvaluation <= dateLimite;
    });

    // Calculer C : Proportion de PRODUCTIONS remises (pas évaluations)
    // ✅ CORRECTION (7 déc 2025) : Aligner avec pratique-sommative.js
    // Compter PRODUCTIONS, pas ÉVALUATIONS (évite double comptage avec reprises)

    // Lire les productions
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer évaluations jusqu'à la date limite
    const evaluationsFiltrees = evaluations.filter(e => {
        if (!e.dateEvaluation) return false;
        return e.dateEvaluation <= dateLimite;
    });

    // 1. Identifier les productions QUI ONT ÉTÉ ÉVALUÉES jusqu'à cette date
    const productionsEvaluees = productions.filter(production => {
        // Exclure les productions facultatives
        if (production.facultatif) return false;

        // Vérifier qu'au moins une évaluation existe pour cette production jusqu'à dateLimite
        return evaluationsFiltrees.some(e =>
            e.productionId === production.id &&
            !e.remplaceeParId &&
            e.noteFinale !== null
        );
    });

    if (productionsEvaluees.length === 0) {
        // ✅ CORRECTION (Beta 93) : null au lieu de 100% quand aucune production évaluée
        indiceC = null;
    } else {
        // 2. Compter combien CET ÉTUDIANT a remis parmi les productions évaluées
        const productionsRemises = productionsEvaluees.filter(production => {
            return evaluationsFiltrees.some(e =>
                e.etudiantDA === da &&
                e.productionId === production.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        indiceC = Math.round((productionsRemises.length / productionsEvaluees.length) * 100);
    }

    // Calculer P : Déléguer à la pratique de notation configurée
    // ✅ CORRECTION (Beta 93) : Respect de l'architecture modulaire
    let indiceP = null;

    if (typeof obtenirPratiqueActuelle === 'function') {
        try {
            const pratique = obtenirPratiqueActuelle();
            if (pratique && typeof pratique.calculerPerformanceHistorique === 'function') {
                // Déléguer le calcul historique à la pratique
                const indiceP_decimal = pratique.calculerPerformanceHistorique(da, dateLimite, evaluations);
                // Convertir de 0-1 vers 0-100 (arrondi)
                if (indiceP_decimal !== null) {
                    indiceP = Math.round(indiceP_decimal * 100);
                }
            }

            // ✅ CORRECTION (7 déc): Fallback si méthode manquante OU retourne null
            if (indiceP === null) {
                // ⚡ FALLBACK: Si méthode manquante, calculer moyenne simple des évaluations
                // (désactivation warning pour éviter 870 logs: 29 snapshots × 30 étudiants)
                // console.warn('[calculerIndicesHistoriques] Pratique ou méthode calculerPerformanceHistorique() manquante');

                // Calcul fallback simple: moyenne de toutes les évaluations jusqu'à cette date
                if (evaluationsFiltrees.length > 0) {
                    const notesValides = evaluationsFiltrees
                        .filter(e => e.niveauFinal !== null && e.niveauFinal !== undefined && e.niveauFinal !== '--')
                        .map(e => {
                            // ✅ CORRECTION (7 déc): Gérer échelle IDME (lettres) et nombres
                            const niveau = String(e.niveauFinal).trim().toUpperCase();

                            // Si c'est une lettre IDME, utiliser valeurs configurées
                            // (40% pour I, 65% pour D, 75% pour M, 100% pour E selon l'échelle utilisateur)
                            if (niveau === '0') return 0;       // Aucun/Plagiat
                            if (niveau === 'I') return 40;      // Insuffisant
                            if (niveau === 'D') return 65;      // Développement
                            if (niveau === 'M') return 75;      // Maîtrisé
                            if (niveau === 'E') return 100;     // Étendu

                            // Sinon, nombre: convertir 0-4 → 0-100, ou garder si déjà 0-100
                            const note = parseFloat(e.niveauFinal);
                            if (isNaN(note)) return null;
                            return note <= 4 ? (note / 4) * 100 : note;
                        })
                        .filter(note => note !== null && !isNaN(note));

                    if (notesValides.length > 0) {
                        const somme = notesValides.reduce((acc, val) => acc + val, 0);
                        indiceP = Math.round(somme / notesValides.length);
                    }
                }
            }
        } catch (error) {
            // console.error('[calculerIndicesHistoriques] Erreur lors du calcul de P:', error);
            indiceP = null;
        }
    } else {
        // console.warn('[calculerIndicesHistoriques] obtenirPratiqueActuelle() non disponible');

        // Même fallback si fonction pas disponible
        if (evaluationsFiltrees.length > 0) {
            const notesValides = evaluationsFiltrees
                .filter(e => e.niveauFinal !== null && e.niveauFinal !== undefined && e.niveauFinal !== '--')
                .map(e => {
                    // ✅ CORRECTION (7 déc): Gérer échelle IDME (lettres) et nombres
                    const niveau = String(e.niveauFinal).trim().toUpperCase();

                    // Si c'est une lettre IDME, utiliser valeurs configurées
                    if (niveau === '0') return 0;       // Aucun/Plagiat
                    if (niveau === 'I') return 40;      // Insuffisant
                    if (niveau === 'D') return 65;      // Développement
                    if (niveau === 'M') return 75;      // Maîtrisé
                    if (niveau === 'E') return 100;     // Étendu

                    // Sinon, nombre: convertir 0-4 → 0-100, ou garder si déjà 0-100
                    const note = parseFloat(e.niveauFinal);
                    if (isNaN(note)) return null;
                    return note <= 4 ? (note / 4) * 100 : note;
                })
                .filter(note => note !== null && !isNaN(note));

            if (notesValides.length > 0) {
                const somme = notesValides.reduce((acc, val) => acc + val, 0);
                indiceP = Math.round(somme / notesValides.length);
            }
        }
    }

    // Engagement (E) : Moyenne géométrique de A, C, P
    // ✅ CORRECTION (Beta 93) : Si C ou P sont null, E est aussi null
    let indiceE;
    if (indiceC === null || indiceP === null) {
        indiceE = null;
    } else {
        const A_decimal = indiceA / 100;
        const C_decimal = indiceC / 100;
        const P_decimal = indiceP / 100;
        const E_brut = A_decimal * C_decimal * P_decimal;
        const E = Math.pow(E_brut, 1/3); // Racine cubique
        indiceE = parseFloat(E.toFixed(3));
    }

    const resultat = {
        A: indiceA,
        C: indiceC,
        P: indiceP,
        E: indiceE
    };

    // 🐛 DEBUG - Désactivé pour performance
    // console.log(`[calculerIndicesHistoriques] RETOUR: A=${resultat.A}, C=${resultat.C}, P=${resultat.P}, E=${resultat.E}`);

    return resultat;
}

/* ===============================
   SNAPSHOTS HEBDOMADAIRES
   =============================== */

/**
 * Vérifie si un nouveau snapshot hebdomadaire est nécessaire
 * Appelé automatiquement au chargement de l'application
 */
async function verifierEtCapturerSnapshotHebdomadaire() {
    const snapshots = db.getSync('snapshots', null);
    if (!snapshots) return;

    const calendrier = obtenirCalendrierComplet();
    if (!calendrier) return;

    const aujourdhui = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Trouver la semaine actuelle
    const jourActuel = calendrier[aujourdhui];
    if (!jourActuel || !jourActuel.numeroSemaine) return;

    const numSemaineActuelle = jourActuel.numeroSemaine;

    // Vérifier si snapshot déjà capturé pour cette semaine
    const snapshotExiste = snapshots.hebdomadaires.some(s => s.numSemaine === numSemaineActuelle);

    if (!snapshotExiste) {
        console.log(`📸 Capture snapshot hebdomadaire semaine ${numSemaineActuelle}...`);
        await capturerSnapshotHebdomadaire(numSemaineActuelle);
    }
}

/**
 * ✨ REFONTE (Beta 93) : Capture un snapshot pour UNE séance spécifique
 * @param {string} dateSeance - Date de la séance au format 'YYYY-MM-DD'
 * @param {Array} evaluationsCacheParam - Cache optionnel des évaluations (pour éviter QuotaExceededError)
 * @returns {Object|null} - Snapshot créé ou null si erreur
 */
async function capturerSnapshotSeance(dateSeance, evaluationsCacheParam = null) {
    try {
        // Vérifier que la date est valide
        const calendrier = obtenirCalendrierComplet();
        const infoJour = calendrier[dateSeance];

        if (!infoJour || (infoJour.statut !== 'cours' && infoJour.statut !== 'reprise')) {
            console.warn(`⚠️ Date ${dateSeance} n'est pas un jour de cours`);
            return null;
        }

        const numeroSemaine = infoJour.numeroSemaine;

        console.log(`📸 Capture snapshot pour séance du ${dateSeance} (semaine ${numeroSemaine})`);

        // Calculer indices pour chaque étudiant
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const snapshotsEtudiants = [];

        // ✅ Compteurs séparés pour gérer les valeurs null
        let sommeA_ponctuel = 0, sommeC_cumul = 0, sommeP_cumul = 0, sommeE = 0;
        let nbAvecC = 0, nbAvecP = 0, nbAvecE = 0;
        const valeursA = [], valeursC = [], valeursP = [];

        // ⚡ Charger depuis IndexedDB par défaut (évite QuotaExceededError localStorage)
        let evaluationsCache = evaluationsCacheParam;

        if (!evaluationsCache) {
            try {
                console.log('⚡ Chargement évaluations depuis IndexedDB...');
                // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
                evaluationsCache = await db.get('evaluationsSauvegardees');
                console.log(`✓ ${evaluationsCache ? evaluationsCache.length : 0} évaluations chargées depuis IndexedDB`);
            } catch (e) {
                console.warn('Impossible de charger depuis IndexedDB:', e.message);
                evaluationsCache = [];
            }
        }

        etudiants.forEach(etudiant => {
            const da = etudiant.da;

            // ✨ NOUVEAU (Beta 93) : A ponctuel, C et P cumulatifs
            // usePonctualA = true pour obtenir l'assiduité de CETTE séance uniquement
            const indices = calculerIndicesHistoriques(da, dateSeance, evaluationsCache, true);

            // ⚡ OPTIMISATION PERFORMANCE: Désactivé pendant reconstruction
            // Patterns et RàI génèrent beaucoup de logs console (× 900 étudiants = saturation Safari)
            // Ces valeurs peuvent être recalculées à la volée lors de la consultation d'un profil
            // Si besoin de ces données dans les snapshots, réactiver après avoir désactivé les logs
            let pattern = 'Non calculé';
            let rai = 'Non calculé';

            /* DÉSACTIVÉ TEMPORAIREMENT POUR PERFORMANCE
            if (typeof obtenirPratiqueActuelle === 'function') {
                const pratique = obtenirPratiqueActuelle();
                if (typeof calculerDirectionsCriteres === 'function') {
                    const directions = calculerDirectionsCriteres(da, pratique);
                    // Déterminer pattern majoritaire
                    const symboles = Object.values(directions).map(d => d.symbole);
                    const nbAmelioration = symboles.filter(s => s === '→').length;
                    const nbBaisse = symboles.filter(s => s === '←').length;
                    if (nbAmelioration > nbBaisse) pattern = 'Progression';
                    else if (nbBaisse > nbAmelioration) pattern = 'Régression';
                    else pattern = 'Stable';
                }
            }

            // Déterminer niveau RàI
            if (typeof determinerNiveauRaiPedagogique === 'function') {
                const niveauRaiObj = determinerNiveauRaiPedagogique(da);
                rai = niveauRaiObj.niveau || 'Niveau 1';
            }
            */

            snapshotsEtudiants.push({
                da: da,
                nom: `${etudiant.prenom} ${etudiant.nom}`,
                A: indices.A, // ✨ A ponctuel (cette séance uniquement)
                C: indices.C, // C cumulatif
                P: indices.P, // P cumulatif
                E: indices.E, // E calculé avec A ponctuel × C cumul × P cumul
                pattern: pattern,
                rai: rai
            });

            // Accumuler pour moyennes (gérer null)
            sommeA_ponctuel += indices.A;

            // C, P et E peuvent être null si aucune évaluation
            if (indices.C !== null) {
                sommeC_cumul += indices.C;
                nbAvecC++;
            }
            if (indices.P !== null) {
                sommeP_cumul += indices.P;
                nbAvecP++;
            }
            if (indices.E !== null) {
                sommeE += indices.E;
                nbAvecE++;
            }

            valeursA.push(indices.A);
            if (indices.C !== null) {
                valeursC.push(indices.C);
            }
            if (indices.P !== null) {
                valeursP.push(indices.P);
            }
        });

        const nbEtudiants = etudiants.length;

        // Calculer statistiques groupe (gérer null)
        const groupe = {
            moyenneA: Math.round(sommeA_ponctuel / nbEtudiants), // Moyenne A ponctuel
            moyenneC: nbAvecC > 0 ? Math.round(sommeC_cumul / nbAvecC) : null,
            moyenneP: nbAvecP > 0 ? Math.round(sommeP_cumul / nbAvecP) : null,
            moyenneE: nbAvecE > 0 ? parseFloat((sommeE / nbAvecE).toFixed(2)) : null,
            nbEtudiants: nbEtudiants,
            dispersionA: calculerEcartType(valeursA),
            dispersionC: valeursC.length > 0 ? calculerEcartType(valeursC) : null,
            dispersionP: valeursP.length > 0 ? calculerEcartType(valeursP) : null
        };

        // Créer snapshot (ID basé sur la date de la séance)
        // ✨ CORRECTION (7 déc 2025): Ajouter propriétés pour compatibilité avec graphiques
        const snapshot = {
            id: `SEANCE-${dateSeance}`,
            dateSeance: dateSeance,
            numeroSemaine: numeroSemaine, // Conservé pour référence (horaire.js)
            numSemaine: numeroSemaine,    // ✨ Pour compatibilité graphiques
            dateDebut: dateSeance,         // ✨ Pour compatibilité obtenirSnapshotsEtudiant()
            dateFin: dateSeance,           // ✨ Pour compatibilité obtenirSnapshotsEtudiant()
            timestamp: new Date().toISOString(),
            etudiants: snapshotsEtudiants,
            groupe: groupe
        };

        // ⚡ SAUVEGARDE DANS INDEXEDDB (pas localStorage - trop grand!)
        // Lire depuis IndexedDB (async)
        let snapshots = await db.get('snapshots');

        // Initialiser structure si première utilisation
        if (!snapshots) {
            snapshots = {
                hebdomadaires: [],
                interventions: [],
                metadata: {
                    version: '1.0.0',
                    dateCreation: new Date().toISOString(),
                    dernierSnapshotHebdo: null,
                    dernierSnapshotIntervention: null
                }
            };
        }

        // Vérifier que la structure metadata existe (compatibilité anciennes versions)
        if (!snapshots.metadata) {
            snapshots.metadata = {
                version: '1.0.0',
                dateCreation: new Date().toISOString(),
                dernierSnapshotHebdo: null,
                dernierSnapshotIntervention: null
            };
        }

        snapshots.hebdomadaires.push(snapshot);
        snapshots.metadata.dernierSnapshotHebdo = snapshot.timestamp;

        // ⚡ Sauvegarder dans IndexedDB (plusieurs GB disponibles)
        await db.set('snapshots', snapshots);

        console.log(`✅ Snapshot séance ${dateSeance} capturé (${nbEtudiants} étudiants)`);
        return snapshot;

    } catch (error) {
        console.error('❌ Erreur capture snapshot séance:', error);
        return null;
    }
}

/**
 * [LEGACY] Capture un snapshot hebdomadaire pour une semaine donnée
 * ⚠️ OBSOLÈTE : Utilisez capturerSnapshotSeance() à la place
 * Conservé pour compatibilité avec ancien code
 */
async function capturerSnapshotHebdomadaire(numSemaine, evaluationsCacheParam = null) {
    console.warn('⚠️ capturerSnapshotHebdomadaire() est obsolète. Utilisez capturerSnapshotSeance().');

    // Trouver les dates de cette semaine
    const calendrier = obtenirCalendrierComplet();
    const datesSemaine = Object.keys(calendrier).filter(date => {
        const jour = calendrier[date];
        return jour.numeroSemaine === numSemaine && jour.statut === 'cours';
    }).sort();

    if (datesSemaine.length === 0) return null;

    // Capturer un snapshot pour chaque date de cours de cette semaine
    const snapshots = [];
    for (const date of datesSemaine) {
        const snapshot = await capturerSnapshotSeance(date, evaluationsCacheParam);
        if (snapshot) snapshots.push(snapshot);
    }

    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

/**
 * Calcule l'écart-type d'un tableau de valeurs
 * @param {number[]} valeurs - Tableau de valeurs
 * @returns {number} - Écart-type arrondi à 1 décimale
 */
function calculerEcartType(valeurs) {
    if (valeurs.length === 0) return 0;
    const moyenne = valeurs.reduce((sum, v) => sum + v, 0) / valeurs.length;
    const variance = valeurs.reduce((sum, v) => sum + Math.pow(v - moyenne, 2), 0) / valeurs.length;
    return parseFloat(Math.sqrt(variance).toFixed(1));
}

/* ===============================
   SNAPSHOTS INTERVENTIONS
   =============================== */

/**
 * Capture un snapshot "avant intervention" pour un groupe d'étudiants
 * Appelé lors de la planification d'une intervention RàI
 *
 * @param {string} interventionId - ID de l'intervention
 * @param {string[]} etudiantsDA - Liste des DA des étudiants concernés
 * @param {string} type - Type d'intervention (niveau1/niveau2/niveau3)
 * @param {string} titre - Titre de l'intervention
 * @returns {Object|null} - Snapshot créé ou null si erreur
 */
function capturerSnapshotIntervention(interventionId, etudiantsDA, type, titre) {
    try {
        const avant = {};

        etudiantsDA.forEach(da => {
            const indices = calculerTousLesIndices(da);
            avant[da] = {
                A: indices.A,
                C: indices.C,
                P: indices.P,
                E: parseFloat(indices.E)
            };
        });

        const snapshotIntervention = {
            id: interventionId,
            date: new Date().toISOString().split('T')[0],
            type: type,
            titre: titre || 'Intervention RàI',
            etudiantsDA: etudiantsDA,
            avant: avant,
            apres: null
        };

        // Sauvegarder
        const snapshots = db.getSync('snapshots');
        snapshots.interventions.push(snapshotIntervention);
        snapshots.metadata.dernierSnapshotIntervention = snapshotIntervention.date;
        db.setSync('snapshots', snapshots);

        console.log(`✅ Snapshot intervention "${titre}" capturé (avant) - ${etudiantsDA.length} étudiants`);
        return snapshotIntervention;

    } catch (error) {
        console.error('❌ Erreur capture snapshot intervention:', error);
        return null;
    }
}

/**
 * Met à jour un snapshot intervention avec les données "après"
 * Appelé 2-3 semaines après l'intervention (manuel ou automatique)
 *
 * @param {string} interventionId - ID de l'intervention
 * @returns {boolean} - true si succès, false sinon
 */
function mettreAJourSnapshotIntervention(interventionId) {
    try {
        const snapshots = db.getSync('snapshots');
        const snapshotIntervention = snapshots.interventions.find(s => s.id === interventionId);

        if (!snapshotIntervention) {
            console.warn(`⚠️ Snapshot intervention ${interventionId} introuvable`);
            return false;
        }

        if (snapshotIntervention.apres !== null) {
            console.warn(`⚠️ Snapshot intervention ${interventionId} déjà complété`);
            return false;
        }

        const apres = {};

        snapshotIntervention.etudiantsDA.forEach(da => {
            const indices = calculerTousLesIndices(da);
            apres[da] = {
                A: indices.A,
                C: indices.C,
                P: indices.P,
                E: parseFloat(indices.E)
            };
        });

        snapshotIntervention.apres = apres;
        snapshotIntervention.dateApres = new Date().toISOString().split('T')[0];

        db.setSync('snapshots', snapshots);

        console.log(`✅ Snapshot intervention "${snapshotIntervention.titre}" mis à jour (après)`);
        return true;

    } catch (error) {
        console.error('❌ Erreur mise à jour snapshot intervention:', error);
        return false;
    }
}

/* ===============================
   RECONSTRUCTION RÉTROACTIVE
   =============================== */

/**
 * ✨ REFONTE (Beta 93) : Reconstruit tous les snapshots PAR SÉANCE depuis le début du trimestre
 * ATTENTION : Opération coûteuse, à n'exécuter qu'une seule fois au début
 *
 * @returns {Object} - { succes: boolean, nbSnapshots: number, message: string }
 */
async function reconstruireSnapshotsHistoriques() {
    console.log('🔄 Début reconstruction snapshots historiques (PAR SÉANCE)...');

    try {
        // ⚡ Charger les évaluations depuis IndexedDB (évite QuotaExceededError)
        console.log('⚡ Chargement évaluations depuis IndexedDB...');
        // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
        const evaluationsCache = await db.get('evaluationsSauvegardees');
        console.log(`✓ ${evaluationsCache ? evaluationsCache.length : 0} évaluations chargées`);

        // ✨ CORRECTION (7 déc 2025): Utiliser seancesCompletes au lieu du calendrier brut
        // seancesCompletes contient SEULEMENT les dates où le groupe a effectivement cours
        // (ex: 2 séances/semaine × 15 semaines = ~30 snapshots au lieu de ~75)
        const seancesCompletes = obtenirSeancesCompletes();
        if (!seancesCompletes || Object.keys(seancesCompletes).length === 0) {
            console.error('❌ Aucune séance configurée dans l\'horaire');
            return {
                succes: false,
                nbSnapshots: 0,
                message: 'Aucune séance configurée. Configurez d\'abord l\'horaire du groupe dans Réglages → Horaire.'
            };
        }

        // ✨ CORRECTIF CRITIQUE (7 déc 2025): Filtrer SEULEMENT les dates avec séances configurées
        // seancesCompletes contient aussi des dates VIDES (tableaux vides []) pour tous les jours
        // de cours du calendrier. On ne veut PAS créer de snapshots pour ces jours vides.
        // Avant: 75 dates (tous les jours de cours) → Après: ~30 dates (seulement jours avec séances)
        const datesCours = Object.keys(seancesCompletes)
            .filter(date => seancesCompletes[date] && seancesCompletes[date].length > 0)
            .sort();

        // ✨ Charger les étudiants pour estimation précise (universel, pas codé en dur)
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const nbEtudiants = etudiants.length;

        console.log(`✓ Séances du groupe détectées: ${datesCours.length}`);
        if (datesCours.length > 0) {
            console.log(`  Première séance: ${datesCours[0]}`);
            console.log(`  Dernière séance: ${datesCours[datesCours.length - 1]}`);
            console.log(`  📊 Estimation: ${datesCours.length} snapshots × ${nbEtudiants} étudiants × ~2 KB = ~${Math.round(datesCours.length * nbEtudiants * 2 / 1024)} MB`);
        }

        // Effacer snapshots existants (reconstruction complète)
        // ⚡ Utiliser IndexedDB (pas localStorage - trop grand!)
        await db.set('snapshots', {
            hebdomadaires: [],
            interventions: [],
            metadata: {
                version: '1.0.0',
                dateCreation: new Date().toISOString(),
                dernierSnapshotHebdo: null,
                dernierSnapshotIntervention: null
            }
        });
        console.log('✓ Snapshots existants effacés (IndexedDB)');

        // ✨ NOUVEAU : Capturer snapshot pour CHAQUE SÉANCE
        let nbSnapshots = 0;
        let nbEchecs = 0;
        const nbSeancesTotal = datesCours.length;

        for (let index = 0; index < datesCours.length; index++) {
            const dateSeance = datesCours[index];
            const progression = Math.round(((index + 1) / nbSeancesTotal) * 100);
            console.log(`📸 [${index + 1}/${nbSeancesTotal}] Séance ${dateSeance} (${progression}%)...`);

            // Capturer snapshot pour cette séance
            const snapshot = await capturerSnapshotSeance(dateSeance, evaluationsCache);
            if (snapshot) {
                nbSnapshots++;
                console.log(`  ✅ Séance ${dateSeance} capturée (${snapshot.etudiants.length} étudiants)`);
            } else {
                nbEchecs++;
                console.warn(`  ⚠️ Séance ${dateSeance} échec`);
            }
        }

        console.log(`✅ Reconstruction terminée : ${nbSnapshots} captures par séance créées, ${nbEchecs} échecs`);
        return {
            succes: true,
            nbSnapshots: nbSnapshots,
            message: `${nbSnapshots} captures par séance reconstruites avec succès${nbEchecs > 0 ? ` (${nbEchecs} échecs)` : ''}`
        };

    } catch (error) {
        console.error('❌ Erreur reconstruction snapshots:', error);
        return {
            succes: false,
            nbSnapshots: 0,
            message: `Erreur: ${error.message}`
        };
    }
}

/* ===============================
   EXPORT / IMPORT
   =============================== */

/**
 * Exporte tous les snapshots en JSON
 * @returns {string} - JSON des snapshots
 */
function exporterSnapshots() {
    const snapshots = db.getSync('snapshots');
    return JSON.stringify(snapshots, null, 2);
}

/**
 * Importe des snapshots depuis JSON
 * @param {string} json - JSON des snapshots
 * @returns {boolean} - true si succès
 */
function importerSnapshots(json) {
    try {
        const snapshots = JSON.parse(json);
        db.setSync('snapshots', snapshots);
        console.log('✅ Snapshots importés avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur import snapshots:', error);
        return false;
    }
}

/* ===============================
   GETTERS / UTILITAIRES
   =============================== */

/**
 * Obtient tous les snapshots hebdomadaires
 * @returns {Array} - Liste des snapshots
 */
function obtenirSnapshotsHebdomadaires() {
    const snapshots = db.getSync('snapshots', { hebdomadaires: [] });
    return snapshots.hebdomadaires || [];
}

/**
 * Obtient tous les snapshots d'un étudiant
 * @param {string} da - Numéro DA
 * @returns {Array} - Liste des snapshots pour cet étudiant
 */
function obtenirSnapshotsEtudiant(da) {
    const snapshots = obtenirSnapshotsHebdomadaires();
    return snapshots
        .map(s => {
            const etudiant = s.etudiants.find(e => e.da === da);
            if (!etudiant) return null;
            return {
                numSemaine: s.numSemaine,
                dateDebut: s.dateDebut,
                dateFin: s.dateFin,
                ...etudiant
            };
        })
        .filter(s => s !== null)
        .sort((a, b) => a.numSemaine - b.numSemaine);
}

/**
 * Obtient tous les snapshots d'interventions
 * @returns {Array} - Liste des snapshots interventions
 */
function obtenirSnapshotsInterventions() {
    const snapshots = db.getSync('snapshots', { interventions: [] });
    return snapshots.interventions || [];
}

/* ===============================
   FONCTIONS UI (Réglages → Snapshots)
   =============================== */

/**
 * Affiche les statistiques des captures dans l'interface Réglages
 */
function afficherStatutSnapshots() {
    const snapshots = db.getSync('snapshots', { hebdomadaires: [], interventions: [] });

    const nbHebdo = snapshots.hebdomadaires?.length || 0;
    const nbInterventions = snapshots.interventions?.length || 0;

    // Trouver la dernière capture
    let derniereCapture = '—';
    if (nbHebdo > 0) {
        const dernier = snapshots.hebdomadaires[snapshots.hebdomadaires.length - 1];
        derniereCapture = dernier.id || '—';
    }

    // Mettre à jour les cartes métriques
    const elemHebdo = document.getElementById('stat-snapshots-hebdo');
    const elemInterventions = document.getElementById('stat-snapshots-interventions');
    const elemDerniere = document.getElementById('stat-derniere-capture');

    if (elemHebdo) elemHebdo.textContent = nbHebdo;
    if (elemInterventions) elemInterventions.textContent = nbInterventions;
    if (elemDerniere) elemDerniere.textContent = derniereCapture;

    // Message de statut
    const elemStatus = document.getElementById('info-snapshots-status');
    if (elemStatus) {
        if (nbHebdo === 0 && nbInterventions === 0) {
            elemStatus.innerHTML = `
                <p style="color: #ff9800;">
                    ⚠️ Aucune capture disponible. Utilisez la reconstruction rétroactive pour créer des captures historiques,
                    ou attendez la prochaine capture hebdomadaire automatique.
                </p>
            `;
        } else {
            elemStatus.innerHTML = `
                <p style="color: #4caf50;">
                    ✅ Le système de captures est actif. ${nbHebdo} capture(s) hebdomadaire(s) et ${nbInterventions} capture(s) d'intervention(s) enregistrées.
                </p>
            `;
        }
    }
}

/**
 * Capture manuelle (déclenchée par bouton UI)
 */
async function capturerSnapshotManuel() {
    try {
        const semaine = obtenirNumeroSemaineActuelle();
        if (!semaine) {
            alert('Impossible de déterminer la semaine actuelle. Vérifiez la configuration du trimestre.');
            return;
        }

        await capturerSnapshotHebdomadaire(semaine);

        alert(`Capture manuelle réussie pour la semaine ${semaine}!`);
        afficherStatutSnapshots();
    } catch (error) {
        console.error('Erreur lors de la capture manuelle:', error);
        alert('Erreur lors de la capture: ' + error.message);
    }
}

/**
 * Lance la reconstruction rétroactive (déclenchée par bouton UI)
 */
async function lancerReconstructionRetroactive() {
    if (!confirm('Cette action va recalculer toutes les captures hebdomadaires depuis le début du trimestre. Continuer?')) {
        return;
    }

    try {
        console.log('🔄 Lancement de la reconstruction rétroactive...');
        // ⚡ NOUVEAU : Appel asynchrone (charge depuis IndexedDB)
        const resultats = await reconstruireSnapshotsHistoriques();

        if (resultats.succes) {
            alert(`Reconstruction terminée!\n\n` +
                  `${resultats.nbSnapshots} captures reconstruites avec succès\n\n` +
                  `${resultats.message}`);
        } else {
            alert(`Erreur lors de la reconstruction:\n\n${resultats.message}`);
        }

        afficherStatutSnapshots();
    } catch (error) {
        console.error('Erreur lors de la reconstruction:', error);
        alert('Erreur lors de la reconstruction: ' + error.message);
    }
}

/**
 * Confirme et supprime toutes les captures
 */
function confirmerNettoyageSnapshots() {
    const confirmation1 = confirm(
        '⚠️ ATTENTION ⚠️\n\n' +
        'Cette action va supprimer TOUTES les captures enregistrées (hebdomadaires et interventions).\n\n' +
        'Les graphiques de progression seront vides après cette opération.\n\n' +
        'Cette action est IRRÉVERSIBLE.\n\n' +
        'Voulez-vous vraiment continuer?'
    );

    if (!confirmation1) return;

    const confirmation2 = confirm(
        'Confirmation finale\n\n' +
        'Êtes-vous absolument certain de vouloir supprimer toutes les captures?\n\n' +
        'Cliquez sur OK pour confirmer la suppression.'
    );

    if (!confirmation2) return;

    try {
        // Supprimer toutes les données
        db.setSync('snapshots', { hebdomadaires: [], interventions: [] });

        alert('✅ Toutes les captures ont été supprimées.');
        afficherStatutSnapshots();
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
        alert('Erreur lors de la suppression: ' + error.message);
    }
}

/**
 * Fonction utilitaire pour obtenir le numéro de semaine actuelle
 */
function obtenirNumeroSemaineActuelle() {
    const calendrier = db.getSync('calendrierComplet', {});
    if (!calendrier || Object.keys(calendrier).length === 0) {
        return null;
    }

    // Chercher le jour le plus récent
    const aujourdhui = new Date().toISOString().split('T')[0];
    const jours = Object.keys(calendrier).sort();

    // Trouver le jour le plus proche
    let jourLePlusProche = jours[0];
    for (const jour of jours) {
        if (jour <= aujourdhui) {
            jourLePlusProche = jour;
        } else {
            break;
        }
    }

    const infoJour = calendrier[jourLePlusProche];
    return infoJour?.numeroSemaine || 1;
}

/* ===============================
   EXPORTS
   =============================== */

// Exporter les fonctions pour utilisation globale
window.initialiserModuleSnapshots = initialiserModuleSnapshots;
window.verifierEtCapturerSnapshotHebdomadaire = verifierEtCapturerSnapshotHebdomadaire;
window.capturerSnapshotHebdomadaire = capturerSnapshotHebdomadaire;
window.capturerSnapshotIntervention = capturerSnapshotIntervention;
window.mettreAJourSnapshotIntervention = mettreAJourSnapshotIntervention;
window.reconstruireSnapshotsHistoriques = reconstruireSnapshotsHistoriques;
window.exporterSnapshots = exporterSnapshots;
window.importerSnapshots = importerSnapshots;
window.obtenirSnapshotsHebdomadaires = obtenirSnapshotsHebdomadaires;
window.obtenirSnapshotsEtudiant = obtenirSnapshotsEtudiant;
window.obtenirSnapshotsInterventions = obtenirSnapshotsInterventions;
window.calculerIndicesHistoriques = calculerIndicesHistoriques; // Export pour tests

// Fonctions UI
window.afficherStatutSnapshots = afficherStatutSnapshots;
window.capturerSnapshotManuel = capturerSnapshotManuel;
window.lancerReconstructionRetroactive = lancerReconstructionRetroactive;
window.confirmerNettoyageSnapshots = confirmerNettoyageSnapshots;

console.log('📦 Module snapshots.js chargé');
